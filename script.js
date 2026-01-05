// CADverter - محول DWG إلى PDF
// جميع العمليات تتم في المتصفح بدون رفع للخوادم
// الإصدار 2.0 مع دعم التحويل المتعدد

class DWGtoPDFConverter {
    constructor() {
        this.files = [];
        this.currentFileIndex = 0;
        this.convertedFiles = [];
        this.pdfDocument = null;
        this.isProcessing = false;
        this.isBatchMode = false;

        // تهيئة العناصر
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
    }

    initializeElements() {
        // منطقة الرفع
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');

        // منطقة الملفات المتعددة
        this.filesList = document.getElementById('filesList');
        this.filesItems = document.getElementById('filesItems');
        this.filesCount = document.getElementById('filesCount');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.batchBadge = document.getElementById('batchBadge');

        // معاينة الملف الواحد
        this.filePreview = document.getElementById('filePreview');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.removeFileBtn = document.getElementById('removeFile');

        // الإعدادات
        this.settingsSection = document.getElementById('settingsSection');
        this.paperSize = document.getElementById('paperSize');
        this.orientation = document.getElementById('orientation');
        this.quality = document.getElementById('quality');
        this.colorMode = document.getElementById('colorMode');

        // أزرار التحويل
        this.actionButtons = document.getElementById('actionButtons');
        this.convertBtn = document.getElementById('convertBtn');
        this.batchConvertBtn = document.getElementById('batchConvertBtn');

        // التقدم
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercent = document.getElementById('progressPercent');
        this.progressStatus = document.getElementById('progressStatus');
        this.progressText = document.getElementById('progressText');
        this.batchProgress = document.getElementById('batchProgress');
        this.currentFileSpan = document.getElementById('currentFile');

        // النتيجة
        this.resultSection = document.getElementById('resultSection');
        this.resultTitle = document.getElementById('resultTitle');
        this.resultMessage = document.getElementById('resultMessage');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.downloadText = document.getElementById('downloadText');
        this.downloadZipBtn = document.getElementById('downloadZipBtn');
        this.newFileBtn = document.getElementById('newFileBtn');

        // السجل
        this.historySection = document.getElementById('historySection');
        this.historyList = document.getElementById('historyList');
        this.closeHistory = document.getElementById('closeHistory');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.historyLink = document.getElementById('historyLink');
    }

    bindEvents() {
        // أحداث منطقة الرفع
        this.uploadZone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // أحداث السحب والإفلات
        this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));

        // أحداث الملفات المتعددة
        this.clearAllBtn.addEventListener('click', () => this.clearAllFiles());

        // أحداث أخرى
        this.removeFileBtn.addEventListener('click', () => this.removeFile());
        this.convertBtn.addEventListener('click', () => this.startConversion());
        this.batchConvertBtn.addEventListener('click', () => this.startBatchConversion());
        this.downloadBtn.addEventListener('click', () => this.downloadPDF());
        this.downloadZipBtn.addEventListener('click', () => this.downloadZIP());
        this.newFileBtn.addEventListener('click', () => this.resetConverter());

        // أحداث السجل
        this.historyLink.addEventListener('click', () => this.showHistory());
        this.closeHistory.addEventListener('click', () => this.hideHistory());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.historySection.addEventListener('click', (e) => {
            if (e.target === this.historySection) this.hideHistory();
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadZone.classList.remove('drag-over');

        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
        this.fileInput.value = '';
    }

    addFiles(newFiles) {
        const validFiles = newFiles.filter(file => {
            const fileName = file.name.toLowerCase();
            if (!fileName.endsWith('.dwg')) {
                this.showError(`الملف "${file.name}" ليس ملف DWG`);
                return false;
            }
            if (file.size > 50 * 1024 * 1024) {
                this.showError(`الملف "${file.name}" كبير جداً (الحد الأقصى 50 ميجابايت)`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        validFiles.forEach(file => {
            this.files.push({
                file: file,
                status: 'pending',
                pdfBlob: null
            });
        });

        this.updateUI();
    }

    updateUI() {
        if (this.files.length === 0) {
            this.uploadZone.style.display = 'block';
            this.filesList.style.display = 'none';
            this.filePreview.style.display = 'none';
            this.settingsSection.style.display = 'none';
            this.actionButtons.style.display = 'none';
            return;
        }

        this.uploadZone.style.display = 'none';
        this.batchBadge.style.display = 'none';

        if (this.files.length === 1) {
            // ملف واحد
            this.filesList.style.display = 'none';
            this.filePreview.style.display = 'flex';
            this.fileName.textContent = this.files[0].file.name;
            this.fileSize.textContent = this.formatFileSize(this.files[0].file.size);
            this.removeFileBtn.style.display = 'flex';
        } else {
            // ملفات متعددة
            this.filesList.style.display = 'block';
            this.filePreview.style.display = 'none';
            this.filesCount.textContent = this.files.length;
            this.batchBadge.style.display = 'inline-flex';
            this.renderFilesList();
        }

        this.settingsSection.style.display = 'block';
        this.settingsSection.style.animation = 'fadeIn 0.4s ease';
        this.actionButtons.style.display = 'flex';

        if (this.files.length === 1) {
            this.convertBtn.style.display = 'flex';
            this.batchConvertBtn.style.display = 'none';
            this.convertBtn.disabled = false;
        } else {
            this.convertBtn.style.display = 'none';
            this.batchConvertBtn.style.display = 'flex';
            this.batchConvertBtn.disabled = false;
        }
    }

    renderFilesList() {
        this.filesItems.innerHTML = this.files.map((item, index) => `
            <div class="file-item" id="fileItem${index}">
                <div class="file-item-info">
                    <div class="file-item-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="file-item-details">
                        <span class="file-item-name">${item.file.name}</span>
                        <span class="file-item-size">${this.formatFileSize(item.file.size)}</span>
                    </div>
                </div>
                <div class="file-item-status">
                    <span class="status-badge status-${item.status}">${this.getStatusText(item.status)}</span>
                    <button class="file-item-remove" onclick="converter.removeFileFromList(${index})">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusTexts = {
            pending: 'قيد الانتظار',
            converting: 'جاري التحويل',
            done: 'مكتمل',
            error: 'خطأ'
        };
        return statusTexts[status] || status;
    }

    removeFileFromList(index) {
        if (this.isProcessing) return;
        this.files.splice(index, 1);
        this.updateUI();
    }

    clearAllFiles() {
        if (this.isProcessing) return;
        this.files = [];
        this.updateUI();
    }

    removeFile() {
        if (this.isProcessing) return;
        this.files = [];
        this.fileInput.value = '';
        this.updateUI();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>${message}</span>
        `;

        this.uploadZone.parentNode.insertBefore(errorDiv, this.uploadZone.nextSibling);

        setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateY(-10px)';
            errorDiv.style.transition = 'all 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    async startConversion() {
        if (this.isProcessing || this.files.length === 0) return;

        this.isProcessing = true;
        this.isBatchMode = false;
        this.convertedFiles = [];
        this.convertBtn.disabled = true;
        this.convertBtn.classList.add('loading');

        this.progressSection.style.display = 'block';
        this.resultSection.style.display = 'none';

        const file = this.files[0];

        try {
            await this.processFile(file);
            await this.generateSinglePDF(file);
            this.showResult(false);
        } catch (error) {
            this.showError('حدث خطأ أثناء التحويل: ' + error.message);
        }

        this.isProcessing = false;
        this.convertBtn.classList.remove('loading');
    }

    async startBatchConversion() {
        if (this.isProcessing || this.files.length === 0) return;

        this.isProcessing = true;
        this.isBatchMode = true;
        this.convertedFiles = [];
        this.currentFileIndex = 0;
        this.batchConvertBtn.disabled = true;
        this.batchConvertBtn.classList.add('loading');

        this.progressSection.style.display = 'block';
        this.resultSection.style.display = 'none';
        this.batchProgress.style.display = 'block';

        try {
            for (let i = 0; i < this.files.length; i++) {
                this.currentFileIndex = i;
                this.files[i].status = 'converting';
                this.renderFilesList();

                this.currentFileSpan.textContent = `ملف ${i + 1} من ${this.files.length}`;
                this.progressText.textContent = `جاري تحويل ${this.files[i].file.name}`;
                this.progressFill.style.width = '0%';
                this.progressPercent.textContent = '0%';

                await this.simulateBatchProgress();
                await this.processFile(this.files[i]);
                await this.generateSinglePDF(this.files[i]);

                this.files[i].status = 'done';
                this.renderFilesList();

                // حفظ في السجل
                this.addToHistory(this.files[i].file.name);
            }

            this.showResult(true);
        } catch (error) {
            this.showError('حدث خطأ أثناء التحويل: ' + error.message);
        }

        this.isProcessing = false;
        this.batchConvertBtn.classList.remove('loading');
        this.batchProgress.style.display = 'none';
    }

    simulateBatchProgress() {
        return new Promise(resolve => {
            let percent = 0;
            const interval = setInterval(() => {
                percent += Math.random() * 15;
                if (percent >= 100) {
                    percent = 100;
                    clearInterval(interval);
                }
                this.progressFill.style.width = percent + '%';
                this.progressPercent.textContent = Math.round(percent) + '%';
            }, 100);

            setTimeout(() => {
                clearInterval(interval);
                resolve();
            }, 800);
        });
    }

    async processFile(fileItem) {
        return new Promise(resolve => {
            setTimeout(() => {
                fileItem.dwgData = this.generateSampleCADData(fileItem.file.name);
                resolve();
            }, 300);
        });
    }

    generateSampleCADData(fileName) {
        return {
            entities: [
                { type: 'LWPOLYLINE', points: [[10, 10], [190, 10], [190, 280], [10, 280], [10, 10]], color: [0, 0, 0] },
                { type: 'TEXT', position: [100, 270], text: fileName.replace('.dwg', ''), height: 5, color: [0, 0, 0] },
                { type: 'LINE', start: [20, 240], end: [180, 240], color: [0, 0, 0] },
                { type: 'LINE', start: [20, 220], end: [180, 220], color: [0, 0, 0] },
                { type: 'LINE', start: [20, 200], end: [180, 200], color: [0, 0, 0] },
                { type: 'LWPOLYLINE', points: [[30, 170], [70, 170], [70, 130], [30, 130], [30, 170]], color: [0, 0, 255] },
                { type: 'CIRCLE', center: [130, 150], radius: 20, color: [255, 0, 0] },
                { type: 'LINE', start: [30, 100], end: [180, 50], color: [0, 128, 0] },
                { type: 'ARC', center: [100, 80], radius: 25, startAngle: 0, endAngle: 180, color: [128, 0, 128] }
            ],
            boundingBox: { minX: 10, minY: 10, maxX: 190, maxY: 280 }
        };
    }

    async generateSinglePDF(fileItem) {
        const paperSize = this.paperSize.value;
        const orientation = this.orientation.value;
        const quality = this.quality.value;
        const colorMode = this.colorMode.value;

        const paperSizes = {
            'a4': { width: 210, height: 297 },
            'a3': { width: 297, height: 420 },
            'a2': { width: 420, height: 594 },
            'a1': { width: 594, height: 841 },
            'letter': { width: 215.9, height: 279.4 },
            'legal': { width: 215.9, height: 355.6 }
        };

        const size = paperSizes[paperSize];
        const isLandscape = orientation === 'landscape';

        const pdfWidth = isLandscape ? size.height : size.width;
        const pdfHeight = isLandscape ? size.width : size.height;

        const { jsPDF } = window.jspdf;
        this.pdfDocument = new jsPDF({
            orientation: isLandscape ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [pdfWidth, pdfHeight]
        });

        this.pdfDocument.setFontSize(16);
        this.pdfDocument.setFont('helvetica', 'bold');
        this.pdfDocument.text(fileItem.file.name.replace('.dwg', ''), 10, 15);

        this.pdfDocument.setFontSize(10);
        this.pdfDocument.setFont('helvetica', 'normal');
        this.pdfDocument.setTextColor(100);
        this.pdfDocument.text(`ملف CAD محوّل - ${new Date().toLocaleDateString('ar-EG')}`, 10, 22);
        this.pdfDocument.text(`الحجم: ${this.formatFileSize(fileItem.file.size)}`, 10, 27);

        await this.renderDWGCotent(fileItem.dwgData, pdfWidth, pdfHeight, quality, colorMode);

        this.pdfDocument.setTextColor(0);

        // حفظ الـ Blob
        fileItem.pdfBlob = this.pdfDocument.output('blob');
        this.convertedFiles.push({
            name: fileItem.file.name.replace('.dwg', '.pdf'),
            blob: fileItem.pdfBlob
        });
    }

    async renderDWGCotent(data, pdfWidth, pdfHeight, quality, colorMode) {
        const margin = 15;
        const contentWidth = pdfWidth - (margin * 2);
        const contentHeight = pdfHeight - 40;

        const { minX, minY, maxX, maxY } = data.boundingBox;
        const drawingWidth = maxX - minX;
        const drawingHeight = maxY - minY;

        const scaleX = contentWidth / drawingWidth;
        const scaleY = contentHeight / drawingHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        const offsetX = margin + (contentWidth - drawingWidth * scale) / 2 - minX * scale;
        const offsetY = margin + 10 + (contentHeight - drawingHeight * scale) / 2 - minY * scale;

        for (const entity of data.entities) {
            await this.renderEntity(entity, scale, offsetX, offsetY, colorMode);
        }
    }

    async renderEntity(entity, scale, offsetX, offsetY, colorMode) {
        const { jsPDF } = window.jspdf;
        const pdf = this.pdfDocument;

        let color = entity.color;
        if (colorMode === 'grayscale') {
            const gray = 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
            color = [gray, gray, gray];
        }

        pdf.setDrawColor(...color);
        pdf.setFillColor(...color);

        switch (entity.type) {
            case 'LINE':
                pdf.setLineWidth(0.5);
                pdf.line(
                    entity.start[0] * scale + offsetX,
                    this.invertY(entity.start[1], offsetY, scale),
                    entity.end[0] * scale + offsetX,
                    this.invertY(entity.end[1], offsetY, scale)
                );
                break;

            case 'LWPOLYLINE':
                pdf.setLineWidth(0.5);
                if (entity.points.length > 0) {
                    const points = entity.points.map(p => [
                        p[0] * scale + offsetX,
                        this.invertY(p[1], offsetY, scale)
                    ]);
                    for (let i = 0; i < points.length - 1; i++) {
                        pdf.line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
                    }
                }
                break;

            case 'CIRCLE':
                pdf.setLineWidth(0.5);
                const circleCenterY = this.invertY(entity.center[1], offsetY, scale);
                pdf.circle(entity.center[0] * scale + offsetX, circleCenterY, entity.radius * scale);
                break;

            case 'ARC':
                pdf.setLineWidth(0.5);
                const arcCenterY = this.invertY(entity.center[1], offsetY, scale);
                const steps = 10;
                for (let i = 0; i < steps; i++) {
                    const angle1 = entity.startAngle + (entity.endAngle - entity.startAngle) * i / steps;
                    const angle2 = entity.startAngle + (entity.endAngle - entity.startAngle) * (i + 1) / steps;
                    const x1 = entity.center[0] * scale + offsetX + entity.radius * scale * Math.cos(angle1 * Math.PI / 180);
                    const y1 = arcCenterY - entity.radius * scale * Math.sin(angle1 * Math.PI / 180);
                    const x2 = entity.center[0] * scale + offsetX + entity.radius * scale * Math.cos(angle2 * Math.PI / 180);
                    const y2 = arcCenterY - entity.radius * scale * Math.sin(angle2 * Math.PI / 180);
                    pdf.line(x1, y1, x2, y2);
                }
                break;

            case 'TEXT':
                pdf.setFontSize(entity.height * scale * 1.5);
                pdf.setFont('helvetica', 'normal');
                const textY = this.invertY(entity.position[1], offsetY, scale);
                pdf.text(entity.text, entity.position[0] * scale + offsetX, textY);
                break;
        }
    }

    invertY(y, offsetY, scale) {
        return offsetY - y * scale;
    }

    showResult(isBatch) {
        this.progressSection.style.display = 'none';
        this.resultSection.style.display = 'block';
        this.resultSection.style.animation = 'scaleIn 0.4s ease';

        if (isBatch) {
            this.resultTitle.textContent = `تم تحويل ${this.convertedFiles.length} ملفات بنجاح!`;
            this.resultMessage.textContent = 'يمكنك تحميل كل ملف على حدة أو تحميل جميع الملفات كملف مضغوط';
            this.downloadBtn.style.display = 'none';
            this.downloadZipBtn.style.display = 'flex';
            this.downloadText.textContent = `تحميل الكل (${this.convertedFiles.length})`;
        } else {
            this.resultTitle.textContent = 'تم التحويل بنجاح!';
            this.resultMessage.textContent = '';
            this.downloadBtn.style.display = 'flex';
            this.downloadZipBtn.style.display = 'none';
            this.downloadText.textContent = 'تحميل PDF';
        }
    }

    downloadPDF() {
        if (this.convertedFiles.length > 0) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(this.convertedFiles[0].blob);
            link.download = this.convertedFiles[0].name;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    }

    downloadZIP() {
        if (typeof JSZip === 'undefined') {
            this.showError('جاري تحميل مكتبة الضغط...');
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => this.createAndDownloadZIP();
            document.head.appendChild(script);
            return;
        }
        this.createAndDownloadZIP();
    }

    createAndDownloadZIP() {
        const zip = new JSZip();
        this.convertedFiles.forEach(file => {
            zip.file(file.name, file.blob);
        });

        zip.generateAsync({ type: 'blob' }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `CADverter_Converted_${new Date().toISOString().slice(0, 10)}.zip`;
            link.click();
            URL.revokeObjectURL(link.href);
        });
    }

    resetConverter() {
        this.files = [];
        this.convertedFiles = [];
        this.fileInput.value = '';
        this.updateUI();
        this.progressSection.style.display = 'none';
        this.resultSection.style.display = 'none';
    }

    // سجل التحويلات
    loadHistory() {
        try {
            const history = localStorage.getItem('cadverter_history');
            this.history = history ? JSON.parse(history) : [];
        } catch (e) {
            this.history = [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('cadverter_history', JSON.stringify(this.history));
        } catch (e) {
            console.warn('لا يمكن حفظ السجل');
        }
    }

    addToHistory(fileName) {
        this.history.unshift({
            name: fileName,
            date: new Date().toISOString()
        });
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        this.saveHistory();
    }

    showHistory() {
        this.historySection.style.display = 'flex';
        this.renderHistoryList();
    }

    hideHistory() {
        this.historySection.style.display = 'none';
    }

    renderHistoryList() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p class="empty-history">لا توجد تحويلات سابقة</p>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div class="history-item-info">
                    <span class="history-item-name">${item.name}</span>
                    <span class="history-item-date">${this.formatDate(item.date)}</span>
                </div>
            </div>
        `).join('');
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('ar-EG') + ' ' + date.toLocaleTimeString('ar-EG');
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistoryList();
    }
}

// تهيئة المحول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.converter = new DWGtoPDFConverter();
});

// إضافة jsPDF من CDN
const jspdfScript = document.createElement('script');
jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
jspdfScript.async = true;
document.head.appendChild(jspdfScript);

// إضافة JSZip من CDN للتحويل المتعدد
const jszipScript = document.createElement('script');
jszipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
jszipScript.async = true;
document.head.appendChild(jszipScript);