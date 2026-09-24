export type AtributoChave = 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';

export interface TraitLevel {
  nivel: number;
  pontos: number;
  desc: string;
  modPv?: number;
  modPe?: number;
  modDesl?: number;
  modRd?: number;
  modCargaFor?: number;
  modIniciativa?: number;
  modAtributos?: Partial<Record<AtributoChave, number>>;
  modPericias?: Record<string, number>;
  codigoScript?: string;
}

export interface Trait {
  id: string;
  tipo: 'vantagem' | 'desvantagem';
  nome: string;
  pontos: number;
  desc: string;
  modPv?: number;
  modPe?: number;
  modDesl?: number;
  modRd?: number;
  modCargaFor?: number;
  modIniciativa?: number;
  modAtributos?: Partial<Record<AtributoChave, number>>;
  modPericias?: Record<string, number>;
  codigoScript?: string;
  niveis?: TraitLevel[];
  nivel?: number;
  maxNivel?: number;
  baseId?: string;
}

export type RaceLimits = Record<AtributoChave, [number, number]>;

export interface Race {
  id: string;
  nome: string;
  desc: string;
  limites: RaceLimits;
  modPv: number;
  modPe: number;
  modDesl: number;
  vantagens: string[];
  desvantagens: string[];
  isDefault?: boolean;
}

export interface Skill {
  nome: string;
  atr: AtributoChave;
  pts: number;
  desc?: string;
}

export interface InventoryItem {
  id: string;
  nome: string;
  qtd: number;
  desc?: string;
  categoria?: 'arma_fogo' | 'arma_branca' | 'armadura' | 'protese' | 'utilitario' | 'alquimia' | 'geral';
  dano?: string;
  tipoDano?: string;
  rd?: number;
  alcance?: string;
  preco?: string;
  modIniciativa?: number;
}

export interface Character {
  id: string;
  nome: string;
  nivel: number;
  racaId: string;
  atributos: Record<AtributoChave, number>;
  pericias: Skill[];
  vantagensAdquiridas: string[];
  desvantagensAdquiridas: string[];
  tetoPericias?: number;
  tetoVantagensBase?: number;
  itensCarregados?: number;
  itensInventario?: InventoryItem[];
  imagem?: string;
}

export interface CharacterExport {
  sistema: string;
  tipo: 'ficha_personagem';
  versao: string;
  dataExportacao?: string;
  personagem: Omit<Character, 'imagem'>;
}

export interface RacePackExport {
  sistema: string;
  tipo: 'pack_racas';
  versao: string;
  dataExportacao?: string;
  racas: Race[];
}

export interface TraitPackExport {
  sistema: string;
  tipo: 'pack_tracos';
  versao: string;
  dataExportacao?: string;
  tracos: Trait[];
}

export interface ItemPackExport {
  sistema: string;
  tipo: 'pack_itens';
  versao: string;
  dataExportacao?: string;
  itens: any[];
}

export interface AppStateExport {
  sistema: string;
  versao: string;
  personagem?: Character;
  personagens?: Character[];
  personagemAtivoId?: string;
  bancoRacas?: Record<string, Race>;
  poolTraços?: Trait[];
  itensArsenal?: InventoryItem[];
}
