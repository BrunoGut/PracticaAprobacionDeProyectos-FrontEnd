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

  setupForm({
    formId: 'editForm',
    endpoint: `${API_BASE_URL}/api/Project/{id}`,
    method: 'PATCH',
    pathParams: ['id'],
    renderResult: async (data, div) => {
      const id = document.getElementById('id').value;
      div.innerHTML =
        '<div class="alert alert-success d-flex align-items-center">' +
        '<i class="bi bi-pencil-fill me-2"></i>' +
        'Proyecto actualizado' +
        '</div>';
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
