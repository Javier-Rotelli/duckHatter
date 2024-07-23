const range = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
}

const validPositions = [...range(1, 7), ...range(9, 15), ...range(16, 20), 22];

function getBackgroundPosition(pos) {
  const x = pos % 8;
  const y = Math.floor(pos / 8);
  return [x * -32, y * -32];
}

function changeHat(element, pos) {
  const [x, y] = getBackgroundPosition(pos);
  console.log(pos, x, y);
  element.style.setProperty("--x", `${x}px`);
  element.style.setProperty("--y", `${y}px`);
}

function randomizeHat(i) {
  const pos = validPositions[Math.floor(Math.random() * validPositions.length)];
  changeHat(document.getElementById(`hat${i}`), pos);
}

async function run() {
  randomizeHat(1);
  randomizeHat(2);
  randomizeHat(3);
  randomizeHat(4);

  // load the models
  // await faceapi.nets.ssdMobilenetv1.loadFromUri("/weights");
  await faceapi.loadTinyFaceDetectorModel("/weights");

  // try to access users webcam and stream the images
  // to the video element
  const videoEl = document.getElementById("inputVideo");

  navigator.getUserMedia(
    { video: {} },
    (stream) => (videoEl.srcObject = stream),
    (err) => console.error(err)
  );
}

const xCorrection = 2.5;
const yCorrection = -3.5;

async function onPlay() {
  const videoEl = document.getElementById("inputVideo");

  if (videoEl.paused || videoEl.ended) return setTimeout(() => onPlay());

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 512,
    scoreThreshold: 0.5,
  });

  const results = await faceapi.detectAllFaces(videoEl, options);
  const canvas = document.getElementById("overlay");
  const dims = faceapi.matchDimensions(canvas, videoEl, true);
  const resizedResults = faceapi.resizeResults(results, dims);

  resizedResults.forEach((resizedResult, i) => {
    faceapi.draw.drawDetections(canvas, resizedResult);

    const hatElement = document.getElementById(`hat${i + 1}`);

    const scaleFactor = (resizedResult.box.width / 24) * 2.5;

    hatElement.style.top = `${
      resizedResult.box.top + yCorrection * scaleFactor
    }px`;
    hatElement.style.left = `${
      resizedResult.box.left + xCorrection * scaleFactor
    }px`;

    hatElement.style.transform = `scale(${scaleFactor})`;
  });

  setTimeout(() => onPlay());
}

docReady(run);
