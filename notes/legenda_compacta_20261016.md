# Legenda das cores das nets — compacta e sem truncar (16/10/2026)
Arquivo: `webapp/assets/index-I3MT3-ur.css` (bloco final `/*2R-legenda-compacta*/`).
Só CSS. Depois de atualizar o BoardRipper (novo bundle), reaplicar o bloco no CSS novo.
Mudanças: `.r2-legend-kw` quebra linha (antes `white-space:nowrap` + reticências = truncado), itens lado a lado
(`.r2-legend-group` flex-wrap), letra .72em, bolinhas 8px, largura = conteúdo (máx. 320px/42%),
canto 6px, painel lateral (`.r2-legend.embedded`) sem limite de largura.

## Complemento (03:55) — legenda no painel lateral: sem rolagem e altura ajustável
CSS: `.r2-legend-sidebar{max-height:none;overflow:auto;...}` + `::before` (alça de 9 px na borda de cima).
JS (app, `ui/boardview_view.py` → `_LEGEND_RESIZE_JS`): arrastar a borda de cima ajusta a altura (guarda em `2r-legend-h`);
duplo clique na borda = altura automática (mostra tudo).
