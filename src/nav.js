function renderNav() {
  return (
    '<div class="container d-flex align-items-center">' +
    '<a class="navbar-brand d-flex align-items-center me-auto" href="index.html">' +
    '<div class="logo"><img src="img/projectar_nav.png" alt="Logo" style="max-width: 100%; max-height: 100%; display: block; margin: 0 auto;"/></div>' +
    '</a>' +
    '<ul class="navbar-nav flex-row">' +
    '<li class="nav-item me-3"><a class="nav-link" href="create.html"><i class="bi bi-plus-circle"></i> Crear</a></li>' +
    
    '<li class="nav-item me-3"><a class="nav-link" href="approve.html"><i class="bi bi-check-circle"></i> Aprobar</a></li>' +
    '<li class="nav-item me-3"><a class="nav-link" href="view.html"><i class="bi bi-eye"></i> Ver</a></li>' +
    '<li class="nav-item me-3"><a class="nav-link" href="search.html"><i class="bi bi-search"></i> Buscar</a></li>' +
    '</ul>' +
    (typeof renderUserSelector === 'function' ? renderUserSelector() : '') +
    '</div>'
  );
}

// Función para inicializar la navegación
async function initializeNav() {
  const nav = document.getElementById('mainNav');
  if (nav) {
    // Si el selector de usuario está disponible, esperar a que se inicialice
    if (typeof initializeUserSelector === 'function') {
      // Esperar a que el selector de usuario esté listo
      await new Promise(resolve => {
        // Si ya está inicializado, continuar inmediatamente
        if (window.getCurrentUser && window.getCurrentUser()) {
          resolve();
        } else {
          // Escuchar el evento de usuario cargado o usar un timeout
          const checkUserLoaded = () => {
            if (window.getCurrentUser && window.getCurrentUser()) {
              resolve();
            } else {
              setTimeout(checkUserLoaded, 100);
            }
          };
          checkUserLoaded();
        }
      });
    }
    
    // Renderizar la navegación
    nav.innerHTML = renderNav();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initializeNav();
});

// Escuchar cambios de usuario para actualizar la navegación
document.addEventListener('userChanged', () => {
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.innerHTML = renderNav();
  }
});
