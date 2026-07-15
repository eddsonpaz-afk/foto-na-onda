"use client";

import { useEffect, useRef, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyZc2qEJiNStcTcl_BKemVvHrFRFydLdCgI58doZyNsJQcSClXekFGkOCKCQ0zINyRfvQ/exec";

const MOCKUP_URL = "/mockup-final-v41.png?v=41";

const INITIAL_FORM = {
  nome: "",
  whatsapp: "",
  email: "",
  empresa: "",
  cidade: "",
  estado: "",
  lgpd: false
};

export default function Home() {
  const [screen, setScreen] = useState("splash");
  const [form, setForm] = useState(INITIAL_FORM);
  const [photoReady, setPhotoReady] = useState(false);
  const [finalPhoto, setFinalPhoto] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState("");
  const [saveError, setSaveError] = useState("");

  const canvasRef = useRef(null);
  const mockupRef = useRef(null);
  const photoRef = useRef(null);

  const photoState = useRef({
    x: 540,
    y: 960,
    scale: 1,
    dragging: false,
    lastX: 0,
    lastY: 0
  });

  useEffect(() => {
    const mockup = new Image();
    mockup.onload = () => {
      mockupRef.current = mockup;
      drawCanvas();
    };
    mockup.onerror = () => {
      alert("Não consegui carregar o mockup aprovado.");
    };
    mockup.src = MOCKUP_URL;
  }, []);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function submitForm(event) {
    event.preventDefault();

    if (!form.nome.trim() || !form.whatsapp.trim()) {
      alert("Preencha nome e WhatsApp.");
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

    setScreen("foto");
    requestAnimationFrame(drawCanvas);
  }

  function handleImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      const image = new Image();

      image.onload = function () {
        photoRef.current = image;
        fitPhotoToStory();
        setPhotoReady(true);
        drawCanvas();
      };

      image.onerror = function () {
        alert("Não foi possível carregar a imagem.");
      };

      image.src = loadEvent.target.result;
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function fitPhotoToStory() {
    const photo = photoRef.current;

    if (!photo) return;

    const scaleX = 1080 / photo.width;
    const scaleY = 1920 / photo.height;

    photoState.current.scale = Math.max(scaleX, scaleY);
    photoState.current.x = 540;
    photoState.current.y = 960;
  }

  function drawCanvas() {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");
    const photo = photoRef.current;
    const mockup = mockupRef.current;

    context.clearRect(0, 0, 1080, 1920);

    context.fillStyle = "#03142d";
    context.fillRect(0, 0, 1080, 1920);

    if (photo) {
      const state = photoState.current;
      const width = photo.width * state.scale;
      const height = photo.height * state.scale;

      context.drawImage(
        photo,
        state.x - width / 2,
        state.y - height / 2,
        width,
        height
      );
    } else {
      context.fillStyle = "#071f42";
      context.fillRect(0, 0, 1080, 1920);

      context.fillStyle = "#ffffff";
      context.font = "700 46px Arial";
      context.textAlign = "center";
      context.fillText("Tire ou escolha uma foto", 540, 900);

      context.fillStyle = "#7ecbff";
      context.font = "32px Arial";
      context.fillText("Depois ajuste o enquadramento", 540, 970);
    }

    if (mockup) {
      context.drawImage(mockup, 0, 0, 1080, 1920);
    }
  }

  function zoomPhoto(amount) {
    if (!photoRef.current) return;

    photoState.current.scale *= amount;
    drawCanvas();
  }

  function resetPhoto() {
    if (!photoRef.current) return;

    fitPhotoToStory();
    drawCanvas();
  }

  function getCanvasPoint(clientX, clientY) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: (clientX - rect.left) * (1080 / rect.width),
      y: (clientY - rect.top) * (1920 / rect.height)
    };
  }

  function startDrag(clientX, clientY) {
    if (!photoRef.current) return;

    const point = getCanvasPoint(clientX, clientY);

    photoState.current.dragging = true;
    photoState.current.lastX = point.x;
    photoState.current.lastY = point.y;
  }

  function dragPhoto(clientX, clientY) {
    const state = photoState.current;

    if (!state.dragging || !photoRef.current) return;

    const point = getCanvasPoint(clientX, clientY);

    state.x += point.x - state.lastX;
    state.y += point.y - state.lastY;
    state.lastX = point.x;
    state.lastY = point.y;

    drawCanvas();
  }

  function stopDrag() {
    photoState.current.dragging = false;
  }

  async function finishPhoto() {
    if (!photoRef.current) {
      alert("Primeiro tire ou escolha uma foto.");
      return;
    }

    drawCanvas();

    const canvas = canvasRef.current;
    const output = canvas.toDataURL("image/jpeg", 0.9);

    setFinalPhoto(output);
    setScreen("processando");

    window.setTimeout(() => {
      setScreen("resultado");
      saveToGoogle(output, "FOTO_CRIADA");
    }, 1200);
  }

  async function saveToGoogle(photo, action) {
    if (saving || savedId) return true;

    try {
      setSaving(true);
      setSaveError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          ...form,
          photo,
          acao: action,
          dispositivo: navigator.userAgent
        })
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
    if (!finalPhoto) return;

    const link = document.createElement("a");

    link.href = finalPhoto;
    link.download = `foto-na-onda-${savedId || Date.now()}.jpg`;
    link.click();
  }

  async function sharePhoto() {
    if (!finalPhoto) return;

    await saveToGoogle(finalPhoto, "WHATSAPP");

    try {
      const blob = await fetch(finalPhoto).then((response) => response.blob());

      const file = new File([blob], "foto-na-onda.jpg", {
        type: "image/jpeg"
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Foto na Onda",
          text:
            "Eu entrei na Onda da Produtividade na ExpoConstruir 2026! 🌊📸 @wavesplusoficial",
          files: [file]
        });
        return;
      }

      downloadPhoto();
      alert("A foto foi baixada. Agora abra o WhatsApp para enviar.");
    } catch {
      downloadPhoto();
      alert("A foto foi baixada. Agora abra o WhatsApp para enviar.");
    }
  }

  function resetApp() {
    setScreen("splash");
    setForm(INITIAL_FORM);
    setPhotoReady(false);
    setFinalPhoto("");
    setSavedId("");
    setSaveError("");
    photoRef.current = null;
    fitPhotoToStory();
  }

  return (
    <main className="app-shell">
      <section className="phone">
        {screen === "splash" && (
          <div className="screen splash">
            <LogoBar />
            <div className="wave-ring" />

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
              <Input name="nome" placeholder="Nome completo" value={form.nome} onChange={updateField} />
              <Input name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={updateField} />
              <Input name="email" placeholder="E-mail" value={form.email} onChange={updateField} />
              <Input name="empresa" placeholder="Empresa" value={form.empresa} onChange={updateField} />
              <Input name="cidade" placeholder="Cidade" value={form.cidade} onChange={updateField} />
              <Input name="estado" placeholder="Estado" value={form.estado} onChange={updateField} />

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

        {screen === "foto" && (
          <div className="photo-editor">
            <LogoBar />

            <div className="canvas-wrap">
              <canvas
                ref={canvasRef}
                width="1080"
                height="1920"
                onMouseDown={(event) => startDrag(event.clientX, event.clientY)}
                onMouseMove={(event) => dragPhoto(event.clientX, event.clientY)}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
                onTouchStart={(event) => {
                  event.preventDefault();
                  const touch = event.touches[0];
                  if (touch) startDrag(touch.clientX, touch.clientY);
                }}
                onTouchMove={(event) => {
                  event.preventDefault();
                  const touch = event.touches[0];
                  if (touch) dragPhoto(touch.clientX, touch.clientY);
                }}
                onTouchEnd={stopDrag}
              />
            </div>

            <label className="camera-button" htmlFor="cameraInput">
              📸 TIRAR FOTO
            </label>
            <input
              id="cameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
            />

            <label className="gallery-button" htmlFor="galleryInput">
              🖼️ ESCOLHER DA GALERIA
            </label>
            <input
              id="galleryInput"
              type="file"
              accept="image/*"
              onChange={handleImage}
            />

            <div className="editor-controls">
              <button type="button" onClick={() => zoomPhoto(1.1)}>
                AUMENTAR
              </button>
              <button type="button" onClick={() => zoomPhoto(0.9)}>
                DIMINUIR
              </button>
            </div>

            <button className="secondary" type="button" onClick={resetPhoto}>
              CENTRALIZAR
            </button>

            <button
              className="primary"
              type="button"
              disabled={!photoReady}
              onClick={finishPhoto}
            >
              USAR ESTA FOTO
            </button>
          </div>
        )}

        {screen === "processando" && (
          <div className="screen center">
            <div className="spinner" />
            <h2>Preparando sua foto...</h2>
            <p className="subtext">Aplicando o mockup oficial aprovado.</p>
          </div>
        )}

        {screen === "resultado" && (
          <div className="screen">
            <LogoBar />
            <p className="eyebrow">FOTO PRONTA</p>
            <h2>Sua foto ficou pronta!</h2>

            <div className="result-photo">
              <img src={finalPhoto} alt="Foto final" />
            </div>

            {saving && <div className="status">Salvando no Drive...</div>}
            {savedId && <div className="success">Salva com sucesso • {savedId}</div>}
            {saveError && <div className="error">{saveError}</div>}

            <button className="whatsapp" onClick={sharePhoto}>
              ENVIAR PARA WHATSAPP
            </button>

            <button className="secondary" onClick={downloadPhoto}>
              BAIXAR FOTO
            </button>

            <button className="secondary" onClick={() => setScreen("foto")}>
              TIRAR OUTRA
            </button>

            <button className="primary" onClick={() => setScreen("obrigado")}>
              FINALIZAR
            </button>
          </div>
        )}

        {screen === "obrigado" && (
          <div className="screen center">
            <div className="check">✓</div>
            <p className="eyebrow">TUDO CERTO</p>
            <h2>Obrigado!</h2>
            <p className="subtext">Você entrou na Onda da Produtividade.</p>
            <strong className="handle">@wavesplusoficial</strong>
            <button className="primary" onClick={resetApp}>
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
      <div className="expo-logo-card">
        <img src="/logos/expoconstruir.png" alt="ExpoConstruir" />
      </div>
    </header>
  );
}
