import "./globals.css";

export const metadata = {
  title: "Foto na Onda",
  description: "Experiência Foto na Onda da Produtividade — ExpoConstruir 2026",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
