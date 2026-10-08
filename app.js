import { STATS, CLASSES, OCCUPATIONS, buildCharacter, d6, roll, activateBuff, rollStat } from './rules.js';

const KEY = 'primeira-aventura:personagem';
const $ = (s) => document.querySelector(s);
let char = null;

function load() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY));
    // Fichas antigas (sem DES) voltam para a criação.
    return c && CLASSES[c.classId] && OCCUPATIONS[c.occupationId] && typeof c.stats?.dex === 'number' ? c : null;
  } catch { return null; }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(char)); } catch {} }
function forget() { try { localStorage.removeItem(KEY); } catch {} }

const statLine = (stats) => Object.entries(STATS).map(([k, s]) => `<span>${s.short} +${stats[k]}</span>`).join(' · ');

// --- Criação ---

$('#class-cards').innerHTML = Object.entries(CLASSES).map(([id, c]) => `
  <label class="class-card">
    <input type="radio" name="classId" value="${id}" required>
    <span class="portrait">${c.portrait}</span>
    <strong>${c.name}</strong>
    <small>${c.tagline}</small>
    <span class="mini">${statLine(c.stats)}</span>
  </label>`).join('');

$('#occupation').innerHTML = '<option value="">Escolha uma ocupação...</option>' +
  Object.entries(OCCUPATIONS).map(([id, o]) =>
    `<option value="${id}">${o.name} (+1 ${STATS[o.stat].short})</option>`).join('');

$('#create-form').addEventListener('submit', (e) => {
  e.preventDefault();
  char = buildCharacter(Object.fromEntries(new FormData(e.target)));
  save();
  showSheet();
});

// --- Ficha ---

function showSheet() {
  const cls = CLASSES[char.classId];
  $('#create').hidden = true;
  $('#sheet').hidden = false;
  $('#portrait').textContent = cls.portrait;
  $('#char-name').textContent = char.name;
  $('#char-sub').textContent = `${cls.name} · ex-${OCCUPATIONS[char.occupationId].name}`;
  $('#char-past').textContent = char.past ? `“${char.past}”` : '';
  $('#char-past').hidden = !char.past;
  $('#ability-name').textContent = `${cls.ability.name} (uma vez por cena)`;
  $('#ability-desc').textContent = cls.ability.desc;
  $('#stat-buttons').innerHTML = Object.entries(STATS).map(([k, s]) => `
    <button type="button" class="stat" data-stat="${k}">
      <span class="stat-short">${s.short}</span>
      <span class="stat-mod">+${char.stats[k]}</span>
      <span class="stat-name">${s.name}</span>
    </button>`).join('');
  renderLive();
}

function renderLive() {
  $('#hp-value').textContent = `${char.hp} / ${char.hpMax}`;
  $('#hp-value').classList.toggle('low', char.hp <= 2);
  const btn = $('#ability-btn');
  btn.textContent = char.abilityUsed ? 'Usada · recarregar' : 'Usar';
  btn.classList.toggle('used', char.abilityUsed);
  for (const b of document.querySelectorAll('[data-stat]')) b.classList.toggle('buffed', char.buff?.stat === b.dataset.stat);
  save();
}

let rolling = false;
// Mostra números aleatórios por um instante antes do resultado final.
function animate(label, r, note = '') {
  if (rolling) return;
  rolling = true;
  const box = $('#result');
  box.className = 'result rolling';
  let ticks = 0;
  const t = setInterval(() => {
    box.innerHTML = `<span class="die">${d6()}</span>`;
    if (++ticks < 8) return;
    clearInterval(t);
    rolling = false;
    box.className = 'result' + (r.crit ? ' crit' : r.fumble ? ' fumble' : '');
    box.innerHTML = `
      <span class="die">${r.die}</span>
      <span class="label"></span>
      <span class="math">🎲 ${r.die} + ${r.mod} = <strong>${r.total}</strong></span>
      ${r.crit ? '<span class="tag">CRÍTICO!</span>' : r.fumble ? '<span class="tag">Ops...</span>' : ''}
      ${note ? `<span class="note">${note}</span>` : ''}`;
    box.querySelector('.label').textContent = label;
  }, 60);
}

$('#stat-buttons').addEventListener('click', (e) => {
  const k = e.target.closest('[data-stat]')?.dataset.stat;
  if (!k || rolling) return;
  const r = rollStat(char, k);
  const note = !r.buff ? '' : r.buff.advantage
    ? `${r.buff.name}: ${r.dice[0]} e ${r.dice[1]}, ficou o maior`
    : `${r.buff.name}: +${r.buff.bonus}`;
  renderLive();
  animate(STATS[k].name, r, note);
});

$('#init-btn').addEventListener('click', () => {
  if (!rolling) animate('Iniciativa', roll(char.stats.dex));
});

$('#hp-minus').addEventListener('click', () => { char.hp = Math.max(0, char.hp - 1); renderLive(); });
$('#hp-plus').addEventListener('click', () => { char.hp = Math.min(char.hpMax, char.hp + 1); renderLive(); });

$('#ability-btn').addEventListener('click', () => {
  if (rolling) return;
  if (char.abilityUsed) { char.abilityUsed = false; renderLive(); return; }
  const ability = CLASSES[char.classId].ability;
  const id = ability.id;
  if (ability.buff) {
    activateBuff(char, ability);
    $('#result').className = 'result crit';
    $('#result').innerHTML = `<span class="tag">${ability.name.toUpperCase()}!</span><span class="note">${ability.desc}</span>`;
  } else if (id === 'folego') {
    const r = roll(0);
    char.hp = Math.min(char.hpMax, char.hp + r.total);
    animate('Fôlego: PV recuperados', r);
  } else if (id === 'cura') {
    animate('Cura: PV do aliado', roll(char.stats.mag));
  }
  char.abilityUsed = true;
  renderLive();
});

$('#reset-ask').addEventListener('click', () => {
  $('#reset-name').textContent = char.name;
  $('#reset-ask').hidden = true;
  $('#reset-confirm').hidden = false;
});
$('#reset-no').addEventListener('click', () => {
  $('#reset-ask').hidden = false;
  $('#reset-confirm').hidden = true;
});
$('#reset-yes').addEventListener('click', () => {
  forget();
  location.reload();
});

// --- Início ---

char = load();
if (char) showSheet();
else $('#create').hidden = false;
