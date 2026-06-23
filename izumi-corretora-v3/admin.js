
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
import { cloudinaryConfig } from './cloudinary-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginCard = document.getElementById('loginCard');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');
const propertyForm = document.getElementById('propertyForm');
const formMessage = document.getElementById('formMessage');
const adminPropertyList = document.getElementById('adminPropertyList');
const formTitle = document.getElementById('formTitle');
const resetFormBtn = document.getElementById('resetFormBtn');
const uploadImagesBtn = document.getElementById('uploadImagesBtn');
const uploadedImagesContainer = document.getElementById('uploadedImages');

const fields = {
  propertyId: document.getElementById('propertyId'),
  title: document.getElementById('title'),
  type: document.getElementById('type'),
  city: document.getElementById('city'),
  price: document.getElementById('price'),
  bedrooms: document.getElementById('bedrooms'),
  bathrooms: document.getElementById('bathrooms'),
  area: document.getElementById('area'),
  whatsappNumber: document.getElementById('whatsappNumber'),
  description: document.getElementById('description')
};

let uploadedImages = [];
let propertiesCache = [];

function setMessage(target, text, isError = false) {
  target.textContent = text;
  target.style.color = isError ? '#c62828' : '#4f5f73';
}

function renderUploadedImages() {
  uploadedImagesContainer.innerHTML = '';
  uploadedImages.forEach((url, index) => {
    const item = document.createElement('div');
    item.className = 'uploaded-item';
    item.draggable = true;
    item.dataset.index = index;
    item.innerHTML = `
      <img src="${url}" alt="Imagem enviada ${index + 1}">
      <button type="button" class="remove-image-btn" data-index="${index}">×</button>
    `;
    uploadedImagesContainer.appendChild(item);
  });
  setupDragAndDrop();
}

uploadedImagesContainer.addEventListener('click', (event) => {
  const button = event.target.closest('.remove-image-btn');
  if (!button) return;
  const index = Number(button.dataset.index);
  uploadedImages.splice(index, 1);
  renderUploadedImages();
});

function setupDragAndDrop() {
  const items = uploadedImagesContainer.querySelectorAll('.uploaded-item');
  
  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.target);
      item.classList.add('dragging');
    });
    
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      items.forEach(i => i.classList.remove('drag-over'));
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      item.classList.add('drag-over');
    });
    
    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });
    
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggingItem = uploadedImagesContainer.querySelector('.dragging');
      if (draggingItem && draggingItem !== item) {
        const draggingIndex = Number(draggingItem.dataset.index);
        const targetIndex = Number(item.dataset.index);
        
        const temp = uploadedImages[draggingIndex];
        uploadedImages[draggingIndex] = uploadedImages[targetIndex];
        uploadedImages[targetIndex] = temp;
        
        renderUploadedImages();
      }
    });
  });
}

function createCloudinaryWidget() {
  if (!window.cloudinary) {
    setMessage(formMessage, 'Cloudinary não carregou. Verifique a internet.', true);
    return null;
  }

  return window.cloudinary.createUploadWidget({
    cloudName: cloudinaryConfig.cloudName,
    uploadPreset: cloudinaryConfig.uploadPreset,
    folder: cloudinaryConfig.folder || 'izumi-corretora',
    multiple: true,
    maxFiles: 10,
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    sources: ['local', 'camera', 'google_drive'],
    resourceType: 'image'
  }, (error, result) => {
    if (error) {
      console.error(error);
      setMessage(formMessage, 'Erro no upload das imagens.', true);
      return;
    }

    if (result && result.event === 'success') {
      uploadedImages.push(result.info.secure_url);
      renderUploadedImages();
      setMessage(formMessage, 'Imagem enviada com sucesso.');
    }
  });
}

const cloudinaryWidget = createCloudinaryWidget();

uploadImagesBtn.addEventListener('click', () => {
  if (!cloudinaryWidget) return;
  cloudinaryWidget.open();
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = 'Entrando...';
  try {
    await signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value);
    loginMessage.textContent = '';
  } catch (error) {
    console.error(error);
    setMessage(loginMessage, 'Não foi possível entrar. Verifique email e senha.', true);
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
});

function resetForm() {
  propertyForm.reset();
  fields.propertyId.value = '';
  uploadedImages = [];
  renderUploadedImages();
  formTitle.textContent = 'Novo imóvel';
  resetFormBtn.classList.add('hidden');
  setMessage(formMessage, '');
}

resetFormBtn.addEventListener('click', resetForm);

async function loadProperties() {
  adminPropertyList.innerHTML = '<div class="state-box">Carregando imóveis...</div>';
  const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  propertiesCache = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

  if (!propertiesCache.length) {
    adminPropertyList.innerHTML = '<div class="state-box">Nenhum imóvel cadastrado ainda.</div>';
    return;
  }

  adminPropertyList.innerHTML = '';
  propertiesCache.forEach((property) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'admin-item';
    wrapper.innerHTML = `
      <div class="admin-item-main">
        <img class="admin-thumb" src="${property.images?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'}" alt="${property.title}">
        <div>
          <strong>${property.title}</strong>
          <div class="muted">${property.city || ''} • ${property.type || ''}</div>
          <div class="muted">R$ ${Number(property.price || 0).toLocaleString('pt-BR')}</div>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="secondary-btn" data-action="edit" data-id="${property.id}">Editar</button>
        <button class="danger-btn" data-action="delete" data-id="${property.id}">Excluir</button>
      </div>
    `;
    adminPropertyList.appendChild(wrapper);
  });
}

adminPropertyList.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const id = button.dataset.id;
  const property = propertiesCache.find((item) => item.id === id);
  if (!property) return;

  if (button.dataset.action === 'edit') {
    fields.propertyId.value = property.id;
    fields.title.value = property.title || '';
    fields.type.value = property.type || '';
    fields.city.value = property.city || '';
    fields.price.value = property.price || '';
    fields.bedrooms.value = property.bedrooms || '';
    fields.bathrooms.value = property.bathrooms || '';
    fields.area.value = property.area || '';
    fields.whatsappNumber.value = property.whatsappNumber || '';
    fields.description.value = property.description || '';
    uploadedImages = [...(property.images || [])];
    renderUploadedImages();
    formTitle.textContent = 'Editar imóvel';
    resetFormBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (button.dataset.action === 'delete') {
    const confirmed = window.confirm(`Excluir o imóvel "${property.title}"?`);
    if (!confirmed) return;
    await deleteDoc(doc(db, 'properties', property.id));
    setMessage(formMessage, 'Imóvel excluído com sucesso.');
    await loadProperties();
    if (fields.propertyId.value === property.id) resetForm();
  }
});

propertyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage(formMessage, 'Salvando imóvel...');

  const data = {
    title: fields.title.value.trim(),
    type: fields.type.value,
    city: fields.city.value.trim(),
    price: Number(fields.price.value || 0),
    bedrooms: Number(fields.bedrooms.value || 0),
    bathrooms: Number(fields.bathrooms.value || 0),
    area: Number(fields.area.value || 0),
    whatsappNumber: fields.whatsappNumber.value.trim() || "5511945211203",
    description: fields.description.value.trim(),
    images: uploadedImages,
    updatedAt: serverTimestamp()
  };

  try {
    if (fields.propertyId.value) {
      await updateDoc(doc(db, 'properties', fields.propertyId.value), data);
      setMessage(formMessage, 'Imóvel atualizado com sucesso.');
    } else {
      await addDoc(collection(db, 'properties'), {
        ...data,
        createdAt: serverTimestamp()
      });
      setMessage(formMessage, 'Imóvel cadastrado com sucesso.');
    }
    resetForm();
    await loadProperties();
  } catch (error) {
    console.error(error);
    setMessage(formMessage, 'Erro ao salvar imóvel. Confira Firebase e Cloudinary.', true);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginCard.classList.add('hidden');
    dashboard.classList.remove('hidden');
    await loadProperties();
  } else {
    dashboard.classList.add('hidden');
    loginCard.classList.remove('hidden');
  }
});
