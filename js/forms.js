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
          payload[key] = Number(value);
        } else {
          payload[key] = value;
        }
      }
      try {
        let resp;
        if (config.method === 'GET') {
          const query = new URLSearchParams(payload).toString();
          resp = await fetch(`${config.endpoint}?${query}`);
        } else {
          resp = await fetch(config.endpoint, {
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
  });
}

window.setupForm = setupForm;
