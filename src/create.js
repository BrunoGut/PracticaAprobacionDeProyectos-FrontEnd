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
    } else {
      console.error(`Error ${resp.status} cargando ${endpoint}`);
    }
  } catch (err) {
    console.error('Error cargando opciones', err);
  }
}

function updateUserDisplay() {
  const currentUser = getCurrentUser();
  const userField = document.getElementById('User');
  const userDisplayField = document.getElementById('userDisplay');
  
  if (userDisplayField) {
    if (currentUser) {
      userDisplayField.innerHTML = `
        <div class="selected-user-info">
          <i class="bi bi-person-check me-2"></i>
          <span class="fw-semibold">${currentUser.name}</span>
          <small class="text-muted ms-2">(${currentUser.role})</small>
        </div>
      `;
    } else {
      userDisplayField.innerHTML = `
        <div class="selected-user-info">
          <i class="bi bi-person me-2"></i>
          <span class="fw-semibold text-muted">Cargando usuario...</span>
        </div>
      `;
    }
  }
  
  // Establecer el valor del usuario en el campo oculto si existe
  if (userField && currentUser) {
    userField.value = currentUser.id;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  populateSelect('Area', '/api/Area');
  populateSelect('Type', '/api/ProjectType');

  // Esperar a que el selector de usuario se inicialice completamente
  // Esto asegura que el usuario esté cargado antes de actualizar la pantalla
  if (typeof initializeUserSelector === 'function') {
    await initializeUserSelector();
  }
  
  // Actualizar la visualización del usuario cuando cambie
  updateUserDisplay();
  document.addEventListener('userChanged', updateUserDisplay);

  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const form = document.getElementById('createForm');
      if (form) form.reset();

      const result = document.getElementById('result');
      if (result) result.innerHTML = '';

      // Mantener el usuario seleccionado después de limpiar
      updateUserDisplay();

      clearBtn.blur();
    });
  }

  setTimeout(() => document.activeElement?.blur(), 0);

  setupForm({
    formId: 'createForm',
    endpoint: `${API_BASE_URL}/api/Project`,
    method: 'POST',
    confirmBeforeSubmit: true,
    beforeSubmit: (payload) => {
      // Asegurar que el usuario esté establecido
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('No se ha seleccionado un usuario válido. Por favor, selecciona un usuario en la barra de navegación.');
      }
      payload.User = currentUser.id;
      return payload;
    },
    renderResult: (data, div) => {
      const projectId = data.id; 
      // Redirigir automáticamente a la pantalla de ver proyecto
      window.location.href = 'view.html?id=' + encodeURIComponent(projectId);
    }
  });
});
