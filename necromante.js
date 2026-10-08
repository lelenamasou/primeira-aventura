import { d6 } from './rules.js';

const KEY = 'primeira-aventura:necromante';
const HP_MAX = 20;
const $ = (s) => document.querySelector(s);
const fresh = () => ({ hp: HP_MAX, skeletons: 0, fearUsed: false, drainUsed: false, taunted: false });

let s;
try { s = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY)) }; } catch { s = fresh(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }

// Texto para ler em voz alta.
function say(tag, text, cls = 'crit') {
  $('#result').className = `result ${cls}`;
  $('#result').innerHTML = `<span class="tag">${tag}</span><span class="note"></span>`;
  $('#result .note').textContent = text;
}

const ACTIONS = {
  toque: () => say('TOQUE SOMBRIO', 'Ele aponta o cajado para um herói. Esse herói rola Destreza: 6 ou mais desvia, senão perde 3 PV.'),
  erguer: () => {
    s.skeletons += 2;
    say('ERGUER MORTOS', '“Levantem-se, servos!” Dois esqueletos saem do chão. Qualquer acerto destrói um deles.');
  },
  medo: () => {
    s.fearUsed = true;
    say('ONDA DE MEDO', 'Um grito gelado ecoa. Todos os heróis rolam Constituição: quem tirar menos de 5 perde a próxima vez.');
  },
  drenar: () => {
    const n = d6();
    s.drainUsed = true;
    s.hp = Math.min(HP_MAX, s.hp + n);
    say(`DRENAR VIDA: +${n}`, `Ele suga a vida do ar ao redor e recupera ${n} de vida. As plantas murcham.`);
  },
};

function render() {
  $('#hp-value').textContent = `${s.hp} / ${HP_MAX}`;
  $('#hp-value').classList.toggle('low', s.hp <= HP_MAX / 2);
  $('#hp-fill').style.width = `${(s.hp / HP_MAX) * 100}%`;
  $('#skel-value').textContent = s.skeletons;
  $('[data-action="medo"]').disabled = s.fearUsed;
  $('[data-action="drenar"]').disabled = s.drainUsed || s.hp > HP_MAX / 2 || s.hp === 0;
  save();
}

function changeHp(delta) {
  s.hp = Math.max(0, Math.min(HP_MAX, s.hp + delta));
  if (s.hp === 0) say('DERROTADO!', '“Isso... não é... o fim...” O Necromante vira pó e o cajado se parte ao meio. Vitória!');
  else if (s.hp <= HP_MAX / 2 && !s.taunted) {
    s.taunted = true;
    say('ELE RI...', '“Vocês não entendem... a morte é só o começo!”', 'fumble');
  }
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.hp) changeHp(Number(b.dataset.hp));
  else if (b.dataset.skel) s.skeletons = Math.max(0, s.skeletons + Number(b.dataset.skel));
  else if (b.dataset.action) ACTIONS[b.dataset.action]();
  else return;
  render();
});

$('#reset-ask').addEventListener('click', () => { $('#reset-ask').hidden = true; $('#reset-confirm').hidden = false; });
$('#reset-no').addEventListener('click', () => { $('#reset-ask').hidden = false; $('#reset-confirm').hidden = true; });
$('#reset-yes').addEventListener('click', () => {
  s = fresh();
  $('#reset-ask').hidden = false;
  $('#reset-confirm').hidden = true;
  $('#result').className = 'result';
  $('#result').innerHTML = '<span class="placeholder">Escolha a ação do Necromante 👇</span>';
  render();
});

render();
