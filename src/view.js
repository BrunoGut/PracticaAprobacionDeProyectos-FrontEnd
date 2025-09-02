document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('viewForm');
  const infoDiv = document.getElementById('projectInfo');
  const dropdown = document.getElementById('projectDropdown');
  const input = document.getElementById('projectId');
  const clearBtn = document.getElementById('clearBtn');

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  
  // Si hay un ID en la URL, ocultar el formulario y mostrar directamente los datos
  if (projectId) {
    if (form) {
      form.style.display = 'none';
    }
    // Cargar directamente los datos del proyecto
    loadProjectData(projectId);
  } else {
    // Si no hay ID, mostrar el formulario normalmente
    if (form) {
      form.style.display = 'block';
    }
    // Solo poblar el dropdown si el formulario está visible
    populateProjectDropdown();
  }

  // Función para cargar los datos del proyecto directamente
  async function loadProjectData(id) {
    if (!infoDiv) return;
    
    infoDiv.innerHTML = '<div class="text-center my-3"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
      const resp = await fetch(`${API_BASE_URL}/api/Project/${id}`);
      if (!resp.ok) throw new Error('No encontrado');
      const p = await resp.json();
      let html = `
        <div class="project-detail-modern">
          <div class="row g-3">
            <!-- Sección izquierda con información principal -->
            <div class="col-md-8">
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
              </div>
            </div>
            
            <!-- Columna derecha con Área, Estado y Tipo de proyecto -->
            <div class="col-md-4">
              <div class="row g-3">
                <div class="col-12">
                  <div class="detail-block">
                    <div class="detail-label"><i class="bi bi-building"></i><span>Área</span></div>
                    <div class="detail-value">${p.area?.name || ''}</div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="detail-block">
                    <div class="detail-label"><i class="bi bi-flag"></i><span>Estado</span></div>
                    <div class="detail-value">${p.status?.name || ''}</div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="detail-block">
                    <div class="detail-label"><i class="bi bi-folder"></i><span>Tipo de proyecto</span></div>
                    <div class="detail-value">${p.type?.name || ''}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Sección completa para Usuario que creó el proyecto -->
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
            
            <!-- Sección completa para Pasos de aprobación -->
            <div class="col-12">
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
                      ${(() => {
                        const sortedSteps = (p.steps || []).sort((a,b) => (a.stepOrder||0)-(b.stepOrder||0));
                        
                        return sortedSteps.map((step, index) => {
                          const statusName = step.status?.name?.toLowerCase() || '';
                          const isPending = statusName === 'pendiente' || statusName === 'pending';
                          const isApproved = statusName === 'aprobado' || statusName === 'approved';
                          const isRejected = statusName === 'rechazado' || statusName === 'rejected';
                          const isObserved = statusName === 'observado' || statusName === 'observed';
                          
                          // Determinar si este paso puede tomar acciones
                          let canTakeAction = false;
                          
                          if (isPending || isObserved) {
                            // Verificar si hay algún paso rechazado antes de este
                            const hasRejectedBefore = sortedSteps.slice(0, index).some(prevStep => {
                              const prevStatusName = prevStep.status?.name?.toLowerCase() || '';
                              return prevStatusName === 'rechazado' || prevStatusName === 'rejected';
                            });
                            
                            if (!hasRejectedBefore) {
                              // Verificar que todos los pasos anteriores estén aprobados
                              const allPreviousApproved = sortedSteps.slice(0, index).every(prevStep => {
                                const prevStatusName = prevStep.status?.name?.toLowerCase() || '';
                                return prevStatusName === 'aprobado' || prevStatusName === 'approved';
                              });
                              
                              canTakeAction = allPreviousApproved;
                            }
                          }
                          
                          // Generar botones
                          const generateButtons = () => {
                            if (!canTakeAction) {
                              // Botones deshabilitados en gris
                              return `
                                <div class="btn-action-group disabled">
                                  <button class="btn btn-secondary btn-sm btn-action-xs" disabled title="No disponible"><i class="bi bi-check-circle"></i></button>
                                  <button class="btn btn-secondary btn-sm btn-action-xs" disabled title="No disponible"><i class="bi bi-x-circle"></i></button>
                                  <button class="btn btn-secondary btn-sm btn-action-xs" disabled title="No disponible"><i class="bi bi-exclamation-circle"></i></button>
                                </div>
                              `;
                            } else {
                              // Botones activos
                              return `
                                <div class="btn-action-group">
                                  <a href="approve.html?proposalId=${encodeURIComponent(p.id)}&status=2" class="btn btn-success btn-sm btn-action-xs" title="Aprobar"><i class="bi bi-check-circle"></i></a>
                                  <a href="approve.html?proposalId=${encodeURIComponent(p.id)}&status=3" class="btn btn-danger btn-sm btn-action-xs" title="Rechazar"><i class="bi bi-x-circle"></i></a>
                                  <a href="approve.html?proposalId=${encodeURIComponent(p.id)}&status=4" class="btn btn-warning btn-sm btn-action-xs" title="Observar"><i class="bi bi-exclamation-circle"></i></a>
                                </div>
                              `;
                            }
                          };
                          
                          return `
                            <tr${canTakeAction ? ' class="table-row-active"' : ''}>
                              <td>${step.stepOrder ?? ''}</td>
                              <td class="${step.decisionDate ? '' : 'date-unassigned'}">${step.decisionDate ? new Date(step.decisionDate).toLocaleString('es-AR') : 'Sin asignar'}</td>
                              <td>${step.observations || '-'}</td>
                              <td>${step.approverUser?.name || '-'}</td>
                              <td>${step.approverRole?.name || ''}</td>
                              <td>${step.status?.name || ''}</td>
                              <td>
                                ${generateButtons()}
                              </td>
                            </tr>
                          `;
                        }).join('');
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button class="btn btn-volver" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" title="Regresar"><i class="bi bi-arrow-up"></i></button>
            <a class="btn btn-secondary" href="index.html" title="Volver al inicio"><i class="bi bi-house"></i></a>
            <button class="btn btn-limpiar" onclick="document.getElementById('projectId').value=''; document.getElementById('projectInfo').innerHTML='';" title="Limpiar"><i class="bi bi-trash"></i></button>
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

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (input) input.value = '';
      if (infoDiv) infoDiv.innerHTML = '';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = input.value.trim();
    if (!id) return;
    
    // Usar la misma función para cargar los datos
    await loadProjectData(id);
  });
});