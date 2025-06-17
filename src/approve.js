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
      steps.sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));

      const getStepStatus = s =>
        typeof s.status === 'object' && s.status?.id !== undefined
          ? Number(s.status.id)
          : Number(s.status ?? s.state ?? 1);

      const firstPending = steps.find(s => getStepStatus(s) !== 2);
      const rejected = steps.some(s => getStepStatus(s) === 3);

      const options = steps
        .map(s => {
          const roleName =
            (s.approverRole?.name || s.approverRole?.title) ??
            s.approverRoleName ??
            s.roleName ??
            s.role ??
            s.approver ??
            '';

          const state = getStepStatus(s);
          let icon = '';
          let color = '';
          let disabled = false;
          let cls = '';

          if (state === 2) {
            icon = '✓';
            color = 'color: #6c757d;';
            disabled = true;
            cls = 'text-muted';
          } else if (state === 1 || state === 4) {
            icon = state === 4 ? '⚠' : '⌛';
            disabled = firstPending && s.id !== firstPending.id;
            if (disabled) cls = 'text-muted';
          } else if (state === 3) {
            icon = '✖';
            color = 'color: #dc3545;';
            disabled = true;
            cls = 'text-danger';
          }

          return `
            <option value="${s.id}" ${disabled ? 'disabled' : ''} class="${cls}" style="${color}">
              ${icon} Paso ${s.stepOrder} - ${roleName}
            </option>`;
        })
        .join('');

      select.innerHTML = '<option value="">Seleccione...</option>' + options;
      select.disabled = rejected;
    }
  } catch (err) {
    console.error('Error cargando pasos', err);
  }
}

async function populateProposalDropdown() {
  const list = document.getElementById('proposalDropdown');
  if (!list) return;
  try {
    const resp = await fetch(`${API_BASE_URL}/api/Project`);
    if (resp.ok) {
      const projects = await resp.json();
      list.innerHTML = projects
        .map(p => `<li><a class="dropdown-item" data-id="${p.id}" href="#">${p.id} - ${p.title || p.name}</a></li>`)
        .join('');
      list.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          const id = a.getAttribute('data-id');
          const input = document.getElementById('proposalId');
          if (input) input.value = id;
          populateSteps(id);
        });
      });
    }
  } catch (err) {
    console.error('Error cargando proyectos', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const proposalId = params.get('proposalId');

  await populateSelect('user', '/api/User');
  await populateProposalDropdown();
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
