/**
 * InputManager - Unified Desktop Keyboard & Responsive Multi-Touch Virtual Controls
 */
class InputManager {
  constructor() {
    this.keysDown = {};
    this.keysJustPressed = {};
    this.touchPointers = new Map(); // pointerId -> action

    this.actions = {
      left: false,
      right: false,
      jump: false,
      slide: false,
      pause: false
    };

    this.justPressedActions = {
      left: false,
      right: false,
      jump: false,
      slide: false,
      pause: false
    };

    this.setupKeyboard();
    this.setupTouch();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Avoid interrupting typing if input field focused
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const code = e.code;
      const key = e.key.toLowerCase();

      let action = null;
      if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a') action = 'left';
      if (code === 'KeyD' || code === 'ArrowRight' || key === 'd') action = 'right';
      if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space' || key === 'w' || key === ' ') action = 'jump';
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's') action = 'slide';
      if (code === 'Escape' || code === 'KeyP' || key === 'p') action = 'pause';

      if (action) {
        // Prevent scrolling on space / arrow keys
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
          e.preventDefault();
        }

        if (!this.actions[action]) {
          this.justPressedActions[action] = true;
        }
        this.actions[action] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      let action = null;
      if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a') action = 'left';
      if (code === 'KeyD' || code === 'ArrowRight' || key === 'd') action = 'right';
      if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space' || key === 'w' || key === ' ') action = 'jump';
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's') action = 'slide';
      if (code === 'Escape' || code === 'KeyP' || key === 'p') action = 'pause';

      if (action) {
        this.actions[action] = false;
      }
    });
  }

  setupTouch() {
    const bindBtn = (elementId, action) => {
      const btn = document.getElementById(elementId);
      if (!btn) return;

      const onPointerDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.add('pressed');
        this.touchPointers.set(e.pointerId, action);
        if (!this.actions[action]) {
          this.justPressedActions[action] = true;
        }
        this.actions[action] = true;
      };

      const onPointerUp = (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.remove('pressed');
        this.touchPointers.delete(e.pointerId);

        // Check if another finger is still holding this action
        let stillHeld = false;
        for (const act of this.touchPointers.values()) {
          if (act === action) {
            stillHeld = true;
            break;
          }
        }
        if (!stillHeld) {
          this.actions[action] = false;
        }
      };

      btn.addEventListener('pointerdown', onPointerDown, { passive: false });
      btn.addEventListener('pointerup', onPointerUp, { passive: false });
      btn.addEventListener('pointercancel', onPointerUp, { passive: false });
      btn.addEventListener('pointerleave', onPointerUp, { passive: false });
    };

    bindBtn('touch-btn-left', 'left');
    bindBtn('touch-btn-right', 'right');
    bindBtn('touch-btn-jump', 'jump');
    bindBtn('touch-btn-slide', 'slide');
  }

  isDown(action) {
    return !!this.actions[action];
  }

  justPressed(action) {
    return !!this.justPressedActions[action];
  }

  // Clear single-frame triggers at the end of each game tick
  endFrame() {
    for (const key in this.justPressedActions) {
      this.justPressedActions[key] = false;
    }
  }

  reset() {
    for (const key in this.actions) {
      this.actions[key] = false;
      this.justPressedActions[key] = false;
    }
    this.touchPointers.clear();
    const btns = document.querySelectorAll('.touch-btn');
    btns.forEach(b => b.classList.remove('pressed'));
  }
}

// Global input instance
window.input = new InputManager();
