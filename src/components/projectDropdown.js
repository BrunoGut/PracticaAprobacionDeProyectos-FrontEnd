// Componente reutilizable para seleccionar proyectos con dropdown
// Uso: createProjectDropdown(container, { projects, onSelect, placeholder, initialValue })

export function createProjectDropdown(container, {
  projects = [],
  onSelect = () => {},
  placeholder = 'ID',
  initialValue = ''
} = {}) {
  if (!container) return;
  container.innerHTML = `
    <div class="input-group">
      <input type="text" class="form-control project-input" placeholder="${placeholder}" value="${initialValue}" />
      <button class="btn btn-outline-secondary dropdown-toggle btn-dropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="bi bi-list"></i>
      </button>
      <ul class="dropdown-menu dropdown-menu-end project-dropdown-menu"></ul>
    </div>
  `;
  const input = container.querySelector('.project-input');
  const menu = container.querySelector('.project-dropdown-menu');

  function renderMenu(list) {
    menu.innerHTML = list.map(p => `
      <li><a class="dropdown-item" data-id="${p.id}" data-title="${p.title || p.name || ''}" href="#">
        <span class='dropdown-title'>${p.title || p.name || p.id}</span>
        <span class='dropdown-id'>${p.id}</span>
      </a></li>
    `).join('');
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const id = a.getAttribute('data-id');
        const title = a.getAttribute('data-title');
        input.value = id;
        onSelect({ id, title });
      });
    });
  }

  renderMenu(projects);

  // Si quieres filtrar por texto, puedes agregar aquí lógica de búsqueda
  // input.addEventListener('input', ...)

  // Permite actualizar los proyectos dinámicamente
  return {
    setProjects(newProjects) {
      renderMenu(newProjects);
    },
    setValue(val) {
      input.value = val;
    },
    getValue() {
      return input.value;
    }
  };
} 