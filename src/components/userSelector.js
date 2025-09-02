// Lista de usuarios del sistema (se carga dinámicamente desde el backend)
let USERS = [];

// Usuario seleccionado actualmente 
let currentUser = null;

/**
 * Carga los usuarios desde el backend
 * @returns {Promise<Array>} Lista de usuarios
 */
async function loadUsersFromBackend() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/User`);
    if (resp.ok) {
      const users = await resp.json();
      // Normalizar la estructura de los usuarios según la respuesta real del backend
      USERS = users.map(user => ({
        id: user.id,
        name: user.name || user.fullName || user.title || user.username || user.email || `Usuario ${user.id}`,
        role: user.role?.name || user.role || user.position || user.department || 'Usuario',
        email: user.email || user.mail || `${user.name || 'usuario'}@email.com`
      }));
      
      // Si no hay usuario actual, establecer el primero como predeterminado
      if (!currentUser && USERS.length > 0) {
        currentUser = USERS[0];
      }
      
      return USERS;
    } else {
      console.error('Error al cargar usuarios del backend:', resp.status);
      return [];
    }
  } catch (err) {
    console.error('Error de red al cargar usuarios:', err);
    return [];
  }
}

/**
 * Obtiene el usuario actual seleccionado
 * @returns {Object} Usuario actual
 */
function getCurrentUser() {
  return currentUser;
}

/**
 * Establece el usuario actual
 * @param {Object} user - Usuario a establecer como actual
 */
function setCurrentUser(user) {
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  // Disparar evento personalizado para notificar el cambio de usuario
  const event = new CustomEvent('userChanged', { detail: user });
  document.dispatchEvent(event);
  
  updateUserSelectorDisplay();
}

/**
 * Busca un usuario por ID
 * @param {number} userId - ID del usuario
 * @returns {Object|null} Usuario encontrado o null
 */
function getUserById(userId) {
  return USERS.find(user => user.id === userId) || null;
}

/**
 * Obtiene todos los usuarios disponibles
 * @returns {Array} Lista de usuarios
 */
function getAllUsers() {
  return USERS;
}

/**
 * Renderiza el selector de usuario para la navegación
 * @returns {string} HTML del selector de usuario
 */
function renderUserSelector() {
  const user = getCurrentUser();
  
  if (!user || USERS.length === 0) {
    return (
      '<div class="user-selector-container">' +
        '<div class="dropdown">' +
          '<button class="btn btn-outline-light dropdown-toggle user-selector-btn" type="button" disabled>' +
            '<i class="bi bi-person-circle me-2"></i>' +
            '<span class="user-name">Cargando...</span>' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }
  
  return (
    '<div class="user-selector-container">' +
      '<div class="dropdown">' +
        '<button class="btn btn-outline-light dropdown-toggle user-selector-btn" type="button" id="userSelectorDropdown" data-bs-toggle="dropdown" aria-expanded="false">' +
          '<i class="bi bi-person-circle me-2"></i>' +
          '<span class="user-name">' + (user.name || 'Sin nombre') + '</span>' +
        '</button>' +
        '<ul class="dropdown-menu user-dropdown" aria-labelledby="userSelectorDropdown">' +
          USERS.map(u => 
            '<li>' +
              '<a class="dropdown-item user-option ' + (u.id === user.id ? 'active' : '') + '" href="#" data-user-id="' + u.id + '">' +
                '<div class="user-info">' +
                  '<div class="user-main">' +
                    '<i class="bi bi-person-fill me-2"></i>' +
                    '<span class="user-display-name">' + (u.name || 'Sin nombre') + '</span>' +
                  '</div>' +
                  '<div class="user-details">' +
                    '<small class="text-muted">' + (u.role || 'Usuario') + ' • ' + (u.email || 'Sin email') + '</small>' +
                  '</div>' +
                '</div>' +
              '</a>' +
            '</li>'
          ).join('') +
        '</ul>' +
      '</div>' +
    '</div>'
  );
}

/**
 * Actualiza la visualización del selector de usuario
 */
function updateUserSelectorDisplay() {
  const userNameElement = document.querySelector('.user-selector-btn .user-name');
  if (userNameElement && currentUser) {
    userNameElement.textContent = currentUser.name || 'Sin nombre';
  }
  
  // Actualizar elementos activos en el dropdown
  const userOptions = document.querySelectorAll('.user-option');
  userOptions.forEach(option => {
    const userId = parseInt(option.getAttribute('data-user-id'));
    if (currentUser && userId === currentUser.id) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

/**
 * Re-renderiza el selector de usuario completo
 */
function reRenderUserSelector() {
  const nav = document.getElementById('mainNav');
  if (nav && typeof renderNav === 'function') {
    nav.innerHTML = renderNav();
  }
}

/**
 * Inicializa el selector de usuario
 */
async function initializeUserSelector() {
  try {
    // Cargar usuarios del backend
    await loadUsersFromBackend();
    
    // Cargar usuario desde localStorage si existe y es válido
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser && USERS.length > 0) {
      try {
        const parsed = JSON.parse(savedUser);
        const user = getUserById(parsed.id);
        if (user) {
          currentUser = user;
        } else if (!currentUser && USERS.length > 0) {
          // Si el usuario guardado no existe, usar el primero disponible
          currentUser = USERS[0];
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      } catch (e) {
        console.warn('Error al cargar usuario guardado:', e);
        if (USERS.length > 0) {
          currentUser = USERS[0];
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      }
    } else if (!currentUser && USERS.length > 0) {
      // Si no hay usuario guardado, usar el primero disponible
      currentUser = USERS[0];
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // Disparar evento para notificar que el usuario está listo
    const userLoadedEvent = new CustomEvent('userLoaded', { detail: currentUser });
    document.dispatchEvent(userLoadedEvent);
    
    // Re-renderizar la navegación con los usuarios cargados
    reRenderUserSelector();
    
    // Agregar event listeners
    document.addEventListener('click', (e) => {
      if (e.target.closest('.user-option')) {
        e.preventDefault();
        const option = e.target.closest('.user-option');
        const userId = parseInt(option.getAttribute('data-user-id'));
        const user = getUserById(userId);
        
        if (user) {
          setCurrentUser(user);
        }
      }
    });
    
  } catch (error) {
    console.error('Error al inicializar selector de usuario:', error);
  }
}

// Exportar funciones para uso global
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.getUserById = getUserById;
window.getAllUsers = getAllUsers;
window.renderUserSelector = renderUserSelector;
window.initializeUserSelector = initializeUserSelector;
window.loadUsersFromBackend = loadUsersFromBackend;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  await initializeUserSelector();
});
