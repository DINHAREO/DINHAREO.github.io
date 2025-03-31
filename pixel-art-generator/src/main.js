/**
 * Reaction-Diffusion System - Main Application
 * Controls the canvas, UI interactions, and the reaction-diffusion simulation
 */

import { ReactionDiffusion } from './algorithms/reactionDiffusion.js';
import { colorPalettes } from './utils/colorPalettes.js';

// Application state
let canvas;
let ctx;
let reactionDiffusion;
let animationId;
let lastUpdateTime = 0;
let isRunning = true;
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;
let updateInterval = 16; // Target ~60 FPS
let canvasWidth = 0;
let canvasHeight = 0;

// Audio reactivity
let audioContext;
let audioAnalyser;
let audioData;
let audioEnabled = false;

// Get DOM elements
const patternSelect = document.getElementById('patternType');
const visualizationSelect = document.getElementById('visualizationMode');
const colorPaletteSelect = document.getElementById('colorPalette');
const complexitySlider = document.getElementById('complexity');
const complexityValue = document.getElementById('complexityValue');
const feedRateSlider = document.getElementById('feedRate');
const feedRateValue = document.getElementById('feedRateValue');
const killRateSlider = document.getElementById('killRate');
const killRateValue = document.getElementById('killRateValue');
const timeStepSlider = document.getElementById('timeStep');
const timeStepValue = document.getElementById('timeStepValue');
const horizontalSymmetryCheckbox = document.getElementById('horizontalSymmetry');
const verticalSymmetryCheckbox = document.getElementById('verticalSymmetry');
const radialSymmetryCheckbox = document.getElementById('radialSymmetry');
const resetButton = document.getElementById('resetButton');
const downloadButton = document.getElementById('downloadButton');
const audioButton = document.getElementById('audioButton');
const randomizeButton = document.getElementById('randomizeButton');

// Initialize the application
function init() {
    setupCanvas();
    setupEventListeners();
    createReactionDiffusion();
    
    // Start animation loop
    lastUpdateTime = performance.now();
    animate();
}

// Set up the canvas
function setupCanvas() {
    canvas = document.getElementById('reactionCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    resizeCanvas();
}

// Create the reaction-diffusion system
function createReactionDiffusion() {
    const complexity = parseInt(complexitySlider.value) || 5;
    const patternType = patternSelect.value;
    const feedRate = parseFloat(feedRateSlider.value) || 0.0367;
    const killRate = parseFloat(killRateSlider.value) || 0.0649;
    const visMode = visualizationSelect.value;
    const timeStep = parseFloat(timeStepSlider.value) || 1.0;
    const horizontalSymmetry = horizontalSymmetryCheckbox.checked;
    const verticalSymmetry = verticalSymmetryCheckbox.checked;
    const radialSymmetry = radialSymmetryCheckbox.checked;
    
    // Get selected color palette
    const colorPalette = colorPaletteSelect.value;
    
    // Create the reaction-diffusion system with parameters
    reactionDiffusion = new ReactionDiffusion(canvas, ctx, {
        complexity,
        patternType,
        colorPalette: colorPalette,
        feedRate,
        killRate,
        timeStep,
        visualizationMode: visMode,
        horizontalSymmetry,
        verticalSymmetry,
        radialSymmetry
    });
    
    // Initialize the system
    reactionDiffusion.init();
}

// Animation loop
function animate(timestamp = 0) {
    const deltaTime = timestamp - lastUpdateTime;
    
    if (deltaTime >= updateInterval) {
        if (isRunning) {
            // Update audio data if enabled
            if (audioEnabled && audioAnalyser) {
                updateAudioData();
            }
            
            // Update reaction-diffusion system
            reactionDiffusion.update({
                deltaTime,
                mouseX,
                mouseY,
                isMouseDown,
                audioData: audioEnabled ? audioData : null
            });
            
            // Render to canvas
            reactionDiffusion.render();
            
            lastUpdateTime = timestamp;
        }
    }
    
    animationId = requestAnimationFrame(animate);
}

// Set up event listeners
function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', debounce(() => {
        resizeCanvas();
        if (reactionDiffusion) {
            reactionDiffusion.resize(canvas.width, canvas.height);
        }
    }, 250));
    
    // Mouse events
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
        mouseY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
    });
    
    canvas.addEventListener('mousedown', () => {
        isMouseDown = true;
    });
    
    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
    });
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isMouseDown = true;
        updateTouchPosition(e);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        updateTouchPosition(e);
    });
    
    canvas.addEventListener('touchend', () => {
        isMouseDown = false;
    });
    
    // Button listeners
    resetButton.addEventListener('click', resetSimulation);
    downloadButton.addEventListener('click', downloadCanvas);
    randomizeButton.addEventListener('click', randomizeSettings);
    
    // Control change listeners
    patternSelect.addEventListener('change', updateSettings);
    visualizationSelect.addEventListener('change', updateSettings);
    colorPaletteSelect.addEventListener('change', updateSettings);
    
    complexitySlider.addEventListener('input', () => {
        complexityValue.textContent = complexitySlider.value;
        updateSettings();
    });
    
    feedRateSlider.addEventListener('input', () => {
        feedRateValue.textContent = parseFloat(feedRateSlider.value).toFixed(4);
        updateSettings();
    });
    
    killRateSlider.addEventListener('input', () => {
        killRateValue.textContent = parseFloat(killRateSlider.value).toFixed(4);
        updateSettings();
    });
    
    timeStepSlider.addEventListener('input', () => {
        timeStepValue.textContent = parseFloat(timeStepSlider.value).toFixed(1);
        updateSettings();
    });
    
    horizontalSymmetryCheckbox.addEventListener('change', updateSettings);
    verticalSymmetryCheckbox.addEventListener('change', updateSettings);
    radialSymmetryCheckbox.addEventListener('change', updateSettings);
    
    // Audio button
    audioButton.addEventListener('click', toggleAudio);
}

// Update settings when controls change
function updateSettings() {
    if (!reactionDiffusion) return;
    
    const complexity = parseInt(complexitySlider.value) || 5;
    const patternType = patternSelect.value;
    const feedRate = parseFloat(feedRateSlider.value) || 0.0367;
    const killRate = parseFloat(killRateSlider.value) || 0.0649;
    const visMode = visualizationSelect.value;
    const timeStep = parseFloat(timeStepSlider.value) || 1.0;
    const horizontalSymmetry = horizontalSymmetryCheckbox.checked;
    const verticalSymmetry = verticalSymmetryCheckbox.checked;
    const radialSymmetry = radialSymmetryCheckbox.checked;
    
    // Get selected color palette
    const colorPalette = colorPaletteSelect.value;
    
    // Update reaction-diffusion settings
    reactionDiffusion.complexity = complexity;
    reactionDiffusion.patternType = patternType;
    reactionDiffusion.colorPalette = colorPalette;
    reactionDiffusion.feedRate = feedRate;
    reactionDiffusion.killRate = killRate;
    reactionDiffusion.timeStep = timeStep;
    reactionDiffusion.visualizationMode = visMode;
    reactionDiffusion.horizontalSymmetry = horizontalSymmetry;
    reactionDiffusion.verticalSymmetry = verticalSymmetry;
    reactionDiffusion.radialSymmetry = radialSymmetry;
    
    // Reinitialize if the pattern type changed
    if (reactionDiffusion.currentPattern !== patternType) {
        resetSimulation();
    }
}

// Reset the simulation
function resetSimulation() {
    if (reactionDiffusion) {
        createReactionDiffusion();
    }
}

// Download the canvas as an image
function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'reaction-diffusion-artwork.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Randomize all settings
function randomizeSettings() {
    // Randomize pattern type
    const patternOptions = patternSelect.options;
    patternSelect.selectedIndex = Math.floor(Math.random() * patternOptions.length);
    
    // Randomize visualization mode
    const visOptions = visualizationSelect.options;
    visualizationSelect.selectedIndex = Math.floor(Math.random() * visOptions.length);
    
    // Randomize color palette
    const paletteOptions = colorPaletteSelect.options;
    colorPaletteSelect.selectedIndex = Math.floor(Math.random() * paletteOptions.length);
    
    // Randomize sliders
    complexitySlider.value = Math.floor(Math.random() * 10) + 1;
    complexityValue.textContent = complexitySlider.value;
    
    feedRateSlider.value = (Math.random() * 0.09 + 0.01).toFixed(3);
    feedRateValue.textContent = parseFloat(feedRateSlider.value).toFixed(4);
    
    killRateSlider.value = (Math.random() * 0.09 + 0.01).toFixed(3);
    killRateValue.textContent = parseFloat(killRateSlider.value).toFixed(4);
    
    timeStepSlider.value = (Math.random() * 1.9 + 0.1).toFixed(1);
    timeStepValue.textContent = parseFloat(timeStepSlider.value).toFixed(1);
    
    // Randomize symmetry
    horizontalSymmetryCheckbox.checked = Math.random() > 0.5;
    verticalSymmetryCheckbox.checked = Math.random() > 0.5;
    radialSymmetryCheckbox.checked = Math.random() > 0.5;
    
    // Apply changes
    updateSettings();
}

// Resize the canvas
function resizeCanvas() {
    const container = canvas.parentElement;
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

// Update touch position for mobile
function updateTouchPosition(e) {
    if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.touches[0].clientX - rect.left) / (rect.right - rect.left) * canvas.width;
        mouseY = (e.touches[0].clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
    }
}

// Toggle audio reactivity
function toggleAudio() {
    if (audioEnabled) {
        // Disable audio
        audioEnabled = false;
        audioButton.textContent = 'Enable Audio';
        if (audioContext) {
            audioContext.suspend();
        }
    } else {
        // Enable audio
        audioEnabled = true;
        audioButton.textContent = 'Disable Audio';
        
        if (!audioContext) {
            initAudio();
        } else {
            audioContext.resume();
        }
    }
}

// Initialize audio context and analyzer
async function initAudio() {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create audio context and analyzer
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        audioAnalyser = audioContext.createAnalyser();
        
        // Configure analyzer
        audioAnalyser.fftSize = 256;
        audioData = new Uint8Array(audioAnalyser.frequencyBinCount);
        
        // Connect source to analyzer
        source.connect(audioAnalyser);
        
        console.log('Audio input initialized successfully');
    } catch (error) {
        console.error('Error initializing audio input:', error);
        alert('Could not access microphone. Please check permissions and try again.');
        
        // Reset audio state
        audioEnabled = false;
        audioButton.textContent = 'Enable Audio';
    }
}

// Update audio data from analyzer
function updateAudioData() {
    if (audioAnalyser && audioData) {
        audioAnalyser.getByteFrequencyData(audioData);
    }
}

// Debounce function for window resize
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Start the application
window.addEventListener('DOMContentLoaded', init); 
