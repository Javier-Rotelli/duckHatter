import { updateHatsPositions } from "./hats.js";

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
}

async function run() {
  await faceapi.loadTinyFaceDetectorModel("/weights");
  await faceapi.loadFaceRecognitionModel("/weights");
  await faceapi.loadFaceLandmarkModel("/weights");

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 512,
    scoreThreshold: 0.5,
  });
  // try to access users webcam and stream the images
  // to the video element
  const videoEl = document.getElementById("inputVideo");
  videoEl.addEventListener("play", () => onPlay(options));

  const stream = await navigator.mediaDevices?.getUserMedia({
    video: { width: window.innerWidth, height: window.innerHeight },
  });

  videoEl.srcObject = stream;
}

let faces = 0;

const canvas = document.getElementById("overlay");
const videoEl = document.getElementById("inputVideo");

async function onPlay(options) {
  if (videoEl.paused || videoEl.ended) return setTimeout(() => onPlay());

  const results = await faceapi
    .detectAllFaces(videoEl, options)
    .withFaceLandmarks()
    .withFaceDescriptors();

  faces = (faces + results.length) / 2;

  const dims = faceapi.matchDimensions(canvas, videoEl, true);
  const resizedResults = faceapi.resizeResults(results, dims);

  const facesFract = faces % 1;
  if (facesFract < 0.1 || facesFract > 0.9) {
    updateHatsPositions(resizedResults.map((res) => res.detection));
  }
  // resizedResults.forEach((resizedResult) => {
  //   faceapi.draw.drawDetections(canvas, resizedResult);
  //   faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
  // });

  setTimeout(() => onPlay(options));
}

docReady(run);
