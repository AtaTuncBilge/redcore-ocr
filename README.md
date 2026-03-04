# alpha ocr static

this is the static-only publish bundle.

## what is included
- `index.html`
- `style.css`
- `app-react.js` (minified/mangled)
- `app.js` (minified/mangled)
- `ocr-core.js` (minified/mangled)
- `favicon.svg`

## login/profile/review storage
all account/profile/review data is saved in browser local storage on each user device.

## important
client-side code cannot be truly hidden from browser devtools. this bundle only makes it harder to read.

## deploy (cloudflare pages)
1. create a new github repo and push this folder contents.
2. connect that repo to cloudflare pages.
3. framework preset: none.
4. build command: none.
5. output directory: `/`.
