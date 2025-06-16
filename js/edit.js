function renderDetails(obj) {
  const items = Object.entries(obj)
    .map(([k, v]) => `<li class="list-group-item"><strong>${k}:</strong> ${v}</li>`)
    .join('');
  return `<div class="card mt-3"><ul class="list-group list-group-flush">${items}</ul></div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of params.entries()) {
    const input = document.getElementById(key);
    if (input) {
      input.value = value;
    }
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
          div.innerHTML += renderDetails(project);
        }
      } catch {}
    }
  });
});
