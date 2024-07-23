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
  // load the models
  await faceapi.loadTinyFaceDetectorModel("/weights");
  await faceapi.loadFaceRecognitionModel("/weights");

  // try to access users webcam and stream the images
  // to the video element
  const videoEl = document.getElementById("inputVideo");
  navigator.getUserMedia(
    { video: {} },
    (stream) => (videoEl.srcObject = stream),
    (err) => console.error(err)
  );
}

let xCorrection = 2.5;
let yCorrection = -3.5;

async function onPlay() {
  const videoEl = document.getElementById("inputVideo");

  if (videoEl.paused || videoEl.ended) return setTimeout(() => onPlay());

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 512,
    scoreThreshold: 0.5,
  });

  const result = await faceapi.detectSingleFace(videoEl, options);

  if (result) {
    const canvas = document.getElementById("overlay");
    const dims = faceapi.matchDimensions(canvas, videoEl, true);

    const resizedResult = faceapi.resizeResults(result, dims);
    faceapi.draw.drawDetections(canvas, resizedResult);

    const hatElement = document.getElementById("hat");

    const scaleFactor = (resizedResult.box.width / 24) * 2.5;

    hatElement.style.top = `${
      resizedResult.box.top + yCorrection * scaleFactor
    }px`;
    hatElement.style.left = `${
      resizedResult.box.left + xCorrection * scaleFactor
    }px`;

    hatElement.style.transform = `scale(${scaleFactor})`;
    console.log(xCorrection, yCorrection);
  }

  setTimeout(() => onPlay());
}

docReady(run);
