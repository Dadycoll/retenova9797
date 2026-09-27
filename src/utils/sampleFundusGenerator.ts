/**
 * Generates realistic SVG/Canvas fundus photography representations as data URLs
 * for rapid demonstration, testing, and research prototyping.
 */

export interface FundusGenerationOptions {
  type: 'normal' | 'mild_npdr' | 'moderate_npdr' | 'severe_npdr' | 'poor_glare';
  eye: 'left' | 'right';
  resolution?: number;
}

export function generateFundusDataUrl(options: FundusGenerationOptions): string {
  const size = options.resolution || 384;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.44;

  // Background is black (fundus camera viewport)
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, size, size);

  // Retinal circle mask
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  if (options.type === 'poor_glare') {
    // Poor quality fundus with excessive flare and blur
    const radGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, radius);
    radGrad.addColorStop(0, '#e58040');
    radGrad.addColorStop(0.5, '#7a2208');
    radGrad.addColorStop(1, '#1a0502');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, size, size);

    // Blinding white-cyan glare spot
    const glare = ctx.createRadialGradient(cx + 40, cy - 30, 5, cx + 40, cy - 30, radius * 0.8);
    glare.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    glare.addColorStop(0.3, 'rgba(240, 248, 255, 0.6)');
    glare.addColorStop(1, 'rgba(200, 220, 255, 0)');
    ctx.fillStyle = glare;
    ctx.fillRect(0, 0, size, size);

    ctx.restore();
    return canvas.toDataURL('image/jpeg', 0.82);
  }

  // Base orange-red retinal background
  const retinaGrad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
  retinaGrad.addColorStop(0, '#c74418');
  retinaGrad.addColorStop(0.6, '#9e2d11');
  retinaGrad.addColorStop(0.9, '#6d1808');
  retinaGrad.addColorStop(1, '#350a04');
  ctx.fillStyle = retinaGrad;
  ctx.fillRect(0, 0, size, size);

  // Choroidal background texture
  for (let i = 0; i < 45; i++) {
    ctx.beginPath();
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius * 0.85;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    ctx.arc(px, py, Math.random() * 14 + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(120, 25, 10, 0.12)';
    ctx.fill();
  }

  // Optic Disc position:
  // For Left eye: Optic disc is nasal (towards right side of image), macula is temporal (left)
  // For Right eye: Optic disc is nasal (towards left side of image), macula is temporal (right)
  const isLeft = options.eye === 'left';
  const discX = isLeft ? cx + radius * 0.42 : cx - radius * 0.42;
  const discY = cy - radius * 0.05;
  const discRadius = size * 0.085;

  // Draw Optic Disc
  const discGrad = ctx.createRadialGradient(discX, discY, 3, discX, discY, discRadius);
  discGrad.addColorStop(0, '#fff4cc');
  discGrad.addColorStop(0.65, '#f5ba78');
  discGrad.addColorStop(0.9, '#d9823e');
  discGrad.addColorStop(1, '#aa4c1e');
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.arc(discX, discY, discRadius, 0, Math.PI * 2);
  ctx.fill();

  // Optic Cup (physiologic cup)
  ctx.fillStyle = '#fffae6';
  ctx.beginPath();
  ctx.arc(discX, discY, discRadius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Macula and Fovea position
  const maculaX = isLeft ? cx - radius * 0.28 : cx + radius * 0.28;
  const maculaY = cy + radius * 0.04;
  const maculaRadius = size * 0.12;

  const maculaGrad = ctx.createRadialGradient(maculaX, maculaY, 2, maculaX, maculaY, maculaRadius);
  maculaGrad.addColorStop(0, '#420d04');
  maculaGrad.addColorStop(0.4, '#5e1608');
  maculaGrad.addColorStop(0.85, 'rgba(120, 30, 10, 0.4)');
  maculaGrad.addColorStop(1, 'rgba(120, 30, 10, 0)');
  ctx.fillStyle = maculaGrad;
  ctx.beginPath();
  ctx.arc(maculaX, maculaY, maculaRadius, 0, Math.PI * 2);
  ctx.fill();

  // Foveal reflex
  ctx.fillStyle = 'rgba(255, 230, 200, 0.45)';
  ctx.beginPath();
  ctx.arc(maculaX, maculaY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Retinal Blood Vessels (Arcades originating from optic disc)
  const drawVesselTree = (signY: number, mainAngle: number, color: string, width: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(discX, discY);

    const cp1x = discX + (isLeft ? -radius * 0.25 : radius * 0.25);
    const cp1y = discY + signY * radius * 0.45;
    const endX = maculaX + (isLeft ? -radius * 0.2 : radius * 0.2);
    const endY = maculaY + signY * radius * 0.48;

    ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
    ctx.stroke();

    // Secondary branches
    ctx.lineWidth = width * 0.6;
    ctx.beginPath();
    ctx.moveTo((discX + cp1x) / 2, (discY + cp1y) / 2);
    ctx.quadraticCurveTo(cp1x + (isLeft ? -30 : 30), cp1y - signY * 20, endX + (isLeft ? -40 : 40), endY + signY * 20);
    ctx.stroke();

    // Nasal vessels
    ctx.lineWidth = width * 0.55;
    ctx.beginPath();
    ctx.moveTo(discX, discY);
    const nasalEndX = discX + (isLeft ? radius * 0.35 : -radius * 0.35);
    const nasalEndY = discY + signY * radius * 0.3;
    ctx.quadraticCurveTo(discX + (isLeft ? 25 : -25), discY + signY * 35, nasalEndX, nasalEndY);
    ctx.stroke();
  };

  // Superior and Inferior Temporal and Nasal Arterioles (lighter red)
  drawVesselTree(-1, 0, '#9e1c10', 3.5);
  drawVesselTree(1, 0, '#9e1c10', 3.5);
  // Venules (deeper purplish red, thicker)
  drawVesselTree(-0.92, 0, '#590e0b', 5.0);
  drawVesselTree(0.92, 0, '#590e0b', 5.0);

  // Add pathological features based on type
  if (options.type === 'mild_npdr') {
    // 3-5 Microaneurysms (tiny sharp red dots)
    const maLocations = [
      { x: maculaX + (isLeft ? -35 : 35), y: maculaY - 25 },
      { x: maculaX + (isLeft ? -50 : 50), y: maculaY + 30 },
      { x: discX + (isLeft ? -45 : 45), y: discY + 45 },
      { x: cx, y: cy - 40 }
    ];
    for (const pos of maLocations) {
      ctx.fillStyle = '#610502';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (options.type === 'moderate_npdr') {
    // Multiple microaneurysms, dot-blot hemorrhages, and a small cluster of hard exudates
    const maList = [
      { x: maculaX + (isLeft ? -30 : 30), y: maculaY - 30 },
      { x: maculaX + (isLeft ? -45 : 45), y: maculaY + 35 },
      { x: cx - 20, y: cy + 30 },
      { x: discX + (isLeft ? -60 : 60), y: discY - 40 },
      { x: maculaX + (isLeft ? 25 : -25), y: maculaY + 40 },
      { x: cx + 15, y: cy - 50 }
    ];
    for (const pos of maList) {
      ctx.fillStyle = '#5c0603';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dot and blot hemorrhages
    const hemList = [
      { x: maculaX + (isLeft ? -70 : 70), y: maculaY - 15, rx: 6, ry: 4 },
      { x: cx + (isLeft ? -10 : 10), y: cy + 55, rx: 5, ry: 5 },
      { x: discX + (isLeft ? -35 : 35), y: discY + 60, rx: 7, ry: 3 }
    ];
    for (const h of hemList) {
      ctx.fillStyle = '#420402';
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, h.rx, h.ry, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hard Exudates (bright yellowish lipid deposits)
    const exudates = [
      { x: maculaX + (isLeft ? -25 : 25), y: maculaY - 50 },
      { x: maculaX + (isLeft ? -30 : 30), y: maculaY - 55 },
      { x: maculaX + (isLeft ? -20 : 20), y: maculaY - 48 },
      { x: maculaX + (isLeft ? -35 : 35), y: maculaY - 46 }
    ];
    for (const ex of exudates) {
      ctx.fillStyle = '#fff4a3';
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (options.type === 'severe_npdr') {
    // Extensive hemorrhages in 4 quadrants, cotton wool patches, venous beading, hard exudate rings
    for (let i = 0; i < 18; i++) {
      const hx = cx + (Math.random() - 0.5) * radius * 1.3;
      const hy = cy + (Math.random() - 0.5) * radius * 1.3;
      ctx.fillStyle = '#3b0301';
      ctx.beginPath();
      ctx.ellipse(hx, hy, Math.random() * 8 + 4, Math.random() * 5 + 3, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Hard exudate ring around macula
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const exX = maculaX + Math.cos(angle) * (maculaRadius * 0.95);
      const exY = maculaY + Math.sin(angle) * (maculaRadius * 0.95);
      ctx.fillStyle = '#fff6b0';
      ctx.beginPath();
      ctx.arc(exX, exY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cotton wool spot (fluffy white/grey patch)
    const cwp = ctx.createRadialGradient(cx + 20, cy - 60, 2, cx + 20, cy - 60, 18);
    cwp.addColorStop(0, 'rgba(235, 240, 245, 0.7)');
    cwp.addColorStop(0.7, 'rgba(220, 225, 230, 0.25)');
    cwp.addColorStop(1, 'rgba(200, 200, 200, 0)');
    ctx.fillStyle = cwp;
    ctx.beginPath();
    ctx.arc(cx + 20, cy - 60, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vignette and outer circular border
  ctx.restore();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  return canvas.toDataURL('image/jpeg', 0.82);
}
