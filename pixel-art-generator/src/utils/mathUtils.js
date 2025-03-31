/**
 * Math Utilities for the Reaction-Diffusion System
 * Provides various mathematical functions and utilities
 */

import { createNoise2D } from 'simplex-noise';

// Initialize noise generator
let noise2D = createNoise2D();

/**
 * Reset the noise generator with a random seed
 */
export function resetNoise() {
    noise2D = createNoise2D();
}

/**
 * Generate 2D noise at a given position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {number} - Noise value between -1 and 1
 */
export function noise(x, y) {
    return noise2D(x, y);
}

/**
 * Map a value from one range to another
 * @param {number} value - Value to map
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} - Mapped value
 */
export function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Clamp a value between a minimum and maximum
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} - Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} - Angle in radians
 */
export function radians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} - Angle in degrees
 */
export function degrees(radians) {
    return radians * 180 / Math.PI;
}

/**
 * Generate a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random number
 */
export function random(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
export function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate the distance between two points
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} - Distance
 */
export function dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 2D Vector class for various vector operations
 */
export class Vector2 {
    /**
     * Create a new Vector2 instance
     * @param {number} x - X component
     * @param {number} y - Y component
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Add another vector to this one
     * @param {Vector2} v - Vector to add
     * @returns {Vector2} - This vector after addition
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    
    /**
     * Subtract another vector from this one
     * @param {Vector2} v - Vector to subtract
     * @returns {Vector2} - This vector after subtraction
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    
    /**
     * Multiply this vector by a scalar
     * @param {number} n - Scalar value
     * @returns {Vector2} - This vector after multiplication
     */
    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }
    
    /**
     * Calculate the magnitude (length) of this vector
     * @returns {number} - Magnitude
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    /**
     * Normalize this vector (set its magnitude to 1)
     * @returns {Vector2} - This vector after normalization
     */
    normalize() {
        const m = this.mag();
        if (m > 0) {
            this.x /= m;
            this.y /= m;
        }
        return this;
    }
    
    /**
     * Calculate the dot product with another vector
     * @param {Vector2} v - Other vector
     * @returns {number} - Dot product
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    
    /**
     * Calculate the angle of this vector in radians
     * @returns {number} - Angle in radians
     */
    angle() {
        return Math.atan2(this.y, this.x);
    }
    
    /**
     * Rotate this vector by an angle in radians
     * @param {number} angle - Angle in radians
     * @returns {Vector2} - This vector after rotation
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
        return this;
    }
    
    /**
     * Create a copy of this vector
     * @returns {Vector2} - New vector with the same components
     */
    copy() {
        return new Vector2(this.x, this.y);
    }
    
    /**
     * Create a new vector as the sum of two vectors
     * @param {Vector2} v1 - First vector
     * @param {Vector2} v2 - Second vector
     * @returns {Vector2} - New vector representing the sum
     */
    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }
    
    /**
     * Create a new vector as the difference of two vectors
     * @param {Vector2} v1 - First vector
     * @param {Vector2} v2 - Second vector
     * @returns {Vector2} - New vector representing the difference
     */
    static sub(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }
}

// Add to your script
// Basic canvas test
const canvas = document.getElementById('reactionCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Draw a test pattern
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#00A896');
    gradient.addColorStop(1, '#02C39A');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#F0F3BD';
    ctx.font = '20px VT323';
    ctx.fillText('Canvas initialized', 20, 30);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Add to your inline script in index.html
// Update slider displays
document.getElementById('complexity').addEventListener('input', function() {
    document.getElementById('complexityValue').textContent = this.value;
});

document.getElementById('feedRate').addEventListener('input', function() {
    document.getElementById('feedRateValue').textContent = parseFloat(this.value).toFixed(4);
});

document.getElementById('killRate').addEventListener('input', function() {
    document.getElementById('killRateValue').textContent = parseFloat(this.value).toFixed(4);
});

document.getElementById('timeStep').addEventListener('input', function() {
    document.getElementById('timeStepValue').textContent = parseFloat(this.value).toFixed(1);
}); 
