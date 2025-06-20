document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('viewForm');
  const infoDiv = document.getElementById('projectInfo');
  const dropdown = document.getElementById('projectDropdown');
  const input = document.getElementById('projectId');
  const clearBtn = document.getElementById('clearBtn');

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  if (projectId && input) {
    input.value = projectId;
    form.dispatchEvent(new Event('submit'));
  }

  async function populateProjectDropdown() {
    if (!dropdown) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/Project`);
      if (resp.ok) {
        const projects = await resp.json();
        dropdown.innerHTML = projects
          .map(p => `<li><a class="dropdown-item" data-id="${p.id}" href="#"><span class='dropdown-title'>${p.title || p.name || p.id}</span><span class='dropdown-id'>${p.id}</span><div class='dropdown-desc small text-muted'>${p.description || ''}</div></a></li>`)
          .join('');
        dropdown.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', e => {
            e.preventDefault();
            const id = a.getAttribute('data-id');
            if (input) input.value = id;
            if (infoDiv) infoDiv.innerHTML = '';
          });
        });
      }
    } catch (err) {
    }
  }
  populateProjectDropdown();

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (input) input.value = '';
      if (infoDiv) infoDiv.innerHTML = '';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = input.value.trim();
    infoDiv.innerHTML = '';
    if (!id) return;
    infoDiv.innerHTML = '<div class="text-center my-3"><div class="spinner-border text-primary" role="status"></div></div>';
    try {
      const resp = await fetch(`${API_BASE_URL}/api/Project/${id}`);
      if (!resp.ok) throw new Error('No encontrado');
      const p = await resp.json();
      let html = `
        <div class="project-detail-modern">
          <div class="row g-3">
            <div class="col-12">
              <div class="detail-block">
                <div class="detail-label"><i class="bi bi-bookmark"></i><span>Título</span></div>
                <div class="detail-value">${p.title || ''}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="detail-block">
                <div class="detail-label"><i class="bi bi-card-text"></i><span>Descripción</span></div>
                <div class="detail-value">${p.description || ''}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-block">
                <div class="detail-label"><i class="bi bi-currency-dollar"></i><span>Monto</span></div>
                <div class="detail-value text-success" style="font-size:1.3em;">$ ${p.amount?.toLocaleString('es-AR', {minimumFractionDigits:2}) || ''}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-block">
                <div class="detail-label"><i class="bi bi-calendar-event"></i><span>Duración</span></div>
                <div class="detail-value" style="font-size:1.1em;">${p.duration ? p.duration + ' días' : ''}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="detail-block">
                <div class="detail-label"><i class="bi bi-building"></i><span>Área</span></div>
                <div class="detail-value">${p.area?.name || ''}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="detail-block">
                <div class="detail-label"><i class="bi bi-flag"></i><span>Estado</span></div>
                <div class="detail-value">${p.status?.name || ''}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="detail-block">
                <div class="detail-label"><i class="bi bi-folder"></i><span>Tipo de proyecto</span></div>
                <div class="detail-value">${p.type?.name || ''}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="detail-block">
                <div class="detail-label"><i class="bi bi-person"></i><span>Usuario que creó el proyecto</span></div>
                <div class="detail-value">
                  <strong>Nombre:</strong> ${p.user?.name || ''}<br/>
                  <strong>Email:</strong> ${p.user?.email || ''}<br/>
                  <strong>Rol:</strong> ${p.user?.role?.name || ''}
                </div>
              </div>
            </div>
            <div class="col-12">
              <div class="detail-block">
                <div class="detail-label"><i class="bi bi-check2-square"></i><span>Pasos de aprobación</span></div>
                <div class="table-responsive">
                  <table class="table table-sm table-bordered project-detail-table mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Orden</th>
                        <th>Fecha decisión</th>
                        <th>Observaciones</th>
                        <th>Usuario aprobador</th>
                        <th>Rol aprobador</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(p.steps || []).sort((a,b) => (a.stepOrder||0)-(b.stepOrder||0)).map(step => `
                        <tr>
                          <td>${step.stepOrder ?? ''}</td>
                          <td>${step.decisionDate ? new Date(step.decisionDate).toLocaleString('es-AR') : ''}</td>
                          <td>${step.observations || ''}</td>
                          <td>${step.approverUser?.name || ''}</td>
                          <td>${step.approverRole?.name || ''}</td>
                          <td>${step.status?.name || ''}</td>
                          <td>
                            <a href="approve.html?proposalId=${encodeURIComponent(p.id)}&status=2" class="btn btn-success btn-sm btn-action-xs me-1" title="Aprobar"><i class="bi bi-check-circle"></i></a>
                            <a href="approve.html?proposalId=${encodeURIComponent(p.id)}&status=3" class="btn btn-danger btn-sm btn-action-xs me-1" title="Rechazar"><i class="bi bi-x-circle"></i></a>
                            <a href="approve.html?proposalId=${encodeURIComponent(p.id)}&status=4" class="btn btn-warning btn-sm btn-action-xs" title="Observar" style="color:#fff;"><i class="bi bi-exclamation-circle"></i></a>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button class="btn btn-volver" onclick="window.scrollTo({top: 0, behavior: 'smooth'})"><i class="bi bi-arrow-left"></i> Regresar</button>
            <a class="btn btn-primary" href="edit.html?id=${encodeURIComponent(p.id)}"><i class="bi bi-pencil-square"></i> Editar Proyecto</a>
          </div>
        </div>
      `;
      infoDiv.innerHTML = html;
    } catch {
      infoDiv.innerHTML =
        '<div class="alert alert-warning d-flex align-items-center mt-3">' +
        '<i class="bi bi-exclamation-triangle-fill me-2"></i>' +
        'No se encontró el proyecto con ese ID.' +
        '</div>';
    }
  });
}); 