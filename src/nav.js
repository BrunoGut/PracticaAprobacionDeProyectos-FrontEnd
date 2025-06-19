function renderNav() {
  return (
    '<div class="container d-flex align-items-center">' +
    '<a class="navbar-brand d-flex align-items-center me-auto" href="index.html">' +
    '<div class="logo"><img src="img/logo_projectar.png" alt="Logo" style="max-width: 100%; max-height: 100%; display: block; margin: 0 auto;"/></div>' +
    '</a>' +
    '<ul class="navbar-nav flex-row ms-auto">' +
    '<li class="nav-item me-3"><a class="nav-link" href="create.html"><i class="bi bi-plus-circle"></i> Crear</a></li>' +
    '<li class="nav-item me-3"><a class="nav-link" href="edit.html"><i class="bi bi-pencil-square"></i> Editar</a></li>' +
    '<li class="nav-item me-3"><a class="nav-link" href="approve.html"><i class="bi bi-check-circle"></i> Aprobar</a></li>' +
    '<li class="nav-item me-3"><a class="nav-link" href="view.html"><i class="bi bi-eye"></i> Ver</a></li>' +
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
