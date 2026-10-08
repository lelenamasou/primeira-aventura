import test from 'node:test';
import assert from 'node:assert/strict';
import { STATS, CLASSES, OCCUPATIONS, MAX_STAT, buildCharacter, d6, roll, activateBuff, rollStat } from './rules.js';

test('cada classe tem 3 pontos nos 4 atributos e a ocupação soma +1 sem passar do máximo', () => {
  for (const [classId, cls] of Object.entries(CLASSES)) {
    assert.deepEqual(Object.keys(cls.stats).sort(), Object.keys(STATS).sort(), classId);
    const base = Object.values(cls.stats).reduce((a, b) => a + b, 0);
    assert.equal(base, 3, classId);
    for (const [occupationId, occ] of Object.entries(OCCUPATIONS)) {
      const c = buildCharacter({ name: ' Ana ', classId, occupationId });
      assert.equal(c.stats[occ.stat], Math.min(MAX_STAT, cls.stats[occ.stat] + 1));
      assert.equal(c.hpMax, 6 + 2 * c.stats.con);
      assert.equal(c.hp, c.hpMax);
      assert.equal(c.name, 'Ana');
    }
  }
});

test('cada atributo tem duas ocupações', () => {
  for (const k of Object.keys(STATS)) {
    assert.equal(Object.values(OCCUPATIONS).filter((o) => o.stat === k).length, 2, k);
  }
});

test('bárbaro ferreiro: FOR 3, PV 8; ladino malabarista: DES 3', () => {
  const c = buildCharacter({ name: 'Grom', classId: 'barbaro', occupationId: 'ferreiro' });
  assert.deepEqual(c.stats, { str: 3, dex: 0, con: 1, mag: 0 });
  assert.equal(c.hpMax, 8);
  assert.equal(buildCharacter({ name: 'Sombra', classId: 'ladino', occupationId: 'malabarista' }).stats.dex, 3);
});

test('classe ou ocupação inválida lança erro', () => {
  assert.throws(() => buildCharacter({ name: 'x', classId: 'bardo', occupationId: 'guarda' }));
  assert.throws(() => buildCharacter({ name: 'x', classId: 'mago', occupationId: 'pirata' }));
});

test('d6 fica entre 1 e 6 e cobre todas as faces', () => {
  const seen = new Set();
  for (let i = 0; i < 2000; i++) {
    const v = d6();
    assert.ok(v >= 1 && v <= 6);
    seen.add(v);
  }
  assert.equal(seen.size, 6);
});

test('roll soma modificador e bônus, marca crítico e falha', () => {
  assert.deepEqual(roll(2, 0, 4), { die: 4, mod: 2, total: 6, crit: false, fumble: false });
  assert.deepEqual(roll(1, 2, 6), { die: 6, mod: 3, total: 9, crit: true, fumble: false });
  assert.equal(roll(0, 0, 1).fumble, true);
});

test('Sobrecarga Arcana: perde 2 PV agora, +3 só na próxima rolagem de MAG', () => {
  const c = buildCharacter({ name: 'Zed', classId: 'mago', occupationId: 'estudante' }); // MAG 3, PV 8
  activateBuff(c, CLASSES.mago.ability);
  assert.equal(c.hp, 6);
  assert.equal(c.abilityUsed, true);
  assert.equal(rollStat(c, 'str', 4).total, 4);          // outro atributo não consome o buff
  assert.equal(rollStat(c, 'mag', 4).total, 4 + 3 + 3);
  assert.equal(rollStat(c, 'mag', 4).total, 4 + 3);      // buff já foi usado
});

test('dano em si mesmo não deixa PV negativo', () => {
  const c = buildCharacter({ name: 'Zed', classId: 'mago', occupationId: 'estudante' });
  c.hp = 1;
  activateBuff(c, CLASSES.mago.ability);
  assert.equal(c.hp, 0);
});

test('Nas Sombras: próxima rolagem de DES fica com o maior de 2 dados', () => {
  const c = buildCharacter({ name: 'Sombra', classId: 'ladino', occupationId: 'pescador' }); // DES 2
  activateBuff(c, CLASSES.ladino.ability);
  const r = rollStat(c, 'dex', 2, 5);
  assert.deepEqual(r.dice, [2, 5]);
  assert.equal(r.total, 5 + 2);
  assert.equal(rollStat(c, 'dex', 2, 5).total, 2 + 2);   // sem vantagem depois
});

test('iniciativa: 1d6 + DES', () => {
  const c = buildCharacter({ name: 'Sombra', classId: 'ladino', occupationId: 'entregador' }); // DES 3
  assert.equal(roll(c.stats.dex, 0, 3).total, 6);
});
