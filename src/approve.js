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

// Función para verificar si un proyecto está en estado observado
function checkIfProjectIsObserved(steps) {
  if (!steps || steps.length === 0) return false;
  
  const getStepStatus = s =>
    typeof s.status === 'object' && s.status?.id !== undefined
      ? Number(s.status.id)
      : Number(s.status ?? s.state ?? 1);
  
  // Verificar si algún paso está en estado observado (4)
  return steps.some(s => getStepStatus(s) === 4);
}

// Función para mostrar/ocultar el botón de editar proyecto
function toggleEditProjectButton(show) {
  const container = document.getElementById('editProjectContainer');
  if (!container) return;
  
  if (show) {
    container.classList.remove('d-none');
  } else {
    container.classList.add('d-none');
  }
}

// Función para mostrar/ocultar el botón de subir
function toggleScrollUpButton(show) {
  const container = document.getElementById('scrollUpButtonContainer');
  if (!container) return;
  
  if (show) {
    container.innerHTML = `
      <div class="d-flex justify-content-end mt-3">
        <button class="btn btn-volver" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" title="Subir">
          <i class="bi bi-arrow-up"></i>
        </button>
      </div>
    `;
  } else {
    container.innerHTML = '';
  }
}

// Función para mostrar el banner de estado del proyecto dentro del contenedor
function showProjectApprovedBanner() {
  const container = document.getElementById('approvalProcessContainer');
  if (!container) return;

  // Remover banner existente si existe
  const existingBanner = container.querySelector('.project-approved-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement('div');
  banner.className = 'project-approved-banner';
  banner.innerHTML = `
    <i class="bi bi-check-circle-fill"></i>
    <span>Proyecto Aprobado</span>
  `;
  
  // Insertar el banner al final del contenedor
  container.appendChild(banner);
  
  // Mostrar el banner con animación
  setTimeout(() => {
    banner.classList.add('show');
  }, 300);
}

// Función para verificar si es el último paso y está siendo aprobado
function checkIfLastStepApproved(steps, currentStepId, newStatus) {
  if (!steps || steps.length === 0 || newStatus !== 2) return false;
  
  // Ordenar pasos por stepOrder
  steps.sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));
  
  // Encontrar el paso actual
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  if (currentStepIndex === -1) return false;
  
  // Verificar si es el último paso
  const isLastStep = currentStepIndex === steps.length - 1;
  
  if (isLastStep) {
    // Verificar que todos los pasos anteriores estén aprobados
    for (let i = 0; i < currentStepIndex; i++) {
      const stepStatus = typeof steps[i].status === 'object' && steps[i].status?.id !== undefined
        ? Number(steps[i].status.id)
        : Number(steps[i].status ?? steps[i].state ?? 1);
      
      if (stepStatus !== 2) { // No está aprobado
        return false;
      }
    }
    return true;
  }
  
  return false;
}

function updateApproverDisplay() {
  const currentUser = getCurrentUser();
  const approverDisplayField = document.getElementById('approverDisplay');
  
  if (approverDisplayField && currentUser) {
    approverDisplayField.innerHTML = `
      <div class="selected-user-info">
        <i class="bi bi-person-check me-2"></i>
        <span class="fw-semibold">${currentUser.name}</span>
        <small class="text-muted ms-2">(${currentUser.role})</small>
      </div>
    `;
  }
}

function renderApprovalProcess(steps) {
  const container = document.getElementById('approvalProcessContainer');
  if (!container || !steps || steps.length === 0) {
    if (container) {
      container.style.display = 'none';
    }
    // Ocultar el botón de subir cuando no hay proceso de aprobación
    toggleScrollUpButton(false);
    return;
  }

  // Ordenar pasos por stepOrder
  steps.sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));

  const getStepStatus = s =>
    typeof s.status === 'object' && s.status?.id !== undefined
      ? Number(s.status.id)
      : Number(s.status ?? s.state ?? 1);

  const getStatusInfo = (status) => {
    switch (status) {
      case 1: return { text: 'Pendiente', icon: 'bi-clock', class: 'pending' };
      case 2: return { text: 'Aprobado', icon: 'bi-check-circle', class: 'approved' };
      case 3: return { text: 'Rechazado', icon: 'bi-x-circle', class: 'rejected' };
      case 4: return { text: 'Observado', icon: 'bi-exclamation-triangle', class: 'observed' };
      default: return { text: 'Pendiente', icon: 'bi-clock', class: 'pending' };
    }
  };

  // Verificar el estado final del proyecto
  const rejectedStep = steps.find(s => getStepStatus(s) === 3);
  const allApproved = steps.every(s => getStepStatus(s) === 2);
  const hasObserved = steps.some(s => getStepStatus(s) === 4);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const stepsHTML = steps.map((step, index) => {
    const status = getStepStatus(step);
    const statusInfo = getStatusInfo(status);
    const roleName = 
      (step.approverRole?.name || step.approverRole?.title) ??
      step.approverRoleName ??
      step.roleName ??
      step.role ??
      step.approver ??
      `Paso ${step.stepOrder}`;

    const userName = step.user?.name || step.userName || step.approverName || '';
    const observation = step.observation || step.observations || '';
    const date = step.decisionDate || step.updatedAt || step.createdAt || '';

    let stepClass = 'approval-step';
    let circleContent = `<span>${step.stepOrder || index + 1}</span>`;
    
    // Determinar si el paso está bloqueado
    let isBlocked = false;
    
    // Encontrar el primer paso rechazado
    const rejectedStepIndex = steps.findIndex(s => getStepStatus(s) === 3);
    
    // Si hay un paso rechazado, todos los pasos posteriores están bloqueados
    if (rejectedStepIndex !== -1 && index > rejectedStepIndex) {
      isBlocked = true;
    }
    
    // Si es un paso pendiente, verificar que todos los anteriores estén aprobados
    if (status === 1 && !isBlocked) { // Pendiente y no bloqueado por rechazo
      // Verificar que todos los pasos anteriores estén aprobados (status = 2)
      for (let i = 0; i < index; i++) {
        const prevStatus = getStepStatus(steps[i]);
        if (prevStatus !== 2) { // No está aprobado
          isBlocked = true;
          break;
        }
      }
    }
    
    if (isBlocked) {
      stepClass += ' blocked';
    } else if (status === 2) {
      stepClass += ' completed';
      circleContent = '<i class="bi bi-check"></i>';
    } else if (status === 3) {
      stepClass += ' rejected';
      circleContent = '<i class="bi bi-x"></i>';
    } else if (status === 4) {
      stepClass += ' observed';
      circleContent = '<i class="bi bi-exclamation-triangle"></i>';
    } else {
      stepClass += ' pending';
    }

    // Determinar el estado de visualización
    let displayStatusInfo = statusInfo;
    if (isBlocked) {
      displayStatusInfo = { text: 'Bloqueado', icon: 'bi-lock', class: 'blocked' };
    }

    return `
      <div class="${stepClass}">
        <div class="step-indicator">
          <div class="step-circle">
            ${circleContent}
          </div>
        </div>
        <div class="step-content">
          <div class="step-title">Paso ${step.stepOrder || index + 1}: ${roleName}</div>
          <div class="step-status ${displayStatusInfo.class}">
            <i class="${displayStatusInfo.icon}"></i>
            <span>Estado: ${displayStatusInfo.text}</span>
          </div>
          ${(userName || date || observation) && !isBlocked ? `
            <div class="step-details">
              ${userName ? `
                <div class="step-user">
                  <i class="bi bi-person"></i>
                  <span>${userName}</span>
                </div>
              ` : ''}
              ${date ? `
                <div class="step-date">
                  <i class="bi bi-calendar"></i>
                  <span>${formatDate(date)}</span>
                </div>
              ` : ''}
              ${observation ? `
                <div class="step-observation">
                  <strong>Observaciones:</strong> ${observation}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="approval-process-header">
      <i class="bi bi-list-check"></i>
      <h3>Proceso de Aprobación</h3>
    </div>
    <div class="approval-steps">
      ${stepsHTML}
    </div>
  `;

  container.style.display = 'block';
  
  // Mostrar el banner de aprobado si todos los pasos están aprobados
  if (allApproved) {
    showProjectApprovedBanner();
  }
  
  // Mostrar el botón de subir cuando se muestra el proceso de aprobación
  toggleScrollUpButton(true);
}

async function populateSteps(proposalId) {
  const select = document.getElementById('id');
  const statusLabel = document.getElementById('projectStatusLabel');
  const progressBar = document.getElementById('projectProgressBar');
  if (!select || !proposalId) {
    // Ocultar el flujo de aprobación si no hay proposalId
    renderApprovalProcess(null);
    return;
  }
  
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

    // Renderizar el flujo de aprobación con los datos reales
    renderApprovalProcess(steps);

    // Verificar si el proyecto está en estado observado y mostrar el botón de editar
    const isObserved = checkIfProjectIsObserved(steps);
    toggleEditProjectButton(isObserved);

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
    renderApprovalProcess(null);
    // Ocultar el botón si hay error
    toggleEditProjectButton(false);
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
          // populateSteps ya se encarga de verificar si mostrar el botón de editar
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
          // Ocultar el proceso de aprobación y el botón de subir
          renderApprovalProcess(null);
        });
      }
    }
  } catch (err) {
    console.error('Error cargando proyectos', err);
  }
}

// Función para cargar y mostrar la información del proyecto seleccionado
async function loadAndShowProjectInfo(proposalId) {
  if (!proposalId) return;
  
  const titleSpan = document.getElementById('selectedProjectTitle');
  const descSpan = document.getElementById('selectedProjectDesc');
  
  if (titleSpan && descSpan) {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/Project/${proposalId}`);
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
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const proposalId = params.get('proposalId');

  await populateProposalDropdown();
  await populateSteps(proposalId);
  
  // Si hay un proposalId, cargar la información del proyecto
  if (proposalId) {
    await loadAndShowProjectInfo(proposalId);
  }
  
  // Inicializar display del usuario aprobador
  updateApproverDisplay();
  
  // Escuchar cambios de usuario
  document.addEventListener('userChanged', updateApproverDisplay);

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
      // Ocultar el flujo de aprobación
      renderApprovalProcess(null);
      // Ocultar el botón de editar proyecto
      toggleEditProjectButton(false);
      clearBtn.blur();
    });
  }

  // Event listener para el selector de estado
  const statusSelect = document.getElementById('status');
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      // No hacer nada aquí - el botón debe permanecer según el estado real del proyecto
      // No ocultar el botón solo por cambiar la selección en el formulario
    });
  }

  // Event listener para el selector de proyecto
  const proposalSelect = document.getElementById('proposalId');
  if (proposalSelect) {
    proposalSelect.addEventListener('input', async () => {
      const proposalId = proposalSelect.value;
      if (proposalId) {
        // Cargar los pasos del proyecto para verificar si está observado
        await populateSteps(proposalId);
      } else {
        // Si no hay proyecto seleccionado, ocultar el botón
        toggleEditProjectButton(false);
      }
    });
  }

  // Event listener para el botón de editar proyecto
  const editProjectBtn = document.getElementById('editProjectBtn');
  if (editProjectBtn) {
    editProjectBtn.addEventListener('click', () => {
      const proposalId = document.getElementById('proposalId').value;
      if (proposalId) {
        openEditModal(proposalId);
      }
    });
  }

  // Función para verificar y actualizar el estado del botón de editar
  async function checkEditButtonVisibility() {
    const proposalSelect = document.getElementById('proposalId');
    if (proposalSelect && proposalSelect.value) {
      // Si hay un proyecto seleccionado, recargar los pasos para verificar el estado
      await populateSteps(proposalSelect.value);
    } else {
      // Si no hay proyecto seleccionado, ocultar el botón
      toggleEditProjectButton(false);
    }
  }

  // Verificar estado inicial después de un pequeño delay para asegurar que todo esté cargado
  setTimeout(checkEditButtonVisibility, 500);

  setupForm({
    formId: 'approveForm',
    endpoint: `${API_BASE_URL}/api/Project/{proposalId}/decision`,
    method: 'PATCH',
    pathParams: ['proposalId'],
    reset: false,
    beforeSubmit: (payload) => {
      // Agregar el usuario actual como aprobador
      const currentUser = getCurrentUser();
      if (currentUser) {
        // Probar diferentes campos que el backend podría esperar
        payload.user = currentUser.id;
        payload.approverId = currentUser.id;
        payload.approverName = currentUser.name;
        payload.userId = currentUser.id;
      }
      return payload;
    },
    afterSuccess: async (data) => {
      const proposalId = document.getElementById('proposalId')?.value;
      const stepId = document.getElementById('id')?.value;
      const status = document.getElementById('status')?.value;
      
      if (proposalId) {
        // Esperar un poco para que el backend procese el cambio
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Actualizar los pasos después del cambio
        document.getElementById('proposalId').value = proposalId;
        await populateSteps(proposalId);
        
        // populateSteps() ya se encarga de verificar si mostrar el botón de editar
        // basándose en el estado real del proyecto después de la actualización
        
        // Verificar si ahora todos los pasos están aprobados después de la actualización
        if (stepId && status === '2') {
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
            
            // Verificar si todos los pasos están ahora aprobados
            const getStepStatus = s =>
              typeof s.status === 'object' && s.status?.id !== undefined
                ? Number(s.status.id)
                : Number(s.status ?? s.state ?? 1);
            
            const allApproved = steps.length > 0 && steps.every(s => getStepStatus(s) === 2);
            
            console.log('Verificando estado final:', {
              steps: steps.length,
              allApproved,
              stepStatuses: steps.map(s => ({ id: s.id, status: getStepStatus(s) }))
            });
            
            if (allApproved) {
              // Obtener información del proyecto
              let projectTitle = '';
              try {
                const resp = await fetch(`${API_BASE_URL}/api/Project/${proposalId}`);
                if (resp.ok) {
                  const project = await resp.json();
                  projectTitle = project.title || project.name || `Proyecto ${proposalId}`;
                }
              } catch (err) {
                console.error('Error obteniendo proyecto:', err);
                projectTitle = `Proyecto ${proposalId}`;
              }
              
              // Mostrar modal de éxito
              console.log('Mostrando modal de éxito para proyecto:', projectTitle);
              showSuccessModal({
                title: '¡Proyecto aprobado exitosamente!',
                message: `El proyecto <strong>"${projectTitle}"</strong> ha sido aprobado en todos sus pasos. El proceso se ha completado con éxito.`,
                onClose: () => {
                  console.log('Proyecto completamente aprobado:', projectTitle);
                }
              });
            }
          } catch (err) {
            console.error('Error verificando estado final:', err);
          }
        }
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
    }
  });
});
