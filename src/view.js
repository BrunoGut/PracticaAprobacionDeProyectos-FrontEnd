document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('viewForm');
  const infoDiv = document.getElementById('projectInfo');
  const dropdown = document.getElementById('projectDropdown');
  const input = document.getElementById('projectId');
  const clearBtn = document.getElementById('clearBtn');

  // Poblar el dropdown de proyectos (igual que en aprobar/buscar)
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
      // No mostrar error
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
      // Render tipo cards modernas con todos los campos requeridos
      let html = `
        <div class="project-detail-modern">
          <div class="row g-3">
            <div class="col-12">
              <div class="detail-block">
                <div class="detail-label">Título</div>
                <div class="detail-value">${p.title || ''}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="detail-block">
                <div class="detail-label">Descripción</div>
                <div class="detail-value">${p.description || ''}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-block">
                <div class="detail-label">Monto</div>
                <div class="detail-value text-orange fw-bold" style="font-size:1.3em;">$ ${p.amount?.toLocaleString('es-AR', {minimumFractionDigits:2}) || ''}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-block">
                <div class="detail-label">Duración</div>
                <div class="detail-value text-orange fw-bold" style="font-size:1.1em;">${p.duration ? p.duration + ' días' : ''}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="detail-block">
                <div class="detail-label">Área</div>
                <div class="detail-value fw-bold">${p.area?.name || ''}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="detail-block">
                <div class="detail-label">Estado</div>
                <div class="detail-value">${p.status?.name || ''}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="detail-block">
                <div class="detail-label">Tipo de proyecto</div>
                <div class="detail-value fw-bold">${p.type?.name || ''}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="detail-block">
                <div class="detail-label">Usuario que creó el proyecto</div>
                <div class="detail-value">
                  <strong>Nombre:</strong> ${p.user?.name || ''}<br/>
                  <strong>Email:</strong> ${p.user?.email || ''}<br/>
                  <strong>Rol:</strong> ${p.user?.role?.name || ''}
                </div>
              </div>
            </div>
            <div class="col-12">
              <div class="detail-block">
                <div class="detail-label">Pasos de aprobación</div>
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
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button class="btn btn-warning"><i class="bi bi-printer"></i> Imprimir</button>
            <button class="btn btn-primary"><i class="bi bi-pencil-square"></i> Editar Proyecto</button>
          </div>
        </div>
      `;
      infoDiv.innerHTML = html;
    } catch {
      infoDiv.innerHTML = '<div class="alert alert-danger">No se encontró el proyecto con ese ID.</div>';
    }
  });
}); 