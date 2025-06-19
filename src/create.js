// Setup create form and populate dropdowns
async function populateSelect(id, endpoint) {
  const select = document.getElementById(id);
  if (!select) return;
  try {
    const resp = await fetch(`${API_BASE_URL}${endpoint}`);
    if (resp.ok) {
      const items = await resp.json();
      const options = items
        .map(i => {
          const label = i.name || i.fullName || i.title || i.username || i.email || i.id;
          return `<option value="${i.id}">${label}</option>`;
        })
        .join('');
      select.innerHTML = '<option value="">Seleccione...</option>' + options;
    } else {
      console.error(`Error ${resp.status} cargando ${endpoint}`);
    }
  } catch (err) {
    console.error('Error cargando opciones', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  populateSelect('areaId', '/api/Area');
  populateSelect('user', '/api/User');
  populateSelect('typeId', '/api/ProjectType');

  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const form = document.getElementById('createForm');
      if (form) form.reset();

      const result = document.getElementById('result');
      if (result) result.innerHTML = '';

      clearBtn.blur(); // Evita que quede resaltado
    });
  }

  // 🔽 Asegura que ningún botón quede "clickeado" tras volver o recargar
  setTimeout(() => document.activeElement?.blur(), 0);

  setupForm({
    formId: 'createForm',
    endpoint: `${API_BASE_URL}/api/Project`,
    method: 'POST',
    confirmBeforeSubmit: true, // Confirmación antes de enviar
    renderResult: (data, div) => {
      const projectId = data.id; // Obtenemos el ID del proyecto creado
      div.innerHTML =
        '<a href="view.html?id=' + encodeURIComponent(projectId) + '" ' +
        'class="btn btn-primary w-100 d-flex align-items-center justify-content-center" ' +
        'style="border-radius: 24px; height: 48px; margin-top: 1rem;">' +
        '<i class="bi bi-eye me-2"></i>' +
        'Ver Proyecto' +
        '</a>';
    }
  });
});
