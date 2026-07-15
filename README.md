# Foto na Onda V4 — mockup final

Versão final preparada para GitHub e Vercel.

## Funcionalidades mantidas

- câmera traseira nativa;
- escolha pela galeria;
- arrastar a foto;
- aumentar e diminuir;
- centralizar;
- cadastro;
- salvamento no Google Drive;
- registro na Planilha Google;
- compartilhamento;
- download.

## Mockup final

Arquivo:

`public/mockup-final.png`

O aplicativo agora carrega o mockup diretamente do próprio projeto:

```js
const MOCKUP_URL = "/mockup-final.png";
```

Isso elimina a dependência do Google Drive e problemas de cache.

## Publicação

1. Extraia o ZIP.
2. Envie todo o conteúdo para o repositório no GitHub.
3. Confirme o commit.
4. Aguarde o Vercel concluir o novo deploy.
