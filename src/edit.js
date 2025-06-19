async function populateProjectDropdown() {
  const list = document.getElementById('projectDropdown');
  if (!list) return;
  try {
    const resp = await fetch(`${API_BASE_URL}/api/Project`);
    if (resp.ok) {
      const projects = await resp.json();
      list.innerHTML = projects
        .map(p => `<li><a class="dropdown-item" data-id="${p.id}" data-title="${p.title || p.name || ''}" href="#"><span class='dropdown-title'>${p.title || p.name || p.id}</span><span class='dropdown-id'>${p.id}</span></a></li>`)
        .join('');
      list.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          const id = a.getAttribute('data-id');
          const input = document.getElementById('id');
          if (input) input.value = id;
        });
      });
    }
  } catch (err) {
    console.error('Error cargando proyectos', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of params.entries()) {
    const input = document.getElementById(key);
    if (input) {
      input.value = value;
    }
  }

  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.getElementById('editForm').reset();
      const result = document.getElementById('result');
      if (result) result.innerHTML = '';
    });
  }

  populateProjectDropdown();

  setupForm({
    formId: 'editForm',
    endpoint: `${API_BASE_URL}/api/Project/{id}`,
    method: 'PATCH',
    pathParams: ['id'],
    renderResult: async (data, div) => {
      const id = document.getElementById('id').value;
      div.innerHTML =
        '<button type="button" class="btn w-100 btn-success d-flex align-items-center justify-content-center" style="margin-top: 1rem; cursor: default;" disabled>' +
        '<i class="bi bi-pencil-fill me-2"></i>' +
        'Proyecto actualizado' +
        '</button>';
      try {
        const resp = await fetch(`${API_BASE_URL}/api/Project/${id}`);
        if (resp.ok) {
          const project = await resp.json();
          div.innerHTML += renderProjectCard(project);
        }
      } catch {}
    }
  });
});
