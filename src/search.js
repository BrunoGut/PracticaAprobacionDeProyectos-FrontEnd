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

  // Check if there's an ID in the URL parameters
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  if (projectId) {
    // If there's an ID, set it in the form and submit it
    const idInput = document.getElementById('id');
    if (idInput) {
      idInput.value = projectId;
      const searchForm = document.getElementById('searchForm');
      if (searchForm) {
        searchForm.dispatchEvent(new Event('submit'));
      }
    }
  }

  setupForm({
    formId: 'searchForm',
    endpoint: `${API_BASE_URL}/api/Project`,
    method: 'GET',
    renderResult: async (data, div) => {
      const projects = Array.isArray(data) ? data : [data];
      
      // Obtener detalles completos de cada proyecto
      const projectsWithDetails = await Promise.all(
        projects.map(async (p) => {
          try {
            const resp = await fetch(`${API_BASE_URL}/api/Project/${p.id}`);
            if (resp.ok) {
              return await resp.json();
            }
          } catch (err) {
            console.error('Error fetching project details:', err);
          }
          return p;
        })
      );

      const PROJECTS_PER_PAGE = 4;
      let currentPage = 1;
      const totalPages = Math.ceil(projectsWithDetails.length / PROJECTS_PER_PAGE);
      // Usar el contenedor dedicado para los resultados
      const resultsContainer = document.getElementById('projectResultsContainer');
      if (resultsContainer) resultsContainer.innerHTML = '';

      function actionButtons(id) {
        if (!id) return '';
        return (
          '<div class="d-flex justify-content-end mt-2">' +
          `<a href="view.html?id=${encodeURIComponent(id)}" class="btn btn-primary"><i class="bi bi-eye"></i> Ver Proyecto</a>` +
          '</div>'
        );
      }

      function renderPage(page) {
        currentPage = page;
        const start = (page - 1) * PROJECTS_PER_PAGE;
        const end = start + PROJECTS_PER_PAGE;
        const pageProjects = projectsWithDetails.slice(start, end);
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
