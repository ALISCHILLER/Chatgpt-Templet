/* ==================== UI MANAGER CLASS ==================== */

class UIManager {
    constructor() {
        this.notifications = [];
        this.loadingScreen = null;
        this.modals = new Map();
        this.currentModal = null;
        
        this.init();
    }

    /* ==================== INITIALIZATION ==================== */

    init() {
        this.createNotificationsContainer();
        this.createLoadingScreen();
        this.setupModalSystem();
        this.setupKeyboardShortcuts();
    }

    createNotificationsContainer() {
        if (document.getElementById('notificationsContainer')) return;

        const container = document.createElement('div');
        container.id = 'notificationsContainer';
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }

    createLoadingScreen() {
        if (document.getElementById('loadingScreen')) return;

        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loadingScreen';
        loadingScreen.className = 'loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">بارگذاری...</div>
                <div class="loading-subtitle">لطفاً صبر کنید</div>
            </div>
        `;
        
        document.body.appendChild(loadingScreen);
        this.loadingScreen = loadingScreen;
    }

    setupModalSystem() {
        // Find all modals and register them
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            const modal = backdrop.querySelector('.modal');
            if (modal && modal.id) {
                this.modals.set(modal.id, {
                    element: modal,
                    backdrop: backdrop
                });
            }
        });

        // Setup close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal);
            }
        });

        // Setup escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal(this.currentModal);
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('chatSearch');
                if (searchInput) searchInput.focus();
            }

            // Ctrl/Cmd + / for help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.openHelpModal();
            }
        });
    }

    /* ==================== LOADING SCREEN ==================== */

    showLoadingScreen(text = 'بارگذاری...', subtitle = 'لطفاً صبر کنید') {
        if (!this.loadingScreen) return;

        const textEl = this.loadingScreen.querySelector('.loading-text');
        const subtitleEl = this.loadingScreen.querySelector('.loading-subtitle');
        
        if (textEl) textEl.textContent = text;
        if (subtitleEl) subtitleEl.textContent = subtitle;

        this.loadingScreen.classList.add('show');
    }

    hideLoadingScreen() {
        if (!this.loadingScreen) return;
        
        this.loadingScreen.classList.remove('show');
    }

    updateLoadingProgress(progress, text) {
        if (!this.loadingScreen) return;

        let progressBar = this.loadingScreen.querySelector('.loading-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'loading-progress';
            progressBar.innerHTML = '<div class="loading-progress-bar"></div>';
            this.loadingScreen.querySelector('.loading-content').appendChild(progressBar);
        }

        const progressBarFill = progressBar.querySelector('.loading-progress-bar');
        if (progressBarFill) {
            progressBarFill.style.width = `${progress}%`;
        }

        if (text) {
            const textEl = this.loadingScreen.querySelector('.loading-text');
            if (textEl) textEl.textContent = text;
        }
    }

    /* ==================== NOTIFICATIONS ==================== */

    showNotification(message, type = 'info', duration = 5000, title = null) {
        const notification = this.createNotification(message, type, title);
        const container = document.getElementById('notificationsContainer');
        
        if (container) {
            container.appendChild(notification.element);
            
            // Trigger show animation
            setTimeout(() => {
                notification.element.classList.add('show');
            }, 10);

            // Auto remove
            if (duration > 0) {
                notification.timer = setTimeout(() => {
                    this.removeNotification(notification.id);
                }, duration);
            }

            this.notifications.push(notification);
        }

        return notification.id;
    }

    createNotification(message, type, title) {
        const id = generateUUID();
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('data-notification-id', id);

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const titles = {
            success: 'موفقیت',
            error: 'خطا',
            warning: 'هشدار',
            info: 'اطلاعات'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-content">
                ${title || titles[type] ? `<div class="notification-title">${title || titles[type]}</div>` : ''}
                <div class="notification-message">${escapeHtml(message)}</div>
            </div>
            <button class="notification-close" onclick="ui.removeNotification('${id}')">
                <i class="fas fa-times"></i>
            </button>
            ${duration > 0 ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
        `;

        return {
            id,
            element: notification,
            type,
            message,
            timer: null
        };
    }

    removeNotification(id) {
        const notificationIndex = this.notifications.findIndex(n => n.id === id);
        if (notificationIndex === -1) return;

        const notification = this.notifications[notificationIndex];
        
        // Clear timer if exists
        if (notification.timer) {
            clearTimeout(notification.timer);
        }

        // Remove from DOM with animation
        if (notification.element) {
            notification.element.classList.remove('show');
            
            setTimeout(() => {
                if (notification.element.parentNode) {
                    notification.element.parentNode.removeChild(notification.element);
                }
            }, 300);
        }

        // Remove from array
        this.notifications.splice(notificationIndex, 1);
    }

    clearAllNotifications() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification.id);
        });
    }

    /* ==================== MODAL SYSTEM ==================== */

    openModal(modal) {
        if (typeof modal === 'string') {
            const modalData = this.modals.get(modal);
            modal = modalData?.element;
        }

        if (!modal) return;

        // Close current modal if exists
        if (this.currentModal) {
            this.closeModal(this.currentModal, false);
        }

        const backdrop = modal.closest('.modal-backdrop');
        if (backdrop) {
            backdrop.classList.add('show');
            this.currentModal = modal;

            // Focus management
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 100);
            }

            // Trap focus within modal
            this.trapFocus(modal);
        }
    }

    closeModal(modal, animate = true) {
        if (typeof modal === 'string') {
            const modalData = this.modals.get(modal);
            modal = modalData?.element;
        }

        if (!modal) return;

        const backdrop = modal.closest('.modal-backdrop');
        if (backdrop) {
            if (animate) {
                backdrop.classList.remove('show');
            } else {
                backdrop.classList.remove('show');
            }

            this.currentModal = null;
            this.removeFocusTrap();
        }
    }

    closeAllModals() {
        this.modals.forEach((modalData) => {
            this.closeModal(modalData.element, false);
        });
    }

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        this.focusTrapHandler = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', this.focusTrapHandler);
    }

    removeFocusTrap() {
        if (this.focusTrapHandler) {
            document.removeEventListener('keydown', this.focusTrapHandler);
            this.focusTrapHandler = null;
        }
    }

    /* ==================== STREAMING INDICATORS ==================== */

    showStreamingIndicator(text = 'در حال تایپ...') {
        let indicator = document.getElementById('streamingIndicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'streamingIndicator';
            indicator.className = 'streaming-indicator';
            
            const messagesContainer = document.getElementById('chatMessages');
            if (messagesContainer) {
                messagesContainer.appendChild(indicator);
            }
        }

        indicator.innerHTML = `
            <div class="streaming-dots">
                <div class="streaming-dot"></div>
                <div class="streaming-dot"></div>
                <div class="streaming-dot"></div>
            </div>
            <span class="streaming-text">${text}</span>
            <button class="btn-ghost btn-sm" onclick="app.cancelStreaming()">
                <i class="fas fa-stop"></i>
                توقف
            </button>
        `;

        // Scroll to show indicator
        setTimeout(() => {
            if (window.app) {
                window.app.scrollToBottom();
            }
        }, 100);
    }

    hideStreamingIndicator() {
        const indicator = document.getElementById('streamingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /* ==================== VOICE RECORDING UI ==================== */

    showVoiceRecording() {
        let modal = document.getElementById('voiceRecordingModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'voiceRecordingModal';
            modal.className = 'modal-backdrop';
            modal.innerHTML = `
                <div class="modal voice-recording-modal">
                    <div class="voice-recording">
                        <div class="voice-animation">
                            <i class="fas fa-microphone"></i>
                        </div>
                        <div class="voice-text">در حال ضبط صدا...</div>
                        <div class="voice-subtitle">صحبت کنید</div>
                        <button class="btn btn-danger" onclick="app.stopVoiceRecording()">
                            <i class="fas fa-stop"></i>
                            توقف ضبط
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        modal.classList.add('show');
    }

    hideVoiceRecording() {
        const modal = document.getElementById('voiceRecordingModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /* ==================== CONTEXT MENUS ==================== */

    showContextMenu(x, y, items) {
        this.hideContextMenu();

        const menu = document.createElement('div');
        menu.id = 'contextMenu';
        menu.className = 'context-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        items.forEach(item => {
            if (item === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'context-menu-separator';
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('button');
                menuItem.className = 'context-menu-item';
                menuItem.innerHTML = `
                    ${item.icon ? `<i class="${item.icon}"></i>` : ''}
                    <span>${item.label}</span>
                `;
                menuItem.onclick = () => {
                    this.hideContextMenu();
                    if (item.action) item.action();
                };
                menu.appendChild(menuItem);
            }
        });

        document.body.appendChild(menu);

        // Position adjustment to keep menu in viewport
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${y - rect.height}px`;
        }

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu, { once: true });
        }, 100);
    }

    hideContextMenu = () => {
        const menu = document.getElementById('contextMenu');
        if (menu) {
            menu.remove();
        }
    }

    /* ==================== TOOLTIPS ==================== */

    showTooltip(element, text, position = 'top') {
        this.hideTooltip();

        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        let left, top;

        switch (position) {
            case 'top':
                left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
                top = rect.top - tooltip.offsetHeight - 10;
                break;
            case 'bottom':
                left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
                top = rect.bottom + 10;
                break;
            case 'left':
                left = rect.left - tooltip.offsetWidth - 10;
                top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
                break;
            case 'right':
                left = rect.right + 10;
                top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
                break;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.classList.add('show');

        // Auto hide after delay
        setTimeout(() => {
            this.hideTooltip();
        }, 3000);
    }

    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    /* ==================== PROGRESS BARS ==================== */

    createProgressBar(container, id = 'progress') {
        const existing = container.querySelector(`#${id}`);
        if (existing) return existing;

        const progressBar = document.createElement('div');
        progressBar.id = id;
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = `
            <div class="progress-fill"></div>
            <div class="progress-text">0%</div>
        `;
        
        container.appendChild(progressBar);
        return progressBar;
    }

    updateProgressBar(progressBar, percentage) {
        const fill = progressBar.querySelector('.progress-fill');
        const text = progressBar.querySelector('.progress-text');
        
        if (fill) fill.style.width = `${percentage}%`;
        if (text) text.textContent = `${Math.round(percentage)}%`;
    }

    removeProgressBar(progressBar) {
        if (progressBar && progressBar.parentNode) {
            progressBar.parentNode.removeChild(progressBar);
        }
    }

    /* ==================== HELP SYSTEM ==================== */

    openHelpModal() {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) {
            this.openModal(helpModal);
        } else {
            this.createHelpModal();
        }
    }

    createHelpModal() {
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        modalBackdrop.innerHTML = `
            <div class="modal" id="helpModal">
                <div class="modal-header">
                    <h3 class="modal-title">راهنما</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="help-section">
                        <h4>میانبرهای کیبورد</h4>
                        <div class="shortcut-list">
                            <div class="shortcut-item">
                                <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
                                <span>ارسال پیام</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl</kbd> + <kbd>N</kbd>
                                <span>گفتگوی جدید</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl</kbd> + <kbd>,</kbd>
                                <span>تنظیمات</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl</kbd> + <kbd>S</kbd>
                                <span>صادرات گفتگو</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl</kbd> + <kbd>K</kbd>
                                <span>جستجوی گفتگو</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Esc</kbd>
                                <span>لغو/بستن</span>
                            </div>
                        </div>
                    </div>
                    <div class="help-section">
                        <h4>ویژگی‌ها</h4>
                        <ul>
                            <li>پشتیبانی از مدل‌های GPT-4o, GPT-4, GPT-3.5</li>
                            <li>حالت استریم و غیراستریم</li>
                            <li>آپلود و تحلیل فایل‌ها</li>
                            <li>ورودی صوتی</li>
                            <li>تم‌های مختلف</li>
                            <li>صادرات گفتگو</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalBackdrop);
        this.openModal('helpModal');
    }

    /* ==================== UTILITY METHODS ==================== */

    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';

        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        let start = null;
        const startOpacity = parseFloat(element.style.opacity) || 1;

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };

        requestAnimationFrame(animate);
    }

    slideDown(element, duration = 300) {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';

        const targetHeight = element.scrollHeight;
        let start = null;

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            
            element.style.height = (targetHeight * progress) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        };

        requestAnimationFrame(animate);
    }

    slideUp(element, duration = 300) {
        const startHeight = element.scrollHeight;
        element.style.height = startHeight + 'px';
        element.style.overflow = 'hidden';

        let start = null;

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            
            element.style.height = (startHeight * (1 - progress)) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
            }
        };

        requestAnimationFrame(animate);
    }

    /* ==================== RESPONSIVE HELPERS ==================== */

    isMobileDevice() {
        return window.innerWidth < 768;
    }

    isTabletDevice() {
        return window.innerWidth >= 768 && window.innerWidth < 1024;
    }

    isDesktopDevice() {
        return window.innerWidth >= 1024;
    }

    setupResponsiveHandlers() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResponsiveChanges();
            }, 250);
        });
    }

    handleResponsiveChanges() {
        const isMobile = this.isMobileDevice();
        const sidebar = document.getElementById('sidebar');
        
        if (isMobile && sidebar && !sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
        }
        
        // Update modal sizes
        document.querySelectorAll('.modal').forEach(modal => {
            if (isMobile) {
                modal.classList.add('mobile-modal');
            } else {
                modal.classList.remove('mobile-modal');
            }