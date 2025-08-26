/* ==================== MAIN APPLICATION CLASS ==================== */

class ChatGPTAdvanced {
    constructor() {
        this.config = {
            apiKey: '',
            model: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 2048,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
            systemPrompt: 'شما یک دستیار هوشمند و مفیدی هستید که به زبان فارسی پاسخ می‌دهید.',
            stream: true,
            theme: 'auto',
            language: 'fa',
            autoSave: true,
            showTokenCount: true,
            enableVoice: true,
            enableFileUpload: true
        };

        this.chats = [];
        this.currentChatId = null;
        this.isStreaming = false;
        this.streamController = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.uploadedFiles = [];

        // API client
        this.api = new OpenAIAPI();
        
        // UI Manager
        this.ui = new UIManager();

        // Initialize application
        this.init();
    }

    /* ==================== INITIALIZATION ==================== */

    async init() {
        try {
            // Show loading screen
            this.ui.showLoadingScreen();

            // Load configuration and data
            await this.loadConfig();
            await this.loadChats();

            // Initialize UI components
            this.initializeUI();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Apply theme
            this.applyTheme();
            
            // Initialize API with config
            this.api.updateConfig(this.config);

            // Show welcome screen if no chats
            if (this.chats.length === 0) {
                this.showWelcomeScreen();
            } else {
                // Load last active chat or create new one
                const lastChat = this.chats[0];
                this.loadChat(lastChat.id);
            }

            // Hide loading screen
            this.ui.hideLoadingScreen();

            console.log('✅ ChatGPT Advanced initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.ui.showNotification('خطا در بارگذاری برنامه', 'error');
            this.ui.hideLoadingScreen();
        }
    }

    initializeUI() {
        // Initialize syntax highlighting
        if (window.Prism) {
            Prism.highlightAll();
        }

        // Initialize MathJax
        if (window.MathJax) {
            MathJax.startup.promise.then(() => {
                console.log('✅ MathJax initialized');
            });
        }

        // Setup file drop zone
        this.setupFileDropZone();
        
        // Setup voice recognition
        this.setupVoiceRecognition();

        // Setup auto-resize for textarea
        this.setupAutoResize();

        // Update UI elements
        this.updateChatsList();
        this.updateModelSelect();
        this.loadSettingsToUI();
    }

    setupEventListeners() {
        // Message form submission
        const messageForm = document.getElementById('messageForm');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');

        messageForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Auto-grow textarea
        messageInput?.addEventListener('input', (e) => {
            this.autoResizeTextarea(e.target);
        });

        // Keyboard shortcuts
        messageInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.sendMessage();
            }
            if (e.key === 'Escape') {
                this.cancelStreaming();
            }
        });

        // File upload
        const fileInput = document.getElementById('fileInput');
        fileInput?.addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });

        // Voice recording
        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn?.addEventListener('click', () => {
            this.toggleVoiceRecording();
        });

        // New chat button
        const newChatBtn = document.getElementById('newChatBtn');
        newChatBtn?.addEventListener('click', () => {
            this.createNewChat();
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        sidebarToggle?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        settingsBtn?.addEventListener('click', () => {
            this.openSettingsModal();
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Export chat
        const exportBtn = document.getElementById('exportBtn');
        exportBtn?.addEventListener('click', () => {
            this.exportCurrentChat();
        });

        // Clear all data
        const clearDataBtn = document.getElementById('clearAllData');
        clearDataBtn?.addEventListener('click', () => {
            this.clearAllData();
        });

        // Settings modal events
        this.setupSettingsEvents();

        // Search chat
        const chatSearch = document.getElementById('chatSearch');
        chatSearch?.addEventListener('input', debounce((e) => {
            this.searchChats(e.target.value);
        }, 300));

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.createNewChat();
                        break;
                    case ',':
                        e.preventDefault();
                        this.openSettingsModal();
                        break;
                    case 's':
                        e.preventDefault();
                        this.exportCurrentChat();
                        break;
                }
            }
        });

        // Close modals on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.ui.closeModal(e.target.querySelector('.modal'));
            }
        });

        // Handle window resize
        window.addEventListener('resize', debounce(() => {
            this.handleWindowResize();
        }, 250));

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.config.autoSave) {
                this.saveChats();
            }
        });

        // Handle before unload
        window.addEventListener('beforeunload', () => {
            if (this.config.autoSave) {
                this.saveConfig();
                this.saveChats();
            }
        });
    }

    setupSettingsEvents() {
        // Settings form submission
        const settingsForm = document.getElementById('settingsForm');
        settingsForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettingsFromUI();
        });

        // Tab switching
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchSettingsTab(tab.dataset.tab);
            });
        });

        // API key validation
        const apiKeyInput = document.getElementById('apiKey');
        apiKeyInput?.addEventListener('blur', async () => {
            if (apiKeyInput.value) {
                await this.validateApiKey(apiKeyInput.value);
            }
        });

        // Model change
        const modelSelect = document.getElementById('modelSelect');
        modelSelect?.addEventListener('change', () => {
            this.updateModelInfo();
        });

        // Range inputs
        document.querySelectorAll('input[type="range"]').forEach(range => {
            range.addEventListener('input', (e) => {
                const valueDisplay = document.getElementById(e.target.id + 'Value');
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value;
                }
            });
        });
    }

    /* ==================== CONFIGURATION MANAGEMENT ==================== */

    async loadConfig() {
        try {
            const savedConfig = localStorage.getItem('chatgpt_config');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                this.config = { ...this.config, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load config:', error);
        }
    }

    async saveConfig() {
        try {
            localStorage.setItem('chatgpt_config', JSON.stringify(this.config));
        } catch (error) {
            console.error('Failed to save config:', error);
        }
    }

    async loadChats() {
        try {
            const savedChats = localStorage.getItem('chatgpt_chats');
            if (savedChats) {
                this.chats = JSON.parse(savedChats);
            }
        } catch (error) {
            console.warn('Failed to load chats:', error);
            this.chats = [];
        }
    }

    async saveChats() {
        try {
            // Keep only last 50 chats to prevent storage overflow
            const chatsToSave = this.chats.slice(0, 50);
            localStorage.setItem('chatgpt_chats', JSON.stringify(chatsToSave));
        } catch (error) {
            console.error('Failed to save chats:', error);
        }
    }

    /* ==================== CHAT MANAGEMENT ==================== */

    createNewChat() {
        const newChat = {
            id: generateUUID(),
            title: 'گفتگوی جدید',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            model: this.config.model,
            config: { ...this.config }
        };

        this.chats.unshift(newChat);
        this.currentChatId = newChat.id;
        
        this.updateChatsList();
        this.showWelcomeScreen();
        this.saveChats();

        // Focus on message input
        const messageInput = document.getElementById('messageInput');
        messageInput?.focus();

        this.ui.showNotification('گفتگوی جدید ایجاد شد', 'success');
    }

    loadChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        this.currentChatId = chatId;
        this.renderChat(chat);
        this.updateChatsList();
        
        // Update header title
        const headerTitle = document.getElementById('headerTitle');
        if (headerTitle) {
            headerTitle.textContent = chat.title;
        }
    }

    deleteChat(chatId) {
        if (!confirm('آیا از حذف این گفتگو اطمینان دارید؟')) return;

        this.chats = this.chats.filter(c => c.id !== chatId);
        
        if (this.currentChatId === chatId) {
            if (this.chats.length > 0) {
                this.loadChat(this.chats[0].id);
            } else {
                this.currentChatId = null;
                this.showWelcomeScreen();
            }
        }

        this.updateChatsList();
        this.saveChats();
        this.ui.showNotification('گفتگو حذف شد', 'info');
    }

    getCurrentChat() {
        return this.chats.find(c => c.id === this.currentChatId);
    }

    updateChatTitle(chatId, title) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            chat.title = title || 'گفتگوی بدون عنوان';
            chat.updatedAt = new Date().toISOString();
            this.updateChatsList();
            this.saveChats();
        }
    }

    /* ==================== MESSAGE HANDLING ==================== */

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput?.value.trim();
        
        if (!content && this.uploadedFiles.length === 0) return;
        if (this.isStreaming) return;
        if (!this.config.apiKey) {
            this.ui.showNotification('لطفاً ابتدا کلید API را در تنظیمات وارد کنید', 'warning');
            this.openSettingsModal();
            return;
        }

        try {
            // Create new chat if none exists
            if (!this.currentChatId) {
                this.createNewChat();
            }

            const chat = this.getCurrentChat();
            if (!chat) return;

            // Create user message
            const userMessage = {
                id: generateUUID(),
                role: 'user',
                content: content,
                files: [...this.uploadedFiles],
                timestamp: new Date().toISOString(),
                tokens: estimateTokens(content)
            };

            // Add user message to chat
            chat.messages.push(userMessage);
            chat.updatedAt = new Date().toISOString();

            // Clear input and files
            messageInput.value = '';
            this.autoResizeTextarea(messageInput);
            this.uploadedFiles = [];
            this.updateFilesList();

            // Render user message
            this.renderMessage(userMessage);
            this.scrollToBottom();

            // Generate title for new chat
            if (chat.messages.length === 1) {
                const title = this.generateChatTitle(content);
                this.updateChatTitle(chat.id, title);
            }

            // Send to API
            if (this.config.stream) {
                await this.sendMessageStreaming(chat);
            } else {
                await this.sendMessageNonStreaming(chat);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.handleApiError(error);
        }
    }

    async sendMessageStreaming(chat) {
        this.isStreaming = true;
        this.streamController = new AbortController();
        
        // Create assistant message placeholder
        const assistantMessage = {
            id: generateUUID(),
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            streaming: true
        };
        
        chat.messages.push(assistantMessage);
        this.renderMessage(assistantMessage);
        
        this.ui.showStreamingIndicator();
        this.updateSendButton(true);

        try {
            const stream = await this.api.createChatCompletionStream(
                this.buildMessageHistory(chat),
                {
                    model: this.config.model,
                    temperature: this.config.temperature,
                    max_tokens: this.config.maxTokens,
                    top_p: this.config.topP,
                    frequency_penalty: this.config.frequencyPenalty,
                    presence_penalty: this.config.presencePenalty,
                    stream: true
                },
                this.streamController.signal
            );

            let fullContent = '';
            const messageElement = document.querySelector(`[data-message-id="${assistantMessage.id}"] .message-bubble`);

            for await (const chunk of stream) {
                if (this.streamController.signal.aborted) break;
                
                const content = chunk.choices?.[0]?.delta?.content || '';
                if (content) {
                    fullContent += content;
                    assistantMessage.content = fullContent;
                    
                    if (messageElement) {
                        messageElement.innerHTML = this.formatMessageContent(fullContent);
                        this.highlightCode(messageElement);
                        this.renderMath(messageElement);
                    }
                    
                    this.scrollToBottom();
                }
            }

            // Finalize message
            assistantMessage.streaming = false;
            assistantMessage.tokens = estimateTokens(fullContent);
            chat.updatedAt = new Date().toISOString();

        } catch (error) {
            if (error.name === 'AbortError') {
                assistantMessage.content += '

*[پیام متوقف شد]*';
            } else {
                throw error;
            }
        } finally {
            this.isStreaming = false;
            this.streamController = null;
            this.ui.hideStreamingIndicator();
            this.updateSendButton(false);
            this.saveChats();
        }
    }

    async sendMessageNonStreaming(chat) {
        this.ui.showStreamingIndicator('در حال پردازش...');
        this.updateSendButton(true);

        try {
            const response = await this.api.createChatCompletion(
                this.buildMessageHistory(chat),
                {
                    model: this.config.model,
                    temperature: this.config.temperature,
                    max_tokens: this.config.maxTokens,
                    top_p: this.config.topP,
                    frequency_penalty: this.config.frequencyPenalty,
                    presence_penalty: this.config.presencePenalty
                }
            );

            const assistantMessage = {
                id: generateUUID(),
                role: 'assistant',
                content: response.choices[0].message.content,
                timestamp: new Date().toISOString(),
                tokens: response.usage?.completion_tokens || estimateTokens(response.choices[0].message.content)
            };

            chat.messages.push(assistantMessage);
            chat.updatedAt = new Date().toISOString();

            this.renderMessage(assistantMessage);
            this.scrollToBottom();
            this.saveChats();

        } finally {
            this.ui.hideStreamingIndicator();
            this.updateSendButton(false);
        }
    }

    buildMessageHistory(chat) {
        const messages = [];
        
        // Add system message
        if (this.config.systemPrompt) {
            messages.push({
                role: 'system',
                content: this.config.systemPrompt
            });
        }

        // Add chat messages
        chat.messages.forEach(msg => {
            if (msg.role === 'user') {
                let content = msg.content;
                
                // Add file information if present
                if (msg.files && msg.files.length > 0) {
                    const fileInfo = msg.files.map(f => `[فایل: ${f.name}]`).join(' ');
                    content = `${content}\n\n${fileInfo}`;
                }
                
                messages.push({
                    role: 'user',
                    content: content
                });
            } else if (msg.role === 'assistant' && msg.content && !msg.streaming) {
                messages.push({
                    role: 'assistant',
                    content: msg.content
                });
            }
        });

        return messages;
    }

    generateChatTitle(firstMessage) {
        // Generate a simple title from first message
        const title = firstMessage.slice(0, 30);
        return title.length < firstMessage.length ? title + '...' : title;
    }

    /* ==================== MESSAGE RENDERING ==================== */

    renderChat(chat) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';
        
        chat.messages.forEach(message => {
            this.renderMessage(message);
        });

        this.scrollToBottom();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messageEl = this.createMessageElement(message);
        messagesContainer.appendChild(messageEl);
        
        // Highlight code and render math
        this.highlightCode(messageEl);
        this.renderMath(messageEl);
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;
        messageDiv.setAttribute('data-message-id', message.id);

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = message.role === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = this.formatMessageContent(message.content);

        // Add streaming indicator
        if (message.streaming) {
            bubble.innerHTML += '<span class="streaming-cursor">|</span>';
        }

        const actions = this.createMessageActions(message);
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = this.formatTimestamp(message.timestamp);

        content.appendChild(bubble);
        content.appendChild(actions);
        content.appendChild(timestamp);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        return messageDiv;
    }

    createMessageActions(message) {
        const actions = document.createElement('div');
        actions.className = 'message-actions';

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-action-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = 'کپی';
        copyBtn.onclick = () => this.copyMessage(message.id);

        // Edit button (only for user messages)
        if (message.role === 'user') {
            const editBtn = document.createElement('button');
            editBtn.className = 'message-action-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'ویرایش';
            editBtn.onclick = () => this.editMessage(message.id);
            actions.appendChild(editBtn);
        }

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'message-action-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'حذف';
        deleteBtn.onclick = () => this.deleteMessage(message.id);

        actions.appendChild(copyBtn);
        actions.appendChild(deleteBtn);

        return actions;
    }

    formatMessageContent(content) {
        if (!content) return '';

        // Convert markdown to HTML using marked library
        if (window.marked) {
            return marked.parse(content);
        }

        // Fallback: simple formatting
        return content
            .replace(/
/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'همین الان';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} دقیقه پیش`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} ساعت پیش`;
        
        return date.toLocaleDateString('fa-IR');
    }

    highlightCode(element) {
        if (window.Prism) {
            const codeBlocks = element.querySelectorAll('pre code, code');
            codeBlocks.forEach(block => {
                Prism.highlightElement(block);
                
                // Add copy button to code blocks
                if (block.parentElement.tagName === 'PRE') {
                    this.addCopyButtonToCodeBlock(block.parentElement);
                }
            });
        }
    }

    addCopyButtonToCodeBlock(preElement) {
        if (preElement.querySelector('.copy-code-btn')) return;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = 'کپی کد';
        
        copyBtn.onclick = () => {
            const code = preElement.textContent;
            copyToClipboard(code);
            this.ui.showNotification('کد کپی شد', 'success');
        };

        preElement.style.position = 'relative';
        preElement.appendChild(copyBtn);
    }

    renderMath(element) {
        if (window.MathJax) {
            MathJax.typesetPromise([element]).catch((err) => {
                console.warn('MathJax error:', err);
            });
        }
    }

    /* ==================== MESSAGE ACTIONS ==================== */

    copyMessage(messageId) {
        const chat = this.getCurrentChat();
        const message = chat?.messages.find(m => m.id === messageId);
        
        if (message) {
            copyToClipboard(message.content);
            this.ui.showNotification('پیام کپی شد', 'success');
        }
    }

    editMessage(messageId) {
        const chat = this.getCurrentChat();
        const message = chat?.messages.find(m => m.id === messageId);
        
        if (message && message.role === 'user') {
            const messageInput = document.getElementById('messageInput');
            messageInput.value = message.content;
            messageInput.focus();
            this.autoResizeTextarea(messageInput);
            
            // Remove message and all subsequent messages
            const messageIndex = chat.messages.findIndex(m => m.id === messageId);
            chat.messages = chat.messages.slice(0, messageIndex);
            
            this.renderChat(chat);
            this.saveChats();
        }
    }

    deleteMessage(messageId) {
        if (!confirm('آیا از حذف این پیام اطمینان دارید؟')) return;

        const chat = this.getCurrentChat();
        if (chat) {
            const messageIndex = chat.messages.findIndex(m => m.id === messageId);
            if (messageIndex !== -1) {
                // Remove message and all subsequent messages
                chat.messages = chat.messages.slice(0, messageIndex);
                chat.updatedAt = new Date().toISOString();
                
                this.renderChat(chat);
                this.saveChats();
                this.ui.showNotification('پیام حذف شد', 'info');
            }
        }
    }

    /* ==================== UI UPDATES ==================== */

    updateChatsList() {
        const chatsList = document.getElementById('chatsList');
        if (!chatsList) return;

        chatsList.innerHTML = '';

        this.chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            chatItem.onclick = () => this.loadChat(chat.id);

            const title = document.createElement('div');
            title.className = 'chat-item-title';
            title.textContent = chat.title;

            const preview = document.createElement('div');
            preview.className = 'chat-item-preview';
            const lastMessage = chat.messages[chat.messages.length - 1];
            preview.textContent = lastMessage ? 
                truncateText(lastMessage.content, 50) : 
                'گفتگوی جدید';

            const date = document.createElement('div');
            date.className = 'chat-item-date';
            date.textContent = this.formatTimestamp(chat.updatedAt);

            const actions = document.createElement('div');
            actions.className = 'chat-item-actions';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'chat-delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                this.deleteChat(chat.id);
            };
            
            actions.appendChild(deleteBtn);

            chatItem.appendChild(title);
            chatItem.appendChild(preview);
            chatItem.appendChild(date);
            chatItem.appendChild(actions);

            chatsList.appendChild(chatItem);
        });
    }

    updateModelSelect() {
        const modelSelect = document.getElementById('modelSelect');
        if (!modelSelect) return;

        // Load models from config
        fetch('./config/models.json')
            .then(response => response.json())
            .then(models => {
                modelSelect.innerHTML = '';
                
                Object.entries(models).forEach(([key, model]) => {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = `${model.name} - ${model.description}`;
                    option.selected = key === this.config.model;
                    modelSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Failed to load models:', error);
            });
    }

    updateSendButton(disabled) {
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.disabled = disabled;
            sendBtn.innerHTML = disabled ? 
                '<i class="fas fa-stop"></i>' : 
                '<i class="fas fa-paper-plane"></i>';
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    showWelcomeScreen() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-title">
                    <i class="fas fa-robot"></i>
                    به ChatGPT فارسی خوش آمدید
                </div>
                <div class="welcome-subtitle">
                    دستیار هوشمند شما برای پاسخ به سؤالات و انجام کارهای مختلف آماده است
                </div>
                <div class="welcome-features">
                    <div class="welcome-feature">
                        <div class="welcome-feature-icon">
                            <i class="fas fa-comments"></i>
                        </div>
                        <div class="welcome-feature-title">گفتگوی طبیعی</div>
                        <div class="welcome-feature-desc">با زبان فارسی گفتگو کنید</div>
                    </div>
                    <div class="welcome-feature">
                        <div class="welcome-feature-icon">
                            <i class="fas fa-code"></i>
                        </div>
                        <div class="welcome-feature-title">برنامه‌نویسی</div>
                        <div class="welcome-feature-desc">کمک در کدنویسی و آموزش</div>
                    </div>
                    <div class="welcome-feature">
                        <div class="welcome-feature-icon">
                            <i class="fas fa-file-upload"></i>
                        </div>
                        <div class="welcome-feature-title">آپلود فایل</div>
                        <div class="welcome-feature-desc">تحلیل اسناد و تصاویر</div>
                    </div>
                </div>
                <div class="welcome-actions">
                    <button class="btn btn-primary" onclick="document.getElementById('messageInput').focus()">
                        <i class="fas fa-play"></i>
                        شروع گفتگو
                    </button>
                </div>
            </div>
        `;
    }

    /* ==================== SETTINGS MANAGEMENT ==================== */

    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            this.loadSettingsToUI();
            this.ui.openModal(modal);
        }
    }

    loadSettingsToUI() {
        // API Settings
        const apiKeyInput = document.getElementById('apiKey');
        if (apiKeyInput) apiKeyInput.value = this.config.apiKey;

        // Model Settings
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) modelSelect.value = this.config.model;

        const temperatureRange = document.getElementById('temperature');
        const temperatureValue = document.getElementById('temperatureValue');
        if (temperatureRange) {
            temperatureRange.value = this.config.temperature;
            if (temperatureValue) temperatureValue.textContent = this.config.temperature;
        }

        const maxTokensRange = document.getElementById('maxTokens');
        const maxTokensValue = document.getElementById('maxTokensValue');
        if (maxTokensRange) {
            maxTokensRange.value = this.config.maxTokens;
            if (maxTokensValue) maxTokensValue.textContent = this.config.maxTokens;
        }

        const topPRange = document.getElementById('topP');
        const topPValue = document.getElementById('topPValue');
        if (topPRange) {
            topPRange.value = this.config.topP;
            if (topPValue) topPValue.textContent = this.config.topP;
        }

        const frequencyPenaltyRange = document.getElementById('frequencyPenalty');
        const frequencyPenaltyValue = document.getElementById('frequencyPenaltyValue');
        if (frequencyPenaltyRange) {
            frequencyPenaltyRange.value = this.config.frequencyPenalty;
            if (frequencyPenaltyValue) frequencyPenaltyValue.textContent = this.config.frequencyPenalty;
        }

        const presencePenaltyRange = document.getElementById('presencePenalty');
        const presencePenaltyValue = document.getElementById('presencePenaltyValue');
        if (presencePenaltyRange) {
            presencePenaltyRange.value = this.config.presencePenalty;
            if (presencePenaltyValue) presencePenaltyValue.textContent = this.config.presencePenalty;
        }

        // System Prompt
        const systemPromptTextarea = document.getElementById('systemPrompt');
        if (systemPromptTextarea) systemPromptTextarea.value = this.config.systemPrompt;

        // Interface Settings
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = this.config.theme;

        const streamCheckbox = document.getElementById('streamResponses');
        if (streamCheckbox) streamCheckbox.checked = this.config.stream;

        const autoSaveCheckbox = document.getElementById('autoSave');
        if (autoSaveCheckbox) autoSaveCheckbox.checked = this.config.autoSave;

        const showTokenCountCheckbox = document.getElementById('showTokenCount');
        if (showTokenCountCheckbox) showTokenCountCheckbox.checked = this.config.showTokenCount;

        const enableVoiceCheckbox = document.getElementById('enableVoice');
        if (enableVoiceCheckbox) enableVoiceCheckbox.checked = this.config.enableVoice;

        const enableFileUploadCheckbox = document.getElementById('enableFileUpload');
        if (enableFileUploadCheckbox) enableFileUploadCheckbox.checked = this.config.enableFileUpload;
    }

    saveSettingsFromUI() {
        // API Settings
        const apiKeyInput = document.getElementById('apiKey');
        if (apiKeyInput) this.config.apiKey = apiKeyInput.value;

        // Model Settings
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) this.config.model = modelSelect.value;

        const temperatureRange = document.getElementById('temperature');
        if (temperatureRange) this.config.temperature = parseFloat(temperatureRange.value);

        const maxTokensRange = document.getElementById('maxTokens');
        if (maxTokensRange) this.config.maxTokens = parseInt(maxTokensRange.value);

        const topPRange = document.getElementById('topP');
        if (topPRange) this.config.topP = parseFloat(topPRange.value);

        const frequencyPenaltyRange = document.getElementById('frequencyPenalty');
        if (frequencyPenaltyRange) this.config.frequencyPenalty = parseFloat(frequencyPenaltyRange.value);

        const presencePenaltyRange = document.getElementById('presencePenalty');
        if (presencePenaltyRange) this.config.presencePenalty = parseFloat(presencePenaltyRange.value);

        // System Prompt
        const systemPromptTextarea = document.getElementById('systemPrompt');
        if (systemPromptTextarea) this.config.systemPrompt = systemPromptTextarea.value;

        // Interface Settings
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) this.config.theme = themeSelect.value;

        const streamCheckbox = document.getElementById('streamResponses');
        if (streamCheckbox) this.config.stream = streamCheckbox.checked;

        const autoSaveCheckbox = document.getElementById('autoSave');
        if (autoSaveCheckbox) this.config.autoSave = autoSaveCheckbox.checked;

        const showTokenCountCheckbox = document.getElementById('showTokenCount');
        if (showTokenCountCheckbox) this.config.showTokenCount = showTokenCountCheckbox.checked;

        const enableVoiceCheckbox = document.getElementById('enableVoice');
        if (enableVoiceCheckbox) this.config.enableVoice = enableVoiceCheckbox.checked;

        const enableFileUploadCheckbox = document.getElementById('enableFileUpload');
        if (enableFileUploadCheckbox) this.config.enableFileUpload = enableFileUploadCheckbox.checked;

        // Save and apply changes
        this.saveConfig();
        this.api.updateConfig(this.config);
        this.applyTheme();
        this.ui.closeAllModals();
        this.ui.showNotification('تنظیمات ذخیره شد', 'success');
    }

    switchSettingsTab(tabName) {
        // Hide all sections
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active from all tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${tabName}Settings`);
        const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetSection) targetSection.classList.add('active');
        if (targetTab) targetTab.classList.add('active');
    }

    async validateApiKey(apiKey) {
        if (!apiKey) return;

        try {
            const isValid = await this.api.validateApiKey(apiKey);
            if (isValid) {
                this.ui.showNotification('کلید API معتبر است', 'success');
            } else {
                this.ui.showNotification('کلید API نامعتبر است', 'error');
            }
        } catch (error) {
            this.ui.showNotification('خطا در اعتبارسنجی کلید API', 'error');
        }
    }

    /* ==================== THEME MANAGEMENT ==================== */

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.config.theme);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.setAttribute('data-theme', this.config.theme);
        }
    }

    toggleTheme() {
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(this.config.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        
        this.config.theme = themes[nextIndex];
        this.applyTheme();
        this.saveConfig();
        
        const themeNames = {
            light: 'روشن',
            dark: 'تاریک', 
            auto: 'خودکار'
        };
        
        this.ui.showNotification(`تم ${themeNames[this.config.theme]} فعال شد`, 'info');
    }

    /* ==================== UTILITY FUNCTIONS ==================== */

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    searchChats(query) {
        const chatItems = document.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const title = item.querySelector('.chat-item-title').textContent;
            const preview = item.querySelector('.chat-item-preview').textContent;
            const searchText = `${title} ${preview}`.toLowerCase();
            
            if (searchText.includes(query.toLowerCase())) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    cancelStreaming() {
        if (this.isStreaming && this.streamController) {
            this.streamController.abort();
            this.ui.showNotification('پیام متوقف شد', 'info');
        }
    }

    handleWindowResize() {
        // Handle responsive behavior
        const sidebar = document.getElementById('sidebar');
        const isMobile = window.innerWidth < 768;
        
        if (isMobile && sidebar && !sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    handleApiError(error) {
        let message = 'خطا در ارتباط با API';
        
        if (error.message.includes('401')) {
            message = 'کلید API نامعتبر است';
        } else if (error.message.includes('429')) {
            message = 'محدودیت نرخ درخواست. لطفاً کمی صبر کنید';
        } else if (error.message.includes('500')) {
            message = 'خطا در سرور OpenAI';
        }
        
        this.ui.showNotification(message, 'error');
    }

    /* ==================== FILE UPLOAD ==================== */

    setupFileDropZone() {
        const dropZone = document.getElementById('chatMessages');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        dropZone.addEventListener('dragenter', () => {
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });
    }

    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        this.handleFiles(files);
    }

    handleFiles(files) {
        if (!this.config.enableFileUpload) {
            this.ui.showNotification('آپلود فایل غیرفعال است', 'warning');
            return;
        }

        files.forEach(file => {
            if (this.validateFile(file)) {
                this.uploadedFiles.push({
                    id: generateUUID(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file
                });
            }
        });

        this.updateFilesList();
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'text/plain',
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/json',
            'text/csv'
        ];

        if (file.size > maxSize) {
            this.ui.showNotification(`فایل ${file.name} بیش از حد بزرگ است`, 'error');
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            this.ui.showNotification(`نوع فایل ${file.name} پشتیبانی نمی‌شود`, 'error');
            return false;
        }

        return true;
    }

    updateFilesList() {
        const filesList = document.getElementById('uploadedFiles');
        if (!filesList) return;

        filesList.innerHTML = '';

        this.uploadedFiles.forEach(fileData => {
            const fileItem = document.createElement('div');
            fileItem.className = 'uploaded-file';
            
            fileItem.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${fileData.name}</span>
                <button type="button" class="file-remove-btn" onclick="app.removeFile('${fileData.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;

            filesList.appendChild(fileItem);
        });
    }

    removeFile(fileId) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
        this.updateFilesList();
    }

    /* ==================== VOICE RECORDING ==================== */

    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }

        this.speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.speechRecognition.lang = 'fa-IR';
        this.speechRecognition.continuous = false;
        this.speechRecognition.interimResults = false;

        this.speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const messageInput = document.getElementById('messageInput');
            if (messageInput) {
                messageInput.value = transcript;
                this.autoResizeTextarea(messageInput);
            }
        };

        this.speechRecognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.ui.showNotification('خطا در تشخیص صدا', 'error');
        };
    }

    toggleVoiceRecording() {
        if (!this.config.enableVoice) {
            this.ui.showNotification('ورودی صوتی غیرفعال است', 'warning');
            return;
        }

        if (this.isRecording) {
            this.stopVoiceRecording();
        } else {
            this.startVoiceRecording();
        }
    }

    startVoiceRecording() {
        if (!this.speechRecognition) return;

        try {
            this.isRecording = true;
            this.speechRecognition.start();
            
            // Show recording indicator
            this.ui.showVoiceRecording();
            
            // Update voice button
            const voiceBtn = document.getElementById('voiceBtn');
            if (voiceBtn) {
                voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
                voiceBtn.classList.add('recording');
            }
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.ui.showNotification('خطا در شروع ضبط صدا', 'error');
            this.isRecording = false;
        }
    }

    stopVoiceRecording() {
        if (this.speechRecognition) {
            this.speechRecognition.stop();
        }
        
        this.isRecording = false;
        
        // Hide recording indicator
        this.ui.hideVoiceRecording();
        
        // Update voice button
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.classList.remove('recording');
        }
    }

    /* ==================== EXPORT FUNCTIONALITY ==================== */

    exportCurrentChat() {
        const chat = this.getCurrentChat();
        if (!chat) {
            this.ui.showNotification('گفتگویی برای صادرات وجود ندارد', 'warning');
            return;
        }

        const exportData = {
            title: chat.title,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            model: chat.model,
            messages: chat.messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp
            }))
        };

        const jsonData = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${chat.title.replace(/[^a-z0-9]/gi, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.ui.showNotification('گفتگو صادر شد', 'success');
    }

    clearAllData() {
        if (!confirm('آیا از پاک کردن تمام داده‌ها اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
            return;
        }

        try {
            localStorage.removeItem('chatgpt_chats');
            localStorage.removeItem('chatgpt_config');
            
            this.chats = [];
            this.currentChatId = null;
            this.config = {
                apiKey: '',
                model: 'gpt-4o',
                temperature: 0.7,
                maxTokens: 2048,
                topP: 1,
                frequencyPenalty: 0,
                presencePenalty: 0,
                systemPrompt: 'شما یک دستیار هوشمند و مفیدی هستید که به زبان فارسی پاسخ می‌دهید.',
                stream: true,
                theme: 'auto',
                language: 'fa',
                autoSave: true,
                showTokenCount: true,
                enableVoice: true,
                enableFileUpload: true
            };

            this.updateChatsList();
            this.showWelcomeScreen();
            this.ui.closeAllModals();
            this.ui.showNotification('تمام داده‌ها پاک شد', 'info');
        } catch (error) {
            console.error('Failed to clear data:', error);
            this.ui.showNotification('خطا در پاک کردن داده‌ها', 'error');
        }
    }
}

/* ==================== APPLICATION INITIALIZATION ==================== */

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.app = new ChatGPTAdvanced();
    
    // Service Worker registration for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered');
            })
            .catch(error => {
                console.warn('❌ Service Worker registration failed:', error);
            });
    }
});

// Handle global errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.app && window.app.ui) {
        window.app.ui.showNotification('خطای غیرمنتظره‌ای رخ داد', 'error');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.app && window.app.ui) {
        window.app.ui.showNotification('خطا در پردازش درخواست', 'error');
    }
});
