import { AtributoChave } from './types';

export interface TraitModifiers {
  modPv: number;
  modPe: number;
  modDesl: number;
  modRd: number;
  modCargaFor: number;
  modIniciativa: number;
  modAtributos: Partial<Record<AtributoChave, number>>;
  modPericias: Record<string, number>;
  logs: string[];
  erros: string[];
}

/**
 * Motor de Execução de Scripts e Códigos para Traços (Motor +2D6)
 * Suporta tanto sintaxe de programação imperativa quanto sintaxe declarativa em linha:
 *
 * Exemplos aceitos:
 *   PV += 10;
 *   PE += 5; // Pontos de Esforço
 *   DESLOCAMENTO += 2.0; (ou DESL += 2)
 *   RD += 4; // Redução de Dano
 *   CARGA_FOR += 3; (ou CARGA += 3)
 *   INICIATIVA += 2; (ou INIC += 2)
 *   FOR += 1;
 *   DES += 2;
 *   CON += 1;
 *   INT += 0;
 *   SAB += 1;
 *   CAR += 1;
 *   PERICIA.Furtividade += 2;
 *   PERICIA["Primeiros Socorros"] += 3;
 *
 * Ou formato shorthand:
 *   PV: +10
 *   PE: +5
 *   RD: +4
 *   DESL: +2
 *   CARGA: +3
 *   PERICIA: Furtividade +2
 */
export function executarScriptTraco(script: string | undefined | null): TraitModifiers {
  const resultado: TraitModifiers = {
    modPv: 0,
    modPe: 0,
    modDesl: 0,
    modRd: 0,
    modCargaFor: 0,
    modIniciativa: 0,
    modAtributos: {},
    modPericias: {},
    logs: [],
    erros: []
  };

  if (!script || typeof script !== 'string') {
    return resultado;
  }

  const linhas = script.split('\n');

  linhas.forEach((linhaOriginal, index) => {
    const numLinha = index + 1;
    // Remove comentários // ou # ou --
    let linha = linhaOriginal.replace(/(\/\/|#|--).*$/, '').trim();
    if (!linha) return;

    // Remove ponto e vírgula final se houver
    if (linha.endsWith(';')) {
      linha = linha.slice(0, -1).trim();
    }

    try {
      // 1. PERÍCIA: PERICIA.Nome += X ou PERICIA["Nome"] += X ou PERICIA: Nome +X
      const periciaMatchObj = linha.match(/^PERICIA(?:\[["']([^"']+)["']\]|\.([a-zA-Z0-9_À-ÿ]+))\s*(\+=|=|\+)\s*([+-]?\d+(?:\.\d+)?)$/i);
      if (periciaMatchObj) {
        const nomePericia = periciaMatchObj[1] || periciaMatchObj[2];
        const val = parseFloat(periciaMatchObj[4]);
        if (nomePericia && !isNaN(val)) {
          resultado.modPericias[nomePericia] = (resultado.modPericias[nomePericia] || 0) + val;
          resultado.logs.push(`L${numLinha}: Perícia '${nomePericia}' ${val >= 0 ? '+' : ''}${val}`);
          return;
        }
      }

      const periciaMatchColon = linha.match(/^PERICIA\s*:\s*([a-zA-Z0-9_À-ÿ\s]+?)\s*([+-]?\d+(?:\.\d+)?)$/i);
      if (periciaMatchColon) {
        const nomePericia = periciaMatchColon[1].trim();
        const val = parseFloat(periciaMatchColon[2]);
        if (nomePericia && !isNaN(val)) {
          resultado.modPericias[nomePericia] = (resultado.modPericias[nomePericia] || 0) + val;
          resultado.logs.push(`L${numLinha}: Perícia '${nomePericia}' ${val >= 0 ? '+' : ''}${val}`);
          return;
        }
      }

      // 2. ATRIBUTOS BÁSICOS (FOR, DES, CON, INT, SAB, CAR)
      const attrMatch = linha.match(/^(?:ATRIBUTO\.)?(FOR|DES|CON|INT|SAB|CAR)\s*(\+=|=|:|\+)\s*([+-]?\d+(?:\.\d+)?)$/i);
      if (attrMatch) {
        const atr = attrMatch[1].toUpperCase() as AtributoChave;
        const val = parseFloat(attrMatch[3]);
        if (!isNaN(val)) {
          resultado.modAtributos[atr] = (resultado.modAtributos[atr] || 0) + val;
          resultado.logs.push(`L${numLinha}: Atributo ${atr} ${val >= 0 ? '+' : ''}${val}`);
          return;
        }
      }

      // 3. ESTATÍSTICAS DERIVADAS
      const statMatch = linha.match(/^([A-Z_]+)\s*(\+=|=|:|\+)\s*([+-]?\d+(?:\.\d+)?)$/i);
      if (statMatch) {
        const chave = statMatch[1].toUpperCase();
        const val = parseFloat(statMatch[3]);
        if (isNaN(val)) {
          resultado.erros.push(`L${numLinha}: Valor numérico inválido em '${linhaOriginal.trim()}'`);
          return;
        }

        switch (chave) {
          case 'PV':
          case 'VIDA':
          case 'PONTOS_DE_VIDA':
            resultado.modPv += val;
            resultado.logs.push(`L${numLinha}: PV ${val >= 0 ? '+' : ''}${val}`);
            break;

          case 'PE':
          case 'ESFORCO':
          case 'ESFORÇO':
          case 'PONTOS_DE_ESFORCO':
          case 'PONTOS_DE_ESFORÇO':
          case 'ENERGIA':
            resultado.modPe += val;
            resultado.logs.push(`L${numLinha}: PE (Esforço) ${val >= 0 ? '+' : ''}${val}`);
            break;

          case 'DESL':
          case 'DESLOCAMENTO':
          case 'VELOCIDADE':
            resultado.modDesl += val;
            resultado.logs.push(`L${numLinha}: Deslocamento ${val >= 0 ? '+' : ''}${val}m`);
            break;

          case 'RD':
          case 'ARMADURA':
          case 'REDUCAO_DE_DANO':
          case 'REDUÇÃO_DE_DANO':
            resultado.modRd += val;
            resultado.logs.push(`L${numLinha}: Redução de Dano (RD) ${val >= 0 ? '+' : ''}${val}`);
            break;

          case 'CARGA':
          case 'CARGA_FOR':
          case 'MOD_CARGA':
            resultado.modCargaFor += val;
            resultado.logs.push(`L${numLinha}: Bônus Carga FOR ${val >= 0 ? '+' : ''}${val}`);
            break;

          case 'INIC':
          case 'INICIATIVA':
            resultado.modIniciativa += val;
            resultado.logs.push(`L${numLinha}: Iniciativa ${val >= 0 ? '+' : ''}${val}`);
            break;

          default:
            resultado.erros.push(`L${numLinha}: Variável desconhecida '${chave}'. Use PV, PE, DESL, RD, CARGA, INIC, ou atributos (FOR, DES, etc.)`);
            break;
        }
        return;
      }

      resultado.erros.push(`L${numLinha}: Instrução não reconhecida: '${linhaOriginal.trim()}'`);
    } catch (e: any) {
      resultado.erros.push(`L${numLinha}: Erro de sintaxe: ${e?.message || 'comando inválido'}`);
    }
  });

  return resultado;
}

/**
 * Gera um script de código limpo e formatado a partir dos campos estruturados
 */
export function gerarScriptPadrao(params: {
  pv?: number;
  pe?: number;
  desl?: number;
  rd?: number;
  cargaFor?: number;
  iniciativa?: number;
  atributos?: Partial<Record<AtributoChave, number>>;
  pericias?: Record<string, number>;
}): string {
  const linhas: string[] = [];

  if (params.pv) linhas.push(`PV += ${params.pv};`);
  if (params.pe) linhas.push(`PE += ${params.pe}; // Pontos de Esforço`);
  if (params.desl) linhas.push(`DESLOCAMENTO += ${params.desl}; // Metros`);
  if (params.rd) linhas.push(`RD += ${params.rd}; // Redução de Dano`);
  if (params.cargaFor) linhas.push(`CARGA_FOR += ${params.cargaFor}; // Bônus FOR para carga`);
  if (params.iniciativa) linhas.push(`INICIATIVA += ${params.iniciativa};`);

  if (params.atributos) {
    Object.entries(params.atributos).forEach(([atr, val]) => {
      if (val) linhas.push(`${atr} += ${val};`);
    });
  }

  if (params.pericias) {
    Object.entries(params.pericias).forEach(([per, val]) => {
      if (val) linhas.push(`PERICIA["${per}"] += ${val};`);
    });
  }

  return linhas.join('\n');
}
