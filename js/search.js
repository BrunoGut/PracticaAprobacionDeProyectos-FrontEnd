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

document.addEventListener('DOMContentLoaded', async () => {
  await populateSelect('state', '/api/ProjectState');
  await populateSelect('applicant', '/api/User');
  await populateSelect('approver', '/api/User');
  setupForm({
    formId: 'searchForm',
    endpoint: `${API_BASE_URL}/api/Project`,
    method: 'GET',
    renderResult: (data, div) => {
      const projects = Array.isArray(data) ? data : [data];

      function renderDetails(obj) {
        const items = Object.entries(obj)
          .map(([k, v]) => `<li class="list-group-item"><strong>${k}:</strong> ${v}</li>`)
          .join('');
        return `<ul class="list-group list-group-flush">${items}</ul>`;
      }

      function actionButtons(id) {
        if (!id) return '';
        return (
          '<div class="d-flex justify-content-between mt-2">' +
          '<div>' +
          `<a href="approve.html?proposalId=${encodeURIComponent(id)}&status=2" class="btn btn-success me-1">Aprobar</a>` +
          `<a href="approve.html?proposalId=${encodeURIComponent(id)}&status=3" class="btn btn-danger me-1">Rechazar</a>` +
          `<a href="approve.html?proposalId=${encodeURIComponent(id)}&status=4" class="btn btn-warning">Observar</a>` +
          '</div>' +
          `<a href="edit.html?id=${encodeURIComponent(id)}" class="btn btn-primary">Editar</a>` +
          '</div>'
        );
      }

      div.innerHTML = projects
        .map(p => {
          const details = renderDetails(p);
          return (
            '<div class="card mb-3"><div class="card-body">' +
            details +
            actionButtons(p.id) +
            '</div></div>'
          );
        })
        .join('');
    }
  });
});
