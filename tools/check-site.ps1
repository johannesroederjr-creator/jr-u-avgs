<#
  check-site.ps1
  --------------------------------------------------------------
  Prueft die statische Website auf typische Fehlerquellen:
    - tote interne Links und fehlende Dateien
    - Anker (#abschnitt), die auf keine ID zeigen
    - Icon-Referenzen ohne passendes <symbol>
    - ungueltiges JSON-LD
    - fehlende oder doppelte <h1>, fehlende alt-Attribute
    - Meta-Tags (title, description, canonical)

  Aufruf im Projektordner:
      powershell -ExecutionPolicy Bypass -File tools\check-site.ps1
  --------------------------------------------------------------
#>

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$problems = New-Object System.Collections.Generic.List[string]
function Add-Problem($msg) { $script:problems.Add($msg) }

$pages = Get-ChildItem -Path $root -Recurse -Filter '*.html' |
         Where-Object { $_.FullName -notmatch '\\tools\\' }

# IDs pro Datei einsammeln, damit seitenuebergreifende Anker geprueft werden koennen
$idsByFile = @{}
foreach ($page in $pages) {
  $html = [System.IO.File]::ReadAllText($page.FullName, [System.Text.Encoding]::UTF8)
  $ids = [regex]::Matches($html, '\sid="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  $idsByFile[$page.FullName] = @($ids)
}

foreach ($page in $pages) {
  $rel  = $page.FullName.Substring($root.Length + 1)
  $html = [System.IO.File]::ReadAllText($page.FullName, [System.Text.Encoding]::UTF8)
  $dir  = $page.DirectoryName

  # --- Kopfbereich -------------------------------------------
  if ($html -notmatch '<html lang="de">')          { Add-Problem "$rel : lang=de fehlt" }
  if ($html -notmatch '<meta charset="utf-8">')    { Add-Problem "$rel : charset fehlt" }
  if ($html -notmatch '<title>[^<]+</title>')      { Add-Problem "$rel : <title> fehlt" }
  if ($html -notmatch 'name="description"')        { Add-Problem "$rel : meta description fehlt" }
  if ($rel -ne '404.html' -and $html -notmatch 'rel="canonical"') {
    Add-Problem "$rel : canonical fehlt"
  }

  $titleMatch = [regex]::Match($html, '<title>([^<]+)</title>')
  if ($titleMatch.Success) {
    $len = $titleMatch.Groups[1].Value.Length
    if ($len -gt 65) { Add-Problem "$rel : title ist $len Zeichen lang (Richtwert bis 60)" }
  }

  $descMatch = [regex]::Match($html, 'name="description" content="([^"]*)"')
  if ($descMatch.Success) {
    $len = $descMatch.Groups[1].Value.Length
    if ($len -gt 170) { Add-Problem "$rel : description ist $len Zeichen lang (Richtwert bis 160)" }
  }

  # --- Ueberschriften ----------------------------------------
  $h1Count = ([regex]::Matches($html, '<h1[\s>]')).Count
  if ($h1Count -ne 1) { Add-Problem "$rel : $h1Count mal <h1> (genau eine erwartet)" }

  # --- Bilder ohne alt ---------------------------------------
  foreach ($img in [regex]::Matches($html, '<img\b[^>]*>')) {
    if ($img.Value -notmatch '\salt=') {
      Add-Problem "$rel : <img> ohne alt-Attribut"
    }
  }

  # --- Icon-Referenzen ---------------------------------------
  $symbols = [regex]::Matches($html, '<symbol id="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  foreach ($u in [regex]::Matches($html, '<use href="#([^"]+)"')) {
    $name = $u.Groups[1].Value
    if ($symbols -notcontains $name) { Add-Problem "$rel : Icon '#$name' wird genutzt, ist aber nicht definiert" }
  }
  foreach ($s in $symbols) {
    if ($html -notmatch [regex]::Escape("<use href=""#$s""")) {
      Add-Problem "$rel : Icon '#$s' ist definiert, wird aber nicht verwendet"
    }
  }

  # --- JSON-LD -----------------------------------------------
  foreach ($ld in [regex]::Matches($html, '(?s)<script type="application/ld\+json">(.*?)</script>')) {
    try { $null = $ld.Groups[1].Value | ConvertFrom-Json }
    catch { Add-Problem "$rel : JSON-LD ist ungueltig -> $($_.Exception.Message)" }
  }

  # --- Links und Ressourcen ----------------------------------
  $refs = @()
  $refs += [regex]::Matches($html, '\shref="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  $refs += [regex]::Matches($html, '\ssrc="([^"]+)"')  | ForEach-Object { $_.Groups[1].Value }

  foreach ($ref in ($refs | Select-Object -Unique)) {
    if ($ref -match '^(https?:|mailto:|tel:|data:|#)') {
      # seiteninterner Anker
      if ($ref.StartsWith('#')) {
        $anchor = $ref.Substring(1)
        if ($anchor -and $anchor -notmatch '^i-' -and $idsByFile[$page.FullName] -notcontains $anchor) {
          Add-Problem "$rel : Anker '$ref' zeigt auf keine ID dieser Seite"
        }
      }
      continue
    }

    $path   = $ref
    $anchor = $null
    if ($ref.Contains('#')) {
      $parts  = $ref.Split('#', 2)
      $path   = $parts[0]
      $anchor = $parts[1]
    }
    if (-not $path) { continue }

    $target = Join-Path $dir $path
    if (-not (Test-Path $target)) {
      Add-Problem "$rel : Ziel nicht gefunden -> $ref"
      continue
    }

    # Anker in der Zieldatei pruefen
    if ($anchor -and $target -like '*.html') {
      $full = (Resolve-Path $target).Path
      if ($idsByFile.ContainsKey($full) -and $idsByFile[$full] -notcontains $anchor) {
        Add-Problem "$rel : Anker '#$anchor' existiert nicht in $path"
      }
    }
  }
}

# --- Einheitliche Kontaktdaten ueber alle Seiten -------------
foreach ($page in $pages) {
  $rel  = $page.FullName.Substring($root.Length + 1)
  $html = [System.IO.File]::ReadAllText($page.FullName, [System.Text.Encoding]::UTF8)
  # HTML-Kommentare ausblenden: dort stehen bewusst Hinweise auf die
  # alten, ersetzten Kontaktdaten (Kläerungspunkte fuer den Betreiber).
  $visible = [regex]::Replace($html, '(?s)<!--.*?-->', '')
  if ($visible -match 'akquise-helfer\.de')  { Add-Problem "$rel : alte E-Mail-Adresse sichtbar" }
  if ($visible -match '06657')               { Add-Problem "$rel : alte Telefonnummer 06657 sichtbar" }
  if ($visible -match '0211\s*/')            { Add-Problem "$rel : alte Telefonnummer 0211 sichtbar" }
  if ($visible -notmatch '0177') { Add-Problem "$rel : Telefonnummer 0177 fehlt" }
}

# --- Ergebnis ------------------------------------------------
Write-Host ''
Write-Host "Geprueft: $($pages.Count) Seiten"
if ($problems.Count -eq 0) {
  Write-Host 'Keine Probleme gefunden.' -ForegroundColor Green
} else {
  Write-Host "$($problems.Count) Hinweise:" -ForegroundColor Yellow
  $problems | Sort-Object | ForEach-Object { Write-Host "  - $_" }
}
