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

const STATE_LABELS = {
  1: { text: 'Pendiente', class: 'secondary' },
  2: { text: 'Aprobado', class: 'success' },
  3: { text: 'Rechazado', class: 'danger' },
  4: { text: 'Observado', class: 'warning' }
};

function getValue(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return '';
}

function stateInfo(value) {
  const key = Number(value);
  if (STATE_LABELS[key]) return STATE_LABELS[key];
  const val = value || 'Desconocido';
  return { text: val, class: 'secondary' };
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
  setupForm({
    formId: 'searchForm',
    endpoint: `${API_BASE_URL}/api/Project`,
    method: 'GET',
    renderResult: (data, div) => {
      const projects = Array.isArray(data) ? data : [data];

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

      function renderCard(p) {
        const id = getValue(p, ['id', 'projectId']);
        const title = getValue(p, ['title', 'name']);
        const description = getValue(p, ['description', 'desc']);
        const amount = getValue(p, ['estimatedAmount', 'amount']);
        const duration = getValue(p, ['estimatedDuration', 'duration']);
        const area =
          getValue(p, ['areaName', 'area']) ||
          (p.area && (p.area.name || p.area.title)) ||
          getValue(p, ['areaId']);
        const type =
          getValue(p, ['typeName', 'type', 'projectType']) ||
          (p.projectType && (p.projectType.name || p.projectType.title)) ||
          getValue(p, ['typeId']);
        const stateVal = getValue(p, ['state', 'status', 'stateId']);
        const info = stateInfo(stateVal);

        const items =
          `<li class="list-group-item"><strong>ID del proyecto:</strong> ${id}</li>` +
          `<li class="list-group-item"><strong>Titulo:</strong> ${title}</li>` +
          `<li class="list-group-item"><strong>Descripcion:</strong> ${description}</li>` +
          `<li class="list-group-item"><strong>Monto:</strong> ${amount}</li>` +
          `<li class="list-group-item"><strong>Duracion (en dias):</strong> ${duration}</li>` +
          `<li class="list-group-item"><strong>Area:</strong> ${area}</li>` +
          `<li class="list-group-item"><strong>Tipo:</strong> ${type}</li>` +
          `<li class="list-group-item"><strong>Estado:</strong> <div class="alert alert-${info.class} mb-0 py-1">${info.text}</div></li>`;

        return (
          '<div class="card mb-3">' +
          '<div class="card-header bg-info text-white">' +
          '<i class="bi bi-info-circle me-2"></i>Detalle del proyecto' +
          '</div>' +
          '<div class="card-body">' +
          `<ul class="list-group list-group-flush mb-3">${items}</ul>` +
          actionButtons(id) +
          '</div></div>'
        );
      }

      div.innerHTML = projects.map(renderCard).join('');
    }
  });
});
