// Componente reutilizable para dropdown de proyectos
// Uso: renderProjectDropdown({ inputId, dropdownId, onSelect })

function renderProjectDropdown({ inputId, dropdownId, onSelect }) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;

  fetch(`${API_BASE_URL}/api/Project`)
    .then(resp => resp.ok ? resp.json() : [])
    .then(projects => {
      dropdown.innerHTML = projects
        .map(p => `<li><a class="dropdown-item" data-id="${p.id}" href="#">${p.id} - ${p.title || p.name}</a></li>`)
        .join('');
      dropdown.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          const id = a.getAttribute('data-id');
          input.value = id;
          if (typeof onSelect === 'function') onSelect(id, p);
        });
      });
    })
    .catch(() => {
      dropdown.innerHTML = '<li class="dropdown-item text-danger">Error cargando proyectos</li>';
    });
}

window.renderProjectDropdown = renderProjectDropdown; 