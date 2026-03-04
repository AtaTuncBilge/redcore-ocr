# redcore ocr static

Static deploy bundle for public OCR usage.

## included pages
- `index.html`: Main OCR (80-language support, plain text extraction)
- `invoice-ocr.html`: Invoice OCR easter egg (line-item extraction)

## included scripts
- `app-react.js`: Main OCR page UI
- `app.js`: Main OCR engine (PDF.js + Tesseract + Excel export)
- `invoice-app.js`: Invoice OCR engine
- `ocr-core.js`: Invoice parsing logic
- `style.css`
- `favicon.svg`

## deploy (cloudflare pages)
1. Create a new GitHub repo and push this folder contents.
2. Connect that repo to Cloudflare Pages.
3. Framework preset: `none`
4. Build command: `none`
5. Output directory: `/`

## notes
- OCR runs in the browser (client-side).
- Best results require clear PDF scans.
