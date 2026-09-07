<#
  generate-images.ps1
  --------------------------------------------------------------
  Erzeugt aus dem Logo (assets/img/logo.png) die Favicons, die
  App-Icons und ein Open-Graph-Vorschaubild.

  Aufruf im Projektordner:
      powershell -ExecutionPolicy Bypass -File tools\generate-images.ps1

  Das Skript muss nur erneut laufen, wenn das Logo ausgetauscht
  wird oder ein echtes OG-Bild gestaltet werden soll. Fuer die
  Website selbst ist es nicht erforderlich.
  --------------------------------------------------------------
#>

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

# Immer relativ zum Projektordner arbeiten (eine Ebene ueber tools\)
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$logoPath = Join-Path $root 'assets\img\logo.png'
$imgDir   = Join-Path $root 'assets\img'

# Umlaute ueber Zeichencodes, damit die Datei encoding-unabhaengig bleibt
$ue = [char]0xFC; $oe = [char]0xF6; $ae = [char]0xE4; $mdash = [char]0x2013

# --- 1) Favicons und App-Icons aus dem Logo skalieren -----------
$logo = [System.Drawing.Image]::FromFile($logoPath)

$iconSizes = @{
  'favicon-16x16.png'   = 16
  'favicon-32x32.png'   = 32
  'favicon-48x48.png'   = 48
  'apple-touch-icon.png' = 180
  'icon-192.png'        = 192
  'icon-512.png'        = 512
}

foreach ($name in $iconSizes.Keys) {
  $size = $iconSizes[$name]
  $bmp  = New-Object System.Drawing.Bitmap($size, $size)
  $g    = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode  = 'HighQualityBicubic'
  $g.SmoothingMode      = 'AntiAlias'
  $g.PixelOffsetMode    = 'HighQuality'

  # Apple-Touch-Icons duerfen nicht transparent sein -> weisse Flaeche
  if ($name -eq 'apple-touch-icon.png' -or $name -eq 'icon-192.png' -or $name -eq 'icon-512.png') {
    $g.Clear([System.Drawing.Color]::White)
    $pad = [int]($size * 0.08)
    $g.DrawImage($logo, $pad, $pad, $size - 2 * $pad, $size - 2 * $pad)
  } else {
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($logo, 0, 0, $size, $size)
  }

  $g.Dispose()
  $bmp.Save((Join-Path $imgDir $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "erstellt: assets/img/$name"
}

# --- 2) Open-Graph-Vorschaubild (1200 x 630) --------------------
$W = 1200; $H = 630
$og = New-Object System.Drawing.Bitmap($W, $H)
$g  = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode     = 'AntiAlias'
$g.TextRenderingHint = 'ClearTypeGridFit'
$g.InterpolationMode = 'HighQualityBicubic'

# Hintergrundverlauf in Marineblau
$navy     = [System.Drawing.Color]::FromArgb(0, 40, 88)
$navyDeep = [System.Drawing.Color]::FromArgb(0, 21, 48)
$green    = [System.Drawing.Color]::FromArgb(24, 168, 112)
$rect     = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
$bgBrush  = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $navyDeep, $navy, 35.0)
$g.FillRectangle($bgBrush, $rect)

# Globus-Bahnen als dezentes Ornament (Motiv aus dem Logo)
foreach ($cfg in @(@(120, 26, 18), @(250, 34, 14), @(380, 26, 18), @(510, 34, 14))) {
  $y = $cfg[0]; $thick = $cfg[1]; $alpha = $cfg[2]
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($alpha, 255, 255, 255), [float]$thick)
  $pen.StartCap = 'Round'; $pen.EndCap = 'Round'
  $g.DrawCurve($pen, [System.Drawing.Point[]]@(
    (New-Object System.Drawing.Point(-60, ($y + 60))),
    (New-Object System.Drawing.Point(300, ($y - 30))),
    (New-Object System.Drawing.Point(800, ($y - 10))),
    (New-Object System.Drawing.Point(1260, ($y + 70)))
  ))
  $pen.Dispose()
}

# Gruener Akzentbalken links
$accent = New-Object System.Drawing.SolidBrush($green)
$g.FillRectangle($accent, 0, 0, 14, $H)

# Logo oben links, auf heller Kreisflaeche (das Logo enthaelt dunkelblaue
# Bahnen und wuerde auf dem Marineblau sonst untergehen)
$disc = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillEllipse($disc, 62, 54, 140, 140)
$disc.Dispose()
$g.DrawImage($logo, 76, 68, 112, 112)

$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$mint  = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 227, 190))
$grey  = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(175, 195, 220))

$fName  = New-Object System.Drawing.Font('Segoe UI Semibold', 21, [System.Drawing.FontStyle]::Regular)
$fTitle = New-Object System.Drawing.Font('Segoe UI', 56, [System.Drawing.FontStyle]::Bold)
$fSub   = New-Object System.Drawing.Font('Segoe UI', 26, [System.Drawing.FontStyle]::Regular)
$fFoot  = New-Object System.Drawing.Font('Segoe UI', 20, [System.Drawing.FontStyle]::Regular)

$g.DrawString("Johannes R$($oe)der $mdash Unternehmensberatung", $fName, $grey, 208, 105)
$g.DrawString("AVGS-Gr$($ue)ndungscoaching", $fTitle, $white, 74, 250)
$g.DrawString("Ihr Weg in die Selbstst$($ae)ndigkeit", $fSub, $mint, 80, 350)
$g.DrawString("Kostenfrei $mdash finanziert $($ue)ber Ihren Gutschein der Agentur f$($ue)r Arbeit", $fFoot, $grey, 80, 470)

$g.Dispose()
$og.Save((Join-Path $imgDir 'og-image.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$og.Dispose()
$logo.Dispose()
Write-Host 'erstellt: assets/img/og-image.png'
