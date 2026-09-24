import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sun, Moon, BookOpen } from 'lucide-react';
import { AtributoChave, Character, Race, Trait, InventoryItem, CharacterExport, RacePackExport, TraitPackExport, ItemPackExport } from './types';
import { DEFAULT_RACES, LIVRO_VANTAGENS, LIVRO_DESVANTAGENS, DEFAULT_SKILLS, DEFAULT_CHARACTER, RACE_ID_ALIASES } from './defaultData';
import { CATALOGO_EQUIPAMENTOS_1940, CatalogItem } from './equipmentData';
import { executarScriptTraco, gerarScriptPadrao, TraitModifiers } from './traitScriptEngine';
import ImageCropModal from './ImageCropModal';
import { carregarTodosAvatares, salvarAvatarNoStorage, removerAvatarDoStorage } from './avatarStorage';
import ManualSistema from './ManualSistema';

const ATRIBUTO_NOMES: Record<AtributoChave, string> = {
  FOR: "FORÇA",
  DES: "DESTREZA",
  CON: "CONSTITUIÇÃO",
  INT: "INTELIGÊNCIA",
  SAB: "SABEDORIA",
  CAR: "CARISMA"
};

const ATRIBUTOS_ORDEM: AtributoChave[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

export default function App() {
  // Navigation: Initial page is 'biblioteca'. Main tabs: 'biblioteca' | 'ficha' | 'dev' | 'manual'
  const [abaAtiva, setAbaAtiva] = useState<'biblioteca' | 'ficha' | 'dev' | 'manual'>('biblioteca');
  const [subAbaDev, setSubAbaDev] = useState<'racas' | 'pool' | 'itens'>('racas');

  // Theme: 'dark' | 'light' (Persisted in localStorage)
  const [tema, setTema] = useState<'dark' | 'light'>(() => {
    try {
      const salvo = localStorage.getItem('tio_nitro_tema');
      if (salvo === 'light' || salvo === 'dark') return salvo;
    } catch {
      // ignore
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (tema === 'light') {
        root.classList.add('theme-light');
        root.classList.remove('theme-dark');
      } else {
        root.classList.remove('theme-light');
        root.classList.add('theme-dark');
      }
      localStorage.setItem('tio_nitro_tema', tema);
    } catch {
      // ignore
    }
  }, [tema]);

  // Trait Pool
  const [pool, setPool] = useState<Trait[]>(() => {
    try {
      const savedV3 = localStorage.getItem('motor2d6_mono_pool_v3');
      if (savedV3) return JSON.parse(savedV3);

      const savedV2 = localStorage.getItem('motor2d6_mono_pool_v2');
      if (savedV2) {
        const parsedV2: Trait[] = JSON.parse(savedV2);
        const defaultIds = new Set([...LIVRO_VANTAGENS, ...LIVRO_DESVANTAGENS].map(t => t.id));
        const customTraits = parsedV2.filter(t => !defaultIds.has(t.id));
        const merged = [...LIVRO_VANTAGENS, ...LIVRO_DESVANTAGENS, ...customTraits];
        localStorage.setItem('motor2d6_mono_pool_v3', JSON.stringify(merged));
        return merged;
      }
    } catch {
      // ignore
    }
    return [...LIVRO_VANTAGENS, ...LIVRO_DESVANTAGENS];
  });

  // Races
  const [bancoRacas, setBancoRacas] = useState<Record<string, Race>>(() => {
    try {
      const saved = localStorage.getItem('motor2d6_mono_racas_v2');
      if (saved) {
        const parsed: Record<string, Race> = JSON.parse(saved);
        const base = { ...DEFAULT_RACES };
        Object.keys(parsed).forEach(k => {
          base[k] = parsed[k];
        });
        Object.keys(DEFAULT_RACES).forEach(k => {
          if (base[k]) base[k].isDefault = true;
        });
        return base;
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_RACES };
  });

  // Multi-Character Management
  const [personagens, setPersonagens] = useState<Character[]>(() => {
    try {
      // Try v3 first
      const savedV3 = localStorage.getItem('motor2d6_mono_personagens_v3');
      if (savedV3 !== null) {
        const parsed: Character[] = JSON.parse(savedV3);
        if (Array.isArray(parsed)) {
          return parsed.map(p => ({
            ...p,
            id: p.id || "char_" + Math.random().toString(36).substring(2, 9),
            pericias: p.pericias && p.pericias.length > 0 ? p.pericias : [...DEFAULT_SKILLS],
            itensCarregados: typeof p.itensCarregados === 'number' ? p.itensCarregados : 0,
            itensInventario: Array.isArray(p.itensInventario) ? p.itensInventario : []
          }));
        }
      }

      // Legacy v2 single character
      const savedV2 = localStorage.getItem('motor2d6_mono_char_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        return [{
          ...parsed,
          id: parsed.id || "char_1",
          pericias: parsed.pericias && parsed.pericias.length > 0 ? parsed.pericias : [...DEFAULT_SKILLS],
          itensCarregados: typeof parsed.itensCarregados === 'number' ? parsed.itensCarregados : 0,
          itensInventario: Array.isArray(parsed.itensInventario) ? parsed.itensInventario : []
        }];
      }
    } catch {
      // ignore
    }
    return [{ ...DEFAULT_CHARACTER }];
  });

  const [personagemAtivoId, setPersonagemAtivoId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('motor2d6_mono_char_ativo_id');
      if (savedId) return savedId;
    } catch {
      // ignore
    }
    return "char_1";
  });

  // Search filter inside character library
  const [buscaBiblioteca, setBuscaBiblioteca] = useState<string>('');

  // Active character reference
  const personagem = useMemo(() => {
    return personagens.find(p => p.id === personagemAtivoId) || personagens[0] || DEFAULT_CHARACTER;
  }, [personagens, personagemAtivoId]);

  // Keep active ID valid
  useEffect(() => {
    if (!personagens.some(p => p.id === personagemAtivoId) && personagens.length > 0) {
      setPersonagemAtivoId(personagens[0].id);
    }
  }, [personagens, personagemAtivoId]);

  // Editor State for Races
  const [racaEditorId, setRacaEditorId] = useState<string>('humano');
  const [racaEditorDraft, setRacaEditorDraft] = useState<Race>(() => DEFAULT_RACES.humano);

  // Pool Tab State
  const [filtroPoolTipo, setFiltroPoolTipo] = useState<'todos' | 'vantagem' | 'desvantagem'>('todos');
  const [buscaPool, setBuscaPool] = useState<string>('');
  const [novoTracoTipo, setNovoTracoTipo] = useState<'vantagem' | 'desvantagem'>('vantagem');
  const [novoTracoNome, setNovoTracoNome] = useState<string>('');
  const [novoTracoPontos, setNovoTracoPontos] = useState<number>(2);
  const [novoTracoDesc, setNovoTracoDesc] = useState<string>('');
  const [novoTracoPv, setNovoTracoPv] = useState<number>(0);
  const [novoTracoPe, setNovoTracoPe] = useState<number>(0);
  const [novoTracoDesl, setNovoTracoDesl] = useState<number>(0);
  const [novoTracoRd, setNovoTracoRd] = useState<number>(0);
  const [novoTracoCargaFor, setNovoTracoCargaFor] = useState<number>(0);
  const [novoTracoIniciativa, setNovoTracoIniciativa] = useState<number>(0);
  const [novoTracoAtributos, setNovoTracoAtributos] = useState<Partial<Record<AtributoChave, number>>>({});
  const [novoTracoPericias, setNovoTracoPericias] = useState<Record<string, number>>({});
  const [novoTracoScript, setNovoTracoScript] = useState<string>('');
  const [abaEditorTraco, setAbaEditorTraco] = useState<'visual' | 'codigo'>('visual');
  const [tracoEditandoId, setTracoEditandoId] = useState<string | null>(null);

  // Perícia picker inside trait creator
  const [pickerPericiaNome, setPickerPericiaNome] = useState<string>('Furtividade');
  const [pickerPericiaBonus, setPickerPericiaBonus] = useState<number>(2);

  // Trait Catalog Modal (Discrete '+' button on Advantages/Disadvantages)
  const [modalCatalogo, setModalCatalogo] = useState<{
    aberto: boolean;
    tipo: 'vantagem' | 'desvantagem';
    busca: string;
    filtroPontos: number | 'todos';
    origem?: 'ficha' | 'raca';
  }>({
    aberto: false,
    tipo: 'vantagem',
    busca: '',
    filtroPontos: 'todos',
    origem: 'ficha'
  });
  const [niveisSelecionadosCatalogo, setNiveisSelecionadosCatalogo] = useState<Record<string, number>>({});

  // Confirmation Modal
  const [modalConfig, setModalConfig] = useState<{
    aberto: boolean;
    titulo: string;
    mensagem: string;
    onConfirm: () => void;
  }>({
    aberto: false,
    titulo: '',
    mensagem: '',
    onConfirm: () => {}
  });

  // Toasts
  const [toasts, setToasts] = useState<{ id: string; msg: string }[]>([]);

  // Dedicated file input refs for character, race pack and trait pack
  const fileCharInputRef = useRef<HTMLInputElement>(null);
  const fileRacasInputRef = useRef<HTMLInputElement>(null);
  const fileTracosInputRef = useRef<HTMLInputElement>(null);
  const fileItensInputRef = useRef<HTMLInputElement>(null);
  const fileImageInputRef = useRef<HTMLInputElement>(null);
  const targetCharIdForUploadRef = useRef<string | null>(null);

  // Local Avatar Storage cache (isolated from character JSON for security)
  const [avatares, setAvatares] = useState<Record<string, string>>({});

  useEffect(() => {
    carregarTodosAvatares().then(loaded => {
      setAvatares(loaded);
    });
  }, []);

  // 1:1 Character Image Cropper (WhatsApp-style interactive modal)
  const [cropModal, setCropModal] = useState<{
    isOpen: boolean;
    charId: string;
    charName: string;
    imageSrc: string;
    hasExistingImage: boolean;
  }>({
    isOpen: false,
    charId: '',
    charName: '',
    imageSrc: '',
    hasExistingImage: false
  });

  // Dev Tools: Banco de Itens do Arsenal (Persisted in localStorage)
  const [bancoItens, setBancoItens] = useState<CatalogItem[]>(() => {
    try {
      const salvo = localStorage.getItem('motor2d6_mono_arsenal_v2');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Erro ao carregar arsenal do storage:", e);
    }
    return [...CATALOGO_EQUIPAMENTOS_1940];
  });

  useEffect(() => {
    try {
      localStorage.setItem('motor2d6_mono_arsenal_v2', JSON.stringify(bancoItens));
    } catch (e) {
      console.error("Erro ao salvar arsenal no storage:", e);
    }
  }, [bancoItens]);

  // Dev Tools Item Editor Draft
  const [itemEditorDraft, setItemEditorDraft] = useState<CatalogItem>({
    id: 'item_custom_1',
    nome: '',
    categoria: 'arma_fogo',
    qtd: 1,
    dano: '',
    tipoDano: '',
    rd: 0,
    alcance: '',
    modIniciativa: 0,
    preco: '',
    desc: '',
    detalhes: ''
  });
  const [editandoItemId, setEditandoItemId] = useState<string | null>(null);
  const [filtroDevItensCat, setFiltroDevItensCat] = useState<string>('todos');
  const [buscaDevItens, setBuscaDevItens] = useState<string>('');

  // State for adding new items in inventory
  const [novoItemNome, setNovoItemNome] = useState('');
  const [novoItemQtd, setNovoItemQtd] = useState(1);
  const [novoItemDesc, setNovoItemDesc] = useState('');

  // Catalog browser state (1935-1940 / Steampunk / Low-fantasy)
  const [catalogoAberto, setCatalogoAberto] = useState(false);
  const [categoriaCatalogo, setCategoriaCatalogo] = useState<string>('todos');
  const [buscaCatalogo, setBuscaCatalogo] = useState<string>('');

  const carregarArquivoParaCrop = (file: File, targetCharId: string) => {
    const targetChar = personagens.find(p => p.id === targetCharId);
    if (!targetChar) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setCropModal({
          isOpen: true,
          charId: targetChar.id,
          charName: targetChar.nome,
          imageSrc: dataUrl,
          hasExistingImage: !!avatares[targetChar.id]
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const iniciarUploadImagem = (charId: string) => {
    targetCharIdForUploadRef.current = charId;
    if (fileImageInputRef.current) {
      fileImageInputRef.current.value = '';
      fileImageInputRef.current.click();
    }
  };

  const handleArquivoImagemSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetCharIdForUploadRef.current) return;
    carregarArquivoParaCrop(file, targetCharIdForUploadRef.current);
    e.target.value = '';
  };

  const abrirReajusteImagemExistente = (char: Character) => {
    const avatarAtual = avatares[char.id];
    if (!avatarAtual) {
      iniciarUploadImagem(char.id);
      return;
    }
    setCropModal({
      isOpen: true,
      charId: char.id,
      charName: char.nome,
      imageSrc: avatarAtual,
      hasExistingImage: true
    });
  };

  const salvarImagemRecortada = async (charId: string, croppedDataUrl: string) => {
    if (!charId) return;
    setAvatares(prev => ({ ...prev, [charId]: croppedDataUrl }));
    await salvarAvatarNoStorage(charId, croppedDataUrl);
    mostrarToast("FOTO DO PERSONAGEM SALVA COM SUCESSO!");
  };

  const removerImagemPersonagem = async (charId: string) => {
    if (!charId) return;
    setAvatares(prev => {
      const next = { ...prev };
      delete next[charId];
      return next;
    });
    await removerAvatarDoStorage(charId);
    mostrarToast("FOTO DO PERSONAGEM REMOVIDA");
  };

  const mostrarToast = (msg: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const alternarTema = () => {
    setTema(prev => {
      const novo = prev === 'dark' ? 'light' : 'dark';
      mostrarToast(`TEMA ${novo === 'light' ? 'CLARO ATIVADO' : 'ESCURO ATIVADO'}`);
      return novo;
    });
  };

  const abrirConfirm = (titulo: string, mensagem: string, onConfirm: () => void) => {
    setModalConfig({
      aberto: true,
      titulo,
      mensagem,
      onConfirm: () => {
        onConfirm();
        setModalConfig(prev => ({ ...prev, aberto: false }));
      }
    });
  };

  // LocalStorage Persistence
  useEffect(() => {
    try {
      localStorage.setItem('motor2d6_mono_pool_v3', JSON.stringify(pool));
    } catch {
      // ignore
    }
  }, [pool]);

  useEffect(() => {
    try {
      localStorage.setItem('motor2d6_mono_racas_v2', JSON.stringify(bancoRacas));
    } catch {
      // ignore
    }
  }, [bancoRacas]);

  useEffect(() => {
    try {
      const limpos = personagens.map(p => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { imagem: _ignored, ...semImg } = p;
        return semImg;
      });
      localStorage.setItem('motor2d6_mono_personagens_v3', JSON.stringify(limpos));
      localStorage.setItem('motor2d6_mono_char_ativo_id', personagemAtivoId);
      if (personagem) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { imagem: _ignored, ...charLimpo } = personagem;
        localStorage.setItem('motor2d6_mono_char_v2', JSON.stringify(charLimpo));
      }
    } catch {
      // ignore
    }
  }, [personagens, personagemAtivoId, personagem]);

  // Current character's race
  const racaAtual = useMemo(() => {
    let rId = personagem.racaId;
    if (RACE_ID_ALIASES[rId]) {
      rId = RACE_ID_ALIASES[rId];
    }
    return bancoRacas[rId] || bancoRacas['humano'] || DEFAULT_RACES.humano;
  }, [personagem.racaId, bancoRacas]);

  const getTraço = (id: string): Trait | undefined => {
    if (!id) return undefined;
    const [baseId, nivelStr] = id.split(':');
    const base = pool.find(t => t.id === baseId);
    if (!base) return undefined;

    if (base.niveis && base.niveis.length > 0) {
      const nivelNum = nivelStr ? parseInt(nivelStr, 10) : 1;
      const lvlObj = base.niveis.find(n => n.nivel === nivelNum) || base.niveis[0];
      return {
        ...base,
        id: `${base.id}:${lvlObj.nivel}`,
        baseId: base.id,
        nivel: lvlObj.nivel,
        maxNivel: base.niveis.length,
        pontos: lvlObj.pontos,
        desc: lvlObj.desc,
        modPv: lvlObj.modPv ?? 0,
        modPe: lvlObj.modPe ?? 0,
        modDesl: lvlObj.modDesl ?? 0,
        modRd: lvlObj.modRd ?? 0,
        modCargaFor: lvlObj.modCargaFor ?? 0,
      };
    }

    return {
      ...base,
      baseId: base.id,
      nivel: 1,
      maxNivel: 1,
      modPv: base.modPv ?? 0,
      modPe: base.modPe ?? 0,
      modDesl: base.modDesl ?? 0,
      modRd: base.modRd ?? 0,
      modCargaFor: base.modCargaFor ?? 0,
    };
  };

  const calcularModificadorDano = (valor: number): number => {
    return valor;
  };

  // Derived Stats for Active Character
  const derivados = useMemo(() => {
    const traçosAtivos: Trait[] = [];
    (racaAtual.vantagens || []).forEach(id => { const t = getTraço(id); if (t) traçosAtivos.push(t); });
    (racaAtual.desvantagens || []).forEach(id => { const t = getTraço(id); if (t) traçosAtivos.push(t); });
    (personagem.vantagensAdquiridas || []).forEach(id => { const t = getTraço(id); if (t) traçosAtivos.push(t); });
    (personagem.desvantagensAdquiridas || []).forEach(id => { const t = getTraço(id); if (t) traçosAtivos.push(t); });

    let modPvTraços = 0;
    let modPeTraços = 0;
    let modDeslTraços = 0;
    let modRdTraços = 0;
    let modCargaFor = 0;
    let modIniciativaTraços = 0;
    const modAtributosTraços: Record<AtributoChave, number> = {
      FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0
    };
    const modPericiasTraços: Record<string, number> = {};

    traçosAtivos.forEach(t => {
      // Modificadores visuais / diretos
      modPvTraços += (t.modPv || 0);
      modPeTraços += (t.modPe || 0);
      modDeslTraços += (t.modDesl || 0);
      modRdTraços += (t.modRd || 0);
      modCargaFor += (t.modCargaFor || 0);
      modIniciativaTraços += (t.modIniciativa || 0);

      if (t.modAtributos) {
        Object.entries(t.modAtributos).forEach(([k, v]) => {
          const atr = k as AtributoChave;
          if (atr in modAtributosTraços) {
            modAtributosTraços[atr] += (v || 0);
          }
        });
      }

      if (t.modPericias) {
        Object.entries(t.modPericias).forEach(([k, v]) => {
          modPericiasTraços[k] = (modPericiasTraços[k] || 0) + (v || 0);
        });
      }

      // Modificadores de Script / Código de Programação (se houver)
      if (t.codigoScript && t.codigoScript.trim()) {
        const parsed = executarScriptTraco(t.codigoScript);
        modPvTraços += parsed.modPv;
        modPeTraços += parsed.modPe;
        modDeslTraços += parsed.modDesl;
        modRdTraços += parsed.modRd;
        modCargaFor += parsed.modCargaFor;
        modIniciativaTraços += parsed.modIniciativa;

        Object.entries(parsed.modAtributos).forEach(([k, v]) => {
          const atr = k as AtributoChave;
          if (atr in modAtributosTraços) {
            modAtributosTraços[atr] += (v || 0);
          }
        });

        Object.entries(parsed.modPericias).forEach(([k, v]) => {
          modPericiasTraços[k] = (modPericiasTraços[k] || 0) + (v || 0);
        });
      }
    });

    const racaPvMod = racaAtual.modPv || 0;
    const racaPeMod = racaAtual.modPe || 0;
    const racaDeslMod = racaAtual.modDesl || 0;

    const con = personagem.atributos.CON + modAtributosTraços.CON;
    const des = personagem.atributos.DES + modAtributosTraços.DES;
    const forca = personagem.atributos.FOR + modAtributosTraços.FOR;

    const pvTotal = con + 20 + racaPvMod + modPvTraços;
    const peTotal = con + 10 + racaPeMod + modPeTraços; // Pontos de Esforço (PE)

    const deslBase = Math.max(1.0, ((des + 6) / 2) + racaDeslMod + modDeslTraços);
    const corrida = deslBase * 1.33;

    const forcaEfetivaCarga = forca + modCargaFor;

    // Iniciativa
    const iniciativaBase = des;
    const iniciativaTotal = iniciativaBase + modIniciativaTraços;

    // Regras Oficiais de Carga do Sistema Motor +2D6:
    // Carga Leve (Sem Penalidades): O personagem pode carregar um número de itens igual a FOR + CON + 5.
    const cargaLeve = Math.max(0, forcaEfetivaCarga + con + 5);
    // Carga Pesada (Sobrecarga): Até o dobro da Carga Leve (2x). Sofre -2 em DES, Atletismo e Esquiva/Iniciativa.
    const cargaPesada = cargaLeve * 2;
    // Carga Máxima (Limite Absoluto): Até o triplo da Carga Leve (3x). Mal consegue andar, sem bônus de esquiva, não pode correr ou lutar.
    const cargaMax = cargaLeve * 3;

    const itensCarregados = personagem.itensCarregados ?? 0;

    let estadoCarga: 'leve' | 'pesada' | 'maxima' | 'excedida' = 'leve';
    if (itensCarregados > cargaMax) {
      estadoCarga = 'excedida';
    } else if (itensCarregados > cargaPesada) {
      estadoCarga = 'maxima';
    } else if (itensCarregados > cargaLeve) {
      estadoCarga = 'pesada';
    } else {
      estadoCarga = 'leve';
    }

    const deslEfetivo = estadoCarga === 'excedida' ? 0 : estadoCarga === 'maxima' ? Number(Math.max(0.5, deslBase / 2).toFixed(1)) : deslBase;
    const corridaEfetiva = (estadoCarga === 'maxima' || estadoCarga === 'excedida') ? 0 : corrida;

    // Redução de Dano (RD) de armaduras e proteções no inventário
    const rdEquipamentos = (personagem.itensInventario || [])
      .filter(it => typeof it.rd === 'number' && it.rd > 0)
      .reduce((max, it) => Math.max(max, it.rd || 0), 0);

    const rdTotal = modRdTraços + rdEquipamentos;

    return {
      pvTotal,
      peTotal,
      deslBase,
      corrida,
      deslEfetivo,
      corridaEfetiva,
      cargaLeve,
      cargaPesada,
      cargaMax,
      itensCarregados,
      estadoCarga,
      rdTotal,
      rdEquipamentos,
      racaPvMod,
      racaPeMod,
      racaDeslMod,
      modPvTraços,
      modPeTraços,
      modDeslTraços,
      modRdTraços,
      modCargaFor,
      modIniciativaTraços,
      iniciativaTotal,
      modAtributosTraços,
      modPericiasTraços
    };
  }, [racaAtual, personagem.atributos, personagem.vantagensAdquiridas, personagem.desvantagensAdquiridas, personagem.itensCarregados, personagem.itensInventario, pool]);

  // Points & Caps: Attributes has free spending (no total points limit); Skills default 10 pts; Advantages default 5 + Disadvantages
  const tetosEPontos = useMemo(() => {
    const tetoPer = typeof personagem.tetoPericias === 'number' ? personagem.tetoPericias : 10;

    let bonusDesv = 0;
    (racaAtual.desvantagens || []).forEach(id => {
      const t = getTraço(id);
      if (t) bonusDesv += (t.pontos || 0);
    });
    (personagem.desvantagensAdquiridas || []).forEach(id => {
      const t = getTraço(id);
      if (t) bonusDesv += (t.pontos || 0);
    });

    const baseVant = typeof personagem.tetoVantagensBase === 'number' ? personagem.tetoVantagensBase : 5;
    const tetoVant = baseVant + bonusDesv;

    const gastoAttr = Object.values(personagem.atributos).reduce((a, b) => a + b, 0);
    const gastoPer = personagem.pericias.reduce((acc, p) => acc + (p.pts || 0), 0);

    let gastoVant = 0;
    (racaAtual.vantagens || []).forEach(id => {
      const t = getTraço(id);
      if (t) gastoVant += (t.pontos || 0);
    });
    (personagem.vantagensAdquiridas || []).forEach(id => {
      const t = getTraço(id);
      if (t) gastoVant += (t.pontos || 0);
    });

    return {
      gastoAttr,
      tetoPer, gastoPer, diffPer: tetoPer - gastoPer,
      tetoVant, gastoVant, diffVant: tetoVant - gastoVant,
      baseVant,
      bonusDesv
    };
  }, [personagem.atributos, personagem.pericias, personagem.vantagensAdquiridas, personagem.desvantagensAdquiridas, personagem.tetoPericias, personagem.tetoVantagensBase, racaAtual, pool]);

  // Helper to get attribute limits - race limits disabled temporarily: all races have fixed range [-1, 10]
  // With baseline 0 and 10 points to distribute, setting an attribute to -1 grants +1 extra point.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getLimitesAtributo = (_atr?: AtributoChave): { min: number; max: number } => {
    return { min: -1, max: 10 };
  };

  // Helper to calculate summary stats for any character in library
  const getResumoPersonagem = (char: Character) => {
    let rId = char.racaId;
    if (RACE_ID_ALIASES[rId]) rId = RACE_ID_ALIASES[rId];
    const charRace = bancoRacas[rId] || bancoRacas['humano'] || DEFAULT_RACES.humano;

    let modPv = 0;
    let modPe = 0;
    let modDesl = 0;

    const checkTrait = (tid: string) => {
      const t = getTraço(tid);
      if (t) {
        modPv += (t.modPv || 0);
        modPe += (t.modPe || 0);
        modDesl += (t.modDesl || 0);
      }
    };

    (charRace.vantagens || []).forEach(checkTrait);
    (charRace.desvantagens || []).forEach(checkTrait);
    (char.vantagensAdquiridas || []).forEach(checkTrait);
    (char.desvantagensAdquiridas || []).forEach(checkTrait);

    const con = char.atributos?.CON ?? 2;
    const des = char.atributos?.DES ?? 2;

    const pv = con + 20 + (charRace.modPv || 0) + modPv;
    const pe = con + 10 + (charRace.modPe || 0) + modPe;
    const desl = Math.max(1.0, ((des + 6) / 2) + (charRace.modDesl || 0) + modDesl);

    return {
      racaNome: charRace.nome,
      pv,
      pe,
      desl: desl.toFixed(1),
      periciasTreinadas: (char.pericias || []).filter(p => p.pts > 0).length,
      totalVantagens: (char.vantagensAdquiridas || []).length + (charRace.vantagens || []).length,
      totalDesvantagens: (char.desvantagensAdquiridas || []).length + (charRace.desvantagens || []).length
    };
  };

  // Mutator for Active Character
  const atualizarPersonagemAtivo = (updater: (prev: Character) => Character) => {
    setPersonagens(prevList => {
      return prevList.map(p => {
        if (p.id === personagem.id) {
          return updater(p);
        }
        return p;
      });
    });
  };

  // Attribute modifier with fixed 0 to 10 limits (down to -1 for +1 extra point to spend)
  const handleAlterarAtributo = (atr: AtributoChave, delta: number) => {
    const { min, max } = getLimitesAtributo(atr);
    const atual = personagem.atributos[atr] ?? 0;
    const novo = atual + delta;

    if (novo >= min && novo <= max) {
      atualizarPersonagemAtivo(prev => ({
        ...prev,
        atributos: {
          ...prev.atributos,
          [atr]: novo
        }
      }));
    } else {
      mostrarToast(`LIMITE DE ${atr}: ${min} A ${max}`);
    }
  };

  const handleZerarAtributos = () => {
    atualizarPersonagemAtivo(prev => ({
      ...prev,
      atributos: { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 }
    }));
    mostrarToast("TODOS OS ATRIBUTOS RESETADOS PARA 0 (DISTRIBUIÇÃO LIVRE)");
  };

  const handleAlterarPericia = (index: number, delta: number) => {
    atualizarPersonagemAtivo(prev => {
      const copy = [...prev.pericias];
      const p = copy[index];
      if (!p) return prev;
      const novo = p.pts + delta;
      if (novo >= 0 && novo <= 5) {
        copy[index] = { ...p, pts: novo };
        return { ...prev, pericias: copy };
      }
      return prev;
    });
  };

  // Carga e Inventário
  const handleAlterarItensCarregados = (delta: number) => {
    atualizarPersonagemAtivo(prev => {
      const atual = prev.itensCarregados ?? 0;
      const novo = Math.max(0, atual + delta);
      return { ...prev, itensCarregados: novo };
    });
  };

  const handleDefinirItensCarregados = (valor: number) => {
    const limpo = Math.max(0, Math.min(999, Math.floor(valor) || 0));
    atualizarPersonagemAtivo(prev => ({
      ...prev,
      itensCarregados: limpo
    }));
  };

  const handleAdicionarItemInventario = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!novoItemNome.trim()) {
      mostrarToast("INFORME O NOME DO ITEM");
      return;
    }
    const qtdNum = Math.max(1, Math.min(99, Math.floor(novoItemQtd) || 1));
    const nomeLimpo = novoItemNome.trim();
    const descLimpa = novoItemDesc.trim();

    atualizarPersonagemAtivo(prev => {
      const novoItem: InventoryItem = {
        id: "item_" + Math.random().toString(36).substring(2, 9),
        nome: nomeLimpo,
        qtd: qtdNum,
        desc: descLimpa
      };
      const listaAtualizada = [...(prev.itensInventario || []), novoItem];
      const totalSlots = listaAtualizada.reduce((acc, it) => acc + (it.qtd || 1), 0);
      return {
        ...prev,
        itensInventario: listaAtualizada,
        itensCarregados: totalSlots
      };
    });

    setNovoItemNome('');
    setNovoItemQtd(1);
    setNovoItemDesc('');
    mostrarToast(`ITEM "${nomeLimpo.toUpperCase()}" ADICIONADO AO INVENTÁRIO`);
  };

  const handleRemoverItemInventario = (itemId: string) => {
    atualizarPersonagemAtivo(prev => {
      const listaAtualizada = (prev.itensInventario || []).filter(it => it.id !== itemId);
      const totalSlots = listaAtualizada.reduce((acc, it) => acc + (it.qtd || 1), 0);
      return {
        ...prev,
        itensInventario: listaAtualizada,
        itensCarregados: totalSlots
      };
    });
    mostrarToast("ITEM REMOVIDO DO INVENTÁRIO");
  };

  const handleAlterarQtdItemInventario = (itemId: string, delta: number) => {
    atualizarPersonagemAtivo(prev => {
      const listaAtualizada = (prev.itensInventario || []).map(it => {
        if (it.id !== itemId) return it;
        const novaQtd = Math.max(1, (it.qtd || 1) + delta);
        return { ...it, qtd: novaQtd };
      });
      const totalSlots = listaAtualizada.reduce((acc, it) => acc + (it.qtd || 1), 0);
      return {
        ...prev,
        itensInventario: listaAtualizada,
        itensCarregados: totalSlots
      };
    });
  };

  const handleEquiparItemCatalogo = (itemCat: CatalogItem) => {
    atualizarPersonagemAtivo(prev => {
      const novoItem: InventoryItem = {
        id: "item_" + Math.random().toString(36).substring(2, 9),
        nome: itemCat.nome,
        qtd: itemCat.qtd || 1,
        desc: itemCat.desc || '',
        categoria: itemCat.categoria,
        dano: itemCat.dano,
        tipoDano: itemCat.tipoDano,
        rd: itemCat.rd,
        alcance: itemCat.alcance,
        preco: itemCat.preco,
        modIniciativa: itemCat.modIniciativa
      };
      const listaAtualizada = [...(prev.itensInventario || []), novoItem];
      const totalSlots = listaAtualizada.reduce((acc, it) => acc + (it.qtd || 1), 0);
      return {
        ...prev,
        itensInventario: listaAtualizada,
        itensCarregados: totalSlots
      };
    });
    mostrarToast(`"${itemCat.nome.toUpperCase()}" ADICIONADO AO INVENTÁRIO`);
  };

  const itensCatalogoFiltrados = useMemo(() => {
    return bancoItens.filter(item => {
      const matchCat = categoriaCatalogo === 'todos' || item.categoria === categoriaCatalogo;
      if (!matchCat) return false;
      if (!buscaCatalogo.trim()) return true;
      const q = buscaCatalogo.toLowerCase();
      return (
        item.nome.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q)) ||
        (item.detalhes && item.detalhes.toLowerCase().includes(q)) ||
        (item.dano && item.dano.toLowerCase().includes(q)) ||
        (item.tipoDano && item.tipoDano.toLowerCase().includes(q))
      );
    });
  }, [bancoItens, categoriaCatalogo, buscaCatalogo]);

  const itensDevFiltrados = useMemo(() => {
    return bancoItens.filter(item => {
      const matchCat = filtroDevItensCat === 'todos' || item.categoria === filtroDevItensCat;
      if (!matchCat) return false;
      if (!buscaDevItens.trim()) return true;
      const q = buscaDevItens.toLowerCase();
      return (
        item.nome.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q)) ||
        (item.detalhes && item.detalhes.toLowerCase().includes(q)) ||
        (item.dano && item.dano.toLowerCase().includes(q)) ||
        (item.tipoDano && item.tipoDano.toLowerCase().includes(q))
      );
    });
  }, [bancoItens, filtroDevItensCat, buscaDevItens]);

  const handleSelecionarRaca = (racaId: string) => {
    const alvo = bancoRacas[racaId];
    if (!alvo) return;
    atualizarPersonagemAtivo(prev => ({
      ...prev,
      racaId
    }));
    mostrarToast(`RAÇA ALTERADA: ${alvo.nome.toUpperCase()}`);
  };

  // Trait adding, leveling & removing
  const handleAdicionarVantagem = (id: string, nivel?: number) => {
    if (!id) return;
    const baseId = id.split(':')[0];
    const baseTraço = pool.find(t => t.id === baseId);
    const nivelFinal = nivel || (id.includes(':') ? parseInt(id.split(':')[1], 10) : 1);
    const idArmazenado = (baseTraço?.niveis && baseTraço.niveis.length > 0) ? `${baseId}:${nivelFinal}` : baseId;

    if (!personagem.vantagensAdquiridas.some(v => v.split(':')[0] === baseId)) {
      atualizarPersonagemAtivo(prev => ({
        ...prev,
        vantagensAdquiridas: [...prev.vantagensAdquiridas, idArmazenado]
      }));
      const t = getTraço(idArmazenado);
      let bonusMsg = "";
      if (t?.modPv) bonusMsg = ` (+${t.modPv} PV)`;
      else if (t?.modPe) bonusMsg = ` (+${t.modPe} PE)`;
      else if (t?.modDesl) bonusMsg = ` (+${t.modDesl} DESL)`;
      else if (t?.modRd) bonusMsg = ` (RD ${t.modRd})`;
      else if (t?.modCargaFor) bonusMsg = ` (FOR+${t.modCargaFor})`;

      mostrarToast(`VANTAGEM "${(t?.nome || baseId).toUpperCase()}" ADICIONADA${bonusMsg}`);
    }
  };

  const handleAlterarNivelVantagem = (idComNivel: string, novoNivel: number) => {
    const baseId = idComNivel.split(':')[0];
    const baseTraço = pool.find(t => t.id === baseId);
    if (!baseTraço?.niveis || baseTraço.niveis.length === 0) return;

    const maxLvl = baseTraço.niveis.length;
    const nivelClamped = Math.max(1, Math.min(maxLvl, novoNivel));
    const novoIdArmazenado = `${baseId}:${nivelClamped}`;

    atualizarPersonagemAtivo(prev => ({
      ...prev,
      vantagensAdquiridas: prev.vantagensAdquiridas.map(v => {
        if (v.split(':')[0] === baseId) {
          return novoIdArmazenado;
        }
        return v;
      })
    }));

    const traçoAtualizado = getTraço(novoIdArmazenado);
    let extraBonusMsg = "";
    if (traçoAtualizado?.modPv) extraBonusMsg = ` (+${traçoAtualizado.modPv} PV)`;
    else if (traçoAtualizado?.modPe) extraBonusMsg = ` (+${traçoAtualizado.modPe} PE)`;
    else if (traçoAtualizado?.modDesl) extraBonusMsg = ` (+${traçoAtualizado.modDesl} DESL)`;
    else if (traçoAtualizado?.modRd) extraBonusMsg = ` (RD ${traçoAtualizado.modRd})`;
    else if (traçoAtualizado?.modCargaFor) extraBonusMsg = ` (FOR+${traçoAtualizado.modCargaFor})`;

    mostrarToast(`${baseTraço.nome.toUpperCase()} -> NÍVEL ${nivelClamped}${extraBonusMsg}`);
  };

  const handleAdicionarDesvantagem = (id: string, nivel?: number) => {
    if (!id) return;
    const baseId = id.split(':')[0];
    const baseTraço = pool.find(t => t.id === baseId);
    const nivelFinal = nivel || (id.includes(':') ? parseInt(id.split(':')[1], 10) : 1);
    const idArmazenado = (baseTraço?.niveis && baseTraço.niveis.length > 0) ? `${baseId}:${nivelFinal}` : baseId;

    if (!personagem.desvantagensAdquiridas.some(d => d.split(':')[0] === baseId)) {
      atualizarPersonagemAtivo(prev => ({
        ...prev,
        desvantagensAdquiridas: [...prev.desvantagensAdquiridas, idArmazenado]
      }));
      const t = getTraço(idArmazenado);
      mostrarToast(`DESVANTAGEM "${(t?.nome || baseId).toUpperCase()}" ADICIONADA`);
    }
  };

  const handleAlterarNivelDesvantagem = (id: string, novoNivel: number) => {
    const baseId = id.split(':')[0];
    const baseTraço = pool.find(t => t.id === baseId);
    if (!baseTraço || !baseTraço.niveis || baseTraço.niveis.length === 0) return;

    const maxLvl = baseTraço.niveis.length;
    const nivelClamped = Math.max(1, Math.min(maxLvl, novoNivel));
    const novoIdArmazenado = `${baseId}:${nivelClamped}`;

    atualizarPersonagemAtivo(prev => ({
      ...prev,
      desvantagensAdquiridas: prev.desvantagensAdquiridas.map(d => {
        if (d.split(':')[0] === baseId) {
          return novoIdArmazenado;
        }
        return d;
      })
    }));

    mostrarToast(`${baseTraço.nome.toUpperCase()} -> NÍVEL ${nivelClamped}`);
  };

  const handleRemoverTraçoPersonagem = (id: string, tipo: 'vantagem' | 'desvantagem') => {
    const baseId = id.split(':')[0];
    atualizarPersonagemAtivo(prev => {
      if (tipo === 'vantagem') {
        return {
          ...prev,
          vantagensAdquiridas: prev.vantagensAdquiridas.filter(v => v.split(':')[0] !== baseId)
        };
      } else {
        return {
          ...prev,
          desvantagensAdquiridas: prev.desvantagensAdquiridas.filter(d => d.split(':')[0] !== baseId)
        };
      }
    });
    mostrarToast("TRAÇO REMOVIDO DA FICHA");
  };

  // Trait Management for Race Editor Draft (Vincular, Alterar Nível, Remover)
  const handleVincularTraçoRaca = (id: string, tipo: 'vantagem' | 'desvantagem', nivel?: number) => {
    const baseId = id.split(':')[0];
    const baseTraço = pool.find(t => t.id === baseId);
    const nivelFinal = nivel || (id.includes(':') ? parseInt(id.split(':')[1], 10) : 1);
    const idArmazenado = (baseTraço?.niveis && baseTraço.niveis.length > 0) ? `${baseId}:${nivelFinal}` : baseId;

    if (tipo === 'vantagem') {
      if (!racaEditorDraft.vantagens.some(v => v.split(':')[0] === baseId)) {
        setRacaEditorDraft(prev => ({
          ...prev,
          vantagens: [...prev.vantagens, idArmazenado]
        }));
        const t = getTraço(idArmazenado);
        mostrarToast(`VANTAGEM RACIAL "${(t?.nome || baseId).toUpperCase()}" VINCULADA`);
      }
    } else {
      if (!racaEditorDraft.desvantagens.some(d => d.split(':')[0] === baseId)) {
        setRacaEditorDraft(prev => ({
          ...prev,
          desvantagens: [...prev.desvantagens, idArmazenado]
        }));
        const t = getTraço(idArmazenado);
        mostrarToast(`DESVANTAGEM RACIAL "${(t?.nome || baseId).toUpperCase()}" VINCULADA`);
      }
    }
  };

  const handleAlterarNivelTraçoRaca = (idOuBaseId: string, tipo: 'vantagem' | 'desvantagem', novoNivel: number) => {
    const baseId = idOuBaseId.split(':')[0];
    const baseTraço = pool.find(t => t.id === baseId);
    const maxLvl = baseTraço?.niveis?.length || 1;
    const nivelClamped = Math.max(1, Math.min(maxLvl, novoNivel));
    const novoIdArmazenado = `${baseId}:${nivelClamped}`;

    setRacaEditorDraft(prev => {
      if (tipo === 'vantagem') {
        return {
          ...prev,
          vantagens: prev.vantagens.map(v => v.split(':')[0] === baseId ? novoIdArmazenado : v)
        };
      } else {
        return {
          ...prev,
          desvantagens: prev.desvantagens.map(d => d.split(':')[0] === baseId ? novoIdArmazenado : d)
        };
      }
    });

    const t = getTraço(novoIdArmazenado);
    let extraBonusMsg = "";
    if (t?.modPv) extraBonusMsg = ` (+${t.modPv} PV)`;
    else if (t?.modPe) extraBonusMsg = ` (+${t.modPe} PE)`;
    else if (t?.modDesl) extraBonusMsg = ` (+${t.modDesl} DESL)`;
    else if (t?.modRd) extraBonusMsg = ` (RD ${t.modRd})`;
    else if (t?.modCargaFor) extraBonusMsg = ` (FOR+${t.modCargaFor})`;

    mostrarToast(`${(baseTraço?.nome || baseId).toUpperCase()} RACIAL -> NÍVEL ${nivelClamped}${extraBonusMsg}`);
  };

  const handleRemoverTraçoRaca = (id: string, tipo: 'vantagem' | 'desvantagem') => {
    const baseId = id.split(':')[0];
    setRacaEditorDraft(prev => {
      if (tipo === 'vantagem') {
        return {
          ...prev,
          vantagens: prev.vantagens.filter(v => v.split(':')[0] !== baseId)
        };
      } else {
        return {
          ...prev,
          desvantagens: prev.desvantagens.filter(d => d.split(':')[0] !== baseId)
        };
      }
    });
    mostrarToast("TRAÇO RACIAL DESVINCULADO");
  };

  // Adjust Points Ceiling (Tetos de Perícias e Vantagens)
  const handleAjustarTetoPericias = (delta: number) => {
    const atual = typeof personagem.tetoPericias === 'number' ? personagem.tetoPericias : 10;
    const novo = Math.max(0, atual + delta);
    atualizarPersonagemAtivo(prev => ({
      ...prev,
      tetoPericias: novo
    }));
    mostrarToast(`TETO DE PERÍCIAS ALTERADO: ${novo} PTS`);
  };

  const handleAjustarTetoVantagens = (delta: number) => {
    const atualBase = typeof personagem.tetoVantagensBase === 'number' ? personagem.tetoVantagensBase : 5;
    const novoBase = Math.max(0, atualBase + delta);
    atualizarPersonagemAtivo(prev => ({
      ...prev,
      tetoVantagensBase: novoBase
    }));
    const bonusDesv = tetosEPontos.bonusDesv;
    mostrarToast(`TETO DE VANTAGENS: ${novoBase + bonusDesv} PTS (${novoBase} BASE + ${bonusDesv} DESV)`);
  };

  // Character Management (Multi-character)
  const handleCriarNovoPersonagem = () => {
    const novoId = "char_" + Date.now().toString(36);
    const novoChar: Character = {
      id: novoId,
      nome: `Novo Aventureiro ${personagens.length + 1}`,
      nivel: 1,
      racaId: 'humano',
      atributos: { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
      pericias: JSON.parse(JSON.stringify(DEFAULT_SKILLS)),
      vantagensAdquiridas: [],
      desvantagensAdquiridas: [],
      tetoPericias: 10,
      tetoVantagensBase: 5,
      itensCarregados: 0,
      itensInventario: []
    };
    setPersonagens(prev => [...prev, novoChar]);
    setPersonagemAtivoId(novoId);
    mostrarToast("NOVO PERSONAGEM CRIADO (ATRIBUTOS EM 0, DISTRIBUIÇÃO LIVRE)");
  };

  const handleDuplicarPersonagem = (charParaDuplicar?: Character) => {
    const base = charParaDuplicar || personagem;
    const novoId = "char_copy_" + Date.now().toString(36);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imagem: _ignored, ...baseLimpa } = base;
    const copia: Character = {
      ...JSON.parse(JSON.stringify(baseLimpa)),
      id: novoId,
      nome: `${base.nome} [CÓPIA]`
    };
    if (avatares[base.id]) {
      const img = avatares[base.id];
      setAvatares(prev => ({ ...prev, [novoId]: img }));
      salvarAvatarNoStorage(novoId, img);
    }
    setPersonagens(prev => [...prev, copia]);
    setPersonagemAtivoId(novoId);
    mostrarToast(`PERSONAGEM "${copia.nome.toUpperCase()}" DUPLICADO`);
  };

  const handleExcluirPersonagem = (charParaExcluir?: Character) => {
    const alvo = charParaExcluir || (personagens.length > 0 ? personagem : null);
    if (!alvo) return;
    abrirConfirm(
      "EXCLUIR PERSONAGEM",
      `Deseja realmente apagar a ficha de "${alvo.nome.toUpperCase()}"? Esta ação não pode ser desfeita.`,
      () => {
        const idParaRemover = alvo.id;
        const restantes = personagens.filter(p => p.id !== idParaRemover);
        setPersonagens(restantes);
        if (personagemAtivoId === idParaRemover) {
          if (restantes.length > 0) {
            setPersonagemAtivoId(restantes[0].id);
          } else {
            setPersonagemAtivoId('');
            setAbaAtiva('biblioteca');
          }
        }
        removerAvatarDoStorage(idParaRemover);
        setAvatares(prev => {
          const next = { ...prev };
          delete next[idParaRemover];
          return next;
        });
        mostrarToast("PERSONAGEM EXCLUÍDO");
      }
    );
  };

  const abrirFichaPersonagem = (charId: string) => {
    setPersonagemAtivoId(charId);
    setAbaAtiva('ficha');
    const p = personagens.find(x => x.id === charId);
    if (p) {
      mostrarToast(`FICHA ABERTA: ${p.nome.toUpperCase()}`);
    }
  };

  // ==========================================
  // EXPORT / IMPORT: FICHA INDIVIDUAL (1 por JSON)
  // ==========================================
  const exportarFichaPersonagem = (charParaExportar: Character) => {
    // SECURITY: A imagem nunca é incluída no JSON exportado
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imagem: _ignoredImg, ...charSemImagem } = charParaExportar;
    const exportData: CharacterExport = {
      sistema: "motor2d6_tio_nitro",
      tipo: "ficha_personagem",
      versao: "2.3",
      dataExportacao: new Date().toISOString(),
      personagem: charSemImagem
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeNome = (charParaExportar.nome || 'aventureiro').toLowerCase().replace(/[^a-z0-9]+/gi, '_');
    a.download = `ficha_motor2d6_${safeNome}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarToast(`FICHA DE "${charParaExportar.nome.toUpperCase()}" EXPORTADA`);
  };

  const importarFichaPersonagem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dados = JSON.parse(evt.target?.result as string);
        let charData: Character | undefined;

        if (dados.tipo === 'ficha_personagem' && dados.personagem) {
          charData = dados.personagem;
        } else if (dados.personagem && dados.personagem.atributos) {
          charData = dados.personagem;
        } else if (dados.atributos && dados.nome) {
          charData = dados as Character;
        }

        if (charData && charData.atributos) {
          let cRaca = charData.racaId;
          if (RACE_ID_ALIASES[cRaca]) cRaca = RACE_ID_ALIASES[cRaca];
          if (!bancoRacas[cRaca]) cRaca = 'humano';

          // SECURITY: Imagens vindas do arquivo JSON são descartadas
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { imagem: _ignoredImg, ...charLimpoImportado } = charData;

          const novoChar: Character = {
            ...charLimpoImportado,
            id: "char_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
            racaId: cRaca,
            atributos: {
              FOR: charData.atributos.FOR ?? 2,
              DES: charData.atributos.DES ?? 2,
              CON: charData.atributos.CON ?? 2,
              INT: charData.atributos.INT ?? 2,
              SAB: charData.atributos.SAB ?? 2,
              CAR: charData.atributos.CAR ?? 2
            },
            pericias: charData.pericias && charData.pericias.length > 0 ? charData.pericias : [...DEFAULT_SKILLS],
            vantagensAdquiridas: Array.isArray(charData.vantagensAdquiridas) ? charData.vantagensAdquiridas : [],
            desvantagensAdquiridas: Array.isArray(charData.desvantagensAdquiridas) ? charData.desvantagensAdquiridas : [],
            tetoPericias: typeof charData.tetoPericias === 'number' ? charData.tetoPericias : 10,
            tetoVantagensBase: typeof charData.tetoVantagensBase === 'number' ? charData.tetoVantagensBase : 5
          };

          setPersonagens(prev => [...prev, novoChar]);
          setPersonagemAtivoId(novoChar.id);
          mostrarToast(`FICHA "${novoChar.nome.toUpperCase()}" IMPORTADA COM SUCESSO!`);
        } else {
          mostrarToast("ARQUIVO JSON NÃO CONTÉM UMA FICHA DE PERSONAGEM VÁLIDA");
        }
      } catch {
        mostrarToast("ERRO AO PROCESSAR FICHA JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ==========================================
  // EXPORT / IMPORT: PACKS DE RAÇAS (CRIADOR DE RAÇAS)
  // ==========================================
  const exportarPackRacas = () => {
    const pack: RacePackExport = {
      sistema: "motor2d6_tio_nitro",
      tipo: "pack_racas",
      versao: "2.3",
      dataExportacao: new Date().toISOString(),
      racas: Object.values(bancoRacas)
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motor2d6_pack_racas_${Object.keys(bancoRacas).length}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarToast(`PACK COM ${Object.keys(bancoRacas).length} RAÇAS EXPORTADO COM SUCESSO`);
  };

  const importarPackRacas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dados = JSON.parse(evt.target?.result as string);
        let racasParaAdicionar: Race[] = [];

        if (dados.tipo === 'pack_racas' && Array.isArray(dados.racas)) {
          racasParaAdicionar = dados.racas;
        } else if (dados.bancoRacas && typeof dados.bancoRacas === 'object') {
          racasParaAdicionar = Object.values(dados.bancoRacas);
        } else if (Array.isArray(dados)) {
          racasParaAdicionar = dados;
        }

        if (racasParaAdicionar.length > 0) {
          let count = 0;
          setBancoRacas(prev => {
            const next = { ...prev };
            racasParaAdicionar.forEach(r => {
              if (r.id && r.nome && r.limites) {
                next[r.id] = { ...r };
                count++;
              }
            });
            return next;
          });
          mostrarToast(`PACK DE RAÇAS IMPORTADO: ${count} RAÇAS CARREGADAS/ATUALIZADAS`);
        } else {
          mostrarToast("NENHUMA RAÇA ENCONTRADA NO ARQUIVO JSON");
        }
      } catch {
        mostrarToast("ERRO AO PROCESSAR PACK DE RAÇAS");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ==========================================
  // EXPORT / IMPORT: PACKS DE TRAÇOS (POOL DE TRAÇOS)
  // ==========================================
  const exportarPackTracos = () => {
    const pack: TraitPackExport = {
      sistema: "motor2d6_tio_nitro",
      tipo: "pack_tracos",
      versao: "2.3",
      dataExportacao: new Date().toISOString(),
      tracos: pool
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motor2d6_pack_tracos_${pool.length}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarToast(`PACK COM ${pool.length} TRAÇOS EXPORTADO COM SUCESSO`);
  };

  const importarPackTracos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dados = JSON.parse(evt.target?.result as string);
        let tracosParaAdicionar: Trait[] = [];

        if (dados.tipo === 'pack_tracos' && Array.isArray(dados.tracos)) {
          tracosParaAdicionar = dados.tracos;
        } else if (Array.isArray(dados.poolTraços)) {
          tracosParaAdicionar = dados.poolTraços;
        } else if (Array.isArray(dados)) {
          tracosParaAdicionar = dados;
        }

        if (tracosParaAdicionar.length > 0) {
          let adicionados = 0;
          setPool(prev => {
            const mapa = new Map(prev.map(t => [t.id, t]));
            tracosParaAdicionar.forEach(t => {
              if (t.id && t.nome && t.tipo) {
                mapa.set(t.id, t);
                adicionados++;
              }
            });
            return Array.from(mapa.values());
          });
          mostrarToast(`PACK DE TRAÇOS IMPORTADO: ${adicionados} TRAÇOS CARREGADOS`);
        } else {
          mostrarToast("NENHUM TRAÇO VÁLIDO ENCONTRADO NO ARQUIVO JSON");
        }
      } catch {
        mostrarToast("ERRO AO PROCESSAR PACK DE TRAÇOS");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Race Editor Actions
  const carregarRacaNoEditor = (id: string) => {
    const r = bancoRacas[id] || DEFAULT_RACES[id];
    if (r) {
      setRacaEditorId(r.id);
      setRacaEditorDraft(JSON.parse(JSON.stringify(r)));
    }
  };

  const prepararNovaRaca = () => {
    const novoId = "raca_" + Date.now().toString(36);
    const nova: Race = {
      id: novoId,
      nome: "NOVA RAÇA",
      desc: "Descrição anatômica e limites biológicos.",
      limites: { FOR: [1, 5], DES: [1, 5], CON: [1, 5], INT: [1, 5], SAB: [1, 5], CAR: [1, 5] },
      modPv: 0,
      modPe: 0,
      modDesl: 0,
      vantagens: [],
      desvantagens: [],
      isDefault: false
    };
    setRacaEditorId(novoId);
    setRacaEditorDraft(nova);
    mostrarToast("PREPARADA NOVA RAÇA NO EDITOR");
  };

  const salvarRacaEditor = () => {
    if (!racaEditorDraft.nome.trim()) {
      mostrarToast("O NOME DA RAÇA É OBRIGATÓRIO");
      return;
    }
    setBancoRacas(prev => ({
      ...prev,
      [racaEditorDraft.id]: { ...racaEditorDraft }
    }));
    mostrarToast(`RAÇA ${racaEditorDraft.nome.toUpperCase()} SALVA`);
  };

  const duplicarRacaEditor = () => {
    const novoId = "raca_copia_" + Date.now().toString(36);
    const copia: Race = {
      ...JSON.parse(JSON.stringify(racaEditorDraft)),
      id: novoId,
      nome: `${racaEditorDraft.nome} [CÓPIA]`,
      isDefault: false
    };
    setBancoRacas(prev => ({
      ...prev,
      [novoId]: copia
    }));
    setRacaEditorId(novoId);
    setRacaEditorDraft(copia);
    mostrarToast("RAÇA DUPLICADA COM SUCESSO");
  };

  const excluirRacaEditor = () => {
    if (racaEditorDraft.isDefault) {
      mostrarToast("RAÇAS PADRÃO DO SISTEMA NÃO PODEM SER EXCLUÍDAS");
      return;
    }
    abrirConfirm(
      "EXCLUIR RAÇA",
      `Deseja realmente apagar a raça ${racaEditorDraft.nome.toUpperCase()}? Fichas com ela selecionada voltarão para Humano.`,
      () => {
        const idApagado = racaEditorDraft.id;
        setBancoRacas(prev => {
          const c = { ...prev };
          delete c[idApagado];
          return c;
        });
        setPersonagens(prevList => {
          return prevList.map(p => {
            if (p.racaId === idApagado) {
              return { ...p, racaId: 'humano' };
            }
            return p;
          });
        });
        carregarRacaNoEditor('humano');
        mostrarToast("RAÇA EXCLUÍDA");
      }
    );
  };

  const restaurarRacasPadrao = () => {
    abrirConfirm(
      "RESTAURAR RAÇAS PADRÃO",
      "Deseja restaurar o banco para as 6 raças padrão oficiais (Humanos, Urgos, Anões, Esqueletos, Goblins e Elfos)? Raças customizadas serão excluídas.",
      () => {
        setBancoRacas({ ...DEFAULT_RACES });
        setRacaEditorId('humano');
        setRacaEditorDraft(DEFAULT_RACES.humano);
        setPersonagens(prevList => {
          return prevList.map(p => {
            if (!DEFAULT_RACES[p.racaId]) {
              return { ...p, racaId: 'humano' };
            }
            return p;
          });
        });
        mostrarToast("6 RAÇAS PADRÃO RESTAURADAS");
      }
    );
  };

  // Trait Pool Actions (Advanced Modifiers & Code Scripting)
  const limparFormularioTraco = () => {
    setTracoEditandoId(null);
    setNovoTracoNome('');
    setNovoTracoDesc('');
    setNovoTracoPontos(2);
    setNovoTracoPv(0);
    setNovoTracoPe(0);
    setNovoTracoDesl(0);
    setNovoTracoRd(0);
    setNovoTracoCargaFor(0);
    setNovoTracoIniciativa(0);
    setNovoTracoAtributos({});
    setNovoTracoPericias({});
    setNovoTracoScript('');
    setAbaEditorTraco('visual');
  };

  const carregarTracoParaEdicao = (t: Trait) => {
    setTracoEditandoId(t.id);
    setNovoTracoTipo(t.tipo);
    setNovoTracoNome(t.nome);
    setNovoTracoPontos(t.pontos);
    setNovoTracoDesc(t.desc);
    setNovoTracoPv(t.modPv || 0);
    setNovoTracoPe(t.modPe || 0);
    setNovoTracoDesl(t.modDesl || 0);
    setNovoTracoRd(t.modRd || 0);
    setNovoTracoCargaFor(t.modCargaFor || 0);
    setNovoTracoIniciativa(t.modIniciativa || 0);
    setNovoTracoAtributos(t.modAtributos ? { ...t.modAtributos } : {});
    setNovoTracoPericias(t.modPericias ? { ...t.modPericias } : {});
    setNovoTracoScript(t.codigoScript || '');
    if (t.codigoScript && t.codigoScript.trim().length > 0) {
      setAbaEditorTraco('codigo');
    } else {
      setAbaEditorTraco('visual');
    }
    mostrarToast(`CARREGANDO "${t.nome.toUpperCase()}" NO EDITOR DE TRAÇOS`);
  };

  const gerarCodigoDosCamposVisuais = () => {
    const scriptGerado = gerarScriptPadrao({
      pv: novoTracoPv,
      pe: novoTracoPe,
      desl: novoTracoDesl,
      rd: novoTracoRd,
      cargaFor: novoTracoCargaFor,
      iniciativa: novoTracoIniciativa,
      atributos: novoTracoAtributos,
      pericias: novoTracoPericias
    });
    setNovoTracoScript(scriptGerado);
    setAbaEditorTraco('codigo');
    mostrarToast("CÓDIGO GERADO DOS CAMPOS VISUAIS COM SUCESSO!");
  };

  const aplicarCodigoAosCamposVisuais = () => {
    const res = executarScriptTraco(novoTracoScript);
    setNovoTracoPv(res.modPv);
    setNovoTracoPe(res.modPe);
    setNovoTracoDesl(res.modDesl);
    setNovoTracoRd(res.modRd);
    setNovoTracoCargaFor(res.modCargaFor);
    setNovoTracoIniciativa(res.modIniciativa);
    setNovoTracoAtributos({ ...res.modAtributos });
    setNovoTracoPericias({ ...res.modPericias });
    setAbaEditorTraco('visual');
    mostrarToast("MODIFICADORES DO CÓDIGO APLICADOS AOS CAMPOS VISUAIS!");
  };

  const injetarSnippetCodigo = (snippet: string) => {
    setNovoTracoScript(prev => {
      if (!prev.trim()) return snippet;
      return prev.trimEnd() + '\n' + snippet;
    });
  };

  const cadastrarNovoTraco = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTracoNome.trim() || !novoTracoDesc.trim()) {
      mostrarToast("PREENCHA NOME E REGRA DO TRAÇO");
      return;
    }

    if (tracoEditandoId) {
      // Modo Edição de Traço Existente
      setPool(prev => prev.map(t => {
        if (t.id === tracoEditandoId) {
          return {
            ...t,
            tipo: novoTracoTipo,
            nome: novoTracoNome.trim(),
            pontos: Math.max(1, Math.min(5, Number(novoTracoPontos) || 1)),
            desc: novoTracoDesc.trim(),
            modPv: Number(novoTracoPv) || 0,
            modPe: Number(novoTracoPe) || 0,
            modDesl: Number(novoTracoDesl) || 0,
            modRd: Number(novoTracoRd) || 0,
            modCargaFor: Number(novoTracoCargaFor) || 0,
            modIniciativa: Number(novoTracoIniciativa) || 0,
            modAtributos: Object.keys(novoTracoAtributos).length > 0 ? novoTracoAtributos : undefined,
            modPericias: Object.keys(novoTracoPericias).length > 0 ? novoTracoPericias : undefined,
            codigoScript: novoTracoScript.trim() || undefined
          };
        }
        return t;
      }));
      mostrarToast(`TRAÇO "${novoTracoNome.toUpperCase()}" ATUALIZADO COM SUCESSO`);
      limparFormularioTraco();
      return;
    }

    // Modo Criação de Novo Traço
    const id = "t_" + Date.now().toString(36);
    const novo: Trait = {
      id,
      tipo: novoTracoTipo,
      nome: novoTracoNome.trim(),
      pontos: Math.max(1, Math.min(5, Number(novoTracoPontos) || 1)),
      desc: novoTracoDesc.trim(),
      modPv: Number(novoTracoPv) || 0,
      modPe: Number(novoTracoPe) || 0,
      modDesl: Number(novoTracoDesl) || 0,
      modRd: Number(novoTracoRd) || 0,
      modCargaFor: Number(novoTracoCargaFor) || 0,
      modIniciativa: Number(novoTracoIniciativa) || 0,
      modAtributos: Object.keys(novoTracoAtributos).length > 0 ? novoTracoAtributos : undefined,
      modPericias: Object.keys(novoTracoPericias).length > 0 ? novoTracoPericias : undefined,
      codigoScript: novoTracoScript.trim() || undefined
    };
    setPool(prev => [...prev, novo]);
    mostrarToast(`TRAÇO "${novo.nome.toUpperCase()}" ADICIONADO À POOL`);
    limparFormularioTraco();
  };

  // ==========================================
  // ARSENAL & ITENS: AÇÕES DE DESENVOLVEDOR
  // ==========================================
  const cadastrarOuSalvarItemArsenal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemEditorDraft.nome.trim()) {
      mostrarToast("O NOME DO ITEM É OBRIGATÓRIO");
      return;
    }

    if (editandoItemId) {
      setBancoItens(prev => prev.map(it => it.id === editandoItemId ? { ...itemEditorDraft } : it));
      mostrarToast(`ITEM "${itemEditorDraft.nome.toUpperCase()}" ATUALIZADO NO ARSENAL`);
      cancelarEdicaoItem();
    } else {
      const novoId = "item_custom_" + Date.now().toString(36);
      const novoItem: CatalogItem = {
        ...itemEditorDraft,
        id: novoId
      };
      setBancoItens(prev => [novoItem, ...prev]);
      mostrarToast(`ITEM "${novoItem.nome.toUpperCase()}" CADASTRADO NO ARSENAL`);
      cancelarEdicaoItem();
    }
  };

  const carregarItemParaEdicao = (it: CatalogItem) => {
    setEditandoItemId(it.id || it.idCatalogo || null);
    setItemEditorDraft({ ...it });
    mostrarToast(`CARREGANDO "${it.nome.toUpperCase()}" PARA EDIÇÃO`);
  };

  const cancelarEdicaoItem = () => {
    setEditandoItemId(null);
    setItemEditorDraft({
      id: 'item_custom_' + Date.now().toString(36),
      nome: '',
      categoria: 'arma_fogo',
      qtd: 1,
      dano: '',
      tipoDano: '',
      rd: 0,
      alcance: '',
      modIniciativa: 0,
      preco: '',
      desc: '',
      detalhes: ''
    });
  };

  const duplicarItemArsenal = (it: CatalogItem) => {
    const clone: CatalogItem = {
      ...it,
      id: "item_custom_" + Date.now().toString(36),
      nome: `[CÓPIA] ${it.nome}`
    };
    setBancoItens(prev => [clone, ...prev]);
    mostrarToast(`ITEM "${it.nome.toUpperCase()}" DUPLICADO`);
  };

  const excluirItemArsenal = (id: string) => {
    const it = bancoItens.find(x => x.id === id);
    if (!it) return;
    abrirConfirm(
      "EXCLUIR ITEM DO ARSENAL",
      `Deseja realmente remover "${it.nome.toUpperCase()}" do arsenal?`,
      () => {
        setBancoItens(prev => prev.filter(x => x.id !== id));
        if (editandoItemId === id) {
          cancelarEdicaoItem();
        }
        mostrarToast(`ITEM "${it.nome.toUpperCase()}" REMOVIDO DO ARSENAL`);
      }
    );
  };

  const exportarPackItens = () => {
    const pack: ItemPackExport = {
      sistema: "motor2d6_tio_nitro",
      tipo: "pack_itens",
      versao: "2.3",
      dataExportacao: new Date().toISOString(),
      itens: bancoItens
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motor2d6_pack_arsenal_${bancoItens.length}_itens.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarToast(`PACK DO ARSENAL EXPORTADO (${bancoItens.length} ITENS)`);
  };

  const importarPackItens = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dados = JSON.parse(evt.target?.result as string);
        let itensParaAdicionar: CatalogItem[] = [];
        if (dados.tipo === 'pack_itens' && Array.isArray(dados.itens)) {
          itensParaAdicionar = dados.itens;
        } else if (Array.isArray(dados.bancoItens)) {
          itensParaAdicionar = dados.bancoItens;
        } else if (Array.isArray(dados)) {
          itensParaAdicionar = dados;
        }

        if (itensParaAdicionar.length > 0) {
          let adicionados = 0;
          setBancoItens(prev => {
            const mapa = new Map(prev.map(it => [it.id, it]));
            itensParaAdicionar.forEach(it => {
              if (it.id && it.nome) {
                mapa.set(it.id, it);
                adicionados++;
              }
            });
            return Array.from(mapa.values());
          });
          mostrarToast(`PACK DE ITENS IMPORTADO: ${adicionados} ITENS CARREGADOS NO ARSENAL`);
        } else {
          mostrarToast("NENHUM ITEM VÁLIDO ENCONTRADO NO ARQUIVO JSON");
        }
      } catch {
        mostrarToast("ERRO AO PROCESSAR PACK DE ITENS");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const restaurarArsenalPadrao = () => {
    abrirConfirm(
      "RESTAURAR ARSENAL PADRÃO",
      "Deseja restaurar o arsenal para a lista original canônica de 28 itens de 1935-1940 & Steampunk? Itens personalizados adicionados serão perdidos se não exportados.",
      () => {
        setBancoItens([...CATALOGO_EQUIPAMENTOS_1940]);
        cancelarEdicaoItem();
        mostrarToast("ARSENAL PADRÃO RESTAURADO COM SUCESSO");
      }
    );
  };

  const excluirTracoPool = (id: string) => {
    const t = getTraço(id);
    if (!t) return;
    abrirConfirm(
      "EXCLUIR TRAÇO DA POOL",
      `Deseja excluir "${t.nome.toUpperCase()}"? Ele será removido de todas as raças e fichas.`,
      () => {
        setPool(prev => prev.filter(item => item.id !== id));
        setBancoRacas(prev => {
          const nextRacas: Record<string, Race> = {};
          Object.keys(prev).forEach(k => {
            const r = prev[k];
            nextRacas[k] = {
              ...r,
              vantagens: (r.vantagens || []).filter(v => v.split(':')[0] !== id),
              desvantagens: (r.desvantagens || []).filter(d => d.split(':')[0] !== id)
            };
          });
          return nextRacas;
        });
        setRacaEditorDraft(prev => ({
          ...prev,
          vantagens: prev.vantagens.filter(v => v.split(':')[0] !== id),
          desvantagens: prev.desvantagens.filter(d => d.split(':')[0] !== id)
        }));
        setPersonagens(prevList => {
          return prevList.map(p => ({
            ...p,
            vantagensAdquiridas: p.vantagensAdquiridas.filter(v => v.split(':')[0] !== id),
            desvantagensAdquiridas: p.desvantagensAdquiridas.filter(d => d.split(':')[0] !== id)
          }));
        });
        mostrarToast("TRAÇO EXCLUÍDO DA POOL");
      }
    );
  };

  const restaurarPoolPadrao = () => {
    abrirConfirm(
      "RESTAURAR POOL PADRÃO",
      "Deseja restaurar a pool oficial com 100% dos traços do livro Tio Nitro V2.3? Traços customizados serão removidos.",
      () => {
        setPool([...LIVRO_VANTAGENS, ...LIVRO_DESVANTAGENS]);
        mostrarToast("POOL DE TRAÇOS RESTAURADA");
      }
    );
  };

  // Trait sets for active character & race
  const idsJaPossuiNaRaca = useMemo(() => {
    return new Set([
      ...(racaAtual.vantagens || []).map(id => id.split(':')[0]),
      ...(racaAtual.desvantagens || []).map(id => id.split(':')[0])
    ]);
  }, [racaAtual]);

  const idsJaPossuiNaPersonagem = useMemo(() => {
    return new Set([
      ...personagem.vantagensAdquiridas.map(id => id.split(':')[0]),
      ...personagem.desvantagensAdquiridas.map(id => id.split(':')[0])
    ]);
  }, [personagem.vantagensAdquiridas, personagem.desvantagensAdquiridas]);

  const getNivelPersonagemTraço = (baseId: string): number | undefined => {
    const item = personagem.vantagensAdquiridas.find(v => v.split(':')[0] === baseId);
    if (!item) return undefined;
    return item.includes(':') ? parseInt(item.split(':')[1], 10) : 1;
  };

  const getNivelPersonagemDesvantagem = (baseId: string): number | undefined => {
    const item = personagem.desvantagensAdquiridas.find(d => d.split(':')[0] === baseId);
    if (!item) return undefined;
    return item.includes(':') ? parseInt(item.split(':')[1], 10) : 1;
  };

  const getNivelRacaDraftTraço = (baseId: string, tipo: 'vantagem' | 'desvantagem'): number | undefined => {
    const list = tipo === 'vantagem' ? (racaEditorDraft.vantagens || []) : (racaEditorDraft.desvantagens || []);
    const item = list.find(v => v.split(':')[0] === baseId);
    if (!item) return undefined;
    return item.includes(':') ? parseInt(item.split(':')[1], 10) : 1;
  };

  // Catalog items filtered for the modal
  const itensCatalogoModal = useMemo(() => {
    const termo = modalCatalogo.busca.toLowerCase().trim();
    return pool.filter(t => {
      const matchTipo = t.tipo === modalCatalogo.tipo;
      let matchPontos = true;
      if (modalCatalogo.filtroPontos !== 'todos') {
        if (t.niveis && t.niveis.length > 0) {
          matchPontos = t.niveis.some(nl => nl.pontos === modalCatalogo.filtroPontos);
        } else {
          matchPontos = t.pontos === modalCatalogo.filtroPontos;
        }
      }
      const matchBusca = !termo || t.nome.toLowerCase().includes(termo) || t.desc.toLowerCase().includes(termo);
      return matchTipo && matchPontos && matchBusca;
    });
  }, [pool, modalCatalogo]);

  // Trait items for the Dev pool tab
  const itensPoolDev = useMemo(() => {
    const termo = buscaPool.toLowerCase().trim();
    return pool.filter(t => {
      const matchTipo = filtroPoolTipo === 'todos' || t.tipo === filtroPoolTipo;
      const matchBusca = !termo || t.nome.toLowerCase().includes(termo) || t.desc.toLowerCase().includes(termo);
      return matchTipo && matchBusca;
    });
  }, [pool, filtroPoolTipo, buscaPool]);

  // Filtered characters in library
  const personagensFiltrados = useMemo(() => {
    const termo = buscaBiblioteca.toLowerCase().trim();
    if (!termo) return personagens;
    return personagens.filter(p => {
      const nomeMatch = p.nome.toLowerCase().includes(termo);
      const rId = RACE_ID_ALIASES[p.racaId] || p.racaId;
      const racaNome = bancoRacas[rId]?.nome?.toLowerCase() || '';
      return nomeMatch || racaNome.includes(termo);
    });
  }, [personagens, buscaBiblioteca, bancoRacas]);

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col selection:bg-white selection:text-black border-4 border-white">

      {/* TOASTS CONTAINER */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="p-3 bg-black text-white border-2 border-white text-xs font-bold uppercase flex justify-between items-center gap-3 pointer-events-auto shadow-2xl"
          >
            <span>[ {t.msg} ]</span>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-xs px-1 border border-white hover:bg-white hover:text-black cursor-pointer"
            >
              X
            </button>
          </div>
        ))}
      </div>

      {/* CONFIRMATION MODAL */}
      {modalConfig.aberto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-black border-2 border-white max-w-sm w-full p-5 text-center">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">[ AVISO DO SISTEMA ]</div>
            <h3 className="font-bold text-sm uppercase text-white mb-2">{modalConfig.titulo}</h3>
            <p className="text-xs text-neutral-300 mb-6 leading-relaxed">{modalConfig.mensagem}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModalConfig(prev => ({ ...prev, aberto: false }))}
                className="py-1.5 px-3 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                onClick={modalConfig.onConfirm}
                className="py-1.5 px-3 bg-white text-black border border-white text-xs uppercase font-bold hover:bg-black hover:text-white transition cursor-pointer"
              >
                CONFIRMAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCRETE SELECTION MODAL: VANTAGENS & DESVANTAGENS */}
      {modalCatalogo.aberto && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="bg-black border-2 border-white max-w-2xl w-full p-4 md:p-6 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex flex-wrap justify-between items-center border-b-2 border-white pb-3 gap-2">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 block">
                  {modalCatalogo.origem === 'raca'
                    ? `[ CATÁLOGO DE TRAÇOS // RAÇA: ${racaEditorDraft.nome.toUpperCase()} ]`
                    : '[ CATÁLOGO DE TRAÇOS DO LIVRO ]'}
                </span>
                <h3 className="font-extrabold text-sm uppercase text-white">
                  {modalCatalogo.origem === 'raca'
                    ? (modalCatalogo.tipo === 'vantagem' ? 'VINCULAR VANTAGEM RACIAL' : 'VINCULAR DESVANTAGEM RACIAL')
                    : (modalCatalogo.tipo === 'vantagem' ? 'ADICIONAR VANTAGEM' : 'ADICIONAR DESVANTAGEM')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex border border-white text-[10px] font-bold">
                  <button
                    onClick={() => setModalCatalogo(prev => ({ ...prev, tipo: 'vantagem' }))}
                    className={`px-2 py-1 uppercase transition ${modalCatalogo.tipo === 'vantagem' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
                  >
                    VANTAGENS
                  </button>
                  <button
                    onClick={() => setModalCatalogo(prev => ({ ...prev, tipo: 'desvantagem' }))}
                    className={`px-2 py-1 uppercase transition ${modalCatalogo.tipo === 'desvantagem' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
                  >
                    DESVANTAGENS
                  </button>
                </div>
                <button
                  onClick={() => setModalCatalogo(prev => ({ ...prev, aberto: false }))}
                  className="px-2 py-1 border border-white text-xs font-bold uppercase hover:bg-white hover:text-black cursor-pointer"
                >
                  FECHAR [X]
                </button>
              </div>
            </div>

            {/* Modal Search and Filters */}
            <div className="py-3 border-b border-white/40 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={modalCatalogo.busca}
                  onChange={(e) => setModalCatalogo(prev => ({ ...prev, busca: e.target.value }))}
                  placeholder="FILTRAR POR NOME OU EFEITO..."
                  className="flex-1 bg-black border border-white px-3 py-1.5 text-xs text-white uppercase focus:outline-none placeholder:text-neutral-500"
                  autoFocus
                />
                {modalCatalogo.busca && (
                  <button
                    onClick={() => setModalCatalogo(prev => ({ ...prev, busca: '' }))}
                    className="px-2 py-1 border border-white text-xs font-bold uppercase hover:bg-white hover:text-black"
                  >
                    LIMPAR
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[9px] uppercase text-neutral-400">
                <div className="flex items-center gap-1">
                  <span>CUSTO:</span>
                  {(['todos', 1, 2, 3, 4, 5] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setModalCatalogo(prev => ({ ...prev, filtroPontos: p }))}
                      className={`px-1.5 py-0.5 border ${modalCatalogo.filtroPontos === p ? 'border-white bg-white text-black font-bold' : 'border-neutral-600 text-neutral-400 hover:border-white'}`}
                    >
                      {p === 'todos' ? 'TODOS' : `${p}P`}
                    </button>
                  ))}
                </div>
                <span>{itensCatalogoModal.length} DISPONÍVEIS</span>
              </div>
            </div>

            {/* Modal Trait List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1">
              {itensCatalogoModal.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs uppercase">
                  [ NENHUM TRAÇO ENCONTRADO COM ESSE FILTRO ]
                </div>
              ) : (
                itensCatalogoModal.map(t => {
                  const isVant = t.tipo === 'vantagem';
                  const baseId = t.id.split(':')[0];
                  const isRacaMode = modalCatalogo.origem === 'raca';

                  const naRacaDraft = isRacaMode && (
                    isVant
                      ? (racaEditorDraft.vantagens || []).some(v => v.split(':')[0] === baseId)
                      : (racaEditorDraft.desvantagens || []).some(d => d.split(':')[0] === baseId)
                  );
                  const racaDraftNivel = isRacaMode ? getNivelRacaDraftTraço(baseId, isVant ? 'vantagem' : 'desvantagem') : undefined;

                  const naRacaFicha = !isRacaMode && idsJaPossuiNaRaca.has(baseId);
                  const noPersonagem = !isRacaMode && (
                    isVant
                      ? (personagem.vantagensAdquiridas || []).some(v => v.split(':')[0] === baseId)
                      : (personagem.desvantagensAdquiridas || []).some(d => d.split(':')[0] === baseId)
                  );
                  const charNivel = !isRacaMode && noPersonagem
                    ? (isVant ? getNivelPersonagemTraço(baseId) : getNivelPersonagemDesvantagem(baseId))
                    : undefined;

                  const jaPossui = isRacaMode ? naRacaDraft : (naRacaFicha || noPersonagem);
                  const activeNivel = isRacaMode ? racaDraftNivel : charNivel;

                  const temNiveis = !!t.niveis && t.niveis.length > 0;
                  const nivelSel = niveisSelecionadosCatalogo[baseId] || activeNivel || 1;
                  const lvlObj = temNiveis ? (t.niveis!.find(n => n.nivel === nivelSel) || t.niveis![0]) : null;

                  const pontosExibidos = lvlObj ? lvlObj.pontos : t.pontos;
                  const descExibida = lvlObj ? lvlObj.desc : t.desc;

                  let mods = "";
                  const pvVal = lvlObj ? lvlObj.modPv : t.modPv;
                  const peVal = lvlObj ? lvlObj.modPe : t.modPe;
                  const deslVal = lvlObj ? lvlObj.modDesl : t.modDesl;
                  const rdVal = lvlObj ? lvlObj.modRd : t.modRd;
                  const cargaVal = lvlObj ? lvlObj.modCargaFor : t.modCargaFor;

                  if (pvVal) mods += `[PV ${pvVal > 0 ? '+' + pvVal : pvVal}] `;
                  if (peVal) mods += `[PE ${peVal > 0 ? '+' + peVal : peVal}] `;
                  if (deslVal) mods += `[DESL ${deslVal > 0 ? '+' + deslVal : deslVal}] `;
                  if (rdVal) mods += `[RD ${rdVal}] `;
                  if (cargaVal) mods += `[FOR+${cargaVal} CARGA] `;

                  return (
                    <div
                      key={t.id}
                      className={`border p-2.5 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                        jaPossui ? 'border-neutral-800 bg-neutral-950/60' : 'border-white bg-black hover:border-white'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-extrabold text-xs uppercase text-white">{t.nome}</span>
                          <span className="border border-white px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white text-black">
                            {isVant ? `-${pontosExibidos} PTS` : `+${pontosExibidos} PTS`}
                          </span>
                          {temNiveis && t.niveis && t.niveis.length > 1 && (
                            <span className="border border-neutral-500 px-1 text-[8px] font-mono font-bold text-neutral-300">
                              {t.niveis.length} NÍVEIS
                            </span>
                          )}
                          {mods && <span className="font-mono text-[9px] text-white border border-white px-1">{mods.trim()}</span>}
                          {isRacaMode ? (
                            naRacaDraft && (
                              <span className="bg-white text-black px-1.5 py-0.5 text-[8px] font-black uppercase">
                                VINCULADO À RAÇA {racaDraftNivel && temNiveis ? `(NV ${racaDraftNivel})` : ''}
                              </span>
                            )
                          ) : (
                            <>
                              {naRacaFicha && <span className="bg-white text-black px-1 text-[8px] font-black uppercase">INATO RACIAL</span>}
                              {noPersonagem && (
                                <span className="border border-white px-1 text-[8px] font-bold uppercase text-white">
                                  FICHA {charNivel ? `(NV ${charNivel})` : ''}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">{descExibida}</p>

                        {/* Interactive Level Selector if trait has multiple levels */}
                        {temNiveis && t.niveis && t.niveis.length > 1 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-[9px] uppercase font-mono text-neutral-400 font-bold">SELECIONAR NÍVEL:</span>
                            {t.niveis.map(nl => (
                              <button
                                key={nl.nivel}
                                type="button"
                                onClick={() => setNiveisSelecionadosCatalogo(prev => ({ ...prev, [baseId]: nl.nivel }))}
                                className={`px-2 py-0.5 text-[9px] font-mono font-bold border transition cursor-pointer ${
                                  nivelSel === nl.nivel
                                    ? 'bg-white text-black border-white'
                                    : 'bg-black text-neutral-300 border-neutral-700 hover:border-white'
                                }`}
                              >
                                NV {nl.nivel} ({nl.pontos}P)
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-auto flex justify-end shrink-0">
                        {isRacaMode ? (
                          jaPossui ? (
                            temNiveis && t.niveis && t.niveis.length > 1 && racaDraftNivel !== nivelSel ? (
                              <button
                                onClick={() => handleAlterarNivelTraçoRaca(baseId, isVant ? 'vantagem' : 'desvantagem', nivelSel)}
                                className="w-full md:w-auto px-3 py-1.5 bg-white text-black text-xs font-black uppercase hover:bg-black hover:text-white border border-white transition cursor-pointer"
                              >
                                ALTERAR PARA NV {nivelSel}
                              </button>
                            ) : (
                              <span className="text-[9px] border border-neutral-700 px-2 py-1 text-neutral-400 font-bold uppercase">
                                JÁ VINCULADO {racaDraftNivel && temNiveis ? `(NV ${racaDraftNivel})` : ''}
                              </span>
                            )
                          ) : (
                            <button
                              onClick={() => handleVincularTraçoRaca(baseId, isVant ? 'vantagem' : 'desvantagem', temNiveis ? nivelSel : undefined)}
                              className="w-full md:w-auto px-3 py-1.5 bg-white text-black text-xs font-black uppercase hover:bg-black hover:text-white border border-white transition cursor-pointer"
                            >
                              + VINCULAR {temNiveis && t.niveis && t.niveis.length > 1 ? `(NV ${nivelSel})` : ''}
                            </button>
                          )
                        ) : (
                          jaPossui ? (
                            noPersonagem && temNiveis && t.niveis && t.niveis.length > 1 && charNivel !== nivelSel ? (
                              <button
                                onClick={() => {
                                  if (isVant) {
                                    handleAlterarNivelVantagem(baseId, nivelSel);
                                  } else {
                                    handleAlterarNivelDesvantagem(baseId, nivelSel);
                                  }
                                }}
                                className="w-full md:w-auto px-3 py-1.5 bg-white text-black text-xs font-black uppercase hover:bg-black hover:text-white border border-white transition cursor-pointer"
                              >
                                ALTERAR PARA NV {nivelSel}
                              </button>
                            ) : (
                              <span className="text-[9px] border border-neutral-700 px-2 py-1 text-neutral-400 font-bold uppercase">
                                {naRacaFicha ? 'INATO RACIAL' : `JÁ ADQUIRIDO (NV ${charNivel || 1})`}
                              </span>
                            )
                          ) : (
                            <button
                              onClick={() => {
                                if (isVant) {
                                  handleAdicionarVantagem(baseId, temNiveis ? nivelSel : undefined);
                                } else {
                                  handleAdicionarDesvantagem(baseId, temNiveis ? nivelSel : undefined);
                                }
                              }}
                              className="w-full md:w-auto px-3 py-1.5 bg-white text-black text-xs font-black uppercase hover:bg-black hover:text-white border border-white transition cursor-pointer"
                            >
                              + SELECIONAR {temNiveis && t.niveis && t.niveis.length > 1 ? `(NV ${nivelSel})` : ''}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/40 pt-3 flex justify-between items-center text-[10px] text-neutral-400">
              <span>MOTOR +2D6 // SISTEMA TIO NITRO</span>
              <button
                onClick={() => setModalCatalogo(prev => ({ ...prev, aberto: false }))}
                className="px-3 py-1 border border-white text-xs font-bold uppercase hover:bg-white hover:text-black cursor-pointer"
              >
                CONCLUIR SELEÇÃO
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 1:1 AVATAR CROPPER MODAL (WHATSAPP-STYLE INTERACTIVE PROFILE PICTURE ADJUSTER) */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        charId={cropModal.charId}
        imageSrc={cropModal.imageSrc}
        characterName={cropModal.charName}
        hasExistingImage={cropModal.hasExistingImage}
        onClose={() => setCropModal(prev => ({ ...prev, isOpen: false }))}
        onSave={(cId, dataUrl) => salvarImagemRecortada(cId, dataUrl)}
        onRemoveImage={(cId) => {
          removerImagemPersonagem(cId);
          setCropModal(prev => ({ ...prev, isOpen: false }));
        }}
        onFilePicked={(file) => {
          carregarArquivoParaCrop(file, cropModal.charId);
        }}
      />

      {/* HIDDEN FILE INPUT FOR CHARACTER 1:1 IMAGE UPLOAD */}
      <input
        type="file"
        ref={fileImageInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleArquivoImagemSelecionado}
      />

      {/* APPLICATION HEADER (Navigation: Biblioteca, Ficha, Ferramentas de Desenvolvedor) */}
      <header className="border-b-2 border-white bg-black p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-white text-black font-black text-lg tracking-tighter">
              +2D6
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-sm md:text-base tracking-wider uppercase text-white">
                MOTOR +2D6 // SISTEMA TIO NITRO V2.3
              </h1>
              <p className="text-[10px] uppercase text-neutral-400 tracking-widest">
                BIBLIOTECA // FICHAS INDIVIDUAIS // PACKS DE RAÇAS E TRAÇOS
              </p>
            </div>
          </div>

          {/* MAIN TABS: BIBLIOTECA, FICHA (ATIVO), FERRAMENTAS DE DESENVOLVEDOR */}
          <nav className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAbaAtiva('biblioteca')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-white transition cursor-pointer ${
                abaAtiva === 'biblioteca' ? 'bg-white text-black' : 'bg-black text-white hover:bg-white hover:text-black'
              }`}
            >
              [ 1. BIBLIOTECA ]
            </button>
            <button
              onClick={() => {
                if (personagens.length === 0) {
                  mostrarToast("NENHUM PERSONAGEM EXISTENTE. CRIE UM PRIMEIRO!");
                } else {
                  setAbaAtiva('ficha');
                }
              }}
              disabled={personagens.length === 0}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-white transition cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'ficha' ? 'bg-white text-black' : 'bg-black text-white hover:bg-white hover:text-black'
              } ${personagens.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <span>[ 2. FICHA{personagens.length > 0 ? `: ${personagem.nome.toUpperCase()}` : ''} ]</span>
            </button>
            <button
              onClick={() => {
                setAbaAtiva('dev');
                carregarRacaNoEditor(personagem.racaId);
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-white transition cursor-pointer ${
                abaAtiva === 'dev' ? 'bg-white text-black' : 'bg-black text-white hover:bg-white hover:text-black'
              }`}
            >
              [ 3. FERRAMENTAS DE DESENVOLVEDOR ]
            </button>
            <button
              onClick={() => setAbaAtiva('manual')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-white transition cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'manual' ? 'bg-white text-black' : 'bg-black text-white hover:bg-white hover:text-black'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>[ 4. MANUAL DO SISTEMA ]</span>
            </button>

            {/* BOTÃO DE TEMA (SOL / LUA) */}
            <button
              onClick={alternarTema}
              title={tema === 'dark' ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
              aria-label="Alternar tema claro/escuro"
              className="px-2.5 py-1.5 text-xs font-bold border border-white bg-black text-white hover:bg-white hover:text-black transition cursor-pointer flex items-center justify-center min-w-[36px] min-h-[33px]"
            >
              {tema === 'dark' ? (
                <Sun className="w-4 h-4 stroke-2" />
              ) : (
                <Moon className="w-4 h-4 stroke-2" />
              )}
            </button>
          </nav>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">

        {/* ======================================================= */}
        {/* ABA 1: BIBLIOTECA DE PERSONAGENS (TELA INICIAL DO APP) */}
        {/* ======================================================= */}
        {abaAtiva === 'biblioteca' && (
          <section className="space-y-4">

            {/* TOP BAR OF BIBLIOTECA */}
            <div className="border-2 border-white bg-black p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 block font-bold">
                  [ HUB CENTRAL DE PERSONAGENS ]
                </span>
                <h2 className="text-sm md:text-base font-black uppercase text-white tracking-wider">
                  BIBLIOTECA DE PERSONAGENS ({personagens.length})
                </h2>
              </div>

              {/* ACTION BUTTONS: + NOVO PERSONAGEM & IMPORTAR FICHA (JSON) */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCriarNovoPersonagem}
                  className="px-3 py-1.5 bg-white text-black border border-white text-xs uppercase font-extrabold hover:bg-black hover:text-white transition cursor-pointer"
                >
                  + NOVO PERSONAGEM
                </button>

                <button
                  onClick={() => fileCharInputRef.current?.click()}
                  className="px-3 py-1.5 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                  title="Importar um arquivo JSON de ficha individual"
                >
                  IMPORTAR FICHA (JSON)
                </button>
                <button
                  onClick={() => setAbaAtiva('manual')}
                  className="px-3 py-1.5 border border-amber-400 text-amber-300 text-xs uppercase font-bold hover:bg-amber-400 hover:text-black transition cursor-pointer flex items-center gap-1.5"
                  title="Consultar manual do sistema, fórmulas e livro de regras"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>MANUAL DE REGRAS</span>
                </button>
                <input
                  type="file"
                  ref={fileCharInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={importarFichaPersonagem}
                />
              </div>
            </div>

            {/* SEARCH & STATS BAR */}
            <div className="border border-white bg-black p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[240px]">
                <input
                  type="text"
                  value={buscaBiblioteca}
                  onChange={(e) => setBuscaBiblioteca(e.target.value)}
                  placeholder="FILTRAR PERSONAGEM POR NOME OU RAÇA..."
                  className="w-full bg-black border border-white px-3 py-1 text-xs uppercase text-white focus:outline-none placeholder:text-neutral-500"
                />
              </div>
              <div className="text-[10px] text-neutral-400 uppercase font-mono">
                EXIBINDO {personagensFiltrados.length} DE {personagens.length} FICHAS
              </div>
            </div>

            {/* CHARACTER CARDS GRID ("JANELINHA DO PERSONAGEM COMPACTA") */}
            {personagens.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                <button
                  type="button"
                  onClick={handleCriarNovoPersonagem}
                  className="border-2 border-dashed border-white p-6 bg-black flex flex-col items-center justify-center min-h-[220px] sm:min-h-[240px] cursor-pointer hover:bg-white hover:text-black hover:border-solid transition group text-white text-center"
                  title="Criar Personagem"
                >
                  <span className="text-4xl sm:text-5xl font-mono font-black mb-3 group-hover:scale-110 transition-transform select-none">
                    +
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider font-mono">
                    Criar Personagem
                  </span>
                </button>
              </div>
            ) : personagensFiltrados.length === 0 ? (
              <div className="border-2 border-dashed border-white p-8 text-center space-y-3">
                <p className="text-xs uppercase text-neutral-400">
                  [ NENHUM PERSONAGEM ENCONTRADO PARA &quot;{buscaBiblioteca.toUpperCase()}&quot; ]
                </p>
                <button
                  onClick={() => setBuscaBiblioteca('')}
                  className="px-3 py-1 bg-white text-black text-xs uppercase font-bold hover:bg-black hover:text-white border border-white cursor-pointer"
                >
                  LIMPAR FILTRO
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {personagensFiltrados.map(p => {
                  const isAtivo = p.id === personagemAtivoId;

                  return (
                    <div
                      key={p.id}
                      className={`border-2 p-2.5 sm:p-3 bg-black flex flex-col justify-between transition relative ${
                        isAtivo ? 'border-white ring-1 ring-white' : 'border-neutral-700 hover:border-white'
                      }`}
                    >
                      <div>
                        {/* 1. EM CIMA: NOME E RAÇA DO PERSONAGEM */}
                        <div className="flex items-center justify-between border-b border-white/80 pb-1.5 mb-2.5">
                          <div className="flex items-center gap-1.5 truncate pr-2">
                            <h3 className="font-black text-xs uppercase text-white truncate tracking-wide" title={p.nome}>
                              {p.nome}
                            </h3>
                            {isAtivo && (
                              <span className="bg-white text-black px-1 py-0.2 text-[7px] font-black uppercase tracking-wider shrink-0">
                                ATIVO
                              </span>
                            )}
                          </div>
                          <span className="border border-white/60 px-1.5 py-0.2 text-[9px] uppercase font-mono font-bold text-neutral-300 shrink-0">
                            {bancoRacas[p.racaId]?.nome.toUpperCase() || 'HUMANO'}
                          </span>
                        </div>

                        {/* 2. NO MEIO: IMAGEM 1:1 DISCRETA E AO LADO GRID 2x3 DE ATRIBUTOS DA MESMA ALTURA */}
                        <div className="flex gap-2 items-center mb-2.5">
                          
                          {/* FOTO 1:1 DISCRETA */}
                          {avatares[p.id] ? (
                            <div className="w-[84px] h-[84px] shrink-0 border border-white relative group overflow-hidden bg-neutral-950">
                              <img
                                src={avatares[p.id]}
                                alt={`Foto de ${p.nome}`}
                                className="w-full h-full object-cover select-none"
                              />
                              {/* Overlay de Ações Rápidas ao passar o mouse */}
                              <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1 text-center">
                                <button
                                  onClick={() => abrirReajusteImagemExistente(p)}
                                  className="w-full py-0.5 bg-white text-black text-[8px] font-black uppercase border border-white hover:bg-black hover:text-white transition cursor-pointer"
                                  title="Ajustar enquadramento da foto"
                                >
                                  AJUSTAR
                                </button>
                                <button
                                  onClick={() => iniciarUploadImagem(p.id)}
                                  className="w-full py-0.5 bg-black text-white text-[8px] font-bold uppercase border border-white hover:bg-white hover:text-black transition cursor-pointer"
                                  title="Trocar por outra foto do PC"
                                >
                                  TROCAR
                                </button>
                                <button
                                  onClick={() => removerImagemPersonagem(p.id)}
                                  className="text-[7px] uppercase text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
                                  title="Remover foto"
                                >
                                  REMOVER
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => iniciarUploadImagem(p.id)}
                              className="w-[84px] h-[84px] shrink-0 border border-dashed border-white/60 hover:border-white bg-neutral-950 hover:bg-neutral-900 transition flex flex-col items-center justify-center p-1 text-center cursor-pointer group"
                              title="Clique para anexar foto 1:1 do seu computador"
                            >
                              <span className="font-mono font-bold text-base group-hover:scale-110 transition text-neutral-300 group-hover:text-white leading-none mb-0.5">
                                +
                              </span>
                              <span className="text-[8px] font-black uppercase text-neutral-300 group-hover:text-white tracking-wider leading-tight">
                                ANEXAR
                              </span>
                              <span className="text-[7px] uppercase text-neutral-500 font-mono leading-tight">
                                1:1 FOTO
                              </span>
                            </button>
                          )}

                          {/* GRID 2x3 DE ATRIBUTOS (3 COLUNAS E 2 LINHAS, MESMA ALTURA DA FOTO) */}
                          <div className="flex-1 h-[84px] grid grid-cols-3 grid-rows-2 gap-1 font-mono">
                            {ATRIBUTOS_ORDEM.map(atr => {
                              const val = p.atributos?.[atr] ?? 0;
                              const isSobreHumano = val > 5;
                              return (
                                <div
                                  key={atr}
                                  className={`flex flex-col items-center justify-center px-0.5 border ${
                                    isSobreHumano
                                      ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                                      : 'border-white/30 text-white bg-neutral-950'
                                  }`}
                                  title={`${ATRIBUTO_NOMES[atr]}: ${val}${isSobreHumano ? ' (SOBRE-HUMANO)' : ''}`}
                                >
                                  <span className="text-[8px] uppercase text-neutral-400 font-bold leading-none mb-0.5">
                                    {atr}
                                  </span>
                                  <span className={`text-xs font-black leading-none ${isSobreHumano ? 'text-amber-300' : 'text-white'}`}>
                                    {val}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      </div>

                      {/* Card Action Buttons (Open sheet, Export 1 JSON, Duplicate, Delete) */}
                      <div className="border-t border-white/80 pt-2 space-y-1.5">
                        <button
                          onClick={() => abrirFichaPersonagem(p.id)}
                          className="w-full py-1.5 bg-white text-black font-black text-xs uppercase hover:bg-black hover:text-white border border-white transition cursor-pointer text-center block tracking-wide"
                        >
                          [ ABRIR FICHA ]
                        </button>

                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => exportarFichaPersonagem(p)}
                            className="py-1 px-1 border border-white text-[9px] uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer text-center"
                            title="Exportar arquivo JSON individual desta ficha"
                          >
                            EXP JSON
                          </button>
                          <button
                            onClick={() => handleDuplicarPersonagem(p)}
                            className="py-1 px-1 border border-white text-[9px] uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer text-center"
                            title="Duplicar esta ficha"
                          >
                            DUPLICAR
                          </button>
                          <button
                            onClick={() => handleExcluirPersonagem(p)}
                            className="py-1 px-1 border border-white text-[9px] uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer text-center"
                            title="Excluir ficha"
                          >
                            EXCLUIR
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </section>
        )}

        {/* ======================================================= */}
        {/* ABA 2: FICHA DO PERSONAGEM ATUAL                       */}
        {/* ======================================================= */}
        {abaAtiva === 'ficha' && (
          personagens.length === 0 ? (
            <div className="border-2 border-dashed border-white p-12 bg-black text-center space-y-4">
              <p className="text-xs uppercase text-neutral-400">
                [ NENHUM PERSONAGEM CADASTRADO NA BIBLIOTECA ]
              </p>
              <button
                type="button"
                onClick={handleCriarNovoPersonagem}
                className="px-4 py-2 border border-white bg-white text-black font-black uppercase text-xs hover:bg-black hover:text-white transition cursor-pointer"
              >
                + CRIAR NOVO PERSONAGEM
              </button>
            </div>
          ) : (
            <section className="space-y-4">

            {/* QUICK SWITCH & RETURN TO LIBRARY BAR */}
            <div className="border-2 border-white bg-black p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <button
                  onClick={() => setAbaAtiva('biblioteca')}
                  className="px-2.5 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer flex items-center gap-1"
                >
                  &larr; VOLTAR À BIBLIOTECA
                </button>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider ml-2">
                  FICHA:
                </span>
                <select
                  value={personagemAtivoId}
                  onChange={(e) => setPersonagemAtivoId(e.target.value)}
                  className="bg-black border border-white px-3 py-1 text-xs font-bold text-white uppercase focus:outline-none cursor-pointer max-w-xs"
                >
                  {personagens.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome.toUpperCase()} ({bancoRacas[p.racaId]?.nome.toUpperCase() || 'HUMANO'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setAbaAtiva('manual')}
                  className="px-2.5 py-1 border border-amber-400 text-amber-300 text-xs uppercase font-bold hover:bg-amber-400 hover:text-black transition cursor-pointer flex items-center gap-1.5"
                  title="Consultar manual de regras, fórmulas e manobras do sistema"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>MANUAL DO SISTEMA</span>
                </button>
                <button
                  onClick={() => exportarFichaPersonagem(personagem)}
                  className="px-2.5 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                  title="Exportar esta ficha específica em JSON"
                >
                  EXPORTAR ESTA FICHA (JSON)
                </button>
                <button
                  onClick={handleCriarNovoPersonagem}
                  className="px-2.5 py-1 bg-white text-black border border-white text-xs uppercase font-extrabold hover:bg-black hover:text-white transition cursor-pointer"
                >
                  + NOVO
                </button>
                <button
                  onClick={() => handleDuplicarPersonagem(personagem)}
                  className="px-2.5 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                >
                  DUPLICAR
                </button>
                <button
                  onClick={() => handleExcluirPersonagem(personagem)}
                  className="px-2.5 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                  title="Excluir ficha deste personagem"
                >
                  EXCLUIR
                </button>
              </div>
            </div>

            {/* TOP HUD: POINT METRICS (BRUTALIST CALCULATOR) */}
            <div className="border-2 border-white bg-black p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                
                {/* Character Name with Avatar Thumbnail */}
                <div className="border border-white p-2 flex items-center gap-2">
                  {/* 1:1 Avatar Thumbnail */}
                  <div className="shrink-0">
                    {avatares[personagem.id] ? (
                      <button
                        onClick={() => abrirReajusteImagemExistente(personagem)}
                        className="w-11 h-11 border border-white overflow-hidden relative group cursor-pointer block"
                        title="Clique para ajustar enquadramento ou trocar foto"
                      >
                        <img src={avatares[personagem.id]} alt={personagem.nome} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[7px] text-white font-black uppercase text-center p-0.5">
                          AJUSTAR
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={() => iniciarUploadImagem(personagem.id)}
                        className="w-11 h-11 border border-dashed border-white/60 hover:border-white bg-neutral-950 hover:bg-neutral-900 flex flex-col items-center justify-center cursor-pointer text-center transition"
                        title="Clique para anexar foto 1:1 do seu computador"
                      >
                        <span className="text-xs font-bold text-white">+</span>
                        <span className="text-[6px] uppercase text-neutral-400 font-mono">FOTO</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] uppercase font-bold text-neutral-400 mb-1">NOME DO PERSONAGEM</div>
                    <input
                      type="text"
                      value={personagem.nome}
                      onChange={(e) => {
                        const val = e.target.value;
                        atualizarPersonagemAtivo(prev => ({ ...prev, nome: val }));
                      }}
                      className="w-full bg-black border border-white px-2 py-1 text-xs font-bold text-white uppercase focus:outline-none"
                      placeholder="NOME DO PERSONAGEM"
                    />
                  </div>
                </div>

                {/* Points: Perícias [TETO AJUSTÁVEL] */}
                <div className="border border-white p-2">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold text-neutral-400 mb-1">
                    <span>PERÍCIAS [TETO: {tetosEPontos.tetoPer} PTS]</span>
                    <span
                      className={`px-1 text-[9px] font-extrabold ${
                        tetosEPontos.diffPer === 0
                          ? 'bg-white text-black'
                          : tetosEPontos.diffPer > 0
                          ? 'border border-white text-white'
                          : 'border-2 border-red-500 text-red-500 bg-red-950/40'
                      }`}
                    >
                      {tetosEPontos.diffPer === 0 ? '[0 OK]' : tetosEPontos.diffPer > 0 ? `[+${tetosEPontos.diffPer} P/ DISTRIBUIR]` : `[-${Math.abs(tetosEPontos.diffPer)} EXCEDEU]`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-extrabold text-sm transition-colors ${tetosEPontos.gastoPer > tetosEPontos.tetoPer ? 'text-red-500 font-black' : 'text-white'}`}>
                        {tetosEPontos.gastoPer} / {tetosEPontos.tetoPer}
                      </span>
                      <div className="flex items-center border border-white">
                        <button
                          type="button"
                          onClick={() => handleAjustarTetoPericias(-1)}
                          disabled={tetosEPontos.tetoPer <= 0}
                          className="px-1.5 py-0.5 bg-black text-white hover:bg-white hover:text-black disabled:opacity-20 text-[10px] font-bold cursor-pointer transition"
                          title="Diminuir teto de perícias (-1)"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAjustarTetoPericias(1)}
                          className="px-1.5 py-0.5 bg-black text-white hover:bg-white hover:text-black text-[10px] font-bold cursor-pointer border-l border-white transition"
                          title="Aumentar teto de perícias (+1)"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className={`text-[10px] ${tetosEPontos.gastoPer > tetosEPontos.tetoPer ? 'text-red-400 font-bold' : 'text-neutral-400'}`}>
                      {tetosEPontos.diffPer === 0 ? '0 SALDO' : tetosEPontos.diffPer > 0 ? `SOBRAM ${tetosEPontos.diffPer} PTS` : `EXCESSO DE ${Math.abs(tetosEPontos.diffPer)} PTS`}
                    </span>
                  </div>
                </div>

                {/* Points: Vantagens [TETO AJUSTÁVEL] */}
                <div className="border border-white p-2">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold text-neutral-400 mb-1">
                    <span>VANTAGENS [{tetosEPontos.baseVant} + DESV = {tetosEPontos.tetoVant}]</span>
                    <span
                      className={`px-1 text-[9px] font-extrabold ${
                        tetosEPontos.diffVant === 0
                          ? 'bg-white text-black'
                          : tetosEPontos.diffVant > 0
                          ? 'border border-white text-white'
                          : 'border-2 border-red-500 text-red-500 bg-red-950/40'
                      }`}
                    >
                      {tetosEPontos.diffVant === 0 ? '[0 OK]' : tetosEPontos.diffVant > 0 ? `[+${tetosEPontos.diffVant} P/ DISTRIBUIR]` : `[-${Math.abs(tetosEPontos.diffVant)} EXCEDEU]`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-extrabold text-sm transition-colors ${tetosEPontos.gastoVant > tetosEPontos.tetoVant ? 'text-red-500 font-black' : 'text-white'}`}>
                        {tetosEPontos.gastoVant} / {tetosEPontos.tetoVant}
                      </span>
                      <div className="flex items-center border border-white">
                        <button
                          type="button"
                          onClick={() => handleAjustarTetoVantagens(-1)}
                          disabled={tetosEPontos.tetoVant <= 0}
                          className="px-1.5 py-0.5 bg-black text-white hover:bg-white hover:text-black disabled:opacity-20 text-[10px] font-bold cursor-pointer transition"
                          title="Diminuir teto de vantagens (-1)"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAjustarTetoVantagens(1)}
                          className="px-1.5 py-0.5 bg-black text-white hover:bg-white hover:text-black text-[10px] font-bold cursor-pointer border-l border-white transition"
                          title="Aumentar teto de vantagens (+1)"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className={`text-[10px] ${tetosEPontos.gastoVant > tetosEPontos.tetoVant ? 'text-red-400 font-bold' : 'text-neutral-400'}`}>
                      {tetosEPontos.diffVant === 0 ? '0 SALDO' : tetosEPontos.diffVant > 0 ? `SOBRAM ${tetosEPontos.diffVant} PTS` : `EXCESSO DE ${Math.abs(tetosEPontos.diffVant)} PTS`}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* MAIN CHARACTER GRID: ATTRIBUTES, DERIVED STATS, PERÍCIAS, TRAITS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* LEFT COLUMN: RACE SELECTOR, ATTRIBUTES & DERIVED STATS */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* RACE SELECTOR */}
                <div className="border-2 border-white p-4 bg-black space-y-2">
                  <div className="flex justify-between items-center border-b border-white pb-1">
                    <h2 className="text-xs font-black uppercase tracking-wider">RAÇA ESCOLHIDA</h2>
                    <button
                      onClick={() => {
                        carregarRacaNoEditor(personagem.racaId);
                        setAbaAtiva('dev');
                        setSubAbaDev('racas');
                      }}
                      className="text-[9px] underline uppercase hover:bg-white hover:text-black px-1"
                    >
                      [ EDITAR NO CRIADOR ]
                    </button>
                  </div>

                  <select
                    value={personagem.racaId}
                    onChange={(e) => handleSelecionarRaca(e.target.value)}
                    className="w-full bg-black border-2 border-white p-2 text-xs uppercase font-extrabold text-white focus:outline-none cursor-pointer"
                  >
                    <optgroup label="-- 6 RAÇAS PADRÃO --">
                      {Object.keys(bancoRacas)
                        .filter(k => bancoRacas[k].isDefault)
                        .map(k => (
                          <option key={k} value={k}>
                            {bancoRacas[k].nome.toUpperCase()} [PADRÃO]
                          </option>
                        ))}
                    </optgroup>
                    {Object.keys(bancoRacas).some(k => !bancoRacas[k].isDefault) && (
                      <optgroup label="-- RAÇAS PERSONALIZADAS --">
                        {Object.keys(bancoRacas)
                          .filter(k => !bancoRacas[k].isDefault)
                          .map(k => (
                            <option key={k} value={k}>
                              {bancoRacas[k].nome.toUpperCase()} [CUSTOM]
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>

                  <p className="text-[10px] text-neutral-300 leading-relaxed pt-1">
                    {racaAtual.desc}
                  </p>

                  <div className="border-t border-white/40 pt-2 flex flex-wrap gap-2 text-[9px]">
                    <span className="border border-white px-1">PV: {racaAtual.modPv >= 0 ? '+' : ''}{racaAtual.modPv}</span>
                    <span className="border border-white px-1">PE: {racaAtual.modPe >= 0 ? '+' : ''}{racaAtual.modPe}</span>
                    <span className="border border-white px-1">DESL: {racaAtual.modDesl >= 0 ? '+' : ''}{racaAtual.modDesl}</span>
                  </div>
                </div>

                {/* 6 CORE ATTRIBUTES (Brutalist Stepper with Golden Highlight when > 5) */}
                <div className="border-2 border-white p-4 bg-black space-y-3">
                  <div className="flex justify-between items-center border-b border-white pb-1">
                    <h2 className="text-xs font-black uppercase">ATRIBUTOS PRIMÁRIOS</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold text-neutral-400">
                        FAIXA: -1 A 10 (GASTO LIVRE)
                      </span>
                      <button
                        onClick={handleZerarAtributos}
                        className="text-[8px] uppercase font-mono px-1.5 py-0.5 border border-white/60 hover:border-white hover:bg-white hover:text-black transition cursor-pointer"
                        title="Resetar todos os atributos para 0"
                      >
                        [RESETAR 0]
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ATRIBUTOS_ORDEM.map(atr => {
                      const valor = personagem.atributos[atr];
                      const { min, max } = getLimitesAtributo(atr);
                      const modDano = calcularModificadorDano(valor);
                      const isSobreHumano = valor > 5;

                      return (
                        <div
                          key={atr}
                          className={`border p-2 transition flex justify-between items-center ${
                            isSobreHumano
                              ? 'border-amber-400 bg-amber-950/20'
                              : 'border-white bg-black'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-black uppercase ${
                                  isSobreHumano ? 'text-amber-400 tracking-wider' : 'text-white'
                                }`}
                              >
                                {atr} ({ATRIBUTO_NOMES[atr]})
                              </span>
                              {isSobreHumano && (
                                <span className="border border-amber-400 text-amber-300 px-1 text-[8px] font-extrabold uppercase bg-black">
                                  ★ SOBRE-HUMANO
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-neutral-400 uppercase">
                              MOD DANO: <strong className="text-white">{modDano >= 0 ? '+' : ''}{modDano}</strong> | TETO: [{min} A {max}]
                            </div>
                          </div>

                          <div className="flex items-center border border-white">
                            <button
                              onClick={() => handleAlterarAtributo(atr, -1)}
                              disabled={valor <= min}
                              className="px-2.5 py-1 bg-black text-white font-bold hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed text-xs cursor-pointer"
                            >
                              -
                            </button>
                            <span
                              className={`w-9 text-center text-sm font-black transition-colors ${
                                isSobreHumano
                                  ? 'text-amber-300 bg-amber-950/60 font-extrabold drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                  : 'text-white bg-black'
                              }`}
                              title={isSobreHumano ? 'Atributo Sobre-Humano (> 5)' : undefined}
                            >
                              {valor}
                            </span>
                            <button
                              onClick={() => handleAlterarAtributo(atr, 1)}
                              disabled={valor >= max}
                              className="px-2.5 py-1 bg-black text-white font-bold hover:bg-white hover:text-black disabled:opacity-20 disabled:cursor-not-allowed text-xs cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DERIVED STATS */}
                <div className="border-2 border-white p-4 bg-black space-y-3">
                  <div className="border-b border-white pb-1">
                    <h2 className="text-xs font-black uppercase">ESTATÍSTICAS DERIVADAS</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="border border-white p-2">
                      <div className="text-[9px] uppercase font-bold text-neutral-400">PONTOS DE VIDA (PV)</div>
                      <div className="text-xl font-black text-white">{derivados.pvTotal}</div>
                      <div className="text-[8px] text-neutral-400">
                        CON({personagem.atributos.CON}) + 20{derivados.racaPvMod ? ` ${derivados.racaPvMod > 0 ? '+' : ''}${derivados.racaPvMod}R` : ''}{derivados.modPvTraços ? ` +${derivados.modPvTraços}V` : ''}
                      </div>
                    </div>

                    <div className="border border-white p-2">
                      <div className="text-[9px] uppercase font-bold text-neutral-400">ESFORÇO (PE)</div>
                      <div className="text-xl font-black text-white">{derivados.peTotal}</div>
                      <div className="text-[8px] text-neutral-400">
                        CON({personagem.atributos.CON}) + 10{derivados.racaPeMod ? ` ${derivados.racaPeMod > 0 ? '+' : ''}${derivados.racaPeMod}R` : ''}{derivados.modPeTraços ? ` +${derivados.modPeTraços}T` : ''}
                      </div>
                    </div>

                    <div className="border border-white p-2">
                      <div className="text-[9px] uppercase font-bold text-neutral-400">INICIATIVA</div>
                      <div className="text-xl font-black text-white">{derivados.iniciativaTotal >= 0 ? `+${derivados.iniciativaTotal}` : derivados.iniciativaTotal}</div>
                      <div className="text-[8px] text-neutral-400">
                        DES({personagem.atributos.DES}){derivados.modIniciativaTraços ? ` ${derivados.modIniciativaTraços > 0 ? '+' : ''}${derivados.modIniciativaTraços}T` : ''}
                      </div>
                    </div>

                    <div className="border border-white p-2">
                      <div className="text-[9px] uppercase font-bold text-neutral-400">DESLOCAMENTO</div>
                      <div className={`text-xl font-black ${
                        derivados.estadoCarga === 'excedida'
                          ? 'text-red-500'
                          : derivados.estadoCarga === 'maxima'
                          ? 'text-amber-400'
                          : 'text-white'
                      }`}>
                        {derivados.deslEfetivo.toFixed(1)}m
                      </div>
                      <div className="text-[8px] text-neutral-400">
                        {derivados.estadoCarga === 'excedida' ? (
                          <span className="text-red-500 font-bold uppercase">IMOBILIZADO</span>
                        ) : derivados.estadoCarga === 'maxima' ? (
                          <span className="text-amber-400 font-bold uppercase">SEM CORRIDA (MAL ANDA)</span>
                        ) : (
                          `CORRIDA: ${derivados.corridaEfetiva.toFixed(1)}m${derivados.modDeslTraços ? ` (+${derivados.modDeslTraços}m)` : ''}`
                        )}
                      </div>
                    </div>

                    {derivados.rdTotal > 0 ? (
                      <div className="border border-white p-2 bg-neutral-900">
                        <div className="text-[9px] uppercase font-bold text-neutral-400">REDUÇÃO DE DANO (RD)</div>
                        <div className="text-xl font-black text-white">RD {derivados.rdTotal}</div>
                        <div className="text-[8px] text-neutral-400 uppercase truncate">
                          {derivados.rdEquipamentos > 0 && `Armadura: RD ${derivados.rdEquipamentos}`}
                          {derivados.rdEquipamentos > 0 && derivados.modRdTraços > 0 && ' + '}
                          {derivados.modRdTraços > 0 && `Traços: RD ${derivados.modRdTraços}`}
                          {derivados.rdEquipamentos === 0 && derivados.modRdTraços === 0 && 'Absorção passiva'}
                        </div>
                      </div>
                    ) : (
                      <div className="border border-white/40 p-2 text-neutral-500">
                        <div className="text-[9px] uppercase font-bold text-neutral-500">REDUÇÃO DE DANO (RD)</div>
                        <div className="text-xl font-black text-neutral-600">RD 0</div>
                        <div className="text-[8px] text-neutral-500">Sem armadura equipada</div>
                      </div>
                    )}

                    {/* SISTEMA DE CARGA (OFICIAL MOTOR +2D6: BASEADO EM ITENS) */}
                    <div className="col-span-2 border border-white p-2.5 bg-black space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-neutral-400 flex items-center gap-1.5 flex-wrap">
                            <span>SISTEMA DE CARGA</span>
                            <span className={`px-1 text-[8px] font-black uppercase tracking-wider ${
                              derivados.estadoCarga === 'leve'
                                ? 'bg-white text-black'
                                : derivados.estadoCarga === 'pesada'
                                ? 'bg-amber-400 text-black'
                                : 'bg-red-500 text-white'
                            }`}>
                              {derivados.estadoCarga === 'leve' && 'LEVE (NORMAL)'}
                              {derivados.estadoCarga === 'pesada' && 'PESADA (SOBRECARGA)'}
                              {derivados.estadoCarga === 'maxima' && 'MÁXIMA (LIMITE)'}
                              {derivados.estadoCarga === 'excedida' && 'EXCEDIDA (IMOBILIZADO)'}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-2xl font-black text-white font-mono">
                              {personagem.itensCarregados ?? 0}
                            </span>
                            <span className="text-[10px] text-neutral-400 uppercase font-mono">
                              / {derivados.cargaMax} ITENS (MÁX)
                            </span>
                          </div>
                        </div>

                        {/* Interactive Counter Stepper */}
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center border border-white shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAlterarItensCarregados(-1)}
                              disabled={(personagem.itensCarregados ?? 0) <= 0}
                              className="px-2 py-0.5 bg-black text-white hover:bg-white hover:text-black disabled:opacity-20 text-xs font-bold cursor-pointer transition"
                              title="Remover 1 item carregado"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={999}
                              value={personagem.itensCarregados ?? 0}
                              onChange={(e) => handleDefinirItensCarregados(parseInt(e.target.value) || 0)}
                              className="w-12 text-center text-xs font-bold font-mono bg-black text-white border-x border-white py-0.5 focus:outline-none"
                              title="Digitar quantidade de itens carregados"
                            />
                            <button
                              type="button"
                              onClick={() => handleAlterarItensCarregados(1)}
                              className="px-2 py-0.5 bg-black text-white hover:bg-white hover:text-black text-xs font-bold cursor-pointer transition"
                              title="Adicionar 1 item carregado"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[7px] text-neutral-400 uppercase font-mono">ITENS CARREGADOS</span>
                        </div>
                      </div>

                      {/* Thresholds Grid */}
                      <div className="grid grid-cols-3 gap-1 text-[8px] font-mono border-t border-neutral-800 pt-1.5">
                        <div className={`p-1 border ${derivados.estadoCarga === 'leve' ? 'border-white bg-neutral-900 text-white' : 'border-neutral-800 text-neutral-400'}`}>
                          <div className="font-bold uppercase text-[7px] text-neutral-400">CARGA LEVE</div>
                          <div className="font-black text-[10px] text-white">até {derivados.cargaLeve} itens</div>
                          <div className="text-[7px] text-neutral-400">FOR+CON+5</div>
                        </div>
                        <div className={`p-1 border ${derivados.estadoCarga === 'pesada' ? 'border-amber-400 bg-amber-950/40 text-amber-300' : 'border-neutral-800 text-neutral-400'}`}>
                          <div className="font-bold uppercase text-[7px] text-neutral-400">CARGA PESADA</div>
                          <div className="font-black text-[10px] text-white">até {derivados.cargaPesada} itens</div>
                          <div className="text-[7px] text-neutral-400">Dobro (2x)</div>
                        </div>
                        <div className={`p-1 border ${derivados.estadoCarga === 'maxima' || derivados.estadoCarga === 'excedida' ? 'border-red-500 bg-red-950/40 text-red-400' : 'border-neutral-800 text-neutral-400'}`}>
                          <div className="font-bold uppercase text-[7px] text-neutral-400">CARGA MÁXIMA</div>
                          <div className="font-black text-[10px] text-white">até {derivados.cargaMax} itens</div>
                          <div className="text-[7px] text-neutral-400">Triplo (3x)</div>
                        </div>
                      </div>

                      {/* Active Status & Penalties Description */}
                      <div className="border border-neutral-700 p-1.5 text-[9px] leading-tight font-sans bg-neutral-950">
                        {derivados.estadoCarga === 'leve' && (
                          <div className="text-neutral-300">
                            <strong className="text-white">Sem penalidades:</strong> Move e luta normalmente (FOR {personagem.atributos.FOR} + CON {personagem.atributos.CON} + 5 = {derivados.cargaLeve} itens).
                          </div>
                        )}
                        {derivados.estadoCarga === 'pesada' && (
                          <div className="text-amber-300">
                            <strong className="text-white">Sobrecarga Ativa:</strong> Sofre <strong>-2 de penalidade</strong> em todos os testes de Destreza (DES), testes de Atletismo e testes de esquiva ou iniciativa em combate.
                          </div>
                        )}
                        {derivados.estadoCarga === 'maxima' && (
                          <div className="text-red-400">
                            <strong className="text-white">Limite Absoluto:</strong> Mal consegue andar. Perde qualquer bônus de esquiva e <strong>não pode correr ou lutar</strong>.
                          </div>
                        )}
                        {derivados.estadoCarga === 'excedida' && (
                          <div className="text-red-400 font-bold">
                            <strong className="text-white">Limite Ultrapassado:</strong> Excedeu {derivados.cargaMax} itens. O personagem está <strong>imobilizado</strong>.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* MIDDLE COLUMN: PERÍCIAS (25 SKILLS) */}
              <div className="lg:col-span-4 border-2 border-white p-4 bg-black space-y-3">
                <div className="flex justify-between items-center border-b border-white pb-1">
                  <div>
                    <h2 className="text-xs font-black uppercase">PERÍCIAS DO SISTEMA (+2D6)</h2>
                    <span className="text-[9px] text-neutral-400 uppercase font-mono">TOTAL: 2D6 + ATRIBUTO + PTS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`border px-1.5 py-0.5 text-[9px] font-mono font-bold transition ${
                      tetosEPontos.gastoPer > tetosEPontos.tetoPer
                        ? 'border-red-500 text-red-500 bg-red-950/40 font-black'
                        : 'border-white text-white'
                    }`}>
                      {tetosEPontos.gastoPer} / {tetosEPontos.tetoPer}P
                    </span>
                    <div className="flex items-center border border-white">
                      <button
                        type="button"
                        onClick={() => handleAjustarTetoPericias(-1)}
                        disabled={tetosEPontos.tetoPer <= 0}
                        className="px-1.5 py-0.5 bg-black text-white hover:bg-white hover:text-black disabled:opacity-20 text-[9px] font-bold cursor-pointer transition"
                        title="Diminuir teto de perícias (-1)"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAjustarTetoPericias(1)}
                        className="px-1.5 py-0.5 bg-black text-white hover:bg-white hover:text-black text-[9px] font-bold cursor-pointer border-l border-white transition"
                        title="Aumentar teto de perícias (+1)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-[720px] overflow-y-auto pr-1">
                  {personagem.pericias.map((p, idx) => {
                    const bonusAtrTraço = derivados.modAtributosTraços?.[p.atr] ?? 0;
                    const atrValor = (personagem.atributos[p.atr] ?? 0) + bonusAtrTraço;
                    const bonusTracoPericia = derivados.modPericiasTraços?.[p.nome] ?? 0;
                    const baseBonus = atrValor + p.pts + bonusTracoPericia;
                    const isAttrSobreHumano = atrValor > 5;
                    // Carga Pesada, Máxima ou Excedida impõe -2 em todos os testes de DES e testes de Atletismo
                    const isPenalizadoCarga = (derivados.estadoCarga !== 'leve') && (p.atr === 'DES' || p.nome.toLowerCase() === 'atletismo');
                    const penalidadeCarga = isPenalizadoCarga ? -2 : 0;
                    const finalBonus = baseBonus + penalidadeCarga;

                    return (
                      <div
                        key={p.nome}
                        className={`border p-1.5 flex justify-between items-center text-xs transition ${
                          isPenalizadoCarga ? 'border-amber-400/80 bg-amber-950/20' : 'border-white/60 hover:border-white'
                        }`}
                      >
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold uppercase">{p.nome}</span>
                            <span className="border border-white px-1 text-[8px] font-mono text-neutral-300">
                              {p.atr}
                            </span>
                            {bonusTracoPericia !== 0 && (
                              <span className="border border-white bg-white text-black px-1 text-[7px] font-black uppercase tracking-wider">
                                {bonusTracoPericia > 0 ? `+${bonusTracoPericia}` : bonusTracoPericia} TRAÇO
                              </span>
                            )}
                            {isPenalizadoCarga && (
                              <span
                                className="border border-amber-400 bg-amber-950/70 text-amber-300 px-1 text-[7px] font-black uppercase tracking-wider"
                                title="Penalidade de -2 aplicada por Carga Pesada/Sobrecarga (testes de DES, Atletismo, Esquiva e Iniciativa)"
                              >
                                -2 CARGA
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-neutral-400 font-mono">
                            ROLAGEM: 2D6 + <span className={isAttrSobreHumano ? 'text-amber-300 font-bold' : ''}>{atrValor}</span> + {p.pts}
                            {bonusTracoPericia !== 0 && (
                              <span className="text-amber-300 font-bold"> {bonusTracoPericia > 0 ? `+ ${bonusTracoPericia}` : `- ${Math.abs(bonusTracoPericia)}`} (TRAÇO)</span>
                            )}
                            {isPenalizadoCarga && (
                              <span className="text-amber-300 font-bold"> - 2 (CARGA)</span>
                            )}
                            {' '}={' '}
                            <strong className={isPenalizadoCarga ? 'text-amber-300' : 'text-white'}>
                              {finalBonus >= 0 ? `+${finalBonus}` : finalBonus}
                            </strong>
                          </div>
                        </div>

                        <div className="flex items-center border border-white">
                          <button
                            onClick={() => handleAlterarPericia(idx, -1)}
                            disabled={p.pts <= 0}
                            className="px-2 py-0.5 bg-black text-white hover:bg-white hover:text-black disabled:opacity-20 text-xs font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono">
                            {p.pts}
                          </span>
                          <button
                            onClick={() => handleAlterarPericia(idx, 1)}
                            disabled={p.pts >= 5}
                            className="px-2 py-0.5 bg-black text-white hover:bg-white hover:text-black disabled:opacity-20 text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: TRAITS (VANTAGENS & DESVANTAGENS UNIFICADAS) */}
              <div className="lg:col-span-4 space-y-4">
                
                <div className="border-2 border-white p-4 bg-black space-y-4">
                  
                  {/* Advantages (Racial + Acquired) */}
                  <div>
                    <div className="flex justify-between items-center border-b border-white pb-1 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xs font-black uppercase">VANTAGENS</h2>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className={`border px-1.5 py-0.5 text-[9px] font-bold transition ${
                            tetosEPontos.gastoVant > tetosEPontos.tetoVant
                              ? 'border-red-500 text-red-500 bg-red-950/40 font-black'
                              : 'border-white text-white'
                          }`}>
                            {tetosEPontos.gastoVant} / {tetosEPontos.tetoVant}P
                          </span>
                          <div className="flex items-center border border-white">
                            <button
                              type="button"
                              onClick={() => handleAjustarTetoVantagens(-1)}
                              disabled={tetosEPontos.tetoVant <= 0}
                              className="px-1.5 py-0.5 bg-black text-white hover:bg-white hover:text-black disabled:opacity-20 text-[9px] font-bold cursor-pointer transition"
                              title="Diminuir teto de vantagens (-1)"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAjustarTetoVantagens(1)}
                              className="px-1.5 py-0.5 bg-black text-white hover:bg-white hover:text-black text-[9px] font-bold cursor-pointer border-l border-white transition"
                              title="Aumentar teto de vantagens (+1)"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setModalCatalogo({ aberto: true, tipo: 'vantagem', busca: '', filtroPontos: 'todos' })}
                        className="px-2 py-0.5 border border-white text-[10px] font-bold uppercase hover:bg-white hover:text-black transition flex items-center gap-1 cursor-pointer shrink-0"
                        title="Abrir catálogo para selecionar vantagens"
                      >
                        + ADICIONAR
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      {(racaAtual.vantagens || []).length === 0 && personagem.vantagensAdquiridas.length === 0 ? (
                        <div className="border border-dashed border-neutral-700 p-2 text-center text-[9px] uppercase text-neutral-400">
                          [ NENHUMA VANTAGEM NA FICHA — CLIQUE EM &quot;+ ADICIONAR&quot; ]
                        </div>
                      ) : (
                        <>
                          {/* Racial Innate Advantages */}
                          {(racaAtual.vantagens || []).map(id => {
                            const t = getTraço(id);
                            if (!t) return null;
                            let modsBadge = "";
                            if (t.modPv) modsBadge += `[+${t.modPv} PV] `;
                            if (t.modPe) modsBadge += `[+${t.modPe} PE] `;
                            if (t.modDesl) modsBadge += `[+${t.modDesl} DESL] `;
                            if (t.modRd) modsBadge += `[RD ${t.modRd}] `;
                            if (t.modCargaFor) modsBadge += `[FOR+${t.modCargaFor} CARGA] `;

                            return (
                              <div key={`racial-vant-${id}`} className="border border-white p-2.5 text-xs space-y-1 bg-black">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold uppercase text-white">{t.nome}</span>
                                    <span className="border border-white px-1.5 py-0.5 text-[9px] font-bold font-mono bg-white text-black">
                                      -{t.pontos} PTS
                                    </span>
                                    {modsBadge && (
                                      <span className="border border-white px-1 text-[8px] font-bold font-mono text-white">
                                        {modsBadge.trim()}
                                      </span>
                                    )}
                                    <span className="bg-white text-black px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
                                      RACIAL {t.nivel && t.maxNivel && t.maxNivel > 1 ? `(NV ${t.nivel})` : ''}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">{t.desc}</p>
                              </div>
                            );
                          })}

                          {/* Acquired Character Advantages */}
                          {personagem.vantagensAdquiridas.map(id => {
                            const t = getTraço(id);
                            if (!t) return null;
                            const temNiveis = t.niveis && t.niveis.length > 1;
                            const nivelAtual = t.nivel || 1;
                            const maxNiveis = t.maxNivel || (t.niveis ? t.niveis.length : 1);

                            let modsBadge = "";
                            if (t.modPv) modsBadge += `[+${t.modPv} PV] `;
                            if (t.modPe) modsBadge += `[+${t.modPe} PE] `;
                            if (t.modDesl) modsBadge += `[+${t.modDesl} DESL] `;
                            if (t.modRd) modsBadge += `[RD ${t.modRd}] `;
                            if (t.modCargaFor) modsBadge += `[FOR+${t.modCargaFor} CARGA] `;

                            return (
                              <div key={`char-vant-${id}`} className="border border-white p-2.5 text-xs space-y-2 bg-black">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold uppercase text-white">{t.nome}</span>
                                    <span className="border border-white px-1.5 py-0.5 text-[9px] font-bold font-mono bg-white text-black">
                                      -{t.pontos} {t.pontos === 1 ? 'PONTO' : 'PONTOS'}
                                    </span>
                                    {modsBadge && (
                                      <span className="border border-white px-1 text-[8px] font-bold font-mono text-white">
                                        {modsBadge.trim()}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleRemoverTraçoPersonagem(id, 'vantagem')}
                                    className="px-1.5 py-0.5 border border-white text-[9px] font-bold hover:bg-white hover:text-black cursor-pointer shrink-0"
                                    title="Remover vantagem da ficha"
                                  >
                                    [X]
                                  </button>
                                </div>

                                {/* Level Stepper and Quick Pills for multi-level traits */}
                                {temNiveis && (
                                  <div className="bg-neutral-900 border border-neutral-700 p-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                                    <div className="flex items-center gap-1 font-mono">
                                      <span className="text-neutral-400 font-bold uppercase text-[9px]">NÍVEL:</span>
                                      <button
                                        onClick={() => handleAlterarNivelVantagem(id, nivelAtual - 1)}
                                        disabled={nivelAtual <= 1}
                                        className="px-2 py-0.5 border border-white bg-black hover:bg-white hover:text-black disabled:opacity-20 text-[10px] font-black cursor-pointer"
                                        title="Diminuir nível"
                                      >
                                        -
                                      </button>
                                      <span className="px-2 py-0.5 font-bold text-white bg-black border border-neutral-600">
                                        NV {nivelAtual} / {maxNiveis}
                                      </span>
                                      <button
                                        onClick={() => handleAlterarNivelVantagem(id, nivelAtual + 1)}
                                        disabled={nivelAtual >= maxNiveis}
                                        className="px-2 py-0.5 border border-white bg-black hover:bg-white hover:text-black disabled:opacity-20 text-[10px] font-black cursor-pointer"
                                        title="Aumentar nível"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-1 font-mono">
                                      {t.niveis!.map(nl => (
                                        <button
                                          key={nl.nivel}
                                          onClick={() => handleAlterarNivelVantagem(id, nl.nivel)}
                                          className={`px-1.5 py-0.5 text-[8px] font-bold border transition cursor-pointer ${
                                            nivelAtual === nl.nivel
                                              ? 'bg-white text-black border-white'
                                              : 'bg-black text-neutral-400 border-neutral-700 hover:border-white'
                                          }`}
                                          title={`Mudar para Nível ${nl.nivel} (${nl.pontos}P)`}
                                        >
                                          NV{nl.nivel}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">{t.desc}</p>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Disadvantages (Racial + Acquired) */}
                  <div className="border-t border-white pt-3">
                    <div className="flex justify-between items-center border-b border-white pb-1 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xs font-black uppercase">DESVANTAGENS</h2>
                        <span className="text-[9px] font-mono text-neutral-400">
                          (+{tetosEPontos.bonusDesv} PTS GERADOS)
                        </span>
                      </div>
                      <button
                        onClick={() => setModalCatalogo({ aberto: true, tipo: 'desvantagem', busca: '', filtroPontos: 'todos' })}
                        className="px-2 py-0.5 border border-white text-[10px] font-bold uppercase hover:bg-white hover:text-black transition flex items-center gap-1 cursor-pointer"
                        title="Abrir catálogo para selecionar desvantagens"
                      >
                        + ADICIONAR
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      {(racaAtual.desvantagens || []).length === 0 && personagem.desvantagensAdquiridas.length === 0 ? (
                        <div className="border border-dashed border-neutral-700 p-2 text-center text-[9px] uppercase text-neutral-400">
                          [ NENHUMA DESVANTAGEM NA FICHA — CLIQUE EM &quot;+ ADICIONAR&quot; ]
                        </div>
                      ) : (
                        <>
                          {/* Racial Innate Disadvantages */}
                          {(racaAtual.desvantagens || []).map(id => {
                            const t = getTraço(id);
                            if (!t) return null;
                            let modsBadge = "";
                            if (t.modPv) modsBadge += `[+${t.modPv} PV] `;
                            if (t.modPe) modsBadge += `[+${t.modPe} PE] `;
                            if (t.modDesl) modsBadge += `[+${t.modDesl} DESL] `;
                            if (t.modRd) modsBadge += `[RD ${t.modRd}] `;
                            if (t.modCargaFor) modsBadge += `[FOR+${t.modCargaFor} CARGA] `;

                            return (
                              <div key={`racial-desv-${id}`} className="border border-white p-2.5 text-xs space-y-1 bg-black">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold uppercase text-white">{t.nome}</span>
                                    <span className="border border-white px-1.5 py-0.5 text-[9px] font-bold font-mono bg-white text-black">
                                      +{t.pontos} PTS
                                    </span>
                                    {modsBadge && (
                                      <span className="border border-white px-1 text-[8px] font-bold font-mono text-white">
                                        {modsBadge.trim()}
                                      </span>
                                    )}
                                    <span className="bg-white text-black px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
                                      RACIAL {t.nivel && t.maxNivel && t.maxNivel > 1 ? `(NV ${t.nivel})` : ''}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">{t.desc}</p>
                              </div>
                            );
                          })}

                          {/* Acquired Character Disadvantages */}
                          {personagem.desvantagensAdquiridas.map(id => {
                            const t = getTraço(id);
                            if (!t) return null;
                            const temNiveis = t.niveis && t.niveis.length > 1;
                            const nivelAtual = t.nivel || 1;
                            const maxNiveis = t.maxNivel || (t.niveis ? t.niveis.length : 1);
                            const baseId = id.split(':')[0];

                            let modsBadge = "";
                            if (t.modPv) modsBadge += `[+${t.modPv} PV] `;
                            if (t.modPe) modsBadge += `[+${t.modPe} PE] `;
                            if (t.modDesl) modsBadge += `[+${t.modDesl} DESL] `;
                            if (t.modRd) modsBadge += `[RD ${t.modRd}] `;
                            if (t.modCargaFor) modsBadge += `[FOR+${t.modCargaFor} CARGA] `;

                            return (
                              <div key={`char-desv-${id}`} className="border border-white p-2.5 text-xs space-y-2 bg-black">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold uppercase text-white">{t.nome}</span>
                                    <span className="border border-white px-1.5 py-0.5 text-[9px] font-bold font-mono bg-white text-black">
                                      +{t.pontos} PTS
                                    </span>
                                    {modsBadge && (
                                      <span className="border border-white px-1 text-[8px] font-bold font-mono text-white">
                                        {modsBadge.trim()}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleRemoverTraçoPersonagem(id, 'desvantagem')}
                                    className="px-1.5 py-0.5 border border-white text-[9px] font-bold hover:bg-white hover:text-black cursor-pointer shrink-0"
                                    title="Remover desvantagem da ficha"
                                  >
                                    [X]
                                  </button>
                                </div>

                                {/* Level Stepper and Quick Pills for multi-level traits */}
                                {temNiveis && (
                                  <div className="bg-neutral-900 border border-neutral-700 p-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                                    <div className="flex items-center gap-1 font-mono">
                                      <span className="text-neutral-400 font-bold uppercase text-[9px]">NÍVEL:</span>
                                      <button
                                        type="button"
                                        onClick={() => handleAlterarNivelDesvantagem(baseId, nivelAtual - 1)}
                                        disabled={nivelAtual <= 1}
                                        className="px-2 py-0.5 border border-white bg-black hover:bg-white hover:text-black disabled:opacity-20 text-[10px] font-black cursor-pointer"
                                        title="Diminuir nível"
                                      >
                                        -
                                      </button>
                                      <span className="px-2 py-0.5 font-bold text-white bg-black border border-neutral-600">
                                        NV {nivelAtual} / {maxNiveis}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAlterarNivelDesvantagem(baseId, nivelAtual + 1)}
                                        disabled={nivelAtual >= maxNiveis}
                                        className="px-2 py-0.5 border border-white bg-black hover:bg-white hover:text-black disabled:opacity-20 text-[10px] font-black cursor-pointer"
                                        title="Aumentar nível"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-1 font-mono">
                                      {t.niveis!.map(nl => (
                                        <button
                                          key={nl.nivel}
                                          type="button"
                                          onClick={() => handleAlterarNivelDesvantagem(baseId, nl.nivel)}
                                          className={`px-1.5 py-0.5 text-[8px] font-bold border transition cursor-pointer ${
                                            nivelAtual === nl.nivel
                                              ? 'bg-white text-black border-white'
                                              : 'bg-black text-neutral-400 border-neutral-700 hover:border-white'
                                          }`}
                                          title={`Mudar para Nível ${nl.nivel} (${nl.pontos}P)`}
                                        >
                                          NV{nl.nivel}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">{t.desc}</p>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* ======================================================= */}
            {/* INVENTÁRIO, EQUIPAMENTOS E REGRAS DE CARGA              */}
            {/* ======================================================= */}
            <div className="border-2 border-white p-4 bg-black space-y-4 font-mono">
              <div className="flex flex-wrap justify-between items-center border-b border-white pb-2 gap-2">
                <div>
                  <h2 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <span>INVENTÁRIO & EQUIPAMENTO DO PERSONAGEM</span>
                  </h2>
                  <div className="text-[9px] text-neutral-400 uppercase">
                    REGISTRO DE ITENS, ARMAS E EQUIPAMENTOS CARREGADOS NA FICHA
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`border px-2 py-1 text-xs font-bold font-mono ${
                    derivados.estadoCarga === 'leve'
                      ? 'border-white text-white bg-black'
                      : derivados.estadoCarga === 'pesada'
                      ? 'border-amber-400 text-amber-300 bg-amber-950/40'
                      : 'border-red-500 text-red-400 bg-red-950/40'
                  }`}>
                    {personagem.itensCarregados ?? 0} / {derivados.cargaMax} ITENS
                    {derivados.estadoCarga === 'leve' && ' [LEVE: NORMAL]'}
                    {derivados.estadoCarga === 'pesada' && ' [PESADA: -2 DES / ATLETISMO]'}
                    {derivados.estadoCarga === 'maxima' && ' [MÁXIMA: SEM CORRIDA / SEM LUTA]'}
                    {derivados.estadoCarga === 'excedida' && ' [EXCEDIDA: IMOBILIZADO]'}
                  </span>
                </div>
              </div>

              {/* Action Toolbar: Manual vs Catalog */}
              <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-2">
                <button
                  type="button"
                  onClick={() => setCatalogoAberto(false)}
                  className={`px-3 py-1.5 text-xs font-black uppercase transition cursor-pointer border ${
                    !catalogoAberto
                      ? 'bg-white text-black border-white'
                      : 'bg-black text-white border-neutral-700 hover:border-white'
                  }`}
                >
                  + ITEM PERSONALIZADO
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogoAberto(true)}
                  className={`px-3 py-1.5 text-xs font-black uppercase transition cursor-pointer border flex items-center gap-1.5 ${
                    catalogoAberto
                      ? 'bg-white text-black border-white'
                      : 'bg-black text-white border-neutral-700 hover:border-white'
                  }`}
                >
                  <span>ARSENAL OFICIAL</span>
                  <span className={`px-1 text-[9px] font-mono ${catalogoAberto ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}`}>
                    {bancoItens.length} ITENS
                  </span>
                </button>
              </div>

              {/* SECTION A: MANUAL ITEM REGISTRATION */}
              {!catalogoAberto && (
                <form onSubmit={handleAdicionarItemInventario} className="border border-white/60 p-3 bg-neutral-950 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-neutral-300 flex justify-between items-center">
                    <span>+ CADASTRAR ITEM PERSONALIZADO NO INVENTÁRIO</span>
                    <button
                      type="button"
                      onClick={() => setCatalogoAberto(true)}
                      className="text-[9px] text-neutral-400 hover:text-white underline cursor-pointer"
                    >
                      Ou escolher do Arsenal Oficial »
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs">
                    <div className="md:col-span-5">
                      <input
                        type="text"
                        placeholder="Nome do Item (ex: Revólver .38, Casaco de Couro, Tochas...)"
                        value={novoItemNome}
                        onChange={e => setNovoItemNome(e.target.value)}
                        className="w-full bg-black border border-white p-1.5 text-xs text-white placeholder:text-neutral-500 font-sans focus:outline-none focus:border-white"
                      />
                    </div>
                    <div className="md:col-span-3 flex items-center gap-1.5">
                      <span className="text-[9px] text-neutral-400 uppercase font-mono shrink-0">ITENS / PESO:</span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={novoItemQtd}
                        onChange={e => setNovoItemQtd(parseInt(e.target.value) || 1)}
                        className="w-full bg-black border border-white p-1.5 text-xs text-white font-mono focus:outline-none focus:border-white"
                        title="Quantidade de itens/slots de carga que este objeto consome"
                      />
                    </div>
                    <div className="md:col-span-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Descrição / notas (opcional)"
                        value={novoItemDesc}
                        onChange={e => setNovoItemDesc(e.target.value)}
                        className="flex-1 bg-black border border-white p-1.5 text-xs text-white placeholder:text-neutral-500 font-sans focus:outline-none focus:border-white"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-white text-black font-black uppercase text-xs hover:bg-black hover:text-white border border-white transition cursor-pointer shrink-0"
                      >
                        ADICIONAR
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* SECTION B: CANONICAL ARSENAL & CATALOG */}
              {catalogoAberto && (
                <div className="border border-white p-3.5 bg-neutral-950 space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-neutral-800 pb-2">
                    <div>
                      <div className="text-xs font-black uppercase text-white flex items-center gap-2">
                        <span>ARSENAL OFICIAL</span>
                        <span className="bg-white text-black px-1.5 py-0.2 text-[9px] font-bold">
                          OFICIAL +2D6
                        </span>
                      </div>
                      <div className="text-[9px] text-neutral-400">
                        Equipamentos do sistema: armas de época (1935-1940), blindagens, próteses steampunk e itens de sobrevivência.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCatalogoAberto(false)}
                      className="px-2 py-0.5 border border-white/60 text-[10px] text-neutral-300 hover:text-white hover:border-white cursor-pointer"
                    >
                      [X FECHAR CATÁLOGO]
                    </button>
                  </div>

                  {/* Search and Category Filter */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Buscar no arsenal (ex: revólver, tommy gun, colete, prótese, binóculo, dano, calibre...)"
                      value={buscaCatalogo}
                      onChange={e => setBuscaCatalogo(e.target.value)}
                      className="w-full bg-black border border-white p-2 text-xs text-white placeholder:text-neutral-500 font-sans focus:outline-none"
                    />

                    <div className="flex flex-wrap gap-1.5 text-[9px] font-mono">
                      {[
                        { id: 'todos', label: 'TODOS OS ITENS' },
                        { id: 'arma_fogo', label: '🔫 ARMAS DE FOGO (1935-1940)' },
                        { id: 'arma_branca', label: '⚔️ ARMAS BRANCAS' },
                        { id: 'armadura', label: '🛡️ PROTEÇÕES & COLETES' },
                        { id: 'protese', label: '⚙️ PRÓTESES STEAMPUNK' },
                        { id: 'utilitario', label: '🎒 UTILITÁRIOS DE CAMPANHA' },
                        { id: 'alquimia', label: '🧪 ALQUIMIA & BAIXA MAGIA' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoriaCatalogo(cat.id)}
                          className={`px-2 py-1 uppercase font-bold border transition cursor-pointer ${
                            categoriaCatalogo === cat.id
                              ? 'bg-white text-black border-white'
                              : 'bg-black text-neutral-300 border-neutral-800 hover:border-neutral-500'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Catalog Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
                    {itensCatalogoFiltrados.length === 0 ? (
                      <div className="col-span-full border border-dashed border-neutral-700 p-4 text-center text-xs text-neutral-400">
                        NENHUM ITEM ENCONTRADO COM O FILTRO ATUAL.
                      </div>
                    ) : (
                      itensCatalogoFiltrados.map(itemCat => (
                        <div
                          key={itemCat.idCatalogo}
                          className="border border-white/60 p-2.5 bg-black flex flex-col justify-between gap-2 hover:border-white transition group"
                        >
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start gap-1.5">
                              <span className="font-black text-white text-xs uppercase font-sans leading-snug">
                                {itemCat.nome}
                              </span>
                              {itemCat.preco && (
                                <span className="border border-neutral-700 px-1 py-0.2 text-[8px] font-mono text-neutral-300 shrink-0">
                                  {itemCat.preco}
                                </span>
                              )}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 text-[8px] font-mono">
                              <span className="bg-neutral-900 border border-neutral-700 px-1 py-0.2 text-neutral-300 uppercase">
                                {itemCat.categoria === 'arma_fogo' && 'Arma de Fogo'}
                                {itemCat.categoria === 'arma_branca' && 'Arma Branca'}
                                {itemCat.categoria === 'armadura' && 'Armadura'}
                                {itemCat.categoria === 'protese' && 'Prótese Steampunk'}
                                {itemCat.categoria === 'utilitario' && 'Utilitário'}
                                {itemCat.categoria === 'alquimia' && 'Baixa Magia'}
                              </span>

                              <span className="border border-white/40 px-1 py-0.2 text-white">
                                CARGA: {itemCat.qtd} {itemCat.qtd === 1 ? 'ITEM' : 'ITENS'}
                              </span>

                              {itemCat.dano && (
                                <span className="bg-white text-black font-black px-1 py-0.2">
                                  DANO: {itemCat.dano}
                                </span>
                              )}

                              {itemCat.tipoDano && (
                                <span className="border border-neutral-600 px-1 py-0.2 text-neutral-300">
                                  {itemCat.tipoDano}
                                </span>
                              )}

                              {typeof itemCat.rd === 'number' && (
                                <span className="bg-white text-black font-black px-1 py-0.2">
                                  RD {itemCat.rd}
                                </span>
                              )}

                              {itemCat.alcance && (
                                <span className="border border-neutral-700 px-1 py-0.2 text-neutral-400">
                                  ALC: {itemCat.alcance}
                                </span>
                              )}

                              {typeof itemCat.modIniciativa === 'number' && itemCat.modIniciativa !== 0 && (
                                <span className="border border-neutral-700 px-1 py-0.2 text-neutral-400">
                                  INIC: {itemCat.modIniciativa > 0 ? `+${itemCat.modIniciativa}` : itemCat.modIniciativa}
                                </span>
                              )}
                            </div>

                            {itemCat.desc && (
                              <p className="text-[10px] text-neutral-300 font-sans leading-snug">
                                {itemCat.desc}
                              </p>
                            )}

                            {itemCat.detalhes && (
                              <p className="text-[8px] text-neutral-500 font-mono leading-tight">
                                {itemCat.detalhes}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleEquiparItemCatalogo(itemCat)}
                            className="w-full mt-1 py-1.5 bg-white text-black font-black uppercase text-[10px] hover:bg-neutral-200 transition cursor-pointer text-center"
                          >
                            + EQUIPAR NA FICHA
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Items List Grid (Character's Inventory) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-neutral-400">
                  <span>ITENS CARREGADOS PELO PERSONAGEM ({personagem.itensInventario?.length || 0})</span>
                  <span>CONSUMO DE CARGA: {personagem.itensCarregados ?? 0} / {derivados.cargaMax} ITENS</span>
                </div>

                {(!personagem.itensInventario || personagem.itensInventario.length === 0) ? (
                  <div className="border border-dashed border-white/40 p-6 text-center text-neutral-400 text-xs space-y-2">
                    <p className="font-bold text-white uppercase">Nenhum item equipado no inventário no momento.</p>
                    <p className="text-[10px] text-neutral-400 max-w-lg mx-auto font-sans">
                      Você pode equipar itens diretamente do <strong>Arsenal Oficial (1935-1940 & Steampunk)</strong> com 1 clique acima, ou cadastrar objetos personalizados manualmente.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCatalogoAberto(true)}
                      className="px-3 py-1.5 bg-white text-black font-black uppercase text-xs hover:bg-neutral-200 transition cursor-pointer"
                    >
                      ABRIR ARSENAL DO LIVRO
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {personagem.itensInventario.map(it => (
                      <div key={it.id} className="border border-white/60 p-2.5 bg-black flex flex-col justify-between gap-2 hover:border-white transition">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="font-black text-white text-xs uppercase font-sans">{it.nome}</span>
                              {it.categoria && (
                                <span className="ml-1.5 border border-neutral-700 px-1 py-0.2 text-[7px] font-mono text-neutral-400 uppercase">
                                  {it.categoria === 'arma_fogo' && 'Fogo (1935-40)'}
                                  {it.categoria === 'arma_branca' && 'Branca'}
                                  {it.categoria === 'armadura' && 'Armadura'}
                                  {it.categoria === 'protese' && 'Steampunk'}
                                  {it.categoria === 'utilitario' && 'Utilitário'}
                                  {it.categoria === 'alquimia' && 'Baixa Magia'}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoverItemInventario(it.id)}
                              className="px-1.5 py-0.5 border border-white/60 text-[9px] font-bold hover:border-red-500 hover:text-red-500 cursor-pointer shrink-0 transition"
                              title="Remover item do inventário"
                            >
                              [X]
                            </button>
                          </div>

                          {/* Quick Stats Badges if applicable */}
                          {(it.dano || typeof it.rd === 'number' || it.alcance || it.preco) && (
                            <div className="flex flex-wrap gap-1 text-[8px] font-mono">
                              {it.dano && (
                                <span className="bg-white text-black font-black px-1 py-0.2">
                                  DANO: {it.dano} {it.tipoDano ? `(${it.tipoDano})` : ''}
                                </span>
                              )}
                              {typeof it.rd === 'number' && (
                                <span className="bg-white text-black font-black px-1 py-0.2">
                                  RD {it.rd}
                                </span>
                              )}
                              {it.alcance && (
                                <span className="border border-neutral-700 px-1 py-0.2 text-neutral-300">
                                  {it.alcance}
                                </span>
                              )}
                              {typeof it.modIniciativa === 'number' && it.modIniciativa !== 0 && (
                                <span className="border border-neutral-700 px-1 py-0.2 text-neutral-400">
                                  INIC: {it.modIniciativa > 0 ? `+${it.modIniciativa}` : it.modIniciativa}
                                </span>
                              )}
                              {it.preco && (
                                <span className="border border-neutral-700 px-1 py-0.2 text-neutral-400">
                                  {it.preco}
                                </span>
                              )}
                            </div>
                          )}

                          {it.desc && (
                            <p className="text-[10px] text-neutral-300 font-sans leading-tight mt-0.5">{it.desc}</p>
                          )}
                        </div>

                        <div className="flex justify-between items-center border-t border-neutral-800 pt-1.5 text-[10px]">
                          <span className="text-neutral-400 uppercase font-mono text-[9px]">SLOTS DE CARGA:</span>
                          <div className="flex items-center border border-white">
                            <button
                              type="button"
                              onClick={() => handleAlterarQtdItemInventario(it.id, -1)}
                              disabled={it.qtd <= 1}
                              className="px-2 py-0.5 bg-black text-white hover:bg-white hover:text-black disabled:opacity-20 text-[10px] font-bold cursor-pointer"
                              title="Diminuir peso/quantidade de itens"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-bold text-white font-mono">
                              {it.qtd} {it.qtd === 1 ? 'item' : 'itens'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAlterarQtdItemInventario(it.id, 1)}
                              className="px-2 py-0.5 bg-black text-white hover:bg-white hover:text-black text-[10px] font-bold cursor-pointer"
                              title="Aumentar peso/quantidade de itens"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Regras Oficiais de Carga (Do Manual de Regras) */}
              <div className="border border-white/60 p-3 bg-neutral-950 space-y-2">
                <div className="text-[10px] font-bold uppercase text-white flex items-center gap-1.5">
                  <span className="bg-white text-black px-1 font-black">REGRAS OFICIAIS DE CARGA (MOTOR +2D6)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] font-sans">
                  <div className="border border-neutral-700 p-2.5 space-y-1 bg-black">
                    <div className="font-black text-white uppercase font-mono text-[11px]">
                      • Carga Leve (Sem Penalidades)
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      O personagem pode carregar um número de itens igual a <strong className="text-white font-mono">FOR + CON + 5</strong> (até <strong>{derivados.cargaLeve} itens</strong>). Ele se move e luta normalmente.
                    </p>
                  </div>

                  <div className="border border-neutral-700 p-2.5 space-y-1 bg-black">
                    <div className="font-black text-amber-300 uppercase font-mono text-[11px]">
                      • Carga Pesada (Sobrecarga)
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      O personagem pode carregar até o <strong className="text-white font-mono">dobro</strong> da sua Carga Leve (até <strong>{derivados.cargaPesada} itens</strong>). No entanto, ele sofre <strong className="text-amber-300">-2 de penalidade</strong> em todos os testes de Destreza (DES), testes de atletismo e testes de esquiva ou iniciativa em combate.
                    </p>
                  </div>

                  <div className="border border-neutral-700 p-2.5 space-y-1 bg-black">
                    <div className="font-black text-red-400 uppercase font-mono text-[11px]">
                      • Carga Máxima (Limite Absoluto)
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      O personagem pode carregar até o <strong className="text-white font-mono">triplo</strong> da sua Carga Leve (até <strong>{derivados.cargaMax} itens</strong>), mas ele mal consegue andar. Ele perde qualquer bônus de esquiva e <strong className="text-red-400">não pode correr ou lutar</strong>.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </section>
          )
        )}

        {/* ======================================================= */}
        {/* ABA 3: FERRAMENTAS DE DESENVOLVEDOR                     */}
        {/* ======================================================= */}
        {abaAtiva === 'dev' && (
          <section className="space-y-4">

            {/* DEV TOOLS SUB-NAVIGATION BAR */}
            <div className="border-2 border-white bg-black p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  MÓDULO DE DESENVOLVEDOR:
                </span>
                <div className="flex border border-white">
                  <button
                    onClick={() => setSubAbaDev('racas')}
                    className={`px-3 py-1 text-xs font-bold uppercase transition cursor-pointer ${
                      subAbaDev === 'racas' ? 'bg-white text-black' : 'bg-black text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    [ CRIADOR DE RAÇAS ]
                  </button>
                  <button
                    onClick={() => setSubAbaDev('pool')}
                    className={`px-3 py-1 text-xs font-bold uppercase transition cursor-pointer ${
                      subAbaDev === 'pool' ? 'bg-white text-black' : 'bg-black text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    [ POOL DE TRAÇOS ]
                  </button>
                </div>
              </div>

              <div className="text-[9px] text-neutral-400 uppercase font-mono">
                {subAbaDev === 'racas' ? 'EDITOR E BANCO DE RAÇAS DO SISTEMA (PACKS)' : 'BANCO GLOBAL DE VANTAGENS E DESVANTAGENS (PACKS)'}
              </div>
            </div>

            {/* SUB-ABA 1: CRIADOR & EDITOR DE RAÇAS (COM PACKS DE RAÇA) */}
            {subAbaDev === 'racas' && (
              <div className="border-2 border-white p-4 bg-black space-y-4">
                
                {/* Race Editor Toolbar & Packs Bar */}
                <div className="flex flex-wrap justify-between items-center border-b-2 border-white pb-4 gap-3">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider">CRIADOR & PACKS DE RAÇAS // MOTOR +2D6</h2>
                    <p className="text-[9px] text-neutral-400 uppercase">CONFIGURE LIMITES, TRAÇOS VINCULADOS E GERENCIE PACKS DE RAÇAS (JSON)</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Race Pack Export & Import */}
                    <button
                      onClick={exportarPackRacas}
                      className="px-2.5 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                      title="Exportar todas as raças em um arquivo de Pack JSON"
                    >
                      EXP PACK RAÇAS
                    </button>
                    <button
                      onClick={() => fileRacasInputRef.current?.click()}
                      className="px-2.5 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                      title="Importar um arquivo JSON de Pack de Raças"
                    >
                      IMP PACK RAÇAS
                    </button>
                    <input
                      type="file"
                      ref={fileRacasInputRef}
                      className="hidden"
                      accept=".json"
                      onChange={importarPackRacas}
                    />

                    <select
                      value={racaEditorId}
                      onChange={(e) => carregarRacaNoEditor(e.target.value)}
                      className="bg-black border border-white px-3 py-1 text-xs uppercase font-bold text-white focus:outline-none cursor-pointer ml-2"
                    >
                      <optgroup label="-- 6 RAÇAS PADRÃO --">
                        {Object.keys(bancoRacas)
                          .filter(k => bancoRacas[k].isDefault)
                          .map(k => (
                            <option key={k} value={k}>
                              {bancoRacas[k].nome.toUpperCase()} [PADRÃO]
                            </option>
                          ))}
                      </optgroup>
                      {Object.keys(bancoRacas).some(k => !bancoRacas[k].isDefault) && (
                        <optgroup label="-- RAÇAS PERSONALIZADAS --">
                          {Object.keys(bancoRacas)
                            .filter(k => !bancoRacas[k].isDefault)
                            .map(k => (
                              <option key={k} value={k}>
                                {bancoRacas[k].nome.toUpperCase()} [CUSTOM]
                              </option>
                            ))}
                        </optgroup>
                      )}
                    </select>
                    <button
                      onClick={prepararNovaRaca}
                      className="px-3 py-1 bg-white text-black border border-white text-xs uppercase font-extrabold hover:bg-black hover:text-white transition cursor-pointer"
                    >
                      [ + CRIAR NOVA RAÇA ]
                    </button>
                    <button
                      onClick={restaurarRacasPadrao}
                      className="px-3 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                    >
                      RESTAURAR 6 PADRÃO
                    </button>
                  </div>
                </div>

                {/* Race Editor Form */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  
                  {/* Parameters Left Side */}
                  <div className="lg:col-span-2 space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">NOME DA RAÇA *</label>
                        <input
                          type="text"
                          value={racaEditorDraft.nome}
                          onChange={(e) => setRacaEditorDraft(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full bg-black border border-white p-2 text-xs font-bold uppercase text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">IDENTIFICADOR INTERNO (ID)</label>
                        <input
                          type="text"
                          readOnly
                          value={racaEditorDraft.id}
                          className="w-full bg-neutral-900 border border-white/50 p-2 text-xs font-mono text-neutral-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">DESCRIÇÃO // LORE DA RAÇA</label>
                      <textarea
                        rows={2}
                        value={racaEditorDraft.desc}
                        onChange={(e) => setRacaEditorDraft(prev => ({ ...prev, desc: e.target.value }))}
                        className="w-full bg-black border border-white p-2 text-xs text-white focus:outline-none"
                        placeholder="Características biológicas, anatomia e peculiaridades..."
                      />
                    </div>

                    {/* Attribute Limits (FOR, DES, CON, INT, SAB, CAR) */}
                    <div className="border border-white p-3 space-y-2">
                      <div className="flex justify-between items-center border-b border-white pb-1">
                        <div className="text-xs font-black uppercase tracking-wider">
                          LIMITES DE ATRIBUTOS DA RAÇA [MÍNIMO - MÁXIMO]
                        </div>
                        <span className="text-[8px] uppercase font-bold text-neutral-400 bg-neutral-900 border border-neutral-700 px-1 py-0.5">
                          MODIFICADORES TEMPORARIAMENTE DESATIVADOS
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {ATRIBUTOS_ORDEM.map(a => {
                          const [min, max] = racaEditorDraft.limites[a] || [1, 5];
                          return (
                            <div key={a} className="border border-white p-2 text-center">
                              <div className="text-[9px] font-black uppercase mb-1">{a} ({ATRIBUTO_NOMES[a]})</div>
                              <div className="flex items-center justify-center gap-1 text-xs">
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={min}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                    setRacaEditorDraft(prev => ({
                                      ...prev,
                                      limites: {
                                        ...prev.limites,
                                        [a]: [val, Math.max(val, prev.limites[a][1])]
                                      }
                                    }));
                                  }}
                                  className="w-12 text-center bg-black border border-white py-0.5 font-bold"
                                />
                                <span>-</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={max}
                                  onChange={(e) => {
                                    const val = Math.min(10, Math.max(min, parseInt(e.target.value) || 5));
                                    setRacaEditorDraft(prev => ({
                                      ...prev,
                                      limites: {
                                        ...prev.limites,
                                        [a]: [prev.limites[a][0], val]
                                      }
                                    }));
                                  }}
                                  className="w-12 text-center bg-black border border-white py-0.5 font-bold"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Modifiers PV, PE, Desl */}
                    <div className="border border-white p-3 space-y-2">
                      <div className="text-xs font-black uppercase tracking-wider border-b border-white pb-1">
                        MODIFICADORES BIOLÓGICOS RACIAIS
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">MOD PV</label>
                          <input
                            type="number"
                            value={racaEditorDraft.modPv}
                            onChange={(e) => setRacaEditorDraft(prev => ({ ...prev, modPv: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-black border border-white p-1 text-xs text-center font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">MOD PE</label>
                          <input
                            type="number"
                            value={racaEditorDraft.modPe}
                            onChange={(e) => setRacaEditorDraft(prev => ({ ...prev, modPe: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-black border border-white p-1 text-xs text-center font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">MOD DESL (M)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={racaEditorDraft.modDesl}
                            onChange={(e) => setRacaEditorDraft(prev => ({ ...prev, modDesl: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-black border border-white p-1 text-xs text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={salvarRacaEditor}
                        className="px-4 py-2 bg-white text-black font-extrabold text-xs uppercase hover:bg-black hover:text-white border-2 border-white transition cursor-pointer"
                      >
                        SALVAR ALTERAÇÕES DA RAÇA
                      </button>
                      <button
                        onClick={duplicarRacaEditor}
                        className="px-3 py-2 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                      >
                        DUPLICAR ESTA RAÇA
                      </button>
                      {!racaEditorDraft.isDefault && (
                        <button
                          onClick={excluirRacaEditor}
                          className="px-3 py-2 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                        >
                          EXCLUIR RAÇA CUSTOM
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Right: Attached traits to the race */}
                  <div className="border border-white p-3 space-y-4 bg-black">
                    <div className="flex justify-between items-center border-b border-white pb-1">
                      <div className="text-xs font-black uppercase tracking-wider">
                        TRAÇOS INATOS VINCULADOS
                      </div>
                      <span className="text-[9px] font-mono text-neutral-400">
                        {racaEditorDraft.vantagens.length + racaEditorDraft.desvantagens.length} TOTAL
                      </span>
                    </div>

                    {/* Vantagens Raciais */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center border-b border-white pb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-neutral-300">VANTAGENS RACIAIS</span>
                          <span className="text-[9px] font-mono text-neutral-400">({racaEditorDraft.vantagens.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setModalCatalogo({ aberto: true, tipo: 'vantagem', busca: '', filtroPontos: 'todos', origem: 'raca' })}
                          className="px-2 py-0.5 border border-white text-[10px] font-bold uppercase hover:bg-white hover:text-black transition flex items-center gap-1 cursor-pointer"
                          title="Abrir catálogo para vincular vantagens à raça"
                        >
                          + ADICIONAR
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        {racaEditorDraft.vantagens.length === 0 ? (
                          <div className="border border-dashed border-neutral-700 p-2.5 text-center text-[9px] uppercase text-neutral-400">
                            [ NENHUMA VANTAGEM RACIAL VINCULADA — CLIQUE EM &quot;+ ADICIONAR&quot; ]
                          </div>
                        ) : (
                          racaEditorDraft.vantagens.map(id => {
                            const t = getTraço(id);
                            if (!t) return null;
                            const temNiveis = t.niveis && t.niveis.length > 1;
                            const nivelAtual = t.nivel || 1;
                            const maxNiveis = t.maxNivel || (t.niveis ? t.niveis.length : 1);
                            const baseId = id.split(':')[0];

                            let modsBadge = "";
                            if (t.modPv) modsBadge += `[+${t.modPv} PV] `;
                            if (t.modPe) modsBadge += `[+${t.modPe} PE] `;
                            if (t.modDesl) modsBadge += `[+${t.modDesl} DESL] `;
                            if (t.modRd) modsBadge += `[RD ${t.modRd}] `;
                            if (t.modCargaFor) modsBadge += `[FOR+${t.modCargaFor} CARGA] `;

                            return (
                              <div key={`raca-vant-${id}`} className="border border-white p-2.5 text-xs space-y-2 bg-black">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold uppercase text-white">{t.nome}</span>
                                    <span className="border border-white px-1.5 py-0.5 text-[9px] font-bold font-mono bg-white text-black">
                                      -{t.pontos} {t.pontos === 1 ? 'PONTO' : 'PONTOS'}
                                    </span>
                                    {modsBadge && (
                                      <span className="border border-white px-1 text-[8px] font-bold font-mono text-white">
                                        {modsBadge.trim()}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoverTraçoRaca(id, 'vantagem')}
                                    className="px-1.5 py-0.5 border border-white text-[9px] font-bold hover:bg-white hover:text-black cursor-pointer shrink-0"
                                    title="Remover vantagem da raça"
                                  >
                                    [X]
                                  </button>
                                </div>

                                {/* Level Stepper and Quick Pills for multi-level traits */}
                                {temNiveis && (
                                  <div className="bg-neutral-900 border border-neutral-700 p-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                                    <div className="flex items-center gap-1 font-mono">
                                      <span className="text-neutral-400 font-bold uppercase text-[9px]">NÍVEL:</span>
                                      <button
                                        type="button"
                                        onClick={() => handleAlterarNivelTraçoRaca(baseId, 'vantagem', nivelAtual - 1)}
                                        disabled={nivelAtual <= 1}
                                        className="px-2 py-0.5 border border-white bg-black hover:bg-white hover:text-black disabled:opacity-20 text-[10px] font-black cursor-pointer"
                                        title="Diminuir nível"
                                      >
                                        -
                                      </button>
                                      <span className="px-2 py-0.5 font-bold text-white bg-black border border-neutral-600">
                                        NV {nivelAtual} / {maxNiveis}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAlterarNivelTraçoRaca(baseId, 'vantagem', nivelAtual + 1)}
                                        disabled={nivelAtual >= maxNiveis}
                                        className="px-2 py-0.5 border border-white bg-black hover:bg-white hover:text-black disabled:opacity-20 text-[10px] font-black cursor-pointer"
                                        title="Aumentar nível"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-1 font-mono">
                                      {t.niveis!.map(nl => (
                                        <button
                                          key={nl.nivel}
                                          type="button"
                                          onClick={() => handleAlterarNivelTraçoRaca(baseId, 'vantagem', nl.nivel)}
                                          className={`px-1.5 py-0.5 text-[8px] font-bold border transition cursor-pointer ${
                                            nivelAtual === nl.nivel
                                              ? 'bg-white text-black border-white'
                                              : 'bg-black text-neutral-400 border-neutral-700 hover:border-white'
                                          }`}
                                          title={`Mudar para Nível ${nl.nivel} (${nl.pontos}P)`}
                                        >
                                          NV{nl.nivel}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">{t.desc}</p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Desvantagens Raciais */}
                    <div className="space-y-2 border-t border-white/40 pt-3">
                      <div className="flex justify-between items-center border-b border-white pb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-neutral-300">DESVANTAGENS RACIAIS</span>
                          <span className="text-[9px] font-mono text-neutral-400">({racaEditorDraft.desvantagens.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setModalCatalogo({ aberto: true, tipo: 'desvantagem', busca: '', filtroPontos: 'todos', origem: 'raca' })}
                          className="px-2 py-0.5 border border-white text-[10px] font-bold uppercase hover:bg-white hover:text-black transition flex items-center gap-1 cursor-pointer"
                          title="Abrir catálogo para vincular desvantagens à raça"
                        >
                          + ADICIONAR
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        {racaEditorDraft.desvantagens.length === 0 ? (
                          <div className="border border-dashed border-neutral-700 p-2.5 text-center text-[9px] uppercase text-neutral-400">
                            [ NENHUMA DESVANTAGEM RACIAL VINCULADA — CLIQUE EM &quot;+ ADICIONAR&quot; ]
                          </div>
                        ) : (
                          racaEditorDraft.desvantagens.map(id => {
                            const t = getTraço(id);
                            if (!t) return null;
                            const temNiveis = t.niveis && t.niveis.length > 1;
                            const nivelAtual = t.nivel || 1;
                            const maxNiveis = t.maxNivel || (t.niveis ? t.niveis.length : 1);
                            const baseId = id.split(':')[0];

                            let modsBadge = "";
                            if (t.modPv) modsBadge += `[+${t.modPv} PV] `;
                            if (t.modPe) modsBadge += `[+${t.modPe} PE] `;
                            if (t.modDesl) modsBadge += `[+${t.modDesl} DESL] `;
                            if (t.modRd) modsBadge += `[RD ${t.modRd}] `;
                            if (t.modCargaFor) modsBadge += `[FOR+${t.modCargaFor} CARGA] `;

                            return (
                              <div key={`raca-desv-${id}`} className="border border-white p-2.5 text-xs space-y-2 bg-black">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold uppercase text-white">{t.nome}</span>
                                    <span className="border border-white px-1.5 py-0.5 text-[9px] font-bold font-mono bg-white text-black">
                                      +{t.pontos} {t.pontos === 1 ? 'PONTO' : 'PONTOS'}
                                    </span>
                                    {modsBadge && (
                                      <span className="border border-white px-1 text-[8px] font-bold font-mono text-white">
                                        {modsBadge.trim()}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoverTraçoRaca(id, 'desvantagem')}
                                    className="px-1.5 py-0.5 border border-white text-[9px] font-bold hover:bg-white hover:text-black cursor-pointer shrink-0"
                                    title="Remover desvantagem da raça"
                                  >
                                    [X]
                                  </button>
                                </div>

                                {/* Level Stepper and Quick Pills for multi-level traits */}
                                {temNiveis && (
                                  <div className="bg-neutral-900 border border-neutral-700 p-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                                    <div className="flex items-center gap-1 font-mono">
                                      <span className="text-neutral-400 font-bold uppercase text-[9px]">NÍVEL:</span>
                                      <button
                                        type="button"
                                        onClick={() => handleAlterarNivelTraçoRaca(baseId, 'desvantagem', nivelAtual - 1)}
                                        disabled={nivelAtual <= 1}
                                        className="px-2 py-0.5 border border-white bg-black hover:bg-white hover:text-black disabled:opacity-20 text-[10px] font-black cursor-pointer"
                                        title="Diminuir nível"
                                      >
                                        -
                                      </button>
                                      <span className="px-2 py-0.5 font-bold text-white bg-black border border-neutral-600">
                                        NV {nivelAtual} / {maxNiveis}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAlterarNivelTraçoRaca(baseId, 'desvantagem', nivelAtual + 1)}
                                        disabled={nivelAtual >= maxNiveis}
                                        className="px-2 py-0.5 border border-white bg-black hover:bg-white hover:text-black disabled:opacity-20 text-[10px] font-black cursor-pointer"
                                        title="Aumentar nível"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-1 font-mono">
                                      {t.niveis!.map(nl => (
                                        <button
                                          key={nl.nivel}
                                          type="button"
                                          onClick={() => handleAlterarNivelTraçoRaca(baseId, 'desvantagem', nl.nivel)}
                                          className={`px-1.5 py-0.5 text-[8px] font-bold border transition cursor-pointer ${
                                            nivelAtual === nl.nivel
                                              ? 'bg-white text-black border-white'
                                              : 'bg-black text-neutral-400 border-neutral-700 hover:border-white'
                                          }`}
                                          title={`Mudar para Nível ${nl.nivel} (${nl.pontos}P)`}
                                        >
                                          NV{nl.nivel}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">{t.desc}</p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* SUB-ABA 2: POOL DE TRAÇOS COM SCRIPTING & MODIFICADORES AVANÇADOS */}
            {subAbaDev === 'pool' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Left: Register & Program Trait Studio (5 cols) */}
                <div className="lg:col-span-5 border-2 border-white p-4 bg-black space-y-4">
                  <div className="flex justify-between items-start border-b-2 border-white pb-2 gap-2">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider">
                        {tracoEditandoId ? 'EDITAR & PROGRAMAR TRAÇO' : 'CRIAR NOVO TRAÇO CUSTOMIZADO'}
                      </h2>
                      <p className="text-[9px] text-neutral-400 uppercase">
                        SISTEMA AVANÇADO DE MODIFICADORES E PROGRAMAÇÃO EM CÓDIGO
                      </p>
                    </div>
                    {tracoEditandoId && (
                      <button
                        type="button"
                        onClick={limparFormularioTraco}
                        className="px-2 py-0.5 border border-amber-400 bg-amber-950/40 text-amber-300 text-[9px] font-bold uppercase hover:bg-amber-400 hover:text-black transition cursor-pointer"
                      >
                        [X CANCELAR EDIÇÃO]
                      </button>
                    )}
                  </div>

                  <form onSubmit={cadastrarNovoTraco} className="space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">TIPO DE TRAÇO *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className={`flex items-center justify-center gap-2 border p-1 text-xs cursor-pointer ${novoTracoTipo === 'vantagem' ? 'border-white bg-white text-black' : 'border-white text-white'}`}>
                          <input
                            type="radio"
                            name="traco-tipo"
                            value="vantagem"
                            checked={novoTracoTipo === 'vantagem'}
                            onChange={() => setNovoTracoTipo('vantagem')}
                            className="hidden"
                          />
                          <span className="font-bold uppercase">VANTAGEM</span>
                        </label>
                        <label className={`flex items-center justify-center gap-2 border p-1 text-xs cursor-pointer ${novoTracoTipo === 'desvantagem' ? 'border-white bg-white text-black' : 'border-white text-white'}`}>
                          <input
                            type="radio"
                            name="traco-tipo"
                            value="desvantagem"
                            checked={novoTracoTipo === 'desvantagem'}
                            onChange={() => setNovoTracoTipo('desvantagem')}
                            className="hidden"
                          />
                          <span className="font-bold uppercase">DESVANTAGEM</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">NOME DO TRAÇO *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Blindagem Dérmica, Agilidade Felina..."
                          value={novoTracoNome}
                          onChange={(e) => setNovoTracoNome(e.target.value)}
                          className="w-full bg-black border border-white p-2 text-xs font-bold uppercase text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">CUSTO (PONTOS) *</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          required
                          value={novoTracoPontos}
                          onChange={(e) => setNovoTracoPontos(parseInt(e.target.value) || 1)}
                          className="w-full bg-black border border-white p-2 text-xs font-bold text-white focus:outline-none text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">REGRA / EFEITO NARRATIVO *</label>
                      <textarea
                        rows={2}
                        required
                        value={novoTracoDesc}
                        onChange={(e) => setNovoTracoDesc(e.target.value)}
                        className="w-full bg-black border border-white p-2 text-xs text-white focus:outline-none"
                        placeholder="Descrição da regra no livro ou efeito de jogo..."
                      />
                    </div>

                    {/* STUDIO MODE SWITCHER: VISUAL vs CODE */}
                    <div className="border border-white/60 bg-neutral-950 p-2.5 space-y-2.5">
                      <div className="flex justify-between items-center border-b border-neutral-800 pb-1.5">
                        <div className="flex border border-white text-[9px]">
                          <button
                            type="button"
                            onClick={() => setAbaEditorTraco('visual')}
                            className={`px-2.5 py-1 font-bold uppercase transition cursor-pointer ${
                              abaEditorTraco === 'visual' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            [ MODO VISUAL ]
                          </button>
                          <button
                            type="button"
                            onClick={() => setAbaEditorTraco('codigo')}
                            className={`px-2.5 py-1 font-bold uppercase transition cursor-pointer ${
                              abaEditorTraco === 'codigo' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            [ MODO CÓDIGO // SCRIPT ]
                          </button>
                        </div>

                        <div className="text-[8px] font-mono text-neutral-400 uppercase">
                          {abaEditorTraco === 'visual' ? 'CAMPOS ESTRUTURADOS' : 'SCRIPTING ENGINE +2D6'}
                        </div>
                      </div>

                      {/* MODE 1: VISUAL MODIFIERS */}
                      {abaEditorTraco === 'visual' && (
                        <div className="space-y-2.5">
                          <div>
                            <span className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">
                              ESTATÍSTICAS VITAIS & COMBATE (DERIVADOS)
                            </span>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                              <div className="border border-neutral-800 p-1 bg-black">
                                <span className="text-[8px] text-neutral-400 block text-center font-bold">PV</span>
                                <input
                                  type="number"
                                  value={novoTracoPv}
                                  onChange={(e) => setNovoTracoPv(parseInt(e.target.value) || 0)}
                                  className="w-full bg-black border border-white/50 p-0.5 text-xs text-center font-bold text-white"
                                />
                              </div>
                              <div className="border border-neutral-800 p-1 bg-black">
                                <span className="text-[8px] text-neutral-400 block text-center font-bold">PE</span>
                                <input
                                  type="number"
                                  value={novoTracoPe}
                                  onChange={(e) => setNovoTracoPe(parseInt(e.target.value) || 0)}
                                  className="w-full bg-black border border-white/50 p-0.5 text-xs text-center font-bold text-white"
                                  title="Pontos de Esforço"
                                />
                              </div>
                              <div className="border border-neutral-800 p-1 bg-black">
                                <span className="text-[8px] text-neutral-400 block text-center font-bold">DESL</span>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={novoTracoDesl}
                                  onChange={(e) => setNovoTracoDesl(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-black border border-white/50 p-0.5 text-xs text-center font-bold text-white"
                                />
                              </div>
                              <div className="border border-neutral-800 p-1 bg-black">
                                <span className="text-[8px] text-neutral-400 block text-center font-bold">RD</span>
                                <input
                                  type="number"
                                  value={novoTracoRd}
                                  onChange={(e) => setNovoTracoRd(parseInt(e.target.value) || 0)}
                                  className="w-full bg-black border border-white/50 p-0.5 text-xs text-center font-bold text-white"
                                  title="Redução de Dano passiva"
                                />
                              </div>
                              <div className="border border-neutral-800 p-1 bg-black">
                                <span className="text-[8px] text-neutral-400 block text-center font-bold">CARGA</span>
                                <input
                                  type="number"
                                  value={novoTracoCargaFor}
                                  onChange={(e) => setNovoTracoCargaFor(parseInt(e.target.value) || 0)}
                                  className="w-full bg-black border border-white/50 p-0.5 text-xs text-center font-bold text-white"
                                  title="Bônus de Força para Carga Leve"
                                />
                              </div>
                              <div className="border border-neutral-800 p-1 bg-black">
                                <span className="text-[8px] text-neutral-400 block text-center font-bold">INIC</span>
                                <input
                                  type="number"
                                  value={novoTracoIniciativa}
                                  onChange={(e) => setNovoTracoIniciativa(parseInt(e.target.value) || 0)}
                                  className="w-full bg-black border border-white/50 p-0.5 text-xs text-center font-bold text-white"
                                  title="Modificador de Iniciativa"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Base Attributes Modifiers */}
                          <div>
                            <span className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">
                              BÔNUS / PENALIDADES EM ATRIBUTOS BASE
                            </span>
                            <div className="grid grid-cols-6 gap-1">
                              {ATRIBUTOS_ORDEM.map(atr => (
                                <div key={atr} className="border border-neutral-800 p-1 bg-black text-center">
                                  <span className="text-[8px] text-neutral-400 block font-bold">{atr}</span>
                                  <input
                                    type="number"
                                    value={novoTracoAtributos[atr] ?? 0}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setNovoTracoAtributos(prev => ({
                                        ...prev,
                                        [atr]: val
                                      }));
                                    }}
                                    className="w-full bg-black border border-white/50 p-0.5 text-xs text-center font-bold text-white"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Skills Modifiers */}
                          <div className="space-y-1.5 border-t border-neutral-800 pt-1.5">
                            <span className="block text-[8px] font-bold text-neutral-400 uppercase">
                              MODIFICADOR ESPECÍFICO DE PERÍCIA
                            </span>
                            <div className="flex gap-1.5 items-center">
                              <select
                                value={pickerPericiaNome}
                                onChange={e => setPickerPericiaNome(e.target.value)}
                                className="flex-1 bg-black border border-white p-1 text-[10px] text-white uppercase focus:outline-none"
                              >
                                {DEFAULT_SKILLS.map(s => (
                                  <option key={s.nome} value={s.nome}>
                                    {s.nome.toUpperCase()} ({s.atr})
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                value={pickerPericiaBonus}
                                onChange={e => setPickerPericiaBonus(parseInt(e.target.value) || 0)}
                                className="w-14 bg-black border border-white p-1 text-xs text-center font-bold text-white"
                                title="Bônus numérico na perícia"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!pickerPericiaNome) return;
                                  setNovoTracoPericias(prev => ({
                                    ...prev,
                                    [pickerPericiaNome]: pickerPericiaBonus
                                  }));
                                }}
                                className="px-2 py-1 bg-white text-black font-black uppercase text-[9px] hover:bg-neutral-200 transition cursor-pointer shrink-0"
                              >
                                + VINCULAR
                              </button>
                            </div>

                            {/* Active Skills Badges */}
                            {Object.keys(novoTracoPericias).length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {Object.entries(novoTracoPericias).map(([nome, bonus]) => (
                                  <span
                                    key={nome}
                                    className="border border-white bg-neutral-900 px-1.5 py-0.5 text-[8px] font-mono flex items-center gap-1 text-white"
                                  >
                                    <span>{nome.toUpperCase()}: {bonus > 0 ? `+${bonus}` : bonus}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNovoTracoPericias(prev => {
                                          const cp = { ...prev };
                                          delete cp[nome];
                                          return cp;
                                        });
                                      }}
                                      className="text-red-400 hover:text-white font-bold cursor-pointer"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={gerarCodigoDosCamposVisuais}
                            className="w-full py-1 border border-neutral-600 hover:border-white text-[9px] font-mono uppercase text-neutral-300 hover:text-white transition cursor-pointer"
                          >
                            [ → GERAR CÓDIGO SCRIPT A PARTIR DOS CAMPOS ]
                          </button>
                        </div>
                      )}

                      {/* MODE 2: CODE SCRIPTING ENGINE */}
                      {abaEditorTraco === 'codigo' && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[8px] text-neutral-400 font-bold uppercase block w-full">
                              SNIPPETS RÁPIDOS DE CÓDIGO (CLIQUE PARA INSERIR):
                            </span>
                            <button
                              type="button"
                              onClick={() => injetarSnippetCodigo("PV += 10;\nPE += 5;")}
                              className="px-1.5 py-0.5 border border-neutral-700 bg-black hover:border-white text-[8px] font-mono uppercase"
                            >
                              + PV / ESFORÇO
                            </button>
                            <button
                              type="button"
                              onClick={() => injetarSnippetCodigo("RD += 4;")}
                              className="px-1.5 py-0.5 border border-neutral-700 bg-black hover:border-white text-[8px] font-mono uppercase"
                            >
                              + BLINDAGEM (RD)
                            </button>
                            <button
                              type="button"
                              onClick={() => injetarSnippetCodigo("DESLOCAMENTO += 2.0;")}
                              className="px-1.5 py-0.5 border border-neutral-700 bg-black hover:border-white text-[8px] font-mono uppercase"
                            >
                              + VELOCIDADE
                            </button>
                            <button
                              type="button"
                              onClick={() => injetarSnippetCodigo("CARGA_FOR += 3;\nFOR += 1;")}
                              className="px-1.5 py-0.5 border border-neutral-700 bg-black hover:border-white text-[8px] font-mono uppercase"
                            >
                              + CARGA & FORÇA
                            </button>
                            <button
                              type="button"
                              onClick={() => injetarSnippetCodigo("INICIATIVA += 2;\nPERICIA[\"Furtividade\"] += 2;")}
                              className="px-1.5 py-0.5 border border-neutral-700 bg-black hover:border-white text-[8px] font-mono uppercase"
                            >
                              + INICIATIVA & FURTIVIDADE
                            </button>
                          </div>

                          <div>
                            <textarea
                              rows={6}
                              value={novoTracoScript}
                              onChange={(e) => setNovoTracoScript(e.target.value)}
                              placeholder={`// Exemplo de código do traço:\nPV += 10;\nPE += 5;\nRD += 4;\nDESLOCAMENTO += 2.0;\nCARGA_FOR += 3;\nINICIATIVA += 2;\nFOR += 1;\nPERICIA["Furtividade"] += 2;`}
                              className="w-full bg-black border border-white p-2 font-mono text-[11px] text-emerald-400 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-400 leading-relaxed"
                              spellCheck={false}
                            />
                          </div>

                          {/* LIVE COMPILATION CONSOLE */}
                          {(() => {
                            const analise = executarScriptTraco(novoTracoScript);
                            const temErros = !!analise.erros && analise.erros.length > 0;
                            const temEfeitos = (
                              analise.modPv !== 0 || analise.modPe !== 0 || analise.modDesl !== 0 ||
                              analise.modRd !== 0 || analise.modCargaFor !== 0 || analise.modIniciativa !== 0 ||
                              Object.keys(analise.modAtributos).length > 0 || Object.keys(analise.modPericias).length > 0
                            );

                            return (
                              <div className="border border-neutral-800 bg-black p-2 font-mono text-[9px] space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-neutral-400 font-bold uppercase">CONSOLE DO COMPILADOR:</span>
                                  {temErros ? (
                                    <span className="text-red-400 font-bold uppercase">[ ⚠️ ERRO DE SINTAXE ]</span>
                                  ) : (
                                    <span className="text-emerald-400 font-bold uppercase">[ ✓ SINTAXE VÁLIDA ]</span>
                                  )}
                                </div>

                                {temErros && (
                                  <div className="text-red-400 space-y-0.5">
                                    {analise.erros!.map((err, i) => (
                                      <div key={i}>• {err}</div>
                                    ))}
                                  </div>
                                )}

                                {temEfeitos && !temErros && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {analise.modPv !== 0 && (
                                      <span className="bg-neutral-800 border border-neutral-700 px-1 text-white">
                                        PV: {analise.modPv > 0 ? `+${analise.modPv}` : analise.modPv}
                                      </span>
                                    )}
                                    {analise.modPe !== 0 && (
                                      <span className="bg-neutral-800 border border-neutral-700 px-1 text-white">
                                        PE: {analise.modPe > 0 ? `+${analise.modPe}` : analise.modPe}
                                      </span>
                                    )}
                                    {analise.modDesl !== 0 && (
                                      <span className="bg-neutral-800 border border-neutral-700 px-1 text-white">
                                        DESL: {analise.modDesl > 0 ? `+${analise.modDesl}` : analise.modDesl}m
                                      </span>
                                    )}
                                    {analise.modRd !== 0 && (
                                      <span className="bg-neutral-800 border border-neutral-700 px-1 text-white">
                                        RD: +{analise.modRd}
                                      </span>
                                    )}
                                    {analise.modCargaFor !== 0 && (
                                      <span className="bg-neutral-800 border border-neutral-700 px-1 text-white">
                                        CARGA: +{analise.modCargaFor}
                                      </span>
                                    )}
                                    {analise.modIniciativa !== 0 && (
                                      <span className="bg-neutral-800 border border-neutral-700 px-1 text-white">
                                        INIC: {analise.modIniciativa > 0 ? `+${analise.modIniciativa}` : analise.modIniciativa}
                                      </span>
                                    )}
                                    {Object.entries(analise.modAtributos).map(([a, v]) => (
                                      <span key={a} className="bg-neutral-800 border border-neutral-700 px-1 text-white">
                                        {a}: {v! > 0 ? `+${v}` : v}
                                      </span>
                                    ))}
                                    {Object.entries(analise.modPericias).map(([p, v]) => (
                                      <span key={p} className="bg-neutral-800 border border-neutral-700 px-1 text-white">
                                        {p}: {v > 0 ? `+${v}` : v}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          <button
                            type="button"
                            onClick={aplicarCodigoAosCamposVisuais}
                            className="w-full py-1 border border-neutral-600 hover:border-white text-[9px] font-mono uppercase text-neutral-300 hover:text-white transition cursor-pointer"
                          >
                            [ ← SINCRONIZAR SCRIPT COM CAMPOS VISUAIS ]
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-white text-black font-extrabold text-xs uppercase hover:bg-black hover:text-white border-2 border-white transition cursor-pointer"
                      >
                        {tracoEditandoId ? '[ SALVAR ALTERAÇÕES DO TRAÇO ]' : '[ + ADICIONAR À POOL ]'}
                      </button>
                      {tracoEditandoId && (
                        <button
                          type="button"
                          onClick={limparFormularioTraco}
                          className="px-3 py-2 border-2 border-neutral-600 hover:border-white text-neutral-300 hover:text-white font-bold text-xs uppercase transition cursor-pointer"
                        >
                          CANCELAR
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Right: Pool List, Filters, Script Badges and Packs (7 cols) */}
                <div className="lg:col-span-7 border-2 border-white p-4 bg-black space-y-3">
                  <div className="flex flex-wrap justify-between items-center border-b border-white pb-2 gap-2">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider">BANCO DE TRAÇOS // PACKS (JSON)</h2>
                      <p className="text-[9px] text-neutral-400 uppercase">
                        EXIBINDO {itensPoolDev.length} DE {pool.length} TRAÇOS DISPONÍVEIS
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={exportarPackTracos}
                        className="px-2.5 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                        title="Exportar todos os traços em um Pack JSON"
                      >
                        EXP PACK TRAÇOS
                      </button>
                      <button
                        onClick={() => fileTracosInputRef.current?.click()}
                        className="px-2.5 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                        title="Importar um Pack de Traços em JSON"
                      >
                        IMP PACK TRAÇOS
                      </button>
                      <input
                        type="file"
                        ref={fileTracosInputRef}
                        className="hidden"
                        accept=".json"
                        onChange={importarPackTracos}
                      />
                      <button
                        onClick={restaurarPoolPadrao}
                        className="px-2.5 py-1 border border-white text-[9px] uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                      >
                        RESTAURAR POOL PADRÃO
                      </button>
                    </div>
                  </div>

                  {/* Search & Filter Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={buscaPool}
                      onChange={(e) => setBuscaPool(e.target.value)}
                      placeholder="BUSCAR POR NOME OU REGRA..."
                      className="flex-1 bg-black border border-white px-3 py-1.5 text-xs uppercase text-white focus:outline-none"
                    />
                    <div className="flex border border-white text-xs">
                      <button
                        onClick={() => setFiltroPoolTipo('todos')}
                        className={`px-2.5 py-1 font-bold uppercase transition cursor-pointer ${
                          filtroPoolTipo === 'todos' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'
                        }`}
                      >
                        TODOS
                      </button>
                      <button
                        onClick={() => setFiltroPoolTipo('vantagem')}
                        className={`px-2.5 py-1 font-bold uppercase transition cursor-pointer ${
                          filtroPoolTipo === 'vantagem' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'
                        }`}
                      >
                        VANTAGENS
                      </button>
                      <button
                        onClick={() => setFiltroPoolTipo('desvantagem')}
                        className={`px-2.5 py-1 font-bold uppercase transition cursor-pointer ${
                          filtroPoolTipo === 'desvantagem' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'
                        }`}
                      >
                        DESVANTAGENS
                      </button>
                    </div>
                  </div>

                  {/* Pool List Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[620px] overflow-y-auto pr-1 font-mono">
                    {itensPoolDev.length === 0 ? (
                      <div className="col-span-2 text-center py-6 text-neutral-500 text-xs uppercase">
                        [ NENHUM TRAÇO ENCONTRADO ]
                      </div>
                    ) : (
                      itensPoolDev.map(t => {
                        const isVant = t.tipo === 'vantagem';
                        const temNiveis = isVant && !!t.niveis && t.niveis.length > 0;
                        const temScript = !!t.codigoScript && t.codigoScript.trim().length > 0;
                        const isSendoEditado = tracoEditandoId === t.id;

                        const pontosBadge = temNiveis && t.niveis!.length > 1
                          ? `${t.niveis![0].pontos} A ${t.niveis![t.niveis!.length - 1].pontos}P`
                          : `${isVant ? '-' : '+'}${t.pontos}P`;

                        return (
                          <div
                            key={t.id}
                            className={`border p-2.5 text-xs flex flex-col justify-between transition ${
                              isSendoEditado
                                ? 'border-amber-400 bg-amber-950/20'
                                : 'border-white bg-black hover:border-neutral-400'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-1 gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold uppercase text-white">{t.nome}</span>
                                  {temScript && (
                                    <span className="border border-emerald-400 bg-emerald-950/60 text-emerald-300 px-1 text-[7px] font-mono font-bold tracking-wider">
                                      SCRIPT
                                    </span>
                                  )}
                                  {isSendoEditado && (
                                    <span className="border border-amber-400 bg-amber-950 text-amber-300 px-1 text-[7px] font-mono font-bold">
                                      EM EDIÇÃO
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {temNiveis && t.niveis!.length > 1 && (
                                    <span className="border border-neutral-600 px-1 text-[8px] font-mono text-neutral-300">
                                      {t.niveis!.length} NV
                                    </span>
                                  )}
                                  <span className="border border-white px-1 text-[9px] font-mono font-bold whitespace-nowrap bg-white text-black">
                                    {pontosBadge}
                                  </span>
                                </div>
                              </div>
                              <p className="text-[9px] text-neutral-300 leading-relaxed mb-2 font-sans">{t.desc}</p>

                              {/* Badges of all Active Modifiers */}
                              <div className="flex flex-wrap gap-1 mb-2">
                                {t.modPv !== undefined && t.modPv !== 0 && (
                                  <span className="border border-neutral-700 bg-neutral-900 px-1 text-[8px] font-mono text-neutral-300">
                                    PV {t.modPv > 0 ? `+${t.modPv}` : t.modPv}
                                  </span>
                                )}
                                {t.modPe !== undefined && t.modPe !== 0 && (
                                  <span className="border border-neutral-700 bg-neutral-900 px-1 text-[8px] font-mono text-neutral-300">
                                    PE {t.modPe > 0 ? `+${t.modPe}` : t.modPe}
                                  </span>
                                )}
                                {t.modDesl !== undefined && t.modDesl !== 0 && (
                                  <span className="border border-neutral-700 bg-neutral-900 px-1 text-[8px] font-mono text-neutral-300">
                                    DESL {t.modDesl > 0 ? `+${t.modDesl}` : t.modDesl}m
                                  </span>
                                )}
                                {t.modRd !== undefined && t.modRd !== 0 && (
                                  <span className="border border-neutral-700 bg-neutral-900 px-1 text-[8px] font-mono text-neutral-300">
                                    RD +{t.modRd}
                                  </span>
                                )}
                                {t.modCargaFor !== undefined && t.modCargaFor !== 0 && (
                                  <span className="border border-neutral-700 bg-neutral-900 px-1 text-[8px] font-mono text-neutral-300">
                                    CARGA +{t.modCargaFor}
                                  </span>
                                )}
                                {t.modIniciativa !== undefined && t.modIniciativa !== 0 && (
                                  <span className="border border-neutral-700 bg-neutral-900 px-1 text-[8px] font-mono text-neutral-300">
                                    INIC {t.modIniciativa > 0 ? `+${t.modIniciativa}` : t.modIniciativa}
                                  </span>
                                )}
                                {t.modAtributos && Object.entries(t.modAtributos).map(([a, v]) => (
                                  <span key={a} className="border border-neutral-700 bg-neutral-900 px-1 text-[8px] font-mono text-neutral-300">
                                    {a} {v! > 0 ? `+${v}` : v}
                                  </span>
                                ))}
                                {t.modPericias && Object.entries(t.modPericias).map(([p, v]) => (
                                  <span key={p} className="border border-neutral-700 bg-neutral-900 px-1 text-[8px] font-mono text-neutral-300">
                                    {p} {v > 0 ? `+${v}` : v}
                                  </span>
                                ))}
                              </div>

                              {temNiveis && t.niveis!.length > 1 && (
                                <div className="mb-2 p-1.5 bg-neutral-900 border border-neutral-700 text-[8px] font-mono space-y-0.5">
                                  {t.niveis!.map(nl => (
                                    <div key={nl.nivel} className="flex justify-between text-neutral-400">
                                      <span>NV {nl.nivel} ({nl.pontos}P):</span>
                                      <span className="text-neutral-300 truncate max-w-[180px]">{nl.desc}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-white/40 text-[9px]">
                              <button
                                type="button"
                                onClick={() => carregarTracoParaEdicao(t)}
                                className="px-1.5 py-0.5 border border-white text-[8px] font-bold uppercase hover:bg-white hover:text-black cursor-pointer transition"
                                title="Editar modificadores e código deste traço"
                              >
                                [EDITAR & PROGRAMAR]
                              </button>
                              <button
                                type="button"
                                onClick={() => excluirTracoPool(t.id)}
                                className="px-1.5 py-0.5 border border-white/60 hover:border-red-500 text-neutral-300 hover:text-red-400 text-[8px] font-bold uppercase cursor-pointer transition"
                              >
                                [EXCLUIR]
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* SUB-ABA 3: ARSENAL & ITENS // GESTÃO DE EQUIPAMENTOS DO SISTEMA */}
            {subAbaDev === 'itens' && (
              <div className="border-2 border-white p-4 bg-black space-y-4">
                
                {/* Arsenal Toolbar & Packs Bar */}
                <div className="flex flex-wrap justify-between items-center border-b-2 border-white pb-4 gap-3">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider">
                      ARSENAL & BANCO DE ITENS // MOTOR +2D6
                    </h2>
                    <p className="text-[9px] text-neutral-400 uppercase">
                      GERENCIE, CADASTRE, EDITE E EXPORTE ITENS DO ARSENAL DO SISTEMA (PACKS JSON)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={exportarPackItens}
                      className="px-2.5 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                      title="Exportar todos os itens do arsenal em um arquivo Pack JSON"
                    >
                      EXP PACK ITENS
                    </button>
                    <button
                      onClick={() => fileItensInputRef.current?.click()}
                      className="px-2.5 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                      title="Importar um arquivo JSON de Pack de Itens"
                    >
                      IMP PACK ITENS
                    </button>
                    <input
                      type="file"
                      ref={fileItensInputRef}
                      className="hidden"
                      accept=".json"
                      onChange={importarPackItens}
                    />
                    <button
                      onClick={restaurarArsenalPadrao}
                      className="px-2.5 py-1 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black transition cursor-pointer"
                      title="Restaurar os 28 itens canônicos originais de 1935-1940 & Steampunk"
                    >
                      RESTAURAR ARSENAL PADRÃO
                    </button>
                  </div>
                </div>

                {/* Arsenal Editor & Database Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* Left: Item Form (Editor & Creator) (4 cols) */}
                  <div className="lg:col-span-4 border border-white p-3.5 bg-neutral-950 space-y-3">
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                      <div>
                        <h3 className="text-xs font-black uppercase text-white">
                          {editandoItemId ? 'EDITANDO ITEM DO ARSENAL' : 'CADASTRAR NOVO ITEM'}
                        </h3>
                        <p className="text-[9px] text-neutral-400 uppercase">
                          {editandoItemId ? `ID: ${itemEditorDraft.id}` : 'ADICIONAR AO ARSENAL GLOBAL'}
                        </p>
                      </div>
                      {editandoItemId && (
                        <button
                          type="button"
                          onClick={cancelarEdicaoItem}
                          className="px-2 py-0.5 border border-amber-400 text-amber-300 text-[9px] font-bold uppercase hover:bg-amber-400 hover:text-black transition cursor-pointer"
                        >
                          CANCELAR
                        </button>
                      )}
                    </div>

                    <form onSubmit={cadastrarOuSalvarItemArsenal} className="space-y-2.5 text-xs">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">
                          NOME DO ITEM *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Carabina Winchester .30-30, Relógio a Vapor..."
                          value={itemEditorDraft.nome}
                          onChange={e => setItemEditorDraft(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full bg-black border border-white p-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">
                            CATEGORIA *
                          </label>
                          <select
                            value={itemEditorDraft.categoria}
                            onChange={e => setItemEditorDraft(prev => ({ ...prev, categoria: e.target.value as any }))}
                            className="w-full bg-black border border-white p-1.5 text-xs text-white uppercase focus:outline-none cursor-pointer"
                          >
                            <option value="arma_fogo">ARMA DE FOGO (1935-40)</option>
                            <option value="arma_branca">ARMA BRANCA</option>
                            <option value="armadura">ARMADURA / PROTEÇÃO</option>
                            <option value="protese">PRÓTESE STEAMPUNK</option>
                            <option value="utilitario">UTILITÁRIO / FERRAMENTA</option>
                            <option value="alquimia">BAIXA MAGIA / ALQUIMIA</option>
                            <option value="geral">EQUIPAMENTO GERAL</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">
                            CARGA (SLOTS DE PESO)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={itemEditorDraft.qtd || 1}
                            onChange={e => setItemEditorDraft(prev => ({ ...prev, qtd: parseInt(e.target.value) || 1 }))}
                            className="w-full bg-black border border-white p-1.5 text-xs text-white font-mono focus:outline-none"
                            title="Slots de carga consumidos na mochila/corpo"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">
                            DANO
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 2d6+2"
                            value={itemEditorDraft.dano || ''}
                            onChange={e => setItemEditorDraft(prev => ({ ...prev, dano: e.target.value }))}
                            className="w-full bg-black border border-white p-1.5 text-xs text-white font-mono focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">
                            TIPO DE DANO
                          </label>
                          <input
                            type="text"
                            placeholder="Balístico, Corte..."
                            value={itemEditorDraft.tipoDano || ''}
                            onChange={e => setItemEditorDraft(prev => ({ ...prev, tipoDano: e.target.value }))}
                            className="w-full bg-black border border-white p-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">
                            RD (REDUÇÃO)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={itemEditorDraft.rd || 0}
                            onChange={e => setItemEditorDraft(prev => ({ ...prev, rd: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-black border border-white p-1.5 text-xs text-white font-mono focus:outline-none text-center"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">
                            ALCANCE
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 150m, CQC"
                            value={itemEditorDraft.alcance || ''}
                            onChange={e => setItemEditorDraft(prev => ({ ...prev, alcance: e.target.value }))}
                            className="w-full bg-black border border-white p-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">
                            MOD. INIC
                          </label>
                          <input
                            type="number"
                            min="-10"
                            max="10"
                            value={itemEditorDraft.modIniciativa || 0}
                            onChange={e => setItemEditorDraft(prev => ({ ...prev, modIniciativa: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-black border border-white p-1.5 text-xs text-white font-mono focus:outline-none text-center"
                            title="Modificador de Iniciativa quando empunhado"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">
                            PREÇO ($)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 250$"
                            value={itemEditorDraft.preco || ''}
                            onChange={e => setItemEditorDraft(prev => ({ ...prev, preco: e.target.value }))}
                            className="w-full bg-black border border-white p-1.5 text-xs text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">
                          DESCRIÇÃO RESUMIDA
                        </label>
                        <input
                          type="text"
                          placeholder="Breve resumo da função..."
                          value={itemEditorDraft.desc || ''}
                          onChange={e => setItemEditorDraft(prev => ({ ...prev, desc: e.target.value }))}
                          className="w-full bg-black border border-white p-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">
                          REGRAS & DETALHES DE LIVRO
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Munição, capacidades mecânicas, regras de recarga ou operação..."
                          value={itemEditorDraft.detalhes || ''}
                          onChange={e => setItemEditorDraft(prev => ({ ...prev, detalhes: e.target.value }))}
                          className="w-full bg-black border border-white p-1.5 text-xs text-white focus:outline-none font-sans"
                        />
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-white text-black font-black uppercase text-xs hover:bg-neutral-200 transition cursor-pointer"
                        >
                          {editandoItemId ? 'SALVAR ALTERAÇÕES DO ITEM' : '+ CADASTRAR NO ARSENAL'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right: Items Catalog Database & Cards (8 cols) */}
                  <div className="lg:col-span-8 border border-white p-3.5 bg-black space-y-3">
                    
                    {/* Search & Category Filter */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <input
                          type="text"
                          placeholder="BUSCAR NO ARSENAL (NOME, TIPO, DANO, REGRAS...)"
                          value={buscaDevItens}
                          onChange={e => setBuscaDevItens(e.target.value)}
                          className="flex-1 bg-black border border-white p-2 text-xs text-white placeholder:text-neutral-500 font-sans focus:outline-none"
                        />
                        <span className="text-[9px] text-neutral-400 font-mono">
                          {itensDevFiltrados.length} DE {bancoItens.length} ITENS
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {[
                          { id: 'todos', label: 'TODOS' },
                          { id: 'arma_fogo', label: 'FOGO (1935-40)' },
                          { id: 'arma_branca', label: 'BRANCAS' },
                          { id: 'armadura', label: 'ARMADURAS' },
                          { id: 'protese', label: 'STEAMPUNK' },
                          { id: 'utilitario', label: 'UTILITÁRIOS' },
                          { id: 'alquimia', label: 'BAIXA MAGIA' },
                          { id: 'geral', label: 'GERAL' }
                        ].map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setFiltroDevItensCat(c.id)}
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase transition cursor-pointer border ${
                              filtroDevItensCat === c.id
                                ? 'bg-white text-black border-white'
                                : 'bg-black text-neutral-300 border-neutral-800 hover:border-neutral-500'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[640px] overflow-y-auto pr-1">
                      {itensDevFiltrados.length === 0 ? (
                        <div className="col-span-2 text-center py-8 text-neutral-500 text-xs font-mono uppercase">
                          [ NENHUM ITEM ENCONTRADO COM ESTES FILTROS ]
                        </div>
                      ) : (
                        itensDevFiltrados.map(it => {
                          const isEmEdicao = editandoItemId === it.id;
                          return (
                            <div
                              key={it.id}
                              className={`border p-2.5 flex flex-col justify-between transition ${
                                isEmEdicao
                                  ? 'border-amber-400 bg-amber-950/20'
                                  : 'border-white/60 bg-neutral-950 hover:border-white'
                              }`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-start gap-1">
                                  <div>
                                    <div className="font-extrabold uppercase text-xs text-white flex items-center gap-1.5 flex-wrap">
                                      <span>{it.nome}</span>
                                      {isEmEdicao && (
                                        <span className="border border-amber-400 text-amber-300 px-1 text-[7px] font-mono">
                                          EDITANDO
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[8px] text-neutral-400 uppercase font-mono">
                                      {(it.categoria || 'geral').replace('_', ' ')} {it.preco && `• ${it.preco}`}
                                    </div>
                                  </div>
                                  <span className="border border-white px-1 text-[9px] font-mono shrink-0 bg-black text-white">
                                    {it.qtd || 1} {((it.qtd || 1) === 1 ? 'SLOT' : 'SLOTS')}
                                  </span>
                                </div>

                                {/* Mechanical Badges */}
                                <div className="flex flex-wrap gap-1 text-[8px] font-mono">
                                  {it.dano && (
                                    <span className="border border-neutral-700 bg-black px-1 text-amber-300">
                                      DANO: {it.dano}
                                    </span>
                                  )}
                                  {it.tipoDano && (
                                    <span className="border border-neutral-700 bg-black px-1 text-neutral-300">
                                      TIPO: {it.tipoDano}
                                    </span>
                                  )}
                                  {typeof it.rd === 'number' && it.rd > 0 && (
                                    <span className="border border-neutral-700 bg-black px-1 text-emerald-300">
                                      RD: {it.rd}
                                    </span>
                                  )}
                                  {it.alcance && (
                                    <span className="border border-neutral-700 bg-black px-1 text-neutral-300">
                                      ALCANCE: {it.alcance}
                                    </span>
                                  )}
                                  {typeof it.modIniciativa === 'number' && it.modIniciativa !== 0 && (
                                    <span className="border border-neutral-700 bg-black px-1 text-neutral-300">
                                      INIC: {it.modIniciativa > 0 ? `+${it.modIniciativa}` : it.modIniciativa}
                                    </span>
                                  )}
                                </div>

                                {it.desc && (
                                  <p className="text-[9px] text-neutral-300 font-sans leading-relaxed">
                                    {it.desc}
                                  </p>
                                )}

                                {it.detalhes && (
                                  <p className="text-[8px] text-neutral-400 font-sans leading-relaxed bg-black/60 p-1 border border-neutral-800">
                                    <strong>Regras:</strong> {it.detalhes}
                                  </p>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="pt-2 mt-2 border-t border-neutral-800 flex justify-between items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEquiparItemCatalogo(it)}
                                  className="px-2 py-0.5 bg-white text-black font-black uppercase text-[8px] hover:bg-neutral-200 transition cursor-pointer"
                                  title="Adicionar uma unidade diretamente ao inventário do personagem atual"
                                >
                                  + EQUIPAR NA FICHA
                                </button>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => carregarItemParaEdicao(it)}
                                    className="px-1.5 py-0.5 border border-white text-white hover:bg-white hover:text-black uppercase text-[8px] font-bold cursor-pointer transition"
                                    title="Editar este item no formulário"
                                  >
                                    EDITAR
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => duplicarItemArsenal(it)}
                                    className="px-1.5 py-0.5 border border-neutral-600 text-neutral-300 hover:border-white hover:text-white uppercase text-[8px] font-bold cursor-pointer transition"
                                    title="Duplicar para criar uma variante deste item"
                                  >
                                    DUPLICAR
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => excluirItemArsenal(it.id || it.idCatalogo || '')}
                                    className="px-1.5 py-0.5 border border-neutral-700 text-neutral-400 hover:border-red-500 hover:text-red-400 uppercase text-[8px] font-bold cursor-pointer transition"
                                    title="Remover do arsenal"
                                  >
                                    EXCLUIR
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                  </div>

                </div>

              </div>
            )}

          </section>
        )}

        {/* ======================================================= */}
        {/* ABA 4: MANUAL DO SISTEMA & REGRAS (LIVRO CONDENSADO)    */}
        {/* ======================================================= */}
        {abaAtiva === 'manual' && (
          <ManualSistema
            onIrParaFicha={() => {
              if (personagens.length > 0) setAbaAtiva('ficha');
              else setAbaAtiva('biblioteca');
            }}
            onIrParaDev={() => {
              setAbaAtiva('dev');
            }}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t-2 border-white bg-black py-2 px-4 text-center text-[9px] text-neutral-400 uppercase tracking-widest mt-auto">
        SISTEMA +2D6 POR NEWTON &quot;TIO NITRO&quot; ROCHA // BIBLIOTECA DE PERSONAGENS // ATRIBUTOS INICIAIS: 12 // PERÍCIAS INICIAIS: 10
      </footer>

    </div>
  );
}
