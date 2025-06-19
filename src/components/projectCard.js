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
  const id = p.id || p.projectId || '';
  const title = p.title || p.name || '';
  const description = p.description || p.desc || '';
  const amount = p.amount ?? p.estimatedAmount ?? '';
  const duration = p.duration ?? p.estimatedDuration ?? '';
  const area = (p.area && (p.area.name || p.area.title)) || p.areaName || '';
  const type = (p.type && (p.type.name || p.type.title)) || p.typeName || '';
  const stateVal = (p.status && (p.status.id || p.status.name)) || p.state || p.status || p.stateId || '';
  const info = stateInfo(p.status?.id || p.state || p.status || p.stateId);

  const items =
    `<li class="project-list-item"><span class='project-label'>ID del proyecto:</span> <span class='project-value'>${id}</span></li>` +
    `<li class="project-list-item"><span class='project-label'>Título:</span> <span class='project-value'>${title}</span></li>` +
    `<li class="project-list-item"><span class='project-label'>Descripción:</span> <span class='project-value'>${description}</span></li>` +
    `<li class="project-list-item"><span class='project-label'>Monto:</span> <span class='project-value'>${amount}</span></li>` +
    `<li class="project-list-item"><span class='project-label'>Duración (en días):</span> <span class='project-value'>${duration}</span></li>` +
    `<li class="project-list-item"><span class='project-label'>Área:</span> <span class='project-value'>${area}</span></li>` +
    `<li class="project-list-item"><span class='project-label'>Tipo:</span> <span class='project-value'>${type}</span></li>` +
    `<li class="project-list-item"><span class='project-label'>Estado:</span> <span class='project-badge badge-${info.class}'>${info.text}</span></li>`;

  return (
    '<div class="project-card-modern">' +
      '<div class="project-card-header-modern">' +
        '<i class="bi bi-info-circle me-2"></i>Detalle del proyecto' +
      '</div>' +
      '<ul class="project-list">' + items + '</ul>' +
      (typeof actionButtons === 'function' ? '<div class="project-card-actions">' + actionButtons(id) + '</div>' : '') +
    '</div>'
  );
}

window.renderProjectCard = renderProjectCard;
window.stateInfo = stateInfo;

