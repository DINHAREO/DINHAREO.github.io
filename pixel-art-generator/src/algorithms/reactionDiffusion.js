/**
 * Reaction-Diffusion System based on the Gray-Scott model
 * Implements various pattern generation algorithms and visualization modes
 */

import { map, clamp, noise } from '../utils/mathUtils.js';
import { colorPalettes, createColorMap, getColorAt } from '../utils/colorPalettes.js';

export class ReactionDiffusion {
    constructor(canvas, ctx, options = {}) {
        // Canvas setup
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Grid dimensions
        this.cols = Math.floor(this.width / 2);
        this.rows = Math.floor(this.height / 2);
        
        // Chemical grids
        this.gridA = new Float32Array(this.cols * this.rows);
        this.gridB = new Float32Array(this.cols * this.rows);
        
        // Reaction-diffusion parameters
        this.feedRate = options.feedRate || 0.0367;
        this.killRate = options.killRate || 0.0649;
        this.diffusionRateA = 1.0;
        this.diffusionRateB = 0.5;
        this.timeStep = options.timeStep || 1.0;
        
        // Pattern settings
        this.patternType = options.patternType || 'spots';
        this.currentPattern = this.patternType;
        this.complexity = options.complexity || 5;
        this.colorPalette = options.colorPalette || 'ocean';
        this.visualizationMode = options.visualizationMode || 'chemical-b';
        
        // Symmetry settings
        this.horizontalSymmetry = options.horizontalSymmetry || false;
        this.verticalSymmetry = options.verticalSymmetry || false;
        this.radialSymmetry = options.radialSymmetry || false;
        
        // Mouse interaction
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        
        // Audio reactivity
        this.audioData = null;
        this.audioEnabled = false;
        
        // Color map cache
        this.colorMap = [];
        this.updateColorMap();
        
        // Initialize the system
        this.init();
    }
    
    /**
     * Initialize the reaction-diffusion system
     */
    init() {
        // Reset grids
        this.gridA.fill(1.0);
        this.gridB.fill(0.0);
        
        // Create initial pattern
        this.createInitialPattern();
        
        // Apply symmetry if enabled
        this.applySymmetry();
        
        // Update current pattern
        this.currentPattern = this.patternType;
    }
    
    /**
     * Create the initial pattern based on the selected pattern type
     */
    createInitialPattern() {
        switch (this.patternType) {
            case 'spots':
                this.createSpots();
                break;
            case 'stripes':
                this.createStripes();
                break;
            case 'maze':
                this.createMaze();
                break;
            case 'waves':
                this.createWaves();
                break;
            case 'fingerprints':
                this.createFingerprints();
                break;
            default:
                this.createSpots();
        }
    }
    
    /**
     * Create a pattern of chemical spots
     */
    createSpots() {
        const numSpots = Math.floor(this.complexity * 2);
        const spotSize = Math.max(2, Math.floor(this.cols * 0.05));
        
        for (let i = 0; i < numSpots; i++) {
            const x = Math.floor(Math.random() * this.cols);
            const y = Math.floor(Math.random() * this.rows);
            
            for (let dx = -spotSize; dx <= spotSize; dx++) {
                for (let dy = -spotSize; dy <= spotSize; dy++) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= spotSize) {
                        const nx = (x + dx + this.cols) % this.cols;
                        const ny = (y + dy + this.rows) % this.rows;
                        const idx = ny * this.cols + nx;
                        
                        this.gridA[idx] = 0.0;
                        this.gridB[idx] = 1.0;
                    }
                }
            }
        }
    }
    
    /**
     * Create a striped pattern
     */
    createStripes() {
        const frequency = 2 * Math.PI * (this.complexity / 5) / this.cols;
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const idx = y * this.cols + x;
                const value = Math.sin(x * frequency) * 0.5 + 0.5;
                
                this.gridA[idx] = 1.0 - value;
                this.gridB[idx] = value;
            }
        }
    }
    
    /**
     * Create a maze-like pattern
     */
    createMaze() {
        const scale = 0.1 * (this.complexity / 5);
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const idx = y * this.cols + x;
                const value = noise(x * scale, y * scale);
                
                this.gridA[idx] = value > 0 ? 1.0 : 0.0;
                this.gridB[idx] = value > 0 ? 0.0 : 1.0;
            }
        }
    }
    
    /**
     * Create a wave pattern
     */
    createWaves() {
        const frequency = 2 * Math.PI * (this.complexity / 5) / this.cols;
        const amplitude = 0.5;
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const idx = y * this.cols + x;
                const value = Math.sin(x * frequency + y * 0.1) * amplitude + 0.5;
                
                this.gridA[idx] = 1.0 - value;
                this.gridB[idx] = value;
            }
        }
    }
    
    /**
     * Create a fingerprint-like pattern
     */
    createFingerprints() {
        const scale = 0.05 * (this.complexity / 5);
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const idx = y * this.cols + x;
                const value = noise(x * scale, y * scale) * 0.5 + 0.5;
                
                this.gridA[idx] = value;
                this.gridB[idx] = 1.0 - value;
            }
        }
    }
    
    /**
     * Apply symmetry to the current pattern
     */
    applySymmetry() {
        // Horizontal symmetry
        if (this.horizontalSymmetry) {
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols / 2; x++) {
                    const leftIdx = y * this.cols + x;
                    const rightIdx = y * this.cols + (this.cols - 1 - x);
                    
                    this.gridA[rightIdx] = this.gridA[leftIdx];
                    this.gridB[rightIdx] = this.gridB[leftIdx];
                }
            }
        }
        
        // Vertical symmetry
        if (this.verticalSymmetry) {
            for (let x = 0; x < this.cols; x++) {
                for (let y = 0; y < this.rows / 2; y++) {
                    const topIdx = y * this.cols + x;
                    const bottomIdx = (this.rows - 1 - y) * this.cols + x;
                    
                    this.gridA[bottomIdx] = this.gridA[topIdx];
                    this.gridB[bottomIdx] = this.gridB[topIdx];
                }
            }
        }
        
        // Radial symmetry
        if (this.radialSymmetry) {
            const centerX = Math.floor(this.cols / 2);
            const centerY = Math.floor(this.rows / 2);
            const segments = 8; // Number of radial segments
            
            // For each angle, copy the first segment to the other segments
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    const dx = x - centerX;
                    const dy = y - centerY;
                    
                    // Skip the center point
                    if (dx === 0 && dy === 0) continue;
                    
                    // Calculate angle and distance
                    const angle = Math.atan2(dy, dx);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    // Calculate which segment this point belongs to
                    const segmentSize = (2 * Math.PI) / segments;
                    const segmentIndex = Math.floor(((angle + Math.PI) % (2 * Math.PI)) / segmentSize);
                    
                    // Calculate reference angle (first segment)
                    const refAngle = (segmentIndex * segmentSize) + (segmentSize / 2);
                    
                    // Calculate reference point coordinates
                    const refX = Math.round(centerX + dist * Math.cos(refAngle));
                    const refY = Math.round(centerY + dist * Math.sin(refAngle));
                    
                    // Make sure reference point is within bounds
                    if (refX >= 0 && refX < this.cols && refY >= 0 && refY < this.rows) {
                        const srcIdx = refY * this.cols + refX;
                        const destIdx = y * this.cols + x;
                        
                        this.gridA[destIdx] = this.gridA[srcIdx];
                        this.gridB[destIdx] = this.gridB[srcIdx];
                    }
                }
            }
        }
    }
    
    /**
     * Update the reaction-diffusion system
     * @param {Object} options - Update options including mouse position and audio data
     */
    update(options = {}) {
        // Update mouse position
        if (options.mouseX !== undefined) {
            this.mouseX = options.mouseX;
        }
        if (options.mouseY !== undefined) {
            this.mouseY = options.mouseY;
        }
        if (options.isMouseDown !== undefined) {
            this.isMouseDown = options.isMouseDown;
        }
        
        // Update audio data
        if (options.audioData) {
            this.audioData = options.audioData;
            this.audioEnabled = true;
        } else {
            this.audioEnabled = false;
        }
        
        // Handle mouse interaction
        if (this.isMouseDown) {
            const gridX = Math.floor(this.mouseX / 2);
            const gridY = Math.floor(this.mouseY / 2);
            const brushSize = 5;
            
            if (gridX >= 0 && gridX < this.cols && gridY >= 0 && gridY < this.rows) {
                for (let dy = -brushSize; dy <= brushSize; dy++) {
                    for (let dx = -brushSize; dx <= brushSize; dx++) {
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= brushSize) {
                            const nx = (gridX + dx + this.cols) % this.cols;
                            const ny = (gridY + dy + this.rows) % this.rows;
                            const idx = ny * this.cols + nx;
                            
                            this.gridA[idx] = 0.0;
                            this.gridB[idx] = 1.0;
                        }
                    }
                }
                
                // Apply symmetry if enabled
                this.applySymmetry();
            }
        }
        
        // Compute the reaction-diffusion
        this.computeReactionDiffusion();
    }
    
    /**
     * Compute one step of the reaction-diffusion process
     */
    computeReactionDiffusion() {
        // Create temporary grid for the update
        const nextA = new Float32Array(this.cols * this.rows);
        const nextB = new Float32Array(this.cols * this.rows);
        
        // Get audio level for potential modulation
        const audioLevel = this.getAudioLevel();
        
        // Variables for Laplacian computation
        const dA = this.diffusionRateA;
        const dB = this.diffusionRateB;
        
        // Adjust feed and kill rates based on audio reactivity
        let feedRate = this.feedRate;
        let killRate = this.killRate;
        
        if (this.audioEnabled && audioLevel > 0) {
            // Modulate parameters based on audio level
            feedRate *= (1 + audioLevel * 0.5);
            killRate *= (1 + audioLevel * 0.3);
        }
        
        // Compute the reaction-diffusion for each cell
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const i = y * this.cols + x;
                
                // Get current values
                const a = this.gridA[i];
                const b = this.gridB[i];
                
                // Compute Laplacian using a 9-point stencil
                const xl = (x - 1 + this.cols) % this.cols;
                const xr = (x + 1) % this.cols;
                const yu = (y - 1 + this.rows) % this.rows;
                const yd = (y + 1) % this.rows;
                
                const laplacianA = this.gridA[yu * this.cols + xl] + 
                                  this.gridA[yu * this.cols + x] + 
                                  this.gridA[yu * this.cols + xr] + 
                                  this.gridA[y * this.cols + xl] + 
                                  this.gridA[y * this.cols + xr] + 
                                  this.gridA[yd * this.cols + xl] + 
                                  this.gridA[yd * this.cols + x] + 
                                  this.gridA[yd * this.cols + xr] - 
                                  8 * a;
                
                const laplacianB = this.gridB[yu * this.cols + xl] + 
                                  this.gridB[yu * this.cols + x] + 
                                  this.gridB[yu * this.cols + xr] + 
                                  this.gridB[y * this.cols + xl] + 
                                  this.gridB[y * this.cols + xr] + 
                                  this.gridB[yd * this.cols + xl] + 
                                  this.gridB[yd * this.cols + x] + 
                                  this.gridB[yd * this.cols + xr] - 
                                  8 * b;
                
                // Compute the reaction-diffusion update
                const abb = a * b * b;
                nextA[i] = a + (dA * laplacianA - abb + feedRate * (1 - a)) * this.timeStep;
                nextB[i] = b + (dB * laplacianB + abb - (killRate + feedRate) * b) * this.timeStep;
                
                // Clamp the values to prevent instability
                nextA[i] = clamp(nextA[i], 0, 1);
                nextB[i] = clamp(nextB[i], 0, 1);
            }
        }
        
        // Update the grids
        this.gridA = nextA;
        this.gridB = nextB;
    }
    
    /**
     * Render the reaction-diffusion grid to the canvas
     */
    render() {
        // Create image data for the canvas
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;
        
        // Get audio level for visualization effects
        const audioLevel = this.getAudioLevel();
        
        // Iterate through each grid cell
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const idx = y * this.cols + x;
                let value = 0;
                
                // Determine the value based on the visualization mode
                switch (this.visualizationMode) {
                    case 'chemical-b':
                        value = this.gridB[idx];
                        break;
                    case 'gradient':
                        value = this.gridA[idx] - this.gridB[idx] + 0.5;
                        break;
                    case 'heatmap':
                        value = this.gridB[idx];
                        break;
                    case 'contour':
                        value = this.gridB[idx];
                        break;
                    default:
                        value = this.gridB[idx];
                }
                
                // Add audio reactivity if enabled
                if (this.audioEnabled && audioLevel > 0) {
                    value = value * (1 + audioLevel * 0.3);
                }
                
                // Clamp the value
                value = clamp(value, 0, 1);
                
                // Get color based on the visualization mode
                let color;
                if (this.visualizationMode === 'heatmap') {
                    color = this.getHeatmapColor(value);
                } else if (this.visualizationMode === 'contour') {
                    color = this.getContourColor(value);
                } else {
                    color = this.getColorFromPalette(value);
                }
                
                // Set each pixel (2x2) in the image data
                for (let dy = 0; dy < 2; dy++) {
                    for (let dx = 0; dx < 2; dx++) {
                        const pixelX = x * 2 + dx;
                        const pixelY = y * 2 + dy;
                        const pixelIdx = (pixelY * this.width + pixelX) * 4;
                        
                        data[pixelIdx] = color.r;
                        data[pixelIdx + 1] = color.g;
                        data[pixelIdx + 2] = color.b;
                        data[pixelIdx + 3] = 255;
                    }
                }
            }
        }
        
        // Render the image data to the canvas
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Update the color map based on the current color palette
     */
    updateColorMap() {
        if (colorPalettes[this.colorPalette]) {
            this.colorMap = createColorMap(colorPalettes[this.colorPalette], 256);
        }
    }
    
    /**
     * Get a color from the palette based on a value
     * @param {number} value - Normalized value (0-1)
     * @returns {Object} - RGB color object
     */
    getColorFromPalette(value) {
        // If the color palette changed, update the color map
        if (this.colorMap.length === 0) {
            this.updateColorMap();
        }
        
        // Get color from the color map
        return getColorAt(this.colorMap, value);
    }
    
    /**
     * Get a heatmap color for a value
     * @param {number} value - Normalized value (0-1)
     * @returns {Object} - RGB color object
     */
    getHeatmapColor(value) {
        // Heatmap gradient from black to red to yellow to white
        if (value < 0.33) {
            return { r: Math.floor(value * 3 * 255), g: 0, b: 0 };
        } else if (value < 0.66) {
            return { r: 255, g: Math.floor((value - 0.33) * 3 * 255), b: 0 };
        } else {
            return { r: 255, g: 255, b: Math.floor((value - 0.66) * 3 * 255) };
        }
    }
    
    /**
     * Get a contour color for a value
     * @param {number} value - Normalized value (0-1)
     * @returns {Object} - RGB color object
     */
    getContourColor(value) {
        // Create sharp contour lines
        const contourValue = Math.floor(value * 10) / 10;
        const isContour = Math.abs(value - contourValue) < 0.02;
        
        if (isContour) {
            return { r: 255, g: 255, b: 255 };
        } else {
            return this.getColorFromPalette(value);
        }
    }
    
    /**
     * Get the current audio level
     * @returns {number} - Audio level (0-1)
     */
    getAudioLevel() {
        if (!this.audioData || !this.audioEnabled) {
            return 0;
        }
        
        // Compute average audio level
        let sum = 0;
        for (let i = 0; i < this.audioData.length; i++) {
            sum += this.audioData[i];
        }
        
        const avg = sum / this.audioData.length / 255;
        return avg;
    }
    
    /**
     * Resize the reaction-diffusion grid
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        
        // Compute new grid dimensions
        const newCols = Math.floor(width / 2);
        const newRows = Math.floor(height / 2);
        
        // If dimensions changed, reinitialize
        if (newCols !== this.cols || newRows !== this.rows) {
            this.cols = newCols;
            this.rows = newRows;
            this.init();
        }
    }
    
    /**
     * Reset the reaction-diffusion system
     */
    reset() {
        this.init();
    }
}
