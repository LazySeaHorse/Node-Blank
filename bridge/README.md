# node-blank-bridge

Lets local coding agents (Claude Code, Codex, Gemini CLI, Antigravity, ...) use the Node-Blank tab open in your browser.

```
agent --MCP over HTTP--> bridge <--WebSocket-- app tab
```

The bridge holds no tool logic. The tab registers its tools over the WebSocket and executes calls; the bridge translates between that and MCP. The tools live in `src/agent/`.

## Use

1. Download the binary for your OS from the latest `bridge-v*` GitHub release and run it (from a terminal, or double-click on Windows).
2. Open Node-Blank and turn on AI control in the AI panel (robot button in the toolbar). The tab connects on its own.
3. Add it to your agent once, with the command the bridge prints, e.g. `claude mcp add --transport http node-blank http://127.0.0.1:47801/mcp`.

macOS: unsigned binaries need `xattr -d com.apple.quarantine ./node-blank-bridge-darwin-arm64` (or right-click, Open).

Flags: `-port 47801` (the app is hardcoded to this port, see `src/agent/bridge.ts`), `-origin host1,host2` to allow extra page hosts, e.g. `-origin lazyseahorse.github.io` while the app is still served from GitHub Pages' default domain.

## Security

- Listens on 127.0.0.1 only.
- The page socket only accepts `blank.lazycatto.tech` (plus localhost dev servers and any `-origin` hosts). `/mcp` rejects any request carrying an `Origin` header and any non-loopback `Host`, so web pages and DNS rebinding cannot drive the tab.
- One tab at a time: a newer tab replaces the old one.
- AI control is off on every page load; the user turns it on in the app.

## Develop

`go test ./...` and `go run . -origin ...` inside this folder. The wire protocol is documented at the top of `src/agent/bridge.ts`. Build all platforms via the "Build bridge" workflow (manual run; give it a tag such as `bridge-v1.0.0` to attach the binaries to a release).
