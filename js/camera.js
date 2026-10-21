import { HandLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';

const TEMPO_PERMANENCIA = 1000; // ms sobre a carta para virar
const SUAVIZACAO = 0.3;         // 0.2 = mais suave e lento, 0.5 = mais rápido e tremido

export async function iniciarCamera(aoSelecionar) {
  const video = document.getElementById('video');
  const cursor = document.getElementById('cursor');

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 640, height: 480 },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();

  const fileset = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
  );
  const detector = await HandLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
    },
    runningMode: 'VIDEO',
    numHands: 1,
  });

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let indiceAtual = null;
  let desde = 0;
  let acionado = false;
  let ultimoTempoVideo = -1;

  function quadro() {
    if (video.currentTime !== ultimoTempoVideo) {
      ultimoTempoVideo = video.currentTime;
      const resultado = detector.detectForVideo(video, performance.now());
      const mao = resultado.landmarks[0];

      if (mao) {
        const ponta = mao[8]; // ponta do indicador
        const alvoX = (1 - ponta.x) * window.innerWidth; // espelhado
        const alvoY = ponta.y * window.innerHeight;
        x += (alvoX - x) * SUAVIZACAO;
        y += (alvoY - y) * SUAVIZACAO;

        cursor.style.display = 'block';
        cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;

        const el = document.elementFromPoint(x, y);
        const carta = el && el.closest('.carta');
        const indice = carta ? Number(carta.dataset.indice) : null;

        if (indice !== indiceAtual) {
          indiceAtual = indice;
          desde = performance.now();
          acionado = false;
        }

        let progresso = 0;
        if (indice !== null && !acionado) {
          progresso = (performance.now() - desde) / TEMPO_PERMANENCIA;
          if (progresso >= 1) {
            acionado = true;
            progresso = 0;
            aoSelecionar(indice);
          }
        }
        cursor.style.setProperty('--p', `${progresso * 360}deg`);
      } else {
        cursor.style.display = 'none';
        indiceAtual = null;
      }
    }
    requestAnimationFrame(quadro);
  }
  quadro();
}