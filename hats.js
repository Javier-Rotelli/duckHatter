const range = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

const validPositions = [...range(1, 7), ...range(9, 15), ...range(16, 20), 22];

function getBackgroundPosition(pos) {
  const x = pos % 8;
  const y = Math.floor(pos / 8);
  return [x * -32, y * -32];
}

const container = document.getElementById("container");

const makeNewHat = (i) => {
  const div = document.createElement("div");
  div.id = `hat${i}`;
  div.className = "hat";

  div.style.left = "-64px";

  //busca un sombrero aleatorio
  const pos = validPositions[Math.floor(Math.random() * validPositions.length)];
  const [x, y] = getBackgroundPosition(pos);
  div.style.setProperty("--x", `${x}px`);
  div.style.setProperty("--y", `${y}px`);
  container.appendChild(div);

  return {
    top: 0,
    left: -64,
    el: div,
  };
};

const hats = [];

const xCorrection = 2.5;
const yCorrection = -3.5;

export function updateHatsPositions(resizedResults) {
  // console.log(resizedResults);
  resizedResults.sort((a, b) => {
    return b.box.left + b.box.top - (a.box.left + a.box.top);
  });

  if (hats.length < resizedResults.length) {
    for (let i = hats.length; i < resizedResults.length; i++) {
      hats.push(makeNewHat(i));
    }
    hats.sort((a, b) => b.left + b.top - (a.left + a.top));
  }

  hats.forEach((hat, i) => {
    const resizedResult = resizedResults[i];
    // console.log(resizedResult?.box.top, resizedResult?.box.left);
    if (!resizedResult) {
      hat.left = -64;
      hat.el.style.left = "-1064px";
      hat.el.style.transform = `scale(1)`;
      return;
    }

    const scaleFactorX = (resizedResult.box.width / 24) * 2.5;
    const scaleFactorY = (resizedResult.box.height / 24) * 2.5;

    hat.top = resizedResult.box.top / resizedResult.imageDims.height;
    hat.el.style.top = `${hat.top * 100}%`;

    hat.el.style.marginTop = `${yCorrection * scaleFactorY}px`;

    hat.left = resizedResult.box.left / resizedResult.imageDims.width;
    hat.el.style.left = `${hat.left * 100}%`;
    hat.el.style.marginLeft = `${xCorrection * scaleFactorX}px`;

    hat.el.style.transform = `scale(${scaleFactorX},${scaleFactorY})`;
  });
}
