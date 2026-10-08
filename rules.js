// Regras do jogo: dados puros e lógica, sem DOM.

export const STATS = {
  str: { short: 'FOR', name: 'Força' },
  dex: { short: 'DES', name: 'Destreza' },
  con: { short: 'CON', name: 'Constituição' },
  mag: { short: 'MAG', name: 'Magia' },
};

export const MAX_STAT = 3;

// Habilidades com `buff` afetam a próxima rolagem do atributo indicado.
export const CLASSES = {
  barbaro: {
    name: 'Bárbaro', portrait: '🪓', stats: { str: 2, dex: 0, con: 1, mag: 0 },
    tagline: 'Forte, selvagem e impossível de parar.',
    ability: { id: 'furia', name: 'Fúria', desc: 'Sua próxima rolagem de Força ganha +2.', buff: { stat: 'str', bonus: 2 } },
  },
  guerreiro: {
    name: 'Guerreiro', portrait: '🛡️', stats: { str: 1, dex: 0, con: 2, mag: 0 },
    tagline: 'Treinado para lutar e proteger os seus.',
    ability: { id: 'folego', name: 'Fôlego', desc: 'Recupere 1d6 pontos de vida.' },
  },
  ladino: {
    name: 'Ladino', portrait: '🗡️', stats: { str: 0, dex: 2, con: 1, mag: 0 },
    tagline: 'Rápido, silencioso e sempre um passo à frente.',
    ability: { id: 'nas-sombras', name: 'Nas Sombras', desc: 'Sua próxima rolagem de Destreza usa 2 dados e fica com o maior.', buff: { stat: 'dex', advantage: true } },
  },
  mago: {
    name: 'Mago', portrait: '🔮', stats: { str: 0, dex: 0, con: 1, mag: 2 },
    tagline: 'Estudou os segredos do universo.',
    ability: { id: 'sobrecarga', name: 'Sobrecarga Arcana', desc: 'Sua próxima rolagem de Magia ganha +3, mas você perde 2 PV agora.', buff: { stat: 'mag', bonus: 3 }, selfDamage: 2 },
  },
  clerigo: {
    name: 'Clérigo', portrait: '✨', stats: { str: 1, dex: 0, con: 1, mag: 1 },
    tagline: 'Um pouco de tudo, e a fé no coração.',
    ability: { id: 'cura', name: 'Cura', desc: 'Um aliado recupera 1d6 + Magia pontos de vida.' },
  },
};

export const OCCUPATIONS = {
  ferreiro: { name: 'Ferreiro(a)', stat: 'str' },
  guarda: { name: 'Guarda', stat: 'str' },
  entregador: { name: 'Entregador(a)', stat: 'dex' },
  malabarista: { name: 'Malabarista', stat: 'dex' },
  pescador: { name: 'Pescador(a)', stat: 'con' },
  pedreiro: { name: 'Pedreiro(a)', stat: 'con' },
  estudante: { name: 'Estudante', stat: 'mag' },
  artista: { name: 'Artista de rua', stat: 'mag' },
};

export function buildCharacter({ name, classId, occupationId, past = '' }) {
  const cls = CLASSES[classId];
  const occ = OCCUPATIONS[occupationId];
  if (!cls || !occ) throw new Error('Classe ou ocupação inválida');
  const stats = { ...cls.stats };
  stats[occ.stat] = Math.min(MAX_STAT, stats[occ.stat] + 1);
  const hpMax = 6 + 2 * stats.con;
  return { name: name.trim(), classId, occupationId, past: past.trim(), stats, hpMax, hp: hpMax, abilityUsed: false, buff: null };
}

export function d6() {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return (a[0] % 6) + 1;
}

export function roll(mod, bonus = 0, die = d6()) {
  return { die, mod: mod + bonus, total: die + mod + bonus, crit: die === 6, fumble: die === 1 };
}

// Ativa uma habilidade de buff: guarda o efeito e aplica o dano em si mesmo.
export function activateBuff(char, ability) {
  char.buff = { ...ability.buff, name: ability.name };
  char.hp = Math.max(0, char.hp - (ability.selfDamage ?? 0));
  char.abilityUsed = true;
}

// Rola um atributo, consumindo o buff pendente se for desse atributo.
export function rollStat(char, stat, a = d6(), b = d6()) {
  const buff = char.buff?.stat === stat ? char.buff : null;
  if (buff) char.buff = null;
  const die = buff?.advantage ? Math.max(a, b) : a;
  return { ...roll(char.stats[stat], buff?.bonus ?? 0, die), buff, dice: buff?.advantage ? [a, b] : [a] };
}
