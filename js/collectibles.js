/**
 * CollectibleManager - Manages all gold coin items and pickup logic
 */
class CollectibleManager {
  constructor() {
    this.coins = [];
    this.animTimer = 0;
    this.animFrame = 0;
  }

  clear() {
    this.coins = [];
  }

  addCoin(x, y) {
    this.coins.push({
      x,
      y,
      baseY: y,
      width: 18,
      height: 18,
      collected: false,
      value: 10
    });
  }

  // Create smooth jumping arc of coins
  addCoinArc(startX, startY, count = 5, arcHeight = 55, spacing = 35) {
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const arcOffset = Math.sin(t * Math.PI) * arcHeight;
      this.addCoin(startX + i * spacing, startY - arcOffset);
    }
  }

  // Create horizontal row of coins
  addCoinRow(startX, y, count = 4, spacing = 32) {
    for (let i = 0; i < count; i++) {
      this.addCoin(startX + i * spacing, y);
    }
  }

  update(dt, player, particleSystem) {
    // Update coin animation frame
    this.animTimer += dt;
    if (this.animTimer >= 0.1) {
      this.animTimer = 0;
      this.animFrame++;
    }

    const pHitbox = player.getHitbox();
    let collectedCount = 0;

    for (let i = 0; i < this.coins.length; i++) {
      const c = this.coins[i];
      if (c.collected) continue;

      // Gentle floating bob
      c.y = c.baseY + Math.sin(Date.now() * 0.005 + c.x * 0.05) * 3;

      // AABB collision check
      const isOverlapping = (
        pHitbox.x < c.x + c.width &&
        pHitbox.x + pHitbox.width > c.x &&
        pHitbox.y < c.y + c.height &&
        pHitbox.y + pHitbox.height > c.y
      );

      if (isOverlapping) {
        c.collected = true;
        collectedCount++;
        window.audio.playCoin();
        if (particleSystem) {
          particleSystem.emitCoinSparkles(c.x + c.width / 2, c.y + c.height / 2);
        }
      }
    }

    return collectedCount;
  }

  render(ctx, camera) {
    const coinFrames = window.sprites.cache.coin;
    if (!coinFrames || coinFrames.length === 0) return;

    const frameIdx = this.animFrame % coinFrames.length;
    const currentSprite = coinFrames[frameIdx];

    for (let i = 0; i < this.coins.length; i++) {
      const c = this.coins[i];
      if (c.collected) continue;

      // World-space culling
      if (c.x < camera.x - 50 || c.x > camera.x + camera.viewportWidth + 50) {
        continue;
      }

      ctx.drawImage(currentSprite, Math.floor(c.x), Math.floor(c.y));
    }
  }
}
