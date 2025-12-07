import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';

export default class InputBox extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.scene = scene;
        this.currentValue = '';
        this.maxLength = 20;
        this.history = []; // Stores previous submissions
        this.historyIndex = -1; // Current position in history (-1 means no history selected)
        this.maxHistorySize = 10; // Max number of entries to keep in history

        // Add to scene
        scene.add.existing(this);

        // Create background
        this.background = scene.add.rectangle(0, 0, 200, 40, 0x222233, 1);
        this.background.setStrokeStyle(2, 0x4466aa);
        this.add(this.background);

        // Create text display
        this.textDisplay = scene.add.text(-90, 0, '', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        this.add(this.textDisplay);

        // Create cursor
        this.cursor = scene.add.rectangle(-90, 0, 2, 24, 0xffffff);
        this.add(this.cursor);

        // Blink cursor
        scene.time.addEvent({
            delay: 500,
            callback: () => {
                this.cursor.visible = !this.cursor.visible;
            },
            loop: true
        });

        // Create submit hint
        this.hint = scene.add.text(0, 32, 'Type answer & press Enter', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#888899'
        }).setOrigin(0.5);
        this.add(this.hint);

        // Create transparent HTML input overlay for mobile keyboard support
        this.createHtmlInput();

        // Set up keyboard input (for desktop, works alongside HTML input)
        this.setupKeyboardInput();
    }

    createHtmlInput() {
        this.htmlInput = document.createElement('input');
        this.htmlInput.type = 'text';
        this.htmlInput.inputMode = 'text';  // Show text keyboard
        this.htmlInput.autocomplete = 'off';
        this.htmlInput.autocorrect = 'off';
        this.htmlInput.autocapitalize = 'off';
        this.htmlInput.spellcheck = false;
        this.htmlInput.maxLength = this.maxLength;

        // Initially hidden but interactive
        Object.assign(this.htmlInput.style, {
            position: 'absolute',
            fontSize: '16px',        // >= 16px to prevent iOS zoom
            color: 'transparent',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            caretColor: 'transparent',  // Hide the caret too
            zIndex: '1000',
            opacity: '0',  // Completely invisible
            pointerEvents: 'auto', // Allow clicking to focus
        });

        document.body.appendChild(this.htmlInput);

        // Sync HTML input value changes to Phaser display
        this.htmlInput.addEventListener('input', () => {
            // Filter to only allow valid characters (letters, accents, spaces)
            let value = this.htmlInput.value;

            // Allow letters, accents, spaces
            // Spanish accents: áéíóúñüÁÉÍÓÚÑÜ
            value = value.replace(/[^a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s]/g, '');

            // Enforce max length
            if (value.length > this.maxLength) {
                value = value.slice(0, this.maxLength);
            }

            this.htmlInput.value = value;
            this.currentValue = value;
            this.updateDisplay();
        });

        // Handle enter key submission
        this.htmlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.submit();
            }
        });

        // Disable Phaser keyboard when HTML input is focused (prevents double input)
        this.htmlInput.addEventListener('focus', () => {
            this.htmlInputFocused = true;
            this.scene.input.keyboard.enabled = false;
        });

        // Re-enable Phaser keyboard when HTML input loses focus
        this.htmlInput.addEventListener('blur', () => {
            this.htmlInputFocused = false;
            this.scene.input.keyboard.enabled = true;
        });

        // Position the input over the visual input box
        this.updateInputPosition();
        this.scene.scale.on('resize', this.updateInputPosition, this);

        // Also update on window resize (for when browser is resized)
        this.resizeHandler = this.updateInputPosition.bind(this);
        window.addEventListener('resize', this.resizeHandler);
    }

    // New methods to control HTML input visibility and focus
    enableInput() {
        this.htmlInput.style.opacity = '1';
        this.htmlInput.style.pointerEvents = 'auto';
        this.htmlInput.focus();
        this.scene.input.keyboard.enabled = false; // Disable Phaser keyboard when HTML input is active
        this.updateInputPosition(); // Ensure correct positioning when enabled
    }

    disableInput() {
        this.htmlInput.style.opacity = '0';
        this.htmlInput.style.pointerEvents = 'none';
        this.htmlInput.blur();
        this.scene.input.keyboard.enabled = true; // Re-enable Phaser keyboard
    }

    updateInputPosition() {
        if (!this.htmlInput || !this.scene || !this.scene.game) return;

        const canvas = this.scene.game.canvas;
        if (!canvas) return;

        // Get the position and size of the Phaser InputBox in screen coordinates
        const bounds = this.getBounds(); // Get bounds of the Phaser.GameObjects.Container
        const scaleManager = this.scene.scale;

        // Convert Phaser world coordinates to screen coordinates
        const screenX = scaleManager.canvasBounds.left + (bounds.x * scaleManager.displayScale.x);
        const screenY = scaleManager.canvasBounds.top + (bounds.y * scaleManager.displayScale.y);
        const screenWidth = bounds.width * scaleManager.displayScale.x;
        const screenHeight = bounds.height * scaleManager.displayScale.y;

        // Position the HTML input directly over the Phaser input box
        Object.assign(this.htmlInput.style, {
            left: `${screenX}px`,
            top: `${screenY}px`,
            width: `${screenWidth}px`,
            height: `${screenHeight}px`,
        });
    }

    setupKeyboardInput() {
        // Desktop keyboard input still works via Phaser for backwards compatibility
        // This will only fire if Phaser keyboard is enabled (i.e., HTML input is not focused)
        this.scene.input.keyboard.on('keydown', (event) => {
            // Prevent event from bubbling to prevent page scrolling etc
            // This check is now redundant as Phaser keyboard is disabled when HTML input is focused
            // if (!this.htmlInputFocused) {
            //     // event.stopPropagation();
            // }

            // Handle backspace
            if (event.keyCode === 8) {
                this.currentValue = this.currentValue.slice(0, -1);
                this.syncToHtmlInput();
                this.updateDisplay();
                return;
            }

            // Handle enter/return
            if (event.keyCode === 13) {
                event.preventDefault(); // Prevent default browser behavior (e.g., form submission)
                this.submit();
                return;
            }

            // Handle ArrowUp for history
            if (event.keyCode === 38) { // ArrowUp
                event.preventDefault(); // Prevent default browser behavior (e.g., scrolling)
                if (this.history.length > 0) {
                    this.historyIndex = Math.max(0, this.historyIndex - 1);
                    this.currentValue = this.history[this.historyIndex];
                    this.syncToHtmlInput();
                    this.updateDisplay();
                }
                return;
            }

            // Handle ArrowDown for history (optional, but good for consistency)
            if (event.keyCode === 40) { // ArrowDown
                event.preventDefault(); // Prevent default browser behavior (e.g., scrolling)
                if (this.history.length > 0) {
                    this.historyIndex = Math.min(this.history.length - 1, this.historyIndex + 1);
                    this.currentValue = this.history[this.historyIndex];
                    this.syncToHtmlInput();
                    this.updateDisplay();
                }
                return;
            }

            // Handle letters and accents
            // We'll use event.key which gives the actual character
            if (event.key && event.key.length === 1) {
                // Check if it's a valid character (letter, accent, space)
                if (/[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s]/.test(event.key)) {
                    if (this.currentValue.length < this.maxLength) {
                        this.currentValue += event.key;
                        this.syncToHtmlInput();
                        this.updateDisplay();
                    }
                }
            }
        });
    }

    syncToHtmlInput() {
        // Keep HTML input in sync with Phaser state (for when user switches between desktop/mobile)
        if (this.htmlInput) {
            this.htmlInput.value = this.currentValue;
        }
    }

    updateDisplay() {
        this.textDisplay.setText(this.currentValue);
        // Move cursor to end of text
        this.cursor.x = -90 + this.textDisplay.width + 2;
    }

    submit() {
        if (this.currentValue.length > 0) {
            // Add to history
            if (this.history.length === this.maxHistorySize) {
                this.history.shift(); // Remove oldest entry if at max size
            }
            this.history.push(this.currentValue);
            this.historyIndex = -1; // Reset history index after new submission

            // Emit event with the value
            this.scene.events.emit('answerSubmitted', this.currentValue);
            this.currentValue = '';
            this.syncToHtmlInput();
            this.updateDisplay();
        }
    }

    flash(isCorrect) {
        const color = isCorrect ? 0x44aa44 : 0xaa4444;
        this.background.setStrokeStyle(3, color);

        this.scene.time.delayedCall(300, () => {
            this.background.setStrokeStyle(2, 0x4466aa);
        });
    }

    /**
     * Show feedback overlay with correct answer
     * @param {string} correctForm - Correct answer with accents
     * @param {boolean} wasCorrect - Whether the user's answer was correct (affects color)
     */
    showFeedback(correctForm, wasCorrect = true) {
        // Create feedback text if it doesn't exist
        if (!this.feedbackText) {
            this.feedbackText = this.scene.add.text(0, -30, '', {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffdd44',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            this.add(this.feedbackText);
        }

        // Set color based on correctness: green for correct, red for incorrect
        const feedbackColor = wasCorrect ? '#44ff44' : '#ff6666';
        this.feedbackText.setColor(feedbackColor);

        // Show correct form
        this.feedbackText.setText(correctForm);
        this.feedbackText.setAlpha(1);
        this.feedbackText.setScale(1);

        // Fade out after displaying for 2 seconds (more time to read)
        this.scene.tweens.add({
            targets: this.feedbackText,
            alpha: 0,
            duration: 500,
            delay: 2000,
            ease: 'Power2'
        });
    }

    getValue() {
        return this.currentValue;
    }

    clear() {
        this.currentValue = '';
        this.syncToHtmlInput();
        this.updateDisplay();
    }

    destroy() {
        // Clean up event listeners
        this.scene.scale.off('resize', this.updateInputPosition, this);
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }

        // Remove HTML input from DOM
        if (this.htmlInput && this.htmlInput.parentNode) {
            this.htmlInput.remove();
        }

        super.destroy();
    }
}
