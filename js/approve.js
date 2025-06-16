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
  await populateSelect('user', '/api/User');

  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of params.entries()) {
    const input = document.getElementById(key);
    if (input) {
      input.value = value;
    }
  }

  setupForm({
    formId: 'approveForm',
    endpoint: `${API_BASE_URL}/api/Project/{proposalId}/decision`,
    method: 'PATCH',
    pathParams: ['proposalId'],
    renderResult: (data, div) => {
      const decision = (data.state || data.decision || '').toString().toLowerCase();
      let alertClass = 'info';
      let message = '';
      if (decision.includes('aprob') || decision === '1') {
        alertClass = 'success';
        message = 'Proyecto aprobado';
      } else if (decision.includes('rech') || decision === '2') {
        alertClass = 'danger';
        message = 'Proyecto rechazado';
      } else if (decision.includes('observ') || decision === '3') {
        alertClass = 'warning';
        message = 'Proyecto observado';
      } else {
        message = 'Se tomó la decisión: ' + decision;
      }
      div.innerHTML =
        '<div class="alert alert-' + alertClass + ' d-flex align-items-center">' +
        '<i class="bi bi-info-circle-fill me-2"></i>' +
        message +
        '</div>';
    }
  });
});
