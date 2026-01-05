/**
 * CADverter - Professional CAD to PDF Converter
 * Main Application JavaScript
 * Version: 2.0.0
 * Author: MiniMax Agent
 */

(function() {
    'use strict';

    // ========== Application State ==========
    const AppState = {
        files: [],
        convertedFiles: [],
        isProcessing: false,
        previewIndex: 0,
        drawingData: null,
        drawingBounds: null,
        zoomScale: 1,
        isPanning: false,
        panStartX: 0,
        panStartY: 0,
        canvas: null,
        ctx: null,
        currentLang: 'en'
    };

    // ========== Internationalization (i18n) ==========
    
    /**
     * Initialize internationalization
     */
    function initI18n() {
        // Try to get saved language preference
        try {
            const savedLang = localStorage.getItem('appLang');
            if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
                AppState.currentLang = savedLang;
            }
        } catch (e) {
            console.warn('Could not access localStorage for language preference');
        }
        
        // Apply saved language
        setLanguage(AppState.currentLang);
        
        // Create language toggle button
        createLanguageToggle();
    }

    /**
     * Set application language
     * @param {string} lang - Language code ('en' or 'ar')
     */
    function setLanguage(lang) {
        if (lang !== 'en' && lang !== 'ar') {
            console.warn(`Invalid language code: ${lang}. Defaulting to 'en'.`);
            lang = 'en';
        }
        
        AppState.currentLang = lang;
        
        // Update document direction for RTL support
        const isRTL = lang === 'ar';
        document.documentElement.lang = lang;
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        
        // Update body class for RTL styling
        if (isRTL) {
            document.body.classList.add('rtl');
            document.body.classList.remove('ltr');
        } else {
            document.body.classList.add('ltr');
            document.body.classList.remove('rtl');
        }
        
        // Save language preference
        try {
            localStorage.setItem('appLang', lang);
        } catch (e) {
            console.warn('Could not save language preference to localStorage');
        }
        
        // Update all translatable elements
        updateTranslations();
        
        // Update language toggle button text
        updateLanguageToggle();
    }

    /**
     * Toggle between English and Arabic
     */
    function toggleLanguage() {
        const newLang = AppState.currentLang === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @param {object} params - Optional parameters for variable substitution
     * @returns {string} - Translated string
     */
    function t(key, params = {}) {
        if (!window.translations || !window.translations[AppState.currentLang]) {
            console.warn('Translations not loaded');
            return key;
        }
        
        let text = window.translations[AppState.currentLang][key];
        
        // Fallback to English if key not found in current language
        if (text === undefined && window.translations.en) {
            text = window.translations.en[key];
        }
        
        // Return key if no translation found
        if (text === undefined) {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
        
        // Replace placeholders with parameters
        if (params && typeof params === 'object') {
            Object.keys(params).forEach(param => {
                text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
            });
        }
        
        return text;
    }

    /**
     * Update all elements with data-i18n attribute
     */
    function updateTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translatedText = t(key);
            
            // Handle input elements (update placeholder if it's an input)
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('data-i18n-placeholder')) {
                    element.placeholder = translatedText;
                }
            } else {
                element.textContent = translatedText;
            }
        });
        
        // Update title attributes for tooltips
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.setAttribute('title', t(key));
        });
    }

    /**
     * Create language toggle button
     */
    function createLanguageToggle() {
        // Check if button already exists
        if (document.getElementById('languageToggle')) return;
        
        const toggle = document.createElement('button');
        toggle.id = 'languageToggle';
        toggle.className = 'language-toggle';
        toggle.setAttribute('aria-label', 'Toggle language');
        toggle.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M2 12H22" stroke="currentColor" stroke-width="2"/>
                <path d="M12 2C15.5 5 17 9 17 12C17 15 15.5 19 12 22C8.5 19 7 15 7 12C7 9 8.5 5 12 2Z" fill="currentColor" opacity="0.3"/>
            </svg>
            <span class="lang-text"></span>
        `;
        
        // Insert after header
        const header = document.querySelector('.header-actions');
        if (header) {
            header.appendChild(toggle);
        } else {
            document.body.appendChild(toggle);
        }
        
        // Add click event
        toggle.addEventListener('click', toggleLanguage);
        
        // Update button text
        updateLanguageToggle();
    }

    /**
     * Update language toggle button text
     */
    function updateLanguageToggle() {
        const toggle = document.getElementById('languageToggle');
        if (!toggle) return;
        
        const langText = toggle.querySelector('.lang-text');
        if (langText) {
            // Show the "other" language text (what switching will give)
            langText.textContent = AppState.currentLang === 'en' ? 'العربية' : 'English';
        }
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    function getCurrentLanguage() {
        return AppState.currentLang;
    }

    // ========== DOM Elements Cache ==========
    const Elements = {};

    /**
     * Initialize application when DOM is ready
     */
    function init() {
        cacheElements();
        setupEventListeners();
        setupCanvas();
        loadHistory();
        updateUI();
        updateScaleInfo();
        
        // Initialize keyboard shortcuts
        initKeyboardShortcuts();
        
        // Initialize internationalization
        initI18n();
        
        // Log initialization
        console.log('CADverter initialized successfully');
    }

    /**
     * Cache frequently used DOM elements
     */
    function cacheElements() {
        Elements.fileInput = document.getElementById('fileInput');
        Elements.uploadZone = document.getElementById('uploadZone');
        Elements.filesList = document.getElementById('filesList');
        Elements.filesItems = document.getElementById('filesItems');
        Elements.filesCount = document.getElementById('filesCount');
        Elements.settings = document.getElementById('settings');
        Elements.actionButtons = document.getElementById('actionButtons');
        Elements.convertBtn = document.getElementById('convertBtn');
        Elements.batchBtn = document.getElementById('batchBtn');
        Elements.previewBtn = document.getElementById('previewBtn');
        Elements.progress = document.getElementById('progress');
        Elements.progressFill = document.getElementById('progressFill');
        Elements.progressPercent = document.getElementById('progressPercent');
        Elements.progressStatus = document.getElementById('progressStatus');
        Elements.result = document.getElementById('result');
        Elements.errorMsg = document.getElementById('errorMsg');
        Elements.scaleInfo = document.getElementById('scaleInfo');
        Elements.previewModal = document.getElementById('previewModal');
        Elements.historyModal = document.getElementById('historyModal');
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // File input change
        Elements.fileInput.addEventListener('change', function(e) {
            handleFiles(e.target.files);
        });

        // Drag and drop events
        Elements.uploadZone.addEventListener('dragover', handleDragOver);
        Elements.uploadZone.addEventListener('dragleave', handleDragLeave);
        Elements.uploadZone.addEventListener('drop', handleDrop);
        Elements.uploadZone.addEventListener('click', function() {
            Elements.fileInput.click();
        });

        // Scale change
        document.getElementById('scale').addEventListener('change', updateScaleInfo);

        // Modal events
        document.getElementById('previewModal').addEventListener('click', function(e) {
            if (e.target === this) closePreview();
        });

        document.getElementById('historyModal').addEventListener('click', function(e) {
            if (e.target === this) closeHistory();
        });

        // Keyboard events
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (Elements.previewModal.classList.contains('active')) {
                    closePreview();
                } else if (Elements.historyModal.style.display === 'flex') {
                    closeHistory();
                }
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + O for opening files
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                Elements.fileInput.click();
            }
            // + key for zoom in
            if (e.key === '+' || e.key === '=') {
                if (Elements.previewModal.classList.contains('active')) {
                    zoomIn();
                }
            }
            // - key for zoom out
            if (e.key === '-') {
                if (Elements.previewModal.classList.contains('active')) {
                    zoomOut();
                }
            }
        });
    }

    /**
     * Handle drag over event
     */
    function handleDragOver(e) {
        e.preventDefault();
        Elements.uploadZone.classList.add('dragover');
    }

    /**
     * Handle drag leave event
     */
    function handleDragLeave(e) {
        e.preventDefault();
        Elements.uploadZone.classList.remove('dragover');
    }

    /**
     * Handle drop event
     */
    function handleDrop(e) {
        e.preventDefault();
        Elements.uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    }

    /**
     * Process uploaded files
     */
    function handleFiles(fileList) {
        if (AppState.isProcessing) return;

        const newFiles = Array.from(fileList).filter(file => {
            const ext = file.name.toLowerCase().split('.').pop();
            if (!['dwg', 'dxf'].includes(ext)) {
                showError(t('errorDwgDxfOnly'));
                return false;
            }
            if (file.size > 100 * 1024 * 1024) {
                showError(t('errorFileTooBig', { name: file.name }));
                return false;
            }
            return true;
        });

        if (newFiles.length === 0) return;

        AppState.files = newFiles.map(f => ({ 
            file: f, 
            data: null,
            extension: f.name.toLowerCase().split('.').pop()
        }));
        updateUI();
    }

    /**
     * Update UI based on current state
     */
    function updateUI() {
        Elements.errorMsg.style.display = 'none';

        if (AppState.files.length === 0) {
            Elements.uploadZone.style.display = 'block';
            Elements.filesList.style.display = 'none';
            Elements.settings.style.display = 'none';
            Elements.actionButtons.style.display = 'none';
            return;
        }

        Elements.uploadZone.style.display = 'none';
        Elements.filesList.style.display = 'block';
        Elements.settings.style.display = 'block';
        Elements.actionButtons.style.display = 'flex';

        Elements.filesCount.textContent = AppState.files.length;
        renderFilesList();

        if (AppState.files.length === 1) {
            Elements.convertBtn.style.display = 'flex';
            Elements.convertBtn.disabled = false;
            Elements.previewBtn.style.display = 'flex';
            Elements.previewBtn.disabled = false;
            Elements.batchBtn.style.display = 'none';
        } else {
            Elements.convertBtn.style.display = 'none';
            Elements.previewBtn.style.display = 'none';
            Elements.batchBtn.style.display = 'flex';
            Elements.batchBtn.disabled = false;
        }
    }

    /**
     * Render files list
     */
    function renderFilesList() {
        Elements.filesItems.innerHTML = AppState.files.map((item, index) => `
            <div class="file-item">
                <div class="file-item-info">
                    <div class="file-item-icon ${item.extension}">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="file-item-details">
                        <div class="file-item-name">${item.file.name}</div>
                        <div class="file-item-size">${formatSize(item.file.size)}</div>
                    </div>
                </div>
                <div class="file-item-actions">
                    ${AppState.files.length === 1 ? `
                    <button class="icon-btn preview" onclick="window.CADverter.openPreviewForFile(${index})" data-i18n-title="preview" title="${t('preview')}">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    ` : ''}
                    <button class="icon-btn remove" onclick="window.CADverter.removeFile(${index})" data-i18n-title="remove" title="${t('remove')}">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Remove file from list
     */
    function removeFile(index) {
        if (AppState.isProcessing) return;
        AppState.files.splice(index, 1);
        updateUI();
    }

    /**
     * Clear all files
     */
    function clearAll() {
        if (AppState.isProcessing) return;
        AppState.files = [];
        updateUI();
    }

    /**
     * Format file size
     */
    function formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Show error message
     */
    function showError(msg) {
        Elements.errorMsg.textContent = msg;
        Elements.errorMsg.style.display = 'block';
        setTimeout(() => Elements.errorMsg.style.display = 'none', 6000);
    }

    /**
     * Update scale information
     */
    function updateScaleInfo() {
        const scale = document.getElementById('scale').value;
        const scaleSpan = Elements.scaleInfo.querySelector('span');
        
        if (scale === 'auto') {
            scaleSpan.textContent = t('scaleInfo');
        } else {
            scaleSpan.textContent = t('scalePercentInfo', { percent: parseInt(scale) * 100 });
        }
    }

    // ========== Preview Functions ==========

    /**
     * Open preview modal
     */
    function openPreview() {
        if (AppState.files.length === 0) return;
        openPreviewForFile(0);
    }

    /**
     * Open preview for specific file
     */
    function openPreviewForFile(index) {
        AppState.previewIndex = index;
        const modal = Elements.previewModal;
        const loading = document.getElementById('previewLoading');
        const canvasEl = document.getElementById('previewCanvas');
        const fileName = document.getElementById('previewFileName');
        
        modal.classList.add('active');
        fileName.textContent = `- ${AppState.files[index].file.name}`;
        
        AppState.zoomScale = 1;
        updateZoomDisplay();
        
        loading.style.display = 'flex';
        canvasEl.style.display = 'none';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const fileExt = AppState.files[index].extension;
            
            setTimeout(() => {
                if (fileExt === 'dxf') {
                    AppState.drawingData = DXFParser.parse(content);
                } else {
                    AppState.drawingData = generatePlaceholderData(AppState.files[index].file.name);
                    showError(t('dwgPreviewNote'));
                }
                
                calculateDrawingBounds();
                
                document.getElementById('previewDimensions').textContent = 
                    AppState.drawingBounds ? `${AppState.drawingBounds.width.toFixed(0)} × ${AppState.drawingBounds.height.toFixed(0)}` : '-';
                document.getElementById('previewEntities').textContent = 
                    AppState.drawingData ? `${AppState.drawingData.length} ${t('entities').toLowerCase()}` : '-';
                
                loading.style.display = 'none';
                canvasEl.style.display = 'block';
                
                resetZoom();
            }, 150);
        };
        
        reader.onerror = function() {
            loading.innerHTML = `<p class="loading-text">${t('errorReading')}</p>`;
        };
        
        reader.readAsText(AppState.files[index].file);
    }

    /**
     * Close preview modal
     */
    function closePreview() {
        Elements.previewModal.classList.remove('active');
    }

    /**
     * Generate placeholder drawing data
     */
    function generatePlaceholderData(fileName) {
        return [
            { type: 'rect', x: 50, y: 50, w: 400, h: 200, color: [255, 255, 255], fill: false },
            { type: 'rect', x: 60, y: 60, w: 380, h: 180, color: [0, 255, 255], fill: false },
            { type: 'line', x1: 50, y1: 80, x2: 0, y2: 80, color: [255, 0, 0] },
            { type: 'line', x1: 50, y1: 120, x2: 0, y2: 120, color: [255, 0, 0] },
            { type: 'line', x1: 50, y1: 160, x2: 0, y2: 160, color: [255, 0, 0] },
            { type: 'line', x1: 50, y1: 200, x2: 0, y2: 200, color: [255, 0, 0] },
            { type: 'line', x1: 450, y1: 80, x2: 500, y2: 80, color: [0, 0, 255] },
            { type: 'line', x1: 450, y1: 120, x2: 500, y2: 120, color: [0, 0, 255] },
            { type: 'line', x1: 450, y1: 160, x2: 500, y2: 160, color: [0, 0, 255] },
            { type: 'line', x1: 450, y1: 200, x2: 500, y2: 200, color: [0, 0, 255] },
            { type: 'rect', x: 150, y: 70, w: 80, h: 160, color: [0, 255, 0], fill: false },
            { type: 'rect', x: 250, y: 70, w: 80, h: 160, color: [255, 128, 0], fill: false },
            { type: 'circle', cx: 350, cy: 150, r: 40, color: [255, 255, 255] },
            { type: 'circle', cx: 350, cy: 150, r: 5, color: [255, 0, 0] },
            { type: 'circle', cx: 350, cy: 150, r: 35, color: [128, 128, 128], fill: false },
            { type: 'text', x: 200, y: 280, text: `${fileName} - ${t('drawingPreview')}`, size: 12, color: [255, 255, 255] }
        ];
    }

    /**
     * Calculate drawing bounds
     */
    function calculateDrawingBounds() {
        if (!AppState.drawingData || AppState.drawingData.length === 0) {
            AppState.drawingBounds = { minX: 0, minY: 0, width: 500, height: 350 };
            return;
        }
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        AppState.drawingData.forEach(ent => {
            if (ent.type === 'line') {
                minX = Math.min(minX, ent.x1, ent.x2);
                maxX = Math.max(maxX, ent.x1, ent.x2);
                minY = Math.min(minY, ent.y1, ent.y2);
                maxY = Math.max(maxY, ent.y1, ent.y2);
            } else if (ent.type === 'rect') {
                minX = Math.min(minX, ent.x);
                maxX = Math.max(maxX, ent.x + (ent.w || 50));
                minY = Math.min(minY, ent.y);
                maxY = Math.max(maxY, ent.y + (ent.h || 30));
            } else if (ent.type === 'circle' || ent.type === 'ellipse') {
                minX = Math.min(minX, (ent.cx || ent.x) - (ent.r || ent.rx));
                maxX = Math.max(maxX, (ent.cx || ent.x) + (ent.r || ent.rx));
                minY = Math.min(minY, (ent.cy || ent.y) - (ent.r || ent.ry));
                maxY = Math.max(maxY, (ent.cy || ent.y) + (ent.r || ent.ry));
            } else if (ent.type === 'polyline' && ent.points) {
                ent.points.forEach(p => {
                    minX = Math.min(minX, p[0]);
                    maxX = Math.max(maxX, p[0]);
                    minY = Math.min(minY, p[1]);
                    maxY = Math.max(maxY, p[1]);
                });
            } else if (ent.type === 'text') {
                minX = Math.min(minX, ent.x);
                maxX = Math.max(maxX, ent.x + 100);
                minY = Math.min(minY, ent.y - 10);
                maxY = Math.max(maxY, ent.y);
            } else if (ent.type === 'arc') {
                minX = Math.min(minX, ent.cx - ent.r);
                maxX = Math.max(maxX, ent.cx + ent.r);
                minY = Math.min(minY, ent.cy - ent.r);
                maxY = Math.max(maxY, ent.cy + ent.r);
            }
        });
        
        const padding = 30;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        
        AppState.drawingBounds = {
            minX, minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    // ========== Canvas Functions ==========

    /**
     * Setup canvas with mouse events
     */
    function setupCanvas() {
        AppState.canvas = document.getElementById('previewCanvas');
        AppState.ctx = AppState.canvas.getContext('2d');
        
        // Mouse wheel zoom
        AppState.canvas.addEventListener('wheel', function(e) {
            e.preventDefault();
            if (e.deltaY > 0) {
                zoomOut();
            } else {
                zoomIn();
            }
        });

        // Pan functionality
        AppState.canvas.addEventListener('mousedown', function(e) {
            AppState.isPanning = true;
            AppState.panStartX = e.clientX;
            AppState.panStartY = e.clientY;
            AppState.canvas.style.cursor = 'grabbing';
        });

        AppState.canvas.addEventListener('mousemove', function(e) {
            if (!AppState.isPanning) return;
            const dx = e.clientX - AppState.panStartX;
            const dy = e.clientY - AppState.panStartY;
            renderCanvas(dx, dy);
            AppState.panStartX = e.clientX;
            AppState.panStartY = e.clientY;
        });

        AppState.canvas.addEventListener('mouseup', function() {
            AppState.isPanning = false;
            AppState.canvas.style.cursor = 'grab';
        });

        AppState.canvas.addEventListener('mouseleave', function() {
            AppState.isPanning = false;
            AppState.canvas.style.cursor = 'grab';
        });
    }

    /**
     * Render canvas with drawing data
     */
    function renderCanvas(panX = 0, panY = 0) {
        if (!AppState.drawingData || !AppState.drawingBounds) return;
        
        const container = document.getElementById('canvasContainer');
        const containerWidth = container.clientWidth - 60;
        const containerHeight = container.clientHeight - 60;
        
        AppState.canvas.width = containerWidth;
        AppState.canvas.height = containerHeight;
        
        const ctx = AppState.ctx;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, containerWidth, containerHeight);
        
        const padding = 30;
        const contentWidth = containerWidth - (padding * 2);
        const contentHeight = containerHeight - (padding * 2);
        
        const baseScaleX = contentWidth / AppState.drawingBounds.width;
        const baseScaleY = contentHeight / AppState.drawingBounds.height;
        const baseScale = Math.min(baseScaleX, baseScaleY);
        
        const scale = baseScale * AppState.zoomScale;
        
        const scaledWidth = AppState.drawingBounds.width * scale;
        const scaledHeight = AppState.drawingBounds.height * scale;
        
        let offsetX = (containerWidth - scaledWidth) / 2 + panX;
        let offsetY = (containerHeight - scaledHeight) / 2 + panY;
        
        // Draw grid
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 0.5;
        
        const gridSize = 50 * baseScale * AppState.zoomScale;
        for (let x = padding; x <= containerWidth - padding; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, containerHeight - padding);
            ctx.stroke();
        }
        for (let y = padding; y <= containerHeight - padding; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(containerWidth - padding, y);
            ctx.stroke();
        }
        
        ctx.save();
        ctx.translate(offsetX + scaledWidth, offsetY);
        ctx.scale(scale, -scale);
        ctx.translate(-AppState.drawingBounds.minX, -AppState.drawingBounds.minY);
        
        AppState.drawingData.forEach(ent => drawEntity(ent));
        
        ctx.restore();
        
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(offsetX, offsetY, scaledWidth, scaledHeight);
        ctx.setLineDash([]);
    }

    /**
     * Draw entity on canvas
     */
    function drawEntity(ent) {
        const ctx = AppState.ctx;
        ctx.strokeStyle = ent.color ? `rgb(${ent.color.join(',')})` : '#ffffff';
        ctx.fillStyle = ent.color ? `rgb(${ent.color.join(',')})` : '#ffffff';
        ctx.lineWidth = Math.max(0.3, 1 / AppState.zoomScale);
        
        switch (ent.type) {
            case 'line':
                ctx.beginPath();
                ctx.moveTo(ent.x1, ent.y1);
                ctx.lineTo(ent.x2, ent.y2);
                ctx.stroke();
                break;
                
            case 'rect':
                if (ent.fill) {
                    ctx.fillRect(ent.x, ent.y, ent.w, ent.h);
                } else {
                    ctx.strokeRect(ent.x, ent.y, ent.w, ent.h);
                }
                break;
                
            case 'circle':
                ctx.beginPath();
                ctx.arc(ent.cx, ent.cy, ent.r, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'arc':
                ctx.beginPath();
                ctx.arc(ent.cx, ent.cy, ent.r, (ent.startAngle * Math.PI) / 180, (ent.endAngle * Math.PI) / 180);
                ctx.stroke();
                break;
                
            case 'ellipse':
                ctx.beginPath();
                ctx.ellipse(ent.cx, ent.cy, ent.rx, ent.ry, 0, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'polyline':
                if (ent.points && ent.points.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(ent.points[0][0], ent.points[0][1]);
                    for (let i = 1; i < ent.points.length; i++) {
                        ctx.lineTo(ent.points[i][0], ent.points[i][1]);
                    }
                    ctx.stroke();
                }
                break;
                
            case 'text':
                ctx.font = `${Math.max(6, ent.size)}px Arial`;
                ctx.fillText(ent.text, ent.x, ent.y);
                break;
        }
    }

    /**
     * Zoom in
     */
    function zoomIn() {
        AppState.zoomScale = Math.min(5, AppState.zoomScale * 1.2);
        updateZoomDisplay();
        renderCanvas();
    }

    /**
     * Zoom out
     */
    function zoomOut() {
        AppState.zoomScale = Math.max(0.2, AppState.zoomScale / 1.2);
        updateZoomDisplay();
        renderCanvas();
    }

    /**
     * Reset zoom
     */
    function resetZoom() {
        AppState.zoomScale = 1;
        updateZoomDisplay();
        renderCanvas();
    }

    /**
     * Update zoom display
     */
    function updateZoomDisplay() {
        document.getElementById('zoomLevel').textContent = Math.round(AppState.zoomScale * 100) + '%';
    }

    /**
     * Convert from preview
     */
    function convertFromPreview() {
        closePreview();
        convertSingle();
    }

    // ========== Conversion Functions ==========

    /**
     * Convert single file
     */
    async function convertSingle() {
        if (AppState.files.length === 0 || AppState.isProcessing) return;
        await processConversion(false);
    }

    /**
     * Convert batch files
     */
    async function convertBatch() {
        if (AppState.files.length === 0 || AppState.isProcessing) return;
        await processConversion(true);
    }

    /**
     * Process conversion
     */
    async function processConversion(isBatch) {
        AppState.isProcessing = true;
        AppState.convertedFiles = [];
        
        Elements.progress.style.display = 'block';
        Elements.result.style.display = 'none';
        Elements.actionButtons.style.display = 'none';
        
        const batchInfo = document.getElementById('batchInfo');
        const progressText = document.getElementById('progressText');
        const progressStatus = document.getElementById('progressStatus');

        if (isBatch) {
            batchInfo.style.display = 'block';
            progressText.textContent = t('batchConverting');
        } else {
            batchInfo.style.display = 'none';
            progressText.textContent = t('converting');
        }

        try {
            for (let i = 0; i < AppState.files.length; i++) {
                if (isBatch) {
                    batchInfo.textContent = t('fileOf', { current: i + 1, total: AppState.files.length });
                }

                const file = AppState.files[i];
                progressStatus.textContent = t('processing') + file.file.name;
                
                // Simulate progress
                for (let p = 0; p <= 100; p += 5) {
                    Elements.progressFill.style.width = p + '%';
                    Elements.progressPercent.textContent = p + '%';
                    await new Promise(r => setTimeout(r, 30));
                }

                const pdfBlob = await PDFGenerator.createPDF(file);
                AppState.convertedFiles.push({
                    name: file.file.name.replace(/\.(dwg|dxf)$/i, '.pdf'),
                    blob: pdfBlob
                });

                addToHistory(file.file.name);
            }

            showResult(isBatch);
            
        } catch (error) {
            showError(t('errorConversion', { error: error.message }));
        }

        AppState.isProcessing = false;
    }

    /**
     * Show result
     */
    function showResult(isBatch) {
        Elements.progress.style.display = 'none';
        Elements.result.style.display = 'block';

        const downloadBtn = document.getElementById('downloadBtn');
        const zipBtn = document.getElementById('zipBtn');
        const resultTitle = document.getElementById('resultTitle');
        const resultMsg = document.getElementById('resultMsg');

        if (AppState.convertedFiles.length > 0) {
            if (isBatch && AppState.convertedFiles.length > 1) {
                // Multiple files converted - show ZIP option
                resultTitle.textContent = t('multipleSuccess', { count: AppState.convertedFiles.length });
                resultMsg.textContent = t('downloadZipMsg');
                downloadBtn.style.display = 'none';
                zipBtn.style.display = 'flex';
                zipBtn.querySelector('span').textContent = t('downloadZip');
            } else if (AppState.convertedFiles.length === 1) {
                // Single file converted - show both PDF and ZIP options
                resultTitle.textContent = t('success');
                resultMsg.textContent = t('downloadMsg');
                downloadBtn.style.display = 'flex';
                zipBtn.style.display = 'flex';
                zipBtn.querySelector('span').textContent = t('downloadAsZip');
            } else {
                // Multiple single conversions
                resultTitle.textContent = t('multipleSuccess', { count: AppState.convertedFiles.length });
                resultMsg.textContent = t('downloadZipMsg');
                downloadBtn.style.display = 'none';
                zipBtn.style.display = 'flex';
                zipBtn.querySelector('span').textContent = t('downloadZip');
            }
        } else {
            // No files converted - show error
            resultTitle.textContent = t('errorConversion', { error: 'No files were converted' });
            resultMsg.textContent = '';
            downloadBtn.style.display = 'none';
            zipBtn.style.display = 'none';
        }
    }

    /**
     * Download PDF
     */
    function downloadPDF() {
        if (AppState.convertedFiles.length === 0) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(AppState.convertedFiles[0].blob);
        link.download = AppState.convertedFiles[0].name;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    /**
     * Download ZIP
     */
    function downloadZip() {
        if (AppState.convertedFiles.length === 0) {
            showError(t('errorConversion', { error: 'No files to download' }));
            return;
        }
        
        // Check if JSZip is loaded, load it if not
        if (typeof JSZip === 'undefined') {
            const progressStatus = document.getElementById('progressStatus');
            const originalText = progressStatus.textContent;
            progressStatus.textContent = t('loadingLib');
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => {
                progressStatus.textContent = originalText;
                createZip();
            };
            script.onerror = () => {
                progressStatus.textContent = originalText;
                showError(t('errorLoadingLibFailed'));
            };
            document.head.appendChild(script);
            return;
        }
        
        createZip();
    }

    /**
     * Create ZIP file
     */
    function createZip() {
        if (AppState.convertedFiles.length === 0) {
            showError(t('errorConversion', { error: 'No files to compress' }));
            return;
        }
        
        const zip = new JSZip();
        const progressStatus = document.getElementById('progressStatus');
        const originalText = progressStatus.textContent;
        
        // Update progress
        progressStatus.textContent = t('creatingZip');
        Elements.progress.style.display = 'block';
        Elements.result.style.display = 'none';
        Elements.progressFill.style.width = '0%';
        Elements.progressPercent.textContent = '0%';
        
        // Add all files to ZIP
        AppState.convertedFiles.forEach((f, index) => {
            zip.file(f.name, f.blob);
        });
        
        // Generate ZIP with progress
        zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        }, (metadata) => {
            // Update progress during generation
            const percent = Math.round(metadata.percent);
            Elements.progressFill.style.width = percent + '%';
            Elements.progressPercent.textContent = percent + '%';
            progressStatus.textContent = t('compressingFiles', { percent: percent });
        }).then(content => {
            // Download the ZIP file
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const fileCount = AppState.convertedFiles.length;
            link.download = `CADverter_${fileCount}_files_${timestamp}.zip`;
            
            link.click();
            URL.revokeObjectURL(link.href);
            
            // Reset UI
            progressStatus.textContent = originalText;
            Elements.progress.style.display = 'none';
            Elements.result.style.display = 'block';
            
            // Add to history
            AppState.convertedFiles.forEach(f => {
                addToHistory(f.name);
            });
            
        }).catch(error => {
            progressStatus.textContent = originalText;
            Elements.progress.style.display = 'none';
            Elements.result.style.display = 'block';
            showError(t('errorCreatingZip', { error: error.message }));
        });
    }

    /**
     * Reset application
     */
    function resetAll() {
        AppState.files = [];
        AppState.convertedFiles = [];
        Elements.result.style.display = 'none';
        Elements.progress.style.display = 'none';
        Elements.fileInput.value = '';
        updateUI();
    }

    // ========== History Functions ==========

    /**
     * Load history from localStorage
     */
    function loadHistory() {
        try {
            const h = localStorage.getItem('cadverter_history');
            window.historyData = h ? JSON.parse(h) : [];
        } catch (e) {
            window.historyData = [];
        }
    }

    /**
     * Save history to localStorage
     */
    function saveHistory() {
        try {
            localStorage.setItem('cadverter_history', JSON.stringify(window.historyData));
        } catch (e) {}
    }

    /**
     * Add item to history
     */
    function addToHistory(name) {
        window.historyData.unshift({
            name: name,
            date: new Date().toISOString()
        });
        if (window.historyData.length > 50) {
            window.historyData = window.historyData.slice(0, 50);
        }
        saveHistory();
    }

    /**
     * Show history modal
     */
    function showHistory() {
        Elements.historyModal.style.display = 'flex';
        renderHistory();
    }

    /**
     * Close history modal
     */
    function closeHistory() {
        Elements.historyModal.style.display = 'none';
    }

    /**
     * Render history list
     */
    function renderHistory() {
        const container = document.getElementById('historyList');
        if (window.historyData.length === 0) {
            container.innerHTML = `
                <div class="empty-history">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <p>${t('noHistory')}</p>
                </div>
            `;
            return;
        }
        
        // Get date format from translations
        const dateFormat = t('dateFormat') || 'en-US';
        container.innerHTML = window.historyData.map(item => `
            <div class="history-item">
                <div class="history-item-name">${item.name}</div>
                <div class="history-item-date">${new Date(item.date).toLocaleString(dateFormat)}</div>
            </div>
        `).join('');
    }

    /**
     * Clear history
     */
    function clearHistory() {
        window.historyData = [];
        saveHistory();
        renderHistory();
    }

    // ========== Export Public API ==========
    window.CADverter = {
        init: init,
        removeFile: removeFile,
        clearAll: clearAll,
        openPreview: openPreview,
        openPreviewForFile: openPreviewForFile,
        closePreview: closePreview,
        convertSingle: convertSingle,
        convertBatch: convertBatch,
        downloadPDF: downloadPDF,
        downloadZip: downloadZip,
        resetAll: resetAll,
        showHistory: showHistory,
        closeHistory: closeHistory,
        clearHistory: clearHistory,
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        resetZoom: resetZoom,
        convertFromPreview: convertFromPreview,
        // i18n functions
        setLanguage: setLanguage,
        toggleLanguage: toggleLanguage,
        getCurrentLanguage: getCurrentLanguage,
        t: t
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
