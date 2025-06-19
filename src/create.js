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
      document.getElementById('createForm').reset();
      const result = document.getElementById('result');
      if (result) result.innerHTML = '';
    });
  }

  setupForm({
    formId: 'createForm',
    endpoint: `${API_BASE_URL}/api/Project`,
    method: 'POST',
    confirmBeforeSubmit: true, // ✅ aquí agregás la propiedad
    renderResult: (data, div) => {
      div.innerHTML =
        '<div class="alert alert-success button-style d-flex align-items-center">' +
        '<i class="bi bi-check-circle-fill me-2"></i>' +
        'Proyecto creado correctamente' +
        '</div>';
    }
  });
});
