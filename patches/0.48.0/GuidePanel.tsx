import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { IconRoute, IconPlayerPlay, IconPlayerStop, IconTrash } from '@tabler/icons-react';
import { useBoardStore } from '../hooks/useBoardStore';
import { guideStore, resolve, seqWhereNow, matchesBoard } from '../r2/guide-store';
import { meterStore } from '../r2/meter-store';
import { boardStore } from '../store/board-store';
import { LOGO_2R_PRINT } from '../assets/logo2r-print';

/** 2R Tools: aba «Teleguiado» — cola o roteiro (sequência de start), converte e
 *  anda pelos pontos na placa com as setas do teclado. Beta. */

function useGuide() { return useSyncExternalStore(guideStore.subscribe, () => guideStore.rev); }

const KIND: Record<string, string> = { capacitor: 'capacitor', resistor: 'resistor', bobina: 'bobina', teste: 'ponto de teste', outro: 'pino' };

/** Célula de valor (tensão / diodo / resistência): o instrumento preenche, ou digite. */
function Cell({ i, k, val, ph }: { i: number; k: 'v' | 'd' | 'r'; val?: string; ph: string }) {
  const [v, setV] = useState(val || '');
  const [focus, setFocus] = useState(false);
  const shown = focus ? v : (val || '');
  return (
    <input className={`r2gd-cell ${val ? 'has' : ''}`} value={shown} placeholder={ph}
           onClick={e => e.stopPropagation()}
           onFocus={() => { setV(val || ''); setFocus(true); }}
           onChange={e => setV(e.target.value)}
           onBlur={() => { setFocus(false); if ((v || '') !== (val || '')) guideStore.editStep(i, { [k]: v.trim() || undefined }); }}
           onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setV(val || ''); (e.target as HTMLInputElement).blur(); } }} />
  );
}

/** Criar a própria sequência (start ou análise) para ajudar outros técnicos. */
function CreateOwn() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<'start' | 'analise'>('analise');
  const [credit, setCredit] = useState(meterStore.who || '');
  const has = !!boardStore.activeTab?.board;
  return (
    <div className="r2acv-section">
      <button className="r2acv-head" onClick={() => setOpen(!open)}>＋ Criar minha sequência <span className="r2acv-caret">{open ? '▾' : '▸'}</span></button>
      {open && (
        <div className="r2gd-edit">
          <div className="r2acv-note">Monte a sua sequência clicando nos pinos da placa, na ordem. Ela fica junto do boardview — os técnicos da loja já usam — e, com a aprovação da 2R, entra para todos.</div>
          <label>Nome<input value={title} onChange={e => setTitle(e.target.value)} placeholder="ex.: Não liga — sem PP3V8_AON" /></label>
          <label>Tipo<select value={kind} onChange={e => setKind(e.target.value as 'start' | 'analise')}>
            <option value="analise">Sequência de análise (defeito)</option>
            <option value="start">Sequência de start</option>
          </select></label>
          <label>Créditos (seu nome ou da assistência)<input value={credit} onChange={e => setCredit(e.target.value)} placeholder="ex.: Roger — 2R Tools" /></label>
          <button className="r2acv-send r2meter-btn" disabled={!has} onClick={() => guideStore.createBlank(title, kind, credit)}>{has ? 'Criar e montar na placa' : 'Abra a placa primeiro'}</button>
        </div>
      )}
    </div>
  );
}

/** Créditos de quem montou a sequência (editável). */
function Credit() {
  const a = guideStore.active!;
  const [ed, setEd] = useState(false);
  const [v, setV] = useState(a.credit || '');
  if (ed) return (
    <div className="r2gd-credit r2gd-edit-row">
      <input autoFocus value={v} onChange={e => setV(e.target.value)} placeholder="Nome de quem montou a sequência"
             onKeyDown={e => { if (e.key === 'Enter') { guideStore.setCredit(v); setEd(false); } if (e.key === 'Escape') setEd(false); }} />
      <button className="r2acv-send r2meter-btn" onClick={() => { guideStore.setCredit(v); setEd(false); }}>Salvar</button>
    </div>
  );
  return (
    <div className="r2gd-credit">Créditos: <b>{a.credit || '—'}</b> <button className="r2cv-link" onClick={() => { setV(a.credit || ''); setEd(true); }}>editar</button></div>
  );
}

/** Editor do passo: nets, observação e ponto. */
function StepEditor({ i, onDone }: { i: number; onDone: () => void }) {
  const st = guideStore.active!.steps[i];
  const [nets, setNets] = useState(st.nets.join(', '));
  const [note, setNote] = useState(st.note);
  const [point, setPoint] = useState(st.point || '');
  const ok = () => {
    guideStore.editStep(i, { nets: nets.split(/[,;]+/).map(x => x.trim()).filter(Boolean), note: note.trim(), point: point.trim().toUpperCase() || undefined });
    onDone();
  };
  const fromBoard = () => {
    const tab = boardStore.activeTab, sel = tab?.selection;
    const part = tab?.board && sel?.partIndex != null ? tab.board.parts[sel.partIndex] : null;
    const pin = part && sel?.pinIndex != null && sel.pinIndex >= 0 ? part.pins[sel.pinIndex] : null;
    if (part && pin) { setPoint(`${part.name}.${pin.number || pin.name}`); if (!nets.trim() && pin.net) setNets(pin.net); }
  };
  return (
    <span className="r2gd-edit" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Enter') ok(); if (e.key === 'Escape') onDone(); }}>
      <label>Nets (vírgula separa)<input autoFocus value={nets} onChange={e => setNets(e.target.value)} placeholder="PP5V_AON" /></label>
      <label>Observação<input value={note} onChange={e => setNote(e.target.value)} placeholder="ex.: 5 V com o carregador ligado" /></label>
      <label>Ponto de medição<span className="r2gd-edit-row">
        <input value={point} onChange={e => setPoint(e.target.value)} placeholder="automático (capacitor mais fácil)" />
        <button onClick={fromBoard} title="Pega o pino que está selecionado na placa">pino selecionado</button>
      </span></label>
      <span className="r2gd-edit-row">
        <button className="r2acv-send r2meter-btn" onClick={ok}>Salvar</button>
        <button className="r2meter-btn r2meter-off" onClick={onDone}>Cancelar</button>
      </span>
    </span>
  );
}

type ResT = ReturnType<typeof resolve>;
function StepTable({ res, showNets }: { res: ResT[]; showNets: boolean }) {
  const idealKey = (st: { v?: string; d?: string; r?: string }): 'iv' | 'id' | 'ir' => (st.d ? 'id' : st.r ? 'ir' : 'iv');
  const measured = (st: { v?: string; d?: string; r?: string }) => st.v ? `${st.v} V` : st.d ? `${st.d}` : st.r ? `${st.r} Ω` : '—';
  const idealVal = (st: { iv?: string; id?: string; ir?: string }, k: 'iv' | 'id' | 'ir') => st[k] ?? '';
  return (
    <div className="r2gd-tbl">
      <div className="r2gd-thd"><span>#</span><span>Nome do teste</span><span>Medido</span><span>Valor certo</span><span>★</span></div>
      {res.map((r, i) => {
        const st = r.step; const k = idealKey(st);
        const out = st.v && st.iv ? Math.abs(parseFloat(st.v) - parseFloat(st.iv)) > Math.max(Math.abs(parseFloat(st.iv)) * 0.02, 0.005) : false;
        return (
          <div key={i} className={`r2gd-trow ${out ? 'out' : ''}`}>
            <span className="r2gd-tn">{String(st.n).padStart(2, '0')}</span>
            <input className="r2gd-tname" defaultValue={st.name || (showNets ? st.nets.join(', ') : (r.points[0]?.label || st.point || ''))}
                   onBlur={e => guideStore.renameStep(i, e.target.value)} />
            <span className={`r2gd-tmed ${out ? 'bad' : st.v || st.d || st.r ? 'ok' : ''}`}>{measured(st)}</span>
            <input className="r2gd-tcert" defaultValue={idealVal(st, k)} placeholder="ideal"
                   onBlur={e => guideStore.setIdeal(i, k, e.target.value)} />
            <button className={`r2gd-tstar ${st.star ? 'on' : ''}`} title="Marcar como valor certo (referência)" onClick={() => guideStore.toggleStar(i)}>★</button>
          </div>
        );
      })}
      <div className="r2gd-tfoot">
        <button className="r2acv-send r2meter-btn" onClick={() => guideStore.markCorrect()}>Marcar valores certos (depois do reparo)</button>
      </div>
    </div>
  );
}

function fnum(s?: string): number | null { if (!s) return null; const m = /[-+]?\d+(?:[.,]\d+)?/.exec(s); return m ? parseFloat(m[0].replace(',', '.')) : null; }
type RepRow = { n: number; nome: string; ponto: string; ideal: string; med: string; tipo: string; resu: 'ok' | 'fora' | 'sem' };
function printReport(title: string, who: string, data: string, sum: { ok: number; fora: number; feitos: number; total: number }, rows: RepRow[]) {
  const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
  const chips = [`<span class="c">${sum.ok} certos</span>`]
    .concat(sum.fora > 0 ? [`<span class="c bad">${sum.fora} fora</span>`] : [])
    .concat([`<span class="c">${sum.feitos}/${sum.total} medidos</span>`]).join('');
  const body = rows.map(x => `<tr class="${x.resu === 'fora' ? 'fora' : ''}"><td class="n">${String(x.n).padStart(2, '0')}</td><td class="nm">${esc(x.nome)}</td><td class="pt">${esc(x.ponto)}</td><td class="v">${esc(x.ideal)}</td><td class="v ${x.resu === 'fora' ? 'bad' : ''}">${esc(x.med)}</td><td class="tp">${esc(x.tipo)}</td><td class="res ${x.resu}">${x.resu === 'ok' ? 'OK' : x.resu === 'fora' ? 'FORA' : '—'}</td></tr>`).join('');
  const html = `<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>Relatório de medições — 2R Tools</title><style>
@page { size: A4; margin: 16mm 12mm 16mm;
  @bottom-left { content: "2R Tools · BoardView — Ponto a ponto"; font: 9px Arial, sans-serif; color: #7B8794; }
  @bottom-right { content: "Página " counter(page) " de " counter(pages); font: 9px Arial, sans-serif; color: #7B8794; }
}
* { box-sizing: border-box; }
body { font: 12px -apple-system,Segoe UI,Roboto,Arial,sans-serif; color: #1F2933; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 2px solid #1F2933; padding-bottom: 9px; }
.head img { height: 34px; width: auto; display: block; }
.head .tool { font-size: 10px; font-weight: 800; letter-spacing: 2.4px; text-transform: uppercase; color: #5B7DB8; white-space: nowrap; padding-bottom: 2px; }
.ti { font-size: 16px; font-weight: 800; margin-top: 14px; }
.meta { display: flex; align-items: center; justify-content: space-between; gap: 14px; background: #E4E4E4; border: 1px solid #B5B5B5; border-radius: 6px; padding: 8px 12px; margin-top: 8px; }
.meta .sub { font-size: 11.5px; color: #3E4C59; }
.sum { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.sum .c { display: inline-block; font-size: 11px; font-weight: 700; border: 1px solid #B5B5B5; color: #1F2933; background: #fff; border-radius: 12px; padding: 3px 10px; white-space: nowrap; }
.sum .c.bad { border-color: #C0392B; color: #C0392B; }
table { width: 100%; border-collapse: collapse; margin-top: 14px; }
thead { display: table-header-group; }
th { background: #E4E4E4; color: #1F2933; font-size: 10px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; text-align: left; padding: 7px 8px; border: 1px solid #B5B5B5; }
td { font-size: 11.5px; padding: 6px 8px; border: 1px solid #DADFE6; }
tr { break-inside: avoid; }
tr.fora { background: #FBEAE6; }
td.n, td.pt { color: #52606D; font-variant-numeric: tabular-nums; }
td.v { font-weight: 700; font-variant-numeric: tabular-nums; }
td.v.bad { color: #C0392B; }
td.tp { color: #52606D; }
td.res { font-weight: 800; text-align: center; }
td.res.fora { color: #C0392B; }
td.res.ok { color: #52606D; }
</style></head><body>
<div class="head"><img src="${LOGO_2R_PRINT}" alt="2R Tools"><span class="tool">BoardView · Ponto a ponto</span></div>
<div class="ti">Relatório de medições</div>
<div class="meta"><span class="sub">${esc(title)}${who ? ' · Técnico: ' + esc(who) : ''} · ${esc(data)}</span><span class="sum">${chips}</span></div>
<table><thead><tr><th>#</th><th>Linha</th><th>Ponto</th><th>Ideal</th><th>Medido</th><th>Tipo</th><th>Resultado</th></tr></thead><tbody>${body}</tbody></table>
</body></html>`;
  const fr = document.createElement('iframe');
  fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(fr);
  const d = fr.contentWindow?.document;
  if (!d) { document.body.removeChild(fr); return; }
  d.open(); d.write(html); d.close();
  const go = () => { try { fr.contentWindow?.focus(); fr.contentWindow?.print(); } catch { /* noop */ } setTimeout(() => { try { document.body.removeChild(fr); } catch { /* noop */ } }, 1000); };
  if (fr.contentWindow) { fr.contentWindow.onload = go; setTimeout(go, 400); } else { setTimeout(go, 400); }
}

function StepReport({ res, title, showNets }: { res: ResT[]; title: string; showNets: boolean }) {
  const rows = res.map(r => {
    const st = r.step;
    const med = st.v ? { v: `${st.v} V`, n: fnum(st.v), tipo: 'Tensão' } : st.d ? { v: st.d, n: fnum(st.d), tipo: 'Diodo' } : st.r ? { v: `${st.r} Ω`, n: fnum(st.r), tipo: 'Resist.' } : { v: '—', n: null, tipo: '—' };
    const ideal = st.iv ? `${st.iv} V` : st.id ? st.id : st.ir ? `${st.ir} Ω` : '—';
    const idn = fnum(st.iv || st.id || st.ir);
    let resu: 'ok' | 'fora' | 'sem' = 'sem';
    if (med.n != null && idn != null) resu = Math.abs(med.n - idn) <= Math.max(Math.abs(idn) * 0.02, 0.005) ? 'ok' : 'fora';
    const nome = st.name || (showNets ? (st.nets.join(', ') || st.point || '—') : (r.points[0]?.label || st.point || '—'));
    return { n: st.n, nome, ponto: st.point || r.points[0]?.label || '', ideal, med: med.v, tipo: med.tipo, resu };
  });
  const feitos = rows.filter(x => x.resu !== 'sem');
  const fora = rows.filter(x => x.resu === 'fora').length;
  const ok = rows.filter(x => x.resu === 'ok').length;
  const who = meterStore.who || '';
  const data = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="r2rep">
      <div className="r2rep-print-head"><span className="b">2R<small>TOOLS</small></span></div>
      <div className="r2rep-head">
        <div>
          <div className="r2rep-ti">Relatório de medições</div>
          <div className="r2rep-sub">{title}{who ? ` · Técnico: ${who}` : ''} · {data}</div>
        </div>
        <div className="r2rep-sum">
          <span className="r2rep-chip">{ok} certos</span>
          {fora > 0 && <span className="r2rep-chip bad">{fora} fora</span>}
          <span className="r2rep-chip mute">{feitos.length}/{rows.length} medidos</span>
        </div>
      </div>
      <div className="r2rep-tbl">
        <div className="r2rep-thd"><span>#</span><span>Linha</span><span>Ponto</span><span>Ideal</span><span>Medido</span><span>Tipo</span><span>Resultado</span></div>
        {rows.map((x, i) => (
          <div key={i} className={`r2rep-row ${x.resu === 'fora' ? 'fora' : ''}`}>
            <span className="r2rep-n">{String(x.n).padStart(2, '0')}</span>
            <span className="r2rep-nm">{x.nome}</span>
            <span className="r2rep-pt">{x.ponto}</span>
            <span className="r2rep-v">{x.ideal}</span>
            <span className={`r2rep-v ${x.resu === 'fora' ? 'bad' : ''}`}>{x.med}</span>
            <span className="r2rep-tp">{x.tipo}</span>
            <span className={`r2rep-res ${x.resu}`}>{x.resu === 'ok' ? 'OK' : x.resu === 'fora' ? 'FORA' : '—'}</span>
          </div>
        ))}
      </div>
      <div className="r2rep-foot">
        <button className="r2acv-send r2meter-btn" onClick={() => printReport(title, who, data, { ok, fora, feitos: feitos.length, total: rows.length }, rows)}>Imprimir / PDF</button>
        <span className="r2rep-saved">Salvo no banco local{meterStore.where === 'loja' ? ' · também na loja' : ''}</span>
      </div>
      <div className="r2acv-note">Vermelho = fora do valor certo. Marque o valor certo na aba Tabela para o resultado aparecer.</div>
    </div>
  );
}

export function GuidePanel() {
  useGuide();
  const snap = useBoardStore();
  const tab = snap.tabs.find(t => t.id === snap.activeTabId) ?? null;
  const board = tab?.board ?? null;
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [showNets, setShowNets] = useState<boolean>(() => { try { return localStorage.getItem('2r-pp-nets') !== '0'; } catch { return true; } });
  const [view, setView] = useState<'lista' | 'tabela' | 'relatorio'>('lista');
  const toggleNets = (v: boolean) => { setShowNets(v); try { localStorage.setItem('2r-pp-nets', v ? '1' : '0'); } catch { /* */ } };
  const a = guideStore.active;
  const res = useMemo(() => (a && board ? a.steps.map(s => resolve(board, s)) : []), [a, board]);
  const found = res.filter(r => r.nets.length).length;
  const mine = guideStore.forOpenBoard();
  const others = guideStore.list.filter(r => !mine.includes(r));

  useEffect(() => {                     // a lista acompanha o passo atual
    document.querySelector('.r2gd-step.cur')?.scrollIntoView({ block: 'nearest' });
  }, [guideStore.pos, a]);

  // Programar os pontos: clicar num pino na placa (ou no PDF) já adiciona à lista.
  const [progQ, setProgQ] = useState('');
  const lastSel = useRef('');
  useEffect(() => {
    if (!guideStore.programming) { lastSel.current = ''; return; }
    const sel = tab?.selection;
    if (!tab?.board || sel?.partIndex == null || sel?.pinIndex == null || sel.pinIndex < 0) return;
    const part = tab.board.parts[sel.partIndex];
    const pin = part?.pins[sel.pinIndex];
    if (!part || !pin) return;
    const key = `${part.name}.${pin.number || pin.name}`;
    if (lastSel.current === key) return;
    lastSel.current = key;
    if (guideStore.active?.steps.some(st => st.point === key)) return;   // já está na lista
    const l = guideStore.addSelectedPin();
    if (l) setMsg(`Ponto ${l} adicionado — ${guideStore.active?.steps.length || 0} no total.`);
  }, [snap, tab]);  // eslint-disable-line react-hooks/exhaustive-deps
  const addNet = () => { const n = guideStore.addNetByName(progQ); setMsg(n ? `Net ${n} adicionada.` : `Não achei a net «${progQ}».`); if (n) setProgQ(''); };
  const addCI = () => { const k = guideStore.addComponentPins(); setMsg(k ? `${k} ponto(s) do CI adicionados.` : 'Clique num CI na placa primeiro.'); };

  const convert = () => {
    const r = guideStore.add(text);
    if (!r) { setMsg('Não achei passos. Use uma linha por passo: «01 PPBUS_AON».'); return; }
    setMsg(`Convertido: ${r.steps.length} passos${r.board ? ` para a placa ${r.board}` : ''}.`);
    setText(''); guideStore.open(r.id);
  };

  return (
    <div className="r2acv r2gd">
      <div className="r2gd-scroll">
      <div className="r2acv-title"><IconRoute size={16} /> Ponto a ponto</div>

      {!a ? (
        <>
          <div className="r2acv-section">
            <button className="r2acv-send r2meter-btn" disabled={!board} onClick={() => { guideStore.startProgramming(); setMsg('Clique nos pontos na placa ou no PDF, ou busque a net. Pegue o CI inteiro se quiser. Depois «Finalizar e medir».'); }}><IconPlayerPlay size={14} /> Programar os pontos a medir</button>
            <div className="r2acv-note">Monte a lista clicando nos pontos (placa ou PDF), buscando a net, ou pegando um CI inteiro. Depois começa a medir.</div>
          </div>
          <div className="r2acv-section">
            <b>Roteiros desta placa</b>
            {mine.length === 0 && <div className="r2acv-note">Nenhum roteiro para a placa aberta. Cole um abaixo.</div>}
            {mine.map(r => (
              <div key={r.id} className="r2gd-rot">
                <button className="r2gd-rot-open" onClick={() => guideStore.open(r.id)}><b>{r.title}</b><span className="r2hist-sub">{r.kind === 'analise' ? 'análise' : 'start'} · {r.steps.length} passos{r.credit ? ` · ${r.credit}` : ''}</span></button>
                <button className="r2meter-icon" title="Apagar roteiro" onClick={() => guideStore.remove(r.id)}><IconTrash size={14} /></button>
              </div>
            ))}
            {others.length > 0 && <details className="r2gd-others"><summary>Outros roteiros ({others.length})</summary>
              {others.map(r => (
                <div key={r.id} className="r2gd-rot">
                  <button className="r2gd-rot-open" onClick={() => guideStore.open(r.id)}><b>{r.title}</b><span className="r2hist-sub">{r.kind === 'analise' ? 'análise' : 'start'} · {r.steps.length} passos{r.credit ? ` · ${r.credit}` : ''}</span></button>
                  <button className="r2meter-icon" title="Apagar roteiro" onClick={() => guideStore.remove(r.id)}><IconTrash size={14} /></button>
                </div>
              ))}</details>}
          </div>
          <CreateOwn />
          <div className="r2acv-section">
            <b>Colar uma sequência pronta</b>
            <div className="r2acv-note">Cole o texto: 1ª linha com o modelo e a placa (ex.: «M1 820-02020»), depois um passo por linha («01 USBC0_CC1»). Vírgula separa nets do mesmo passo; parênteses viram observação.</div>
            <textarea className="r2gd-text" rows={9} value={text} onChange={e => setText(e.target.value)}
                      placeholder={'M1 820-02020\n01 USBC0_CC1\n02 PPVBUS_USBC0\n03 PP3V3_UPC0_LDO\n…'} />
            <button className="r2acv-send r2meter-btn" disabled={!text.trim()} onClick={convert}>Converter</button>
            {msg && <div className="r2acv-note">{msg}</div>}
          </div>
        </>
      ) : (
        <div className="r2acv-section">
          <div className="r2gd-head">
            <b>{a.title}</b>
            <button className="r2cv-link" onClick={() => { guideStore.stop(); guideStore.open(''); }}>trocar roteiro</button>
          </div>
          <div className="r2gd-viewseg">
            <button className={view === 'lista' ? 'on' : ''} onClick={() => setView('lista')}>Guiado</button>
            <button className={view === 'tabela' ? 'on' : ''} onClick={() => setView('tabela')}>Tabela</button>
            <button className={view === 'relatorio' ? 'on' : ''} onClick={() => setView('relatorio')}>Relatório</button>
          </div>
          {board ? <div className="r2acv-note">{found} de {a.steps.length} passos achados nesta placa{a.board && !matchesBoard(a, tab!.fileName) ? ` — atenção: o roteiro é da ${a.board}` : ''}.</div>
            : <div className="r2acv-note">Abra a placa para ver os pontos.</div>}
          {guideStore.programming ? (
            <div className="r2gd-prog">
              <div className="r2acv-note"><b>Programando os pontos.</b> Clique nos pontos na placa ou no PDF, busque a net, ou pegue o CI inteiro. {a.steps.length} ponto(s) na lista.</div>
              <div className="r2meter-actions">
                <input className="r2gd-progq" value={progQ} placeholder="Buscar net (ex.: PP5V_AON)" onChange={e => setProgQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addNet(); }} />
                <button className="r2meter-btn r2meter-off" disabled={!progQ.trim()} onClick={addNet}>＋ net</button>
                <button className="r2meter-btn r2meter-off" title="Mapear todos os pontos do CI selecionado na placa" onClick={addCI}>＋ CI selecionado</button>
              </div>
              <div className="r2meter-actions">
                <button className="r2acv-send r2meter-btn" disabled={!a.steps.length} onClick={() => guideStore.finishProgramming()}><IconPlayerPlay size={14} /> Finalizar e medir</button>
                <button className="r2meter-btn r2meter-off" onClick={() => guideStore.setProgramming(false)}>Pausar programação</button>
              </div>
            </div>
          ) : (
          <div className="r2meter-actions">
            {!guideStore.on
              ? <button className="r2acv-send r2meter-btn" disabled={!board} onClick={() => guideStore.start()}><IconPlayerPlay size={14} /> Ligar sequência</button>
              : <button className="r2meter-btn r2meter-off" onClick={() => guideStore.stop()}><IconPlayerStop size={14} /> Desligar</button>}
            {a.kind === 'analise' && <button className="r2meter-btn r2meter-off" title="Adicionar mais pontos clicando na placa/PDF" onClick={() => { guideStore.setProgramming(true); setMsg('Programando: clique nos pontos, busque a net ou pegue um CI. Depois «Finalizar e medir».'); }}>Programar pontos</button>}
          </div>
          )}
          {view === 'lista' && <>
          <label className="r2acv-check"><input type="checkbox" checked={guideStore.pdfFollow} onChange={e => guideStore.setPdfFollow(e.target.checked)} /> Esquemático junto: cada passo procura a net no PDF</label>
          <label className="r2acv-check"><input type="checkbox" checked={showNets} onChange={e => toggleNets(e.target.checked)} /> Mostrar os nomes das nets</label>
          <div className="r2meter-actions">
            <button className="r2meter-btn r2meter-off" title="Clique num pino na placa e aperte: vira um passo (a net dele, com esse pino como ponto)"
                    onClick={() => { const l = guideStore.addSelectedPin(); setMsg(l ? `Passo novo: ${l}` : 'Clique primeiro num pino na placa.'); }}>＋ Adicionar o pino selecionado como passo</button>
          </div>
          {a.steps.length === 0 && <div className="r2acv-note">Sequência vazia: clique num pino na placa e aperte «＋ Adicionar o pino selecionado». Repita na ordem da análise. Depois dá para editar cada passo (observação, valor esperado).</div>}
          <div className="r2acv-note">Com o multímetro ligado (aba Medições), cada leitura entra sozinha na coluna do passo atual (tensão, diodo ou resistência). Também dá para digitar.</div>
          <div className="r2acv-note">Com ele ligado: <b>→ ↓</b> próximo passo · <b>← ↑</b> anterior · <b>Tab</b> outro ponto da mesma net · <b>Esc</b> desliga.</div>
          <Credit />
          {seqWhereNow() === 'placa' && <div className="r2acv-note">Edições salvas junto do boardview (pasta da placa).</div>}
          {a.builtin && <div className="r2acv-note">Roteiro de fábrica da 2R. <button className="r2cv-link" onClick={() => guideStore.resetBuiltin()}>voltar ao original</button></div>}
          </>}
          {view === 'relatorio' ? <StepReport res={res} title={a.title} showNets={showNets} /> : view === 'tabela' ? <StepTable res={res} showNets={showNets} /> : <>
          <div className="r2gd-cols"><span>#</span><span>Net / ponto</span><span>Tensão</span><span>Diodo</span><span>Resist.</span></div>
          <div className="r2gd-steps">
            {res.map((r, i) => {
              const cur = i === guideStore.pos;
              return (
                <div key={i} role="button" tabIndex={-1} className={`r2gd-step ${cur ? 'cur' : ''} ${r.nets.length ? '' : 'miss'}`}
                     onClick={() => { if (editing === i) return; if (!guideStore.on) guideStore.start(); guideStore.go(i); }}>
                  <span className="r2gd-n">{String(r.step.n).padStart(2, '0')}</span>
                  <span className="r2gd-body">
                    <span className="r2gd-nets">{showNets ? (r.step.nets.join(', ') || <i>(passo vazio — clique em ✎)</i>) : (r.points[0]?.label || r.step.point || <i className="r2hist-sub">net oculta</i>)}</span>
                    {r.step.note && editing !== i && <span className="r2hist-sub">{r.step.note}</span>}
                  </span>
                  <Cell i={i} k="v" val={r.step.v} ph="V" />
                  <Cell i={i} k="d" val={r.step.d} ph="diodo" />
                  <Cell i={i} k="r" val={r.step.r} ph="Ω" />
                  {(cur || editing === i || r.missing.length > 0) && (
                    <div className="r2gd-extra" onClick={e => { if (editing === i || cur) e.stopPropagation(); }}>
                      {editing === i ? <StepEditor i={i} onDone={() => setEditing(null)} /> : (<>
                        {cur && r.points.length > 0 && (
                          <span className="r2gd-pts">
                            {r.points.slice(0, 6).map((p, k) => (
                              <span key={k} role="button" className={`r2gd-pt ${k === guideStore.pointIdx % r.points.length ? 'sel' : ''} ${p.fixed ? 'fixed' : ''}`}
                                    title={p.fixed ? 'Ponto escolhido à mão' : ''}
                                    onClick={e => { e.stopPropagation(); guideStore.usePoint(k); }}>{p.fixed ? '◆ ' : ''}{p.label} · {KIND[p.kind]}</span>
                            ))}
                            {r.points.length > 6 && <span className="r2hist-sub">+{r.points.length - 6}</span>}
                          </span>
                        )}
                        {r.missing.length > 0 && <span className="r2gd-miss">não achei nesta placa: {r.missing.join(', ')}</span>}
                        {cur && (
                          <span className="r2gd-tools">
                            <button title="Editar este passo" onClick={() => setEditing(i)}>✎ editar</button>
                            <button title="Usar o pino selecionado na placa como ponto deste passo" onClick={() => { const l = guideStore.pinSelectedAsPoint(i); setMsg(l ? `Ponto do passo ${r.step.n}: ${l}` : 'Clique primeiro no pino na placa.'); }}>◆ fixar pino selecionado</button>
                            {r.step.point && <button title="Voltar a escolher o ponto sozinho" onClick={() => guideStore.clearPoint(i)}>automático</button>}
                            <button title="Subir" onClick={() => guideStore.moveStep(i, -1)}>↑</button>
                            <button title="Descer" onClick={() => guideStore.moveStep(i, 1)}>↓</button>
                            <button title="Novo passo depois deste" onClick={() => { guideStore.insertStep(i); setEditing(i + 1); }}>+ passo</button>
                            <button title="Apagar este passo" onClick={() => guideStore.deleteStep(i)}>apagar</button>
                          </span>
                        )}
                      </>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </>}
          {msg && <div className="r2acv-note">{msg}</div>}
        </div>
      )}
      </div>
    </div>
  );
}
