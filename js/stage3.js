// stage3.js

function startStage3(fragments) {
    //console.log('第三幕开始，小图数:', fragments.length);
    console.log('第三幕开始，小图数:', fragments.length, '第一个:', fragments[0]);
    console.log('stage3配置:', CONFIG.stage3);
    const cfg = CONFIG.stage3;
    const allParticles = [];
    const allFragments = [];
    
    // 为每张小图重新切成碎片
    for (const layout of fragments) {
        const grid = cfg.grid;
        const fragW = layout.targetWidth / grid;
        const fragH = layout.targetHeight / grid;
        const srcW = layout.srcWidth / grid;
        const srcH = layout.srcHeight / grid;
        
        for (let row = 0; row < grid; row++) {
            for (let col = 0; col < grid; col++) {
                const localX = (col + 0.5) * fragW - layout.targetWidth / 2;
                const localY = (row + 0.5) * fragH - layout.targetHeight / 2;
                
                const angle = Math.random() * Math.PI * 2;
                const distance = randomBetween(cfg.flyDistance.min, cfg.flyDistance.max);
                
                allFragments.push({
                    image: layout.image,
                    srcX: col * srcW,
                    srcY: row * srcH,
                    srcWidth: srcW,
                    srcHeight: srcH,
                    targetX: layout.centerX + localX,
                    targetY: layout.centerY + localY,
                    targetWidth: fragW,
                    targetHeight: fragH,
                    centerX: layout.centerX,
                    centerY: layout.centerY,
                    rotation: layout.rotation,
                    startX: layout.centerX + localX,
                    startY: layout.centerY + localY,
                    flyX: Math.cos(angle) * distance,
                    flyY: Math.sin(angle) * distance,
                    opacity: 1,
                    scale: 1,
                    z: (Math.random() - 0.5) * 80,
                });
            }
        }
    }
    
    let startTime = null;
    
    function update(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = (currentTime - startTime) / 1000;
        
        if (elapsed > cfg.duration) {
            window.fragments = allParticles;
            console.log('第三幕结束，粒子数:', allParticles.length);
            if (typeof startStage4 === 'function') {
                startStage4(allParticles);
            }
            return;
        }
        
        const progress = elapsed / cfg.duration;
        const displayList = [];
        
        for (const frag of allFragments) {
            const flyProgress = easeOut(progress);
            const currentX = frag.startX + frag.flyX * flyProgress;
            const currentY = frag.startY + frag.flyY * flyProgress;
            const scale = 1 - progress * cfg.fragmentShrink;
            
            const particleRate = progress < cfg.particleStartRatio
                ? 0
                : (progress - cfg.particleStartRatio) / (1 - cfg.particleStartRatio);
            
            // 碎片本体
            if (particleRate < 1) {
                displayList.push({
                    ...frag,
                    targetX: currentX,
                    targetY: currentY,
                    targetWidth: frag.targetWidth * scale,
                    targetHeight: frag.targetHeight * scale,
                    opacity: 1 - particleRate,
                    arcOffset: 0,
                    currentOffsetX: 0,
                    currentOffsetY: 0,
                    isFragment: true,
                    z: (Math.random() - 0.5) * 80,
                });
            }
            
            // 释放粒子
            if (particleRate > 0 && Math.random() < particleRate * cfg.particleSpawnRate) {
                const px = currentX + randomBetween(-frag.targetWidth / 2, frag.targetWidth / 2);
                const py = currentY + randomBetween(-frag.targetHeight / 2, frag.targetHeight / 2);
                
                allParticles.push({
                    x: px,
                    y: py,
                    vx: randomBetween(cfg.particleSpeedX.min, cfg.particleSpeedX.max),
                    vy: randomBetween(cfg.particleSpeedY.min, cfg.particleSpeedY.max),
                    size: randomBetween(cfg.particleSize.min, cfg.particleSize.max),
                    color: sampleColor(cfg),
                    opacity: randomBetween(cfg.particleOpacity.min, cfg.particleOpacity.max),
                    life: randomBetween(cfg.particleLife.min, cfg.particleLife.max),
                    birthTime: elapsed,
                    isParticle: true,
                    z: (Math.random() - 0.5) * 200,
                });
            }
        }
        
        // 更新已有粒子
        for (const p of allParticles) {
            p.x += p.vx * 0.016;
            p.y += p.vy * 0.016;
            p.opacity -= cfg.particleFadeRate;
        }
        
        window.fragments = [...displayList, ...allParticles.filter(p => p.opacity > 0)];
        requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
}

function easeOut(t) {
    return 1 - Math.pow(1 - t, 2);
}

function sampleColor(cfg) {
    const palette = cfg.particleColors;
    return palette[Math.floor(Math.random() * palette.length)];
}