"use client";

import { useEffect, useRef, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbyZc2qEJiNStcTcl_BKemVvHrFRFydLdCgI58doZyNsJQcSClXekFGkOCKCQ0zINyRfvQ/exec";

const FRAME_URL = "/molduras/oficial.png";

const INITIAL_FORM = {
  nome: "",
  whatsapp: "",
  email: "",
  empresa: "",
  cidade: "",
  estado: "",
  lgpd: false,
};

export default function Home() {
  const [screen, setScreen] = useState("splash");
  const [form, setForm] = useState(INITIAL_FORM);
  const [photo, setPhoto] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState("");
  const [saveError, setSaveError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [cameraDevices, setCameraDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (screen === "camera") {
      openCamera({ preferRear: true });
    } else {
      closeCamera();
    }
    return closeCamera;
  }, [screen]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function submitForm(event) {
    event.preventDefault();

    if (!form.nome.trim() || !form.whatsapp.trim()) {
      alert("Preencha seu nome e WhatsApp.");
      return;
    }

    if (!form.cidade.trim() || !form.estado.trim()) {
      alert("Preencha cidade e estado.");
      return;
    }

    if (!form.lgpd) {
      alert("Autorize o uso dos dados para continuar.");
      return;
    }

    localStorage.setItem("fotoNaOndaLead", JSON.stringify(form));
    setScreen("moldura");
  }

  async function openCamera(options = {}) {
    setCameraError("");
    closeCamera();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Seu navegador não permite abrir a câmera.");
      }

      const requestedDeviceId = options.deviceId || "";
      const preferRear = options.preferRear !== false;

      let stream;

      if (requestedDeviceId) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: requestedDeviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } else {
        // Libera a permissão para o navegador revelar todas as lentes.
        const permissionStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        permissionStream.getTracks().forEach((track) => track.stop());

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter(
          (device) => device.kind === "videoinput"
        );

        setCameraDevices(videoInputs);

        const rearPattern =
          /back|rear|environment|traseira|traseiro|world|camera 0/i;
        const frontPattern =
          /front|user|facetime|frontal|selfie/i;

        let selectedDevice;

        if (preferRear) {
          selectedDevice =
            videoInputs.find((device) => rearPattern.test(device.label)) ||
            [...videoInputs]
              .reverse()
              .find((device) => !frontPattern.test(device.label)) ||
            videoInputs[videoInputs.length - 1];
        } else {
          selectedDevice =
            videoInputs.find((device) => frontPattern.test(device.label)) ||
            videoInputs[0];
        }

        if (selectedDevice?.deviceId) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: selectedDevice.deviceId },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: preferRear
                ? { exact: "environment" }
                : { exact: "user" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        }
      }

      streamRef.current = stream;

      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings?.() || {};
      const selectedDeviceId = settings.deviceId || requestedDeviceId;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(
        (device) => device.kind === "videoinput"
      );

      setCameraDevices(videoInputs);
      setActiveDeviceId(selectedDeviceId || "");

      const selectedDevice = videoInputs.find(
        (device) => device.deviceId === selectedDeviceId
      );

      const label = (selectedDevice?.label || "").toLowerCase();
      const isFront =
        /front|user|facetime|frontal|selfie/.test(label) ||
        settings.facingMode === "user";

      setFacingMode(isFront ? "user" : "environment");
    } catch (error) {
      console.error(error);
      setCameraError(
        "Não consegui abrir a câmera traseira. Permita o acesso e toque em ABRIR TRASEIRA."
      );
    }
  }

  async function switchCamera() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });

    let devices = cameraDevices;

    if (!devices.length) {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      devices = allDevices.filter((device) => device.kind === "videoinput");
      setCameraDevices(devices);
    }

    if (devices.length > 1) {
      const currentIndex = devices.findIndex(
        (device) => device.deviceId === activeDeviceId
      );
      const nextIndex =
        currentIndex >= 0 ? (currentIndex + 1) % devices.length : 0;

      await openCamera({ deviceId: devices[nextIndex].deviceId });
      return;
    }

    await openCamera({ preferRear: facingMode === "user" });
  }

  async function selectCamera(deviceId) {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    await openCamera({ deviceId });
  }

  function pointerDown(event) {
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      startX: offset.x,
      startY: offset.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function pointerMove(event) {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.startX + event.clientX - dragRef.current.x,
      y: dragRef.current.startY + event.clientY - dragRef.current.y,
    });
  }

  function pointerUp() {
    dragRef.current = null;
  }

  function closeCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth) {
      alert("A câmera ainda está carregando.");
      return;
    }

    const width = 1080;
    const height = 1920;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    const stage = video.closest(".camera-stage");
    drawCover(
      context,
      video,
      width,
      height,
      facingMode,
      zoom,
      offset,
      stage?.clientWidth || width,
      stage?.clientHeight || height
    );

    const frame = await loadImage(FRAME_URL);
    context.drawImage(frame, 0, 0, width, height);

    const output = canvas.toDataURL("image/jpeg", 0.88);

    setPhoto(output);
    closeCamera();
    setScreen("processando");

    window.setTimeout(() => {
      setScreen("resultado");
      saveToGoogle(output, "FOTO_CRIADA");
    }, 1300);
  }

  async function saveToGoogle(finalPhoto, action) {
    if (saving || savedId) return true;

    try {
      setSaving(true);
      setSaveError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          ...form,
          photo: finalPhoto,
          acao: action,
          dispositivo: getDeviceDescription(),
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.message || "Não foi possível salvar.");
      }

      setSavedId(result.id || "");
      return true;
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a foto."
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  function downloadPhoto() {
    if (!photo) return;
    const link = document.createElement("a");
    link.href = photo;
    link.download = `foto-na-onda-${savedId || Date.now()}.jpg`;
    link.click();
  }

  async function sharePhoto() {
    if (!photo) return;

    await saveToGoogle(photo, "WHATSAPP");

    try {
      const blob = await fetch(photo).then((response) => response.blob());
      const file = new File([blob], "foto-na-onda.jpg", {
        type: "image/jpeg",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Foto na Onda",
          text:
            "Eu entrei na Onda da Produtividade na ExpoConstruir 2026! 🌊📸 @wavesplusoficial",
          files: [file],
        });
        return;
      }

      downloadPhoto();
      alert("A foto foi baixada. Agora é só enviar pelo WhatsApp.");
    } catch {
      downloadPhoto();
      alert("A foto foi baixada. Agora é só enviar pelo WhatsApp.");
    }
  }

  function reset() {
    closeCamera();
    setForm(INITIAL_FORM);
    setPhoto("");
    setSavedId("");
    setSaveError("");
    localStorage.removeItem("fotoNaOndaLead");
    setScreen("splash");
  }

  return (
    <main className="app-shell">
      <section className="phone">
        {screen === "splash" && (
          <div className="screen splash-screen">
            <LogoBar />
            <div className="wave-orbit" />

            <div className="hero">
              <p className="eyebrow">EXPOCONSTRUIR 2026</p>
              <h1>
                FOTO NA
                <strong>ONDA</strong>
                <span>DA PRODUTIVIDADE</span>
              </h1>
              <p>
                Entre na onda, tire sua foto e mostre que você faz parte do
                movimento.
              </p>
              <button className="primary" onClick={() => setScreen("cadastro")}>
                COMEÇAR
              </button>
            </div>
          </div>
        )}

        {screen === "cadastro" && (
          <div className="screen">
            <LogoBar />
            <p className="eyebrow">CADASTRO RÁPIDO</p>
            <h2>Entre na Onda</h2>
            <p className="subtext">Preencha seus dados para continuar.</p>

            <form className="form" onSubmit={submitForm}>
              <Input name="nome" placeholder="Nome completo" value={form.nome} onChange={updateField} required />
              <Input name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={updateField} required inputMode="tel" />
              <Input name="email" placeholder="E-mail" value={form.email} onChange={updateField} inputMode="email" />
              <Input name="empresa" placeholder="Empresa" value={form.empresa} onChange={updateField} />
              <Input name="cidade" placeholder="Cidade" value={form.cidade} onChange={updateField} required />
              <Input name="estado" placeholder="Estado" value={form.estado} onChange={updateField} required />

              <label className="privacy">
                <input
                  type="checkbox"
                  name="lgpd"
                  checked={form.lgpd}
                  onChange={updateField}
                />
                <span>
                  Autorizo o uso dos meus dados para esta experiência e contatos
                  da Waves Plus.
                </span>
              </label>

              <button className="primary" type="submit">
                ENTRAR NA ONDA
              </button>
            </form>
          </div>
        )}

        {screen === "moldura" && (
          <div className="screen">
            <LogoBar />
            <p className="eyebrow">MOLDURA OFICIAL</p>
            <h2>Sua foto vai ficar assim</h2>
            <p className="subtext">A moldura será aplicada automaticamente.</p>

            <div className="frame-preview">
              <img src={FRAME_URL} alt="Moldura oficial" />
            </div>

            <button className="primary" onClick={() => setScreen("camera")}>
              CONTINUAR
            </button>
          </div>
        )}

        {screen === "camera" && (
          <div className="camera-screen">
            <div
              className="camera-stage"
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerCancel={pointerUp}
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) ${
                    facingMode === "user" ? "scaleX(-1)" : ""
                  }`,
                }}
              />
              <img src={FRAME_URL} alt="" className="camera-overlay" />

              <div className="camera-tools">
                <button
                  type="button"
                  className="rear-camera-button"
                  onClick={() => openCamera({ preferRear: true })}
                >
                  ABRIR TRASEIRA
                </button>

                <button type="button" onClick={switchCamera}>
                  TROCAR CÂMERA
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setOffset({ x: 0, y: 0 });
                  }}
                >
                  CENTRALIZAR
                </button>

                {cameraDevices.length > 1 && (
                  <select
                    className="camera-select"
                    value={activeDeviceId}
                    onChange={(event) => selectCamera(event.target.value)}
                    aria-label="Escolher câmera"
                  >
                    {cameraDevices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Câmera ${index + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {cameraError && (
                <div className="camera-error">
                  <p>{cameraError}</p>
                  <button onClick={() => openCamera({ preferRear: true })}>TENTAR NOVAMENTE</button>
                </div>
              )}
            </div>

            <p className="camera-hint">
              Arraste para enquadrar e use o zoom. A câmera traseira abre primeiro.
            </p>

            <div className="zoom-control">
              <span>−</span>
              <input
                aria-label="Zoom da câmera"
                type="range"
                min="1"
                max="2.2"
                step="0.05"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
              <span>+</span>
            </div>

            <button
              className="capture"
              aria-label="Tirar foto"
              onClick={capturePhoto}
            />

            <button className="text-button" onClick={() => setScreen("moldura")}>
              Voltar
            </button>

            <canvas ref={canvasRef} hidden />
          </div>
        )}

        {screen === "processando" && (
          <div className="screen center">
            <div className="spinner" />
            <h2>Preparando sua foto...</h2>
            <p className="subtext">Aplicando a moldura oficial.</p>
            <div className="progress"><span /></div>
          </div>
        )}

        {screen === "resultado" && (
          <div className="screen result-screen">
            <LogoBar />
            <p className="eyebrow">FOTO PRONTA</p>
            <h2>Sua foto ficou pronta!</h2>
            <p className="subtext">Agora escolha como deseja compartilhar.</p>

            <div className="result-photo">
              <img src={photo} alt="Foto final" />
            </div>

            {saving && <div className="status">Salvando no Google Drive...</div>}
            {savedId && (
              <div className="success">Foto salva com sucesso • {savedId}</div>
            )}
            {saveError && (
              <div className="error-box">
                <p>{saveError}</p>
                <button onClick={() => saveToGoogle(photo, "FOTO_CRIADA")}>
                  TENTAR NOVAMENTE
                </button>
              </div>
            )}

            <button className="whatsapp" onClick={sharePhoto}>
              ENVIAR PARA WHATSAPP
            </button>

            <button className="secondary" onClick={downloadPhoto}>
              BAIXAR FOTO
            </button>

            <button className="secondary" onClick={() => setScreen("camera")}>
              TIRAR OUTRA FOTO
            </button>

            <button className="text-button" onClick={() => setScreen("obrigado")}>
              FINALIZAR
            </button>
          </div>
        )}

        {screen === "obrigado" && (
          <div className="screen center">
            <div className="check">✓</div>
            <p className="eyebrow">TUDO CERTO</p>
            <h2>Obrigado!</h2>
            <p className="subtext">
              Você faz parte da Onda da Produtividade.
            </p>
            <strong className="handle">@wavesplusoficial</strong>
            <button className="primary" onClick={reset}>
              VOLTAR AO INÍCIO
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function Input(props) {
  return <input className="input" {...props} />;
}

function LogoBar() {
  return (
    <header className="logo-bar">
      <img src="/logos/waves-plus.png" alt="Waves Plus" />
      <span />
      <img src="/logos/expoconstruir.png" alt="ExpoConstruir" />
    </header>
  );
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("A moldura não foi carregada."));
    image.src = source;
  });
}

function drawCover(
  context,
  video,
  width,
  height,
  facingMode,
  zoom,
  offset,
  previewWidth,
  previewHeight
) {
  const videoRatio = video.videoWidth / video.videoHeight;
  const outputRatio = width / height;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = video.videoWidth;
  let sourceHeight = video.videoHeight;

  if (videoRatio > outputRatio) {
    sourceWidth = video.videoHeight * outputRatio;
    sourceX = (video.videoWidth - sourceWidth) / 2;
  } else {
    sourceHeight = video.videoWidth / outputRatio;
    sourceY = (video.videoHeight - sourceHeight) / 2;
  }

  const scaledWidth = width * zoom;
  const scaledHeight = height * zoom;
  const outputOffsetX = (offset.x / previewWidth) * width;
  const outputOffsetY = (offset.y / previewHeight) * height;

  context.save();
  context.translate(width / 2 + outputOffsetX, height / 2 + outputOffsetY);
  context.scale(facingMode === "user" ? -1 : 1, 1);
  context.drawImage(
    video,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -scaledWidth / 2,
    -scaledHeight / 2,
    scaledWidth,
    scaledHeight
  );
  context.restore();
}

function getDeviceDescription() {
  const userAgent = navigator.userAgent;

  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iPhone/iPad";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Macintosh|Mac OS X/i.test(userAgent)) return "Mac";

  return "Outro";
}
