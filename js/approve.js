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

async function populateSteps(proposalId) {
  const select = document.getElementById('id');
  if (!select || !proposalId) return;
  try {
    const resp = await fetch(`${API_BASE_URL}/api/Project/${proposalId}/step`);
    if (resp.ok) {
      const steps = await resp.json();
      const options = steps
        .map(s => {
          const role = s.approverRole || s.role || s.approver || '';
          return `<option value="${s.id}">Paso ${s.stepOrder} - ${role}</option>`;
        })
        .join('');
      select.innerHTML = '<option value="">Seleccione...</option>' + options;
    }
  } catch (err) {
    console.error('Error cargando pasos', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const proposalId = params.get('proposalId');

  await populateSelect('user', '/api/User');
  await populateSteps(proposalId);

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
      if (decision.includes('aprob') || decision === '2') {
        alertClass = 'success';
        message = 'Proyecto aprobado';
      } else if (decision.includes('rech') || decision === '3') {
        alertClass = 'danger';
        message = 'Proyecto rechazado';
      } else if (decision.includes('observ') || decision === '4') {
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
