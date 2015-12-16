# Markula: a markdown editor that's friendlier than your landlord, at least

<img src="https://cloud.githubusercontent.com/assets/187989/11111809/f1ef969e-88c9-11e5-9d7d-3a785ab56643.png" align=right>
### ☞ &nbsp;<code>[USE IT](http://runningskull.github.io/markula/)</code> &nbsp;☜


## Why?

I wanted accurate GitHub-flavored markdown parsing **and** previewing, which I couldn't find in any other editor. Also some  basics like live preview and scroll sync. 

Then added in some features for convenience (multiple files, customization).

## Unique Features
- Near-perfect GitHub emulation in both parsing & styles. See _exactly_ how your readme will look on GH, even for the tricky stuff.
- Save & edit multiple documents. 
    - Create a new one by going to a new URL
    - Edit saved ones by visiting the URL or sublime-style fuzzy file finder.
- Customize nearly everything via the devtools console (persists across sessions)

### Old-hat features
- Side-by-side edit/preview
- Pleasant, uncluttered editor
- Scroll syncing (which you can turn off if you want)

## Usage
Visit [the app](http://runningskull.github.io/markula/) & start writing.  Your work is auto-saved so you can close the tab or refresh at any time.

Press **`CMD+S`**(or `ctrl-s` for Windows folk) to name the file & save it. You can visit the new URL anytime to resume editing.

Press **`CTRL+P`** to bring up a list of all saved files. Start typing to filter the list. Press `<TAB>` to cycle through results and `<ENTER>` to choose one (or just click it). `<ESC>` to close the file-selector.

Want to customize everything? Open up the devtools console & read the instructions there. Your customizations will persist across sessions.


## Dev

#### Dev Cycle

- `git clone git@github.com:runningskull/markula.git`
- `cd markula && npm install && npm install --global webpack-dev-server`
- `./dev` (starts local server & watch+rebuild loop)
- open `localhost:8080`

#### Deployment

Build dist files with `webpack`.

Deploy the demo app by fast-forwarding the `gh-pages` branch to master, and running `git push origin gh-pages`


## Notes
- `/#!my-filename` and `/#!my-filename.md` point to the same file
- The syntax highlighting for code blocks is not 100% on parity with GitHub's yet, but it's really close, and highlight.js is getting better all the time.
- The storage uses IndexedDB, so you should have plenty of room. But feel free to make a PR if you run out.
- This readme was bootstrapped in markula ;)


## Credits
All the hard parts are done by:
- [marked](https://github.com/chjj/marked)
- [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)
- [highlight-js](https://github.com/isagalaev/highlight.js)
- [localForage](https://github.com/mozilla/localForage)
- [page.js](https://github.com/visionmedia/page.js)
- [fuzzy](https://github.com/mattyork/fuzzy)
