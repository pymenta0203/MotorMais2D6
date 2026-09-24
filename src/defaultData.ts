import { Race, Skill, Trait, Character } from './types';

export const LIVRO_VANTAGENS: Trait[] = [
  {
    id: "v_absorcao_dano",
    tipo: "vantagem",
    nome: "Absorção de Dano (CON)",
    pontos: 1,
    desc: "Ao gastar 2PEs, o personagem absorve o dano sofrido instantaneamente.",
    niveis: [
      { nivel: 1, pontos: 1, desc: "Ao gastar 2PEs, absorve 3 de dano sofrido instantaneamente." },
      { nivel: 2, pontos: 2, desc: "Ao gastar 2PEs, absorve 6 de dano sofrido instantaneamente." },
      { nivel: 3, pontos: 3, desc: "Ao gastar 2PEs, absorve 9 de dano sofrido instantaneamente." },
      { nivel: 4, pontos: 4, desc: "Ao gastar 2PEs, absorve 12 de dano sofrido instantaneamente." },
      { nivel: 5, pontos: 5, desc: "Ao gastar 2PEs, absorve 15 de dano sofrido instantaneamente." }
    ]
  },
  {
    id: "v_adapt_cult",
    tipo: "vantagem",
    nome: "Adaptabilidade Cultural (INT)",
    pontos: 1,
    desc: "Adapta-se a culturas estranhas ou alienígenas. Ganha +2 em testes de Carisma em ambientes de cultura estranha."
  },
  {
    id: "v_aliados",
    tipo: "vantagem",
    nome: "Aliados (CAR)",
    pontos: 1,
    desc: "PdMs (Personagens do Mestre) que estarão à disposição do personagem.",
    niveis: [
      { nivel: 1, pontos: 1, desc: "1 aliado PdM à disposição." },
      { nivel: 2, pontos: 2, desc: "2 aliados PdMs à disposição." },
      { nivel: 3, pontos: 3, desc: "3 aliados PdMs à disposição." }
    ]
  },
  {
    id: "v_ambidestria",
    tipo: "vantagem",
    nome: "Ambidestria (DES)",
    pontos: 1,
    desc: "Pode agir com a mão e o braço não dominante sem a penalidade de -6."
  },
  {
    id: "v_anfibio",
    tipo: "vantagem",
    nome: "Anfíbio (CON)",
    pontos: 2,
    desc: "Pode respirar e mover-se debaixo d'água livremente."
  },
  {
    id: "v_aparencia",
    tipo: "vantagem",
    nome: "Aparência (CAR)",
    pontos: 1,
    desc: "Aparência bela e atraente em situações sociais.",
    niveis: [
      { nivel: 1, pontos: 1, desc: "Aparência bela, acima da média: +2 em testes sociais." },
      { nivel: 2, pontos: 2, desc: "Aparência belíssima, muito acima da média: +4 em testes sociais." },
      { nivel: 3, pontos: 3, desc: "Aparência de modelo de nível internacional: +6 em testes sociais." }
    ]
  },
  {
    id: "v_aum_veloc",
    tipo: "vantagem",
    nome: "Aumento de Velocidade (DES)",
    pontos: 3,
    desc: "Gastando 4PEs, o personagem aumenta a velocidade do seu corpo, ganhando DES+10 durante 10 minutos."
  },
  {
    id: "v_bracos_cibernet",
    tipo: "vantagem",
    nome: "Braços Cibernéticos (DES e FOR)",
    pontos: 4,
    desc: "Implementos cibernéticos nos braços. Com gasto de 2PEs, a DES e FOR para tarefas com os braços aumentam em +4 por 10 min (aumentando dano de FOR). Choque elétrico de 2d6 ao toque por 4PEs."
  },
  {
    id: "v_carga_extra",
    tipo: "vantagem",
    nome: "Carga Extra (FOR)",
    pontos: 2,
    desc: "Personagem usa FOR+3 para calcular a Carga que pode carregar.",
    modCargaFor: 3
  },
  {
    id: "v_corajoso",
    tipo: "vantagem",
    nome: "Corajoso (INT)",
    pontos: 1,
    desc: "Resistência mental contra medo e insanidade.",
    niveis: [
      { nivel: 1, pontos: 1, desc: "+2 nos testes de medo e insanidade." },
      { nivel: 2, pontos: 2, desc: "+4 nos testes de medo e insanidade." },
      { nivel: 3, pontos: 3, desc: "+6 nos testes de medo e insanidade." },
      { nivel: 4, pontos: 4, desc: "+8 nos testes de medo e insanidade." },
      { nivel: 5, pontos: 5, desc: "+10 nos testes de medo e insanidade." }
    ]
  },
  {
    id: "v_def_mental",
    tipo: "vantagem",
    nome: "Defesa Mental (INT)",
    pontos: 1,
    desc: "Resistência mental contra ataques e invasões psíquicas.",
    niveis: [
      { nivel: 1, pontos: 1, desc: "+4 no teste de INT contra ataques mentais." },
      { nivel: 2, pontos: 2, desc: "+6 no teste de INT contra ataques mentais." },
      { nivel: 3, pontos: 3, desc: "+8 no teste de INT contra ataques mentais." }
    ]
  },
  {
    id: "v_def_ampliada",
    tipo: "vantagem",
    nome: "Defesa Ampliada (DES)",
    pontos: 2,
    desc: "Bônus nos testes de DES quando estiver se defendendo no combate usando escudo ou aparando com arma.",
    niveis: [
      { nivel: 1, pontos: 2, desc: "+2 no teste de DES ao se defender com escudo ou aparar com arma de mão." },
      { nivel: 2, pontos: 3, desc: "+3 no teste de DES ao se defender com escudo ou aparar com arma de mão." },
      { nivel: 3, pontos: 4, desc: "+4 no teste de DES ao se defender com escudo ou aparar com arma de mão." },
      { nivel: 4, pontos: 5, desc: "+6 no teste de DES ao se defender com escudo ou aparar com arma de mão." }
    ]
  },
  {
    id: "v_desl_ampliado",
    tipo: "vantagem",
    nome: "Deslocamento Ampliado (DES)",
    pontos: 2,
    desc: "Aumenta o deslocamento de movimento e velocidade de corrida do personagem.",
    modDesl: 2.0,
    niveis: [
      { nivel: 1, pontos: 2, desc: "Aumenta o deslocamento em +2 m/s.", modDesl: 2.0 },
      { nivel: 2, pontos: 3, desc: "Aumenta o deslocamento em +3 m/s.", modDesl: 3.0 },
      { nivel: 3, pontos: 4, desc: "Aumenta o deslocamento em +4 m/s.", modDesl: 4.0 },
      { nivel: 4, pontos: 5, desc: "Aumenta o deslocamento em +6 m/s.", modDesl: 6.0 }
    ]
  },
  {
    id: "v_destino",
    tipo: "vantagem",
    nome: "Destino (CAR)",
    pontos: 5,
    desc: "Destino heroico determinado: recebe +12 em rolagem ou altera narrativa 1x por sessão para cumprir a profecia."
  },
  {
    id: "v_dir_absoluta",
    tipo: "vantagem",
    nome: "Direção Absoluta (SAB)",
    pontos: 1,
    desc: "Bússola mental infalível: nunca se perde, sempre sabe onde é o norte e refaz caminhos percorridos."
  },
  {
    id: "v_duro_matar",
    tipo: "vantagem",
    nome: "Duro de Matar (CON)",
    pontos: 1,
    desc: "Resistência física extrema que adiciona Pontos de Vida (PV) extras permanentes.",
    modPv: 6,
    niveis: [
      { nivel: 1, pontos: 1, desc: "O personagem tem +6 PVs extras.", modPv: 6 },
      { nivel: 2, pontos: 2, desc: "O personagem tem +8 PVs extras.", modPv: 8 },
      { nivel: 3, pontos: 3, desc: "O personagem tem +10 PVs extras.", modPv: 10 },
      { nivel: 4, pontos: 4, desc: "O personagem tem +12 PVs extras.", modPv: 12 },
      { nivel: 5, pontos: 5, desc: "O personagem tem +14 PVs extras.", modPv: 14 }
    ]
  },
  {
    id: "v_energia_extra",
    tipo: "vantagem",
    nome: "Esforço Extra (CON)",
    pontos: 1,
    desc: "Capacidade física e determinação aprimorada que adiciona Pontos de Esforço (PE) extras permanentes.",
    modPe: 2,
    niveis: [
      { nivel: 1, pontos: 1, desc: "O personagem ganha +2 PEs extras (Pontos de Esforço).", modPe: 2 },
      { nivel: 2, pontos: 2, desc: "O personagem ganha +4 PEs extras (Pontos de Esforço).", modPe: 4 },
      { nivel: 3, pontos: 3, desc: "O personagem ganha +6 PEs extras (Pontos de Esforço).", modPe: 6 },
      { nivel: 4, pontos: 4, desc: "O personagem ganha +8 PEs extras (Pontos de Esforço).", modPe: 8 },
      { nivel: 5, pontos: 5, desc: "O personagem ganha +10 PEs extras (Pontos de Esforço).", modPe: 10 }
    ]
  },
  {
    id: "v_empat_animais",
    tipo: "vantagem",
    nome: "Empatia com Animais (CAR)",
    pontos: 1,
    desc: "Animais não atacam espontaneamente e o personagem pode tentar domar ou acalmar animais com teste de CAR."
  },
  {
    id: "v_estom_ferro",
    tipo: "vantagem",
    nome: "Estômago de Ferro (CON)",
    pontos: 1,
    desc: "Personagem é imune a venenos, intoxicação alimentar ou qualquer tipo de dano via comida ou bebida."
  },
  {
    id: "v_esq_ampliada",
    tipo: "vantagem",
    nome: "Esquiva Ampliada (DES)",
    pontos: 2,
    desc: "Bônus nos testes de DES quando estiver se defendendo e esquivando em combate.",
    niveis: [
      { nivel: 1, pontos: 2, desc: "+3 de bônus no teste de DES em esquiva de combate." },
      { nivel: 2, pontos: 3, desc: "+4 de bônus no teste de DES em esquiva de combate." },
      { nivel: 3, pontos: 4, desc: "+5 de bônus no teste de DES em esquiva de combate." },
      { nivel: 4, pontos: 5, desc: "+6 de bônus no teste de DES em esquiva de combate." }
    ]
  },
  {
    id: "v_favor_divino",
    tipo: "vantagem",
    nome: "Favor Divino (CAR)",
    pontos: 3,
    desc: "Invoca seu deus ou poder de sua fé: recebe +6 em uma rolagem ou auxílio narrativo 1x por sessão de jogo."
  },
  {
    id: "v_flexibilidade",
    tipo: "vantagem",
    nome: "Flexibilidade (DES)",
    pontos: 1,
    desc: "+2 nos testes para escapar de agarrões, entrar em locais estreitos e tarefas onde flexibilidade conta."
  },
  {
    id: "v_gadgeteer",
    tipo: "vantagem",
    nome: "Gadgeteer (INT)",
    pontos: 1,
    desc: "Pode criar geringonças eletrônicas, mecânicas, alquímicas ou a vapor.",
    niveis: [
      { nivel: 1, pontos: 1, desc: "Geringonças com 10 pts de atributo, 5 de perícia e 1 ponto de vantagens." },
      { nivel: 2, pontos: 2, desc: "Geringonças com 15 pts de atributo, 10 de perícia e 2 pontos de vantagens." },
      { nivel: 3, pontos: 3, desc: "Geringonças com 20 pts de atributo, 15 de perícia e 3 pontos de vantagens." },
      { nivel: 4, pontos: 4, desc: "Geringonças com 25 pts de atributo, 20 de perícia e 4 pontos de vantagens." },
      { nivel: 5, pontos: 5, desc: "Geringonças com 30 pts de atributo, 20 de perícia e 5 pontos de vantagens." }
    ]
  },
  {
    id: "v_garras",
    tipo: "vantagem",
    nome: "Garras (FOR)",
    pontos: 1,
    desc: "Garras naturais ou implantadas que acrescentam dano corporal e diminuem penalidade de mão inábil.",
    niveis: [
      { nivel: 1, pontos: 1, desc: "Garras dão dano +2. Diminui penalidade da mão não dominante em ataque duplo em -2." },
      { nivel: 2, pontos: 2, desc: "Garras dão dano +3. Diminui penalidade da mão não dominante em ataque duplo em -2." },
      { nivel: 3, pontos: 3, desc: "Garras dão dano +4. Diminui penalidade da mão não dominante em ataque duplo em -2." },
      { nivel: 4, pontos: 4, desc: "Garras dão dano +5. Diminui penalidade da mão não dominante em ataque duplo em -2." },
      { nivel: 5, pontos: 5, desc: "Garras dão dano +6. Diminui penalidade da mão não dominante em ataque duplo em -2." }
    ]
  },
  {
    id: "v_guelras",
    tipo: "vantagem",
    nome: "Guelras (CON)",
    pontos: 1,
    desc: "O personagem possui guelras e pode respirar debaixo d'água perfeitamente."
  },
  {
    id: "v_herdeiro",
    tipo: "vantagem",
    nome: "Herdeiro (CAR)",
    pontos: 3,
    desc: "Patrimônio e recursos financeiros à disposição do personagem.",
    niveis: [
      { nivel: 1, pontos: 3, desc: "Herdeiro de fortuna considerável: acesso a grandes recursos financeiros." },
      { nivel: 2, pontos: 4, desc: "Herdeiro de fortuna imensa: acesso a imensos recursos financeiros." },
      { nivel: 3, pontos: 5, desc: "Herdeiro de fortuna ilimitada: acesso a recursos ilimitados." }
    ]
  },
  {
    id: "v_ident_alt",
    tipo: "vantagem",
    nome: "Identidade Alternativa (CAR)",
    pontos: 1,
    desc: "Possui identidades alternativas completamente legais.",
    niveis: [
      { nivel: 1, pontos: 1, desc: "Possui 1 identidade alternativa completamente legal." },
      { nivel: 2, pontos: 2, desc: "Possui 2 identidades alternativas completamente legais." },
      { nivel: 3, pontos: 3, desc: "Possui 3 identidades alternativas completamente legais." }
    ]
  },
  {
    id: "v_imortalidade",
    tipo: "vantagem",
    nome: "Imortalidade (PODER)",
    pontos: 5,
    desc: "Caso morra, retorna à vida depois de 1d6 dias regenerando o corpo, exceto contra ponto fraco acordado com o Mestre."
  },
  {
    id: "v_imun_doenca",
    tipo: "vantagem",
    nome: "Imunidade à Doença (CON)",
    pontos: 2,
    desc: "Imune a qualquer tipo de doença de nível de poder humano e sobre-humano."
  },
  {
    id: "v_imun_veneno",
    tipo: "vantagem",
    nome: "Imunidade a Veneno (CON)",
    pontos: 2,
    desc: "Imune a qualquer tipo de veneno e toxina de nível de poder humano e sobre-humano."
  },
  {
    id: "v_imun_mental",
    tipo: "vantagem",
    nome: "Imunidade a Ataques Mentais (INT ou PODER)",
    pontos: 3,
    desc: "Imune a qualquer tipo de ataque mental ou controle psíquico de nível de poder humano e sobre-humano."
  },
  {
    id: "v_imun_juridica",
    tipo: "vantagem",
    nome: "Imunidade Jurídica (CAR)",
    pontos: 1,
    desc: "Não pode ser julgado criminalmente pela justiça comum por motivo legal, diplomático ou nobre."
  },
  {
    id: "v_insubstancial",
    tipo: "vantagem",
    nome: "Insubstancialidade (PODER)",
    pontos: 4,
    desc: "Corpo insubstancial imune a ataques físicos (afetado por ataques mágicos e energéticos)."
  },
  {
    id: "v_invisibilidade",
    tipo: "vantagem",
    nome: "Invisibilidade (PODER)",
    pontos: 4,
    desc: "Com gasto de 4PEs, fica invisível por 10 minutos (detectável apenas por sensores térmicos ou de vibração)."
  },
  {
    id: "v_invis_maquinas",
    tipo: "vantagem",
    nome: "Invisibilidade a Máquinas (PODER)",
    pontos: 2,
    desc: "Não pode ter imagem capturada por aparelhos, câmeras, sensores ou fotografias."
  },
  {
    id: "v_invulneravel",
    tipo: "vantagem",
    nome: "Invulnerabilidade (PODER)",
    pontos: 5,
    desc: "Imune a dano físico e de energia convencionais (balas refletem, imune a explosões; afetado por magia ou gás)."
  },
  {
    id: "v_memoria_eid",
    tipo: "vantagem",
    nome: "Memória Eidética (INT)",
    pontos: 3,
    desc: "Memória fotográfica de tudo o que viu na vida.",
    niveis: [
      { nivel: 1, pontos: 3, desc: "Memória fotográfica: Perícia Memória Eidética 3 + INT para recordar detalhes." },
      { nivel: 2, pontos: 4, desc: "Memória fotográfica: Perícia Memória Eidética 4 + INT para recordar detalhes." },
      { nivel: 3, pontos: 5, desc: "Memória fotográfica: Perícia Memória Eidética 5 + INT para recordar detalhes." }
    ]
  },
  {
    id: "v_membros_extras",
    tipo: "vantagem",
    nome: "Membros Extras (DES)",
    pontos: 3,
    desc: "Possui membros adicionais para realizar ações simultâneas em combate.",
    niveis: [
      { nivel: 1, pontos: 3, desc: "1 membro extra (permite +1 ataque simultâneo, 2ª mão a -6; com Ambidestria -4)." },
      { nivel: 2, pontos: 4, desc: "2 membros extras (ações simultâneas: 2ª mão a -6, 3ª a -8)." },
      { nivel: 3, pontos: 5, desc: "3 membros extras (ações simultâneas: 2ª a -6, 3ª a -8, 4ª a -10, 5ª a -12)." }
    ]
  },
  {
    id: "v_nao_come_bebe",
    tipo: "vantagem",
    nome: "Não comer / beber (CON)",
    pontos: 2,
    desc: "Não necessita comer ou beber para sobreviver (sustenta o corpo por luz solar, magia, tecnologia). Não perde PEs por privação alimentar ou hídrica."
  },
  {
    id: "v_nao_dorme",
    tipo: "vantagem",
    nome: "Não dorme (CON)",
    pontos: 1,
    desc: "Não necessita do sono biológico tradicional.",
    niveis: [
      { nivel: 1, pontos: 1, desc: "Não necessita dormir; recupera todos os PEs depois de 6 horas descansando." },
      { nivel: 2, pontos: 2, desc: "Recupera todos os PEs depois de 4 horas descansando, não precisa dormir." }
    ]
  },
  {
    id: "v_nao_respira",
    tipo: "vantagem",
    nome: "Não Precisa Respirar (CON)",
    pontos: 2,
    desc: "Não tem necessidade de oxigênio ou qualquer atmosfera para viver."
  },
  {
    id: "v_pv_extras",
    tipo: "vantagem",
    nome: "Pontos de Vida Extras (FOR)",
    pontos: 1,
    desc: "Massa muscular maciça que adiciona Pontos de Vida (PV) extras permanentes.",
    modPv: 4,
    niveis: [
      { nivel: 1, pontos: 1, desc: "Personagem ganha +4 PVs extras.", modPv: 4 },
      { nivel: 2, pontos: 2, desc: "Personagem ganha +8 PVs extras.", modPv: 8 },
      { nivel: 3, pontos: 3, desc: "Personagem ganha +12 PVs extras.", modPv: 12 },
      { nivel: 4, pontos: 4, desc: "Personagem ganha +16 PVs extras.", modPv: 16 },
      { nivel: 5, pontos: 5, desc: "Personagem ganha +20 PVs extras.", modPv: 20 }
    ]
  },
  {
    id: "v_prontidao",
    tipo: "vantagem",
    nome: "Prontidão (SAB)",
    pontos: 2,
    desc: "+10 em jogadas de iniciativa e jamais é pego de surpresa."
  },
  {
    id: "v_queda_suave",
    tipo: "vantagem",
    nome: "Queda Suave (DES)",
    pontos: 1,
    desc: "Reduz ou ignora dano de quedas de grandes alturas.",
    niveis: [
      { nivel: 1, pontos: 1, desc: "Personagem ignora 4 pontos de dano por queda." },
      { nivel: 2, pontos: 2, desc: "Personagem ignora 6 pontos de dano por queda." },
      { nivel: 3, pontos: 3, desc: "Personagem ignora 8 pontos de dano por queda." },
      { nivel: 4, pontos: 4, desc: "Personagem ignora 10 pontos de dano por queda." },
      { nivel: 5, pontos: 5, desc: "Personagem ignora 12 pontos de dano por queda." }
    ]
  },
  {
    id: "v_reflexos_comb",
    tipo: "vantagem",
    nome: "Reflexos em Combate (DES)",
    pontos: 2,
    desc: "+4 na iniciativa antes de um combate e +2 nos testes de Percepção para Sentir Perigo ou agir em rodada de surpresa."
  },
  {
    id: "v_res_dano",
    tipo: "vantagem",
    nome: "Resistência a Dano (FOR)",
    pontos: 1,
    desc: "Armadura biológica, muscular ou mágica conferindo Redução de Dano (RD) passiva.",
    modRd: 2,
    niveis: [
      { nivel: 1, pontos: 1, desc: "Redução de Dano permanente: RD 2 contra ataques.", modRd: 2 },
      { nivel: 2, pontos: 2, desc: "Redução de Dano permanente: RD 4 contra ataques.", modRd: 4 },
      { nivel: 3, pontos: 3, desc: "Redução de Dano permanente: RD 6 contra ataques.", modRd: 6 },
      { nivel: 4, pontos: 4, desc: "Redução de Dano permanente: RD 8 contra ataques.", modRd: 8 },
      { nivel: 5, pontos: 5, desc: "Redução de Dano permanente: RD 10 contra ataques.", modRd: 10 }
    ]
  },
  {
    id: "v_res_dor",
    tipo: "vantagem",
    nome: "Resistência à Dor (CON)",
    pontos: 2,
    desc: "+2 de CON e +4 nos testes de resistência à dor."
  },
  {
    id: "v_sangue_curador",
    tipo: "vantagem",
    nome: "Sangue Curador (CON)",
    pontos: 1,
    desc: "Sangue regenera 4 PVs diários normais; se doar sangue, quem o recebe também regenera 4 PVs durante 1d6 dias."
  },
  {
    id: "v_sorte_sobrenat",
    tipo: "vantagem",
    nome: "Sorte Sobrenatural / Super Sorte (CAR)",
    pontos: 1,
    desc: "Pode substituir qualquer teste por uma rolagem de pura sorte (2d6 >= 6 é sucesso em qualquer tarefa).",
    niveis: [
      { nivel: 1, pontos: 1, desc: "Pode realizar 1 teste de sorte por sessão (ou a cada 4 horas de jogo)." },
      { nivel: 2, pontos: 2, desc: "Pode realizar 2 testes de sorte por sessão (ou a cada 4 horas de jogo)." },
      { nivel: 3, pontos: 3, desc: "Pode realizar 3 testes de sorte por sessão (ou a cada 4 horas de jogo)." },
      { nivel: 4, pontos: 4, desc: "Pode realizar 4 testes de sorte por sessão (ou a cada 4 horas de jogo)." },
      { nivel: 5, pontos: 5, desc: "Pode realizar 5 testes de sorte por sessão (ou a cada 4 horas de jogo)." }
    ]
  },
  {
    id: "v_super_audicao",
    tipo: "vantagem",
    nome: "Super Audição (SAB)",
    pontos: 1,
    desc: "Capacidade auditiva sobre-humana e ultrassônica.",
    niveis: [
      { nivel: 1, pontos: 1, desc: "Gastando 2PEs, pode escutar tudo em até 1km de distância, focar em som específico e ultrassons." },
      { nivel: 2, pontos: 3, desc: "Gastando 2PEs, pode escutar tudo em até 10km de distância, focar em som específico e ultrassons." }
    ]
  },
  {
    id: "v_super_carisma",
    tipo: "vantagem",
    nome: "Super Carisma (CAR)",
    pontos: 2,
    desc: "Capacidade sobrenatural de controlar emoções sociais com CAR+Super Carisma vs INT do alvo."
  },
  {
    id: "v_super_cura",
    tipo: "vantagem",
    nome: "Super Cura (PODER)",
    pontos: 3,
    desc: "Fator de cura biológico ou sobrenatural acelerado.",
    niveis: [
      { nivel: 1, pontos: 3, desc: "O personagem cura 6 PVs por dia (ou 1 PV a cada 4 horas de repouso)." },
      { nivel: 2, pontos: 4, desc: "O personagem cura 8 PVs por dia (ou 1 PV a cada 3 horas de repouso)." },
      { nivel: 3, pontos: 5, desc: "O personagem cura 12 PVs por dia (ou 1 PV a cada 2 horas de repouso)." }
    ]
  },
  {
    id: "v_super_forca",
    tipo: "vantagem",
    nome: "Super Força (FOR)",
    pontos: 3,
    desc: "Nível colossal de força bruta de patamar sobre-humano.",
    niveis: [
      { nivel: 1, pontos: 3, desc: "Personagem possui patamar sobre-humano FOR 6." },
      { nivel: 2, pontos: 4, desc: "Personagem possui patamar sobre-humano FOR 8." },
      { nivel: 3, pontos: 5, desc: "Personagem possui patamar sobre-humano FOR 10." }
    ]
  },
  {
    id: "v_super_intuicao",
    tipo: "vantagem",
    nome: "Super Intuição (SAB)",
    pontos: 2,
    desc: "Jamais é emboscado; senso radar com +10 em testes de Percepção para sentir perigos e mentiras."
  },
  {
    id: "v_super_senso_per",
    tipo: "vantagem",
    nome: "Super Senso do Perigo (SAB)",
    pontos: 2,
    desc: "Radar contra emboscadas: +6 no teste versus DES+Furtividade do oponente."
  },
  {
    id: "v_super_sentidos",
    tipo: "vantagem",
    nome: "Super Sentidos (SAB)",
    pontos: 5,
    desc: "Possui Super Audição a até 1KM, Super Visão telescópica 100x e Super Olfato apurado."
  },
  {
    id: "v_super_visao",
    tipo: "vantagem",
    nome: "Super Visão (SAB)",
    pontos: 3,
    desc: "Enxerga 100 vezes além da visão humana normal."
  },
  {
    id: "v_tolerancia_alc",
    tipo: "vantagem",
    nome: "Tolerância a Álcool (CON)",
    pontos: 1,
    desc: "Imune aos efeitos inebriantes do álcool: pode beber sem embriagar-se."
  },
  {
    id: "v_transe",
    tipo: "vantagem",
    nome: "Transe (INT)",
    pontos: 1,
    desc: "Entra em transe meditativo recuperando 6 PEs a cada 10 minutos de meditação (3x mais rápido)."
  },
  {
    id: "v_visao_360",
    tipo: "vantagem",
    nome: "Visão de 360 Graus (SAB)",
    pontos: 2,
    desc: "Pode ver em um ângulo de 360 graus simultâneos sem pontos cegos."
  },
  {
    id: "v_visao_noturna",
    tipo: "vantagem",
    nome: "Visão Noturna (SAB)",
    pontos: 1,
    desc: "Visão monocromática nítida em ambientes com pouca ou quase nenhuma luz."
  }
];

export const LIVRO_DESVANTAGENS: Trait[] = [
  { id: "d_alcoolismo", tipo: "desvantagem", nome: "Alcoolismo (INT)", pontos: 2, desc: "Penalidade em testes sociais e de inteligência. Necessidade constante de consumir álcool." },
  { id: "d_alergia", tipo: "desvantagem", nome: "Alergia (CON)", pontos: 2, desc: "Alergia grave a uma substância específica, sofrendo penalidades de vigor." },
  { id: "d_ext_alto", tipo: "desvantagem", nome: "Extremamente Alto (DES)", pontos: 1, desc: "Altura desmedida, com grande dificuldade de movimentação em espaços apertados." },
  { id: "d_amaldicoado", tipo: "desvantagem", nome: "Amaldiçoado (Especial)", pontos: 3, desc: "Perseguido por uma entidade maligna, má sorte sobrenatural ou morte iminente." },
  { id: "d_amnesia", tipo: "desvantagem", nome: "Amnésia (INT)", pontos: 2, desc: "Não se recorda de sua verdadeira identidade ou passado recente." },
  { id: "d_anacronico", tipo: "desvantagem", nome: "Anacrônico (INT)", pontos: 2, desc: "Incapaz de compreender e operar tecnologias e aparelhos modernos." },
  { id: "d_analfabetismo", tipo: "desvantagem", nome: "Analfabetismo (INT)", pontos: 2, desc: "Incapaz de ler ou escrever em qualquer idioma." },
  { id: "d_aparencia_engr", tipo: "desvantagem", nome: "Aparência Engraçada (CAR)", pontos: 1, desc: "Fisionomia ridícula que atrai zombarias, impondo penalidades em testes sociais." },
  { id: "d_aparencia_hed", tipo: "desvantagem", nome: "Aparência Hedionda (CAR)", pontos: 3, desc: "Aparência monstruosa que causa repulsa e pânico nos demais indivíduos." },
  { id: "d_arrogante", tipo: "desvantagem", nome: "Arrogante (CAR)", pontos: 1, desc: "Acredita ser superior a todos e humilha os outros, prejudicando alianças." },
  { id: "d_assombrado", tipo: "desvantagem", nome: "Assombrado (SAB)", pontos: 2, desc: "Perseguido por um espírito vingativo que perturba suas ações." },
  { id: "d_avareza", tipo: "desvantagem", nome: "Avareza (INT)", pontos: 2, desc: "Jamais divide o que tem e é motivado exclusivamente pelo acúmulo de riqueza." },
  { id: "d_bully", tipo: "desvantagem", nome: "Bully (CAR)", pontos: 1, desc: "Sente prazer em intimidar e tripudiar sobre os mais fracos." },
  { id: "d_cauteloso", tipo: "desvantagem", nome: "Cauteloso (Especial)", pontos: 1, desc: "Evita qualquer risco e planeja em excesso, atrasando iniciativas decisivas." },
  { id: "d_cego", tipo: "desvantagem", nome: "Cego (SAB)", pontos: 5, desc: "Incapaz de ver. Severas penalidades em tarefas visuais e em combate." },
  { id: "d_cetico", tipo: "desvantagem", nome: "Cético (INT)", pontos: 1, desc: "Recusa-se categoricamente a acreditar em magia ou fenômenos sobrenaturais." },
  { id: "d_chiclete_monstro", tipo: "desvantagem", nome: "Chiclete de Monstro (Especial)", pontos: 2, desc: "É sempre o primeiro alvo visado pelos oponentes e monstros." },
  { id: "d_ciume_doentio", tipo: "desvantagem", nome: "Ciúme Doentio (INT)", pontos: 2, desc: "Possui obsessão doentia por um interesse amoroso, agindo de forma irracional." },
  { id: "d_claustrofobia", tipo: "desvantagem", nome: "Claustrofobia (POD)", pontos: 2, desc: "Penalidades severas em testes de medo ao entrar em ambientes muito pequenos." },
  { id: "d_cleptomania", tipo: "desvantagem", nome: "Cleptomania (INT)", pontos: 2, desc: "Incapaz de conter o impulso de roubar sempre que surge oportunidade." },
  { id: "d_cod_conduta", tipo: "desvantagem", nome: "Código de Conduta Rígido (INT)", pontos: 2, desc: "Segue regras de conduta estritas; sofre grandes penalidades se as quebrar." },
  { id: "d_cod_honra", tipo: "desvantagem", nome: "Código de Honra (INT)", pontos: 2, desc: "Nunca ataca inimigos caídos, desarmados ou pelas costas." },
  { id: "d_colecionador", tipo: "desvantagem", nome: "Colecionador Compulsivo (INT)", pontos: 1, desc: "Obsessão em colecionar determinado tipo específico de item." },
  { id: "d_complexo_inf", tipo: "desvantagem", nome: "Complexo de Inferioridade (CAR)", pontos: 1, desc: "Baixa autoestima crônica; sempre se desculpa por supostas limitações." },
  { id: "d_confianca_cega", tipo: "desvantagem", nome: "Confiança Cega (INT)", pontos: 2, desc: "Excesso de autoconfiança que o leva a cometer atos imprudentes e perigosos." },
  { id: "d_corcunda", tipo: "desvantagem", nome: "Corcunda (CAR)", pontos: 2, desc: "Deformidade severa na coluna; penalidades sociais e de agilidade motora." },
  { id: "d_corpo_alienigena", tipo: "desvantagem", nome: "Corpo Alienígena", pontos: 3, desc: "Fisiologia não humana bizarra, impondo penalidades em testes sociais e medicina." },
  { id: "d_corrupcao_moral", tipo: "desvantagem", nome: "Corrupção Moral Crônica (INT)", pontos: 2, desc: "Degeneração ética progressiva rumo à perversidade absoluta." },
  { id: "d_credulidade", tipo: "desvantagem", nome: "Credulidade (INT)", pontos: 2, desc: "Acredita piamente em tudo que lhe dizem, tornando-se presa fácil de mentiras." },
  { id: "d_curioso", tipo: "desvantagem", nome: "Curioso (INT)", pontos: 1, desc: "Incapaz de resistir a segredos e mistérios, mesmo colocando-se em risco físico." },
  { id: "d_daltonico", tipo: "desvantagem", nome: "Daltônico (SAB)", pontos: 1, desc: "Dificuldade severa em enxergar ou diferenciar cores." },
  { id: "d_def_auditiva", tipo: "desvantagem", nome: "Deficiência Auditiva (SAB)", pontos: 3, desc: "Não escuta bem ou é parcialmente surdo, sofrendo penalidades em percepção." },
  { id: "d_delirante", tipo: "desvantagem", nome: "Delirante (INT)", pontos: 3, desc: "Sofre constantemente com delírios e alucinações que afetam seu discernimento." },
  { id: "d_crenca_nao_conv", tipo: "desvantagem", nome: "Crença Não convencional (INT)", pontos: 1, desc: "Segue religião pagã, estranha ou tabu, gerando preconceito social." },
  { id: "d_dep_vampirica", tipo: "desvantagem", nome: "Dependência Vampírica (CON)", pontos: 4, desc: "Necessita beber sangue com frequência sob pena de perder PVs e vigor." },
  { id: "d_dependente", tipo: "desvantagem", nome: "Dependente (INT)", pontos: 2, desc: "Possui alguém indefeso sob sua guarda direta que precisa de proteção constante." },
  { id: "d_depressivo", tipo: "desvantagem", nome: "Depressivo (Especial)", pontos: 2, desc: "Depressão profunda e ideações negativas em situações de estresse agudo." },
  { id: "d_destreza_red", tipo: "desvantagem", nome: "Destreza manual reduzida (DES)", pontos: 3, desc: "Incapacidade de utilizar as mãos com destreza normal, sofrendo penalidades manuais." },
  { id: "d_dislexia", tipo: "desvantagem", nome: "Dislexia (SAB)", pontos: 1, desc: "Dificuldade crônica para ler e decifrar textos com agilidade." },
  { id: "d_distraido", tipo: "desvantagem", nome: "Distraído (SAB)", pontos: 1, desc: "Penalidades constantes em testes de Percepção e dificuldade de concentração." },
  { id: "d_doente_terminal", tipo: "desvantagem", nome: "Doente Terminal (CON)", pontos: 4, desc: "Doença incurável com penalidades físicas severas em vigor e força." },
  { id: "d_egoista", tipo: "desvantagem", nome: "Egoísta (INT)", pontos: 1, desc: "Preocupa-se estritamente consigo mesmo, recusando cooperação abnegada." },
  { id: "d_enxaqueca", tipo: "desvantagem", nome: "Enxaqueca (CON)", pontos: 2, desc: "Dores de cabeça incapacitantes periódicas que penalizam todos os testes." },
  { id: "d_epilepsia", tipo: "desvantagem", nome: "Epilepsia (CON)", pontos: 3, desc: "Crises convulsivas súbitas periódicas que o deixam temporariamente inerte." },
  { id: "d_escravo", tipo: "desvantagem", nome: "Escravo (CAR)", pontos: 3, desc: "Propriedade legal de outrem, submetido a ordens sob risco de punições extremas." },
  { id: "d_estigma_social", tipo: "desvantagem", nome: "Estigma social (CAR)", pontos: 2, desc: "Estigmatizado e rejeitado socialmente onde quer que vá." },
  { id: "d_eunuco", tipo: "desvantagem", nome: "Eunuco (CAR)", pontos: 1, desc: "Não possui órgãos genitais, sofrendo preconceitos em culturas tradicionais." },
  { id: "d_preguicoso", tipo: "desvantagem", nome: "Extremamente Preguiçoso (INT)", pontos: 1, desc: "Dificuldade imensa de encontrar disposição para agir e despender esforço." },
  { id: "d_fala_cotovelos", tipo: "desvantagem", nome: "Fala pelos Cotovelos (CAR)", pontos: 1, desc: "Incapaz de guardar segredos ou calar a boca; penalidades sociais." },
  { id: "d_fanatico", tipo: "desvantagem", nome: "Fanático (CAR)", pontos: 2, desc: "Crença fanática cega em doutrina, ideologia ou líder que tolda seu julgamento." },
  { id: "d_feio", tipo: "desvantagem", nome: "Feio (CAR)", pontos: 1, desc: "Aparência desagradável que provoca desdém imediato nos tratos sociais." },
  { id: "d_fiel", tipo: "desvantagem", nome: "Fiel (INT)", pontos: 1, desc: "Dá a própria vida pelos amigos sem hesitar nem ponderar riscos." },
  { id: "d_fobia", tipo: "desvantagem", nome: "Fobia (INT)", pontos: 2, desc: "Medo irracional paralisante diante de objeto, criatura ou situação específica." },
  { id: "d_fraco", tipo: "desvantagem", nome: "Fraco (FOR)", pontos: 3, desc: "Debilidade extrema: seu valor efetivo de FOR torna-se 0 ou negativo." },
  { id: "d_fraco_magia", tipo: "desvantagem", nome: "Fraco frente a Magia (INT)", pontos: 2, desc: "Penalidades nos testes de resistência contra magias e efeitos sobrenaturais." },
  { id: "d_fragil", tipo: "desvantagem", nome: "Frágil (CON)", pontos: 3, desc: "Estrutura frágil: sofre o dobro de dano normal de qualquer golpe sofrido." },
  { id: "d_fraqueza_calor", tipo: "desvantagem", nome: "Fraqueza de Calor (CON)", pontos: 2, desc: "Intolerância térmica extrema; desmaia em temperaturas superiores a 30°C." },
  { id: "d_fraqueza_esp", tipo: "desvantagem", nome: "Fraqueza Especial (Especial)", pontos: 3, desc: "Possui uma vulnerabilidade fisiológica ou psicológica singular." },
  { id: "d_fraqueza_sobrenat", tipo: "desvantagem", nome: "Fraqueza Sobrenatural (Especial)", pontos: 4, desc: "Ponto fraco místico que causa dano dobrado ou letalidade imediata." },
  { id: "d_gagueira", tipo: "desvantagem", nome: "Gagueira (CAR)", pontos: 1, desc: "Dificuldade na fala, gerando penalidades em diplomacia e sedução." },
  { id: "d_generosidade", tipo: "desvantagem", nome: "Generosidade Exagerada (INT)", pontos: 1, desc: "Incapaz de reter bens para si; doa tudo o que tem aos outros." },
  { id: "d_habitos_odiosos", tipo: "desvantagem", nome: "Hábitos Pessoais Odiosos (CAR)", pontos: 1, desc: "Maníaco por costumes asquerosos que causam repulsa em seus interlocutores." },
  { id: "d_heroico", tipo: "desvantagem", nome: "Heroico (INT)", pontos: 2, desc: "Nunca recusa um pedido de socorro, arriscando a própria sobrevivência." },
  { id: "d_honestidade_rad", tipo: "desvantagem", nome: "Honestidade Radical (CAR)", pontos: 1, desc: "Sempre diz a verdade de forma compulsiva, independente da ocasião." },
  { id: "d_ident_errada", tipo: "desvantagem", nome: "Identidade Errada (CAR)", pontos: 2, desc: "Semelhança física com um famoso criminoso procurado pela lei." },
  { id: "d_ident_secreta", tipo: "desvantagem", nome: "Identidade Secreta (CAR)", pontos: 2, desc: "Identidade oculta que, se descoberta, trará perseguições trágicas." },
  { id: "d_idoso", tipo: "desvantagem", nome: "Idoso (Todos os Atributos)", pontos: 3, desc: "Penalidades generalizadas em todos os atributos decorrentes da senilidade." },
  { id: "d_imbecil", tipo: "desvantagem", nome: "Imbecil (INT)", pontos: 3, desc: "Incapaz de reflexões profundas; penalidade severa em conhecimentos." },
  { id: "d_impulsividade", tipo: "desvantagem", nome: "Impulsividade (CAR)", pontos: 1, desc: "Incapaz de controlar reações; irrita-se facilmente e age sem pensar." },
  { id: "d_incomp_eletron", tipo: "desvantagem", nome: "Incompatibilidade com Eletrônicos (Esp)", pontos: 2, desc: "Causa panes e avarias eletrostáticas em qualquer dispositivo de alta tecnologia." },
  { id: "d_incompetencia", tipo: "desvantagem", nome: "Incompetência (INT)", pontos: 2, desc: "Penalidade em todos os testes envolvendo perícias profissionais." },
  { id: "d_inexperiente", tipo: "desvantagem", nome: "Inexperiente (INT)", pontos: 1, desc: "Nervosismo de principiante em situações técnicas sob pressão." },
  { id: "d_infantil", tipo: "desvantagem", nome: "Infantil (CAR)", pontos: 2, desc: "Maturidade de uma criança pequena, ingênuo e propenso a birras súbitas." },
  { id: "d_inimigo_pessoal", tipo: "desvantagem", nome: "Inimigo Pessoal (CAR)", pontos: 2, desc: "Um arqui-inimigo jurado o persegue implacavelmente durante a vida." },
  { id: "d_inimigos", tipo: "desvantagem", nome: "Inimigos (CAR)", pontos: 3, desc: "Organização criminosa, máfia ou governo estão ao seu encalço." },
  { id: "d_jogo_compulsivo", tipo: "desvantagem", nome: "Jogo Compulsivo (INT)", pontos: 2, desc: "Vício em apostas; incapaz de parar de arriscar fundos financeiros." },
  { id: "d_lento", tipo: "desvantagem", nome: "Lento (DES)", pontos: 2, desc: "Muito mais lento do que o normal; penalidade em deslocamento.", modDesl: -1.0 },
  { id: "d_baixo_limiar_dor", tipo: "desvantagem", nome: "Baixo limiar de dor (CON)", pontos: 2, desc: "Não se esquiva adequadamente da dor; sofre +1d6 de dano extra em ataques." },
  { id: "d_loucura", tipo: "desvantagem", nome: "Loucura (INT)", pontos: 3, desc: "Distúrbio psiquiátrico crônico (esquizofrenia, mania, delírios)." },
  { id: "d_ma_reputacao", tipo: "desvantagem", nome: "Má Reputação (CAR)", pontos: 1, desc: "Passado sombrio que o persegue com calúnias e má fama." },
  { id: "d_ma_sorte", tipo: "desvantagem", nome: "Má Sorte (CAR)", pontos: 2, desc: "Contratempos absurdos e azares bizarros nos momentos mais críticos." },
  { id: "d_manco", tipo: "desvantagem", nome: "Manco (DES)", pontos: 2, desc: "Penalidade em deslocamento e em qualquer teste de corrida.", modDesl: -1.0 },
  { id: "d_maniaco_depress", tipo: "desvantagem", nome: "Maníaco-Depressivos (INT)", pontos: 2, desc: "Alterna ciclicamente entre euforia desmedida e apatia profunda." },
  { id: "d_medo_paralisante", tipo: "desvantagem", nome: "Medo Paralisante (INT)", pontos: 3, desc: "Fica completamente imóvel diante de situações de pavor súbito." },
  { id: "d_medroso", tipo: "desvantagem", nome: "Medroso (INT)", pontos: 2, desc: "Desprovido de coragem; busca sempre fugir de combates e riscos." },
  { id: "d_megalomania", tipo: "desvantagem", nome: "Megalomania (INT)", pontos: 2, desc: "Planos grandiosos e delirantes de ascensão a poder absoluto." },
  { id: "d_mente_fraca", tipo: "desvantagem", nome: "Mente Fraca (INT)", pontos: 2, desc: "Facilmente convencido e manipulado por qualquer um com argumentos simples." },
  { id: "d_mentira_comp", tipo: "desvantagem", nome: "Mentira Compulsiva (INT)", pontos: 1, desc: "Mente compulsivamente sobre sua vida para buscar vantagens vãs." },
  { id: "d_morte_pelo_sol", tipo: "desvantagem", nome: "Morte pelo Sol (CON)", pontos: 5, desc: "Morre e queima em cinzas instantaneamente se exposto à luz solar." },
  { id: "d_mudo", tipo: "desvantagem", nome: "Mudo (CAR)", pontos: 3, desc: "Totalmente incapaz de comunicação verbal falada." },
  { id: "d_nanismo", tipo: "desvantagem", nome: "Nanismo (DES)", pontos: 2, desc: "Estatura muito baixa e passos curtos, com redução no deslocamento.", modDesl: -0.5 },
  { id: "d_nec_respiratorias", tipo: "desvantagem", nome: "Necessidades Respiratórias Especiais (CON)", pontos: 3, desc: "Respira apenas gases específicos; oxigênio atmosférico comum é veneno." },
  { id: "d_nervos_flor", tipo: "desvantagem", nome: "Nervos a Flor da Pele (POD)", pontos: 2, desc: "Baixa tolerância a estresse; explode de raiva por qualquer motivo insignificante." },
  { id: "d_obcecado", tipo: "desvantagem", nome: "Obcecado (INT)", pontos: 2, desc: "Obsessão severa com uma meta única que atrapalha sua vida cotidiana." },
  { id: "d_obeso", tipo: "desvantagem", nome: "Obeso (CON)", pontos: 2, desc: "Muito acima do peso; penalidades em testes físicos de corrida e esforço." },
  { id: "d_olhos_defic", tipo: "desvantagem", nome: "Olhos Deficientes (SAB)", pontos: 2, desc: "Deficiência visual grave incorrigível por óculos; penalidade em Percepção." },
  { id: "d_ossos_frageis", tipo: "desvantagem", nome: "Ossos Frágeis (CON)", pontos: 3, desc: "Sofre o dobro de dano de ataques de contusão e esmagamento." },
  { id: "d_pacifista_rad", tipo: "desvantagem", nome: "Pacifista Radical (INT)", pontos: 3, desc: "Recusa-se terminantemente a lutar ou atacar seres vivos em qualquer ocasião." },
  { id: "d_paranoico", tipo: "desvantagem", nome: "Paranoico (INT)", pontos: 2, desc: "Acredita que está sempre sendo vigiado e perseguido por conspiradores." },
  { id: "d_passado_negro", tipo: "desvantagem", nome: "Passado Negro (INT)", pontos: 2, desc: "Guarda um segredo sombrio que pode destruir suas relações e sanidade." },
  { id: "d_pesadelos", tipo: "desvantagem", nome: "Pesadelos Constantes (INT)", pontos: 1, desc: "Pesadelos frequentes que geram cansaço crônico e penalizam sua sanidade." },
  { id: "d_pobreza", tipo: "desvantagem", nome: "Pobreza (CAR)", pontos: 1, desc: "Miséria extrema e exclusão social de bens de consumo." },
  { id: "d_poder_ritual", tipo: "desvantagem", nome: "Poder dependente de Ritual (INT)", pontos: 2, desc: "Poderes necessitam de rituais lentos e específicos para funcionar." },
  { id: "d_preconceituoso", tipo: "desvantagem", nome: "Preconceituoso (INT e CAR)", pontos: 1, desc: "Acredita na superioridade de sua cultura ou raça e humilha terceiros." },
  { id: "d_procurado", tipo: "desvantagem", nome: "Procurado pelas Autoridades (CAR)", pontos: 3, desc: "Fugitivo da justiça com mandado de prisão ativo." },
  { id: "d_psicose", tipo: "desvantagem", nome: "Psicose (INT)", pontos: 3, desc: "Crises psíquicas profundas com dissociação periódica da realidade." },
  { id: "d_red_pv", tipo: "desvantagem", nome: "Redução de Pontos de Vida (CON)", pontos: 2, desc: "Constituição deficitária que reduz os Pontos de Vida em -4.", modPv: -4 },
  { id: "d_rejeicao_ciber", tipo: "desvantagem", nome: "Rejeição Cibernética (CON)", pontos: 2, desc: "Rejeição orgânica violenta a qualquer implante tecnológico no corpo." },
  { id: "d_renegado", tipo: "desvantagem", nome: "Renegado (CAR)", pontos: 2, desc: "Banido e rejeitado em todas as instâncias e círculos sociais." },
  { id: "d_rosto_mentiroso", tipo: "desvantagem", nome: "Rosto de Mentiroso (CAR)", pontos: 1, desc: "Rosto que não inspira confiança, gerando suspeita inicial em testes sociais." },
  { id: "d_sadismo", tipo: "desvantagem", nome: "Sadismo (INT)", pontos: 2, desc: "Prazer em infligir dor física e psicológica aos oponentes." },
  { id: "d_sanguinario", tipo: "desvantagem", nome: "Sanguinário (CAR)", pontos: 2, desc: "Excesso de ferocidade e crueldade; nunca aceita rendição de inimigos." },
  { id: "d_sem_corpo", tipo: "desvantagem", nome: "Sem corpo físico (CON)", pontos: 4, desc: "Não possui corpo carnal sólido; incapaz de manipular ferramentas comuns." },
  { id: "d_sem_fe", tipo: "desvantagem", nome: "Sem Fé (CAR)", pontos: 1, desc: "Incapaz de exercer fé ou utilizar bênçãos e poderes religiosos." },
  { id: "d_sensivel_luz", tipo: "desvantagem", nome: "Sensível à Luz (SAB)", pontos: 2, desc: "Sofre severas penalidades sensoriais quando exposto à luz intensa." },
  { id: "d_sinal_ident", tipo: "desvantagem", nome: "Sinal de Identificação (CAR)", pontos: 1, desc: "Marca corporal, cicatriz ou tatuagem notória que impede disfarces." },
  { id: "d_tourette", tipo: "desvantagem", nome: "Síndrome de Tourette (CAR)", pontos: 1, desc: "Tiques verbais involuntários nos momentos sociais." },
  { id: "d_sofrimento_const", tipo: "desvantagem", nome: "Sofrimento Constante (INT ou CON)", pontos: 2, desc: "Dores crônicas debilitantes que acompanham o personagem dia e noite." },
  { id: "d_suicida", tipo: "desvantagem", nome: "Suicida (INT)", pontos: 3, desc: "Impulsos autodestrutivos acentuados em momentos de estresse." },
  { id: "d_surdez", tipo: "desvantagem", nome: "Surdez (SAB)", pontos: 4, desc: "Surdo completo; comunica-se apenas por gestos ou escrita." },
  { id: "d_tagarela", tipo: "desvantagem", nome: "Tagarela (CAR)", pontos: 1, desc: "Fala compulsivamente, gerando ruídos e revelando planos." },
  { id: "d_teimoso", tipo: "desvantagem", nome: "Teimoso (INT)", pontos: 1, desc: "Recusa obstinada a mudar de opinião ou estratégia." },
  { id: "d_tetraplegico", tipo: "desvantagem", nome: "Tetraplégico (DES)", pontos: 5, desc: "Paralisia dos quatro membros; depende totalmente de auxílio." },
  { id: "d_timidez", tipo: "desvantagem", nome: "Timidez (CAR)", pontos: 1, desc: "Insegurança social crônica ao abordar pessoas novas." },
  { id: "d_traumatizado", tipo: "desvantagem", nome: "Traumatizado (INT)", pontos: 2, desc: "Trauma psicológico severo que ressurge em gatilhos específicos gerando pânico." },
  { id: "d_viciado", tipo: "desvantagem", nome: "Viciado (INT)", pontos: 2, desc: "Dependência química severa de substâncias entorpecentes." },
  { id: "d_viciado_adrenalina", tipo: "desvantagem", nome: "Viciado em Adrenalina (INT)", pontos: 1, desc: "Obsessão por riscos letais e situações de vida ou morte." },
  { id: "d_vicio_psionico", tipo: "desvantagem", nome: "Vício Psiônico (INT)", pontos: 2, desc: "Vício no uso contínuo e compulsivo de poderes mentais." },
  { id: "d_vingativo", tipo: "desvantagem", nome: "Vingativo (INT)", pontos: 2, desc: "Obsessão por vingar qualquer ofensa sofrida a todo custo." },
  { id: "d_vontade_fraca", tipo: "desvantagem", nome: "Vontade fraca (SAB)", pontos: 2, desc: "Penalidade em testes de força de vontade contra medo e domínio mental." }
];

// AS 6 RAÇAS PADRÃO OFICIAIS DO SISTEMA
export const DEFAULT_RACES: Record<string, Race> = {
  humano: {
    id: "humano",
    nome: "Humano",
    desc: "Humanos foram despojados das grandezas de Gordan, restando-lhes apenas uma biologia frágil e desprovida de atributos físicos ou mentais exaltados.",
    limites: {
      FOR: [1, 5],
      DES: [1, 5],
      CON: [1, 5],
      INT: [1, 5],
      SAB: [1, 5],
      CAR: [1, 5]
    },
    modPv: 0,
    modPe: 0,
    modDesl: 0,
    vantagens: [],
    desvantagens: [],
    isDefault: true
  },
  urgo: {
    id: "urgo",
    nome: "Urgo",
    desc: "Imponentes humanoides de pele grossa, constituição física inabalável e chifres majestosos, herdando a força lendária de Gordan.",
    limites: {
      FOR: [1, 5],
      DES: [1, 5],
      CON: [1, 5],
      INT: [1, 5],
      SAB: [1, 5],
      CAR: [1, 5]
    },
    modPv: 5,
    modPe: 0,
    modDesl: -1,
    vantagens: [
      "v_carga_extra",
      "v_tolerancia_alc",
      "v_estom_ferro"
    ],
    desvantagens: [
      "d_ext_alto",
      "d_destreza_red"
    ],
    isDefault: true
  },
  anao: {
    id: "anao",
    nome: "Anão",
    desc: "Detentores da resistência hercúlea de Gordan, os Anões são blocos inabaláveis, capazes de suportar qualquer dor, veneno ou impacto, enraizados à terra como pedras vivas e dotados de uma genialidade mecânica incomparável.",
    limites: {
      FOR: [1, 5],
      DES: [1, 5],
      CON: [1, 5],
      INT: [1, 5],
      SAB: [1, 5],
      CAR: [1, 5]
    },
    modPv: 7,
    modPe: 0,
    modDesl: 0,
    vantagens: [
      "v_def_ampliada"
    ],
    desvantagens: [
      "d_nanismo"
    ],
    isDefault: true
  },
  esqueleto: {
    id: "esqueleto",
    nome: "Esqueleto",
    desc: "Indivíduos condenados por maldições implacáveis a uma penitência que desafia a mortalidade biológica, existindo sob a forma de ossos e cérebro vivo.",
    limites: {
      FOR: [1, 5],
      DES: [1, 5],
      CON: [1, 5],
      INT: [1, 5],
      SAB: [1, 5],
      CAR: [1, 5]
    },
    modPv: -3,
    modPe: 0,
    modDesl: 2,
    vantagens: [
      "v_nao_respira",
      "v_visao_noturna"
    ],
    desvantagens: [
      "d_amaldicoado"
    ],
    isDefault: true
  },
  goblin: {
    id: "goblin",
    nome: "Goblin",
    desc: "Pequenos, ágeis e extremamente adaptáveis, os goblins possuem reflexos afiados e empatia instintiva com feras e espaços exíguos.",
    limites: {
      FOR: [1, 5],
      DES: [1, 5],
      CON: [1, 5],
      INT: [1, 5],
      SAB: [1, 5],
      CAR: [1, 5]
    },
    modPv: -3,
    modPe: 0,
    modDesl: 3,
    vantagens: [
      "v_empat_animais",
      "v_flexibilidade"
    ],
    desvantagens: [
      "d_nanismo",
      "d_feio"
    ],
    isDefault: true
  },
  elfo: {
    id: "elfo",
    nome: "Elfo",
    desc: "Portadores do intelecto inigualável e do fluxo quase eterno do tempo, os elfos são seres sábios e melancólicos, hoje reduzidos a uma fração de sua antiga glória.",
    limites: {
      FOR: [1, 5],
      DES: [1, 5],
      CON: [1, 5],
      INT: [1, 5],
      SAB: [1, 5],
      CAR: [1, 5]
    },
    modPv: 0,
    modPe: 0,
    modDesl: 0,
    vantagens: [
      "v_def_mental",
      "v_aparencia"
    ],
    desvantagens: [],
    isDefault: true
  }
};

// Aliases para compatibilidade caso o usuário importe arquivos com IDs antigos gerados aleatoriamente
export const RACE_ID_ALIASES: Record<string, string> = {
  "raca_mud3lmdq": "urgo",
  "raca_mud3m4mm": "elfo",
  "raca_mud3nqns": "esqueleto",
  "raca_mud3o2ts": "goblin",
  "raca_mud4i3qj": "anao"
};

export const DEFAULT_SKILLS: Skill[] = [
  { nome: "Acrobacia", atr: "DES", pts: 0, desc: "Saltos mortais, piruetas e equilíbrio em combate." },
  { nome: "Armas Brancas", atr: "FOR", pts: 0, desc: "Espadas, machados, martelos, lanças e facas." },
  { nome: "Armas de Fogo", atr: "DES", pts: 0, desc: "Pistolas, rifles, escopetas e tiro ao alvo." },
  { nome: "Artes Marciais", atr: "DES", pts: 0, desc: "Luta desarmada técnica, Karatê, Judô e golpes de precisão." },
  { nome: "Briga", atr: "FOR", pts: 0, desc: "Luta de rua, sem técnica e brutal." },
  { nome: "Atletismo", atr: "FOR", pts: 0, desc: "Correr, saltar obstáculos, arremessar peso e escalar." },
  { nome: "Furtividade", atr: "DES", pts: 0, desc: "Andar silenciosamente e ocultar-se nas sombras." },
  { nome: "Percepção", atr: "SAB", pts: 0, desc: "Notar pequenos detalhes, sentidos aguçados e pistas." },
  { nome: "Medicina", atr: "INT", pts: 0, desc: "Tratar ferimentos, estancar sangramentos e cuidados emergenciais." },
  { nome: "Diplomacia", atr: "CAR", pts: 0, desc: "Negociar com calma, acordos de paz e discursos públicos." },
  { nome: "Sobrevivência", atr: "SAB", pts: 0, desc: "Rastreio em ermos selvagens, caça e abrigos." },
  { nome: "Vontade", atr: "SAB", pts: 0, desc: "Resistência ao medo, hipnose, estresse mental e coerção." },
  { nome: "Investigação", atr: "INT", pts: 0, desc: "Reunir evidências, deduzir eventos e desvendar crimes." },
  { nome: "Manipulação", atr: "CAR", pts: 0, desc: "Mentir de forma convincente e manipular reações." },
  { nome: "Arrombamento", atr: "DES", pts: 0, desc: "Abrir fechaduras, desarmar armadilhas e bater carteiras." },
  { nome: "Ciências Proibidas", atr: "INT", pts: 0, desc: "Saberes acadêmicos, ciências proibidas e história antiga." },
  { nome: "Alquimia", atr: "INT", pts: 0, desc: "Conhecimento Alquímico, preparo de poções mágicas, remédios e talismãs." },
  { nome: "Mecânica", atr: "INT", pts: 0, desc: "Habilidade de criar e reparar equipamentos mecânicos." },
  { nome: "Cavalgar", atr: "DES", pts: 0, desc: "Andar a cavalo ou outro tipo de montaria." },
  { nome: "Pilotagem", atr: "DES", pts: 0, desc: "Habilidade de conduzir veículos terrestres, aéreos ou navais." },
  { nome: "Tolerância", atr: "CON", pts: 0, desc: "Capacidade de resistir a dor, fadiga, fome e sede." },
  { nome: "Resistência a Venenos", atr: "CON", pts: 0, desc: "Capacidade de resistir aos efeitos de venenos, toxinas e drogas." },
];

export const DEFAULT_CHARACTER: Character = {
  id: "char_1",
  nome: "Valerius",
  nivel: 1,
  racaId: "humano",
  atributos: { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
  pericias: DEFAULT_SKILLS,
  vantagensAdquiridas: [],
  desvantagensAdquiridas: [],
  itensCarregados: 3,
  itensInventario: [
    {
      id: "item_starter_rev38",
      nome: "Revólver .38 Especial",
      qtd: 1,
      categoria: "arma_fogo",
      dano: "2d6+2",
      tipoDano: "Balístico",
      alcance: "150m",
      modIniciativa: -1,
      preco: "200$",
      desc: "Revólver padrão de detetive com tambor de 6 tiros."
    },
    {
      id: "item_starter_couro",
      nome: "Sobretudo de Couro Reforçado",
      qtd: 1,
      categoria: "armadura",
      rd: 2,
      tipoDano: "Contusão, Perfuração e Corte",
      preco: "100$",
      desc: "Casaco longo pesado concedendo Redução de Dano (RD 2)."
    },
    {
      id: "item_starter_relogio",
      nome: "Relógio de Bolso Ferroviário a Corda",
      qtd: 1,
      categoria: "utilitario",
      preco: "35$",
      desc: "Relógio mecânico de precisão com carcaça de latão."
    }
  ]
};
