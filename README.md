# Website Johannes Röder – AVGS-Gründercoach

Statische Website für **johannes-roeder-unternehmensberatung.de**: One-Page-Startseite mit
AVGS-Positionierung, Wissensbereich (Blog) sowie Impressum, Datenschutz und AGB.

---

## 1. Wichtigstes zuerst: Wie sehe ich die Seite?

Doppelklick auf **`index.html`**. Die Seite öffnet sich im Browser und ist vollständig
bedienbar – inklusive Navigation, Blog und Rechtsseiten. Es muss nichts installiert,
gebaut oder gestartet werden.

---

## 2. Warum kein Framework? (Technische Entscheidung)

Das Briefing empfahl Next.js oder Astro und nannte als Priorität einen *„sauberen statischen
Build, der auf Strato läuft"*. Umgesetzt ist die Seite als **reines HTML, CSS und JavaScript
ohne Build-Schritt**. Gründe:

| Punkt | Bedeutung in der Praxis |
|---|---|
| Kein Node.js nötig | Auf dem Arbeitsrechner ist Node.js nicht installiert. Ein Framework hätte bei jeder Änderung `npm install` und `npm run build` erfordert. |
| Projekt liegt in OneDrive | Ein `node_modules`-Ordner mit zehntausenden Dateien führt dort regelmäßig zu Sync-Problemen. |
| Direkt hochladbar | Was im Ordner liegt, ist exakt das, was auf den Server kommt. Kein Zwischenschritt, keine Build-Fehler. |
| Volle Kontrolle über SEO | Alle Inhalte stehen im ausgelieferten HTML – ideal für Suchmaschinen und KI-Antwortsysteme. |
| Sehr schnell | Ein Stylesheet, ein kleines Skript, keine Framework-Bibliotheken. |

**Der Kompromiss:** Header und Footer sind in jeder HTML-Datei enthalten. Ändern Sie etwas
daran, muss es in allen Seiten angepasst werden (aktuell sieben Dateien). Für eine Seite
dieser Größe ist das gut beherrschbar.

---

## 3. Projektstruktur

```
JR_U_AVGS/
├── index.html                  Startseite (alle Sektionen der One-Page)
├── impressum.html
├── datenschutz.html
├── agb.html
├── cookie-richtlinie.html        Cookie-Richtlinie (GTM, localStorage)
├── 404.html                    Fehlerseite
├── blog/
│   ├── index.html              Übersicht Wissensbereich
│   ├── avgs-gutschein-was-ist-das.html
│   └── gruendungszuschuss-beantragen.html
├── assets/
│   ├── css/styles.css          Komplettes Design-System (Farben, Typo, Komponenten)
│   ├── js/main.js              Menü, Animationen, Cookie-Banner, GTM
│   ├── fonts/                  Sora + Inter, lokal (kein Google-Request)
│   └── img/                    Logo, Favicons, OG-Bild, Platzhalter-Grafiken
├── content/blog/               Markdown-Fassungen der Beiträge (Arbeitsdateien)
├── tools/generate-images.ps1   Erzeugt Favicons und OG-Bild aus dem Logo
├── .htaccess                   Server-Einstellungen (HTTPS, Caching, Weiterleitungen)
├── robots.txt
├── sitemap.xml
└── site.webmanifest
```

---

## 4. Veröffentlichen auf Strato

### Variante A: direkt per FTP (der schnellste Weg)

1. FTP-Programm öffnen (z. B. FileZilla) und mit dem Strato-Webspace verbinden.
   Die Zugangsdaten stehen im Strato-Kundenbereich unter *Verwaltung → FTP*.
2. In das Web-Wurzelverzeichnis wechseln. Bei Strato heißt es meist **`/`** oder **`/htdocs`** –
   dort, wo bisher die alte Website liegt.
3. Folgende Dateien und Ordner hochladen:

   ```
   index.html   impressum.html   datenschutz.html   agb.html   404.html
   robots.txt   sitemap.xml      site.webmanifest   .htaccess
   assets/      blog/
   ```

4. **Nicht** hochladen (reine Arbeitsdateien): `content/`, `tools/`, `README.md`,
   das Briefing-Dokument und die losen `.md`-Dateien im Hauptordner.
5. Website aufrufen und prüfen. Falls noch die alte Seite erscheint: Browser-Cache leeren
   (Strg + F5).

> **Wichtig:** Die Datei `.htaccess` beginnt mit einem Punkt und wird von vielen
> FTP-Programmen standardmäßig ausgeblendet. In FileZilla unter
> *Server → Anzeige versteckter Dateien erzwingen* aktivieren.

### Variante B: über GitHub

1. Den Projektordner als Repository zu GitHub pushen.
2. In Strato bzw. über eine GitHub Action (z. B. `SamKirkland/FTP-Deploy-Action`) den
   FTP-Upload automatisieren. Es gibt keinen Build-Schritt – die Dateien werden
   unverändert übertragen.

---

## 5. Offene Punkte (bitte vor dem Livegang erledigen)

Diese Stellen sind im Code jeweils mit `TODO` oder als sichtbarer Platzhalter markiert.

### Kontaktformular

**Erledigt:** Das Formular ist über **Formspree** angebunden (gleiche Einrichtung wie bei
Akquise-Helfer, Form-ID `mlgwpyrg`). Absenden in `index.html`, Hinweis in `datenschutz.html`.

Optional später:
- eigenes Formspree-Formular, falls Anfragen an ein anderes Postfach gehen sollen
- Weiterleitung nach dem Absenden auf eine eigene Danke-Seite (`_next`-Feld bei Formspree)

### Echte Bilder einsetzen

Alle Bilder sind derzeit Platzhalter-Grafiken in den Markenfarben. Sie sind im Code mit
`<!-- Platzhalter – später echtes Bild -->` gekennzeichnet.

Damit beim Austausch nichts verrutscht, die **Seitenverhältnisse einhalten**:

| Datei in `assets/img/` | Verhältnis | Empfohlene Größe | Verwendung |
|---|---|---|---|
| `Johannes-Roeder-Gruenderberater_AVGS.png` | 4:5 (hoch) | 1000 × 1250 px | Hero-Bild auf der Startseite |
| `J_Roeder_AVGS_Beratung.png` | 3:4 (hoch) | 900 × 1200 px | Porträt Team + Autorenbox |
| `Gesa_Groening_Gruendercoach.png` | 3:4 (hoch) | 900 × 1200 px | Porträt Team |
| `Johannes_Roeder_Coaching_Gruendungszuschuss.png` | 3:2 (quer) | 1400 × 933 px | Beratungssituation |
| `bewertungen/Bytediver_Bewertung.png` | 1:1 | 150 × 150 px | Kundenlogo Bewertungen |
| `bewertungen/Marescaux_Bewertung.png` | 1:1 | 150 × 150 px | Kundenlogo Bewertungen |
| `bewertungen/Sinus_Bewertung.png` | 1:1 | 150 × 150 px | Kundenlogo Bewertungen |
| `blog/*` (optional) | 16:9 (quer) | 1600 × 900 px | Titelbilder – **aktuell deaktiviert**, siehe unten |

Vorgehen: das echte Bild als `.jpg` oder `.webp` in denselben Ordner legen und in den
HTML-Dateien den Dateinamen im `src` ändern. Den `alt`-Text dabei an das echte Motiv anpassen
(er ist wichtig für Barrierefreiheit und Suchmaschinen). WebP ist gegenüber JPEG zu bevorzugen,
weil die Dateien deutlich kleiner sind.

**Hinweis Blog:** Der Wissensbereich nutzt derzeit **keine Titelbilder**, sondern Themen-Icons
(Gutschein für AVGS, Trend-Linie für Gründungszuschuss). Platzhalter-SVGs liegen weiter in
`assets/img/blog/` für einen späteren Wechsel.

### Weitere offene Punkte

- **Rechtstexte:** Impressum und Datenschutzerklärung sind inhaltlich befüllt. Die **AGB sind
  ein Entwurf** und müssen vor der Veröffentlichung geprüft werden – die zu ergänzenden Stellen
  sind auf der Seite grün umrandet hervorgehoben.
- **Kontaktdaten im Impressum:** Auf der alten Seite standen dort abweichende Angaben
  (Telefon 06657/…, E-Mail `roeder@akquise-helfer.de`). Wie im Briefing gewünscht, werden nun
  überall einheitlich **0177 / 2881222** und
  **kontakt@johannes-roeder-unternehmensberatung.de** geführt. Falls im Impressum zusätzlich
  eine Festnetznummer stehen soll, ist die Stelle in `impressum.html` kommentiert.
- **Google Tag Manager:** Container-ID in allen HTML-Dateien am Script-Tag setzen:
  `data-gtm-id="GTM-XXXXXXX"` (aktuell leer – GTM wird erst nach Opt-in geladen, sobald ID gesetzt).
  Google Analytics kann später **nur in GTM** aktiviert werden, ohne Website-Code zu ändern.
- **Google Search Console:** Nach dem Livegang die Domain verifizieren und
  `https://www.johannes-roeder-unternehmensberatung.de/sitemap.xml` einreichen.

---

## 6. Inhalte pflegen

### Text ändern

Die HTML-Datei in Cursor öffnen und den Text zwischen den Tags anpassen. Zum Beispiel:

```html
<h3>Kostenfreies Erstgespräch</h3>
<p>Wir lernen uns kennen, Sie schildern Ihr Vorhaben …</p>
```

Nur den Text zwischen `>` und `<` bearbeiten, die Tags selbst stehen lassen.

### Neuen Blogbeitrag anlegen

1. Eine der bestehenden Artikeldateien in `blog/` kopieren und umbenennen. Der Dateiname wird
   zur Adresse – also kleingeschrieben, ohne Umlaute, mit Bindestrichen, zum Beispiel
   `avgs-beantragen-schritt-fuer-schritt.html`.
2. Im Kopfbereich (`<head>`) anpassen: `<title>`, `meta name="description"`, `link rel="canonical"`,
   die `og:`-Angaben und den Block `application/ld+json` (Titel, Beschreibung, Datum, URL).
3. Den Inhalt zwischen `<article class="prose">` und `</article>` ersetzen sowie das
   Inhaltsverzeichnis darüber aktualisieren.
4. In `blog/index.html` eine weitere `<article class="post-card post-card--text">` ergänzen
   (Themen-Icon in `post-card__topic`, siehe bestehende Karten – **ohne** `post-card__media`).
5. In `sitemap.xml` einen `<url>`-Block für den neuen Beitrag ergänzen.

Ein Themen-Backlog aus der Keyword-Recherche steht als Kommentar in `blog/index.html`.

### Wissen/Blog – Darstellung ohne Titelbilder (Stand jetzt)

- **`blog/index.html`:** Karten mit `post-card--text`, Kopfzeile `post-card__topic` (Icon + Label)
- **Artikelseiten:** Kein `<figure>` unter dem Hero; stattdessen `post-topic` im blauen Kopfbereich
- **JSON-LD** (`BlogPosting`): `"image"` zeigt auf `assets/img/og-image.png` (Seiten-Vorschaubild)
- **Icons:** `#i-ticket` (AVGS), `#i-trending` (Gründungszuschuss) – Symbole im SVG-Sprite der Blog-Seiten

### Blog-Titelbilder wieder aktivieren

Wenn du später wieder Fotos/Grafiken einbinden willst:

**1. Blog-Übersicht** (`blog/index.html`) – pro Karte `post-card__topic` durch Medienblock ersetzen
und Klasse `post-card--text` entfernen:

```html
<article class="post-card" data-reveal>
  <div class="post-card__media">
    <img src="../assets/img/blog/DEIN-BILD.webp" width="1200" height="675"
         alt="Kurzbeschreibung des Motivs"
         loading="lazy" decoding="async">
  </div>
  <div class="post-card__body">
    <!-- Meta, Titel, Teaser, Link wie bisher -->
  </div>
</article>
```

**2. Artikelseite** – nach `<section class="page-hero">` und vor dem schmalen Container einfügen
(`post-topic` im Hero kann bleiben oder entfernt werden):

```html
<section class="section section--white">
  <div class="container">
    <figure class="figure figure--wide mb-8">
      <img src="../assets/img/blog/DEIN-BILD.webp" width="1200" height="675"
           alt="Kurzbeschreibung des Motivs"
           loading="lazy" decoding="async">
    </figure>
  </div>

  <div class="container container--narrow">
    <!-- Inhaltsverzeichnis + Artikel -->
```

**3. Strukturierte Daten** – im `<head>` unter `BlogPosting` die `"image"`-URL auf das
Beitragsbild setzen, z. B.:
`https://www.johannes-roeder-unternehmensberatung.de/assets/img/blog/DEIN-BILD.webp`

**4. Bildgröße:** 16:9, empfohlen 1600 × 900 px (WebP). CSS für `.post-card__media` und
`.figure--wide` ist in `styles.css` vorhanden bzw. kommentiert.

### Google Tag Manager aktivieren

1. In [Google Tag Manager](https://tagmanager.google.com/) einen **Web-Container** anlegen.
2. Die Container-ID (`GTM-XXXXXXX`) in **allen** HTML-Dateien eintragen – am Attribut
   `data-gtm-id` des Scripts `main.js`, z. B.:
   ```html
   <script src="assets/js/main.js" defer data-gtm-id="GTM-XXXXXXX" data-policy-href="cookie-richtlinie.html"></script>
   ```
   (Blog-Seiten: `../assets/…` und `../cookie-richtlinie.html`; `404.html`: absolute Pfade `/assets/…`.)
3. **Noch kein Google Analytics** in GTM aktivieren, bis du das möchtest – der Banner ist vorbereitet.
4. Besucher müssen im Cookie-Banner „Statistik“ akzeptieren, damit GTM geladen wird.

**Cookie-Banner testen (lokal):** Die neue Website liegt im Projektordner – auf
`johannes-roeder-unternehmensberatung.de` ist noch die **alte Seite** online, dort gibt es keinen Banner.
Lokal `index.html` im Browser öffnen (oder Live Server). Der Banner erscheint beim ersten Besuch
unten. Wenn du ihn erneut sehen willst: `index.html?cookies=reset` aufrufen oder in der
Browser-Konsole `localStorage.removeItem('jr_avgs_cookie_consent')` ausführen. Über den Footer-Link
**Cookie-Einstellungen** lässt sich das Modal jederzeit öffnen.

### Farben und Schriften ändern

Alles zentral in `assets/css/styles.css` ganz oben unter `:root`. Wird dort ein Farbwert
geändert, zieht sich die Änderung durch die gesamte Website.

---

## 7. Was bereits umgesetzt ist

**Inhalt und Struktur**

- One-Page-Startseite mit Hero, Trust-Leiste, AVGS-Coaching, AVGS-Erklärung mit FAQ, Ablauf,
  Gründungszuschuss, Team, weiteren Leistungen, Bewertungen und Kontakt
- Der Wissensbereich (`blog/index.html`) ist eine eigene Unterseite – erreichbar über Navigation
  und Footer; die Startseite verlinkt dorthin über FAQ, Gründungszuschuss-Sektion und Footer
- Eigene Sektion `#gruendungszuschuss`: Der Gründungszuschuss nach § 93 SGB III ist
  durchgängig als **Kann-Leistung ohne Rechtsanspruch** formuliert. Beworben wird die
  gemeinsame Antragsarbeit (Formulare durchgehen, Unterlagen zusammenstellen, Antrag
  zusammen ausfüllen), nicht die Bewilligung. Die fachkundige Stellungnahme ist als
  Leistung beschrieben, die **über den zugelassenen Bildungsträger** erfolgen kann.
- Der Ablauf umfasst sechs Schritte; Schritt 4 ist der Antrag auf Gründungszuschuss
- Wissensbereich mit Übersicht und zwei ausformulierten Beiträgen
- Impressum, Datenschutzerklärung und AGB-Entwurf als eigene Seiten
- Sieben Kundenstimmen als gestaltete Zitate – bewusst **ohne** Bewertungs-Schema, da kein
  verifizierbares externes Bewertungsprofil existiert. Vier mit LinkedIn- oder Google-Maps-Link,
  drei mit verlinktem Firmenlogo in `assets/img/bewertungen/`
- Die Zusammenarbeit mit Bildungsträgern ist an allen Stellen rechtlich präzise formuliert:
  selbstständig, unabhängig, nicht exklusiv gebunden, Zulassung beim jeweiligen Träger

**Suchmaschinen und KI-Antwortsysteme**

- Individuelle Titel und Beschreibungen je Seite, Canonical-Tags, Open Graph und Twitter Cards
- Strukturierte Daten: `ProfessionalService`, zwei `Person`-Profile, `FAQPage`, `WebSite`,
  `BlogPosting` und `BreadcrumbList`
- `robots.txt` und `sitemap.xml`
- Frage-Antwort-Strukturen, Gesetzesbezüge (§ 45 SGB III, § 93 SGB III), Autorenkennzeichnung
  und Datumsangaben – damit KI-Systeme sauber zitieren können
- Interne Verlinkung zwischen Startseiten-Sektionen und Beiträgen

**Technik und Barrierefreiheit**

- Cookie-Banner (du-Ansprache) mit Kategorien **notwendig** und **Statistik (GTM)**; Google Consent Mode v2 standardmäßig „denied“
- Schriften lokal eingebunden; Google Tag Manager **nur nach Einwilligung**
- Mobile-First, Burger-Menü, alle Layouts brechen sauber um
- Feste Bild-Seitenverhältnisse, dadurch kein Springen beim Laden
- `prefers-reduced-motion` wird respektiert; ohne JavaScript bleibt die Seite voll nutzbar
- Sprungmarke zum Inhalt, sichtbare Fokus-Rahmen, semantisches HTML, `lang="de"`

---

## 8. Hilfsskript

`tools/generate-images.ps1` erzeugt aus `assets/img/logo.png` die Favicons, die App-Icons und
das Vorschaubild fürs Teilen (`og-image.png`). Es muss nur laufen, wenn das Logo ausgetauscht
wird:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-images.ps1
```

Das `og-image.png` ist eine schlichte, generierte Grafik. Sobald ein echtes Foto vorliegt,
lohnt sich ein gestaltetes Vorschaubild in 1200 × 630 px.
