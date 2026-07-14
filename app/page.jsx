"use client";

import { useEffect, useRef, useState } from "react";

const initialForm = {
  nome: "",
  whatsapp: "",
  email: "",
  empresa: "",
  cidade: "",
  estado: "",
  lgpd: false
};

const FRAME_URL = "/moldura-oficial.png";

export default function Home() {
  const [screen, setScreen] = useState("splash");
  const [form, setForm] = useState(initialForm);
  const [finalPhoto, setFinalPhoto] = useState("");
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (screen === "camera") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [screen]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function submitForm(event) {
    event.preventDefault();

    if (!form.lgpd) {
      alert("Marque a autorização para continuar.");
      return;
    }

    localStorage.setItem("fotoNaOndaLead", JSON.stringify(form));
    setScreen("moldura");
  }

  async function startCamera() {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Este navegador não permite abrir a câmera.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError(
        "A câmera está bloqueada. Toque no cadeado do navegador e escolha Permitir câmera."
      );
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth) {
      alert("A câmera ainda está carregando. Espere um segundo e tente novamente.");
      return;
    }

    const width = 1080;
    const height = 1920;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    const videoRatio = video.videoWidth / video.videoHeight;
    const targetRatio = width / height;

    let sx = 0;
    let sy = 0;
    let sw = video.videoWidth;
    let sh = video.videoHeight;

    if (videoRatio > targetRatio) {
      sw = video.videoHeight * targetRatio;
      sx = (video.videoWidth - sw) / 2;
    } else {
      sh = video.videoWidth / targetRatio;
      sy = (video.videoHeight - sh) / 2;
    }

    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);
    ctx.restore();

    stopCamera();
    setScreen("processando");

    const frame = new Image();
    frame.src = FRAME_URL;

    frame.onload = () => {
      ctx.drawImage(frame, 0, 0, width, height);
      const merged = canvas.toDataURL("image/png");
      setFinalPhoto(merged);
      setTimeout(() => setScreen("resultado"), 1200);
    };

    frame.onerror = () => {
      const photoOnly = canvas.toDataURL("image/jpeg", 0.94);
      setFinalPhoto(photoOnly);
      setTimeout(() => setScreen("resultado"), 1200);
    };
  }

  function downloadPhoto() {
    if (!finalPhoto) return;

    const link = document.createElement("a");
    link.href = finalPhoto;
    link.download = "foto-na-onda.png";
    link.click();
  }

  async function sharePhoto() {
    if (!finalPhoto) return;

    try {
      const blob = await (await fetch(finalPhoto)).blob();
      const file = new File([blob], "foto-na-onda.png", {
        type: "image/png"
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Foto na Onda",
          text: "Eu entrei na Onda da Produtividade! @wavesplusoficial",
          files: [file]
        });
      } else {
        downloadPhoto();
        alert("A foto foi baixada. Agora publique e marque @wavesplusoficial.");
      }
    } catch {
      alert("Não foi possível compartilhar. Use o botão Baixar.");
    }
  }

  function restart() {
    setForm(initialForm);
    setFinalPhoto("");
    setScreen("splash");
  }

  return (
    <main className="appShell">
      <section className="device">
        {screen === "splash" && (
          <div className="screen splash">
            <Brand />
            <div className="waveMark" />

            <div className="bottomCopy">
              <p className="eyebrow">EXPOCONSTRUIR 2026</p>
              <h1>
                FOTO NA
                <strong>ONDA</strong>
                <span>DA PRODUTIVIDADE</span>
              </h1>

              <p>
                Entre na onda, tire sua foto e mostre que você faz parte do movimento.
              </p>

              <Primary onClick={() => setScreen("cadastro")}>
                COMEÇAR
              </Primary>
            </div>
          </div>
        )}

        {screen === "cadastro" && (
          <div className="screen">
            <Brand />

            <p className="eyebrow">CADASTRO RÁPIDO</p>
            <h2>Entre na Onda</h2>
            <p>Preencha seus dados para continuar.</p>

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
                  Autorizo o uso dos meus dados para esta experiência.
                </span>
              </label>

              <Primary type="submit">ENTRAR NA ONDA</Primary>
            </form>
          </div>
        )}

        {screen === "moldura" && (
          <div className="screen">
            <Brand />

            <p className="eyebrow">MOLDURA OFICIAL</p>
            <h2>Sua foto vai ficar assim</h2>
            <p>A moldura será aplicada automaticamente.</p>

            <div className="framePreview">
              <img src={FRAME_URL} alt="Moldura oficial" />
            </div>

            <Primary onClick={() => setScreen("camera")}>
              CONTINUAR
            </Primary>
          </div>
        )}

        {screen === "camera" && (
          <div className="screen cameraScreen">
            <div className="cameraStage">
              <video ref={videoRef} autoPlay muted playsInline />
              <img className="overlay" src={FRAME_URL} alt="" />

              {cameraError && (
                <div className="cameraError">{cameraError}</div>
              )}
            </div>

            <p className="hint">Centralize o rosto e sorria 😄</p>

            <button
              className="capture"
              aria-label="Tirar foto"
              onClick={takePhoto}
            />

            <button
              className="textButton"
              onClick={() => setScreen("moldura")}
            >
              Voltar
            </button>

            <canvas ref={canvasRef} hidden />
          </div>
        )}

        {screen === "processando" && (
          <div className="screen center">
            <div className="spinner" />
            <h2>Preparando sua foto...</h2>
            <p>Estamos aplicando a moldura oficial.</p>
            <div className="progress"><span /></div>
          </div>
        )}

        {screen === "resultado" && (
          <div className="screen">
            <Brand />

            <p className="eyebrow">FOTO PRONTA</p>
            <h2>Sua foto ficou pronta</h2>
            <p>Agora é só baixar ou compartilhar.</p>

            <div className="result">
              <img src={finalPhoto} alt="Foto final" />
            </div>

            <div className="buttonGrid">
              <Primary onClick={downloadPhoto}>BAIXAR</Primary>
              <Primary onClick={sharePhoto}>COMPARTILHAR</Primary>
            </div>

            <button
              className="secondary"
              onClick={() => setScreen("camera")}
            >
              TIRAR OUTRA
            </button>

            <button
              className="textButton"
              onClick={() => setScreen("obrigado")}
            >
              FINALIZAR
            </button>
          </div>
        )}

        {screen === "obrigado" && (
          <div className="screen center">
            <div className="ok">✓</div>
            <p className="eyebrow">TUDO CERTO</p>
            <h2>Obrigado!</h2>
            <p>Você faz parte da Onda da Produtividade.</p>
            <strong>@wavesplusoficial</strong>
            <Primary onClick={restart}>VOLTAR AO INÍCIO</Primary>
          </div>
        )}
      </section>
    </main>
  );
}

function Input(props) {
  return <input className="input" {...props} />;
}

function Primary({ children, ...props }) {
  return (
    <button className="primary" {...props}>
      {children}
    </button>
  );
}

function Brand() {
  return (
    <div className="brandRow">
      <span className="brand waves">WAVES PLUS</span>
      <span className="brand expo">EXPOCONSTRUIR</span>
      <span className="brand cbs">CBS</span>
    </div>
  );
}
