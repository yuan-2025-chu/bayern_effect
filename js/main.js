// main.js 3D 完整版
const canvas = document.getElementById('myCanvas');
canvas.width = CONFIG.canvas.width;
canvas.height = CONFIG.canvas.height;
const ctx = canvas.getContext('2d');

// ====================== 【3D 透视系统 - 新加】 ======================
const CAMERA = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  fov: 1000
};

// 3D 坐标 → 屏幕坐标
function project3D(x, y, z) {
  const scale = CAMERA.fov / (CAMERA.fov + z);
  const sx = CAMERA.x + (x - CAMERA.x) * scale;
  const sy = CAMERA.y + (y - CAMERA.y) * scale;
  return { x: sx, y: sy, scale };
}
// ====================================================================

window.fragments = [];

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a0010';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 第六幕光效
    if (window._glowData) {
        const gd = window._glowData;
        
        // 金光炸裂
    if (gd.burstRadius > 0) {
        const gradient = ctx.createRadialGradient(gd.centerX, gd.centerY, 0, gd.centerX, gd.centerY, gd.burstRadius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');        // 纯白核心
        gradient.addColorStop(0.05, 'rgba(255, 220, 180, 1)');     // 极亮暖白
        gradient.addColorStop(0.15, 'rgba(255, 80, 20, 1)');       // 亮橙红
        gradient.addColorStop(0.3, 'rgba(220, 5, 45, 1)');         // 拜仁红
        gradient.addColorStop(0.6, 'rgba(180, 10, 30, 0.8)');      // 深红
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');              // 边缘全透明
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 叠加一层极亮白光，瞬间高对比
        const glowGrad = ctx.createRadialGradient(gd.centerX, gd.centerY, 0, gd.centerX, gd.centerY, gd.burstRadius * 0.4);
        glowGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        glowGrad.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
        
        // 暗沉后的微红
        if (gd.ambientAlpha > 0) {
            const ambientGrad = ctx.createRadialGradient(gd.centerX, gd.centerY, 0, gd.centerX, gd.centerY, gd.ambientRadius);
            ambientGrad.addColorStop(0, `rgba(180, 10, 30, ${gd.ambientAlpha * 0.15})`);
            ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = ambientGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    for (const frag of window.fragments) {
        if (frag.opacity !== undefined && frag.opacity <= 0) continue;
        
        ctx.save();
        ctx.globalAlpha = frag.opacity !== undefined ? frag.opacity : 1;

        // ====================== 3D 粒子 ======================
        if (frag.isParticle) {
            const p = project3D(frag.x, frag.y, frag.z || 0); // 3D 变换

            ctx.save();
            ctx.fillStyle = frag.color;
            ctx.shadowColor = frag.color;
            ctx.shadowBlur = frag.size * 2.2;
            ctx.globalCompositeOperation = 'screen';

            // 外层光晕
            ctx.beginPath();
            ctx.arc(p.x, p.y, frag.size * p.scale, 0, Math.PI * 2);
            ctx.fill();

            // 内核
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, frag.size * 0.25 * p.scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
            continue;
        }

        // 视频
        if (frag.isVideo && frag.videoElement) {
            const p = project3D(frag.x, frag.y, frag.z || 0);
            ctx.drawImage(
                frag.videoElement,
                p.x, p.y,
                frag.width * p.scale,
                frag.height * p.scale
            );
            ctx.restore();
            continue;
        }

        // 雨丝
        if (window._rainParticles) {
            for (const r of window._rainParticles) {
                const p = project3D(r.x, r.y, r.z || 0);
                ctx.save();
                ctx.globalAlpha = r.opacity;
                ctx.strokeStyle = r.color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(
                    p.x + Math.cos(r.angle) * r.length * p.scale,
                    p.y - Math.sin(r.angle) * r.length * p.scale
                );
                ctx.stroke();
                ctx.restore();
            }
        }

        // ====================== 3D 碎玻璃 ======================
        if (frag.isFragment) {
            const fw = frag.targetWidth || 30;
            const fh = frag.targetHeight || 30;
            const fx = frag.targetX || frag.x || 0;
            const fy = frag.targetY || frag.y || 0;

            // 3D 变换
            const p = project3D(fx, fy, frag.z || 0);
            const fcx = p.x;
            const fcy = p.y;
            const scale = p.scale;

            ctx.save();
            ctx.translate(fcx, fcy);
            ctx.rotate((frag.currentRotation || 0) * Math.PI / 180);

            if (frag.triPts && frag.image) {
                ctx.beginPath();
                ctx.moveTo(
                    (frag.triPts[0].x - frag.minTX - frag.triW / 2) * scale,
                    (frag.triPts[0].y - frag.minTY - frag.triH / 2) * scale
                );
                ctx.lineTo(
                    (frag.triPts[1].x - frag.minTX - frag.triW / 2) * scale,
                    (frag.triPts[1].y - frag.minTY - frag.triH / 2) * scale
                );
                ctx.lineTo(
                    (frag.triPts[2].x - frag.minTX - frag.triW / 2) * scale,
                    (frag.triPts[2].y - frag.minTY - frag.triH / 2) * scale
                );
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(
                    frag.image,
                    frag.srcX, frag.srcY,
                    frag.srcWidth, frag.srcHeight,
                    (-fw / 2) * scale,
                    (-fh / 2) * scale,
                    fw * scale,
                    fh * scale
                );

                if (frag.edgeGlow > 0) {
                    ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, frag.edgeGlow * 1.5)})`;
                    ctx.lineWidth = randomBetween(2, 4) * scale;
                    ctx.beginPath();
                    const g = frag.glowEdge || 0;
                    const nextG = (g + 1) % 3;
                    ctx.moveTo(
                        (frag.triPts[g].x - frag.minTX - frag.triW / 2) * scale,
                        (frag.triPts[g].y - frag.minTY - frag.triH / 2) * scale
                    );
                    ctx.lineTo(
                        (frag.triPts[nextG].x - frag.minTX - frag.triW / 2) * scale,
                        (frag.triPts[nextG].y - frag.minTY - frag.triH / 2) * scale
                    );
                    ctx.stroke();
                }
            } else if (frag.image) {
                ctx.drawImage(
                    frag.image,
                    frag.srcX, frag.srcY,
                    frag.srcWidth, frag.srcHeight,
                    (-fw / 2) * scale,
                    (-fh / 2) * scale,
                    fw * scale,
                    fh * scale
                );
            }

            ctx.restore();
            continue;
        }

        // ====================== 3D 普通图片/碎片 ======================
        const cx = frag.centerX || 0;
        const cy = frag.centerY || 0;
        const p = project3D(cx, cy, frag.z || 0);

        ctx.translate(p.x, p.y);
        ctx.rotate((frag.rotation || 0) * Math.PI / 180);

        const dx = (frag.targetX - cx) + (frag.currentOffsetX || frag.offsetX || 0);
        const dy = (frag.targetY - cy) + (frag.currentOffsetY || frag.offsetY || 0) + (frag.arcOffset || 0);

        if (frag.image) {
            ctx.drawImage(
                frag.image,
                frag.srcX || 0, frag.srcY || 0,
                frag.srcWidth || frag.image.width,
                frag.srcHeight || frag.image.height,
                dx * p.scale,
                dy * p.scale,
                (frag.targetWidth || frag.image.width) * p.scale,
                (frag.targetHeight || frag.image.height) * p.scale
            );
        }
        
        ctx.restore();
    }
    
    requestAnimationFrame(render);
}

async function start() {
    const images = await loadAllImages();
    if (images.length === 0) return;
    
    const layouts = calculateLayout(images);
    console.log(`布局完成，${layouts.length} 张小图`);
    
    startStage1(images, layouts);
}

render();
start();