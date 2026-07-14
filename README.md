# Foto na Onda V2.2 — câmera traseira corrigida

Correções desta versão:

- solicita a câmera traseira com `facingMode: environment`;
- tenta primeiro o modo exato e depois usa fallback compatível;
- identifica todas as câmeras disponíveis após a permissão;
- alterna pela câmera física usando `deviceId`, em vez de depender apenas do navegador;
- funciona melhor em Android, iPhone e aparelhos com várias lentes;
- mantém zoom, reposicionamento e moldura corrigida da V2.1.

Substitua os arquivos do repositório pelos arquivos desta versão e faça um novo commit.
