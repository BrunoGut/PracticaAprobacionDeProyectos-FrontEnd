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
  const statusLabel = document.getElementById('projectStatusLabel');
  const progressBar = document.getElementById('projectProgressBar');
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

      let estado = 'Pendiente';
      if (rejected) {
        estado = 'Rechazado';
      } else if (steps.every(s => getStepStatus(s) === 2)) {
        estado = 'Aprobado';
      } else if (steps.some(s => getStepStatus(s) === 4)) {
        estado = 'Observado';
      }
      if (statusLabel) statusLabel.textContent = `Estado: ${estado}`;

      const total = steps.length;
      let progressHTML = '';
      steps.forEach((s, idx) => {
        const state = getStepStatus(s);
        let cls = 'progress-pendiente';
        let txt = '';
        if (state === 2) {
          cls = 'progress-aprobado';
          txt = '✓';
        } else if (state === 3) {
          cls = 'progress-rechazado';
          txt = '✖';
        } else if (state === 4) {
          cls = 'progress-observado';
          txt = '⚠';
        } else {
          cls = 'progress-pendiente';
          txt = '';
        }
        const width = 100 / total;
        const delay = idx * 0.15;
        progressHTML += `<div class="progress-segment ${cls}" style="--final-width:${width}%; animation-delay:${delay}s">${txt}</div>`;
      });
      if (progressBar) progressBar.innerHTML = progressHTML;

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
            color = 'color: #6c757d;';
            disabled = true;
            cls = 'text-muted';
          } else if (state === 1 || state === 4) {
            disabled = firstPending && s.id !== firstPending.id;
            if (disabled) cls = 'text-muted';
          } else if (state === 3) {
            color = 'color: #dc3545;';
            disabled = true;
            cls = 'text-danger';
          }

          return `
            <option value="${s.id}" ${disabled ? 'disabled' : ''} class="${cls}" style="${color}">
              Paso ${s.stepOrder} - ${roleName}
            </option>`;
        })
        .join('');

      select.innerHTML = '<option value="">Seleccione...</option>' + options;
      select.disabled = rejected;
    }
    else {
      if (statusLabel) statusLabel.textContent = 'Estado: -';
      if (progressBar) {
        progressBar.innerHTML = '';
      }
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
        .map(p => `<li><a class="dropdown-item" data-id="${p.id}" data-title="${p.title || p.name || ''}" href="#"><span class='dropdown-title'>${p.title || p.name || p.id}</span><span class='dropdown-id'>${p.id}</span></a></li>`)
        .join('');
      list.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', async e => {
          e.preventDefault();
          const id = a.getAttribute('data-id');
          const input = document.getElementById('proposalId');
          if (input) input.value = id;
          const box = document.getElementById('selectedProjectBox');
          const titleSpan = document.getElementById('selectedProjectTitle');
          const descSpan = document.getElementById('selectedProjectDesc');
          if (box && titleSpan && descSpan) {
            try {
              const resp = await fetch(`${API_BASE_URL}/api/Project/${id}`);
              if (resp.ok) {
                const project = await resp.json();
                titleSpan.textContent = project.title || project.name || '';
                descSpan.textContent = project.description || '';
              } else {
                titleSpan.textContent = '';
                descSpan.textContent = '';
              }
            } catch {
              titleSpan.textContent = '';
              descSpan.textContent = '';
            }
          }
          populateSteps(id);
        });
      });

      const clearBtn = document.getElementById('clearBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          const titleSpan = document.getElementById('selectedProjectTitle');
          const descSpan = document.getElementById('selectedProjectDesc');
          if (titleSpan) titleSpan.textContent = '';
          if (descSpan) descSpan.textContent = '';
        });
      }
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
      const statusLabel = document.getElementById('projectStatusLabel');
      const progressBar = document.getElementById('projectProgressBar');
      if (statusLabel) statusLabel.textContent = 'Estado: -';
      if (progressBar) progressBar.innerHTML = '';
      clearBtn.blur();
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
    renderResult: async (data, div) => {
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
      
      let btnClass = 'btn-success';
      if (alertClass === 'danger') btnClass = 'btn-danger';
      if (alertClass === 'warning') btnClass = 'btn-warning';
      if (alertClass === 'info') btnClass = 'btn-info';
      div.innerHTML = '';

      const proposalId = document.getElementById('proposalId')?.value;
      if (proposalId) {
        await new Promise(resolve => setTimeout(resolve, 250));
        await populateSteps(proposalId);
      }
    }
  });
});
