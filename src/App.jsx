import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  Download,
  Instagram,
  Mail,
  MapPin,
  RotateCcw,
  Share2,
  Smartphone,
  User,
  Building2,
} from "lucide-react";

const FORM_INITIAL = {
  nome: "",
  whatsapp: "",
  email: "",
  empresa: "",
  cidade: "",
  estado: "",
  lgpd: false,
};

const FRAME_URL = "/moldura-oficial.png";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [form, setForm] = useState(FORM_INITIAL);
  const [photo, setPhoto] = useState("");
  const [finalPhoto, setFinalPhoto] = useState("");
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (screen === "camera") startCamera();
    else stopCamera();

    return stopCamera;
  }, [screen]);

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function submitRegistration(event) {
    event.preventDefault();
    if (!form.lgpd) {
      alert("Marque a autorização de uso dos dados para continuar.");
      return;
    }
    localStorage.setItem("fotoNaOndaLead", JSON.stringify(form));
    setScreen("moldura");
  }

  async function startCamera() {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError(
        "Não consegui abrir a câmera. Toque no cadeado do navegador e permita o uso da câmera."
      );
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    const outputWidth = 1080;
    const outputHeight = 1920;
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const ctx = canvas.getContext("2d");
    const videoRatio = video.videoWidth / video.videoHeight;
    const outputRatio = outputWidth / outputHeight;

    let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;

    if (videoRatio > outputRatio) {
      sw = video.videoHeight * outputRatio;
      sx = (video.videoWidth - sw) / 2;
    } else {
      sh = video.videoWidth / outputRatio;
      sy = (video.videoHeight - sh) / 2;
    }

    ctx.save();
    ctx.translate(outputWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
    ctx.restore();

    const raw = canvas.toDataURL("image/jpeg", 0.94);
    setPhoto(raw);
    stopCamera();
    setScreen("processing");

    const frame = new Image();
    frame.crossOrigin = "anonymous";
    frame.src = FRAME_URL;

    frame.onload = () => {
      ctx.drawImage(frame, 0, 0, outputWidth, outputHeight);
      const merged = canvas.toDataURL("image/png");
      setFinalPhoto(merged);
      setTimeout(() => setScreen("resultado"), 1500);
    };

    frame.onerror = () => {
      setFinalPhoto(raw);
      setTimeout(() => setScreen("resultado"), 1500);
    };
  }

  function downloadPhoto() {
    const link = document.createElement("a");
    link.href = finalPhoto;
    link.download = "foto-na-onda.png";
    link.click();
  }

  async function sharePhoto() {
    if (!finalPhoto) return;
    const blob = await (await fetch(finalPhoto)).blob();
    const file = new File([blob], "foto-na-onda.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "Foto na Onda",
        text: "Eu entrei na Onda da Produtividade! @wavesplusoficial",
        files: [file],
      });
      return;
    }

    downloadPhoto();
    alert("A foto foi baixada. Agora é só publicar e marcar @wavesplusoficial.");
  }

  function resetApp() {
    setForm(FORM_INITIAL);
    setPhoto("");
    setFinalPhoto("");
    setScreen("splash");
  }

  return (
    <main className="app-shell">
      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <section className="device">
        {screen === "splash" && (
          <Screen className="splash">
            <Brand />
            <div className="wave-orbit" />
            <div className="splash-copy">
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
                Começar <ArrowRight size={20} />
              </Primary>
            </div>
          </Screen>
        )}

        {screen === "cadastro" && (
          <Screen>
            <Brand />
            <Header eyebrow="CADASTRO RÁPIDO" title="Entre na Onda">
              Preencha seus dados para continuar.
            </Header>

            <form className="form" onSubmit={submitRegistration}>
              <Field icon={<User size={18} />} name="nome" placeholder="Nome completo" value={form.nome} onChange={updateField} required />
              <Field icon={<Smartphone size={18} />} name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={updateField} required inputMode="tel" />
              <Field icon={<Mail size={18} />} name="email" placeholder="E-mail" value={form.email} onChange={updateField} inputMode="email" />
              <Field icon={<Building2 size={18} />} name="empresa" placeholder="Empresa" value={form.empresa} onChange={updateField} />
              <Field icon={<MapPin size={18} />} name="cidade" placeholder="Cidade" value={form.cidade} onChange={updateField} required />
              <Field icon={<MapPin size={18} />} name="estado" placeholder="Estado" value={form.estado} onChange={updateField} required />

              <label className="privacy">
                <input type="checkbox" name="lgpd" checked={form.lgpd} onChange={updateField} />
                <span>Autorizo o uso dos meus dados para esta experiência e contatos da Waves Plus/CBS.</span>
              </label>

              <Primary type="submit">
                Entrar na onda <ArrowRight size={20} />
              </Primary>
            </form>
          </Screen>
        )}

        {screen === "moldura" && (
          <Screen>
            <Brand />
            <Header eyebrow="MOLDURA OFICIAL" title="Sua foto vai ficar assim">
              A moldura será aplicada automaticamente.
            </Header>

            <div className="frame-card selected">
              <img src={FRAME_URL} alt="Moldura oficial Foto na Onda" />
              <span className="selected-dot"><Check size={17} /></span>
            </div>

            <Primary onClick={() => setScreen("camera")}>
              Continuar <ArrowRight size={20} />
            </Primary>
          </Screen>
        )}

        {screen === "camera" && (
          <Screen className="camera-screen">
            <div className="camera-stage">
              <video ref={videoRef} playsInline muted />
              <img className="camera-overlay" src={FRAME_URL} alt="" />
              {cameraError && <div className="camera-error">{cameraError}</div>}
            </div>

            <p className="camera-hint">Centralize o rosto e sorria. 😄</p>
            <button className="capture" aria-label="Tirar foto" onClick={capturePhoto} />
            <button className="text-button" onClick={() => setScreen("moldura")}>Voltar</button>
            <canvas ref={canvasRef} hidden />
          </Screen>
        )}

        {screen === "processing" && (
          <Screen className="processing">
            <div className="spinner-wave" />
            <h2>Preparando sua foto...</h2>
            <p>Estamos aplicando a moldura oficial.</p>
            <div className="progress"><span /></div>
          </Screen>
        )}

        {screen === "resultado" && (
          <Screen>
            <Brand />
            <Header eyebrow="FOTO PRONTA" title="Sua foto ficou pronta">
              Agora é só baixar ou compartilhar.
            </Header>

            <div className="result-card">
              <img src={finalPhoto || photo} alt="Foto final" />
            </div>

            <div className="button-grid">
              <Primary onClick={downloadPhoto}><Download size={19} /> Baixar</Primary>
              <Primary onClick={sharePhoto}><Share2 size={19} /> Compartilhar</Primary>
            </div>

            <button className="secondary" onClick={() => setScreen("camera")}>
              <RotateCcw size={18} /> Tirar outra
            </button>

            <button className="text-button" onClick={() => setScreen("obrigado")}>
              Finalizar
            </button>
          </Screen>
        )}

        {screen === "obrigado" && (
          <Screen className="thanks">
            <div className="check"><Check size={44} /></div>
            <p className="eyebrow">TUDO CERTO</p>
            <h2>Obrigado!</h2>
            <p>Você faz parte da Onda da Produtividade.</p>
            <strong><Instagram size={18} /> @wavesplusoficial</strong>
            <Primary onClick={resetApp}>Voltar ao início</Primary>
          </Screen>
        )}
      </section>
    </main>
  );
}

function Screen({ children, className = "" }) {
  return <div className={`screen ${className}`}>{children}</div>;
}

function Header({ eyebrow, title, children }) {
  return (
    <header className="header">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{children}</p>
    </header>
  );
}

function Field({ icon, ...props }) {
  return (
    <label className="field">
      {icon}
      <input {...props} />
    </label>
  );
}

function Primary({ children, ...props }) {
  return <button className="primary" {...props}>{children}</button>;
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-placeholder waves">WAVES PLUS</div>
      <div className="divider" />
      <div className="brand-placeholder expo">EXPOCONSTRUIR</div>
      <div className="divider" />
      <div className="brand-placeholder cbs">CBS</div>
    </div>
  );
}
