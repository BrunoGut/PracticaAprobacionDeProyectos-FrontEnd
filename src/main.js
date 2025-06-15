const sectionsData = [
  {
    id: 'create-project',
    title: 'Crear Nuevo Proyecto',
    endpoint: 'https://localhost:7062/api/Project',
    fields: [
      { label: 'Título', name: 'title', type: 'text', placeholder: 'Título del proyecto' },
      { label: 'Descripción', name: 'description', type: 'text', placeholder: 'Descripción' },
      { label: 'Monto Estimado', name: 'estimatedAmount', type: 'number', placeholder: 'Ej: 45000' },
      { label: 'Duración Estimada (días)', name: 'estimatedDuration', type: 'number', placeholder: 'Ej: 15' },
      { label: 'ID Área', name: 'areaId', type: 'number', placeholder: 'Ej: 1' },
      { label: 'ID Usuario', name: 'user', type: 'number', placeholder: 'Ej: 4' },
      { label: 'ID Tipo', name: 'typeId', type: 'number', placeholder: 'Ej: 1' },
    ]
  }
];

const render = () => {
  const main = document.getElementById('main');

  sectionsData.forEach(sectionData => {
    // contenedor de sección
    const section = document.createElement('section');
    section.id = sectionData.id;
    section.classList.add('section');

    // título
    const h2 = document.createElement('h2');
    h2.textContent = sectionData.title;
    section.appendChild(h2);

    // formulario
    const form = document.createElement('form');
    form.classList.add('form');

    sectionData.fields.forEach(field => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('form-group');

      const label = document.createElement('label');
      label.setAttribute('for', field.name);
      label.textContent = field.label;
      wrapper.appendChild(label);

      const input = document.createElement('input');
      input.type = field.type;
      input.id = field.name;
      input.name = field.name;
      input.placeholder = field.placeholder;
      wrapper.appendChild(input);

      form.appendChild(wrapper);
    });

    // botón de envío
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = 'Crear proyecto';
    btn.classList.add('btn');
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
        const resp = await fetch(sectionData.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!resp.ok) {
          const text = await resp.text();
          resultDiv.textContent = `Error ${resp.status}: ${text}`;
          resultDiv.classList.add('error');
        } else {
          const data = await resp.json();
          resultDiv.textContent = '✅ Proyecto creado:\n' + JSON.stringify(data, null, 2);
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
    main.appendChild(section);
  });
};

window.addEventListener('DOMContentLoaded', render);
