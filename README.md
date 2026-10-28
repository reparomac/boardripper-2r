# BoardRipper — 2R Tools edition

**BoardRipper is by Alexey Lavrov.** Original project: https://github.com/AlexeyInwerp/BoardRipper
License: GNU Affero General Public License v3.0 (see `LICENSE`).

This repository is the **customized version of BoardRipper** that ships inside
**2R Tools — Scanner Diagnostic Suite** (free plan, worldwide). It is published here
to comply with the AGPL-3.0 and to give credit and code back to the community.

- Base: upstream **v0.48.0**, commit `1cef96edd114c95e1080a9dbec4dfb711df86e2c`
- Server: upstream Go backend + `patches/0001-bind-host.patch`

## Contents

| Path | What it is |
|---|---|
| `webapp/` | The modified web app exactly as shipped in 2R Tools (compiled build) |
| `patches/2rtools-boardripper-0.48.0.patch` | Source patch over v0.48.0 (backend `main.go`, frontend `App.tsx`, …) |
| `patches/2rtools-customizacoes-0.48.0.patch` | 2R customizations applied to the bundle |
| `patches/ponto_a_ponto_m3.patch` | Point-to-point measurement mode |
| `patches/GuidePanel.tsx`, `patches/logo2r-print.ts` | New 2R source files |
| `patches/0001-bind-host.patch` | Server: listen only on `BIND_HOST` (2R uses 127.0.0.1) |
| `2r/boardripper_tr.json` | Extra English / Spanish translations injected by 2R Tools |
| `notes/` | How each change is re-applied when upgrading upstream (Portuguese) |
| `THIRD_PARTY.md` | Third-party libraries used by BoardRipper |

## Main 2R changes

- FlexBV-style controls: mirror on `M`, pin filter and sorting
- Point-to-point measurement with sticky notes
- Compact net color legend
- TOP / BOTTOM / BUTTERFLY toolbar that never overlaps side panels
- Guide panel and 2R print header
- Extra EN/ES translations, language switch without restart
- Server bound to localhost only

## Build

Clone upstream at the base commit, apply the patches, then build as the original
project documents (`npm run build:desktop-webapp` in `src/frontend`; Go backend in `src/backend`).

```
git clone https://github.com/AlexeyInwerp/BoardRipper && cd BoardRipper
git checkout 1cef96edd114c95e1080a9dbec4dfb711df86e2c
git apply ../boardripper-2r/patches/2rtools-boardripper-0.48.0.patch
git apply ../boardripper-2r/patches/0001-bind-host.patch
```

Some 2R changes were made directly on the compiled bundle; the full result is in `webapp/`
and each step is described in `notes/`.

---

## Português

**O BoardRipper é de Alexey Lavrov** (https://github.com/AlexeyInwerp/BoardRipper), licença AGPL-3.0.
Este repositório é a **versão customizada pela 2R Tools**, com várias ideias novas, que vem
de graça no 2R Tools — Scanner Diagnostic Suite. Base: v0.48.0 (commit `1cef96e`).
Todo o código modificado está aqui: `webapp/` (versão usada no app), `patches/` (alterações)
e `notes/` (como reaplicar ao atualizar).

2R Tools — https://www.2rtools.com.br
