/**
 * Browser-side face makeup using MediaPipe FaceLandmarker (WASM, no API key).
 * Singleton pattern — the model loads once from CDN and is reused across calls.
 */
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let _landmarker = null;
let _initPromise = null;

function loadLandmarker() {
  if (_landmarker) return Promise.resolve(_landmarker);
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
    );
    _landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      },
      runningMode: "IMAGE",
      numFaces: 1,
    });
    return _landmarker;
  })();
  return _initPromise;
}

// ── Landmark index sets (MediaPipe 478-point Face Landmarker model) ──────────
// Outer lip contour (closed polygon, clockwise)
const LIPS = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146];
// Upper lash line — two eyes (used for eye shadow)
const R_EYE = [33, 246, 161, 160, 159, 158, 157, 173, 133];
const L_EYE = [263, 466, 388, 387, 386, 385, 384, 398, 362];
// Cheekbone clusters (one per side)
const R_CHEEK = [50, 101, 116, 117, 118, 119, 100];
const L_CHEEK = [280, 330, 345, 346, 347, 348, 329];

// ── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const c = hex.replace("#", "");
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

function pt(lms, i, w, h) {
  return [lms[i].x * w, lms[i].y * h];
}

function avgPts(lms, idxs, w, h) {
  const pts = idxs.map((i) => pt(lms, i, w, h));
  return [
    pts.reduce((s, p) => s + p[0], 0) / pts.length,
    pts.reduce((s, p) => s + p[1], 0) / pts.length,
  ];
}

// ── Drawing primitives ───────────────────────────────────────────────────────

function drawLips(ctx, lms, w, h, hex) {
  const [r, g, b] = hexToRgb(hex);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.beginPath();
  const [x0, y0] = pt(lms, LIPS[0], w, h);
  ctx.moveTo(x0, y0);
  for (let i = 1; i < LIPS.length; i++) {
    const [x, y] = pt(lms, LIPS[i], w, h);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawEyeShadow(ctx, lms, w, h, hex) {
  const [r, g, b] = hexToRgb(hex);
  for (const indices of [R_EYE, L_EYE]) {
    const pts = indices.map((i) => pt(lms, i, w, h));
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2;
    const rx = ((maxX - minX) / 2) * 1.1;
    const eyeH = maxY - minY;
    // Shadow ellipse centred just above the lash line, extending upward
    const cy = minY + eyeH * 0.15;
    const ry = eyeH + rx * 0.55;

    ctx.save();
    ctx.filter = "blur(3px)";
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.38;
    const grad = ctx.createRadialGradient(cx, minY, 0, cx, cy, ry * 0.9);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.85)`);
    grad.addColorStop(0.55, `rgba(${r},${g},${b},0.45)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawBlush(ctx, lms, w, h, hex) {
  const [r, g, b] = hexToRgb(hex);
  const radius = w * 0.11;
  for (const idxs of [R_CHEEK, L_CHEEK]) {
    const [cx, cy] = avgPts(lms, idxs, w, h);
    ctx.save();
    ctx.filter = "blur(10px)";
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.28;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.7)`);
    grad.addColorStop(0.55, `rgba(${r},${g},${b},0.35)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Applies makeup overlays on a photo using face landmark detection.
 * @param {string} photoDataUrl - Full data URL of the source image
 * @param {{ lips?: string, eyes?: string, cheeks?: string, face?: string }} colors - Hex colors per zone
 * @returns {Promise<string>} Data URL of the resulting image (JPEG)
 */
export async function applyMakeup(photoDataUrl, colors) {
  const img = await new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = photoDataUrl;
  });

  const canvas = document.createElement("canvas");
  const W = img.naturalWidth || img.width;
  const H = img.naturalHeight || img.height;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  try {
    const landmarker = await loadLandmarker();
    const { faceLandmarks } = landmarker.detect(img);
    const lms = faceLandmarks?.[0];

    if (!lms || lms.length < 400) {
      console.warn("No face landmarks detected — returning original image");
      return canvas.toDataURL("image/jpeg", 0.92);
    }

    if (colors.lips) drawLips(ctx, lms, W, H, colors.lips);
    if (colors.eyes) drawEyeShadow(ctx, lms, W, H, colors.eyes);
    if (colors.cheeks) drawBlush(ctx, lms, W, H, colors.cheeks);
  } catch (err) {
    console.warn("Face makeup overlay failed — returning original:", err);
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}
