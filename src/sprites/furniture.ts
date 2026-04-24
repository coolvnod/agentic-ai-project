// ============================================================================
// Furniture Sprite Drawing — Pixel art isometric furniture
// ============================================================================

import type { FurnitureType } from '@/lib/types';
import { gridToScreen, TILE_W, TILE_H } from '@/engine/isometric';
import { drawIsometricBlock } from '@/engine/isometric';

const PALETTE = {
  line: '#2E3A44',
  woodTop: '#C8AD8A',
  woodLeft: '#AF9475',
  woodRight: '#998065',
  steelTop: '#8FA1AF',
  steelLeft: '#718492',
  steelRight: '#5F717D',
  screen: '#7FD1F4',
  screenDark: '#263746',
};

function px(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

// ---------------------------------------------------------------------------
// Individual furniture draw functions
// ---------------------------------------------------------------------------

function drawDesk(ctx: CanvasRenderingContext2D, col: number, row: number, tick: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Desk top
  drawIsometricBlock(ctx, { col, row }, 14, PALETTE.woodTop, PALETTE.woodLeft, PALETTE.woodRight);
  // Top rim highlight
  px(ctx, x - 14, y - 16, 28, 1, '#E6D1B8');
  px(ctx, x - 14, y - 15, 1, 12, '#8D7459');
  px(ctx, x + 13, y - 15, 1, 12, '#7D664F');
  // Monitor
  const monY = y - 26;
  px(ctx, x - 8, monY - 12, 16, 12, PALETTE.screenDark);
  px(ctx, x - 6, monY - 10, 12, 8, PALETTE.screen);
  // Screen flicker
  if (tick % 60 < 55) {
    px(ctx, x - 5, monY - 8, 10, 1, '#B8ECFD');
    px(ctx, x - 2, monY - 6, 4, 1, '#B8ECFD');
  }
  // Monitor stand
  px(ctx, x - 2, monY, 4, 3, '#5E7382');
  // Keyboard
  px(ctx, x - 6, y - 10, 12, 4, '#445963');
  px(ctx, x - 5, y - 9, 10, 2, '#627985');
  // Mouse + pad
  px(ctx, x + 7, y - 10, 3, 3, '#2A3B46');
  px(ctx, x + 6, y - 9, 5, 1, '#708996');
}

function drawChair(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Seat
  px(ctx, x - 8, y - 6, 16, 4, '#6D7E8B');
  px(ctx, x - 6, y - 5, 12, 2, '#8FA1AF');
  // Back
  px(ctx, x - 8, y - 16, 3, 12, '#5D6E7D');
  px(ctx, x + 5, y - 16, 3, 12, '#5D6E7D');
  px(ctx, x - 8, y - 16, 16, 3, '#7F93A2');
  // Legs
  px(ctx, x - 6, y - 2, 2, 4, '#333333');
  px(ctx, x + 4, y - 2, 2, 4, '#333333');
  // Wheels
  px(ctx, x - 7, y + 2, 3, 2, '#222222');
  px(ctx, x + 4, y + 2, 3, 2, '#222222');
}

function drawBigDesk(ctx: CanvasRenderingContext2D, col: number, row: number, tick: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Large desk surface
  drawIsometricBlock(ctx, { col, row }, 14, '#B89D84', '#9D856F', '#866F5D');
  // Dual monitors
  px(ctx, x - 16, y - 28, 14, 10, '#2B3A46');
  px(ctx, x - 14, y - 26, 10, 6, tick % 80 < 75 ? '#82D2F2' : '#B5E9FB');
  px(ctx, x + 2, y - 28, 14, 10, '#2B3A46');
  px(ctx, x + 4, y - 26, 10, 6, tick % 80 < 70 ? '#8CD0A6' : '#B7E7C8');
  // Stands
  px(ctx, x - 10, y - 18, 3, 4, '#6B7F8E');
  px(ctx, x + 7, y - 18, 3, 4, '#6B7F8E');
}

function drawMonitor(ctx: CanvasRenderingContext2D, col: number, row: number, tick: number): void {
  const { x, y } = gridToScreen({ col, row });
  px(ctx, x - 10, y - 22, 20, 14, '#1A1A2E');
  px(ctx, x - 8, y - 20, 16, 10, tick % 90 < 85 ? '#4FC3F7' : '#B3E5FC');
  // Code lines on screen
  if (tick % 90 < 85) {
    for (let i = 0; i < 4; i++) {
      const w = 4 + Math.floor(Math.random() * 8);
      px(ctx, x - 6, y - 18 + i * 2, w, 1, '#80DEEA');
    }
  }
  px(ctx, x - 2, y - 8, 4, 4, '#37474F');
}

function drawFloorWindow(ctx: CanvasRenderingContext2D, col: number, row: number, tick: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Window frame
  px(ctx, x - 18, y - 40, 36, 36, '#37474F');
  // Glass panes
  const skyColor = tick % 200 < 100 ? '#64B5F6' : '#42A5F5';
  px(ctx, x - 16, y - 38, 15, 15, skyColor);
  px(ctx, x + 1, y - 38, 15, 15, skyColor);
  px(ctx, x - 16, y - 21, 15, 15, '#81D4FA');
  px(ctx, x + 1, y - 21, 15, 15, '#81D4FA');
  // Clouds
  px(ctx, x - 10 + (tick % 60) / 3, y - 34, 6, 2, '#FFFFFFB0');
  px(ctx, x - 2 + (tick % 90) / 4, y - 30, 5, 2, '#FFFFFF80');
  // Dividers
  px(ctx, x - 1, y - 38, 2, 34, '#455A64');
  px(ctx, x - 16, y - 22, 32, 2, '#455A64');
}

function drawCoffeeMachine(ctx: CanvasRenderingContext2D, col: number, row: number, tick: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Machine body
  px(ctx, x - 8, y - 24, 16, 20, '#7C8D99');
  px(ctx, x - 6, y - 22, 12, 8, '#32414B');
  // Indicator light
  px(ctx, x - 4, y - 12, 3, 3, tick % 40 < 20 ? '#4CAF50' : '#1B5E20');
  // Cup slot
  px(ctx, x + 1, y - 12, 5, 8, '#3D515B');
  px(ctx, x - 7, y - 7, 14, 1, '#AAB9C3');
  // Steam
  if (tick % 30 < 20) {
    ctx.fillStyle = '#FFFFFF40';
    ctx.fillRect(x + 2, y - 28 - (tick % 10), 2, 3);
    ctx.fillRect(x + 4, y - 30 - (tick % 8), 2, 2);
  }
}

function drawSnackShelf(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Shelf frame
  px(ctx, x - 10, y - 30, 20, 26, '#5D4037');
  // Shelves
  px(ctx, x - 8, y - 20, 16, 2, '#795548');
  px(ctx, x - 8, y - 12, 16, 2, '#795548');
  // Items
  px(ctx, x - 6, y - 28, 4, 6, '#F44336'); // Red box
  px(ctx, x, y - 26, 4, 4, '#FFCA28'); // Yellow snack
  px(ctx, x + 4, y - 28, 3, 6, '#4CAF50'); // Green bottle
  px(ctx, x - 6, y - 18, 5, 4, '#FF9800'); // Orange pack
  px(ctx, x + 2, y - 18, 4, 4, '#2196F3'); // Blue box
}

function drawWaterCooler(ctx: CanvasRenderingContext2D, col: number, row: number, tick: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Body
  px(ctx, x - 6, y - 20, 12, 16, '#D9E1E7');
  // Water bottle on top
  px(ctx, x - 4, y - 30, 8, 10, '#42A5F5');
  px(ctx, x - 3, y - 32, 6, 3, '#64B5F6');
  // Water level animation
  const level = 4 + Math.sin(tick * 0.05) * 1;
  px(ctx, x - 3, y - 20 - level, 6, level, '#1E88E5');
  // Tap
  px(ctx, x + 4, y - 10, 3, 3, '#8BA0AC');
}

function drawSmallTable(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  drawIsometricBlock(ctx, { col, row }, 10, '#A1887F', '#8D6E63', '#795548');
}

function drawRoundTable(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Table top (ellipse approximation)
  ctx.fillStyle = '#A1887F';
  ctx.beginPath();
  ctx.ellipse(x, y - 12, TILE_W / 3, TILE_H / 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#795548';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Leg
  px(ctx, x - 2, y - 10, 4, 10, '#6D4C41');
}

function drawLongTable(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  drawIsometricBlock(ctx, { col, row }, 12, '#BCAAA4', '#A1887F', '#8D6E63');
  // Some items on table
  const { x, y } = gridToScreen({ col, row });
  px(ctx, x - 6, y - 18, 4, 3, '#ECEFF1'); // Paper
  px(ctx, x + 2, y - 17, 3, 3, '#42A5F5'); // Cup
}

function drawWhiteboard(ctx: CanvasRenderingContext2D, col: number, row: number, tick: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Board frame
  px(ctx, x - 18, y - 36, 36, 28, '#455A64');
  // White surface
  px(ctx, x - 16, y - 34, 32, 24, '#FAFAFA');
  // "Drawings" on board
  ctx.strokeStyle = '#1565C0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 28);
  ctx.lineTo(x - 4, y - 20);
  ctx.lineTo(x + 4, y - 26);
  ctx.lineTo(x + 12, y - 16);
  ctx.stroke();
  // Extra sticky notes
  px(ctx, x - 14, y - 30, 4, 4, '#FFF176');
  px(ctx, x + 8, y - 22, 4, 4, '#FFAB91');
  // Red dot (animated)
  if (tick % 60 < 40) {
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(x + 10, y - 28, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  // Markers tray
  px(ctx, x - 14, y - 8, 28, 3, '#616161');
  px(ctx, x - 10, y - 10, 3, 4, '#F44336');
  px(ctx, x - 6, y - 10, 3, 4, '#2196F3');
  px(ctx, x - 2, y - 10, 3, 4, '#4CAF50');
}

function drawBookshelf(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Frame
  px(ctx, x - 12, y - 34, 24, 30, '#6D5945');
  // Shelves
  px(ctx, x - 10, y - 22, 20, 2, '#846A52');
  px(ctx, x - 10, y - 12, 20, 2, '#846A52');
  // Books
  const bookColors = ['#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#795548', '#FFCA28', '#00BCD4'];
  for (let shelf = 0; shelf < 3; shelf++) {
    const shelfY = y - 32 + shelf * 10;
    let bx = x - 9;
    for (let i = 0; i < 4 + shelf; i++) {
      const w = 2 + Math.floor(i * 0.5);
      const h = 6 + (i % 2);
      px(ctx, bx, shelfY + (8 - h), w, h, bookColors[(shelf * 4 + i) % bookColors.length]);
      bx += w + 1;
      if (bx > x + 8) break;
    }
  }
}

function drawReadingChair(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Cushion
  px(ctx, x - 10, y - 10, 20, 8, '#7B1FA2');
  px(ctx, x - 8, y - 8, 16, 4, '#9C27B0');
  // Back
  px(ctx, x - 10, y - 22, 20, 14, '#6A1B9A');
  px(ctx, x - 8, y - 20, 16, 10, '#8E24AA');
  // Armrests
  px(ctx, x - 12, y - 14, 3, 8, '#6A1B9A');
  px(ctx, x + 9, y - 14, 3, 8, '#6A1B9A');
}

function drawSofa(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Seat
  px(ctx, x - 16, y - 8, 32, 8, '#5C6BC0');
  px(ctx, x - 14, y - 6, 28, 4, '#7986CB');
  // Back
  px(ctx, x - 16, y - 20, 32, 14, '#3F51B5');
  px(ctx, x - 14, y - 18, 28, 10, '#5C6BC0');
  // Armrests
  px(ctx, x - 18, y - 16, 4, 12, '#3949AB');
  px(ctx, x + 14, y - 16, 4, 12, '#3949AB');
  // Cushion lines
  px(ctx, x - 1, y - 6, 2, 4, '#5C6BC0');
}

function drawCoffeeTable(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const { x, y } = gridToScreen({ col, row });
  drawIsometricBlock(ctx, { col, row }, 6, '#795548', '#6D4C41', '#5D4037');
  // Magazine
  px(ctx, x - 4, y - 10, 6, 4, '#ECEFF1');
  px(ctx, x - 3, y - 9, 4, 2, '#90A4AE');
  // Cup
  px(ctx, x + 3, y - 10, 3, 3, '#FFFFFF');
}

function drawServerRack(ctx: CanvasRenderingContext2D, col: number, row: number, tick: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Rack body
  px(ctx, x - 10, y - 36, 20, 32, '#263543');
  px(ctx, x - 8, y - 34, 16, 28, '#18222B');
  // Server units
  for (let i = 0; i < 4; i++) {
    const uy = y - 32 + i * 7;
    px(ctx, x - 7, uy, 14, 5, '#405261');
    // Blinking lights
    const lightOn = ((tick + i * 7) % 20) < 14;
    px(ctx, x - 5, uy + 1, 2, 2, lightOn ? '#4CAF50' : '#1B5E20');
    px(ctx, x - 2, uy + 1, 2, 2, ((tick + i * 3) % 30) < 25 ? '#4FC3F7' : '#0D47A1');
    // Vent lines
    for (let v = 0; v < 3; v++) {
      px(ctx, x + 2 + v * 2, uy + 1, 1, 3, '#607684');
    }
  }
  // Side rail glow
  if (tick % 40 < 24) {
    px(ctx, x + 9, y - 34, 1, 28, '#4FC3F780');
  }
}

function drawMeetingChair(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Simple chair
  px(ctx, x - 6, y - 6, 12, 4, '#8A9DA8');
  px(ctx, x - 6, y - 14, 12, 10, '#6E8594');
  // Legs
  px(ctx, x - 4, y - 2, 2, 4, '#37474F');
  px(ctx, x + 2, y - 2, 2, 4, '#37474F');
}

function drawDoorMat(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const { x, y } = gridToScreen({ col, row });
  ctx.fillStyle = '#795548';
  ctx.beginPath();
  ctx.ellipse(x, y, TILE_W / 3, TILE_H / 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8D6E63';
  ctx.beginPath();
  ctx.ellipse(x, y, TILE_W / 4, TILE_H / 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPottedPlant(ctx: CanvasRenderingContext2D, col: number, row: number, tick: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Pot
  px(ctx, x - 5, y - 8, 10, 8, '#B96D4A');
  px(ctx, x - 6, y - 8, 12, 2, '#9A5639');
  // Soil
  px(ctx, x - 4, y - 10, 8, 3, '#3E2723');
  // Leaves (swaying)
  const sway = Math.sin(tick * 0.04) * 1.5;
  ctx.fillStyle = '#3A7C47';
  ctx.beginPath();
  ctx.ellipse(x + sway, y - 18, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4A9660';
  ctx.beginPath();
  ctx.ellipse(x - 3 + sway * 0.5, y - 22, 5, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#67A86A';
  ctx.beginPath();
  ctx.ellipse(x + 3 - sway * 0.5, y - 20, 4, 3, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Stem
  px(ctx, x - 1, y - 16, 2, 7, '#33691E');
}

function drawCarpet(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const { x, y } = gridToScreen({ col, row });
  ctx.fillStyle = '#7A4A9C66';
  ctx.beginPath();
  ctx.moveTo(x, y - TILE_H / 2);
  ctx.lineTo(x + TILE_W / 2, y);
  ctx.lineTo(x, y + TILE_H / 2);
  ctx.lineTo(x - TILE_W / 2, y);
  ctx.closePath();
  ctx.fill();
  // Pattern
  ctx.fillStyle = '#9E6BC040';
  ctx.beginPath();
  ctx.moveTo(x, y - TILE_H / 4);
  ctx.lineTo(x + TILE_W / 4, y);
  ctx.lineTo(x, y + TILE_H / 4);
  ctx.lineTo(x - TILE_W / 4, y);
  ctx.closePath();
  ctx.fill();
}

function drawWallClock(ctx: CanvasRenderingContext2D, col: number, row: number, tick: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Clock face
  ctx.fillStyle = '#ECEFF1';
  ctx.beginPath();
  ctx.arc(x, y - 20, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#455A64';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Hour hand
  const hourAngle = (tick * 0.001) % (Math.PI * 2);
  ctx.strokeStyle = '#263238';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x + Math.cos(hourAngle) * 4, y - 20 + Math.sin(hourAngle) * 4);
  ctx.stroke();
  // Minute hand
  const minAngle = (tick * 0.01) % (Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x + Math.cos(minAngle) * 6, y - 20 + Math.sin(minAngle) * 6);
  ctx.stroke();
  // Center dot
  ctx.fillStyle = '#F44336';
  ctx.beginPath();
  ctx.arc(x, y - 20, 1, 0, Math.PI * 2);
  ctx.fill();
}

function drawPoster(ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const { x, y } = gridToScreen({ col, row });
  // Frame
  px(ctx, x - 8, y - 30, 16, 20, '#435766');
  // Poster content
  px(ctx, x - 6, y - 28, 12, 16, '#3D568E');
  // "AI" text
  ctx.fillStyle = '#CBE8F7';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AI', x, y - 18);
  // Stars
  px(ctx, x - 4, y - 26, 2, 2, '#FFCA28');
  px(ctx, x + 3, y - 24, 2, 2, '#FFCA28');
  px(ctx, x - 1, y - 22, 1, 1, '#FFFFFF');
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

export function drawFurniture(
  ctx: CanvasRenderingContext2D,
  type: FurnitureType,
  col: number,
  row: number,
  tick: number,
): void {
  switch (type) {
    case 'desk': return drawDesk(ctx, col, row, tick);
    case 'chair': return drawChair(ctx, col, row);
    case 'monitor': return drawMonitor(ctx, col, row, tick);
    case 'keyboard': return; // drawn as part of desk
    case 'big_desk': return drawBigDesk(ctx, col, row, tick);
    case 'floor_window': return drawFloorWindow(ctx, col, row, tick);
    case 'coffee_machine': return drawCoffeeMachine(ctx, col, row, tick);
    case 'snack_shelf': return drawSnackShelf(ctx, col, row);
    case 'water_cooler': return drawWaterCooler(ctx, col, row, tick);
    case 'small_table': return drawSmallTable(ctx, col, row);
    case 'round_table': return drawRoundTable(ctx, col, row);
    case 'long_table': return drawLongTable(ctx, col, row);
    case 'whiteboard_obj': return drawWhiteboard(ctx, col, row, tick);
    case 'bookshelf': return drawBookshelf(ctx, col, row);
    case 'reading_chair': return drawReadingChair(ctx, col, row);
    case 'sofa': return drawSofa(ctx, col, row);
    case 'coffee_table': return drawCoffeeTable(ctx, col, row);
    case 'server_rack': return drawServerRack(ctx, col, row, tick);
    case 'potted_plant': return drawPottedPlant(ctx, col, row, tick);
    case 'carpet': return drawCarpet(ctx, col, row);
    case 'wall_clock': return drawWallClock(ctx, col, row, tick);
    case 'poster': return drawPoster(ctx, col, row);
    case 'meeting_chair': return drawMeetingChair(ctx, col, row);
    case 'door_mat': return drawDoorMat(ctx, col, row);
  }
}
