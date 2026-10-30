# BoardRipper 0.50.2 + mudanças 2R Tools (28/10/2026)

Esta pasta guarda o código-fonte modificado da versão nova, para a próxima atualização do upstream ser fácil.
Nada disto foi enviado ao GitHub.

- `2rtools-0.50.2-completo.patch` — TODAS as mudanças 2R sobre a tag `v0.50.2` de
  https://github.com/AlexeyInwerp/BoardRipper (`git apply` na raiz do repositório). Inclui a 2R da 0.48.0
  (`2rtools-customizacoes-0.48.0.patch` + `GuidePanel.tsx` + `logo2r-print.ts`) e, portadas para o código-fonte
  (TypeScript), todas as edições feitas à mão no bundle `index-BscvDDFO.js` e no CSS de 12/10 a 27/10/2026.
- `serie/` — as mesmas mudanças em 31 passos (`git am serie/*.patch`), para ver o que mudou em cada parte.
- `fonte-modificado-0.50.2.tar.gz` — os 74 arquivos do fonte já modificados (prontos para comparar).
- `REFAZER_BOARDRIPPER_0.50.2.command` — refaz a página e o servidor a partir do upstream (precisa de git, node e go).

## Onde ficou cada coisa no fonte

- `src/frontend/src/r2/hand-geom.ts` — desenho dos componentes (pads físicos, contorno de CI, DrMOS, shunt,
  cristal, capacitor de 4 terminais, CI girado 45°, contorno externo da placa, card do diodo, cruz de referência).
  Copiado do bundle 0.48.0 sem mudar a lógica (cada bloco tem o comentário do pedido do Roger).
- `src/frontend/src/r2/hand-labels.ts` — nome + valor dentro do componente, giro 90°, cards.
- `src/frontend/src/r2/hand-globals.tsx`, `hand-rc.ts`, `hand-flags.ts` — post-its, posição do mouse, API do
  RastreCurve (`window.__2rRC`), pads cinza, fundo de mesa.
- O resto está no próprio arquivo do upstream, sempre com comentário «2R dd/mm/2026».

## Ao atualizar de novo (ex.: 0.51)

1. `git clone` da tag nova; `git apply --3way 2rtools-0.50.2-completo.patch` (ou `git am -3 serie/*.patch`).
2. Resolver os conflitos mantendo o comportamento do Roger (busca da placa em cima da placa, busca do PDF solta no
   PDF, Exata | Geral, N/Shift+N, Ctrl+F, cruz, TOP/BOTTOM/BUTTERFLY juntos, PDF 1/4, sem girar o PDF).
3. `npm ci && npx vite build --base ./` em `src/frontend`; trocar os nomes `assets/index-*.js/css` no `index.html`
   da 2R (os scripts 2R ficam no `index.html`, não no bundle).
4. O servidor (`src/backend`) não mudou entre 0.48.0 e 0.50.2; se mudar, compilar com o `bind-host`
   (já está no patch) para darwin/arm64 e windows/amd64.

## Atualização 30/10/2026

- Busca de placa doadora (`components/DoadoraBusca2R.tsx`): código da peça, posição ou linha, acervo online/local,
  até 20 placas; botão direito numa peça/linha abre a busca. Quem responde é o SDS (`window.__2rAcervo.pecas`).
- Botão Ghost ao lado de Top / Bottom / Butterfly (`overlay/slots/SideSwitch.tsx`): todos os componentes do lado
  escondido transparentes com contorno vermelho neon (`renderer/BoardRenderer.ts`, `r2GhostOutroLado`);
  segundo clique: Disco; terceiro: desliga.
- Item ativo da barra lateral: ícone e texto brancos, fundo preto, contorno laranja.
