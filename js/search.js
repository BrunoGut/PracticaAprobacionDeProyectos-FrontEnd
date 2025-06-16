document.addEventListener('DOMContentLoaded', () => {
  setupForm({
    formId: 'searchForm',
    endpoint: `${API_BASE_URL}/api/Project`,
    method: 'GET',
    renderResult: (data, div) => {
      const projects = Array.isArray(data) ? data : [data];
      div.innerHTML = projects
        .map(p =>
          '<div class="card mb-3"><div class="card-body"><pre>' +
          JSON.stringify(p, null, 2) +
          '</pre></div></div>'
        )
        .join('');
    }
  });
});
