/* 2R Tools — Perguntas-chave por família (Roger, 24/10/2026: «em cima dos estudos que já fizemos, revisa as perguntas das
 * tensões e sinais importantes para cada família»). Aparecem antes dos passos quando um estudo começa no ponto a ponto.
 * Os valores vêm dos próprios estudos da família (notas «Esperado») e do nome da linha (PP3V3 = 3,3 V). Onde a placa muda
 * (número de células da bateria, tipo de memória), a pergunta diz isso em vez de cravar um número. */
(function () {
  'use strict';
  if (window.__r2Perg) return; window.__r2Perg = 1;

  var FAM = {
    c2d: {
      nome: 'Intel Core 2 Duo + NVIDIA MCP (MagSafe 1)',
      perguntas: [
        { q: 'O LED do MagSafe acende?', nets: [], esp: 'Acende (verde ou laranja).', nao: 'Apagado: comece pela PP3V42_G3H e pelo carregador (SMC_BC_ACOK).' },
        { q: 'Tem tensão na PPBUS_G3H?', nets: ['PPBUS_G3H'], esp: 'Na faixa da bateria do modelo: 2 células até ~8,4 V; 3 células ~12,6 V (veja o diagrama da placa).', nao: 'Sem PPBUS: carregador (ISL…/MAX…), fusível e MOSFETs de entrada.' },
        { q: 'A PP3V42_G3H está em 3,42 V?', nets: ['PP3V42_G3H'], esp: '~3,42 V.', nao: 'Sem 3,42 V o SMC não liga: regulador da G3H e curto na linha.' },
        { q: 'O SMC_RESET_L está alto?', nets: ['SMC_RESET_L'], esp: 'Alto, ~3,42 V (pull-up na PP3V42_G3H).', nao: 'Baixo = SMC preso em reset (supervisor de reset, cristal do SMC).' },
        { q: 'O SMC_BC_ACOK está alto com o carregador?', nets: ['SMC_BC_ACOK'], esp: 'Alto com o carregador ligado.', nao: 'O carregador não avisa o SMC: confira a entrada DCIN.' },
        { q: 'O RSMRST está liberado?', nets: ['RSMRST_PWRGD', 'PM_RSMRST_L'], esp: 'Os dois altos (~3,42 V e ~3,3 V).', nao: 'Falta alguma tensão de standby (S5).' },
        { q: 'A PP3V3_S5 está presente?', nets: ['PP3V3_S5'], esp: '~3,3 V.', nao: 'Regulador do S5 e enable vindo do SMC.' },
        { q: 'O botão chega no SMC?', nets: ['SMC_ONOFF_L', 'PM_PWRBTN_L'], esp: 'SMC_ONOFF_L alto ~3,42 V e vai a 0 V enquanto aperta; PM_PWRBTN_L dá um pulso baixo.', nao: 'Flex/teclado, resistor da linha ou SMC.' },
        { q: 'Depois do botão, os SLP sobem?', nets: ['PM_SLP_S4_L', 'PM_SLP_S3_L'], esp: 'Altos, ~3,3 V.', nao: 'O MCP não sai do standby: RSMRST, clock e o próprio MCP.' },
        { q: 'As tensões S3 aparecem?', nets: ['PP5V_S3', 'PP3V3_S3'], esp: '~5 V e ~3,3 V; a memória na tensão da placa (1,5 V ou 1,8 V, veja o esquema).', nao: 'Enables do S3 e curto nas linhas.' },
        { q: 'As tensões S0 aparecem?', nets: ['PP5V_S0', 'PP3V3_S0'], esp: '~5 V e ~3,3 V (as outras S0 pelo nome da linha).', nao: 'Enables do S0; procure a que falta no power good.' },
        { q: 'O ALL_SYS_PWRGD está alto?', nets: ['ALL_SYS_PWRGD'], esp: 'Alto.', nao: 'Baixo = alguma tensão S0 ou da GPU sem power good.' }
      ]
    },
    unibody: {
      nome: 'Intel Arrandale / Sandy Bridge / Ivy Bridge (SMC + PCH, MagSafe)',
      perguntas: [
        { q: 'O LED do MagSafe acende?', nets: [], esp: 'Acende (verde ou laranja).', nao: 'Apagado: PP3V42_G3H e entrada do carregador.' },
        { q: 'O carregador entrou na placa?', nets: ['PPDCIN_G3H', 'CHGR_ACIN'], esp: 'PPDCIN_G3H com a tensão da fonte (~14,5 a 16,5 V, conforme o modelo); CHGR_ACIN acima de 3,2 V.', nao: 'Conector/placa do MagSafe, fusível e diodo de entrada.' },
        { q: 'Tem tensão na PPBUS_G3H?', nets: ['PPBUS_G3H'], esp: '~12,6 V (3 células; com bateria fica entre 9 e 12,6 V).', nao: 'Carregador e MOSFETs de entrada; curto na PPBUS.' },
        { q: 'A PP3V42_G3H está em 3,42 V e o SMC fora de reset?', nets: ['PP3V42_G3H', 'SMC_RESET_L'], esp: 'PP3V42_G3H ~3,42 V; SMC_RESET_L alto ~3,42 V.', nao: 'Sem 3,42 V ou reset baixo = o SMC não trabalha.' },
        { q: 'O SMC_BC_ACOK está alto?', nets: ['SMC_BC_ACOK'], esp: 'Alto com o carregador ligado.', nao: 'O carregador não avisa o SMC.' },
        { q: 'O standby (S5) está completo?', nets: ['PP5V_S5', 'PP3V3_S5'], esp: '~5 V e ~3,3 V.', nao: 'Regulador do S5 (P3V3S5_EN / P5VS5_EN altos?).' },
        { q: 'O PM_RSMRST_L está alto?', nets: ['PM_RSMRST_L'], esp: 'Alto, ~3,3 V (pull-up na PP3V3_SUS).', nao: 'Falta tensão SUS/S5: a ponte (PCH) não sai do reset.' },
        { q: 'O botão chega no SMC e na ponte?', nets: ['SMC_ONOFF_L', 'PM_PWRBTN_L'], esp: 'SMC_ONOFF_L alto ~3,42 V e 0 V enquanto aperta; PM_PWRBTN_L pulso baixo.', nao: 'Flex do teclado/botão, SMC.' },
        { q: 'Depois do botão, os SLP sobem?', nets: ['PM_SLP_S5_L', 'PM_SLP_S4_L', 'PM_SLP_S3_L'], esp: 'Os três altos, ~3,3 V.', nao: 'A ponte não sai do standby: RSMRST, clock 32 kHz, PCH.' },
        { q: 'A memória tem tensão?', nets: ['PP1V5_S3', 'PP0V75_S0_DDRVTT'], esp: 'PP1V5_S3 ~1,5 V (1,35 V em DDR3L); VTT ~0,75 V com MEMVTT_EN alto.', nao: 'DDRREG_EN / MEMVTT_EN e curto na memória.' },
        { q: 'As tensões S0 aparecem?', nets: ['PP5V_S0', 'PP3V3_S0', 'PP1V8_S0', 'PP1V05_S0'], esp: '~5 V, ~3,3 V, ~1,8 V e ~1,05 V.', nao: 'Enables do S0 e a linha que falta.' },
        { q: 'Os power good estão altos?', nets: ['ALL_SYS_PWRGD', 'PM_PCH_PWROK', 'CPU_PWRGD'], esp: 'Altos.', nao: 'ALL_SYS_PWRGD baixo = alguma tensão S0 sem power good.' },
        { q: 'O PLT_RESET_L saiu do reset?', nets: ['PLT_RESET_L'], esp: 'Alto, ~3,3 V.', nao: 'Baixo = a ponte (PCH) segurando o reset.' }
      ]
    },
    haswell: {
      nome: 'Intel Haswell / Broadwell (Retina e Air com MagSafe 2; A1534)',
      perguntas: [
        { q: 'O carregador entrou na placa?', nets: ['PPDCIN_G3H', 'CHGR_ACIN', 'PP5V1_CHGR_VDD'], esp: 'PPDCIN_G3H com a tensão da fonte; CHGR_ACIN acima de 3,2 V; PP5V1_CHGR_VDD ~5,1 V. (A1534: 5 V ao plugar, 20 V depois de negociar.)', nao: 'Entrada do MagSafe / USB-C, fusível e o carregador.' },
        { q: 'Tem tensão na PPBUS_G3H?', nets: ['PPBUS_G3H'], esp: 'Pro Retina (A1398/A1502): ~12,6 V (3 células). Air e 12" (A1465/A1466/A1534): ~8,6 V (2 células). Com o SMC desligado pode ficar um pouco abaixo (ex.: 12,23 V em vez de 12,56 V).', nao: 'Carregador, MOSFETs de entrada e curto na PPBUS.' },
        { q: 'A PP3V42_G3H está em 3,42 V e o SMC fora de reset?', nets: ['PP3V42_G3H', 'SMC_RESET_L'], esp: '3,42 V; SMC_RESET_L alto.', nao: 'Sem 3,42 V ou reset baixo = o SMC não trabalha.' },
        { q: 'O standby (S5) está completo?', nets: ['PP5V_S5', 'PP3V3_S5', 'S5_PWRGD', 'PM_DSW_PWRGD'], esp: 'PP5V_S5 5 V e PP3V3_S5 3,3 V; S5_PWRGD alto vai para o EC e PM_DSW_PWRGD para a ponte.', nao: 'Regulador do S5 e enables (SMC_PM_G2_EN, S5_PWR_EN).' },
        { q: 'O PM_RSMRST_L está alto?', nets: ['PP3V3_SUS', 'PM_RSMRST_L'], esp: 'PP3V3_SUS ~3,3 V; o PM_RSMRST_L sobe quando a PP3V3_SUS passa de ~3,07 V. Aí o standby está completo.', nao: 'PP3V3_SUS / PP1V05_SUS e o supervisor do RSMRST.' },
        { q: 'O botão chega no SMC e na ponte?', nets: ['SMC_ONOFF_L', 'PM_PWRBTN_L'], esp: 'SMC_ONOFF_L vai a 0 V ao apertar; PM_PWRBTN_L alto (~3,3 V) em repouso.', nao: 'Flex do teclado/botão, SMC.' },
        { q: 'Depois do botão, os SLP sobem em sequência?', nets: ['PM_SLP_S5_L', 'PM_SLP_S4_L', 'PM_SLP_S3_L'], esp: 'Os três sobem (~3,3 V) em sequência.', nao: 'A ponte não sai do standby.' },
        { q: 'A memória tem tensão e power good?', nets: ['PP1V35_S3', 'PP1V2_S3', 'DDRREG_PGOOD'], esp: 'DDR3L: PP1V35_S3 ~1,35 V. LPDDR3: PP1V2_S3 ~1,2 V. DDRREG_PGOOD alto. VTT pelo nome da linha (0,675 V ou 0,6 V).', nao: 'Enables do S3 (S4_PWR_EN, P3V3S3_EN) e curto na memória.' },
        { q: 'As tensões S0 aparecem?', nets: ['PP5V_S0', 'PP3V3_S0', 'PP1V05_S0', 'PP1V5_S0'], esp: '~5 V, ~3,3 V, ~1,05 V e ~1,5 V.', nao: 'Enables do S0 e a linha que falta.' },
        { q: 'O processador tem alimentação (VCCIN)?', nets: ['CPUVR_PHASE1'], esp: 'Por volta de 1,8 V (o estudo mediu 1,85–1,95 V no indutor da fase).', nao: 'Controlador do VCore, CPUVR_PGOOD e enables.' },
        { q: 'Os power good e o reset estão altos?', nets: ['ALL_SYS_PWRGD', 'PLT_RESET_L'], esp: 'Altos (~3,3 V).', nao: 'Baixo = alguma tensão S0 sem power good, ou a ponte segurando o reset.' }
      ]
    },
    usbc1617: {
      nome: 'Intel 2016–2017 com USB-C (CD3215 + ISL9239; T1 nas A1706/A1707)',
      perguntas: [
        { q: 'O que o medidor USB-C mostra?', nets: ['PP20V_USBC_XA_VBUS', 'PPDCIN_G3H'], esp: '5 V ao plugar; 20 V depois da negociação. No fim: ~20 V e 0,6–0,8 A = negociação ok.', nao: 'Parado em 5 V = não negociou: CD3215 (LDOs abaixo), MOSFETs de entrada (UPC_XA_GATE1).' },
        { q: 'Os LDOs do CD3215 estão certos?', nets: ['PP3V3_UPC_XA_LDO', 'PP1V8_UPC_XA_LDOA', 'PP1V1_UPC_XA_LDO_BMC'], esp: '~3,3 V, ~1,8 V e ~1,1 V.', nao: 'CD3215 sem LDO = chip ou firmware (SPI do CD3215).' },
        { q: 'Tem tensão na PPBUS_G3H?', nets: ['PPBUS_G3H'], esp: 'Cerca de 13 V (o diagrama mede 13 V).', nao: 'ISL9239, sense e MOSFETs; curto na PPBUS.' },
        { q: 'As tensões G3H estão presentes?', nets: ['PP3V3_G3H', 'PP3V0_G3H'], esp: '~3,3 V e ~3,0 V (pelo nome da linha).', nao: 'Regulador da G3H (PM_EN_P3V3_G3H alto?).' },
        { q: 'O SMC está rodando?', nets: ['SMC_RESET_L', 'SYSCLK_CLK12M_SMC'], esp: 'SMC_RESET_L alto; clock de 12 MHz no SMC.', nao: 'Reset baixo ou sem clock: SMC_CLK12M_EN e o oscilador.' },
        { q: 'O standby (S5/SUS) está completo?', nets: ['PP5V_S5', 'PP3V3_S5', 'PP3V3_SUS', 'PP1V8_SUS', 'PP1V0_SUS'], esp: '5 V, 3,3 V, 3,3 V, 1,8 V e 1,0 V; PM_DSW_PWRGD alto e clock de 32,768 kHz (SYSCLK_CLK32K_PCH).', nao: 'O regulador que falta e o power good dele (P3V3SUS_PGOOD, P1VSUS_PGOOD).' },
        { q: 'O PM_RSMRST_L está alto?', nets: ['PM_RSMRST_L'], esp: 'Alto, ~3,3 V (pull-up na PP3V3_SUS).', nao: 'A ponte não sai do reset: falta alguma SUS.' },
        { q: 'O botão (ou a tampa) chega no SMC?', nets: ['SMC_ONOFF_L', 'PM_PWRBTN_L'], esp: 'SMC_ONOFF_L vai a 0 V ao apertar (botão ou sensor hall); PM_PWRBTN_L alto (~3,3 V) em repouso.', nao: 'Touch ID/botão, flex, sensor hall.' },
        { q: 'Depois do botão, os SLP sobem?', nets: ['PM_SLP_S5_L', 'PM_SLP_S4_L', 'PM_SLP_S3_L'], esp: 'Altos.', nao: 'A ponte não sai do standby.' },
        { q: 'A memória (LPDDR3) tem tensão?', nets: ['PP1V2_S3', 'PP1V8_S3', 'PP0V6_S0_DDRVTT'], esp: '~1,2 V, ~1,8 V e VTT ~0,6 V (PM_MEMVTT_EN alto).', nao: 'Enables do S3 e curto na memória.' },
        { q: 'As tensões S0 aparecem?', nets: ['PP5V_S0', 'PP3V3_S0', 'PP1V8_S0', 'PP1V2_S0SW', 'PP1V0_S0SW'], esp: '5 V, 3,3 V, 1,8 V, 1,2 V e 1,0 V.', nao: 'Enables do S0 e a linha que falta.' },
        { q: 'Os power good e o reset estão altos?', nets: ['ALL_SYS_PWRGD', 'CPUVR_PGOOD', 'PM_PCH_PWROK', 'PLT_RST_L'], esp: 'Todos altos.', nao: 'Procure a linha sem power good; PLT_RST_L baixo = ponte segurando o reset.' }
      ]
    },
    t2: {
      nome: 'Intel com T2 (2018–2020, CD3217)',
      perguntas: [
        { q: 'O que o medidor USB-C mostra?', nets: ['PP20V_USBC_XA_VBUS', 'PPDCIN_G3H'], esp: '5 V antes de negociar; 20 V depois.', nao: 'Parado em 5 V = não negociou: CD3217 (LDOs abaixo) ou o T2.' },
        { q: 'Os LDOs do CD3217 estão certos?', nets: ['PP3V3_UPC_XA_LDO', 'PP1V8_UPC_XA_LDOA', 'PP1V1_UPC_XA_LDO_BMC'], esp: '~3,3 V, ~1,8 V e ~1,1 V.', nao: 'CD3217 sem LDO = chip, alimentação dele ou firmware.' },
        { q: 'Tem tensão na PPBUS_G3H?', nets: ['PPBUS_G3H'], esp: '12,60–12,65 V é normal. Com 5 V na entrada o ISL9240 já eleva para ~12 V.', nao: 'ISL9240, resistores de medição (1 Ω cada, 5–10%) e curto na PPBUS.' },
        { q: 'O RTC e a G3H do T2 estão presentes?', nets: ['PP3V3_G3H_RTC', 'PP3V0_G3H_RTC', 'PP3V3_G3H_PMU_VDDMAIN'], esp: 'RTC ~3,3 V (nas 15": PP3V0_G3H_RTC ~3,0 V); VDDMAIN 3,290–3,425 V.', nao: 'Reguladores da G3H e curto nas linhas.' },
        { q: 'As tensões do T2 (SLPS2R) estão certas?', nets: ['PP1V8_SLPS2R', 'PP0V8_SLPS2R', 'PP1V1_SLPS2R'], esp: '~1,8 V, ~0,8 V e ~1,1 V.', nao: 'PMU do T2 (U7800 nas 15"); compare os valores de diodo do estudo.' },
        { q: 'A memória do T2 (SLPDDR) está certa?', nets: ['PP0V9_SLPDDR', 'PP0V82_SLPDDR', 'PP1V1_SLPDDR'], esp: '~0,9 V, ~0,82 V e ~1,1 V.', nao: 'Curto entre o T2 e a RAM dele, ou pino rompido: use os valores de diodo do estudo.' },
        { q: 'Os clocks estão oscilando?', nets: ['PMU_CLK32K_SOC', 'SOC_XTAL24M_IN'], esp: '32 kHz e 24 MHz.', nao: 'Cristal e PMU.' },
        { q: 'O Mac aparece em DFU (Revive/Restore)?', nets: [], esp: 'Aparece na porta DFU do modelo.', nao: 'Não aparece = T2 sem tensão, sem clock ou o CD3217 da porta DFU.' },
        { q: 'O SSD (NAND) tem tensão?', nets: ['PP2V5_NAND_SSD0', 'PP1V8_SSD0', 'PP0V9_SSD0'], esp: '~2,5 V, ~1,8 V e ~0,9 V. Resistência da 2V5 para o terra acima de 60 Ω (ideal acima de 1 kΩ); diodo 0,400–0,500.', nao: 'Curto na NAND ou regulador do SSD.' },
        { q: 'O lado Intel (S5/S3/S0) sobe?', nets: ['PP3V3_S5', 'PP1V8_S5', 'PP1V2_S3', 'PP0V6_S0_DDRVTT', 'PP1V05_S0SW'], esp: '3,3 V, 1,8 V, 1,2 V, 0,6 V e 1,05 V (clock da ponte 24 MHz no PCH_CLK24M_XTALIN).', nao: 'O regulador que falta e o enable dele.' },
        { q: 'Tem imagem / luz de fundo?', nets: ['PPVOUT_S0_LCDBKLT', 'EDP_BKLT_EN'], esp: 'Com a tela ligada: 49–55 V no backlight e EDP_BKLT_EN ~3,3 V.', nao: 'Com 49–55 V presentes a tela pode estar ruim (nem sempre; pode ser comunicação). Sem tensão: fusível F8400 (PPVIN igual à PPBUS dos dois lados).' }
      ]
    },
    as: {
      nome: 'Apple Silicon (M1 / M1 Pro / M2 / M3)',
      perguntas: [
        { q: 'O que o medidor USB-C mostra?', nets: ['PPVBUS_USBC0', 'PPDCIN_AON'], esp: '5 V antes de subir; 20 V depois de negociar.', nao: 'Parado em 5 V = não negociou: CD3217 (LDOs abaixo), PP3V8_AON.' },
        { q: 'Tem tensão na PPBUS_AON?', nets: ['PPBUS_AON'], esp: '12,6 a 13,1 V com a fonte ligada.', nao: 'Carregador, resistores de medição (~1,00 Ω, 5–10%) e curto na PPBUS.' },
        { q: 'A PP3V8_AON está em 3,8 V?', nets: ['PP3V8_AON', 'PP3V8_AON_VDDMAIN'], esp: '~3,8 V. Diodo da VDDMAIN para o terra perto de 0,350.', nao: 'Sem ela a placa nem entra em DFU (CHGR_EN_MVR / P3V8AON_PWR_EN).' },
        { q: 'Os LDOs do CD3217 estão certos?', nets: ['PP3V3_UPC0_LDO', 'PP1V5_UPC0_LDO_CORE'], esp: '~3,3 V e ~1,5 V em cada CD3217; diodo perto de 0,500 e 0,510.', nao: 'CD3217 da porta, alimentação dele (PP3V3_S2_UPC).' },
        { q: 'As tensões AON estão presentes?', nets: ['PP3V3_AON', 'PP1V8_AON'], esp: '~3,3 V e ~1,8 V.', nao: 'PMU (MPMU) e curto nas linhas.' },
        { q: 'Os clocks estão oscilando?', nets: ['PMU_CLK32K_SOC', 'SOC_XTAL24M_IN'], esp: '32,768 kHz (PMU) e 24 MHz (SoC).', nao: 'Cristal e PMU.' },
        { q: 'O Mac aparece em DFU (Revive/Restore)?', nets: [], esp: 'Aparece na porta DFU do modelo.', nao: 'Não aparece: PP3V8_AON, clocks, PMU ou o SoC.' },
        { q: 'As tensões S2 sobem?', nets: ['PP5V_S2', 'PP3V3_S2', 'PP1V8_S2', 'PP1V2_S2', 'PP1V25_S2'], esp: '~5 V (5,14 V ±5%), ~3,3 V, ~1,8 V, ~1,2 V e ~1,25 V.', nao: 'O regulador que falta e o enable dele (P5VS2_EN…).' },
        { q: 'As tensões AWAKE sobem?', nets: ['PP1V8_AWAKE', 'PP1V25_AWAKE_IO'], esp: '~1,8 V e ~1,25 V.', nao: 'PMU e o power good da etapa anterior.' },
        { q: 'As linhas do processador estão sem curto?', nets: ['PPVDD_PCPU_AWAKE', 'PPVDD_GPU_AWAKE', 'PPVDD_SOC_S1'], esp: 'Compare o diodo e a resistência com os valores do estudo da placa (são baixos por natureza).', nao: 'Valor bem abaixo do estudo: procure o capacitor em curto com a câmera térmica.' }
      ]
    }
  };

  function chave(fam) {
    var t = String(fam || '').toLowerCase();
    if (!t) return '';
    if (/apple silicon|\bm[123]\b/.test(t)) return 'as';
    if (/t2/.test(t)) return 't2';
    if (/t1|2016\/2017|skylake|kaby/.test(t)) return 'usbc1617';
    if (/core 2|mcp/.test(t)) return 'c2d';
    if (/haswell|broadwell|retina 2013/.test(t)) return 'haswell';
    if (/arrandale|sandy|ivy|unibody/.test(t)) return 'unibody';
    return '';
  }
  window.__r2PergFam = FAM; window.__r2PergChave = chave;

  // ── dados dos estudos (família e placas) ──
  var ROWS = null, PORPLACA = {};
  function api() { return window.__2rMeterApi || null; }
  function carregar(cb) {
    if (ROWS) { cb(); return; }
    var a = api(); if (!a || !a.estudosTodos) { cb(); return; }
    a.estudosTodos().then(function (j) {
      ROWS = (j && j.rows) || [];
      ROWS.forEach(function (r) { var k = chave(r.familia); if (k) (r.placas || []).forEach(function (p) { PORPLACA[String(p).toUpperCase()] = k; }); });
      cb();
    }).catch(function () { ROWS = []; cb(); });
  }
  function famDoEstudo(id) {
    var r = (ROWS || []).filter(function (x) { return x.id === id; })[0]; if (!r) return '';
    var k = chave(r.familia); if (k) return k;
    var ps = r.placas || []; for (var i = 0; i < ps.length; i++) { var kk = PORPLACA[String(ps[i]).toUpperCase()]; if (kk) return kk; }
    return '';
  }

  // ── tela ──
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function css() {
    if (document.getElementById('r2perg-css')) return;
    var st = document.createElement('style'); st.id = 'r2perg-css';
    st.textContent =
      '#r2perg{position:fixed;z-index:9500;width:460px;max-width:calc(100vw - 40px);max-height:84vh;display:flex;flex-direction:column;background:#121417;color:#F4F5F6;' +
      'border:1px solid rgba(255,255,255,.85);border-radius:10px;box-shadow:0 14px 40px rgba(0,0,0,.55);font:13px/1.4 Inter,-apple-system,"Segoe UI",sans-serif}' +
      '#r2perg .hd{padding:12px 14px 8px;border-bottom:1px solid #2B2F35;display:flex;gap:8px;align-items:flex-start}' +
      '#r2perg .hd h3{margin:0;font-size:14px;font-weight:700;flex:1 1 auto}#r2perg .hd small{display:block;color:#A3A9B1;font-weight:400;font-size:12px;margin-top:2px}' +
      '#r2perg .x{background:none;border:0;color:#A3A9B1;font-size:18px;cursor:pointer;line-height:1}' +
      '#r2perg .ls{overflow:auto;padding:8px 12px;flex:1 1 auto;min-height:0}' +
      '#r2perg .it{border:1px solid #2B2F35;border-radius:8px;padding:8px 10px;margin:0 0 8px;background:#181B1F}' +
      '#r2perg .it.sim{border-color:rgba(111,174,125,.7)}#r2perg .it.nao{border-color:rgba(232,161,58,.85)}' +
      '#r2perg .q{font-weight:700}#r2perg .q b{color:#D4B26A;margin-right:6px}' +
      '#r2perg .nets{font:11px Menlo,Consolas,monospace;color:#A3A9B1;margin-top:2px;word-break:break-all}' +
      '#r2perg .nets span{cursor:pointer;text-decoration:underline dotted}#r2perg .nets span:hover{color:#fff}' +
      '#r2perg .esp{color:#8fcf9c;margin-top:4px}#r2perg .dica{color:#E8A13A;margin-top:4px;display:none}#r2perg .it.nao .dica{display:block}' +
      '#r2perg .bt{display:flex;gap:6px;margin-top:6px;align-items:center}' +
      '#r2perg .bt button{background:#000;color:#E6E8EB;border:1px solid #3A3F46;border-radius:6px;padding:3px 10px;font:inherit;font-size:12px;cursor:pointer}' +
      '#r2perg .bt button.on{border-color:rgba(255,255,255,.85);color:#D4B26A}' +
      '#r2perg .bt input{flex:1 1 auto;min-width:0;background:#0B0C0E;color:#F4F5F6;border:1px solid #2B2F35;border-radius:6px;padding:3px 8px;font:inherit;font-size:12px}' +
      '#r2perg .ft{padding:10px 12px;border-top:1px solid #2B2F35;display:flex;gap:8px;align-items:center;justify-content:space-between}' +
      '#r2perg .ft label{color:#A3A9B1;font-size:12px;display:flex;gap:6px;align-items:center}' +
      '#r2perg .go{background:#000;color:#fff;border:1px solid rgba(255,255,255,.85);border-radius:6px;padding:7px 14px;font:inherit;font-weight:700;cursor:pointer}' +
      '#r2perg-reabrir{position:fixed;z-index:9400;bottom:44px;background:#000;color:#D4B26A;border:1px solid rgba(255,255,255,.85);border-radius:16px;padding:4px 12px;font:12px Inter,-apple-system,sans-serif;cursor:pointer;display:none}' +
      'body.r2-est-run #r2perg-reabrir.tem{display:block}';
    document.head.appendChild(st);
  }
  function ler(id) { try { return JSON.parse(localStorage.getItem('r2perg:' + id) || 'null') || {}; } catch (e) { return {}; } }
  function gravar(id, d) { try { d.t = Date.now(); localStorage.setItem('r2perg:' + id, JSON.stringify(d)); } catch (e) {} }
  function posicao(el) {
    var x = 60;
    var sb = document.querySelector('.sidebar'), r = sb && sb.getBoundingClientRect();
    if (r && r.width > 120) x = r.right + 12; else { var rail = document.querySelector('.activity-rail'), rr = rail && rail.getBoundingClientRect(); if (rr) x = rr.right + 12; }
    el.style.left = Math.round(Math.min(x, window.innerWidth - el.offsetWidth - 12)) + 'px';
    el.style.top = '72px';
  }
  var BOX = null;
  function fechar() { if (BOX) { BOX.remove(); BOX = null; } }
  function abrir(id, k, titulo) {
    var f = FAM[k]; if (!f) return; css(); fechar();
    var R = ler(id); R.r = R.r || {}; R.v = R.v || {};
    BOX = document.createElement('div'); BOX.id = 'r2perg';
    var h = '<div class="hd"><h3>Antes dos passos: perguntas-chave<small>' + esc(f.nome) + (titulo ? ' · ' + esc(titulo) : '') +
      '. Responda o que já mediu; nada é obrigatório.</small></h3><button class="x" title="Fechar">×</button></div><div class="ls">';
    f.perguntas.forEach(function (p, i) {
      var st = R.r[i] || '';
      h += '<div class="it ' + st + '" data-i="' + i + '"><div class="q"><b>' + (i + 1) + '</b>' + esc(p.q) + '</div>' +
        (p.nets.length ? '<div class="nets">' + p.nets.map(function (n) { return '<span data-net="' + esc(n) + '" title="Mostrar na placa">' + esc(n) + '</span>'; }).join(' · ') + '</div>' : '') +
        '<div class="esp">Esperado: ' + esc(p.esp) + '</div><div class="dica">Se não: ' + esc(p.nao) + '</div>' +
        '<div class="bt"><button data-r="sim"' + (st === 'sim' ? ' class="on"' : '') + '>Sim</button><button data-r="nao"' + (st === 'nao' ? ' class="on"' : '') + '>Não</button>' +
        '<button data-r=""' + (!st ? ' class="on"' : '') + '>Não medi</button><input placeholder="valor medido (opcional)" value="' + esc(R.v[i] || '') + '"></div></div>';
    });
    h += '</div><div class="ft"><label><input type="checkbox" class="nm"' + (R.pular ? ' checked' : '') + '> Não abrir sozinho neste estudo</label><button class="go">Começar os passos ▶</button></div>';
    BOX.innerHTML = h; document.body.appendChild(BOX); posicao(BOX);
    BOX.querySelector('.x').onclick = fechar; BOX.querySelector('.go').onclick = fechar;
    BOX.querySelector('.nm').onchange = function (e) { R.pular = !!e.target.checked; gravar(id, R); };
    BOX.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-r]'), n = e.target.closest('[data-net]');
      if (n) { try { var U = window.__2rBoardGet && window.__2rBoardGet(); if (U && U.highlightNet) U.highlightNet(n.getAttribute('data-net')); } catch (e2) {} return; }
      if (!b) return; var it = b.closest('.it'), i = +it.getAttribute('data-i'), v = b.getAttribute('data-r');
      R.r[i] = v; gravar(id, R);
      it.classList.toggle('sim', v === 'sim'); it.classList.toggle('nao', v === 'nao');
      it.querySelectorAll('button[data-r]').forEach(function (x) { x.classList.toggle('on', x === b); });
    });
    BOX.addEventListener('input', function (e) {
      if (e.target.tagName !== 'INPUT' || e.target.type === 'checkbox') return;
      var i = +e.target.closest('.it').getAttribute('data-i'); R.v[i] = e.target.value; gravar(id, R);
    });
  }
  // botão para reabrir enquanto o estudo roda
  var REA = null, ATUAL = { id: '', k: '', tit: '' }, VISTO = {};
  function reabrir() {
    if (!REA) {
      css(); REA = document.createElement('button'); REA.id = 'r2perg-reabrir'; REA.textContent = 'Perguntas-chave';
      REA.title = 'Perguntas de tensões e sinais importantes desta família'; REA.onclick = function () { if (ATUAL.k) abrir(ATUAL.id, ATUAL.k, ATUAL.tit); };
      document.body.appendChild(REA);
    }
    var rail = document.querySelector('.activity-rail'), rr = rail && rail.getBoundingClientRect();
    REA.style.left = Math.round((rr ? rr.right : 0) + 10) + 'px';
    REA.classList.toggle('tem', !!ATUAL.k);
  }
  setInterval(function () {
    var run = window.__r2EstRun, on = document.body && document.body.classList.contains('r2-est-run');
    if (!on || !run || !run.id) { if (REA) REA.classList.remove('tem'); if (!on) fechar(); return; }
    if (ATUAL.id !== run.id) {
      ATUAL = { id: run.id, k: '', tit: run.tema || '' };
      carregar(function () {
        if (ATUAL.id !== run.id) return;
        ATUAL.k = famDoEstudo(run.id); reabrir();
        if (ATUAL.k && !VISTO[run.id] && !ler(run.id).pular) { VISTO[run.id] = 1; abrir(run.id, ATUAL.k, ATUAL.tit); }
      });
    } else reabrir();
  }, 500);
})();
