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
      const PROJECTS_PER_PAGE = 4;
      let currentPage = 1;
      const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);
      // Usar el contenedor dedicado para los resultados
      const resultsContainer = document.getElementById('projectResultsContainer');
      if (resultsContainer) resultsContainer.innerHTML = '';

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

      function renderPage(page) {
        currentPage = page;
        const start = (page - 1) * PROJECTS_PER_PAGE;
        const end = start + PROJECTS_PER_PAGE;
        const pageProjects = projects.slice(start, end);
        if (resultsContainer) resultsContainer.innerHTML = '';
        if (pageProjects.length === 0) {
          if (resultsContainer) {
            resultsContainer.innerHTML =
              '<div class="alert alert-info d-flex align-items-center">' +
              '<i class="bi bi-info-circle-fill me-2"></i>' +
              'No se encontraron proyectos' +
              '</div>';
          }
          return;
        }
        // Render grid
        const grid = document.createElement('div');
        grid.className = 'project-results-grid';
        grid.innerHTML = pageProjects
          .map(p => renderProjectCard(p, actionButtons))
          .join('');
        if (resultsContainer) resultsContainer.appendChild(grid);
        // Render paginación
        if (totalPages > 1) {
          const pag = document.createElement('div');
          pag.className = 'pagination';
          pag.innerHTML =
            `<button class='pagination-btn' ${currentPage === 1 ? 'disabled' : ''} data-page='prev'>&lt;</button>` +
            Array.from({ length: totalPages }, (_, i) =>
              `<button class='pagination-btn${i + 1 === currentPage ? ' active' : ''}' data-page='${i + 1}'>${i + 1}</button>`
            ).join('') +
            `<button class='pagination-btn' ${currentPage === totalPages ? 'disabled' : ''} data-page='next'>&gt;</button>`;
          if (resultsContainer) resultsContainer.appendChild(pag);
          pag.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.onclick = () => {
              if (btn.dataset.page === 'prev' && currentPage > 1) renderPage(currentPage - 1);
              else if (btn.dataset.page === 'next' && currentPage < totalPages) renderPage(currentPage + 1);
              else if (!isNaN(Number(btn.dataset.page))) renderPage(Number(btn.dataset.page));
            };
          });
        }
      }
      renderPage(1);
    }
  });
});
