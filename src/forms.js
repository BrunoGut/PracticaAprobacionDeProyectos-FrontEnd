function setupForm(config) {
  const form = document.getElementById(config.formId);
  if (!form) return;
  const resultDiv = document.getElementById('result');
  const overlay = document.getElementById('loadingOverlay');

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

  if (config.confirmBeforeSubmit && !form._confirmed) {
    const defaultFields = ['title', 'description', 'estimatedAmount', 'estimatedDuration'];
    let fieldsToShow = defaultFields;
    let title = '¿Confirmar creación del proyecto?';
    let message;

    if (typeof config.confirmBeforeSubmit === 'object') {
      fieldsToShow = config.confirmBeforeSubmit.fields || fieldsToShow;
      title = config.confirmBeforeSubmit.title || title;
      if (config.confirmBeforeSubmit.message) {
        message =
          typeof config.confirmBeforeSubmit.message === 'function'
            ? config.confirmBeforeSubmit.message(payload)
            : config.confirmBeforeSubmit.message;
      }
    }

    if (!message) {
      const fieldLabels = {
        title: 'Titulo',
        description: 'Descripcion',
        estimatedAmount: 'Monto',
        estimatedDuration: 'Duracion (en dias)'
      };
      message = fieldsToShow
        .map(key => {
          let value = payload[key] ?? '';
          if (key === 'estimatedAmount' && value !== '') {
            value = `$ ${value}`;
          }
          return `<strong>${fieldLabels[key] || key}:</strong> ${value}`;
        })
        .join('<br/>');
    }

    showConfirmModal({
      title,
      message,
      onConfirm: () => {
        form._confirmed = true;
        form.requestSubmit();
      },
      buttonStyle: 'border-radius: 24px;'
    });
    return;
  }

    form._confirmed = false;

    const submitBtn = form.querySelector('[type="submit"]');
    let originalBtnHtml;
    if (submitBtn) {
      submitBtn.classList.add('btn-check-animate');
      submitBtn.disabled = true;
      originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' + originalBtnHtml;
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
          '<div class="alert alert-warning d-flex align-items-center" style="background:#fff3cd;color:#856404;border-color:#ffeeba;">' +
          '<i class="bi bi-exclamation-triangle-fill me-2" style="color:#856404;"></i>' +
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
        if (submitBtn) {
          submitBtn.innerHTML = originalBtnHtml + '<span class="checkmark"><i class="bi bi-check-circle-fill"></i></span>';
          setTimeout(() => {
            submitBtn.innerHTML = originalBtnHtml;
            submitBtn.disabled = false;
          }, 1200);
        }
        return;
      }
    } catch (err) {
      resultDiv.innerHTML =
        '<div class="alert alert-warning d-flex align-items-center" style="background:#fff3cd;color:#856404;border-color:#ffeeba;">' +
        '<i class="bi bi-exclamation-triangle-fill me-2" style="color:#856404;"></i>' +
        `Error de red: ${err.message}` +
        '</div>';
      resultDiv.classList.add('error');
      resultDiv.classList.remove('success');
    } finally {
      if (submitBtn && originalBtnHtml && submitBtn.disabled) {
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.disabled = false;
      }
    }
  });
}

window.setupForm = setupForm;