const screens = [...document.querySelectorAll(".screen")];
const form = document.getElementById("leadForm");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const resultImage = document.getElementById("resultImage");
const cameraError = document.getElementById("cameraError");

let stream = null;
let finalPhoto = "";

function showScreen(name) {
  screens.forEach(s => s.classList.toggle("active", s.dataset.screen === name));
  if (name === "camera") startCamera();
  else stopCamera();
}

document.addEventListener("click", e => {
  const go = e.target.closest("[data-go]");
  if (go) showScreen(go.dataset.go);
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  localStorage.setItem("fotoNaOndaLead", JSON.stringify(data));
  showScreen("moldura");
});

async function startCamera() {
  cameraError.classList.add("hidden");
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1920 } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    cameraError.textContent = "Não consegui abrir a câmera. Toque no cadeado do navegador e permita o uso da câmera.";
    cameraError.classList.remove("hidden");
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}

document.getElementById("captureBtn").addEventListener("click", capture);

async function capture() {
  if (!video.videoWidth) return;

  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");

  const outW = canvas.width;
  const outH = canvas.height;
  const videoRatio = video.videoWidth / video.videoHeight;
  const outRatio = outW / outH;

  let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
  if (videoRatio > outRatio) {
    sw = video.videoHeight * outRatio;
    sx = (video.videoWidth - sw) / 2;
  } else {
    sh = video.videoWidth / outRatio;
    sy = (video.videoHeight - sh) / 2;
  }

  ctx.save();
  ctx.translate(outW, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
  ctx.restore();

  stopCamera();
  showScreen("processando");

  const frame = new Image();
  frame.src = "./assets/moldura-oficial.png";

  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, outW, outH);
    finalPhoto = canvas.toDataURL("image/png");
    resultImage.src = finalPhoto;
    setTimeout(() => showScreen("resultado"), 1200);
  };

  frame.onerror = () => {
    finalPhoto = canvas.toDataURL("image/jpeg", .94);
    resultImage.src = finalPhoto;
    setTimeout(() => showScreen("resultado"), 1200);
  };
}

document.getElementById("downloadBtn").addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = finalPhoto;
  a.download = "foto-na-onda.png";
  a.click();
});

document.getElementById("shareBtn").addEventListener("click", async () => {
  try {
    const blob = await (await fetch(finalPhoto)).blob();
    const file = new File([blob], "foto-na-onda.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Foto na Onda",
        text: "Eu entrei na Onda da Produtividade! @wavesplusoficial",
        files: [file]
      });
    } else {
      document.getElementById("downloadBtn").click();
      alert("A foto foi baixada. Agora publique e marque @wavesplusoficial.");
    }
  } catch {
    alert("Não foi possível compartilhar agora. Use o botão BAIXAR.");
  }
});

document.getElementById("restartBtn").addEventListener("click", () => {
  form.reset();
  finalPhoto = "";
  showScreen("splash");
});