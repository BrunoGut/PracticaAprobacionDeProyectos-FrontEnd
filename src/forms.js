function setupForm(config) {
  const form = document.getElementById(config.formId);
  if (!form) return;
  const resultDiv = document.getElementById('result');
  const overlay = document.getElementById('loadingOverlay');
  form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (overlay) overlay.classList.remove('d-none');
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
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
          const filtered = Object.fromEntries(
            Object.entries(payload).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
          );
          const query = new URLSearchParams(filtered).toString();
          resp = await fetch(query ? `${endpoint}?${query}` : endpoint);
        } else {
          resp = await fetch(endpoint, {
            method: config.method || 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
          if (!resp.ok) {
            let message = `Error ${resp.status}`;
            try {
              const errData = await resp.json();
              message = errData.message || errData.title || JSON.stringify(errData);
            } catch {
              try {
                message = await resp.text();
              } catch {}
            }
            resultDiv.innerHTML =
              '<div class="alert alert-danger d-flex align-items-center">' +
              '<i class="bi bi-exclamation-triangle-fill me-2"></i>' +
              message +
              '</div>';
            resultDiv.classList.add('error');
            resultDiv.classList.remove('success');
          } else {
            const data = await resp.json();
            resultDiv.classList.remove('error');
            resultDiv.classList.add('success');
            if (typeof config.renderResult === 'function') {
              config.renderResult(data, resultDiv);
            } else {
              resultDiv.innerHTML =
                '<div class="alert alert-success d-flex align-items-center">' +
                '<i class="bi bi-check-circle-fill me-2"></i>' +
                'Operación exitosa' +
                '</div>';
            }
            if (config.reset !== false) {
              form.reset();
            }
            if (typeof config.afterSuccess === 'function') {
              config.afterSuccess(data, form);
            }
          }
      } catch (err) {
        resultDiv.innerHTML =
          '<div class="alert alert-danger d-flex align-items-center">' +
          '<i class="bi bi-exclamation-triangle-fill me-2"></i>' +
          `Error de red: ${err.message}` +
          '</div>';
        resultDiv.classList.add('error');
        resultDiv.classList.remove('success');
      } finally {
        if (overlay) overlay.classList.add('d-none');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
}

window.setupForm = setupForm;
