import { apiGet, apiPost, apiPut, apiDelete, ApiError } from './api.js';

const form = document.getElementById('form-usuario');
const lista = document.getElementById('lista-usuarios');
const mensagem = document.getElementById('mensagem-erro');

function mostrarErro(err) {
  if (!mensagem) return;
  if (err.name === 'AbortError') {
    return;
  }
  if (err instanceof ApiError) {
    if (err.status === 404) {
      mensagem.textContent = 'Recurso não encontrado';
      return;
    }
    if (err.status === 500) {
      mensagem.textContent = 'Erro no servidor';
      return;
    }
  }
  if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
    mensagem.textContent = 'Falha de rede';
    return;
  }
  mensagem.textContent = err.message || 'Erro inesperado';
}

async function carregarUsuarios(signal) {
  try {
    if (mensagem) mensagem.textContent = '';
    const usuarios = await apiGet('/users', { signal });
    renderizarLista(usuarios || []);
  } catch (err) {
    if (err.name === 'AbortError') {
      return;
    }
    mostrarErro(err);
  }
}

function renderizarLista(usuarios) {
  if (!lista) return;
  lista.innerHTML = '';
  usuarios.forEach((usuario) => {
    const li = document.createElement('li');
    li.dataset.id = usuario.id;
    li.innerHTML = `
      <span>${usuario.name} (${usuario.email})</span>
      <button class="editar" data-id="${usuario.id}">Editar</button>
      <button class="excluir" data-id="${usuario.id}">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

if (lista) {
  const controller = new AbortController();
  carregarUsuarios(controller.signal);
  window.addEventListener('beforeunload', () => controller.abort(), { once: true });
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = form.dataset.editId;
    const dados = {
      name: form.name.value,
      email: form.email.value,
    };
    try {
      if (mensagem) mensagem.textContent = '';
      if (id) {
        await apiPut(`/users/${id}`, dados);
      } else {
        await apiPost('/users', dados, { headers: { 'X-Custom': 'aula07' } });
      }
      form.reset();
      delete form.dataset.editId;
      const controller = new AbortController();
      carregarUsuarios(controller.signal);
    } catch (err) {
      mostrarErro(err);
    }
  });
}

if (lista) {
  lista.addEventListener('click', async (e) => {
    const alvo = e.target;
    if (alvo.classList.contains('excluir')) {
      const id = alvo.dataset.id;
      try {
        if (mensagem) mensagem.textContent = '';
        await apiDelete(`/users/${id}`);
        const controller = new AbortController();
        carregarUsuarios(controller.signal);
      } catch (err) {
        mostrarErro(err);
      }
    }
    if (alvo.classList.contains('editar')) {
      const id = alvo.dataset.id;
      try {
        const usuario = await apiGet(`/users/${id}`);
        if (form && usuario) {
          form.name.value = usuario.name || '';
          form.email.value = usuario.email || '';
          form.dataset.editId = id;
        }
      } catch (err) {
        mostrarErro(err);
      }
    }
  });
}
