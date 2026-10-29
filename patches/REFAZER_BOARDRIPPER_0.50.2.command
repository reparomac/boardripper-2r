#!/bin/bash
# 2R Tools — refaz o BoardRipper 0.50.2 com as mudanças da 2R a partir do código do upstream.
# Uso: duplo clique. Precisa de git, node/npm e go no Mac. NÃO envia nada ao GitHub.
# Antes de trocar, guarda a pasta atual em PONTOS_DE_RESTAURACAO/boardripper_0.50.2_refeito_<data>.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BR="$(cd "$HERE/.." && pwd)"                       # third_party/boardripper_0.50.2
SDS="$(cd "$BR/../.." && pwd)"                     # 2RTOOLS_Scanner
TAG="v0.50.2"; REPO="https://github.com/AlexeyInwerp/BoardRipper"
LOGIN_PATH="$(zsh -lic 'print -r -- $PATH' 2>/dev/null || true)"; [ -n "$LOGIN_PATH" ] && PATH="$LOGIN_PATH:$PATH"
for d in /usr/local/go/bin /opt/homebrew/bin /usr/local/bin "$HOME/go/bin"; do [ -d "$d" ] && PATH="$d:$PATH"; done; export PATH
for c in git node npm go python3; do command -v $c >/dev/null || { echo "ERRO: falta '$c'"; exit 1; }; done
WORK="$(mktemp -d /tmp/br0502.XXXXXX)"; trap 'rm -rf "$WORK"' EXIT
echo "==> (1/5) baixando $TAG"; git clone --depth 1 --branch "$TAG" "$REPO" "$WORK/src" >/dev/null 2>&1
echo "==> (2/5) aplicando as mudanças 2R"; ( cd "$WORK/src" && git apply "$HERE/2rtools-0.50.2-completo.patch" )
echo "==> (3/5) página (npm)"; ( cd "$WORK/src/src/frontend" && npm ci --no-audit --no-fund >/dev/null && npx vite build --base ./ >/dev/null )
echo "==> (4/5) servidor (go)"; ( cd "$WORK/src/src/backend" \
  && CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -trimpath -o "$WORK/server_darwin" . \
  && CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -trimpath -o "$WORK/server_win.exe" . )
echo "==> (5/5) trocando (com ponto de restauração)"
TS="$(date +%Y%m%d_%H%M%S)"; BAK="$SDS/../PONTOS_DE_RESTAURACAO/boardripper_0.50.2_refeito_$TS"; mkdir -p "$BAK"; cp -R "$BR" "$BAK/"
OLDHTML="$BR/webapp/index.html"; NEW="$WORK/src/src/frontend/dist"
cp "$BR/webapp/r2-contornos.js" "$BR/webapp/r2-perguntas.js" "$NEW/"
python3 - "$OLDHTML" "$NEW" <<'PY'
import sys, os, re, glob
old, new = sys.argv[1], sys.argv[2]
s = open(old, encoding='utf-8').read()
js = max(glob.glob(os.path.join(new, 'assets', 'index-*.js')), key=os.path.getsize)
css = glob.glob(os.path.join(new, 'assets', 'index-*.css'))[0]
s = re.sub(r'assets/index-[\w-]+\.js', 'assets/' + os.path.basename(js), s, count=1)
s = re.sub(r'assets/index-[\w-]+\.css', 'assets/' + os.path.basename(css), s, count=1)
open(os.path.join(new, 'index.html'), 'w', encoding='utf-8').write(s)
PY
rm -rf "$BR/webapp.novo"; cp -R "$NEW" "$BR/webapp.novo"; mv "$BR/webapp" "$BAK/webapp_trocado"; mv "$BR/webapp.novo" "$BR/webapp"
cp "$WORK/server_darwin" "$BR/bin/darwin/server"; chmod +x "$BR/bin/darwin/server"; cp "$WORK/server_win.exe" "$BR/bin/win32/server.exe"
echo "PRONTO. Copie também para _ENVIAR_WINDOWS e rode scripts/testar_regressao.py."
