# Izumi Corretora v3

Site de catálogo imobiliário com painel administrativo.

## Sobre o projeto
Este projeto exibe um catálogo público de imóveis e oferece um painel admin para cadastrar, editar e excluir ofertas.

Funcionalidades principais:
- Página pública com lista de imóveis e filtros por cidade, tipo e preço
- Detalhes do imóvel em modal com galeria de fotos
- Botão de contato via WhatsApp para cada imóvel
- Painel administrativo com login via Firebase Authentication
- Cadastro de imóveis com fotos enviadas diretamente para Cloudinary
- Armazenamento dos dados de imóveis no Firestore

## Estrutura do projeto
- `index.html` — página pública do catálogo
- `admin.html` — painel administrativo
- `app.js` — lógica do site público
- `admin.js` — lógica do painel admin
- `styles.css` — estilos do site e do painel
- `firebase-config.js` — configuração do Firebase (não rastreada no repositório)
- `cloudinary-config.js` — configuração do Cloudinary (não rastreada no repositório)
- `firestore.rules` — regras de segurança do Firestore

## Requisitos
- Conta Firebase ativa
- Firestore habilitado
- Firebase Authentication habilitado com método Email/Senha
- Conta Cloudinary ativa
- Upload preset unsigned criado no Cloudinary

## Configuração

### 1. Firebase
1. Crie um projeto no Firebase.
2. No painel do Firebase, adicione um app Web.
3. Copie as credenciais e cole em `firebase-config.js`:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

4. Ative os serviços:
   - Authentication > Sign-in method > Email/Password
   - Firestore Database

5. Publique as regras do Firestore usando `firestore.rules`.

### 2. Cloudinary
1. Crie conta no Cloudinary.
2. Copie o `cloud name` do painel.
3. Crie um upload preset unsigned em **Settings > Upload**.
4. Crie `cloudinary-config.js` com:

```js
export const cloudinaryConfig = {
  cloudName: "SEU_CLOUD_NAME",
  uploadPreset: "SEU_UNSIGNED_UPLOAD_PRESET",
  folder: "izumi-corretora"
};
```

## Como usar

### Rodar localmente
1. Abra a pasta do projeto no VS Code.
2. Use uma extensão como Live Server ou abra `index.html` / `admin.html` diretamente no navegador.
3. No painel admin (`admin.html`), faça login com o usuário criado no Firebase.
4. Cadastre imóveis, envie fotos e salve.

### Publicação
- O projeto pode ser hospedado em serviços estáticos como Netlify, Vercel ou GitHub Pages.
- Garanta que `firebase-config.js` e `cloudinary-config.js` estejam configurados corretamente no deploy.

## Observações importantes
- O painel admin envia imagens diretamente para o Cloudinary.
- Cada imóvel pode ter até 10 imagens.
- Formatos aceitos: `jpg`, `jpeg`, `png`, `webp`.
- O número do WhatsApp do imóvel é usado no botão de contato.

## Dicas
- Crie um usuário admin no Firebase Authentication antes de usar `admin.html`.
- Use `firestore.rules` para proteger a coleção `properties`.
- Teste a publicação com um imóvel cadastrado para validar o catálogo público.
