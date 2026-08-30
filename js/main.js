/**
 * Main - Bootstrap and Entrypoint for Mallu Run: Escape the Monsoon
 */
window.addEventListener('DOMContentLoaded', () => {
  console.log('🥥 Initializing Mallu Run: Escape the Monsoon...');

  // Setup initial menu state with a sample background scene
  window.game.levelManager.loadLevel(
    1,
    window.game.obstacles,
    window.game.collectibles,
    window.game.weather
  );
  window.game.weather.setStage(1); // Light rain for animated menu background

  // Start the main game loop
  requestAnimationFrame((t) => window.game.loop(t));

  console.log('🥥 Mallu Run Ready!');
});
