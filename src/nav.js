function renderNav() {
  return (
    '<div class="container">' +
    '<a class="navbar-brand" href="index.html">Gestión de Proyectos</a>' +
    '<ul class="navbar-nav flex-row ms-auto">' +
    '<li class="nav-item me-3"><a class="nav-link" href="create.html"><i class="bi bi-plus-circle"></i> Crear</a></li>' +
    '<li class="nav-item me-3"><a class="nav-link" href="edit.html"><i class="bi bi-pencil-square"></i> Editar</a></li>' +
    '<li class="nav-item me-3"><a class="nav-link" href="approve.html"><i class="bi bi-check-circle"></i> Aprobar</a></li>' +
    '<li class="nav-item"><a class="nav-link" href="search.html"><i class="bi bi-search"></i> Buscar</a></li>' +
    '</ul>' +
    '</div>'
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.innerHTML = renderNav();
  }
});
