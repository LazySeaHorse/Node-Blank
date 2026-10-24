# Unlined Web

A small Chrome extension that lets the Web node in Unlined show sites that normally refuse to be embedded, such as `https://gemini.google.com/app`.

Such sites send `X-Frame-Options` or a `Content-Security-Policy` with `frame-ancestors`, and the browser then refuses to draw them inside another page. The extension removes those headers, but only for frames loaded in Unlined tabs. Without it the Web node still works for sites that allow framing, and its header always has an Open in tab button.

## Install

Chrome, Edge, Brave or any Chromium browser with Manifest V3 support (Chrome 116+):

1. Open `chrome://extensions` and turn on Developer mode.
2. Choose Load unpacked and select this `extension/` folder.
3. Reload any open Unlined tab. The Web node stops showing its "extension" hint once the page sees it.

After editing the files, press the reload icon on the extension's card.

## What it does

- **Strips `X-Frame-Options` and `Content-Security-Policy` from framed pages.** A `declarativeNetRequest` session rule applies to sub-frame requests in the tabs that are showing Unlined, and in no others. It is keyed on the tab, not on who started the request, so it keeps working after you click a link inside the frame. Declarative rules can only remove a whole header, so a framed page loses all of its CSP, not just `frame-ancestors`.
- **Tells Unlined which page is in the frame.** A script in the framed page reports its address, title and icon, so the node's address bar follows along, and it obeys the node's back, forward and reload buttons. It only runs in a page that is a direct child of an Unlined page.
- **Grabs a frame of a video.** A Video node showing YouTube gets a camera button when the extension (1.1 or later) is installed. The script inside the video's frame draws the picture on screen to a JPEG (at most 1280 px on the long side) and sends it to Unlined, which adds it as an Image node beside the video. The page itself cannot read a cross-origin player's pixels, so this has to happen inside the frame. Protected video comes out black and Unlined says so. Nothing is read until you press the button.
- **Tells Unlined it is installed**, by setting `data-unlined-web` on the page's `<html>` element.

Unlined tabs are `https://unlined.1azy.ink` and `http://localhost` or `http://127.0.0.1` on any port. Any local dev server on those hosts counts, not only Unlined's.

## Security

- Header stripping applies to frames in Unlined tabs only. Other tabs, and Unlined tabs once they navigate elsewhere, are untouched. Tabs are forgotten when closed or navigated away, and the list survives the browser stopping the extension's background worker.
- Inside a Web node, a framed page has no CSP. A site you embed is as exposed to injected scripts as it would be with no policy at all, so embed sites you would open in a normal tab anyway.
- The `<all_urls>` permission is what lets the extension edit headers on any site. It does not read pages, cookies or requests; the only content scripts that talk to anything are the ones above.
- The Web node's iframe is sandboxed without `allow-top-navigation`, so a framed page cannot navigate Unlined away.

## Several Google accounts

Sign in in a normal browser tab, not inside the node: Google refuses sign-in in embedded frames.

1. In a normal tab, sign in to your accounts with Google's "Add another account". Sign-in order decides the index.
2. Give each Web node its own account by address: `https://gemini.google.com/u/0/app`, `https://gemini.google.com/u/1/app` and so on (`u/1` is the second account you signed in to).

If a node shows Gemini signed out, allow third-party cookies for `gemini.google.com` (and `accounts.google.com`) in `chrome://settings/cookies`, since a framed page counts as third-party in an Unlined tab.

## Files

| File | Role |
| --- | --- |
| `manifest.json` | Permissions and content scripts |
| `background.js` | Service worker: tracks Unlined tabs and keeps the header rule in step |
| `app.js` | Content script in Unlined: registers the tab and marks the page |
| `frame.js` | Content script in every frame: reports state, handles commands |
| `shared.js` | Origin check and message tag shared by the above |

The messages between the app and `frame.js` are tagged `{ source: 'unlined-web' }`. The app side is `src/nodes/web/frameMessages.ts`.
