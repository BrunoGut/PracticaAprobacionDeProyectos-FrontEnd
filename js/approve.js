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
    let steps = [];
    let resp = await fetch(`${API_BASE_URL}/api/Project/${proposalId}/step`);
    if (resp.ok) {
      steps = await resp.json();
    } else {
      resp = await fetch(`${API_BASE_URL}/api/Project/${proposalId}`);
      if (resp.ok) {
        const project = await resp.json();
        steps = project.projectApprovalSteps || project.steps || [];
      }
    }
    if (steps.length) {
      const options = steps
        .map(s => {
          const roleName =
            (s.approverRole && (s.approverRole.name || s.approverRole.title)) ||
            s.approverRoleName ||
            s.roleName ||
            s.role ||
            s.approver ||
            '';
          return `<option value="${s.id}">Paso ${s.stepOrder} - ${roleName}</option>`;
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

  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.getElementById('approveForm').reset();
      const result = document.getElementById('result');
      if (result) result.innerHTML = '';
      const stepSelect = document.getElementById('id');
      if (stepSelect) stepSelect.innerHTML = '<option value="">Seleccione...</option>';
    });
  }

  setupForm({
    formId: 'approveForm',
    endpoint: `${API_BASE_URL}/api/Project/{proposalId}/decision`,
    method: 'PATCH',
    pathParams: ['proposalId'],
    reset: false,
    afterSuccess: () => {
      if (proposalId) {
        document.getElementById('proposalId').value = proposalId;
        populateSteps(proposalId);
      }
    },
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
