import "./globals.css";

export const metadata = {
  title: "Foto na Onda",
  description: "Foto na Onda da Produtividade — Waves Plus e CBS"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
