function showConfirmModal({ title, message, onConfirm, buttonStyle }) {
  const old = document.getElementById('confirmModal');
  if (old) old.remove();
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = `
    <div class="modal fade confirm-modal" tabindex="-1" id="confirmModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-check-circle"></i>
              ${title}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div class="project-summary">
              ${message}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-2"></i>
              Cancelar
            </button>
            <button type="button" class="btn btn-success" id="confirmActionBtn">
              <i class="bi bi-check-circle me-2"></i>
              Confirmar
            </button>
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

function showSuccessModal({ title, message, onClose }) {
  console.log('showSuccessModal llamada con:', { title, message });
  const old = document.getElementById('successModal');
  if (old) old.remove();
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = `
    <div class="modal fade success-modal" tabindex="-1" id="successModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-check-circle-fill"></i>
              ${title}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body text-center">
            <div class="success-icon">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <div class="success-message">
              ${message}
            </div>
          </div>
          <div class="modal-footer justify-content-center">
            <button type="button" class="btn btn-success" data-bs-dismiss="modal">
              <i class="bi bi-check-lg me-2"></i>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modalDiv);
  const modal = new bootstrap.Modal(modalDiv.querySelector('.modal'));
  modal.show();
  modalDiv.querySelector('.btn-close, .btn-success').onclick = () => {
    modal.hide();
    setTimeout(() => modalDiv.remove(), 500);
    if (typeof onClose === 'function') onClose();
  };
}

window.showConfirmModal = showConfirmModal;
window.showSuccessModal = showSuccessModal; 