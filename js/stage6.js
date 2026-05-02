// stage6.js

function startStage6(particles) {
    console.log('第六幕开始');
    
    const cfg = CONFIG.stage6;
    const canvasW = CONFIG.canvas.width;
    const canvasH = CONFIG.canvas.height;
    
    let videoElement = null;
    if (cfg.videoSrc) {
        videoElement = document.createElement('video');
        videoElement.src = cfg.videoSrc;
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.playsInline = true;
        videoElement.preload = 'auto';
        videoElement.play();
    }
    
    let startTime = null;
    let burstDone = false;
    let videoAdded = false;
    
    // 粒子初始化
    for (const p of particles) {
        p.opacity = 1;
        p.color = cfg.goldColors[Math.floor(Math.random() * cfg.goldColors.length)];
        p.size = randomBetween(cfg.particleSize.min, cfg.particleSize.max);
        p.baseSize = p.size;
        p.vy = 0;
        p.vx = 0;
        p.windPhase = Math.random() * Math.PI * 2;
        p.windFreq = randomBetween(cfg.windFreq.min, cfg.windFreq.max);
        p.windAmp = randomBetween(cfg.windAmp.min, cfg.windAmp.max);
        p.fallActive = false;
        p.startX = p.x;
        p.startY = p.y;
    }
    
    function update(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = (currentTime - startTime) / 1000;
        
        if (elapsed > cfg.duration) {
            window.fragments = particles;
            console.log('第六幕结束');
            if (typeof startStage7 === 'function') {
                startStage7(particles, videoElement);
            }
            return;
        }
        
        // 光效数据
        window._glowData = {
            phase: 'burst',
            elapsed: elapsed,
            centerX: canvasW / 2,
            centerY: canvasH / 2,
            burstDone: burstDone,
        };
        
        // 0 - 0.3s：金光炸裂
        if (elapsed < 1.5) {
            const burstProgress = elapsed / 0.3;
            window._glowData.burstRadius = burstProgress * Math.max(canvasW, canvasH) * 1.2;
            window._glowData.burstAlpha = 1 - burstProgress * 0.3;
        } else if (!burstDone) {
            burstDone = true;
        }
        
        // 0.3 - 1.0s：迅速暗沉
        if (elapsed >= 1.5 && elapsed < 2.5) {
            const fadeProgress = (elapsed - 1.5) / 1;
            window._glowData.ambientAlpha = 1 - fadeProgress;
            window._glowData.ambientRadius = canvasW * 0.6;
        } else if (elapsed >= 2.5) {
            window._glowData.ambientAlpha = 0;
        }
        
        // 粒子先开始（视频出现条件改为 >= 3.0）
        if (elapsed >= 2.5 && !window._rainScheduled) {
            window._rainScheduled = true;
            const remainingTime = cfg.duration - 2.5;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.fallDelay = randomBetween(0, remainingTime * 0.99);
                p.fallActive = false;
                p.fallStarted = false;
                p.finished = false;
            }
        }

        // 视频延迟0.5秒
        if (elapsed >= 3.8 && !videoAdded) {
            videoAdded = true;
            
            if (videoElement) {
                window.fragments.push({
                    isVideo: true,
                    videoElement: videoElement,
                    x: canvasW / 2 - cfg.videoWidth / 2,
                    y: canvasH / 2 - cfg.videoHeight / 2,
                    width: cfg.videoWidth,
                    height: cfg.videoHeight,
                    opacity: 0,
                });
            }
        }

        // 视频淡入
        if (videoAdded) {
            const videoFrag = window.fragments.find(f => f.isVideo);
            if (videoFrag) {
                videoFrag.opacity = Math.min(1, (elapsed - 3.0) / 0.4);
            }
        }
        
        // 金雨下落
        const gravity = cfg.gravity;
        const windStrength = cfg.windStrength;
        const windRatio = cfg.windRatio;

        // 计算剩余时长，随机分配粒子落下时间
        if (videoAdded && !window._rainScheduled) {
            window._rainScheduled = true;
            const remainingTime = cfg.duration - 0.5;
            const totalParticles = particles.length;
            
            for (let i = 0; i < totalParticles; i++) {
                const p = particles[i];
                p.fallDelay = randomBetween(0, remainingTime * 0.9);
                p.fallActive = false;
                p.fallStarted = false;
                p.finished = false;
            }
        }

        // 激活到时间的粒子，不设上限
        if (window._rainScheduled) {
            for (const p of particles) {
                if (!p.fallStarted && (elapsed - 2.5) >= p.fallDelay) {
                    p.fallActive = true;
                    p.fallStarted = true;
                    p.vy = randomBetween(cfg.fallSpeed.min, cfg.fallSpeed.max);
                    p.vx = 0;
                }
            }
        }

        // 下落运动
        for (const p of particles) {
            if (!p.fallActive || p.finished) continue;
            
            p.vy += gravity * 0.016;
            
            const sizeFactor = Math.max(0.1, 1 - p.baseSize / cfg.particleSize.max);
            const windForce = Math.sin(elapsed * p.windFreq + p.windPhase) * p.windAmp * windStrength * sizeFactor;
            p.vx = windForce * windRatio;
            
            p.x += p.vx * 0.016;
            p.y += p.vy * 0.016;
            
            if (p.y > canvasH + 20) {
                p.opacity = 0;
                p.finished = true;
            }
            
            p.size = p.baseSize * (0.85 + Math.sin(elapsed * 3 + p.windPhase) * 0.15);
        }

        const videoFrags = window.fragments.filter(f => f.isVideo);
        window.fragments = [...videoFrags, ...particles];
        //window.fragments = particles;
        requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
}