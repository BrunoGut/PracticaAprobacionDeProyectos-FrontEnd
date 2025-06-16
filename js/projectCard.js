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

function renderProjectCard(p, actionButtons) {
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
    (typeof actionButtons === 'function' ? actionButtons(id) : '') +
    '</div></div>'
  );
}

window.renderProjectCard = renderProjectCard;
window.stateInfo = stateInfo;

