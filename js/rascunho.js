import { arrPerguntasRespostas } from './dados.js';

const perguntaElement = document.getElementById('pergunta');
const respostaInput = document.getElementById('resposta');
const verificarBtn = document.getElementById('verificar');
const resultadoElement = document.getElementById('resultado');

let perguntaAtualIndex = 0;

function mostrarPergunta() {
  const perguntaAtual = arrPerguntasRespostas[perguntaAtualIndex];
  perguntaElement.textContent = perguntaAtual.pergunta;
  respostaInput.value = '';
  resultadoElement.textContent = '';
}

function verificarResposta() {
  const respostaUsuario = respostaInput.value.trim();
  const respostaCorreta = arrPerguntasRespostas[perguntaAtualIndex].respostaCorreta;

  if (respostaUsuario === respostaCorreta) {
    resultadoElement.textContent = 'Resposta correta!';
    resultadoElement.style.color = 'green';
  } else {
    resultadoElement.textContent = `Resposta incorreta! A resposta correta é: ${respostaCorreta}`;
    resultadoElement.style.color = 'red';
  }

  perguntaAtualIndex++;
  if (perguntaAtualIndex < arrPerguntasRespostas.length) {
    setTimeout(mostrarPergunta, 2000);
  } else {
    setTimeout(() => {
      perguntaElement.textContent = 'Fim do quiz!';
      respostaInput.style.display = 'none';
      verificarBtn.style.display = 'none';
      resultadoElement.textContent = '';
    }, 2000);
  }
}

verificarBtn.addEventListener('click', verificarResposta);