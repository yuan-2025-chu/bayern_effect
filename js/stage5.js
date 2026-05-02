// stage5.js

function startStage5(particles) {
    console.log('第五幕开始，粒子数:', particles.length);
    
    const cfg = CONFIG.stage5;
    const canvasW = CONFIG.canvas.width;
    const canvasH = CONFIG.canvas.height;
    
    // 粒子在画布上方外部均匀分布
    for (const p of particles) {
        p.startX = p.x; // 当前位置（画布外）
        p.startY = p.y;
        p.targetX = randomBetween(canvasW * 0.01, canvasW * 0.99); // 横向均匀分布
        p.targetY = randomBetween(-canvasH * 0.15, -30);            // 画布上方外部
        p.opacity = 1;
        p.size = p.size || randomBetween(1.5, 3);
    }
    
    let startTime = null;
    
    function update(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = (currentTime - startTime) / 1000;
        
        if (elapsed > cfg.duration) {
            for (const p of particles) {
                p.x = p.targetX;
                p.y = p.targetY;
                p.vx = 0;
                p.vy = 0;
            }
            window.fragments = particles;
            console.log('第五幕结束，粒子均匀分布在上部');
            if (typeof startStage6 === 'function') {
                startStage6(particles);
            }
            return;
        }
        
        const progress = elapsed / cfg.duration;
        const eased = 1 - Math.pow(1 - progress, 2);
        
        for (const p of particles) {
            p.x = p.startX + (p.targetX - p.startX) * eased;
            p.y = p.startY + (p.targetY - p.startY) * eased;
            p.opacity = Math.min(1, progress * 2);
            p.size = (p.size || 2) * (0.8 + progress * 0.2);
        }
        
        window.fragments = particles;
        requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
}