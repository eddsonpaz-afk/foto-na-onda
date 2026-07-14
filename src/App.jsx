import { useState } from "react";
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
} from "lucide-react";

const initialForm = {
  nome: "",
  whatsapp: "",
  email: "",
  empresa: "",
  cidade: "",
  estado: "",
  lgpd: false,
};

function App() {
  const [screen, setScreen] = useState("splash");
  const [form, setForm] = useState(initialForm);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function submitForm(event) {
    event.preventDefault();

    if (!form.lgpd) {
      alert("Você precisa aceitar a política de privacidade.");
      return;
    }

    setScreen("moldura");
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="phone">
        {screen === "splash" && (
          <div className="screen splash-screen">
            <Brand />

            <div className="hero-wave">
              <div className="hero-wave-ring" />
            </div>

            <div className="splash-content">
              <p className="eyebrow">EXPOCONSTRUIR 2026</p>

              <h1>
                FOTO NA
                <strong>ONDA</strong>
                <span>DA PRODUTIVIDADE</span>
              </h1>

              <p className="description">
                Entre na onda, tire sua foto e mostre que você faz parte do
                movimento.
              </p>

              <button
                className="primary-button"
                onClick={() => setScreen("cadastro")}
              >
                Começar
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {screen === "cadastro" && (
          <div className="screen form-screen">
            <Brand />

            <header className="screen-header">
              <p className="eyebrow">CADASTRO RÁPIDO</p>
              <h2>Entre na Onda</h2>
              <p>Preencha seus dados para continuar.</p>
            </header>

            <form className="lead-form" onSubmit={submitForm}>
              <Field icon={<User size={18} />}>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={updateField}
                  placeholder="Nome completo"
                  required
                />
              </Field>

              <Field icon={<Smartphone size={18} />}>
                <input
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={updateField}
                  placeholder="WhatsApp"
                  inputMode="tel"
                  required
                />
              </Field>

              <Field icon={<Mail size={18} />}>
                <input
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="E-mail"
                  inputMode="email"
                  required
                />
              </Field>

              <Field icon={<User size={18} />}>
                <input
                  name="empresa"
                  value={form.empresa}
                  onChange={updateField}
                  placeholder="Empresa"
                />
              </Field>

              <Field icon={<MapPin size={18} />}>
                <input
                  name="cidade"
                  value={form.cidade}
                  onChange={updateField}
                  placeholder="Cidade"
                  required
                />
              </Field>

              <Field icon={<MapPin size={18} />}>
                <input
                  name="estado"
                  value={form.estado}
                  onChange={updateField}
                  placeholder="Estado"
                  required
                />
              </Field>

              <label className="privacy">
                <input
                  type="checkbox"
                  name="lgpd"
                  checked={form.lgpd}
                  onChange={updateField}
                />

                <span>
                  Li e aceito os termos de uso e a política de privacidade.
                </span>
              </label>

              <button className="primary-button" type="submit">
                Entrar na onda
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        )}

        {screen === "moldura" && (
          <div className="screen frame-screen">
            <Brand />

            <header className="screen-header centered">
              <p className="eyebrow">MOLDURA OFICIAL</p>
              <h2>Escolha sua moldura</h2>
              <p>Esta será aplicada à sua foto.</p>
            </header>

            <div className="frame-preview">
              <div className="frame-placeholder">
                <div className="frame-wave" />

                <div className="frame-copy">
                  <Instagram size={17} />
                  <span>@wavesplusoficial</span>
                </div>

                <strong>ENTRE NA ONDA DA PRODUTIVIDADE!</strong>

                <div className="selected-badge">
                  <Check size={18} />
                </div>
              </div>
            </div>

            <button
              className="primary-button"
              onClick={() => setScreen("camera")}
            >
              Continuar
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {screen === "camera" && (
          <div className="screen camera-screen">
            <Brand />

            <div className="camera-preview">
              <div className="camera-message">
                <Camera size={38} />
                <h2>A câmera entra aqui</h2>
                <p>
                  Na próxima etapa vamos ligar a câmera real do seu celular.
                </p>
              </div>

              <div className="camera-wave" />

              <div className="camera-profile">
                <Instagram size={17} />
                @wavesplusoficial
              </div>
            </div>

            <button
              className="capture-button"
              aria-label="Tirar foto"
              onClick={() => setScreen("processing")}
            />

            <button
              className="secondary-button"
              onClick={() => setScreen("moldura")}
            >
              Voltar
            </button>
          </div>
        )}

        {screen === "processing" && (
          <div className="screen processing-screen">
            <div className="processing-wave" />

            <h2>Preparando sua foto...</h2>

            <p>Estamos juntando a imagem com a moldura oficial.</p>

            <div className="progress">
              <span />
            </div>

            <button
              className="primary-button"
              onClick={() => setScreen("resultado")}
            >
              Ver resultado
            </button>
          </div>
        )}

        {screen === "resultado" && (
          <div className="screen result-screen">
            <Brand />

            <header className="screen-header centered">
              <p className="eyebrow">FOTO PRONTA</p>
              <h2>Sua foto ficou incrível!</h2>
            </header>

            <div className="result-photo">
              <div className="result-wave" />
              <span>Sua foto aparecerá aqui</span>
            </div>

            <div className="button-grid">
              <button className="primary-button">
                <Download size={19} />
                Baixar
              </button>

              <button
                className="primary-button"
                onClick={() => setScreen("compartilhar")}
              >
                <Share2 size={19} />
                Compartilhar
              </button>
            </div>

            <button
              className="secondary-button"
              onClick={() => setScreen("camera")}
            >
              <RotateCcw size={18} />
              Tirar outra
            </button>
          </div>
        )}

        {screen === "compartilhar" && (
          <div className="screen share-screen">
            <Brand />

            <header className="screen-header centered">
              <p className="eyebrow">COMPARTILHE</p>
              <h2>Mostre que você entrou na onda</h2>
            </header>

            <div className="share-list">
              <button>
                <Instagram />
                Instagram Stories
              </button>

              <button>
                <Smartphone />
                WhatsApp
              </button>

              <button>
                <Share2 />
                Mais opções
              </button>
            </div>

            <button
              className="primary-button"
              onClick={() => setScreen("obrigado")}
            >
              Finalizar
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {screen === "obrigado" && (
          <div className="screen thanks-screen">
            <div className="check-circle">
              <Check size={45} />
            </div>

            <p className="eyebrow">TUDO CERTO</p>

            <h2>Obrigado!</h2>

            <p>
              Você faz parte da onda que está construindo o futuro.
            </p>

            <strong>@wavesplusoficial</strong>

            <button
              className="primary-button"
              onClick={() => {
                setForm(initialForm);
                setScreen("splash");
              }}
            >
              Voltar ao início
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function Field({ icon, children }) {
  return (
    <label className="field">
      {icon}
      {children}
    </label>
  );
}

function Brand() {
  return (
    <div className="brand">
      <div className="fake-logo waves-logo">WAVES PLUS</div>
      <span />
      <div className="fake-logo expo-logo">ExpoConstruir</div>
      <span />
      <div className="fake-logo cbs-logo">CBS</div>
    </div>
  );
}

export default App;
