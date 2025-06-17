// Componente reutilizable para mostrar un modal de confirmación
// Uso: showConfirmModal({ title, message, onConfirm })
function showConfirmModal({ title, message, onConfirm }) {
  // Eliminar cualquier modal anterior
  const old = document.getElementById('confirmModal');
  if (old) old.remove();
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = `
    <div class="modal fade" tabindex="-1" id="confirmModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div>${message}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-success" id="confirmActionBtn">Confirmar</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modalDiv);
  const modal = new bootstrap.Modal(modalDiv.querySelector('.modal'));
  modal.show();
  modalDiv.querySelector('#confirmActionBtn').onclick = () => {
    modal.hide();
    setTimeout(() => modalDiv.remove(), 500);
    if (typeof onConfirm === 'function') onConfirm();
  };
  modalDiv.querySelector('.btn-close, .btn-secondary').onclick = () => {
    modal.hide();
    setTimeout(() => modalDiv.remove(), 500);
  };
}
window.showConfirmModal = showConfirmModal; 