# BoardRipper — 2R Tools edition

**BoardRipper is by Alexey Lavrov.** Original project: https://github.com/AlexeyInwerp/BoardRipper
License: GNU Affero General Public License v3.0 (see `LICENSE`).

This repository is the **customized version of BoardRipper** that ships inside
**2R Tools — Scanner Diagnostic Suite**. It is published here to comply with the AGPL-3.0
and to give credit and code back to the community.

- Base: upstream **v0.50.2** (tag `v0.50.2`, commit `cdfe126b`)
- Server: upstream Go backend (unchanged between 0.48.0 and 0.50.2) + `patches/0001-bind-host.patch`
- Previous edition (base v0.48.0): kept in `patches/0.48.0/`

## Contents

| Path | What it is |
|---|---|
| `webapp/` | The modified web app exactly as shipped in 2R Tools (compiled build + 2R scripts in `index.html`) |
| `patches/2rtools-0.50.2-completo.patch` | **All** 2R changes as one source patch over tag `v0.50.2` (`git apply` at the repo root) |
| `patches/serie/` | The same changes split into steps (`git am patches/serie/*.patch`) |
| `patches/fonte-modificado-0.50.2.tar.gz` | The modified source files, ready to compare |
| `patches/REFAZER_BOARDRIPPER_0.50.2.command` | Rebuilds the web app and the server from upstream (needs git, node and go) |
| `patches/0001-bind-host.patch` | Server: listen only on `BIND_HOST` (2R uses 127.0.0.1) |
| `patches/0.48.0/` | Patches of the previous edition (base v0.48.0) |
| `2r/boardripper_tr.json` | Extra English / Spanish translations injected by 2R Tools |
| `notes/` | How each change is re-applied when upgrading upstream (Portuguese) |
| `THIRD_PARTY.md` | Third-party libraries used by BoardRipper |

## Main 2R changes

- FlexBV-style controls (toolbar, mouse wheel zoom, trackpad), keyboard shortcuts (N / Shift+N, Ctrl+←/→)
- Board search on top of the board and PDF search inside the PDF (Exact | Broad), PDF at 1/4 of the screen
- Point-to-point measurement with sticky notes, groups and expected values
- TOP / BOTTOM / BUTTERFLY buttons in the net-line colors (yellow / light blue), reference crosshair, minimap always available
- Physical component drawing: real pads, tight IC outlines, rotated ICs, DrMOS, shunts, crystals, 4-terminal capacitors,
  4-pin coupled inductors with round pads, two-row FPC connectors, cross-shaped antenna connectors, nothing drawn
  outside the board outline
- Diode cards on pads, name + value inside the component
- 2R themes, OBD (OpenBoardData) refresh button with progress/result animation, no white flash on load
- Donor board search (part code, position or net, online/local library, up to 20 boards); right-click a part or net to search
- GHOST button next to TOP / BOTTOM / BUTTERFLY, with the upstream ghost behaviour unchanged (hidden-side parts of the
  highlighted net, then Disco, then off)
- Extra EN/ES translations, language switch without restart
- Server bound to localhost only

## Build

Clone upstream at tag `v0.50.2`, apply `patches/2rtools-0.50.2-completo.patch`, then build as the original
project documents (`npx vite build --base ./` in `src/frontend`; Go backend in `src/backend` with the bind-host patch).
