// ============================================================================
// Decoration Sprites — Walls, backgrounds, zone labels, night overlay
// ============================================================================

import { gridToScreen, TILE_W, TILE_H, MAP_OFFSET_X, MAP_OFFSET_Y } from '@/engine/isometric';
import { MAP_COLS, MAP_ROWS } from '@/office/layout';

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, inset = 0): void {
  ctx.beginPath();
  ctx.moveTo(x, y - TILE_H / 2 + inset);
  ctx.lineTo(x + TILE_W / 2 - inset, y);
  ctx.lineTo(x, y + TILE_H / 2 - inset);
  ctx.lineTo(x - TILE_W / 2 + inset, y);
  ctx.closePath();
}

// ---------------------------------------------------------------------------
// Background / Sky
// ---------------------------------------------------------------------------

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dayNightPhase: number,
): void {
  // Gradient sky with richer dusk/day transition
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  if (dayNightPhase < 0.3) {
    grad.addColorStop(0, '#7CB4D4');
    grad.addColorStop(0.65, '#9EC3D8');
    grad.addColorStop(1, '#B6CEDA');
  } else if (dayNightPhase < 0.6) {
    grad.addColorStop(0, '#D48A6A');
    grad.addColorStop(0.4, '#C69D73');
    grad.addColorStop(1, '#BBA78D');
  } else {
    grad.addColorStop(0, '#243247');
    grad.addColorStop(0.6, '#39485B');
    grad.addColorStop(1, '#4A5A66');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Horizon glow for depth
  const horizon = ctx.createLinearGradient(0, height * 0.2, 0, height * 0.72);
  horizon.addColorStop(0, 'rgba(255,255,255,0)');
  horizon.addColorStop(1, dayNightPhase > 0.5 ? 'rgba(120,160,255,0.1)' : 'rgba(255,210,140,0.14)');
  ctx.fillStyle = horizon;
  ctx.fillRect(0, 0, width, height);

  // Pixel cloud bands (deterministic, phase-shifted)
  const cloudShift = (dayNightPhase * 120) % width;
  ctx.fillStyle = dayNightPhase > 0.5 ? 'rgba(210,220,255,0.08)' : 'rgba(255,255,255,0.14)';
  for (let i = 0; i < 6; i++) {
    const cx = (i * 180 + cloudShift) % (width + 160) - 80;
    const cy = 38 + (i % 3) * 14;
    ctx.fillRect(cx, cy, 42, 6);
    ctx.fillRect(cx + 8, cy - 4, 30, 4);
    ctx.fillRect(cx + 14, cy + 6, 20, 3);
  }

  // Stars at night
  if (dayNightPhase > 0.5) {
    const alpha = Math.min(1, (dayNightPhase - 0.5) * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`;
    const stars = [
      [50, 20], [150, 35], [280, 15], [400, 40], [550, 25],
      [700, 30], [100, 55], [350, 50], [500, 45], [650, 55],
      [200, 60], [450, 20], [600, 50],
    ];
    for (const [sx, sy] of stars) {
      ctx.fillRect(sx, sy, 2, 2);
    }
  }
}

// ---------------------------------------------------------------------------
// Walls
// ---------------------------------------------------------------------------

export function drawWalls(ctx: CanvasRenderingContext2D): void {
  // Draw cleaner perimeter stroke like an architectural shell
  ctx.strokeStyle = '#55606A';
  ctx.lineWidth = 2.5;

  // Top-left wall edge
  const topLeft = gridToScreen({ col: 0, row: 0 });
  const topRight = gridToScreen({ col: MAP_COLS - 1, row: 0 });
  const bottomLeft = gridToScreen({ col: 0, row: MAP_ROWS - 1 });

  ctx.beginPath();
  ctx.moveTo(bottomLeft.x - TILE_W / 2, bottomLeft.y);
  ctx.lineTo(topLeft.x, topLeft.y - TILE_H / 2);
  ctx.lineTo(topRight.x + TILE_W / 2, topRight.y);
  ctx.stroke();

  // Subtle top rim highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bottomLeft.x - TILE_W / 2, bottomLeft.y - 2);
  ctx.lineTo(topLeft.x, topLeft.y - TILE_H / 2 - 2);
  ctx.lineTo(topRight.x + TILE_W / 2, topRight.y - 2);
  ctx.stroke();
}

export function drawDividerWall(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
): void {
  const { x, y } = gridToScreen({ col, row });
  const wallH = 18;

  // Top surface
  ctx.fillStyle = '#7F8B93';
  ctx.beginPath();
  ctx.moveTo(x, y - TILE_H / 2 - wallH);
  ctx.lineTo(x + TILE_W / 2, y - wallH);
  ctx.lineTo(x, y + TILE_H / 2 - wallH);
  ctx.lineTo(x - TILE_W / 2, y - wallH);
  ctx.closePath();
  ctx.fill();

  // Left face
  ctx.fillStyle = '#66737E';
  ctx.beginPath();
  ctx.moveTo(x - TILE_W / 2, y - wallH);
  ctx.lineTo(x, y + TILE_H / 2 - wallH);
  ctx.lineTo(x, y + TILE_H / 2);
  ctx.lineTo(x - TILE_W / 2, y);
  ctx.closePath();
  ctx.fill();

  // Right face
  ctx.fillStyle = '#54616D';
  ctx.beginPath();
  ctx.moveTo(x + TILE_W / 2, y - wallH);
  ctx.lineTo(x, y + TILE_H / 2 - wallH);
  ctx.lineTo(x, y + TILE_H / 2);
  ctx.lineTo(x + TILE_W / 2, y);
  ctx.closePath();
  ctx.fill();

  // Wall edge line
  ctx.strokeStyle = '#303A44';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - TILE_W / 2, y - wallH);
  ctx.lineTo(x, y + TILE_H / 2 - wallH);
  ctx.lineTo(x + TILE_W / 2, y - wallH);
  ctx.stroke();
}

export function drawRoomTint(
  ctx: CanvasRenderingContext2D,
  minCol: number,
  maxCol: number,
  minRow: number,
  maxRow: number,
  tint: string,
): void {
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const { x, y } = gridToScreen({ col, row });
      diamond(ctx, x, y, 1);
      ctx.fillStyle = tint;
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Zone Labels
// ---------------------------------------------------------------------------

export function drawZoneLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  emoji: string,
  col: number,
  row: number,
  alpha: number,
): void {
  const { x, y } = gridToScreen({ col, row });
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00000055';
  ctx.fillText(`${emoji} ${label}`, x + 1, y + TILE_H + 5);
  ctx.fillStyle = '#FFFFFF99';
  ctx.fillText(`${emoji} ${label}`, x, y + TILE_H + 4);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Night Overlay
// ---------------------------------------------------------------------------

export function drawNightOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dayNightPhase: number,
): void {
  if (dayNightPhase <= 0.3) return;
  const alpha = Math.min(0.35, (dayNightPhase - 0.3) * 0.5);
  ctx.fillStyle = `rgba(10, 10, 30, ${alpha})`;
  ctx.fillRect(0, 0, width, height);
}
