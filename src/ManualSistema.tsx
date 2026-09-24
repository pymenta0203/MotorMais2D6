import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Calculator,
  Swords,
  Zap,
  Shield,
  Dices,
  Scroll,
  Backpack,
  Search,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Footprints,
  Crosshair,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AtributoChave } from './types';
import { DEFAULT_RACES, DEFAULT_SKILLS } from './defaultData';
import { CATALOGO_EQUIPAMENTOS_1940 } from './equipmentData';

interface ManualSistemaProps {
  onIrParaFicha?: () => void;
  onIrParaDev?: () => void;
}

export type CapituloManual =
  | 'visao_geral'
  | 'calculos'
  | 'combate_acoes'
  | 'pontos_esforco'
  | 'racas'
  | 'pericias'
  | 'arsenal'
  | 'simulador';

export default function ManualSistema({ onIrParaFicha, onIrParaDev }: ManualSistemaProps) {
  const [capituloAtivo, setCapituloAtivo] = useState<CapituloManual>('visao_geral');
  const [termoBusca, setTermoBusca] = useState<string>('');

  // Estados do Simulador de Testes 2D6
  const [simAtr, setSimAtr] = useState<number>(2);
  const [simPer, setSimPer] = useState<number>(2);
  const [simModExtra, setSimModExtra] = useState<number>(0);
  const [simNd, setSimNd] = useState<number>(10);
  const [simResultado, setSimResultado] = useState<{
    dado1: number;
    dado2: number;
    somaDados: number;
    total: number;
    sucesso: boolean;
    critico: boolean;
    desastre: boolean;
  } | null>(null);

  const rolarTesteSimulador = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const soma = d1 + d2;
    const total = soma + simAtr + simPer + simModExtra;
    const critico = soma === 12;
    const desastre = soma === 2;
    const sucesso = critico ? true : desastre ? false : total >= simNd;

    setSimResultado({
      dado1: d1,
      dado2: d2,
      somaDados: soma,
      total,
      sucesso,
      critico,
      desastre
    });
  };

  // Seções do Manual para índice e busca
  const secoes = [
    {
      id: 'visao_geral' as CapituloManual,
      titulo: '1. Mecânica Central 2D6',
      subtitulo: 'Regra de ouro, dados, níveis de dificuldade e críticos',
      icone: Dices,
      tags: ['dado', '2d6', 'dificuldade', 'nd', 'critico', 'desastre', 'teste oposto', 'sucesso']
    },
    {
      id: 'calculos' as CapituloManual,
      titulo: '2. Como Tudo é Calculado',
      subtitulo: 'Fórmulas exatas de PV, PE, Deslocamento, Carga e RD',
      icone: Calculator,
      tags: ['calculo', 'formula', 'pv', 'pe', 'deslocamento', 'carga', 'sobrecarga', 'rd', 'iniciativa', 'atributos']
    },
    {
      id: 'combate_acoes' as CapituloManual,
      titulo: '3. Ações & Combate',
      subtitulo: 'Estrutura do turno, catálogo de manobras e tiros',
      icone: Swords,
      tags: ['combate', 'turno', 'acao', 'atacar', 'esquiva', 'rajada', 'tiro', 'agarrar', 'cobertura', 'mira']
    },
    {
      id: 'pontos_esforco' as CapituloManual,
      titulo: '4. Pontos de Esforço (PE)',
      subtitulo: 'Uso de energia, adrenalina, ativação de vantagens e descanso',
      icone: Zap,
      tags: ['pe', 'esforco', 'energia', 'ativacao', 'vantagens', 'descanso', 'recuperacao']
    },
    {
      id: 'racas' as CapituloManual,
      titulo: '5. As 6 Raças de Gordan',
      subtitulo: 'Humanos, Urgos, Anões, Esqueletos, Goblins e Elfos',
      icone: Scroll,
      tags: ['raca', 'humano', 'urgo', 'anao', 'esqueleto', 'goblin', 'elfo', 'inatos']
    },
    {
      id: 'pericias' as CapituloManual,
      titulo: '6. As 22 Perícias',
      subtitulo: 'Guia prático de aplicação em investigações e ação',
      icone: Crosshair,
      tags: ['pericia', 'pontos', 'atributos', 'investigacao', 'medicina', 'briga', 'furtividade']
    },
    {
      id: 'arsenal' as CapituloManual,
      titulo: '7. Arsenal & Equipamentos',
      subtitulo: 'Armas de fogo (1935-1940), armas brancas e armaduras',
      icone: Backpack,
      tags: ['armas', 'tiro', 'revolver', 'pistola', 'rifle', 'escopeta', 'faca', 'armadura', 'preco', 'rd']
    },
    {
      id: 'simulador' as CapituloManual,
      titulo: '8. Simulador Interativo 2D6',
      subtitulo: 'Teste a mecânica rolando dados virtuais em tempo real',
      icone: Sparkles,
      tags: ['simulador', 'rolagem', 'dados', 'teste', 'treino']
    }
  ];

  // Filtro de busca simples
  const secoesFiltradas = useMemo(() => {
    if (!termoBusca.trim()) return secoes;
    const t = termoBusca.toLowerCase();
    return secoes.filter(s =>
      s.titulo.toLowerCase().includes(t) ||
      s.subtitulo.toLowerCase().includes(t) ||
      s.tags.some(tag => tag.includes(t))
    );
  }, [termoBusca]);

  return (
    <div className="space-y-6">

      {/* BANNER PRINCIPAL DO MANUAL */}
      <section className="border-2 border-white bg-black p-4 md:p-6 text-white relative overflow-hidden">
        <div className="max-w-5xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-white text-black font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              LIVRO DE REGRAS CONDENSADO
            </span>
            <span className="px-2 py-0.5 border border-white/60 text-[10px] font-mono uppercase tracking-wider text-neutral-300">
              SISTEMA MOTOR +2D6 // POR NEWTON &quot;TIO NITRO&quot; ROCHA
            </span>
            <span className="px-2 py-0.5 border border-amber-400 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
              GUIA DO JOGADOR & MESTRE
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            Manual do Sistema: Como Jogar, Calcular e Agir
          </h1>

          <p className="text-sm text-neutral-300 leading-relaxed max-w-3xl">
            Este é o compêndio de regras oficiais do <strong className="text-white">Motor +2D6</strong> adaptado ao universo de fantasia e tecnologia pulp dos anos 1935–1940. Aqui você encontra as fórmulas exatas que alimentam a sua ficha, o guia passo a passo de como tudo é calculado, a lista de manobras de combate e um simulador de testes ao vivo.
          </p>

          {/* Quick jump actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {onIrParaFicha && (
              <button
                type="button"
                onClick={onIrParaFicha}
                className="px-3 py-1.5 border border-white bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>VOLTAR À FICHA DE PERSONAGEM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onIrParaDev && (
              <button
                type="button"
                onClick={onIrParaDev}
                className="px-3 py-1.5 border border-white/70 bg-black text-neutral-300 font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition cursor-pointer"
              >
                EDITAR RAÇAS & TRAÇOS NO DEV TOOLS
              </button>
            )}
          </div>
        </div>
      </section>

      {/* BARRA DE NAVEGAÇÃO & BUSCA DO MANUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* ÍNDICE LATERAL / MENU DE CAPÍTULOS */}
        <aside className="lg:col-span-1 space-y-3">
          <div className="border-2 border-white bg-black p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-white/30 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Scroll className="w-3.5 h-3.5" /> ÍNDICE DO MANUAL
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">8 SEÇÕES</span>
            </div>

            {/* Campo de Busca Rápida */}
            <div className="relative">
              <input
                type="text"
                value={termoBusca}
                onChange={e => setTermoBusca(e.target.value)}
                placeholder="Pesquisar regra, fórmula, PE..."
                className="w-full bg-neutral-900 border border-white text-xs px-2.5 py-1.5 pl-8 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Lista de Capítulos */}
            <nav className="space-y-1">
              {secoesFiltradas.map(sec => {
                const Icone = sec.icone;
                const ativo = capituloAtivo === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setCapituloAtivo(sec.id);
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-2 border transition cursor-pointer flex items-start gap-2.5 ${
                      ativo
                        ? 'border-white bg-white text-black font-bold'
                        : 'border-white/20 bg-neutral-950 text-neutral-300 hover:border-white hover:text-white'
                    }`}
                  >
                    <Icone className={`w-4 h-4 shrink-0 mt-0.5 ${ativo ? 'text-black' : 'text-neutral-400'}`} />
                    <div className="min-w-0">
                      <div className="text-xs uppercase font-bold leading-tight">{sec.titulo}</div>
                      <div className={`text-[10px] line-clamp-1 leading-tight ${ativo ? 'text-neutral-700' : 'text-neutral-400'}`}>
                        {sec.subtitulo}
                      </div>
                    </div>
                  </button>
                );
              })}
              {secoesFiltradas.length === 0 && (
                <div className="p-3 text-center text-xs text-neutral-500 font-mono">
                  Nenhuma seção encontrada para &quot;{termoBusca}&quot;.
                </div>
              )}
            </nav>

            {/* Atalho para o simulador */}
            <div className="pt-2 border-t border-white/20">
              <button
                type="button"
                onClick={() => setCapituloAtivo('simulador')}
                className="w-full py-2 px-3 border border-amber-400/80 bg-amber-950/20 text-amber-300 hover:bg-amber-400 hover:text-black font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Dices className="w-4 h-4" />
                <span>ABRIR SIMULADOR 2D6</span>
              </button>
            </div>
          </div>

          {/* DICA RÁPIDA DE SOBREVIVÊNCIA */}
          <div className="border border-white/30 bg-neutral-950 p-3 space-y-1.5 text-xs text-neutral-300">
            <div className="font-bold text-white uppercase flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              REGRA DE OURO
            </div>
            <p className="text-[11px] leading-relaxed">
              Sempre que tentar algo arriscado ou incerto: <strong className="text-white">Rolar 2d6 + Atributo + Perícia vs ND</strong>. O mestre decide a dificuldade, e a narrativa flui sem travas matemáticas complexas.
            </p>
          </div>
        </aside>

        {/* ÁREA DE CONTEÚDO PRINCIPAL DO CAPÍTULO */}
        <main className="lg:col-span-3 space-y-6">

          {/* ========================================================= */}
          {/* CAPÍTULO 1: MECÂNICA CENTRAL 2D6                         */}
          {/* ========================================================= */}
          {capituloAtivo === 'visao_geral' && (
            <div className="border-2 border-white bg-black p-5 space-y-6">
              <div className="border-b-2 border-white pb-3">
                <span className="text-xs text-neutral-400 font-mono uppercase">CAPÍTULO 1 // FUNDAMENTOS</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Dices className="w-6 h-6 text-amber-400" />
                  A Mecânica Central do Motor +2D6
                </h2>
              </div>

              {/* A FÓRMULA UNIVERSAL DO TESTE */}
              <div className="border border-white bg-neutral-950 p-4 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">A REGRA DE RESOLUÇÃO UNIVERSAL</div>
                <div className="bg-black border border-white p-3 text-center">
                  <div className="text-lg md:text-xl font-mono font-black text-white">
                    2d6 + Atributo + Perícia &ge; ND (Nível de Dificuldade)
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Para resolver qualquer ação em jogo (saltar um abismo, disparar contra um gângster, estancar uma hemorragia ou decifrar um enigma antigo), o jogador rola <strong className="text-white">dois dados comuns de seis faces (2d6)</strong>, soma o valor do <strong className="text-white">Atributo</strong> relevante e soma a pontuação da <strong className="text-white">Perícia</strong> aplicável. Se o total final for igual ou superior ao <strong className="text-white">ND</strong>, a ação é um <span className="text-emerald-400 font-bold">SUCESSO</span>.
                </p>
              </div>

              {/* TABELA DE NÍVEIS DE DIFICULDADE (ND) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-neutral-400" />
                  Tabela Oficial de Dificuldades (ND)
                </h3>
                <div className="overflow-x-auto border border-white">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white text-black font-black uppercase text-[11px]">
                      <tr>
                        <th className="p-2 border-r border-black">ND</th>
                        <th className="p-2 border-r border-black">Classificação</th>
                        <th className="p-2 border-r border-black">Exemplo Prático</th>
                        <th className="p-2">Probabilidade com Bônus Médio (+3)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20 bg-neutral-950 text-neutral-300 font-mono">
                      <tr>
                        <td className="p-2 font-bold text-white border-r border-white/20">ND 6</td>
                        <td className="p-2 text-emerald-400 font-bold border-r border-white/20">Muito Fácil</td>
                        <td className="p-2 border-r border-white/20">Notar alguém gritando na rua; pular um muro baixo com calma.</td>
                        <td className="p-2">97% de chance</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-white border-r border-white/20">ND 8</td>
                        <td className="p-2 text-emerald-300 font-bold border-r border-white/20">Fácil / Rotineiro</td>
                        <td className="p-2 border-r border-white/20">Trocar o pneu de um carro sob chuva leve; pilotar em estrada calma.</td>
                        <td className="p-2">83% de chance</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-white border-r border-white/20">ND 10</td>
                        <td className="p-2 text-amber-300 font-bold border-r border-white/20">Médio (Desafio Padrão)</td>
                        <td className="p-2 border-r border-white/20">Acertar um tiro em alvo em movimento; arrombar fechadura padrão.</td>
                        <td className="p-2">58% de chance</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-white border-r border-white/20">ND 12</td>
                        <td className="p-2 text-orange-400 font-bold border-r border-white/20">Difícil</td>
                        <td className="p-2 border-r border-white/20">Desarmar bomba artesanal; estancar ferimento à bala sob fogo cerrado.</td>
                        <td className="p-2">28% de chance</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-white border-r border-white/20">ND 14</td>
                        <td className="p-2 text-red-400 font-bold border-r border-white/20">Muito Difícil / Extremo</td>
                        <td className="p-2 border-r border-white/20">Decifrar pergaminho em língua morta sem livros; salto mortal entre prédios.</td>
                        <td className="p-2">9% de chance</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-white border-r border-white/20">ND 16+</td>
                        <td className="p-2 text-purple-400 font-bold border-r border-white/20">Quase Impossível / Lendário</td>
                        <td className="p-2 border-r border-white/20">Atirar na lâmina de uma faca arremessada a 30 metros; façanhas mitológicas.</td>
                        <td className="p-2">&le; 2% de chance (requer PEs ou Vantagens)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CRÍTICOS E DESASTRES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-emerald-500 bg-emerald-950/20 p-4 space-y-2">
                  <div className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    SUCESSO CRÍTICO: 12 NATURAL (6 + 6)
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Se a soma das faces dos dados resultar em <strong className="text-white">12</strong> (dois 6 nos dados), o teste é um <strong className="text-emerald-300">Sucesso Automático</strong> independente do ND exigido! Em ataques, o dano é <strong className="text-white">máximo absoluto</strong> ou causa um ferimento crítico incapacitante.
                  </p>
                </div>

                <div className="border border-red-500 bg-red-950/20 p-4 space-y-2">
                  <div className="text-xs font-black text-red-400 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    FALHA CRÍTICA / DESASTRE: 2 NATURAL (1 + 1)
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Se a soma das faces dos dados resultar em <strong className="text-white">2</strong> (dois 1 nos dados), ocorre uma <strong className="text-red-400">Falha Crítica Inevitável</strong>. A arma engasga, o lockpick quebra dentro da fechadura ou o personagem sofre uma reviravolta dramática imediata.
                  </p>
                </div>
              </div>

              {/* TESTES DISPUTADOS / OPOSTOS */}
              <div className="border border-white/30 bg-neutral-950 p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-neutral-400" />
                  Testes Opostos (Disputas Diretas)
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Quando dois personagens agem diretamente um contra o outro (ex: Furtividade de quem se esconde vs Percepção de quem vigia; Ataque corpo a corpo vs Esquiva; Luta de braço FOR vs FOR):
                </p>
                <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
                  <li>Ambos rolam <strong className="text-white">2d6 + Atributo + Perícia</strong>.</li>
                  <li>Quem obtiver o <strong className="text-white">maior valor final</strong> vence a disputa.</li>
                  <li><strong className="text-white">Empate:</strong> Favorece o <span className="text-white underline">defensor</span> ou quem está mantendo o status quo. Se ambos forem atacantes ativos, o personagem com o maior atributo chave vence.</li>
                </ul>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* CAPÍTULO 2: COMO TUDO É CALCULADO                        */}
          {/* ========================================================= */}
          {capituloAtivo === 'calculos' && (
            <div className="border-2 border-white bg-black p-5 space-y-6">
              <div className="border-b-2 border-white pb-3">
                <span className="text-xs text-neutral-400 font-mono uppercase">CAPÍTULO 2 // ARQUITETURA DE DADOS</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-amber-400" />
                  Como Tudo é Calculado na Ficha
                </h2>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Todas as estatísticas da sua ficha de personagem são derivadas matematicamente a partir dos seus <strong className="text-white">Atributos Base</strong>, da sua <strong className="text-white">Raça</strong>, das <strong className="text-white">Vantagens &amp; Desvantagens</strong> adquiridas e dos <strong className="text-white">Equipamentos</strong> carregados no inventário. Veja a fórmula de cada valor:
              </p>

              {/* GRID DE CARDS COM FÓRMULAS EXATAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* CARD PV */}
                <div className="border-2 border-white bg-neutral-950 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm uppercase text-red-400 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-red-400/20" />
                      PONTOS DE VIDA (PV)
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">VITALIDADE FÍSICA</span>
                  </div>
                  <div className="bg-black border border-white/60 p-2 font-mono text-xs text-white">
                    PV = CON + 20 + ModRacialPV + ModTraçosPV
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Representa o dano que o corpo aguenta antes de cair.
                    <br />
                    &bull; <strong className="text-white">Humano com CON 2:</strong> 2 + 20 = <strong>22 PV</strong>.
                    <br />
                    &bull; <strong className="text-white">Anão (+7 Racial) com CON 3:</strong> 3 + 20 + 7 = <strong>30 PV</strong>.
                    <br />
                    &bull; Vantagens como <strong className="text-white">Duro de Matar</strong> adicionam de +6 a +14 PVs extras.
                  </p>
                  <div className="border-t border-white/20 pt-2 text-[11px] text-neutral-400">
                    <strong className="text-white">Regra de Morte:</strong> Com 0 PV ou menos, o personagem cai inconsciente e faz testes de CON a cada turno para não morrer.
                  </div>
                </div>

                {/* CARD PE */}
                <div className="border-2 border-white bg-neutral-950 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm uppercase text-cyan-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 fill-cyan-400/20" />
                      PONTOS DE ESFORÇO (PE)
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">ENERGIA &amp; ADRENALINA</span>
                  </div>
                  <div className="bg-black border border-white/60 p-2 font-mono text-xs text-white">
                    PE = CON + 10 + ModRacialPE + ModTraçosPE
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Combustível para manobras heroicas, poderes sobrenaturais e ativação de vantagens especiais.
                    <br />
                    &bull; Gastar <strong className="text-white">2 PEs</strong> permite acionar habilidades ativas (ex: <em>Absorção de Dano</em>, <em>Super Audição</em>).
                    <br />
                    &bull; Vantagens como <strong className="text-white">Esforço Extra</strong> concedem de +2 a +10 PEs permanentes.
                  </p>
                  <div className="border-t border-white/20 pt-2 text-[11px] text-neutral-400">
                    <strong className="text-white">Recuperação:</strong> Descanso curto recupera metade dos PEs; sono de 8 horas recupera todos os PEs.
                  </div>
                </div>

                {/* CARD DESLOCAMENTO & CORRIDA */}
                <div className="border-2 border-white bg-neutral-950 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm uppercase text-amber-300 flex items-center gap-1.5">
                      <Footprints className="w-4 h-4" />
                      DESLOCAMENTO (DESL) &amp; CORRIDA
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">METROS / TURNO</span>
                  </div>
                  <div className="bg-black border border-white/60 p-2 font-mono text-xs text-white">
                    DESL = ((DES + 6) / 2) + ModRacial + ModTraços
                    <br />
                    CORRIDA = DESL &times; 1.33
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Quantos metros o personagem se move mantendo precisão em combate.
                    <br />
                    &bull; <strong className="text-white">DES 2:</strong> (2 + 6) / 2 = <strong>4.0 m/t</strong> (Corrida: <strong>5.3 m/t</strong>).
                    <br />
                    &bull; <strong className="text-white">Goblin (+3 m/t Racial):</strong> DES 3 atinge <strong>7.5 m/t</strong> (Corrida: <strong>10.0 m/t</strong>).
                  </p>
                  <div className="border-t border-white/20 pt-2 text-[11px] text-neutral-400">
                    Mínimo base garantido de 1.0 m/t. Reduzido sob sobrecarga.
                  </div>
                </div>

                {/* CARD INICIATIVA */}
                <div className="border-2 border-white bg-neutral-950 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm uppercase text-emerald-400 flex items-center gap-1.5">
                      <Crosshair className="w-4 h-4" />
                      INICIATIVA DE COMBATE
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">VELOCIDADE DE REAÇÃO</span>
                  </div>
                  <div className="bg-black border border-white/60 p-2 font-mono text-xs text-white">
                    Iniciativa = DES + ModIniciativaTraços + ModArma
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Determina a ordem de ação nos turnos de combate.
                    <br />
                    &bull; Armas pesadas ou longas (ex: Revólver .44, Espada Larga) impõem penalidade de iniciativa (-1 ou -2).
                    <br />
                    &bull; Vantagens de reflexo concedem bônus para agir antes dos adversários.
                  </p>
                  <div className="border-t border-white/20 pt-2 text-[11px] text-neutral-400">
                    Em caso de empate na iniciativa, age primeiro quem tiver maior Destreza (DES).
                  </div>
                </div>

                {/* CARD RD */}
                <div className="border-2 border-white bg-neutral-950 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm uppercase text-blue-400 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      REDUÇÃO DE DANO (RD)
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">BLINDAGEM &amp; ARMADURA</span>
                  </div>
                  <div className="bg-black border border-white/60 p-2 font-mono text-xs text-white">
                    RD Total = RD da Armadura + RD de Traços/Raça
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    A Redução de Dano (RD) <strong className="text-white">subtrai diretamente</strong> o valor de qualquer dano físico sofrido antes que ele atinja os seus Pontos de Vida.
                    <br />
                    &bull; Exemplo: Se sofrer <strong>8 de dano</strong> vestindo um Sobretudo de Couro (<strong>RD 2</strong>), você desconta apenas <strong>6 PV</strong>!
                  </p>
                  <div className="border-t border-white/20 pt-2 text-[11px] text-neutral-400">
                    Armaduras não acumulam entre si: vale a de maior RD no inventário equipado.
                  </div>
                </div>

                {/* CARD REGRAS DE CARGA */}
                <div className="border-2 border-white bg-neutral-950 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm uppercase text-orange-400 flex items-center gap-1.5">
                      <Backpack className="w-4 h-4" />
                      REGRAS DE CARGA &amp; SOBRECARGA
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">PESO &amp; LIMITES</span>
                  </div>
                  <div className="bg-black border border-white/60 p-2 font-mono text-xs text-white">
                    Carga Leve = FOR + CON + 5 itens
                    <br />
                    Carga Pesada (2&times;) | Carga Máxima (3&times;)
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    O sistema conta a quantidade de itens carregados no inventário.
                  </p>
                  <div className="space-y-1 text-[11px] text-neutral-300">
                    <div>&bull; <strong className="text-white">Leve (&le; Limite):</strong> Sem nenhuma penalidade motora.</div>
                    <div>&bull; <strong className="text-amber-300">Pesada (Sobrecarga até 2&times;):</strong> Sofre <strong className="text-white">-2 em testes de DES</strong>, Atletismo, Esquiva e Iniciativa.</div>
                    <div>&bull; <strong className="text-red-400">Máxima (até 3&times;):</strong> Deslocamento cai pela metade, corrida desabilitada (0 m/t), proibido lutar ativamente.</div>
                    <div>&bull; <strong className="text-purple-400">Excedida (&gt; 3&times;):</strong> Personagem completamente imobilizado.</div>
                  </div>
                </div>

              </div>

              {/* EXPLICAÇÃO DE ATRIBUTOS, PONTOS E LIMITES */}
              <div className="border border-white bg-neutral-950 p-4 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Orçamento de Criação: Atributos, Perícias &amp; Vantagens
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-neutral-300">
                  <div className="p-3 border border-white/20 bg-black space-y-1">
                    <div className="font-black text-white uppercase text-[11px]">1. ATRIBUTOS (10 PONTOS)</div>
                    <p className="text-[11px]">
                      A média de um humano adulto comum é <strong className="text-white">0</strong>. Você tem 10 pontos para distribuir entre FOR, DES, CON, INT, SAB e CAR. Se rebaixar um atributo para <strong className="text-white">-1</strong>, ganha <strong className="text-emerald-400">+1 ponto extra</strong> para gastar em outro!
                    </p>
                  </div>
                  <div className="p-3 border border-white/20 bg-black space-y-1">
                    <div className="font-black text-white uppercase text-[11px]">2. PERÍCIAS (10 PONTOS)</div>
                    <p className="text-[11px]">
                      Você tem 10 pontos para distribuir livremente entre as 22 perícias do sistema. Cada ponto investido soma <strong className="text-white">+1 na rolagem correspondente</strong> ao teste de 2d6.
                    </p>
                  </div>
                  <div className="p-3 border border-white/20 bg-black space-y-1">
                    <div className="font-black text-white uppercase text-[11px]">3. VANTAGENS (5 PONTOS BASE)</div>
                    <p className="text-[11px]">
                      Você começa com 5 pontos gratuitos para adquirir Vantagens. Ao selecionar <strong className="text-red-400">Desvantagens</strong>, você ganha pontos adicionais para comprar mais Vantagens heroicas!
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* CAPÍTULO 3: O QUE O JOGADOR PODE FAZER (COMBATE & AÇÕES) */}
          {/* ========================================================= */}
          {capituloAtivo === 'combate_acoes' && (
            <div className="border-2 border-white bg-black p-5 space-y-6">
              <div className="border-b-2 border-white pb-3">
                <span className="text-xs text-neutral-400 font-mono uppercase">CAPÍTULO 3 // DINÂMICA DE COMBATE</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Swords className="w-6 h-6 text-amber-400" />
                  O Que o Personagem Pode Fazer no Turno
                </h2>
              </div>

              {/* ESTRUTURA DO TURNO */}
              <div className="border border-white bg-neutral-950 p-4 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">A ESTRUTURA DA RODADA DE COMBATE</div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Uma rodada de combate representa aproximadamente 6 a 10 segundos de ação em tempo real. No seu turno na ordem de iniciativa, você possui:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 border border-white/30 bg-black">
                    <strong className="text-white block uppercase text-[11px]">1. Ação de Movimento</strong>
                    <span className="text-neutral-300 text-[11px]">Mover-se até o seu Deslocamento em metros (pode dividir antes e depois de atacar).</span>
                  </div>
                  <div className="p-2 border border-white/30 bg-black">
                    <strong className="text-white block uppercase text-[11px]">2. Ação Principal</strong>
                    <span className="text-neutral-300 text-[11px]">Desferir um golpe, atirar com arma de fogo, usar item, aplicar primeiros socorros ou manobra.</span>
                  </div>
                  <div className="p-2 border border-white/30 bg-black">
                    <strong className="text-white block uppercase text-[11px]">3. Reação (Fora do Turno)</strong>
                    <span className="text-neutral-300 text-[11px]">Esquivar ativamente de um ataque, tentar aparar golpe ou jogar-se em cobertura.</span>
                  </div>
                </div>
              </div>

              {/* CATÁLOGO DE AÇÕES OFICIAIS */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Catálogo de Manobras e Ações de Combate
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {/* Ação 1 */}
                  <div className="border border-white/20 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-xs">Ataque Corpo a Corpo</span>
                      <span className="text-[10px] font-mono text-amber-400">FOR + ARMAS BRANCAS / BRIGA</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Ataca com espadas, machados, facas ou socos/chutes. O defensor rola Esquiva ou Bloqueio. Em caso de acerto, causa o Dano da Arma + FOR em pontos de dano.
                    </p>
                  </div>

                  {/* Ação 2 */}
                  <div className="border border-white/20 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-xs">Disparo com Arma de Fogo</span>
                      <span className="text-[10px] font-mono text-cyan-400">DES + ARMAS DE FOGO</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Efetua tiro com revólver, pistola, rifle ou escopeta. Causa o dano balístico específico da arma (ex: Revólver .38 causa 2d6+2). Se o alvo estiver sob cobertura, impõe penalidades.
                    </p>
                  </div>

                  {/* Ação 3 */}
                  <div className="border border-white/20 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-xs">Rajada de Balas (Thompson / SMG)</span>
                      <span className="text-[10px] font-mono text-red-400">FOGO AUTOMÁTICO</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Dispara uma sequência contínua de tiros. Adiciona <strong className="text-white">+4 no dano final</strong>, mas consome 5 a 10 balas e impõe penalidade de -2 na pontaria no próximo turno devido ao recuo.
                    </p>
                  </div>

                  {/* Ação 4 */}
                  <div className="border border-white/20 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-xs">Mirar Cuidadosamente</span>
                      <span className="text-[10px] font-mono text-emerald-400">+2 NO PRÓXIMO TIRO</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Gasta a sua Ação Principal alinhando a mira com calma. No seu próximo turno, seu primeiro disparo com arma de fogo recebe <strong className="text-white">+2 de bônus</strong> na rolagem de acerto.
                    </p>
                  </div>

                  {/* Ação 5 */}
                  <div className="border border-white/20 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-xs">Esquiva Ativa (Reação)</span>
                      <span className="text-[10px] font-mono text-amber-300">DES + ACROBACIA / ARTES MARCIAIS</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Quando for alvo de um ataque, você rola sua Esquiva contra o resultado do atacante. Se o seu total for superior, o ataque erra completamente.
                    </p>
                  </div>

                  {/* Ação 6 */}
                  <div className="border border-white/20 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-xs">Agarrar &amp; Imobilizar</span>
                      <span className="text-[10px] font-mono text-orange-400">FOR + BRIGA vs FOR + BRIGA</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Prende o oponente em uma chave de braço ou imobilização. Enquanto estiver agarrado, o alvo não pode se mover e sofre -4 em todos os ataques até escapar.
                    </p>
                  </div>

                  {/* Ação 7 */}
                  <div className="border border-white/20 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-xs">Desarmar Oponente</span>
                      <span className="text-[10px] font-mono text-neutral-300">PENALIDADE DE -2 NO ATAQUE</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Tenta arrancar a arma da mão do inimigo. Se acertar o ataque com -2, a arma voa a 1d6 metros de distância no chão, deixando o inimigo desarmado.
                    </p>
                  </div>

                  {/* Ação 8 */}
                  <div className="border border-white/20 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-xs">Primeiros Socorros em Campo</span>
                      <span className="text-[10px] font-mono text-emerald-400">INT + MEDICINA vs ND 10</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Gasta 1 turno ao lado de um aliado ferido com um kit médico. Se passar no teste, estanca hemorragias ativas e recupera <strong className="text-white">1d6 PVs</strong> imediatamente (1x por ferimento).
                    </p>
                  </div>

                  {/* Ação 9 */}
                  <div className="border border-white/20 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-xs">Usar Cobertura do Cenário</span>
                      <span className="text-[10px] font-mono text-purple-400">-2 OU -4 PARA SER ACERTADO</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Abaixar-se atrás de caixas, veículos ou muretas concede Meia Cobertura (-2 nos ataques inimigos) ou Três Quartos de Cobertura (-4 nos ataques inimigos).
                    </p>
                  </div>

                  {/* Ação 10 */}
                  <div className="border border-white/20 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-xs">Mão Não Dominante (Ataque Duplo)</span>
                      <span className="text-[10px] font-mono text-red-400">PENALIDADE DE -6</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Atacar com duas armas ao mesmo tempo impõe -6 de penalidade na arma empunhada na mão fraca, a menos que o personagem possua a vantagem <strong className="text-white">Ambidestria</strong>.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* CAPÍTULO 4: PONTOS DE ESFORÇO (PE) & VANTAGENS            */}
          {/* ========================================================= */}
          {capituloAtivo === 'pontos_esforco' && (
            <div className="border-2 border-white bg-black p-5 space-y-6">
              <div className="border-b-2 border-white pb-3">
                <span className="text-xs text-neutral-400 font-mono uppercase">CAPÍTULO 4 // RECURSO HEROICO</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  Pontos de Esforço (PE) &amp; Ativação de Vantagens
                </h2>
              </div>

              <div className="border border-white bg-neutral-950 p-4 space-y-3">
                <h3 className="text-sm font-bold uppercase text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  O Que São os Pontos de Esforço (PE)?
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Os Pontos de Esforço (PE) medem a sua capacidade de superar a dor física, forçar os músculos além do limite humano, acionar dons sobrenaturais e manifestar proezas inacreditáveis em momentos decisivos de perigo.
                </p>
              </div>

              {/* LISTA DE USOS DE PE */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Como Gastar Seus PEs em Jogo</h4>

                <div className="space-y-2">
                  <div className="border border-white/30 bg-neutral-950 p-3 flex items-start gap-3">
                    <span className="px-2 py-1 bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono font-bold text-xs shrink-0">
                      2 PEs
                    </span>
                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs uppercase">Ativar Vantagens Raciais ou Especiais</div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        Muitas vantagens do livro de regras exigem 2 PEs para funcionar instantaneamente:
                        <br />
                        &bull; <strong className="text-white">Absorção de Dano:</strong> Ao gastar 2 PEs, o personagem absorve de 3 a 15 pontos de dano que acabara de sofrer, anulando o impacto.
                        <br />
                        &bull; <strong className="text-white">Super Audição:</strong> Gastando 2 PEs, consegue escutar sussurros ou passos a até 1 km de distância com clareza cristalina.
                      </p>
                    </div>
                  </div>

                  <div className="border border-white/30 bg-neutral-950 p-3 flex items-start gap-3">
                    <span className="px-2 py-1 bg-amber-950 border border-amber-400 text-amber-300 font-mono font-bold text-xs shrink-0">
                      1 PE
                    </span>
                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs uppercase">Esforço Heroico em Teste Crítico</div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        Ao declarar um esforço heroico antes de rolar os dados, o jogador gasta 1 PE para receber <strong className="text-white">+2 de bônus imediato</strong> na rolagem de qualquer teste de sobrevivência, fuga ou acerto.
                      </p>
                    </div>
                  </div>

                  <div className="border border-white/30 bg-neutral-950 p-3 flex items-start gap-3">
                    <span className="px-2 py-1 bg-red-950 border border-red-400 text-red-300 font-mono font-bold text-xs shrink-0">
                      3 PEs
                    </span>
                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs uppercase">Resistência Contra Inconsciência (Segunda Respiração)</div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        Se os seus PVs chegarem a 0, você pode queimar 3 PEs instantaneamente para permanecer em pé consciente por mais 1 turno completo, tendo a chance de tomar um remédio, disparar um último tiro desesperado ou rastejar para cobertura.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* REGRAS DE RECUPERAÇÃO */}
              <div className="border border-white/20 bg-neutral-950 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase text-white tracking-wider">Como Recuperar PEs Gastos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-300">
                  <div className="p-2 border border-white/10 bg-black">
                    <strong className="text-white block uppercase text-[11px]">Descanso Curto (15–30 min)</strong>
                    <span className="text-[11px]">Sentar-se com calma, beber água e recuperar o fôlego restaura <strong className="text-white">metade dos seus PEs máximos</strong>.</span>
                  </div>
                  <div className="p-2 border border-white/10 bg-black">
                    <strong className="text-white block uppercase text-[11px]">Descanso Longo (8 horas de sono)</strong>
                    <span className="text-[11px]">Uma noite de sono seguro recupera <strong className="text-white">100% dos PEs</strong> e cura 2 a 4 PVs de ferimentos naturais.</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* CAPÍTULO 5: AS 6 RAÇAS DE GORDAN                         */}
          {/* ========================================================= */}
          {capituloAtivo === 'racas' && (
            <div className="border-2 border-white bg-black p-5 space-y-6">
              <div className="border-b-2 border-white pb-3">
                <span className="text-xs text-neutral-400 font-mono uppercase">CAPÍTULO 5 // BIOLOGIA &amp; LORE</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Scroll className="w-6 h-6 text-amber-400" />
                  As 6 Raças Oficiais do Sistema
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(DEFAULT_RACES).map(raca => (
                  <div key={raca.id} className="border-2 border-white bg-neutral-950 p-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/20 pb-2">
                      <span className="font-black text-sm uppercase text-white tracking-tight">{raca.nome}</span>
                      <span className="text-[10px] font-mono text-amber-400">RAÇA OFICIAL</span>
                    </div>

                    <p className="text-xs text-neutral-300 italic leading-relaxed">
                      &quot;{raca.desc}&quot;
                    </p>

                    {/* Modificadores */}
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                      {raca.modPv !== 0 && (
                        <span className={`px-2 py-0.5 border ${raca.modPv > 0 ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20' : 'border-red-500 text-red-400 bg-red-950/20'}`}>
                          {raca.modPv > 0 ? `+${raca.modPv}` : raca.modPv} PV
                        </span>
                      )}
                      {raca.modDesl !== 0 && (
                        <span className={`px-2 py-0.5 border ${raca.modDesl > 0 ? 'border-amber-400 text-amber-300 bg-amber-950/20' : 'border-red-500 text-red-400 bg-red-950/20'}`}>
                          {raca.modDesl > 0 ? `+${raca.modDesl}` : raca.modDesl}m DESL
                        </span>
                      )}
                      {raca.modPv === 0 && raca.modDesl === 0 && (
                        <span className="px-2 py-0.5 border border-white/40 text-neutral-300">
                          PADRÃO HUMANO
                        </span>
                      )}
                    </div>

                    {/* Vantagens Raciais Inatas */}
                    <div className="space-y-1 text-xs">
                      <div className="text-[10px] font-bold uppercase text-neutral-400">Traços Inatos:</div>
                      <div className="text-[11px] text-neutral-300">
                        <strong className="text-white">Vantagens:</strong> {raca.vantagens && raca.vantagens.length > 0 ? raca.vantagens.join(', ') : 'Nenhuma'}
                        <br />
                        <strong className="text-red-400">Desvantagens:</strong> {raca.desvantagens && raca.desvantagens.length > 0 ? raca.desvantagens.join(', ') : 'Nenhuma'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CAPÍTULO 6: AS 22 PERÍCIAS                               */}
          {/* ========================================================= */}
          {capituloAtivo === 'pericias' && (
            <div className="border-2 border-white bg-black p-5 space-y-6">
              <div className="border-b-2 border-white pb-3">
                <span className="text-xs text-neutral-400 font-mono uppercase">CAPÍTULO 6 // ESPECIALIZAÇÃO</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Crosshair className="w-6 h-6 text-amber-400" />
                  Guia Prático das 22 Perícias
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEFAULT_SKILLS.map(per => (
                  <div key={per.nome} className="border border-white/20 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs uppercase">{per.nome}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 border border-white/40 text-amber-300">
                        {per.atr}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {per.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CAPÍTULO 7: ARSENAL & EQUIPAMENTOS                       */}
          {/* ========================================================= */}
          {capituloAtivo === 'arsenal' && (
            <div className="border-2 border-white bg-black p-5 space-y-6">
              <div className="border-b-2 border-white pb-3">
                <span className="text-xs text-neutral-400 font-mono uppercase">CAPÍTULO 7 // EQUIPAMENTOS 1935–1940</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Backpack className="w-6 h-6 text-amber-400" />
                  Arsenal de Armas &amp; Proteções Balísticas
                </h2>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Tabela condensada das armas e blindagens disponíveis no arsenal do sistema para a época:
              </p>

              <div className="overflow-x-auto border border-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white text-black font-black uppercase text-[11px]">
                    <tr>
                      <th className="p-2 border-r border-black">Equipamento</th>
                      <th className="p-2 border-r border-black">Categoria</th>
                      <th className="p-2 border-r border-black">Dano / RD</th>
                      <th className="p-2 border-r border-black">Alcance</th>
                      <th className="p-2 border-r border-black">Iniciativa</th>
                      <th className="p-2">Preço Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20 bg-neutral-950 text-neutral-300 font-mono">
                    {CATALOGO_EQUIPAMENTOS_1940.slice(0, 15).map(item => (
                      <tr key={item.idCatalogo || item.nome}>
                        <td className="p-2 font-bold text-white border-r border-white/20">{item.nome}</td>
                        <td className="p-2 text-neutral-400 uppercase text-[10px] border-r border-white/20">{item.categoria}</td>
                        <td className="p-2 font-bold text-amber-300 border-r border-white/20">
                          {item.dano || (item.rd ? `RD ${item.rd}` : '—')}
                        </td>
                        <td className="p-2 border-r border-white/20">{item.alcance || 'Corpo a Corpo'}</td>
                        <td className="p-2 border-r border-white/20">
                          {typeof item.modIniciativa === 'number' ? (item.modIniciativa >= 0 ? `+${item.modIniciativa}` : item.modIniciativa) : '0'}
                        </td>
                        <td className="p-2 text-emerald-400 font-bold">{item.preco || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CAPÍTULO 8: SIMULADOR INTERATIVO 2D6                     */}
          {/* ========================================================= */}
          {capituloAtivo === 'simulador' && (
            <div className="border-2 border-white bg-black p-5 space-y-6">
              <div className="border-b-2 border-white pb-3">
                <span className="text-xs text-neutral-400 font-mono uppercase">CAPÍTULO 8 // PRÁTICA INTERATIVA</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  Simulador Interativo de Rolagem 2D6
                </h2>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Configure os valores abaixo simulando a sua ficha e clique em <strong className="text-white">ROLAR 2D6</strong> para testar a probabilidade matemática do sistema ao vivo:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="border border-white/40 bg-neutral-950 p-3 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">Atributo (-1 a +5)</label>
                  <input
                    type="number"
                    value={simAtr}
                    onChange={e => setSimAtr(parseInt(e.target.value) || 0)}
                    className="w-full bg-black border border-white text-sm p-1.5 text-white font-mono"
                  />
                </div>

                <div className="border border-white/40 bg-neutral-950 p-3 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">Perícia (0 a +5)</label>
                  <input
                    type="number"
                    value={simPer}
                    onChange={e => setSimPer(parseInt(e.target.value) || 0)}
                    className="w-full bg-black border border-white text-sm p-1.5 text-white font-mono"
                  />
                </div>

                <div className="border border-white/40 bg-neutral-950 p-3 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">Mod. Extra / PE</label>
                  <input
                    type="number"
                    value={simModExtra}
                    onChange={e => setSimModExtra(parseInt(e.target.value) || 0)}
                    className="w-full bg-black border border-white text-sm p-1.5 text-white font-mono"
                  />
                </div>

                <div className="border border-white/40 bg-neutral-950 p-3 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400 block">Dificuldade (ND)</label>
                  <input
                    type="number"
                    value={simNd}
                    onChange={e => setSimNd(parseInt(e.target.value) || 10)}
                    className="w-full bg-black border border-amber-400 text-sm p-1.5 text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Botão de Rolagem */}
              <div>
                <button
                  type="button"
                  onClick={rolarTesteSimulador}
                  className="w-full py-3 border-2 border-white bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-neutral-200 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Dices className="w-5 h-5" />
                  <span>ROLAR 2D6 AGORA!</span>
                </button>
              </div>

              {/* Resultado do Teste */}
              {simResultado && (
                <div className={`border-2 p-4 space-y-3 ${
                  simResultado.critico
                    ? 'border-emerald-400 bg-emerald-950/30'
                    : simResultado.desastre
                    ? 'border-red-500 bg-red-950/30'
                    : simResultado.sucesso
                    ? 'border-emerald-500 bg-neutral-950'
                    : 'border-red-400 bg-neutral-950'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/20 pb-2">
                    <span className="text-xs font-mono uppercase text-neutral-400">RESULTADO DO TESTE</span>
                    <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
                      simResultado.critico
                        ? 'bg-emerald-400 text-black'
                        : simResultado.desastre
                        ? 'bg-red-500 text-white'
                        : simResultado.sucesso
                        ? 'bg-emerald-500 text-black'
                        : 'bg-red-500 text-white'
                    }`}>
                      {simResultado.critico
                        ? '★ SUCESSO CRÍTICO (12 NOS DADOS) ★'
                        : simResultado.desastre
                        ? '☠ DESASTRE / FALHA CRÍTICA (2 NOS DADOS) ☠'
                        : simResultado.sucesso
                        ? '✓ SUCESSO NO TESTE!'
                        : '✗ FALHA NO TESTE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
                    <div className="p-2 border border-white/20 bg-black">
                      <div className="text-[10px] text-neutral-400">DADOS (2d6)</div>
                      <div className="text-lg font-bold text-white">
                        [{simResultado.dado1}] + [{simResultado.dado2}] = <span className="text-amber-400">{simResultado.somaDados}</span>
                      </div>
                    </div>
                    <div className="p-2 border border-white/20 bg-black">
                      <div className="text-[10px] text-neutral-400">BÔNUS (Atr+Per+Extra)</div>
                      <div className="text-lg font-bold text-neutral-300">
                        +{simAtr + simPer + simModExtra}
                      </div>
                    </div>
                    <div className="p-2 border border-white/20 bg-black">
                      <div className="text-[10px] text-neutral-400">TOTAL FINAL</div>
                      <div className="text-xl font-black text-white">
                        {simResultado.total}
                      </div>
                    </div>
                    <div className="p-2 border border-white/20 bg-black">
                      <div className="text-[10px] text-neutral-400">META EXIGIDA</div>
                      <div className="text-xl font-bold text-amber-300">
                        &ge; {simNd}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
