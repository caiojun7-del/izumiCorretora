import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getFirestore, collection, onSnapshot, orderBy, query } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const grid = document.getElementById('propertyGrid');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const resultCount = document.getElementById('resultCount');

const cityFilter = document.getElementById('cityFilter');
const typeFilter = document.getElementById('typeFilter');
const minPriceFilter = document.getElementById('minPriceFilter');
const maxPriceFilter = document.getElementById('maxPriceFilter');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

let allProperties = [];

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function normalizeWhatsapp(number) {
  return String(number || '').replace(/\D/g, '');
}

function buildWhatsAppLink(property) {
  const number = normalizeWhatsapp(property.whatsappNumber);
  const message = encodeURIComponent(`Olá! Tenho interesse no imóvel "${property.title}" da Izumi Corretora. Pode me passar mais informações?`);
  return `https://wa.me/${number}?text=${message}`;
}

function propertyMatchesFilters(property) {
  const city = cityFilter.value.trim().toLowerCase();
  const type = typeFilter.value;
  const minPrice = Number(minPriceFilter.value || 0);
  const maxPrice = Number(maxPriceFilter.value || Infinity);

  const cityOk = !city || String(property.city || '').toLowerCase().includes(city);
  const typeOk = !type || property.type === type;
  const price = Number(property.price || 0);
  const minOk = price >= minPrice;
  const maxOk = price <= maxPrice;

  return cityOk && typeOk && minOk && maxOk;
}

function renderProperties() {
  const filtered = allProperties.filter(propertyMatchesFilters);
  grid.innerHTML = '';
  loadingState.classList.add('hidden');

  resultCount.textContent = `${filtered.length} imóvel(is)`;

  if (!filtered.length) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  filtered.forEach((property) => {
    const firstImage = property.images?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';
    const imagesCount = property.images?.length || 0;
    const features = [
      property.bedrooms ? `${property.bedrooms} quarto(s)` : null,
      property.bathrooms ? `${property.bathrooms} banheiro(s)` : null,
      property.area ? `${property.area} m²` : null,
      property.type || null
    ].filter(Boolean);

    const article = document.createElement('article');
    article.className = 'property-card';
    article.innerHTML = `
      <div class="property-media">
        <img src="${firstImage}" alt="${property.title}">
        <div class="image-count">${imagesCount} foto(s)</div>
      </div>
      <div class="property-body">
        <p class="price">${currency.format(Number(property.price || 0))}</p>
        <h3 class="property-title">${property.title}</h3>
        <div class="meta">${property.city || ''}</div>
        <div class="feature-row">
          ${features.map((feature) => `<span class="feature-pill">${feature}</span>`).join('')}
        </div>
        <p class="muted">${property.description ? property.description.slice(0, 120) + (property.description.length > 120 ? '...' : '') : 'Entre em contato para mais detalhes sobre este imóvel.'}</p>
        <div class="property-actions">
          <a class="whatsapp-btn" href="${buildWhatsAppLink(property)}" target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          <button class="gallery-btn" type="button">Ver imóvel</button>
        </div>
      </div>
    `;

    const galleryBtn = article.querySelector('.gallery-btn');
    galleryBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      openPropertyModal(property);
    });

    article.addEventListener('click', (event) => {
      if (event.target.closest('.whatsapp-btn') || event.target.closest('.gallery-btn')) return;
      openPropertyModal(property);
    });

    grid.appendChild(article);
  });
}

function openPropertyModal(property) {
  const firstImage = property.images?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';
  const images = property.images?.length ? property.images : [firstImage];
  let index = 0;

  const modal = document.createElement('div');
  modal.className = 'modal show';

  const render = () => {
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-image-wrap">
          <img src="${images[index]}" alt="${property.title}" />
        </div>
        <div class="modal-content">
          <div class="modal-header">
            <p class="price">${currency.format(Number(property.price || 0))}</p>
            <h3 class="property-title">${property.title}</h3>
            <p class="meta">${property.city || ''}${property.city && property.type ? ' • ' : ''}${property.type || ''}</p>
          </div>
          <div class="modal-body">
            <p>${property.description || 'Sem descrição disponível.'}</p>
          </div>
          <div class="modal-footer">
            <button class="secondary-btn" ${index === 0 ? 'disabled' : ''} data-action="prev">Anterior</button>
            <div>${index + 1} / ${images.length}</div>
            <button class="secondary-btn" ${index === images.length - 1 ? 'disabled' : ''} data-action="next">Próxima</button>
          </div>
          <div class="modal-actions">
            <a class="whatsapp-btn" href="${buildWhatsAppLink(property)}" target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          </div>
        </div>
      </div>
    `;
  };

  render();

  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.remove();
    const action = event.target.dataset.action;
    if (action === 'prev' && index > 0) { index -= 1; render(); }
    if (action === 'next' && index < images.length - 1) { index += 1; render(); }
  });

  document.body.appendChild(modal);
}

[cityFilter, typeFilter, minPriceFilter, maxPriceFilter].forEach((element) => {
  element.addEventListener('input', renderProperties);
  element.addEventListener('change', renderProperties);
});

clearFiltersBtn.addEventListener('click', () => {
  cityFilter.value = '';
  typeFilter.value = '';
  minPriceFilter.value = '';
  maxPriceFilter.value = '';
  renderProperties();
});

const propertiesRef = collection(db, 'properties');
const propertiesQuery = query(propertiesRef, orderBy('createdAt', 'desc'));

onSnapshot(propertiesQuery, (snapshot) => {
  allProperties = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  renderProperties();
}, (error) => {
  console.error(error);
  loadingState.textContent = 'Erro ao carregar imóveis. Verifique a configuração do Firebase.';
  resultCount.textContent = 'Erro';
});
