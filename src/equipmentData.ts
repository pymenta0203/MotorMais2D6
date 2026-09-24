import { InventoryItem } from './types';

export interface CatalogItem extends Omit<InventoryItem, 'id'> {
  id?: string;
  idCatalogo?: string;
  detalhes?: string;
  requisito?: string;
}

export const CATALOGO_EQUIPAMENTOS_1940: CatalogItem[] = [
  // ==========================================
  // ARMAS DE FOGO (TECNOLOGIA ANOS 1935-1940)
  // ==========================================
  {
    idCatalogo: 'rev_38',
    nome: 'Revólver .38 Especial',
    qtd: 1,
    categoria: 'arma_fogo',
    dano: '2d6+2',
    tipoDano: 'Balístico',
    alcance: '150m',
    modIniciativa: -1,
    preco: '200$',
    desc: 'Tambor de 6 tiros. A arma de porte mais popular entre policiais, detetives particulares e civis dos anos 30 e 40.',
    detalhes: 'Disparos por turno: 1 | Pente: 6 balas | Alcance básico: 150m | Peso: 1 item (1kg).'
  },
  {
    idCatalogo: 'rev_44',
    nome: 'Revólver Pesado .44',
    qtd: 1,
    categoria: 'arma_fogo',
    dano: '3d6+3',
    tipoDano: 'Balístico',
    alcance: '200m',
    modIniciativa: -1,
    preco: '200$',
    desc: 'Revólver maciço de grosso calibre. Coice formidável com poder de parada devastador.',
    detalhes: 'Disparos por turno: 1 | Pente: 6 balas | Alcance básico: 200m | Peso: 1 item (1,5kg).'
  },
  {
    idCatalogo: 'pist_45',
    nome: 'Pistola Semiautomática .45 (Colt 1911)',
    qtd: 1,
    categoria: 'arma_fogo',
    dano: '2d6+4',
    tipoDano: 'Balístico',
    alcance: '175m',
    modIniciativa: 0,
    preco: '700$',
    desc: 'Arma de serviço militar padrão. Confiável, disparo rápido semiautomático e alto impacto de parada.',
    detalhes: 'Disparos por turno: 1 a 3 | Carregador: 8 balas | Alcance básico: 175m | Peso: 1 item (1,5kg).'
  },
  {
    idCatalogo: 'pist_9mm',
    nome: 'Pistola Semiautomática 9mm (Browning/Luger)',
    qtd: 1,
    categoria: 'arma_fogo',
    dano: '2d6+2 (ou 2d6+6 rajada)',
    tipoDano: 'Balístico',
    alcance: '150m',
    modIniciativa: 0,
    preco: '1000$',
    desc: 'Pistola de alta precisão de oficiais europeus. Mecânica precisa e empunhadura ergonômica.',
    detalhes: 'Disparos por turno: 1 a 3 | Carregador: 9 balas | Alcance: 150m | Peso: 1 item (1,5kg).'
  },
  {
    idCatalogo: 'sub_45_tommy',
    nome: 'Submetralhadora .45 (Estilo Thompson "Tommy Gun")',
    qtd: 3,
    categoria: 'arma_fogo',
    dano: '3d6 (rajada)',
    tipoDano: 'Balístico',
    alcance: '190m',
    modIniciativa: -2,
    preco: '2000$',
    desc: 'Arma icônica de gângsteres e comandos militares com coronha de madeira e tambor de 50 projéteis.',
    detalhes: 'Disparos por turno: até 13 tiros | Tambor: 50 balas | Alcance: 190m | Peso: 3 itens (15kg).'
  },
  {
    idCatalogo: 'sub_9mm',
    nome: 'Submetralhadora 9mm Compacta (MP / Sten)',
    qtd: 2,
    categoria: 'arma_fogo',
    dano: '3d6+3 (rajada)',
    tipoDano: 'Balístico',
    alcance: '160m',
    modIniciativa: -2,
    preco: '1000$',
    desc: 'Arma automática compacta com coronha rebatível de metal estampada, ideal para emboscadas.',
    detalhes: 'Disparos por turno: até 8 tiros | Pente: 35 balas | Alcance: 160m | Peso: 2 itens (10kg).'
  },
  {
    idCatalogo: 'carabina_30',
    nome: 'Carabina .30 de Ação por Alavanca',
    qtd: 2,
    categoria: 'arma_fogo',
    dano: '3d6',
    tipoDano: 'Balístico',
    alcance: '400m',
    modIniciativa: -2,
    preco: '500$',
    desc: 'Rifle esportivo e militar de cano estriado longo, excelente alcance e precisão confiável.',
    detalhes: 'Disparos por turno: 1 | Pente: 7 tiros | Alcance: 400m | Peso: 2 itens (8kg).'
  },
  {
    idCatalogo: 'fuzil_sniper',
    nome: 'Rifle de Ferrolho com Mira Telescópica .338',
    qtd: 3,
    categoria: 'arma_fogo',
    dano: '3d6 (+ bônus de mira)',
    tipoDano: 'Balístico',
    alcance: '1500m',
    modIniciativa: -2,
    preco: '3700$',
    desc: 'Fuzil de atirador de elite com luneta ótica de latão e tripé retrátil para disparos a quilômetros.',
    detalhes: 'Disparos por turno: 1 | Pente: 5 tiros | Alcance básico: 1500m | Peso: 3 itens (17kg).'
  },
  {
    idCatalogo: 'escopeta_12',
    nome: 'Escopeta Calibre 12 (Pump Action / Cano Serrado)',
    qtd: 2,
    categoria: 'arma_fogo',
    dano: '3d6',
    tipoDano: 'Balístico ou Contusão',
    alcance: '50m',
    modIniciativa: -1,
    preco: '700$',
    desc: 'Espingarda de grosso calibre devastadora à queima-roupa. Dispara balotes de chumbo ou bagos espalhados.',
    detalhes: 'Disparos por turno: 1 | Pente: 2 a 5 cartuchos | Alcance: 50m | Peso: 2 itens (12kg).'
  },
  {
    idCatalogo: 'granada_concussao',
    nome: 'Granada de Concussão Militar',
    qtd: 1,
    categoria: 'arma_fogo',
    dano: '4d6+3',
    tipoDano: 'Explosão e Contusão',
    alcance: 'FOR x 3 metros',
    modIniciativa: 0,
    preco: '200$',
    desc: 'Granada de onda de choque que desorienta e atordoa alvos num raio explosivo.',
    detalhes: 'Raio de área: explosão imediata | Peso: 1 item (0,5kg).'
  },
  {
    idCatalogo: 'granada_fragmentacao',
    nome: 'Granada de Fragmentação ("Pineapple")',
    qtd: 1,
    categoria: 'arma_fogo',
    dano: '5d6+3',
    tipoDano: 'Explosão e Perfuração',
    alcance: 'FOR x 3 metros',
    modIniciativa: 0,
    preco: '400$',
    desc: 'Granada oval de ferro fundido serrilhado que espalha centenas de estilhaços cortantes mortais.',
    detalhes: 'Raio de área: explosão e perfuração | Peso: 1 item (0,5kg).'
  },
  {
    idCatalogo: 'molotov',
    nome: 'Coquetel Molotov (Garrafa Incendiária)',
    qtd: 1,
    categoria: 'arma_fogo',
    dano: '2d6+3',
    tipoDano: 'Explosão e Queimadura',
    alcance: 'FOR x 3 metros',
    modIniciativa: 0,
    preco: '30$',
    desc: 'Garrafa de vidro com querosene ou álcool e pano embebido. Cria chamas persistentes no chão e nos alvos.',
    detalhes: 'Alvos atingidos podem sofrer dano contínuo de fogo até apagarem as chamas | Peso: 1 item (0,3kg).'
  },
  {
    idCatalogo: 'dinamite',
    nome: 'Banana de Dinamite com Pavio',
    qtd: 1,
    categoria: 'arma_fogo',
    dano: '4d6+4',
    tipoDano: 'Explosão',
    alcance: 'FOR x 2 metros',
    modIniciativa: 0,
    preco: '50$',
    desc: 'Explosivo industrial de nitroglicerina estabilizada. Excelente para arrombar portões blindados ou desmoronar túneis.',
    detalhes: 'Requer acendimento com fósforo/isqueiro | Dano: 4d6+4 | Peso: 1 item.'
  },

  // ==========================================
  // ARMAS BRANCAS & CORPO A CORPO
  // ==========================================
  {
    idCatalogo: 'soco_ingles',
    nome: 'Soco Inglês de Latão',
    qtd: 1,
    categoria: 'arma_branca',
    dano: 'FOR+1',
    tipoDano: 'Esmagamento',
    alcance: 'Corpo a corpo',
    modIniciativa: 0,
    preco: '25$',
    desc: 'Empunhadura metálica reforçada que multiplica o impacto dos socos e fratura ossos.',
    detalhes: 'Ocultável facilmente em bolsos de casaco | Peso: 1 item (0,25kg).'
  },
  {
    idCatalogo: 'cassetete',
    nome: 'Cassetete de Madeira com Chumbo',
    qtd: 1,
    categoria: 'arma_branca',
    dano: 'FOR+1',
    tipoDano: 'Contusão',
    alcance: '60cm',
    modIniciativa: -2,
    preco: '40$',
    desc: 'Bastão curto de madeira de lei com alma de chumbo, usado para atordoamento ou imobilização.',
    detalhes: 'Pode aplicar dano letal ou não-letal (perda de PEs) | Peso: 1 item (0,5kg).'
  },
  {
    idCatalogo: 'faca_trincheira',
    nome: 'Faca de Trincheira com Guarda de Soco',
    qtd: 1,
    categoria: 'arma_branca',
    dano: '1d6+1 (ou FOR+1)',
    tipoDano: 'Perfuração e Corte',
    alcance: 'Corpo a corpo / FORx5m',
    modIniciativa: -1,
    preco: '15$',
    desc: 'Faca de combate militar robusta com guarda serrilhada nos dedos. Pode ser arremessada.',
    detalhes: 'Alcance corpo a corpo ou arremesso até FOR x 5 metros | Peso: 1 item (0,5kg).'
  },
  {
    idCatalogo: 'sabre_oficial',
    nome: 'Sabre de Cavalaria / Lâmina de Oficial',
    qtd: 1,
    categoria: 'arma_branca',
    dano: 'FOR+4',
    tipoDano: 'Corte e Perfuração',
    alcance: '100cm',
    modIniciativa: -2,
    preco: '700$',
    desc: 'Lâmina curva de aço forjado com guarda cesta de bronze polido. Equilíbrio perfeito entre elegância e letalidade.',
    detalhes: 'Alcance: 100cm | Dano: FOR+4 | Peso: 1 item (2kg).'
  },
  {
    idCatalogo: 'espada_curta',
    nome: 'Espada Curta / Machete Pesado',
    qtd: 1,
    categoria: 'arma_branca',
    dano: 'FOR+2',
    tipoDano: 'Corte e Perfuração',
    alcance: '60cm',
    modIniciativa: -2,
    preco: '100$',
    desc: 'Lâmina reta ou de corte denso para desbravar matas, trincheiras ou combates em becos estreitos.',
    detalhes: 'Alcance: 60cm | Dano: FOR+2 | Peso: 1 item (2kg).'
  },
  {
    idCatalogo: 'machadinha',
    nome: 'Machadinha de Mão / Arremesso',
    qtd: 1,
    categoria: 'arma_branca',
    dano: 'FOR+2',
    tipoDano: 'Corte',
    alcance: 'FOR+3 metros',
    modIniciativa: 0,
    preco: '25$',
    desc: 'Machadinha compacta de aço carbono, letal tanto ao cortar troncos quanto cabeças.',
    detalhes: 'Pode ser arremessada a até FOR + 3 metros | Peso: 1 item (0,5kg).'
  },
  {
    idCatalogo: 'garrote',
    nome: 'Garrote de Corda de Piano / Arame',
    qtd: 1,
    categoria: 'arma_branca',
    dano: 'FOR+1',
    tipoDano: 'Contusão e Sufocamento',
    alcance: 'Corpo a corpo',
    modIniciativa: 0,
    preco: '5$',
    desc: 'Fio de aço flexível com cabos de madeira para estrangulamento silencioso pelas costas.',
    detalhes: 'Ataque surpresa de estrangulamento | Peso: 1 item (0,01kg).'
  },

  // ==========================================
  // ARMADURAS & PROTEÇÃO (1935-1940 / LOW-FANTASY)
  // ==========================================
  {
    idCatalogo: 'colete_balistico',
    nome: 'Colete à Prova de Balas (Placas e Seda)',
    qtd: 1,
    categoria: 'armadura',
    rd: 8,
    tipoDano: 'Balístico, Contusão e Perfuração (RD 2 contra Corte)',
    modIniciativa: 0,
    preco: '500$',
    desc: 'Colete acolchoado com camadas de seda balística e placas de aço temperado no peito e costas.',
    detalhes: 'Protege o tronco | Redução de Dano (RD): 8 contra balas/tiros, contusões e perfurações; RD 2 contra corte | Peso: 1 item (2kg).'
  },
  {
    idCatalogo: 'casaco_couro',
    nome: 'Sobretudo / Jaqueta de Couro Reforçado',
    qtd: 1,
    categoria: 'armadura',
    rd: 2,
    tipoDano: 'Contusão, Perfuração e Corte',
    modIniciativa: 0,
    preco: '100$',
    desc: 'Casaco longo de couro curtido pesado. Protege das intempéries, facadas superficiais e raspões.',
    detalhes: 'Protege o tronco e braços | RD: 2 | Peso: 1 item (5kg).'
  },
  {
    idCatalogo: 'capacete_aco',
    nome: 'Capacete de Aço Militar (M1)',
    qtd: 1,
    categoria: 'armadura',
    rd: 4,
    tipoDano: 'Contusão, Perfuração e Corte',
    modIniciativa: 0,
    preco: '150$',
    desc: 'Elmo de aço prensado com jugular de lona, padrão militar de infantaria das grandes potências.',
    detalhes: 'Protege cabeça e crânio contra estilhaços e golpes descendentes | RD: 4 | Peso: 1 item (2kg).'
  },
  {
    idCatalogo: 'escudo_aco',
    nome: 'Escudo Portátil de Chapa de Aço Rebocada',
    qtd: 2,
    categoria: 'armadura',
    rd: 5,
    tipoDano: 'Contusão, Perfuração e Corte',
    modIniciativa: -1,
    preco: '200$',
    desc: 'Escudo tático de aço com visor estreito e alça de couro reforçada para conter motins.',
    detalhes: 'Empunhadura de uma mão | RD: 5 | Peso: 2 itens (7kg).'
  },

  // ==========================================
  // PRÓTESES STEAMPUNK / MECÂNICAS (LOW-FANTASY)
  // ==========================================
  {
    idCatalogo: 'protese_braco_mecanico',
    nome: 'Prótese Steampunk: Braço a Engrenagens e Molas',
    qtd: 1,
    categoria: 'protese',
    desc: 'Membro artificial construído em latão brunido, engrenagens expostas e tendões de cabos de aço trançados.',
    detalhes: 'Integra-se com a vantagem "Braços Cibernéticos/Steampunk" do livro. Pode ser alimentado por tensão de corda manual ou minicaldeira a carvão. Dano de soco aprimorado.'
  },
  {
    idCatalogo: 'protese_perna_pneumatica',
    nome: 'Prótese Steampunk: Perna com Pistão Pneumático',
    qtd: 1,
    categoria: 'protese',
    desc: 'Perna mecânica com amortecedor a vapor e cilindro de ar comprimido com válvula de escape de pressão.',
    detalhes: 'Anula penalidades de manco ou amputação. Absorve 6 pontos de dano em quedas e suporta impactos violentos.'
  },
  {
    idCatalogo: 'protese_mao_relojoaria',
    nome: 'Prótese: Mão Articulada de Relojoaria com Ferramentas',
    qtd: 1,
    categoria: 'protese',
    desc: 'Mão mecânica com dedos finos de precisão que guardam agulhas de gaze, chave mestra retrátil e lupa.',
    detalhes: 'Concede +1 de bônus situacional em testes de Arrombamento, Mecânica fina e Bater Carteiras.'
  },
  {
    idCatalogo: 'monoculo_optico',
    nome: 'Monóculo Óptico Articulado com Filtros de Lente',
    qtd: 1,
    categoria: 'protese',
    desc: 'Aparelho ocular preso a uma haste de couro e cobre com três lentes móveis (ampliação 10x, filtro sépia e prisma).',
    detalhes: 'Concede +1 em testes de Procurar pistas diminutas e +1 na pontaria ao mirar por 1 turno completo.'
  },

  // ==========================================
  // EQUIPAMENTOS, FERRAMENTAS & UTILITÁRIOS
  // ==========================================
  {
    idCatalogo: 'binoculo_campo',
    nome: 'Binóculo Militar de Campo',
    qtd: 1,
    categoria: 'utilitario',
    preco: '80$',
    desc: 'Prismas de alta nitidez com carcaça emborrachada e foco milimétrico.',
    detalhes: 'Regra Oficial do Livro (pg 42): Concede +2 de bônus no teste de SAB (Percepção/Observação à distância).'
  },
  {
    idCatalogo: 'maleta_medica',
    nome: 'Maleta Médica de Primeiros Socorros',
    qtd: 1,
    categoria: 'utilitario',
    preco: '60$',
    desc: 'Maleta de couro com torniquetes, ataduras esterilizadas, sulfas antibacterianas, tintura de iodo, agulhas e morfina.',
    detalhes: 'Concede +2 nos testes de Primeiros Socorros e Medicina para estancar sangramentos e estabilizar feridos à beira da morte.'
  },
  {
    idCatalogo: 'estojo_gazua',
    nome: 'Estojo de Gazua e Ferramentas de Arrombamento',
    qtd: 1,
    categoria: 'utilitario',
    preco: '50$',
    desc: 'Ganchos, tensores e pontas de aço temperado para manipular tambores de fechaduras e trancas de segredo.',
    detalhes: 'Concede +2 de bônus em testes de Arrombamento (INT) de portas trancadas e cofres mecânicos.'
  },
  {
    idCatalogo: 'mascara_gas',
    nome: 'Máscara contra Gases com Filtro de Carvão',
    qtd: 1,
    categoria: 'utilitario',
    preco: '100$',
    desc: 'Máscara de borracha e lona com óculos embutidos e cartucho de carvão ativado contra cloro, mostarda e fumaça.',
    detalhes: 'Concede imunidade total a venenos inaláveis, fumaça sufocante e gases de combate por até 4 horas contínuas.'
  },
  {
    idCatalogo: 'lanterna_querosene',
    nome: 'Lanterna Blindada a Querosene com Defletor',
    qtd: 1,
    categoria: 'utilitario',
    preco: '15$',
    desc: 'Lampião de ferro fundido com quebra-vento e alavanca defletora para escurecer o feixe sem apagar a chama.',
    detalhes: 'Ilumina um raio de 10m por até 6 horas com uma recarga de óleo ou querosene.'
  },
  {
    idCatalogo: 'bussola_latão',
    nome: 'Bússola de Bolso em Latão Militar',
    qtd: 1,
    categoria: 'utilitario',
    preco: '20$',
    desc: 'Bússola amortecida a líquido com tampa protetora e mostrador fosforescente para leitura noturna.',
    detalhes: 'Concede +2 em testes de Senso de Direção, Navegação e Cartografia.'
  },
  {
    idCatalogo: 'relogio_bolso',
    nome: 'Relógio de Bolso Ferroviário a Corda',
    qtd: 1,
    categoria: 'utilitario',
    preco: '35$',
    desc: 'Relógio mecânico de alta precisão com corrente de prata, tampa decorada e ponteiros visíveis no escuro.',
    detalhes: 'Medição precisa de tempo, turnos e sincronização de ações coordenadas.'
  },
  {
    idCatalogo: 'corda_gancho',
    nome: 'Corda de Cânhamo (15m) com Gancho de Três Pontas',
    qtd: 1,
    categoria: 'utilitario',
    preco: '20$',
    desc: 'Corda náutica trançada capaz de sustentar até 350kg com gancho de ferro forjado na extremidade.',
    detalhes: 'Concede +1 em testes de Escalar muros, despenhadeiros ou fachadas de prédios.'
  },
  {
    idCatalogo: 'cantil_racoes',
    nome: 'Cantil Militar e Rações Secas de Campanha (3 dias)',
    qtd: 1,
    categoria: 'utilitario',
    preco: '10$',
    desc: 'Cantil de folha de flandres com capa de feltro e tabletes compactados de carne seca, biscoito e açúcar.',
    detalhes: 'Supre as necessidades diárias de água e comida de um adulto por 3 dias, evitando perda de PEs por fadiga.'
  },
  {
    idCatalogo: 'isqueiro_zippo',
    nome: 'Isqueiro de Metal à Prova de Vento e Pederneira',
    qtd: 1,
    categoria: 'utilitario',
    preco: '5$',
    desc: 'Isqueiro de latão cromado que acende com facilidade mesmo sob vendavais e chuva forte.',
    detalhes: 'Acende fogueiras, tochas, dinamites e cigarros instantaneamente em qualquer clima.'
  },
  {
    idCatalogo: 'frasco_eter',
    nome: 'Frasco de Vidro com Éter / Clorofórmio (100ml)',
    qtd: 1,
    categoria: 'utilitario',
    preco: '25$',
    desc: 'Líquido volátil anestésico. Aplicado em um lenço sobre a boca de um alvo desavisado ou imobilizado.',
    detalhes: 'O alvo deve passar num teste de CON (CD 12) ou cairá inconsciente por 1d6 minutos.'
  },

  // ==========================================
  // BAIXA MAGIA & ALQUIMIA SUTIL (LOW-FANTASY)
  // ==========================================
  {
    idCatalogo: 'unguento_alquimico',
    nome: 'Pomada Alquímica Cicatrizante (Uso Único)',
    qtd: 1,
    categoria: 'alquimia',
    preco: '80$',
    desc: 'Pasta aromática escura destilada com ervas raras de pântano e resina destilada em retorta de cobre.',
    detalhes: 'Quando passada sobre ferimentos abertos, estanca sangramentos e recupera 1d6+2 Pontos de Vida (PVs) do personagem.'
  },
  {
    idCatalogo: 'talisma_cobre',
    nome: 'Talismã Gravado de Cobre (Proteção Sutil)',
    qtd: 1,
    categoria: 'alquimia',
    preco: '120$',
    desc: 'Medalhão pentagonal de cobre gravado com glifos geométricos antigos dos primeiros arcanistas.',
    detalhes: 'Concede +1 de bônus em testes de Vontade (SAB) para resistir a histeria coletiva, pânico sobrenatural ou fascinação.'
  },
  {
    idCatalogo: 'giz_sal_purificado',
    nome: 'Bastão de Giz Alquímico e Sal Vulcanizado',
    qtd: 1,
    categoria: 'alquimia',
    preco: '40$',
    desc: 'Composto mineral para traçar círculos de contenção ou símbolos arcanos em portas e janelas.',
    detalhes: 'Dificulta a passagem de criaturas sombrias ou espíritos errantes através do limiar protegido por 1 hora.'
  }
];
