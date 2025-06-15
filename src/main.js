const sectionsData = [
  {
    id: 'home',
    title: 'Bienvenido',
    html: '<img src="https://source.unsplash.com/1200x300/?office" class="hero-img" alt="office"/><p class="lead">Utiliza la aplicación para crear y administrar proyectos de manera sencilla.</p>'
  },
  {
    id: 'create-project',
    title: 'Crear Nuevo Proyecto',
    endpoint: 'https://localhost:7062/api/Project',
    method: 'POST',
    submitText: 'Crear proyecto',
    fields: [
      { label: 'Título', name: 'title', type: 'text', placeholder: 'Título del proyecto' },
      { label: 'Descripción', name: 'description', type: 'text', placeholder: 'Descripción' },
      { label: 'Monto Estimado', name: 'estimatedAmount', type: 'number', placeholder: 'Ej: 45000' },
      { label: 'Duración Estimada (días)', name: 'estimatedDuration', type: 'number', placeholder: 'Ej: 15' },
      { label: 'ID Área', name: 'areaId', type: 'number', placeholder: 'Ej: 1' },
      { label: 'ID Usuario', name: 'user', type: 'number', placeholder: 'Ej: 4' },
      { label: 'ID Tipo', name: 'typeId', type: 'number', placeholder: 'Ej: 1' }
    ]
  },
  {
    id: 'edit-project',
    title: 'Editar Proyecto',
    endpoint: 'https://localhost:7062/api/Project',
    method: 'PUT',
    submitText: 'Guardar cambios',
    fields: [
      { label: 'ID Proyecto', name: 'id', type: 'number', placeholder: 'ID del proyecto' },
      { label: 'Título', name: 'title', type: 'text', placeholder: 'Nuevo título' },
      { label: 'Descripción', name: 'description', type: 'text', placeholder: 'Nueva descripción' }
    ]
  },
  {
    id: 'approve-project',
    title: 'Aprobar Proyecto',
    endpoint: 'https://localhost:7062/api/Project/approve',
    method: 'PUT',
    submitText: 'Aprobar',
    fields: [
      { label: 'ID Proyecto', name: 'projectId', type: 'number', placeholder: 'ID' },
      { label: 'Paso', name: 'step', type: 'text', placeholder: 'Paso a aprobar' }
    ]
  },
  {
    id: 'search-project',
    title: 'Buscar Proyecto',
    endpoint: 'https://localhost:7062/api/Project/search',
    method: 'GET',
    submitText: 'Buscar',
    fields: [
      { label: 'Filtro', name: 'term', type: 'text', placeholder: 'Ingrese búsqueda' }
    ]
  }
];

const render = () => {
  const main = document.getElementById('main');

  sectionsData.forEach(sectionData => {
    // contenedor de sección
    const section = document.createElement('section');
    section.id = sectionData.id;
    section.classList.add('section', 'card', 'card-body');

    // título
    const h2 = document.createElement('h2');
    h2.textContent = sectionData.title;
    h2.classList.add('h4', 'mb-3');
    section.appendChild(h2);

    if (sectionData.fields) {
      // formulario
      const form = document.createElement('form');
      form.classList.add('form');

      sectionData.fields.forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('mb-3');

        const label = document.createElement('label');
        label.setAttribute('for', field.name);
        label.classList.add('form-label');
        label.textContent = field.label;
        wrapper.appendChild(label);

        const input = document.createElement('input');
        input.type = field.type;
        input.id = field.name;
        input.name = field.name;
        input.placeholder = field.placeholder;
        input.classList.add('form-control');
        wrapper.appendChild(input);

        form.appendChild(wrapper);
      });

      // botón de envío
      const btn = document.createElement('button');
      btn.type = 'submit';
      btn.textContent = sectionData.submitText || 'Enviar';
      btn.classList.add('btn', 'btn-success');
      form.appendChild(btn);

      // área de resultados
      const resultDiv = document.createElement('div');
      resultDiv.classList.add('result');
      section.appendChild(resultDiv);

      // escucha el submit
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const payload = {};
        sectionData.fields.forEach(f => {
          const val = form[f.name].value;
          payload[f.name] = f.type === 'number' ? Number(val) : val;
        });

      try {
        let resp;
        if (sectionData.method === 'GET') {
          const query = new URLSearchParams(payload).toString();
          resp = await fetch(`${sectionData.endpoint}?${query}`);
        } else {
          resp = await fetch(sectionData.endpoint, {
            method: sectionData.method || 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
        if (!resp.ok) {
          const text = await resp.text();
          resultDiv.textContent = `Error ${resp.status}: ${text}`;
          resultDiv.classList.add('error');
        } else {
          const data = await resp.json();
          resultDiv.textContent = '✅ Operación exitosa:\n' + JSON.stringify(data, null, 2);
          resultDiv.classList.remove('error');
          resultDiv.classList.add('success');
          form.reset();
        }
      } catch (err) {
        resultDiv.textContent = `Error de red: ${err.message}`;
        resultDiv.classList.add('error');
      }
    });
      section.appendChild(form);
    } else if (sectionData.html) {
      section.insertAdjacentHTML('beforeend', sectionData.html);
    }
    main.appendChild(section);
  });
};

window.addEventListener('DOMContentLoaded', render);
