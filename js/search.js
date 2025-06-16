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

const STATE_OPTIONS = [
  { id: 1, name: 'Pendiente' },
  { id: 2, name: 'Aprobado' },
  { id: 3, name: 'Rechazado' },
  { id: 4, name: 'Observado' }
];

function getProjectStateId(p) {
  const props = [
    'state',
    'status',
    'approvalStatus',
    'stateId',
    'statusId',
    'approvalStatusId',
    'State',
    'Status',
    'StateId',
    'StatusId'
  ];
  for (const key of props) {
    if (p[key] !== undefined && p[key] !== null) {
      let val = p[key];
      if (typeof val === 'object') {
        if (val.id !== undefined && val.id !== null) return val.id;
        if (val.stateId !== undefined && val.stateId !== null) return val.stateId;
        if (val.statusId !== undefined && val.statusId !== null) return val.statusId;
        continue;
      }
      return val;
    }
  }
  return undefined;
}


document.addEventListener('DOMContentLoaded', async () => {
  await populateSelect('state', '/api/ProjectState');
  const stateSelect = document.getElementById('state');
  if (stateSelect && stateSelect.options.length <= 1) {
    stateSelect.innerHTML =
      '<option value="">Seleccione...</option>' +
      STATE_OPTIONS.map(o => `<option value="${o.id}">${o.name}</option>`).join('');
  }

  await populateSelect('applicant', '/api/User');
  await populateSelect('approver', '/api/User');
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.getElementById('searchForm').reset();
      const result = document.getElementById('result');
      if (result) result.innerHTML = '';
    });
  }
  setupForm({
    formId: 'searchForm',
    endpoint: `${API_BASE_URL}/api/Project`,
    method: 'GET',
    renderResult: (data, div) => {
      const projects = Array.isArray(data) ? data : [data];

      const stateFilter = document.getElementById('state');
      let filtered = projects;
      if (stateFilter && stateFilter.value) {
        const value = stateFilter.value;
        filtered = projects.filter(p => {
          const stateVal = getProjectStateId(p);
          return stateVal !== undefined && stateVal !== null && String(stateVal) === value;
        });
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

      if (filtered.length === 0) {
        div.innerHTML =
          '<div class="alert alert-info d-flex align-items-center">' +
          '<i class="bi bi-info-circle-fill me-2"></i>' +
          'No se encontraron proyectos' +
          '</div>';
        return;
      }

      div.innerHTML = filtered
        .map(p => renderProjectCard(p, actionButtons))
        .join('');
    }
  });
});
