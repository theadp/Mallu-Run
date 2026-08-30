/**
 * SpriteManager - Procedural 16-Bit Pixel Art Generator for Mallu Run
 * Draws crisp retro sprites onto offscreen canvases and caches them as textures.
 */
class SpriteManager {
  constructor() {
    this.cache = {};
    this.initAllSprites();
  }

  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx: ctx };
  }

  initAllSprites() {
    this.generatePlayerSprites();
    this.generateVehicleSprites();
    this.generateEnvironmentSprites();
    this.generateObstacleSprites();
    this.generateCoinSprites();
  }

  /* -------------------------------------------------------------
     1. MODERN YOUNG KERALA GUY RUNNER SPRITES
     Casual T-Shirt, Jeans, Backpack, Sneakers, Modern Hair (NO MUNDU)
     ------------------------------------------------------------- */
  generatePlayerSprites() {
    const W = 36;
    const H = 48;

    // Helper to draw modern Kerala guy in various poses
    const drawGuy = (ctx, pose, frame) => {
      ctx.clearRect(0, 0, W, H);

      // Colors
      const cSkin = '#e0a878';
      const cSkinShadow = '#ba7f52';
      const cHair = '#1a1816';
      const cShirt = '#e67e22'; // Vibrant orange modern casual tee
      const cShirtShadow = '#d35400';
      const cJeans = '#2980b9'; // Blue denim jeans
      const cJeansDark = '#1c5980';
      const cShoe = '#ecf0f1'; // White & red sneakers
      const cShoeRed = '#e74c3c';
      const cPack = '#34495e'; // Dark modern backpack
      const cPackDetail = '#f1c40f';

      if (pose === 'slide') {
        // SLIDING POSE: Low profile, legs stretched forward, torso angled back
        // Backpack
        ctx.fillStyle = cPack;
        ctx.fillRect(4, 26, 12, 10);
        ctx.fillStyle = cPackDetail;
        ctx.fillRect(6, 28, 2, 6);

        // Torso / Shirt
        ctx.fillStyle = cShirt;
        ctx.fillRect(10, 24, 14, 12);
        ctx.fillStyle = cShirtShadow;
        ctx.fillRect(10, 32, 14, 4);

        // Head & Hair
        ctx.fillStyle = cSkin;
        ctx.fillRect(8, 14, 10, 10);
        ctx.fillStyle = cHair;
        ctx.fillRect(6, 12, 12, 5); // Hair top
        ctx.fillRect(5, 14, 4, 6);  // Hair back

        // Face details
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(15, 17, 2, 2); // Eye

        // Legs / Jeans (Horizontal slide)
        ctx.fillStyle = cJeans;
        ctx.fillRect(22, 28, 12, 6);
        ctx.fillStyle = cJeansDark;
        ctx.fillRect(20, 32, 10, 4);

        // Shoes
        ctx.fillStyle = cShoe;
        ctx.fillRect(32, 28, 4, 6);
        ctx.fillStyle = cShoeRed;
        ctx.fillRect(34, 30, 2, 4);
        return;
      }

      // Standing / Running / Jumping base calculations
      let bobY = 0;
      let legOffsetL = 0;
      let legOffsetR = 0;
      let armAngle = 0;

      if (pose === 'run') {
        const cycle = frame % 6;
        bobY = (cycle === 1 || cycle === 4) ? -2 : 0;
        if (cycle === 0) { legOffsetL = -6; legOffsetR = 6; armAngle = 1; }
        else if (cycle === 1) { legOffsetL = -3; legOffsetR = 3; armAngle = 0.5; }
        else if (cycle === 2) { legOffsetL = 0; legOffsetR = 0; armAngle = 0; }
        else if (cycle === 3) { legOffsetL = 6; legOffsetR = -6; armAngle = -1; }
        else if (cycle === 4) { legOffsetL = 3; legOffsetR = -3; armAngle = -0.5; }
        else if (cycle === 5) { legOffsetL = 0; legOffsetR = 0; armAngle = 0; }
      } else if (pose === 'jump') {
        bobY = -3;
        legOffsetL = -4;
        legOffsetR = 4;
      } else if (pose === 'fall') {
        bobY = 0;
        legOffsetL = -2;
        legOffsetR = 2;
      } else if (pose === 'hurt') {
        bobY = 2;
      }

      const baseY = 8 + bobY;

      // 1. Backpack (Behind torso)
      ctx.fillStyle = cPack;
      ctx.fillRect(7, baseY + 12, 6, 14);
      ctx.fillStyle = cPackDetail;
      ctx.fillRect(6, baseY + 14, 2, 10); // Strap

      // 2. Head & Modern Hairstyle
      ctx.fillStyle = cSkin;
      ctx.fillRect(14, baseY + 2, 10, 10); // Face
      ctx.fillStyle = cSkinShadow;
      ctx.fillRect(14, baseY + 9, 10, 3); // Neck shadow

      // Stylish short hair
      ctx.fillStyle = cHair;
      ctx.fillRect(12, baseY, 13, 5); // Hair top
      ctx.fillRect(11, baseY + 2, 4, 6); // Back hair
      ctx.fillRect(15, baseY + 1, 9, 2); // Quiff highlight
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(21, baseY + 5, 2, 2); // Eye
      ctx.fillStyle = '#8c5b0d';
      ctx.fillRect(20, baseY + 4, 3, 1); // Eyebrow

      // 3. Torso (Modern T-shirt)
      ctx.fillStyle = cShirt;
      ctx.fillRect(12, baseY + 12, 12, 14);
      ctx.fillStyle = cShirtShadow;
      ctx.fillRect(12, baseY + 22, 12, 4); // Shirt hem

      // 4. Arms
      ctx.fillStyle = cShirt;
      ctx.fillRect(10, baseY + 13, 3, 6); // Left sleeve
      ctx.fillRect(21, baseY + 13, 3, 6); // Right sleeve
      ctx.fillStyle = cSkin;
      ctx.fillRect(10, baseY + 19, 3, 6); // Left forearm
      ctx.fillRect(22, baseY + 19, 3, 6); // Right forearm

      // 5. Jeans / Pants
      ctx.fillStyle = cJeans;
      // Left leg
      ctx.fillRect(13 + legOffsetL, baseY + 26, 4, 12);
      // Right leg
      ctx.fillStyle = cJeansDark;
      ctx.fillRect(19 + legOffsetR, baseY + 26, 4, 12);

      // 6. Sneakers
      ctx.fillStyle = cShoe;
      ctx.fillRect(12 + legOffsetL, baseY + 38, 6, 4);
      ctx.fillStyle = cShoeRed;
      ctx.fillRect(14 + legOffsetL, baseY + 38, 4, 2);

      ctx.fillStyle = cShoe;
      ctx.fillRect(18 + legOffsetR, baseY + 38, 6, 4);
      ctx.fillStyle = cShoeRed;
      ctx.fillRect(20 + legOffsetR, baseY + 38, 4, 2);
    };

    // Generate animation frames
    this.cache.player = {
      idle: [],
      run: [],
      jump: [],
      fall: [],
      slide: [],
      hurt: [],
      victory: []
    };

    // Idle frames
    for (let f = 0; f < 2; f++) {
      const { canvas, ctx } = this.createCanvas(W, H);
      drawGuy(ctx, 'idle', f);
      this.cache.player.idle.push(canvas);
    }
    // Run frames (6 frames)
    for (let f = 0; f < 6; f++) {
      const { canvas, ctx } = this.createCanvas(W, H);
      drawGuy(ctx, 'run', f);
      this.cache.player.run.push(canvas);
    }
    // Jump frame
    {
      const { canvas, ctx } = this.createCanvas(W, H);
      drawGuy(ctx, 'jump', 0);
      this.cache.player.jump.push(canvas);
    }
    // Fall frame
    {
      const { canvas, ctx } = this.createCanvas(W, H);
      drawGuy(ctx, 'fall', 0);
      this.cache.player.fall.push(canvas);
    }
    // Slide frame
    {
      const { canvas, ctx } = this.createCanvas(W, H);
      drawGuy(ctx, 'slide', 0);
      this.cache.player.slide.push(canvas);
    }
    // Hurt frame
    {
      const { canvas, ctx } = this.createCanvas(W, H);
      drawGuy(ctx, 'hurt', 0);
      this.cache.player.hurt.push(canvas);
    }
    // Victory frames
    for (let f = 0; f < 2; f++) {
      const { canvas, ctx } = this.createCanvas(W, H);
      drawGuy(ctx, 'idle', f);
      this.cache.player.victory.push(canvas);
    }
  }

  /* -------------------------------------------------------------
     2. VEHICLE SPRITES (Kerala Inspired Fictional Vehicles)
     ------------------------------------------------------------- */
  generateVehicleSprites() {
    this.cache.vehicles = {};

    // A. Fictional Kerala "Fast Passenger" Public Bus (Red & Yellow)
    {
      const BW = 140;
      const BH = 64;
      const { canvas, ctx } = this.createCanvas(BW, BH);

      // Main Bus Body (Red upper/lower with bold yellow band)
      ctx.fillStyle = '#c0392b'; // Dark Kerala Red
      ctx.fillRect(4, 8, BW - 8, BH - 20);

      // Yellow Middle Stripe
      ctx.fillStyle = '#f1c40f'; // Kerala Bus Yellow
      ctx.fillRect(4, 24, BW - 8, 14);

      // Roof & Luggage Carrier
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(8, 4, BW - 16, 4);
      ctx.fillStyle = '#7f8c8d'; // Metal luggage rack
      ctx.fillRect(14, 0, BW - 28, 4);

      // Windshield & Passenger Windows
      ctx.fillStyle = '#34495e'; // Tinted glass
      // Front windshield
      ctx.fillRect(BW - 24, 12, 16, 18);
      // Side windows
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(12 + i * 18, 12, 14, 14);
      }

      // Destination Board ("KERALA EXP")
      ctx.fillStyle = '#000';
      ctx.fillRect(BW - 36, 6, 26, 6);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(BW - 34, 8, 22, 2);

      // Front Headlights & Grille
      ctx.fillStyle = '#f39c12'; // Grille
      ctx.fillRect(BW - 8, 32, 4, 10);
      ctx.fillStyle = '#fff'; // Headlight
      ctx.fillRect(BW - 6, 36, 4, 6);

      // Wheels
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(32, BH - 10, 10, 0, Math.PI * 2);
      ctx.arc(BW - 34, BH - 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#bdc3c7'; // Hubcaps
      ctx.beginPath();
      ctx.arc(32, BH - 10, 5, 0, Math.PI * 2);
      ctx.arc(BW - 34, BH - 10, 5, 0, Math.PI * 2);
      ctx.fill();

      this.cache.vehicles.bus = canvas;
    }

    // B. Auto-Rickshaw (Yellow Top, Black Body, Green Line)
    {
      const AW = 72;
      const AH = 48;
      const { canvas, ctx } = this.createCanvas(AW, AH);

      // Yellow Canopy / Hood
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(8, 6, AW - 16, 14);
      ctx.fillRect(14, 2, AW - 28, 4);

      // Black Body & Chassis
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(6, 20, AW - 12, 18);
      ctx.fillStyle = '#27ae60'; // Kerala Green Trim Stripe
      ctx.fillRect(6, 26, AW - 12, 3);

      // Windshield & Open Passenger Area
      ctx.fillStyle = '#74b9ff';
      ctx.fillRect(AW - 22, 10, 14, 12); // Front glass
      ctx.fillStyle = '#1a252f'; // Open interior
      ctx.fillRect(16, 14, 28, 14);

      // Headlight
      ctx.fillStyle = '#f4d03f';
      ctx.fillRect(AW - 6, 24, 4, 4);

      // Three Wheels (Front + Back pair)
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(20, AH - 8, 8, 0, Math.PI * 2);
      ctx.arc(AW - 16, AH - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#95a5a6';
      ctx.beginPath();
      ctx.arc(20, AH - 8, 3, 0, Math.PI * 2);
      ctx.arc(AW - 16, AH - 8, 3, 0, Math.PI * 2);
      ctx.fill();

      this.cache.vehicles.rickshaw = canvas;
    }

    // C. Motorbike with Rider in Yellow Raincoat
    {
      const MW = 58;
      const MH = 44;
      const { canvas, ctx } = this.createCanvas(MW, MH);

      // Rider in Raincoat / Helmet
      ctx.fillStyle = '#f1c40f'; // Yellow raincoat
      ctx.fillRect(16, 14, 14, 14);
      ctx.fillStyle = '#e74c3c'; // Helmet
      ctx.fillRect(18, 4, 12, 10);
      ctx.fillStyle = '#2c3e50'; // Visor
      ctx.fillRect(26, 7, 4, 4);

      // Motorbike Body (Classic Black & Chrome)
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(12, 26, 28, 8);
      ctx.fillStyle = '#bdc3c7'; // Chrome exhaust & engine
      ctx.fillRect(14, 32, 22, 4);
      ctx.fillStyle = '#e67e22'; // Fuel tank
      ctx.fillRect(24, 22, 10, 6);

      // Headlight
      ctx.fillStyle = '#fff';
      ctx.fillRect(MW - 12, 22, 4, 4);

      // Wheels (Spokes)
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(14, MH - 8, 8, 0, Math.PI * 2);
      ctx.arc(MW - 14, MH - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ecf0f1';
      ctx.beginPath();
      ctx.arc(14, MH - 8, 3, 0, Math.PI * 2);
      ctx.arc(MW - 14, MH - 8, 3, 0, Math.PI * 2);
      ctx.fill();

      this.cache.vehicles.motorbike = canvas;
    }

    // D. Retro Kerala Taxi / Car (Ambassador Style White/Silver)
    {
      const CW = 88;
      const CH = 46;
      const { canvas, ctx } = this.createCanvas(CW, CH);

      // Car Body
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(8, 16, CW - 16, 18);
      ctx.fillRect(22, 8, CW - 44, 10); // Roof

      // Windows
      ctx.fillStyle = '#34495e';
      ctx.fillRect(26, 10, 16, 7);
      ctx.fillRect(46, 10, 16, 7);

      // Headlight & Bumpers
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(CW - 8, 22, 4, 4);
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(4, 30, CW - 8, 4);

      // Wheels
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(24, CH - 8, 8, 0, Math.PI * 2);
      ctx.arc(CW - 24, CH - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#bdc3c7';
      ctx.beginPath();
      ctx.arc(24, CH - 8, 3, 0, Math.PI * 2);
      ctx.arc(CW - 24, CH - 8, 3, 0, Math.PI * 2);
      ctx.fill();

      this.cache.vehicles.car = canvas;
    }
  }

  /* -------------------------------------------------------------
     3. ENVIRONMENT & PARALLAX SCENERY SPRITES
     ------------------------------------------------------------- */
  generateEnvironmentSprites() {
    this.cache.env = {};

    // A. Traditional Kerala House (Odu Veedu / Sloped Terracotta Roof)
    {
      const HW = 160;
      const HH = 120;
      const { canvas, ctx } = this.createCanvas(HW, HH);

      // House Walls (Warm Cream / Laterite Stone)
      ctx.fillStyle = '#f5e6ca';
      ctx.fillRect(20, 50, HW - 40, HH - 50);
      ctx.fillStyle = '#d5c4a1';
      ctx.fillRect(20, 50, 8, HH - 50);

      // Traditional Sloping Terracotta Roof (Odu)
      ctx.fillStyle = '#b73e23';
      ctx.beginPath();
      ctx.moveTo(10, 54);
      ctx.lineTo(HW / 2, 10);
      ctx.lineTo(HW - 10, 54);
      ctx.closePath();
      ctx.fill();

      // Roof Overhang & Tile Texture
      ctx.fillStyle = '#7a220e';
      ctx.fillRect(6, 52, HW - 12, 6);
      for (let r = 0; r < 4; r++) {
        ctx.fillStyle = (r % 2 === 0) ? '#9c3924' : '#b73e23';
        ctx.fillRect(20 + r * 12, 44 - r * 8, HW - 40 - r * 24, 4);
      }

      // Wooden Pillar Veranda (Poomukham)
      ctx.fillStyle = '#6e2c00'; // Carved wood pillars
      ctx.fillRect(36, 68, 6, 46);
      ctx.fillRect(HW - 42, 68, 6, 46);

      // Door & Lit Windows
      ctx.fillStyle = '#4a235a';
      ctx.fillRect(HW / 2 - 12, 70, 24, 44); // Main Door
      ctx.fillStyle = '#f39c12'; // Warm light window
      ctx.fillRect(30, 66, 18, 18);
      ctx.fillRect(HW - 48, 66, 18, 18);
      ctx.fillStyle = '#6e2c00'; // Window bars
      ctx.fillRect(38, 66, 2, 18);
      ctx.fillRect(HW - 40, 66, 2, 18);

      this.cache.env.keralaHouse = canvas;
    }

    // B. Coconut Palm Tree (Swaying Fronds & Trunk)
    {
      const PW = 110;
      const PH = 180;
      const { canvas, ctx } = this.createCanvas(PW, PH);

      // Curved Brown Trunk
      ctx.fillStyle = '#5d4037';
      ctx.beginPath();
      ctx.moveTo(PW / 2 - 8, PH);
      ctx.quadraticCurveTo(PW / 2 + 18, PH / 2, PW / 2, 40);
      ctx.lineTo(PW / 2 + 8, 40);
      ctx.quadraticCurveTo(PW / 2 + 24, PH / 2, PW / 2 + 2, PH);
      ctx.closePath();
      ctx.fill();

      // Trunk rings
      ctx.fillStyle = '#3e2723';
      for (let y = 50; y < PH - 10; y += 12) {
        ctx.fillRect(PW / 2 - 4 + (PH - y) * 0.1, y, 10, 3);
      }

      // Coconuts at crown
      ctx.fillStyle = '#2e7d32'; // Green coconuts
      ctx.beginPath();
      ctx.arc(PW / 2 - 4, 42, 5, 0, Math.PI * 2);
      ctx.arc(PW / 2 + 5, 43, 5, 0, Math.PI * 2);
      ctx.arc(PW / 2, 48, 5, 0, Math.PI * 2);
      ctx.fill();

      // Lush Green Coconut Fronds
      const drawFrond = (ox, oy, angle, len) => {
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(angle);
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(len / 2, -12, len, 8);
        ctx.quadraticCurveTo(len / 2, 14, 0, 0);
        ctx.fill();
        ctx.fillStyle = '#1b5e20';
        ctx.fillRect(0, -1, len - 4, 2); // Midrib
        ctx.restore();
      };

      drawFrond(PW / 2, 38, -0.6, 52);
      drawFrond(PW / 2, 38, -1.2, 48);
      drawFrond(PW / 2, 38, 0.4, 54);
      drawFrond(PW / 2, 38, 1.1, 50);
      drawFrond(PW / 2, 38, -2.4, 48);
      drawFrond(PW / 2, 38, 2.5, 46);

      this.cache.env.coconutTree = canvas;
    }

    // C. Roadside Tea Shop (Chaya Kada)
    {
      const TW = 130;
      const TH = 80;
      const { canvas, ctx } = this.createCanvas(TW, TH);

      // Wooden Stall Walls
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(10, 30, TW - 20, TH - 30);

      // Sloped Tile / Sheet Canopy
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(4, 20, TW - 8, 10);
      ctx.fillStyle = '#1e8449';
      ctx.fillRect(0, 26, TW, 4);

      // "CHAYA KADA" Banner
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(16, 6, TW - 32, 14);
      ctx.fillStyle = '#000';
      ctx.font = '8px monospace';
      ctx.fillText('CHAYA KADA', 22, 16);

      // Counter & Boiling Tea Samovar Kettle
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(14, 46, TW - 28, 8); // Countertop
      ctx.fillStyle = '#bdc3c7'; // Stainless Steel Samovar
      ctx.fillRect(24, 32, 14, 14);
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(28, 28, 6, 4); // Kettle Lid

      // Glass Tumblers with Golden Milk Tea
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#d5dbdb';
        ctx.fillRect(52 + i * 10, 38, 6, 8);
        ctx.fillStyle = '#d35400'; // Tea color
        ctx.fillRect(53 + i * 10, 41, 4, 5);
      }

      this.cache.env.teaShop = canvas;
    }

    // D. Bus Stop Shelter
    {
      const SW = 120;
      const SH = 70;
      const { canvas, ctx } = this.createCanvas(SW, SH);

      // Concrete Roof Slab
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(6, 12, SW - 12, 8);
      ctx.fillStyle = '#95a5a6';
      ctx.fillRect(4, 18, SW - 8, 3);

      // Metal Pillars
      ctx.fillStyle = '#34495e';
      ctx.fillRect(16, 20, 6, SH - 20);
      ctx.fillRect(SW - 22, 20, 6, SH - 20);

      // Waiting Bench & Bus Sign
      ctx.fillStyle = '#b73e23';
      ctx.fillRect(26, SH - 16, SW - 52, 6); // Bench
      ctx.fillStyle = '#2980b9'; // Blue Bus Stop Sign
      ctx.fillRect(28, 26, 24, 16);
      ctx.fillStyle = '#fff';
      ctx.fillRect(32, 30, 16, 8);

      this.cache.env.busStop = canvas;
    }

    // E. Kerala Milestone Marker ("ALAPPUZHA 10 KM")
    {
      const MW = 28;
      const MH = 38;
      const { canvas, ctx } = this.createCanvas(MW, MH);

      // Stone Shape
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(4, 12, MW - 8, MH - 12);
      ctx.beginPath();
      ctx.arc(MW / 2, 12, (MW - 8) / 2, Math.PI, 0);
      ctx.fill();

      // Yellow Top Cap (State Highway)
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(MW / 2, 12, (MW - 8) / 2, Math.PI, 0);
      ctx.fill();

      // Distance Text Line
      ctx.fillStyle = '#111';
      ctx.fillRect(8, 20, MW - 16, 2);
      ctx.fillRect(10, 26, MW - 20, 2);

      this.cache.env.milestone = canvas;
    }

    // F. Electric Pole with Sagging Monsoon Wires
    {
      const EW = 40;
      const EH = 160;
      const { canvas, ctx } = this.createCanvas(EW, EH);

      ctx.fillStyle = '#7f8c8d'; // Concrete pole
      ctx.fillRect(EW / 2 - 3, 10, 6, EH - 10);
      // Crossbars
      ctx.fillStyle = '#34495e';
      ctx.fillRect(4, 18, EW - 8, 4);
      ctx.fillRect(8, 30, EW - 16, 4);
      // Insulators
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(6, 14, 3, 4);
      ctx.fillRect(EW - 9, 14, 3, 4);

      this.cache.env.electricPole = canvas;
    }

    // G. Purely Decorative Roadside Green Bush (VISUAL SCENERY ONLY — ZERO COLLISION)
    {
      const BW = 46;
      const BH = 26;
      const { canvas, ctx } = this.createCanvas(BW, BH);

      // Lush tropical green foliage clusters
      ctx.fillStyle = '#1e824c';
      ctx.beginPath();
      ctx.arc(14, 16, 12, 0, Math.PI * 2);
      ctx.arc(32, 16, 12, 0, Math.PI * 2);
      ctx.arc(23, 10, 10, 0, Math.PI * 2);
      ctx.fill();

      // Highlight leaves
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.arc(14, 13, 8, 0, Math.PI * 2);
      ctx.arc(30, 13, 8, 0, Math.PI * 2);
      ctx.arc(22, 8, 6, 0, Math.PI * 2);
      ctx.fill();

      this.cache.env.decorativeBush = canvas;
    }
  }

  /* -------------------------------------------------------------
     4. OBSTACLE SPRITES
     ------------------------------------------------------------- */
  generateObstacleSprites() {
    this.cache.obstacles = {};

    // A. Pothole with Water Ripple
    {
      const PW = 44;
      const PH = 16;
      const { canvas, ctx } = this.createCanvas(PW, PH);

      ctx.fillStyle = '#1c1917'; // Asphalt hole
      ctx.beginPath();
      ctx.ellipse(PW / 2, PH / 2, PW / 2 - 2, PH / 2 - 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2980b9'; // Murky water
      ctx.beginPath();
      ctx.ellipse(PW / 2, PH / 2, PW / 2 - 6, PH / 2 - 4, 0, 0, Math.PI * 2);
      ctx.fill();

      this.cache.obstacles.pothole = canvas;
    }

    // B. Fallen Tree Branch / Log
    {
      const LW = 48;
      const LH = 20;
      const { canvas, ctx } = this.createCanvas(LW, LH);

      ctx.fillStyle = '#4e342e';
      ctx.fillRect(4, 8, LW - 8, 10);
      ctx.fillStyle = '#2e7d32'; // Leaves on branch
      ctx.fillRect(8, 4, 12, 6);
      ctx.fillRect(28, 2, 10, 8);

      this.cache.obstacles.branch = canvas;
    }

    // C. Low Hanging Branch (Requires Slide)
    {
      const BW = 64;
      const BH = 32;
      const { canvas, ctx } = this.createCanvas(BW, BH);

      ctx.fillStyle = '#3e2723';
      ctx.fillRect(0, 6, BW - 4, 8);
      ctx.fillStyle = '#1b5e20';
      ctx.fillRect(4, 0, BW - 8, 18);
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(12, 8, BW - 24, 14);

      this.cache.obstacles.lowBranch = canvas;
    }

    // D. Roadside Boulder / Rock
    {
      const RW = 36;
      const RH = 26;
      const { canvas, ctx } = this.createCanvas(RW, RH);

      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.moveTo(4, RH - 2);
      ctx.lineTo(12, 6);
      ctx.lineTo(26, 4);
      ctx.lineTo(RW - 4, RH - 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#777'; // Highlight
      ctx.fillRect(14, 8, 10, 6);

      this.cache.obstacles.rock = canvas;
    }

    // E. Fallen Coconut (Obstacle)
    {
      const CW = 20;
      const CH = 20;
      const { canvas, ctx } = this.createCanvas(CW, CH);

      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.arc(CW / 2, CH / 2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6d4c41';
      ctx.beginPath();
      ctx.arc(CW / 2 - 2, CH / 2 - 2, 4, 0, Math.PI * 2);
      ctx.fill();

      this.cache.obstacles.coconut = canvas;
    }

    // F. Floating Flood Debris / Wooden Crate (Level 4)
    {
      const DW = 40;
      const DH = 24;
      const { canvas, ctx } = this.createCanvas(DW, DH);

      ctx.fillStyle = '#795548';
      ctx.fillRect(4, 4, DW - 8, DH - 8);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(6, 6, DW - 12, 2);
      ctx.fillRect(6, DH - 8, DW - 12, 2);

      this.cache.obstacles.crate = canvas;
    }
  }

  /* -------------------------------------------------------------
     5. ANIMATED GOLDEN COIN SPRITES (Only Collectible)
     ------------------------------------------------------------- */
  generateCoinSprites() {
    this.cache.coin = [];
    const CW = 20;
    const CH = 20;
    const frames = 6;

    for (let f = 0; f < frames; f++) {
      const { canvas, ctx } = this.createCanvas(CW, CH);
      const scaleX = Math.cos((f / frames) * Math.PI * 2);
      const width = Math.max(3, Math.abs(scaleX) * 7);

      // Gold Outer Ring
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.ellipse(CW / 2, CH / 2, width, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shiny Gold Core
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.ellipse(CW / 2, CH / 2, Math.max(1, width - 2), 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Star Sparkle Highlight
      if (f === 0 || f === 1) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(CW / 2 - 1, CH / 2 - 3, 2, 2);
      }

      this.cache.coin.push(canvas);
    }
  }
}

// Global sprite manager
window.sprites = new SpriteManager();
