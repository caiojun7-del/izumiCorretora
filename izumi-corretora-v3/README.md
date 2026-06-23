# Izumi Corretora v3

Versão com:
- catálogo público
- painel admin com login via Firebase Authentication
- imóveis salvos no Firestore
- upload automático de imagens via Cloudinary Upload Widget

## 1. Firebase
Você ainda usa o Firebase para:
- login do administrador
- banco de dados dos imóveis

### Configurar
1. Renomeie `firebase-config.example.js` para `firebase-config.js`
2. Cole a configuração do seu app web do Firebase
3. Ative no Firebase:
   - Authentication > Email/Password
   - Firestore Database
4. Publique as regras do arquivo `firestore.rules`

## 2. Cloudinary
Você usa o Cloudinary só para imagens.

### Configurar
1. Crie conta no Cloudinary
2. Copie seu `cloud name` no painel
3. Vá em **Settings > Upload**
4. Crie um **unsigned upload preset**
5. Renomeie `cloudinary-config.example.js` para `cloudinary-config.js`
6. Preencha assim:

```js
export const cloudinaryConfig = {
  cloudName: "SEU_CLOUD_NAME",
  uploadPreset: "SEU_UNSIGNED_UPLOAD_PRESET",
  folder: "izumi-corretora"
};
```

## 3. Testar
- Rode com Live Server no VS Code
- Abra `admin.html`
- Faça login
- Clique em **Enviar fotos**
- Escolha as imagens
- Salve o imóvel

## 4. Publicar
Publique na Netlify depois de testar localmente.

## Observações
- Limite do widget: 10 imagens por imóvel
- Formatos aceitos: jpg, jpeg, png, webp
- O site mostra botão do WhatsApp em cada imóvel com o número salvo no cadastro
