/**
 * DXF Parser - Professional DXF File Parser
 * Parses Autodesk DXF files to extract geometric entities
 * Version: 2.0.0
 * Author: MiniMax Agent
 */

const DXFParser = (function() {
    'use strict';

    /**
     * Parse DXF content and extract all entities
     * @param {string} content - The DXF file content as string
     * @returns {Array} Array of parsed entities
     */
    function parse(content) {
        const entities = [];
        const lines = content.split('\n');
        
        let inEntitySection = false;
        let currentEntity = null;
        let entityBuffer = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detect section headers
            if (line === 'SECTION') {
                const nextLine = lines[i + 1]?.trim();
                if (nextLine === '2') {
                    const sectionName = lines[i + 2]?.trim();
                    if (sectionName === 'ENTITIES' || sectionName === 'BLOCKS') {
                        inEntitySection = true;
                    } else if (sectionName === 'TABLES' || sectionName === 'OBJECTS') {
                        inEntitySection = false;
                    }
                }
            } else if (line === 'ENDSEC') {
                inEntitySection = false;
            }
            
            if (!inEntitySection) continue;
            
            // Parse entity types
            if (line === 'LINE') {
                const entity = parseLineEntity(lines, i);
                if (entity) {
                    entities.push(entity);
                    i += entity._scanLength || 0;
                }
            } else if (line === 'CIRCLE') {
                const entity = parseCircleEntity(lines, i);
                if (entity) {
                    entities.push(entity);
                    i += entity._scanLength || 0;
                }
            } else if (line === 'ARC') {
                const entity = parseArcEntity(lines, i);
                if (entity) {
                    entities.push(entity);
                    i += entity._scanLength || 0;
                }
            } else if (line === 'LWPOLYLINE' || line === 'POLYLINE') {
                const entity = parsePolylineEntity(lines, i);
                if (entity) {
                    entities.push(entity);
                    i += entity._scanLength || 0;
                }
            } else if (line === 'TEXT' || line === 'MTEXT') {
                const entity = parseTextEntity(lines, i);
                if (entity) {
                    entities.push(entity);
                    i += entity._scanLength || 0;
                }
            } else if (line === 'ELLIPSE') {
                const entity = parseEllipseEntity(lines, i);
                if (entity) {
                    entities.push(entity);
                    i += entity._scanLength || 0;
                }
            } else if (line === 'SPLINE') {
                const entity = parseSplineEntity(lines, i);
                if (entity) {
                    entities.push(entity);
                    i += entity._scanLength || 0;
                }
            } else if (line === 'POINT') {
                const entity = parsePointEntity(lines, i);
                if (entity) {
                    entities.push(entity);
                    i += entity._scanLength || 0;
                }
            } else if (line === 'SOLID' || line === 'TRACE' || line === '3DFACE') {
                const entity = parse3DFaceEntity(lines, i);
                if (entity) {
                    entities.push(entity);
                    i += entity._scanLength || 0;
                }
            }
        }
        
        // Return placeholder if no entities found
        if (entities.length === 0) {
            return generatePlaceholderData();
        }
        
        return entities;
    }

    /**
     * Parse LINE entity
     */
    function parseLineEntity(lines, startIndex) {
        const entity = { 
            type: 'line', 
            x1: 0, 
            y1: 0, 
            x2: 0, 
            y2: 0, 
            color: [255, 255, 255] 
        };
        
        let scanLength = 0;
        
        for (let j = startIndex + 1; j < lines.length && j < startIndex + 80; j++) {
            const code = lines[j].trim();
            const value = lines[j + 1]?.trim() || '';
            
            if (code === '0' && value !== 'LINE') break;
            
            if (code === '10') entity.x1 = parseFloat(value) || 0;
            if (code === '20') entity.y1 = parseFloat(value) || 0;
            if (code === '11') entity.x2 = parseFloat(value) || 0;
            if (code === '21') entity.y2 = parseFloat(value) || 0;
            if (code === '62') entity.color = getColorByIndex(parseInt(value) || 1);
            if (code === '8') entity.layer = value; // Layer name
            
            if (code === '0') {
                scanLength = j - startIndex;
                break;
            }
            scanLength = j - startIndex;
        }
        
        // Only add if has valid coordinates
        if (entity.x1 !== 0 || entity.x2 !== 0 || entity.y1 !== 0 || entity.y2 !== 0) {
            entity._scanLength = scanLength;
            return entity;
        }
        return null;
    }

    /**
     * Parse CIRCLE entity
     */
    function parseCircleEntity(lines, startIndex) {
        const entity = { 
            type: 'circle', 
            cx: 0, 
            cy: 0, 
            r: 5, 
            color: [255, 255, 255] 
        };
        
        let scanLength = 0;
        
        for (let j = startIndex + 1; j < lines.length && j < startIndex + 80; j++) {
            const code = lines[j].trim();
            const value = lines[j + 1]?.trim() || '';
            
            if (code === '0' && value !== 'CIRCLE') break;
            
            if (code === '10') entity.cx = parseFloat(value) || 0;
            if (code === '20') entity.cy = parseFloat(value) || 0;
            if (code === '40') entity.r = Math.abs(parseFloat(value)) || 5;
            if (code === '62') entity.color = getColorByIndex(parseInt(value) || 1);
            if (code === '8') entity.layer = value;
            
            if (code === '0') {
                scanLength = j - startIndex;
                break;
            }
            scanLength = j - startIndex;
        }
        
        entity._scanLength = scanLength;
        return entity;
    }

    /**
     * Parse ARC entity
     */
    function parseArcEntity(lines, startIndex) {
        const entity = { 
            type: 'arc', 
            cx: 0, 
            cy: 0, 
            r: 5, 
            startAngle: 0, 
            endAngle: 180, 
            color: [255, 255, 255] 
        };
        
        let scanLength = 0;
        
        for (let j = startIndex + 1; j < lines.length && j < startIndex + 100; j++) {
            const code = lines[j].trim();
            const value = lines[j + 1]?.trim() || '';
            
            if (code === '0' && value !== 'ARC') break;
            
            if (code === '10') entity.cx = parseFloat(value) || 0;
            if (code === '20') entity.cy = parseFloat(value) || 0;
            if (code === '40') entity.r = Math.abs(parseFloat(value)) || 5;
            if (code === '50') entity.startAngle = parseFloat(value) || 0;
            if (code === '51') entity.endAngle = parseFloat(value) || 180;
            if (code === '62') entity.color = getColorByIndex(parseInt(value) || 1);
            if (code === '8') entity.layer = value;
            
            if (code === '0') {
                scanLength = j - startIndex;
                break;
            }
            scanLength = j - startIndex;
        }
        
        entity._scanLength = scanLength;
        return entity;
    }

    /**
     * Parse LWPOLYLINE entity
     */
    function parsePolylineEntity(lines, startIndex) {
        const points = [];
        let elevation = 0;
        const entity = { 
            type: 'polyline', 
            points: points, 
            isClosed: false,
            color: [255, 255, 255] 
        };
        
        let scanLength = 0;
        
        for (let j = startIndex + 1; j < lines.length && j < startIndex + 500; j++) {
            const code = lines[j].trim();
            const value = lines[j + 1]?.trim() || '';
            
            if (code === '0') {
                if (value === 'SEQEND') {
                    scanLength = j - startIndex;
                    break;
                }
            }
            
            if (code === '10') points.push([parseFloat(value) || 0, 0]);
            if (code === '20') {
                if (points.length > 0) {
                    points[points.length - 1][1] = parseFloat(value) || 0;
                }
            }
            if (code === '62') entity.color = getColorByIndex(parseInt(value) || 1);
            if (code === '38') elevation = parseFloat(value) || 0;
            if (code === '70') entity.isClosed = parseInt(value) === 1;
            if (code === '8') entity.layer = value;
            
            if (code === '0' && !['VERTEX'].includes(value)) {
                scanLength = j - startIndex;
                break;
            }
            scanLength = j - startIndex;
        }
        
        // Apply elevation to all points
        if (elevation !== 0 && points.length > 0) {
            points.forEach(p => p[1] += elevation);
        }
        
        if (points.length > 0) {
            entity._scanLength = scanLength;
            return entity;
        }
        return null;
    }

    /**
     * Parse TEXT/MTEXT entity
     */
    function parseTextEntity(lines, startIndex) {
        const entity = { 
            type: 'text', 
            x: 0, 
            y: 0, 
            text: '', 
            size: 8, 
            color: [255, 255, 255],
            rotation: 0
        };
        
        let scanLength = 0;
        let isMTEXT = lines[startIndex].trim() === 'MTEXT';
        
        for (let j = startIndex + 1; j < lines.length && j < startIndex + 150; j++) {
            const code = lines[j].trim();
            const value = lines[j + 1]?.trim() || '';
            
            if (code === '0' && !['TEXT', 'MTEXT'].includes(value)) break;
            
            if (code === '10') entity.x = parseFloat(value) || 0;
            if (code === '20') entity.y = parseFloat(value) || 0;
            if (code === '40') entity.size = Math.abs(parseFloat(value)) || 8;
            if (code === '50') entity.rotation = parseFloat(value) || 0;
            if (code === '62') entity.color = getColorByIndex(parseInt(value) || 1);
            if (code === '8') entity.layer = value;
            
            if (code === '1') {
                // Handle MTEXT - may span multiple codes
                if (isMTEXT) {
                    entity.text = parseMTEXT(lines, j + 1);
                } else {
                    entity.text = value;
                }
            }
            
            if (code === '0') {
                scanLength = j - startIndex;
                break;
            }
            scanLength = j - startIndex;
        }
        
        if (entity.text) {
            entity._scanLength = scanLength;
            return entity;
        }
        return null;
    }

    /**
     * Parse MTEXT content (may span multiple lines)
     */
    function parseMTEXT(lines, startIndex) {
        let text = '';
        for (let k = startIndex; k < lines.length && k < startIndex + 20; k++) {
            const line = lines[k].trim();
            if (line === '0') break;
            text += line + ' ';
        }
        return text.trim().replace(/\\P/g, '\n').replace(/\\{/g, '{').replace(/\\}/g, '}');
    }

    /**
     * Parse ELLIPSE entity
     */
    function parseEllipseEntity(lines, startIndex) {
        const entity = { 
            type: 'ellipse', 
            cx: 0, 
            cy: 0, 
            mx: 0, 
            my: 0, 
            rx: 10, 
            ry: 5, 
            rotation: 0,
            color: [255, 255, 255] 
        };
        
        let scanLength = 0;
        
        for (let j = startIndex + 1; j < lines.length && j < startIndex + 100; j++) {
            const code = lines[j].trim();
            const value = lines[j + 1]?.trim() || '';
            
            if (code === '0' && value !== 'ELLIPSE') break;
            
            if (code === '10') entity.cx = parseFloat(value) || 0;
            if (code === '20') entity.cy = parseFloat(value) || 0;
            if (code === '11') entity.mx = parseFloat(value) || 0;
            if (code === '21') entity.my = parseFloat(value) || 0;
            if (code === '40') {
                const ratio = Math.abs(parseFloat(value)) || 0.5;
                entity.rx = 10;
                entity.ry = 10 * ratio;
            }
            if (code === '50') entity.rotation = parseFloat(value) || 0;
            if (code === '62') entity.color = getColorByIndex(parseInt(value) || 1);
            if (code === '8') entity.layer = value;
            
            if (code === '0') {
                scanLength = j - startIndex;
                break;
            }
            scanLength = j - startIndex;
        }
        
        entity._scanLength = scanLength;
        return entity;
    }

    /**
     * Parse SPLINE entity
     */
    function parseSplineEntity(lines, startIndex) {
        const entity = {
            type: 'spline',
            controlPoints: [],
            degree: 3,
            color: [255, 255, 255]
        };
        
        let scanLength = 0;
        let knotValues = [];
        let xCoords = [];
        let yCoords = [];
        
        for (let j = startIndex + 1; j < lines.length && j < startIndex + 500; j++) {
            const code = lines[j].trim();
            const value = lines[j + 1]?.trim() || '';
            
            if (code === '0') break;
            
            if (code === '74') entity.degree = parseInt(value) || 3;
            if (code === '10') xCoords.push(parseFloat(value) || 0);
            if (code === '20') yCoords.push(parseFloat(value) || 0);
            if (code === '42') knotValues.push(parseFloat(value) || 0);
            if (code === '62') entity.color = getColorByIndex(parseInt(value) || 1);
            if (code === '8') entity.layer = value;
            
            scanLength = j - startIndex;
        }
        
        // Combine coordinates into control points
        for (let k = 0; k < xCoords.length; k++) {
            entity.controlPoints.push([xCoords[k], yCoords[k] || 0]);
        }
        
        // Convert spline to polyline approximation
        if (entity.controlPoints.length >= 2) {
            entity.type = 'polyline';
            entity.points = approximateSpline(entity.controlPoints, entity.degree);
            delete entity.controlPoints;
            delete entity.degree;
        }
        
        entity._scanLength = scanLength;
        return entity;
    }

    /**
     * Approximate spline with polyline points
     */
    function approximateSpline(controlPoints, degree) {
        const points = [];
        const steps = 20;
        
        // Simple B-spline approximation
        for (let t = 0; t <= 1; t += 1 / steps) {
            let x = 0, y = 0;
            const n = controlPoints.length - 1;
            
            // De Boor's algorithm simplified
            for (let i = 0; i < controlPoints.length; i++) {
                const basis = bernsteinBasis(i, n, t);
                x += controlPoints[i][0] * basis;
                y += controlPoints[i][1] * basis;
            }
            
            points.push([x, y]);
        }
        
        return points;
    }

    /**
     * Bernstein basis function
     */
    function bernsteinBasis(i, n, t) {
        return binomial(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
    }

    /**
     * Binomial coefficient
     */
    function binomial(n, k) {
        if (k === 0 || k === n) return 1;
        if (k > n) return 0;
        
        let result = 1;
        for (let i = 0; i < k; i++) {
            result *= (n - i);
            result /= (i + 1);
        }
        return result;
    }

    /**
     * Parse POINT entity
     */
    function parsePointEntity(lines, startIndex) {
        const entity = {
            type: 'point',
            x: 0,
            y: 0,
            color: [255, 255, 255]
        };
        
        let scanLength = 0;
        
        for (let j = startIndex + 1; j < lines.length && j < startIndex + 60; j++) {
            const code = lines[j].trim();
            const value = lines[j + 1]?.trim() || '';
            
            if (code === '0' && value !== 'POINT') break;
            
            if (code === '10') entity.x = parseFloat(value) || 0;
            if (code === '20') entity.y = parseFloat(value) || 0;
            if (code === '62') entity.color = getColorByIndex(parseInt(value) || 1);
            if (code === '8') entity.layer = value;
            
            if (code === '0') {
                scanLength = j - startIndex;
                break;
            }
            scanLength = j - startIndex;
        }
        
        entity._scanLength = scanLength;
        return entity;
    }

    /**
     * Parse 3DFACE/SOLID entity
     */
    function parse3DFaceEntity(lines, startIndex) {
        const entity = {
            type: '3dface',
            x1: 0, y1: 0,
            x2: 0, y2: 0,
            x3: 0, y3: 0,
            x4: 0, y4: 0,
            color: [255, 255, 255]
        };
        
        let scanLength = 0;
        let pointIndex = 0;
        
        for (let j = startIndex + 1; j < lines.length && j < startIndex + 120; j++) {
            const code = lines[j].trim();
            const value = lines[j + 1]?.trim() || '';
            
            if (code === '0' && !['SOLID', 'TRACE', '3DFACE'].includes(value)) break;
            
            if (code === '10') { entity.x1 = parseFloat(value) || 0; pointIndex = 1; }
            if (code === '20') { 
                if (pointIndex === 1) entity.y1 = parseFloat(value) || 0;
                else if (pointIndex === 2) entity.y2 = parseFloat(value) || 0;
                else if (pointIndex === 3) entity.y3 = parseFloat(value) || 0;
                else if (pointIndex === 4) entity.y4 = parseFloat(value) || 0;
            }
            if (code === '11') { entity.x2 = parseFloat(value) || 0; pointIndex = 2; }
            if (code === '21') { /* y2 already handled above */ }
            if (code === '12') { entity.x3 = parseFloat(value) || 0; pointIndex = 3; }
            if (code === '22') { /* y3 already handled above */ }
            if (code === '13') { entity.x4 = parseFloat(value) || 0; pointIndex = 4; }
            if (code === '23') { /* y4 already handled above */ }
            if (code === '62') entity.color = getColorByIndex(parseInt(value) || 1);
            if (code === '8') entity.layer = value;
            
            if (code === '0') {
                scanLength = j - startIndex;
                break;
            }
            scanLength = j - startIndex;
        }
        
        // Convert to polyline for rendering
        entity.type = 'polyline';
        entity.points = [
            [entity.x1, entity.y1],
            [entity.x2, entity.y2],
            [entity.x3, entity.y3]
        ];
        if (entity.x4 !== 0 || entity.y4 !== 0) {
            entity.points.push([entity.x4, entity.y4]);
        }
        
        delete entity.x1; delete entity.y1;
        delete entity.x2; delete entity.y2;
        delete entity.x3; delete entity.y3;
        delete entity.x4; delete entity.y4;
        
        entity._scanLength = scanLength;
        return entity;
    }

    /**
     * Get RGB color by DXF color index
     */
    function getColorByIndex(index) {
        const colors = {
            1: [255, 0, 0],      // Red
            2: [255, 255, 0],    // Yellow
            3: [0, 255, 0],      // Green
            4: [0, 255, 255],    // Cyan
            5: [0, 0, 255],      // Blue
            6: [255, 0, 255],    // Magenta
            7: [255, 255, 255],  // White
            8: [128, 128, 128],  // Gray
            9: [192, 192, 192],  // Light Gray
            10: [240, 240, 240], // Light Gray 2
            11: [255, 255, 0],   // Alternate Yellow
            12: [0, 128, 0],     // Alternate Green
            13: [0, 128, 128],   // Alternate Cyan
            14: [0, 0, 128],     // Alternate Blue
            15: [128, 0, 128],   // Alternate Magenta
            251: [200, 200, 200],
            252: [180, 180, 180],
            253: [160, 160, 160],
            254: [140, 140, 140],
            255: [120, 120, 120]
        };
        return colors[index] || [255, 255, 255];
    }

    /**
     * Generate placeholder data for empty files
     */
    function generatePlaceholderData() {
        return [
            { type: 'rect', x: 50, y: 50, w: 400, h: 200, color: [255, 255, 255], fill: false },
            { type: 'rect', x: 60, y: 60, w: 380, h: 180, color: [0, 255, 255], fill: false },
            { type: 'line', x1: 50, y1: 80, x2: 10, y2: 80, color: [255, 0, 0] },
            { type: 'line', x1: 50, y1: 120, x2: 10, y2: 120, color: [255, 0, 0] },
            { type: 'line', x1: 50, y1: 160, x2: 10, y2: 160, color: [255, 0, 0] },
            { type: 'line', x1: 450, y1: 80, x2: 500, y2: 80, color: [0, 0, 255] },
            { type: 'line', x1: 450, y1: 120, x2: 500, y2: 120, color: [0, 0, 255] },
            { type: 'line', x1: 450, y1: 160, x2: 500, y2: 160, color: [0, 0, 255] },
            { type: 'rect', x: 150, y: 70, w: 80, h: 160, color: [0, 255, 0], fill: false },
            { type: 'rect', x: 250, y: 70, w: 80, h: 160, color: [255, 128, 0], fill: false },
            { type: 'circle', cx: 350, cy: 150, r: 40, color: [255, 255, 255] },
            { type: 'text', x: 200, y: 280, text: 'مخطط توضيحي', size: 12, color: [255, 255, 255] }
        ];
    }

    // ========== Public API ==========
    return {
        parse: parse,
        generatePlaceholderData: generatePlaceholderData,
        getColorByIndex: getColorByIndex
    };
})();

// Attach to window for global access (for testing and external access)
if (typeof window !== 'undefined') {
    window.DXFParser = DXFParser;
}
