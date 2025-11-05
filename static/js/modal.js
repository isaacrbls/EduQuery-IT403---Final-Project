const Modal = {
    overlay: null,

    init() {
        if (this.overlay) return;
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
        document.body.appendChild(this.overlay);
    },

    show(options) {
        this.init();
        
        const {
            title = 'Confirmation',
            message = 'Are you sure?',
            type = 'warning',
            icon = 'warning',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            onConfirm = () => {},
            onCancel = () => {},
            showCancel = true,
            confirmDanger = false
        } = options;

        const iconMap = {
            warning: 'warning',
            danger: 'error',
            success: 'check_circle',
            info: 'info'
        };

        const modalHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-icon ${type}">
                        <span class="material-icons">${iconMap[icon] || iconMap[type]}</span>
                    </div>
                    <h3 class="modal-title">${title}</h3>
                </div>
                <div class="modal-body">
                    <p class="modal-message">${message}</p>
                </div>
                <div class="modal-footer">
                    ${showCancel ? `<button class="modal-btn modal-btn-cancel" data-action="cancel">${cancelText}</button>` : ''}
                    <button class="modal-btn modal-btn-confirm ${confirmDanger ? 'danger' : ''}" data-action="confirm">${confirmText}</button>
                </div>
            </div>
        `;

        this.overlay.innerHTML = modalHTML;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const confirmBtn = this.overlay.querySelector('[data-action="confirm"]');
        const cancelBtn = this.overlay.querySelector('[data-action="cancel"]');

        confirmBtn.addEventListener('click', () => {
            onConfirm();
            this.close();
        });

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                onCancel();
                this.close();
            });
        }

        document.addEventListener('keydown', this.handleEscape);
    },

    alert(options) {
        this.init();
        
        const {
            title = 'Notice',
            message = '',
            type = 'info',
            icon = 'info',
            okText = 'OK',
            onClose = () => {}
        } = options;

        const iconMap = {
            warning: 'warning',
            danger: 'error',
            success: 'check_circle',
            info: 'info'
        };

        const modalHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-icon ${type}">
                        <span class="material-icons">${iconMap[icon] || iconMap[type]}</span>
                    </div>
                    <h3 class="modal-title">${title}</h3>
                </div>
                <div class="modal-body">
                    <p class="modal-message">${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-ok" data-action="ok">${okText}</button>
                </div>
            </div>
        `;

        this.overlay.innerHTML = modalHTML;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const okBtn = this.overlay.querySelector('[data-action="ok"]');
        okBtn.addEventListener('click', () => {
            onClose();
            this.close();
        });

        document.addEventListener('keydown', this.handleEscape);
    },

    close() {
        if (!this.overlay) return;
        
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this.handleEscape);
    },

    handleEscape(e) {
        if (e.key === 'Escape') {
            Modal.close();
        }
    }
};

window.Modal = Modal;
