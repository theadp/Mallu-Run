/**
 * Camera - Smooth Side-Scrolling 2D Camera with Screen Shake
 */
class Camera {
  constructor(viewportWidth = 640, viewportHeight = 360) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;

    // Screen Shake
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    // Follow offset: player sits at 140px from left edge
    this.followOffsetX = 140;
  }

  follow(target, dt, maxWorldWidth = 2400) {
    if (!target) return;

    // Player stays around 140px from the left edge of the screen
    this.targetX = target.x - this.followOffsetX;
    this.targetY = 0;

    // Clamp camera bounds
    if (this.targetX < 0) this.targetX = 0;
    const maxCamX = Math.max(0, maxWorldWidth - this.viewportWidth + 80);
    if (this.targetX > maxCamX) this.targetX = maxCamX;

    // Smooth lerp follow
    const lerpRate = Math.min(1, dt * 12);
    this.x += (this.targetX - this.x) * lerpRate;
    this.y = 0;

    // Update Screen Shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const factor = Math.max(0, this.shakeDuration);
      this.shakeOffsetX = (Math.random() * 2 - 1) * this.shakeIntensity * factor;
      this.shakeOffsetY = (Math.random() * 2 - 1) * this.shakeIntensity * factor;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  shake(duration = 0.25, intensity = 5) {
    this.shakeDuration = duration;
    this.shakeIntensity = intensity;
  }

  applyTransform(ctx) {
    ctx.save();
    ctx.translate(
      Math.floor(-this.x + this.shakeOffsetX),
      Math.floor(-this.y + this.shakeOffsetY)
    );
  }

  restoreTransform(ctx) {
    ctx.restore();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }
}
