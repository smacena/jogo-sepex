import { banco } from './dados.js';
import { config } from './config.js';
import { criarJogo, virarCarta, esconderErradas, venceu } from './memoria.js';
import { iniciarCamera } from './camera.js';

const tabuleiro = document.getElementById('tabuleiro');
const relogio = document.getElementById('relogio');
const mensagem = document.getElementById('mensagem');
const botaoNovo = document.getElementById('novo');

let jogo, tempoRestante, intervalo, encerrado;

function atualizarRelogio() {
  relogio.textContent = `⏱ ${tempoRestante}s`;
}

function desenhar() {
  tabuleiro.innerHTML = '';
  const colunas = jogo.cartas.length <= 6 ? 3 : 4;
  tabuleiro.style.gridTemplateColumns = `repeat(${colunas}, 1fr)`;

  jogo.cartas.forEach((carta, i) => {
    const el = document.createElement('button');
    el.className = 'carta';
    el.dataset.indice = i;
    if (carta.virada || carta.combinada) {
      el.classList.add('aberta');
      el.textContent = carta.texto;
    }
    if (carta.combinada) el.classList.add('combinada');
    if (jogo.bloqueado && jogo.selecionadas.includes(i)) el.classList.add('errada');
    el.addEventListener('click', () => aoClicar(i));
    tabuleiro.appendChild(el);
  });
}

function terminar(texto) {
  clearInterval(intervalo);
  encerrado = true;
  mensagem.textContent = texto;
}

// Único ponto de entrada: toque agora, câmera depois.
function aoClicar(indice) {
  if (encerrado) return;
  const resultado = virarCarta(jogo, indice);
  if (resultado === 'ignorada') return;
  desenhar();
  if (resultado === 'erro') {
    setTimeout(() => { esconderErradas(jogo); desenhar(); }, 1500);
  }
  if (venceu(jogo)) terminar('Você venceu! 🎉');
}

function iniciar() {
  clearInterval(intervalo);
  jogo = criarJogo(banco, config.pares);
  tempoRestante = config.tempoSegundos;
  encerrado = false;
  mensagem.textContent = '';
  atualizarRelogio();
  desenhar();
  intervalo = setInterval(() => {
    tempoRestante--;
    atualizarRelogio();
    if (tempoRestante <= 0) terminar('Tempo esgotado!');
  }, 1000);
}

botaoNovo.addEventListener('click', iniciar);
const botaoCamera = document.getElementById('camera');
botaoCamera.addEventListener('click', async () => {
  botaoCamera.disabled = true;
  botaoCamera.textContent = 'Carregando...';
  try {
    await iniciarCamera(aoClicar);
    botaoCamera.textContent = 'Câmera ligada';
  } catch (erro) {
    console.error(erro);
    botaoCamera.disabled = false;
    botaoCamera.textContent = 'Ativar câmera';
    mensagem.textContent = 'Não consegui ligar a câmera. Veja o console.';
  }
});
iniciar();