// stage4.js

function startStage4(particles) {
    console.log('第四幕开始，粒子数:', particles.length);
    
    const cfg = CONFIG.stage4;
    const canvasW = CONFIG.canvas.width;
    const canvasH = CONFIG.canvas.height;
    
    const topCenterX = canvasW / 2;
    const topCenterY = canvasH * cfg.topPosition;
    const gatherWidth = canvasW * cfg.gatherWidth;

    window._waveInit = false;
    window._rushInit = false;
    
    for (const p of particles) {
        p.baseX = p.x;
        p.baseY = p.y;
        p.speedX = randomBetween(-30, 30);
        p.speedY = randomBetween(-30, 30);
        p.randomTimer = randomBetween(0, 1);
        p.randomDir = Math.random() * Math.PI * 2;
        p.targetTopX = topCenterX + randomBetween(-gatherWidth / 2, gatherWidth / 2);
        p.targetTopY = topCenterY + randomBetween(-30, 30);
        p.startRushX = 0;
        p.startRushY = 0;
    }
    
    let startTime = null;
    
    function update(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = (currentTime - startTime) / 1000;
        
        if (elapsed > cfg.duration) {
            window.fragments = particles;
            console.log('第四幕结束，粒子冲出屏幕');
            if (typeof startStage5 === 'function') {
                startStage5(particles);
            }
            return;
        }
        
        // A段：随机跳动
        if (elapsed < cfg.phaseA) {
            for (const p of particles) {
                p.randomTimer -= 0.016;
                if (p.randomTimer <= 0) {
                    p.randomTimer = randomBetween(0.3, 0.8);
                    p.randomDir = Math.random() * Math.PI * 2;
                    p.speedX = Math.cos(p.randomDir) * randomBetween(30, 80);
                    p.speedY = Math.sin(p.randomDir) * randomBetween(30, 80);
                }
                p.x += p.speedX * 0.016;
                p.y += p.speedY * 0.016;
                
                if (p.x < 0) { p.x = 0; p.speedX *= -1; }
                if (p.x > canvasW) { p.x = canvasW; p.speedX *= -1; }
                if (p.y < 0) { p.y = 0; p.speedY *= -1; }
                if (p.y > canvasH) { p.y = canvasH; p.speedY *= -1; }
                
                p.baseX = p.x;
                p.baseY = p.y;
            }
        }
        
        // B段：波浪涌动
        if (elapsed >= cfg.phaseA && elapsed < cfg.phaseB) {
            const waveTime = elapsed - cfg.phaseA;
            
            if (!window._waveInit) {
                window._waveInit = true;
                for (const p of particles) {
                    p.waveBaseX = p.x;
                    p.waveBaseY = p.y;
                    p.wavePhase = p.waveBaseX * 0.01;
                }
            }
            
            for (const p of particles) {
                const wave = Math.sin(p.wavePhase - waveTime * cfg.waveFrequency.phase) * cfg.waveAmplitude.phase;
                p.x = p.waveBaseX;
                p.y = p.waveBaseY + wave;
            }
        }
        // C段：重力坠落
        if (elapsed >= cfg.phaseB && elapsed < cfg.phaseC) {
            const fallTime = elapsed - cfg.phaseB;
            
            if (!window._fallInit) {
                window._fallInit = true;
                for (const p of particles) {
                    p.fallStartY = p.y;
                    p.vy = 0;
                    p.size = p.size || randomBetween(2, 5); // 确保有尺寸
                }
            }
            
            const gravity = 4500; // 重力加速度 px/s²
            
            for (const p of particles) {
                p.vy += gravity * 0.016;
                // 大粒子阻力小，掉更快
                const sizeFactor = (p.size || 3) / 3;
                p.y += p.vy * 0.016 * sizeFactor;
                
                // 落到底部停住
                if (p.y >= canvasH - 10) {
                    p.y = canvasH - randomBetween(5, 15);
                    p.vy = 0;
                }
            }
        }
        
        // D段：分批冲向顶部
        if (elapsed >= cfg.phaseC) {
            const rushTime = elapsed - cfg.phaseC;
            const rushDuration = cfg.duration - cfg.phaseC;
            
            // 随机给每个粒子分配不同的起飞时间
        if (!window._rushInit) {
            window._rushInit = true;
            for (const p of particles) {
                // 10%的粒子延迟为0，立刻起飞
                if (Math.random() < 0.02) {
                    p.rushDelay = 0;
                } else {
                    p.rushDelay = randomBetween(0.2, rushDuration * 0.6);
                }
                p.rushStarted = false;
                p.startRushX = p.x;
                p.startRushY = p.y;
                p.endX = canvasW / 2 + randomBetween(-30, 30);
                p.endY = randomBetween(-150, -80);
                p.ctrlX = (p.startRushX + p.endX) / 2;
                p.ctrlY = Math.max(p.startRushY, p.endY) + randomBetween(80, 200);
            }
        }
            
            for (const p of particles) {
                if (rushTime < p.rushDelay) continue; 

                if (!p.rushStarted) {
                    p.rushStarted = true;
                    p.rushStartTime = rushTime;
                    p.rushStartX = p.x;
                    p.rushStartY = p.y;
                }
                
                const localTime = rushTime - p.rushStartTime;
                const localDuration = (rushDuration - p.rushDelay) * 0.4;
                const t = Math.min(1, localTime / localDuration);
                const eased = t * t;
                
                const u = 1 - eased;
                p.x = u * u * p.rushStartX + 2 * u * eased * p.ctrlX + eased * eased * p.endX;
                p.y = u * u * p.rushStartY + 2 * u * eased * p.ctrlY + eased * eased * p.endY;
            }
        }
        
        window.fragments = particles;
        requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
}