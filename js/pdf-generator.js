/**
 * PDF Generator - Professional PDF Generation Module
 * Creates PDF documents from CAD drawing data
 * Version: 2.0.0
 * Author: MiniMax Agent
 */

const PDFGenerator = (function() {
    'use strict';

    // Paper size definitions (in mm)
    const PAPER_SIZES = {
        'a4': { width: 210, height: 297 },
        'a3': { width: 297, height: 420 },
        'a2': { width: 420, height: 594 },
        'a1': { width: 594, height: 841 },
        'a0': { width: 841, height: 1189 },
        'letter': { width: 215.9, height: 279.4 },
        'legal': { width: 215.9, height: 355.6 },
        'tabloid': { width: 279.4, height: 431.8 }
    };

    // Default settings
    const DEFAULT_OPTIONS = {
        paperSize: 'a4',
        orientation: 'portrait',
        scale: 'auto',
        quality: 'high',
        colorMode: 'color',
        margin: 15,
        headerSpace: 25
    };

    /**
     * Create PDF from file item
     * @param {Object} fileItem - File object with extension and data
     * @param {Object} options - PDF generation options
     * @returns {Promise<Blob>} PDF blob
     */
    async function createPDF(fileItem, options = {}) {
        const settings = { ...DEFAULT_OPTIONS, ...options };
        
        // Get paper dimensions
        const paperSize = PAPER_SIZES[settings.paperSize] || PAPER_SIZES['a4'];
        let { width: pageWidth, height: pageHeight } = paperSize;
        
        // Handle orientation
        const isLandscape = settings.orientation === 'landscape';
        if (isLandscape) {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
        }

        // Create PDF document
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: isLandscape ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [pageWidth, pageHeight]
        });

        // Generate drawing data
        let drawingData;
        if (fileItem.content) {
            drawingData = DXFParser.parse(fileItem.content);
        } else {
            drawingData = DXFParser.generatePlaceholderData(fileItem.file.name);
        }

        // Calculate drawing bounds
        const bounds = calculateBounds(drawingData);

        // Calculate scale
        const margin = settings.margin;
        const headerSpace = settings.headerSpace;
        const contentWidth = pageWidth - (margin * 2);
        const contentHeight = pageHeight - margin - headerSpace;

        let scale;
        if (settings.scale === 'auto') {
            const scaleX = contentWidth / bounds.width;
            const scaleY = contentHeight / bounds.height;
            scale = Math.min(scaleX, scaleY);
        } else {
            scale = parseFloat(settings.scale);
        }

        const scaledWidth = bounds.width * scale;
        const scaledHeight = bounds.height * scale;
        
        let offsetX = margin + (contentWidth - scaledWidth) / 2;
        let offsetY = margin + headerSpace + (contentHeight - scaledHeight) / 2;

        // Add header
        addHeader(pdf, fileItem, pageWidth, margin);

        // Draw entities
        drawEntities(pdf, drawingData, bounds, offsetX, offsetY, scaledWidth, scaledHeight, scale, settings);

        // Add border
        pdf.setDrawColor(200);
        pdf.setLineWidth(0.1);
        pdf.rect(offsetX, offsetY, scaledWidth, scaledHeight);

        // Add footer
        addFooter(pdf, pageWidth, pageHeight, settings);

        return pdf.output('blob');
    }

    /**
     * Add header to PDF
     */
    function addHeader(pdf, fileItem, pageWidth, margin) {
        // Title
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const title = fileItem.file.name.replace(/\.(dwg|dxf)$/i, '');
        pdf.text(title, margin, margin + 8);

        // Metadata
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100);
        pdf.text(`التاريخ: ${new Date().toLocaleDateString('ar-EG')}`, margin, margin + 14);
        pdf.text(`المصدر: CADverter`, margin, margin + 19);
        pdf.setTextColor(0);
    }

    /**
     * Add footer to PDF
     */
    function addFooter(pdf, pageWidth, pageHeight, settings) {
        pdf.setFontSize(8);
        pdf.setTextColor(128);
        pdf.text(
            `تم إنشاؤه بواسطة CADverter | ${settings.paperSize.toUpperCase()} | ${settings.scale === 'auto' ? 'مقياس تلقائي' : settings.scale * 100 + '%'}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: 'center' }
        );
        pdf.setTextColor(0);
    }

    /**
     * Calculate drawing bounds from entities
     */
    function calculateBounds(entities) {
        if (!entities || entities.length === 0) {
            return { minX: 0, minY: 0, width: 500, height: 350 };
        }
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        entities.forEach(ent => {
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
            } else if (ent.type === 'point') {
                minX = Math.min(minX, ent.x);
                maxX = Math.max(maxX, ent.x);
                minY = Math.min(minY, ent.y);
                maxY = Math.max(maxY, ent.y);
            }
        });
        
        const padding = 30;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        
        return {
            minX,
            minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Draw all entities on PDF
     */
    function drawEntities(pdf, entities, bounds, offsetX, offsetY, scaledWidth, scaledHeight, scale, settings) {
        const dpiScale = settings.quality === 'high' ? 1 : settings.quality === 'medium' ? 0.75 : 0.5;
        const lineWidth = 0.3 * dpiScale;

        // Coordinate transformation function
        function toPDF(x, y) {
            return [
                offsetX + (x - bounds.minX) * scale,
                offsetY + (scaledHeight - (y - bounds.minY) * scale)
            ];
        }

        entities.forEach(ent => {
            let color = ent.color || [0, 0, 0];
            
            // Apply color mode
            if (settings.colorMode === 'grayscale') {
                const gray = 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
                color = [gray, gray, gray];
            } else if (settings.colorMode === 'black') {
                color = [0, 0, 0];
            } else if (settings.colorMode === 'white') {
                color = [255, 255, 255];
            }
            
            pdf.setDrawColor(...color);
            pdf.setFillColor(...color);

            switch (ent.type) {
                case 'line':
                    drawLine(pdf, ent, toPDF, lineWidth);
                    break;
                    
                case 'rect':
                    drawRect(pdf, ent, bounds, scale, lineWidth);
                    break;
                    
                case 'circle':
                    drawCircle(pdf, ent, toPDF, scale, lineWidth);
                    break;
                    
                case 'arc':
                    drawArc(pdf, ent, toPDF, scale, lineWidth);
                    break;
                    
                case 'ellipse':
                    drawEllipse(pdf, ent, toPDF, scale, lineWidth);
                    break;
                    
                case 'polyline':
                    drawPolyline(pdf, ent, toPDF, lineWidth);
                    break;
                    
                case 'text':
                    drawText(pdf, ent, toPDF, scale, dpiScale);
                    break;
                    
                case 'point':
                    drawPoint(pdf, ent, toPDF, dpiScale);
                    break;
                    
                case 'spline':
                    // Convert spline to polyline
                    drawPolyline(pdf, { points: ent.controlPoints }, toPDF, lineWidth);
                    break;
            }
        });
    }

    /**
     * Draw line entity
     */
    function drawLine(pdf, entity, toPDF, lineWidth) {
        const [x1, y1] = toPDF(entity.x1, entity.y1);
        const [x2, y2] = toPDF(entity.x2, entity.y2);
        pdf.setLineWidth(lineWidth);
        pdf.line(x1, y1, x2, y2);
    }

    /**
     * Draw rectangle entity
     */
    function drawRect(pdf, entity, bounds, scale, lineWidth) {
        const [x, y] = toPDF(entity.x, entity.y + entity.h);
        pdf.setLineWidth(lineWidth);
        
        if (entity.fill) {
            pdf.setFillColor(...entity.color);
            pdf.rect(x, y, entity.w * scale, entity.h * scale, 'F');
        } else {
            pdf.rect(x, y, entity.w * scale, entity.h * scale, 'S');
        }
    }

    /**
     * Draw circle entity
     */
    function drawCircle(pdf, entity, toPDF, scale, lineWidth) {
        const [cx, cy] = toPDF(entity.cx, entity.cy);
        pdf.setLineWidth(lineWidth);
        pdf.circle(cx, cy, entity.r * scale);
    }

    /**
     * Draw arc entity
     */
    function drawArc(pdf, entity, toPDF, scale, lineWidth) {
        const [cx, cy] = toPDF(entity.cx, entity.cy);
        const startAngle = (entity.startAngle * Math.PI) / 180;
        const endAngle = (entity.endAngle * Math.PI) / 180;
        
        pdf.setLineWidth(lineWidth);
        pdf.arc(cx, cy, entity.r * scale, startAngle, endAngle);
    }

    /**
     * Draw ellipse entity
     */
    function drawEllipse(pdf, entity, toPDF, scale, lineWidth) {
        const [cx, cy] = toPDF(entity.cx, entity.cy);
        const rotation = (entity.rotation || 0) * Math.PI / 180;
        
        pdf.setLineWidth(lineWidth);
        pdf.ellipse(cx, cy, entity.rx * scale, entity.ry * scale, rotation, 0, 2 * Math.PI);
    }

    /**
     * Draw polyline entity
     */
    function drawPolyline(pdf, entity, toPDF, lineWidth) {
        if (!entity.points || entity.points.length < 2) return;
        
        pdf.setLineWidth(lineWidth);
        const points = entity.points.map(p => toPDF(p[0], p[1]));
        
        for (let i = 0; i < points.length - 1; i++) {
            pdf.line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
        }
        
        // Close polyline if specified
        if (entity.isClosed && points.length > 2) {
            pdf.line(points[points.length - 1][0], points[points.length - 1][1], points[0][0], points[0][1]);
        }
    }

    /**
     * Draw text entity
     */
    function drawText(pdf, entity, toPDF, scale, dpiScale) {
        const [x, y] = toPDF(entity.x, entity.y);
        const fontSize = Math.max(4, entity.size * scale * 0.5 * dpiScale);
        
        pdf.setFontSize(fontSize);
        
        // Check if text contains Arabic characters
        const isArabic = /[\u0600-\u06FF]/.test(entity.text);
        if (isArabic) {
            // Basic Arabic support: reverse text for simple display if no complex shaper is available
            // Note: For full support, a custom font and shaper like opentype.js would be needed
            const reversedText = entity.text.split('').reverse().join('');
            pdf.setFont('courier', 'normal'); // Courier sometimes handles unicode better in basic jspdf
            pdf.text(reversedText, x, y, { align: 'right' });
        } else {
            pdf.setFont('helvetica', 'normal');
            pdf.text(entity.text, x, y);
        }
    }

    /**
     * Draw point entity
     */
    function drawPoint(pdf, entity, toPDF, dpiScale) {
        const [x, y] = toPDF(entity.x, entity.y);
        const pointSize = 2 * dpiScale;
        
        pdf.setFillColor(...entity.color);
        pdf.circle(x, y, pointSize / 2, 'F');
    }

    /**
     * Create multi-page PDF from multiple files
     * @param {Array} fileItems - Array of file objects
     * @param {Object} options - PDF generation options
     * @returns {Promise<Blob>} PDF blob
     */
    async function createMultiPagePDF(fileItems, options = {}) {
        const { jsPDF } = window.jspdf;
        const settings = { ...DEFAULT_OPTIONS, ...options };
        
        // Get paper dimensions
        const paperSize = PAPER_SIZES[settings.paperSize] || PAPER_SIZES['a4'];
        let { width: pageWidth, height: pageHeight } = paperSize;
        
        // Handle orientation
        const isLandscape = settings.orientation === 'landscape';
        if (isLandscape) {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
        }

        // Create first page
        const pdf = new jsPDF({
            orientation: isLandscape ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [pageWidth, pageHeight]
        });

        for (let i = 0; i < fileItems.length; i++) {
            if (i > 0) {
                pdf.addPage();
            }

            const fileItem = fileItems[i];
            
            // Generate drawing data
            let drawingData = DXFParser.generatePlaceholderData(fileItem.file.name);

            // Calculate bounds
            const bounds = calculateBounds(drawingData);

            // Calculate scale
            const margin = settings.margin;
            const headerSpace = settings.headerSpace;
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - margin - headerSpace;

            let scale;
            if (settings.scale === 'auto') {
                const scaleX = contentWidth / bounds.width;
                const scaleY = contentHeight / bounds.height;
                scale = Math.min(scaleX, scaleY);
            } else {
                scale = parseFloat(settings.scale);
            }

            const scaledWidth = bounds.width * scale;
            const scaledHeight = bounds.height * scale;
            
            let offsetX = margin + (contentWidth - scaledWidth) / 2;
            let offsetY = margin + headerSpace + (contentHeight - scaledHeight) / 2;

            // Add header with file name
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            const title = fileItem.file.name.replace(/\.(dwg|dxf)$/i, '');
            pdf.text(`${title} (${i + 1}/${fileItems.length})`, margin, margin + 8);

            // Add page number
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100);
            pdf.text(`صفحة ${i + 1} من ${fileItems.length}`, margin, margin + 14);
            pdf.setTextColor(0);

            // Coordinate transformation
            function toPDF(x, y) {
                return [
                    offsetX + (x - bounds.minX) * scale,
                    offsetY + (scaledHeight - (y - bounds.minY) * scale)
                ];
            }

            const dpiScale = settings.quality === 'high' ? 1 : settings.quality === 'medium' ? 0.75 : 0.5;
            const lineWidth = 0.3 * dpiScale;

            // Draw entities
            drawingData.forEach(ent => {
                let color = ent.color || [0, 0, 0];
                
                if (settings.colorMode === 'grayscale') {
                    const gray = 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
                    color = [gray, gray, gray];
                }
                
                pdf.setDrawColor(...color);
                pdf.setFillColor(...color);

                if (ent.type === 'line') {
                    const [x1, y1] = toPDF(ent.x1, ent.y1);
                    const [x2, y2] = toPDF(ent.x2, ent.y2);
                    pdf.setLineWidth(lineWidth);
                    pdf.line(x1, y1, x2, y2);
                } else if (ent.type === 'rect') {
                    const [x, y] = toPDF(ent.x, ent.y + ent.h);
                    pdf.setLineWidth(lineWidth);
                    pdf.rect(x, y, ent.w * scale, ent.h * scale);
                } else if (ent.type === 'circle') {
                    const [cx, cy] = toPDF(ent.cx, ent.cy);
                    pdf.setLineWidth(lineWidth);
                    pdf.circle(cx, cy, ent.r * scale);
                } else if (ent.type === 'polyline') {
                    pdf.setLineWidth(lineWidth);
                    const points = ent.points.map(p => toPDF(p[0], p[1]));
                    for (let j = 0; j < points.length - 1; j++) {
                        pdf.line(points[j][0], points[j][1], points[j + 1][0], points[j + 1][1]);
                    }
                } else if (ent.type === 'text') {
                    const [x, y] = toPDF(ent.x, ent.y);
                    pdf.setFontSize(ent.size * scale * 0.5 * dpiScale);
                    pdf.text(ent.text, x, y);
                }
            });

            // Add border
            pdf.setDrawColor(200);
            pdf.setLineWidth(0.1);
            pdf.rect(offsetX, offsetY, scaledWidth, scaledHeight);

            // Add footer
            pdf.setFontSize(8);
            pdf.setTextColor(128);
            pdf.text(
                `CADverter | ${new Date().toLocaleDateString('ar-EG')}`,
                pageWidth / 2,
                pageHeight - 8,
                { align: 'center' }
            );
            pdf.setTextColor(0);
        }

        return pdf.output('blob');
    }

    /**
     * Get available paper sizes
     * @returns {Array} Array of paper size objects
     */
    function getPaperSizes() {
        return Object.keys(PAPER_SIZES).map(key => ({
            value: key,
            label: getPaperSizeLabel(key),
            width: PAPER_SIZES[key].width,
            height: PAPER_SIZES[key].height
        }));
    }

    /**
     * Get paper size label in Arabic
     */
    function getPaperSizeLabel(key) {
        const labels = {
            'a4': 'A4 (210 × 297 ملم)',
            'a3': 'A3 (297 × 420 ملم)',
            'a2': 'A2 (420 × 594 ملم)',
            'a1': 'A1 (594 × 841 ملم)',
            'a0': 'A0 (841 × 1189 ملم)',
            'letter': 'Letter (8.5 × 11 بوصة)',
            'legal': 'Legal (8.5 × 14 بوصة)',
            'tabloid': 'Tabloid (11 × 17 بوصة)'
        };
        return labels[key] || key.toUpperCase();
    }

    // ========== Public API ==========
    return {
        createPDF: createPDF,
        createMultiPagePDF: createMultiPagePDF,
        getPaperSizes: getPaperSizes,
        calculateBounds: calculateBounds,
        PAPER_SIZES: PAPER_SIZES
    };
})();

// Attach to window for global access (for testing and external access)
if (typeof window !== 'undefined') {
    window.PDFGenerator = PDFGenerator;
}
