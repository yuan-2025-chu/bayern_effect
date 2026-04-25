// main.js

const canvas = document.getElementById('myCanvas');
canvas.width = CONFIG.canvas.width;
canvas.height = CONFIG.canvas.height;
const ctx = canvas.getContext('2d');

window.fragments = [];

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.fillStyle = `rgba(26, 0, 16, ${1 - CONFIG.stage3.particleTrail})`;
    ctx.fillStyle = '#1a0010';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (const frag of window.fragments) {
        if (frag.opacity !== undefined && frag.opacity <= 0) continue;
        
        ctx.save();
        ctx.globalAlpha = frag.opacity !== undefined ? frag.opacity : 1;
        
        // 纯粒子
        if (frag.isParticle) {
            ctx.fillStyle = frag.color;
            ctx.shadowColor = frag.color;
            ctx.shadowBlur = frag.size * 2;
            ctx.beginPath();
            ctx.arc(frag.x, frag.y, frag.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            continue;
        }
        
        // 视频
        if (frag.isVideo && frag.videoElement) {
            ctx.drawImage(frag.videoElement, frag.x, frag.y, frag.width, frag.height);
            ctx.restore();
            continue;
        }
        
        // 图片/碎片
        const cx = frag.centerX || 0;
        const cy = frag.centerY || 0;
        ctx.translate(cx, cy);
        ctx.rotate((frag.rotation || 0) * Math.PI / 180);
        
        const dx = (frag.targetX - cx) + (frag.currentOffsetX || frag.offsetX || 0);
        const dy = (frag.targetY - cy) + (frag.currentOffsetY || frag.offsetY || 0) + (frag.arcOffset || 0);
        
        if (frag.image) {
            ctx.drawImage(
                frag.image,
                frag.srcX || 0, frag.srcY || 0,
                frag.srcWidth || frag.image.width, frag.srcHeight || frag.image.height,
                dx, dy,
                frag.targetWidth || frag.image.width, frag.targetHeight || frag.image.height
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