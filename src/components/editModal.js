// Modal de edición de proyecto
function createEditModal() {
  const modalHTML = `
    <div class="modal fade edit-modal" id="editProjectModal" tabindex="-1" aria-labelledby="editProjectModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editProjectModalLabel">
              <i class="bi bi-pencil-square"></i>
              Editar Proyecto
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="editProjectForm">
              <input type="hidden" id="editProjectId" name="id">
              
              <div class="form-group">
                <label for="editProjectTitle" class="form-label">
                  <i class="bi bi-bookmark field-icon"></i>
                  Título
                </label>
                <div class="input-group">
                  <input type="text" class="form-control" id="editProjectTitle" name="title" disabled>
                  <button type="button" class="edit-toggle-btn" data-field="title" title="Editar título">
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="editProjectDescription" class="form-label">
                  <i class="bi bi-card-text field-icon"></i>
                  Descripción
                </label>
                <div class="input-group">
                  <textarea class="form-control" id="editProjectDescription" name="description" disabled></textarea>
                  <button type="button" class="edit-toggle-btn" data-field="description" title="Editar descripción">
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="editProjectDuration" class="form-label">
                  <i class="bi bi-calendar-event field-icon"></i>
                  Duración Estimada (días)
                </label>
                <div class="input-group">
                  <input type="number" class="form-control" id="editProjectDuration" name="duration" disabled>
                  <button type="button" class="edit-toggle-btn" data-field="duration" title="Editar duración">
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-edit-cancel" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-2"></i>
              Cancelar
            </button>
            <button type="button" class="btn btn-edit-confirm" id="confirmEditBtn" disabled>
              <span class="btn-text">
                <i class="bi bi-check-circle me-2"></i>
                Confirmar
              </span>
              <span class="btn-loading d-none">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Guardando...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remover modal existente si existe
  const existingModal = document.getElementById('editProjectModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Agregar el modal al body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Configurar event listeners
  setupEditModalEventListeners();
}

function setupEditModalEventListeners() {
  const modal = document.getElementById('editProjectModal');
  const form = document.getElementById('editProjectForm');
  const confirmBtn = document.getElementById('confirmEditBtn');

  // Event listeners para los botones de edición
  const editToggleBtns = modal.querySelectorAll('.edit-toggle-btn');
  editToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fieldName = btn.getAttribute('data-field');
      const input = modal.querySelector(`#editProject${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`);
      
      if (input.disabled) {
        // Habilitar edición
        input.disabled = false;
        input.focus();
        btn.classList.add('editing');
        btn.innerHTML = '<i class="bi bi-check"></i>';
        btn.title = 'Confirmar edición';
        
        // Verificar si hay campos editados para habilitar el botón de confirmar
        checkForChanges();
      } else {
        // Deshabilitar edición
        input.disabled = true;
        btn.classList.remove('editing');
        btn.innerHTML = '<i class="bi bi-pencil"></i>';
        btn.title = `Editar ${fieldName}`;
        
        // Verificar si hay campos editados para habilitar el botón de confirmar
        checkForChanges();
      }
    });
  });

  // Event listener para cambios en los inputs
  const inputs = modal.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', checkForChanges);
  });

  // Event listener para el botón de confirmar
  confirmBtn.addEventListener('click', async () => {
    await saveProjectChanges();
  });

  // Event listener para resetear el modal cuando se cierra
  modal.addEventListener('hidden.bs.modal', () => {
    resetEditModal();
  });
}

function checkForChanges() {
  const modal = document.getElementById('editProjectModal');
  const confirmBtn = document.getElementById('confirmEditBtn');
  const editingFields = modal.querySelectorAll('.edit-toggle-btn.editing');
  
  // Habilitar el botón de confirmar solo si hay campos en modo edición
  confirmBtn.disabled = editingFields.length === 0;
}

function resetEditModal() {
  const modal = document.getElementById('editProjectModal');
  const form = document.getElementById('editProjectForm');
  const confirmBtn = document.getElementById('confirmEditBtn');
  
  // Resetear form
  form.reset();
  
  // Deshabilitar todos los inputs
  const inputs = modal.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.disabled = true;
  });
  
  // Resetear botones de edición
  const editToggleBtns = modal.querySelectorAll('.edit-toggle-btn');
  editToggleBtns.forEach(btn => {
    btn.classList.remove('editing');
    btn.innerHTML = '<i class="bi bi-pencil"></i>';
    const fieldName = btn.getAttribute('data-field');
    btn.title = `Editar ${fieldName}`;
  });
  
  // Deshabilitar botón de confirmar
  confirmBtn.disabled = true;
  
  // Resetear estado de loading
  const btnText = confirmBtn.querySelector('.btn-text');
  const btnLoading = confirmBtn.querySelector('.btn-loading');
  btnText.classList.remove('d-none');
  btnLoading.classList.add('d-none');
}

async function openEditModal(projectId) {
  try {
    // Crear el modal si no existe
    if (!document.getElementById('editProjectModal')) {
      createEditModal();
    }

    const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
    
    // Mostrar loading mientras se cargan los datos
    const modalBody = document.querySelector('#editProjectModal .modal-body');
    const originalContent = modalBody.innerHTML;
    modalBody.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Cargando datos del proyecto...</p>
      </div>
    `;
    
    // Mostrar el modal
    modal.show();
    
    // Cargar datos del proyecto
    const response = await fetch(`${API_BASE_URL}/api/Project/${projectId}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const project = await response.json();
    
    // Verificar que el proyecto tenga pasos en estado "Observado"
    let hasObservedSteps = false;
    try {
      let steps = [];
      
      // Intentar obtener los pasos desde el proyecto completo primero
      const projectResponse = await fetch(`${API_BASE_URL}/api/Project/${projectId}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        steps = projectData.projectApprovalSteps || projectData.steps || projectData.Steps || [];
      }
      
      console.log('Project steps for verification:', steps);
      
      hasObservedSteps = steps.some(step => {
        const status = typeof step.status === 'object' && step.status?.id !== undefined
          ? Number(step.status.id)
          : Number(step.status ?? step.state ?? step.Status ?? 1);
        console.log('Step status:', status, 'for step:', step);
        return status === 4; // Estado observado
      });
      
      console.log('Has observed steps:', hasObservedSteps);
      
    } catch (error) {
      console.warn('No se pudieron verificar los pasos del proyecto:', error);
      // Permitir la edición asumiendo que hay pasos observados
      hasObservedSteps = true;
    }
    
    // Restaurar el contenido original del modal
    modalBody.innerHTML = originalContent;
    
    // Re-configurar los event listeners después de restaurar el contenido
    setupEditModalEventListeners();
    
    if (!hasObservedSteps) {
      // Comentado temporalmente - permitir edición sin mostrar advertencia
      // modalBody.insertAdjacentHTML('afterbegin', `
      //   <div class="alert alert-warning">
      //     <i class="bi bi-exclamation-triangle me-2"></i>
      //     <strong>Advertencia:</strong> Este proyecto no tiene pasos en estado "Observado". 
      //     Los cambios se guardarán pero pueden no ser apropiados según el flujo de aprobación.
      //   </div>
      // `);
      console.log('Note: Project does not have observed steps, but allowing edit anyway');
    }
    
    // Llenar el formulario con los datos del proyecto
    document.getElementById('editProjectId').value = project.id;
    document.getElementById('editProjectTitle').value = project.title || '';
    document.getElementById('editProjectDescription').value = project.description || '';
    document.getElementById('editProjectDuration').value = project.duration || '';
    
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    
    // Restaurar contenido original si hay error
    const modalBody = document.querySelector('#editProjectModal .modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-circle me-2"></i>
          <strong>Error:</strong> No se pudieron cargar los datos del proyecto.
          <br>
          <small>${error.message}</small>
        </div>
      `;
    }
    
    // Cerrar el modal después de 3 segundos
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('editProjectModal'));
      if (modal) {
        modal.hide();
      }
    }, 3000);
  }
}

async function saveProjectChanges() {
  const modal = document.getElementById('editProjectModal');
  const confirmBtn = document.getElementById('confirmEditBtn');
  const btnText = confirmBtn.querySelector('.btn-text');
  const btnLoading = confirmBtn.querySelector('.btn-loading');
  
  try {
    // Mostrar estado de loading
    confirmBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');
    
    // El backend requiere que se envíen TODOS los campos (Title, Description, Duration)
    // Obtener todos los valores actuales del formulario
    const titleInput = modal.querySelector('#editProjectTitle');
    const descriptionInput = modal.querySelector('#editProjectDescription');
    const durationInput = modal.querySelector('#editProjectDuration');
    
    const changes = {
      Title: titleInput.value.trim(),
      Description: descriptionInput.value.trim(),
      Duration: durationInput.value.trim() === '' ? null : Number(durationInput.value)
    };
    
    // Validaciones según el backend
    if (!changes.Title || changes.Title.length === 0) {
      throw new Error('El título es requerido y no puede estar vacío');
    }
    
    if (!changes.Description || changes.Description.length === 0) {
      throw new Error('La descripción es requerida y no puede estar vacía');
    }
    
    if (!changes.Duration || changes.Duration <= 0) {
      throw new Error('La duración es requerida y debe ser mayor a 0');
    }
    
    // Verificar que al menos uno de los campos editables esté en modo edición
    const editingFields = modal.querySelectorAll('.edit-toggle-btn.editing');
    if (editingFields.length === 0) {
      throw new Error('No hay cambios para guardar. Active la edición de al menos un campo.');
    }
    
    const projectId = document.getElementById('editProjectId').value;
    
    console.log('Saving changes:', changes);
    console.log('Project ID:', projectId);
    
    // Enviar cambios al servidor
    const response = await fetch(`${API_BASE_URL}/api/Project/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changes)
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      // Intentar obtener más detalles del error
      try {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        } else if (errorData.errors) {
          // Manejar errores de validación de ASP.NET
          const validationErrors = Object.values(errorData.errors).flat();
          errorMessage = validationErrors.join('; ');
        }
        
        // Manejar errores específicos del backend
        if (response.status === 400) {
          if (errorMessage.includes('inválido')) {
            errorMessage = 'Los datos proporcionados no son válidos. Verifique que todos los campos estén completos y sean correctos.';
          }
        } else if (response.status === 404) {
          errorMessage = 'El proyecto no fue encontrado.';
        } else if (response.status === 409) {
          if (errorMessage.includes('estado')) {
            errorMessage = 'El proyecto ya no se encuentra en un estado que permite modificaciones. Solo se pueden editar proyectos observados.';
          } else if (errorMessage.includes('título')) {
            errorMessage = 'El título del proyecto ya existe. Por favor, elija un título diferente.';
          }
        }
        
      } catch (e) {
        console.log('Could not parse error response:', e);
        
        // Manejar errores comunes por código de estado
        if (response.status === 400) {
          errorMessage = 'Datos inválidos. Verifique que todos los campos estén completos y sean correctos.';
        } else if (response.status === 404) {
          errorMessage = 'El proyecto no fue encontrado.';
        } else if (response.status === 409) {
          errorMessage = 'El proyecto no se puede modificar o el título ya existe.';
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Cerrar el modal
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    
    // Mostrar mensaje de éxito
    showSuccessMessage('Proyecto actualizado exitosamente');
    
    // Refrescar los datos en la página si es necesario
    const proposalId = document.getElementById('proposalId')?.value;
    if (proposalId === projectId) {
      // Solo refrescar si estamos viendo el mismo proyecto
      await populateSteps(proposalId);
      
      // También actualizar la información del proyecto seleccionado
      try {
        const updatedResponse = await fetch(`${API_BASE_URL}/api/Project/${projectId}`);
        if (updatedResponse.ok) {
          const updatedProject = await updatedResponse.json();
          const titleSpan = document.getElementById('selectedProjectTitle');
          const descSpan = document.getElementById('selectedProjectDesc');
          if (titleSpan && descSpan) {
            titleSpan.textContent = updatedProject.title || updatedProject.name || '';
            descSpan.textContent = updatedProject.description || '';
          }
        }
      } catch (error) {
        console.warn('No se pudo actualizar la información del proyecto en pantalla:', error);
      }
    }
    
  } catch (error) {
    console.error('Error al guardar cambios:', error);
    
    // Mostrar error más específico
    let errorMessage = error.message;
    if (errorMessage.includes('fetch')) {
      errorMessage = 'Error de conexión. Verifique su conexión a internet y que el servidor esté disponible.';
    }
    
    showErrorMessage(errorMessage);
  } finally {
    // Resetear estado de loading
    confirmBtn.disabled = false;
    btnText.classList.remove('d-none');
    btnLoading.classList.add('d-none');
  }
}

function showSuccessMessage(message) {
  // Crear un toast de Bootstrap para mostrar el mensaje de éxito
  const toastHTML = `
    <div class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-check-circle me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', toastHTML);
  const toastElement = document.querySelector('.toast:last-child');
  const toast = new bootstrap.Toast(toastElement, {
    delay: 3000
  });
  
  toast.show();
  
  // Remover el elemento del DOM después de que se oculte
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

function showErrorMessage(message) {
  // Crear un toast de Bootstrap para mostrar el mensaje de error
  const toastHTML = `
    <div class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-exclamation-circle me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', toastHTML);
  const toastElement = document.querySelector('.toast:last-child');
  const toast = new bootstrap.Toast(toastElement, {
    delay: 5000 // Mostrar errores por más tiempo
  });
  
  toast.show();
  
  // Remover el elemento del DOM después de que se oculte
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}
