/**
 * Color utilities for the Reaction-Diffusion System
 * Provides functions for color manipulation, palette creation, and gradient generation
 */

// Predefined color palettes
export const colorPalettes = {
    ocean: ['#05668D', '#028090', '#00A896', '#02C39A', '#F0F3BD'],
    sunset: ['#FF6B6B', '#FF8E72', '#FFA69E', '#FFD93D', '#FFE66D'],
    forest: ['#2D5A27', '#3A7D44', '#4CAF50', '#81C784', '#A5D6A7'],
    desert: ['#D4A373', '#E9EDC9', '#CCD5AE', '#FAEDCD', '#FEFAE0'],
    arctic: ['#A8E6CF', '#DCEDC1', '#FFD3B6', '#FFAAA5', '#FF8B94'],
    neon: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF00FF', '#00FFFF'],
    grayscale: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF']
};

/**
 * Convert an RGB color to HSL
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {Object} - {h, s, l} values
 */
export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
    }

    return { h, s, l };
}

/**
 * Convert an HSL color to RGB
 * @param {number} h - Hue (0-1)
 * @param {number} s - Saturation (0-1)
 * @param {number} l - Lightness (0-1)
 * @returns {Object} - {r, g, b} values (0-255)
 */
export function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Parse a hex color string to RGB values
 * @param {string} hex - Hex color string (e.g., "#FF5500")
 * @returns {Object} - {r, g, b} values
 */
export function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex values
    let r, g, b;
    if (hex.length === 3) {
        r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
        g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
        b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    
    return { r, g, b };
}

/**
 * Convert RGB values to a hex color string
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} - Hex color string
 */
export function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Create a color gradient between two colors
 * @param {string} startColor - Starting hex color
 * @param {string} endColor - Ending hex color
 * @param {number} steps - Number of steps in the gradient
 * @returns {Array} - Array of RGB color objects
 */
export function createColorGradient(startColor, endColor, steps) {
    const start = hexToRgb(startColor);
    const end = hexToRgb(endColor);
    const gradient = [];
    
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        gradient.push({
            r: Math.round(start.r + (end.r - start.r) * t),
            g: Math.round(start.g + (end.g - start.g) * t),
            b: Math.round(start.b + (end.b - start.b) * t)
        });
    }
    
    return gradient;
}

/**
 * Create a color map from a palette
 * @param {Array} palette - Array of hex color strings
 * @param {number} steps - Number of steps in the color map
 * @returns {Array} - Array of RGB color objects
 */
export function createColorMap(palette, steps = 256) {
    if (!palette || !Array.isArray(palette)) {
        // Default to grayscale if palette is invalid
        palette = colorPalettes.grayscale;
    }
    
    if (palette.length === 1) {
        // Just return the single color repeated
        const color = hexToRgb(palette[0]);
        return Array(steps).fill(color);
    }
    
    const colorMap = [];
    const segments = palette.length - 1;
    const stepsPerSegment = Math.floor(steps / segments);
    
    for (let i = 0; i < segments; i++) {
        const segmentSteps = (i === segments - 1) 
            ? steps - (stepsPerSegment * i) 
            : stepsPerSegment;
        
        const gradient = createColorGradient(
            palette[i],
            palette[i + 1],
            segmentSteps
        );
        
        colorMap.push(...gradient);
    }
    
    return colorMap;
}

/**
 * Get a color from a color map based on a normalized value
 * @param {Array} colorMap - Array of RGB color objects
 * @param {number} value - Normalized value (0-1)
 * @returns {Object} - RGB color object
 */
export function getColorAt(colorMap, value) {
    if (!colorMap || colorMap.length === 0) {
        return { r: 0, g: 0, b: 0 };
    }
    
    // Clamp value between 0 and 1
    value = Math.max(0, Math.min(1, value));
    
    // Map value to index
    const index = Math.floor(value * (colorMap.length - 1));
    
    return colorMap[index];
}

/**
 * Generate a gradient between two colors
 * @param {string} startColor - Starting hex color
 * @param {string} endColor - Ending hex color
 * @param {number} steps - Number of steps in the gradient
 * @returns {Array} - Array of hex color strings
 */
export function generateGradient(startColor, endColor, steps) {
    const gradient = createColorGradient(startColor, endColor, steps);
    return gradient.map(color => rgbToHex(color.r, color.g, color.b));
}

/**
 * Generate a complementary color palette
 * @param {string} baseColor - Base hex color
 * @returns {Array} - Array of hex color strings
 */
export function generateComplementaryPalette(baseColor) {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Generate complementary color
    const complementaryHue = (hsl.h + 0.5) % 1;
    const complementaryRgb = hslToRgb(complementaryHue, hsl.s, hsl.l);
    const complementaryColor = rgbToHex(
        complementaryRgb.r, 
        complementaryRgb.g, 
        complementaryRgb.b
    );
    
    // Generate variations
    const variations = [
        baseColor,
        rgbToHex(
            Math.round(rgb.r * 0.8),
            Math.round(rgb.g * 0.8),
            Math.round(rgb.b * 0.8)
        ),
        rgbToHex(
            Math.round(rgb.r * 0.6),
            Math.round(rgb.g * 0.6),
            Math.round(rgb.b * 0.6)
        ),
        complementaryColor,
        rgbToHex(
            Math.round(complementaryRgb.r * 0.8),
            Math.round(complementaryRgb.g * 0.8),
            Math.round(complementaryRgb.b * 0.8)
        )
    ];
    
    return variations;
}

/**
 * Generate a triadic color palette
 * @param {string} baseColor - Base hex color
 * @returns {Array} - Array of hex color strings
 */
export function generateTriadicPalette(baseColor) {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Generate triadic colors
    const triadic1Hue = (hsl.h + 1/3) % 1;
    const triadic2Hue = (hsl.h + 2/3) % 1;
    
    const triadic1Rgb = hslToRgb(triadic1Hue, hsl.s, hsl.l);
    const triadic2Rgb = hslToRgb(triadic2Hue, hsl.s, hsl.l);
    
    return [
        baseColor,
        rgbToHex(triadic1Rgb.r, triadic1Rgb.g, triadic1Rgb.b),
        rgbToHex(triadic2Rgb.r, triadic2Rgb.g, triadic2Rgb.b),
        rgbToHex(
            Math.round(rgb.r * 0.7),
            Math.round(rgb.g * 0.7),
            Math.round(rgb.b * 0.7)
        ),
        rgbToHex(
            Math.round(triadic1Rgb.r * 0.7),
            Math.round(triadic1Rgb.g * 0.7),
            Math.round(triadic1Rgb.b * 0.7)
        )
    ];
}

/**
 * Get a random color from a specified palette or generate a random color
 * @param {string|Array} palette - Palette name or array of colors
 * @returns {string} - Hex color string
 */
export function getRandomColor(palette) {
    if (!palette) {
        // Generate a completely random color
        return rgbToHex(
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256)
        );
    }
    
    // Use a predefined palette if string is provided
    const colors = typeof palette === 'string' ? colorPalettes[palette] : palette;
    
    if (!colors || colors.length === 0) {
        return getRandomColor(); // Fall back to random if palette not found
    }
    
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Create a multi-point color gradient
 * @param {Array} colors - Array of hex color strings
 * @param {number} steps - Total number of steps in the gradient
 * @returns {Array} - Array of hex color strings
 */
export function createMultiColorGradient(colors, steps) {
    if (colors.length < 2) {
        throw new Error('At least 2 colors are required for a gradient');
    }
    
    const segments = colors.length - 1;
    const stepsPerSegment = Math.floor(steps / segments);
    const gradient = [];
    
    for (let i = 0; i < segments; i++) {
        const segmentSteps = (i === segments - 1) 
            ? steps - (stepsPerSegment * i) 
            : stepsPerSegment;
        
        const segmentGradient = generateGradient(
            colors[i],
            colors[i + 1],
            segmentSteps
        );
        
        gradient.push(...segmentGradient);
    }
    
    return gradient;
}

/**
 * Adjust color brightness
 * @param {string} hexColor - Hex color string
 * @param {number} factor - Adjustment factor (-1 to 1)
 * @returns {string} - Adjusted hex color
 */
export function adjustBrightness(hexColor, factor) {
    const rgb = hexToRgb(hexColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Adjust lightness
    hsl.l = Math.max(0, Math.min(1, hsl.l + factor));
    
    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Blend two colors together
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @param {number} ratio - Blend ratio (0-1, 0 = only color1, 1 = only color2)
 * @returns {string} - Blended hex color
 */
export function blendColors(color1, color2, ratio = 0.5) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
    const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
    const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
    
    return rgbToHex(r, g, b);
}

/**
 * Get the complementary color
 * @param {string} hexColor - Hex color string
 * @returns {string} - Complementary hex color
 */
export function getComplementaryColor(hexColor) {
    const rgb = hexToRgb(hexColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Add 180 degrees to hue
    hsl.h = (hsl.h + 0.5) % 1;
    
    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Create an array of analogous colors
 * @param {string} hexColor - Base hex color
 * @param {number} count - Number of colors to generate
 * @param {number} angle - Angle between colors (in degrees, default 30)
 * @returns {Array} - Array of hex color strings
 */
export function getAnalogousColors(hexColor, count = 3, angle = 30) {
    const rgb = hexToRgb(hexColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors = [];
    
    const angleInHue = angle / 360;
    const startHue = (hsl.h - (angleInHue * (count - 1) / 2) + 1) % 1;
    
    for (let i = 0; i < count; i++) {
        const newHue = (startHue + angleInHue * i) % 1;
        const newRgb = hslToRgb(newHue, hsl.s, hsl.l);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }
    
    return colors;
} 
