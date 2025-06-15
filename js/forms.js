function setupForm(config) {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById(config.formId);
    if (!form) return;
    const resultDiv = document.getElementById('result');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const payload = {};
      for (const [key, value] of formData.entries()) {
        const input = form.elements[key];
        if (input && input.type === 'number') {
          payload[key] = value.trim() === '' ? null : Number(value);
        } else {
          payload[key] = value;
        }
      }

      let endpoint = config.endpoint;
      if (config.pathParams) {
        for (const param of config.pathParams) {
          const val = payload[param];
          endpoint = endpoint.replace(`{${param}}`, encodeURIComponent(val));
          delete payload[param];
        }
      }

      try {
        let resp;
        if (config.method === 'GET') {
          const query = new URLSearchParams(payload).toString();
          resp = await fetch(query ? `${endpoint}?${query}` : endpoint);
        } else {
          resp = await fetch(endpoint, {
            method: config.method || 'POST',
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
            resultDiv.classList.remove('error');
            resultDiv.classList.add('success');
            if (typeof config.renderResult === 'function') {
              config.renderResult(data, resultDiv);
            } else {
              resultDiv.textContent = '✅ Operación exitosa:\n' + JSON.stringify(data, null, 2);
            }
            form.reset();
          }
      } catch (err) {
        resultDiv.textContent = `Error de red: ${err.message}`;
        resultDiv.classList.add('error');
      }
    });
  });
}

window.setupForm = setupForm;
