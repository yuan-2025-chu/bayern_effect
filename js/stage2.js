// stage2.js

function startStage2(fragments, layouts) {
    console.log('第二幕开始，图片数:', fragments.length);
    
    const cfg = CONFIG.stage2;
    let startTime = null;
    let phaseInitC = false;
    let phaseInitD = false;
    
    function update(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = (currentTime - startTime) / 1000;
        
        // ========== C段：碎玻璃飞出 ==========
        if (elapsed < cfg.phaseC) {
            const progress = Math.min(1, elapsed / cfg.phaseC);
            const eased = 1 - Math.pow(1 - progress, 2);
            
            if (!phaseInitC) {
                phaseInitC = true;
                const fragments = [];
                
                for (const layout of layouts) {
                    const img = layout.image;
                    const imgW = img.width;
                    const imgH = img.height;
                    const displayW = layout.width;
                    const displayH = layout.height;
                    const cx = layout.x + displayW / 2;
                    const cy = layout.y + displayH / 2;
                    
                    const grid = cfg.fragmentGrid;
                    const cellW = displayW / grid;
                    const cellH = displayH / grid;
                    const srcCellW = imgW / grid;
                    const srcCellH = imgH / grid;
                    
                    const impactX = cx + randomBetween(-displayW * cfg.impactRange, displayW * cfg.impactRange);
                    const impactY = cy + randomBetween(-displayH * cfg.impactRange, displayH * cfg.impactRange);
                    
                    for (let row = 0; row < grid; row++) {
                        for (let col = 0; col < grid; col++) {
                            const cellCX = cx + (col + 0.5) * cellW - displayW / 2;
                            const cellCY = cy + (row + 0.5) * cellH - displayH / 2;
                            const diag = Math.random() > 0.5 ? 0 : 1;
                            
                            for (let tri = 0; tri < 2; tri++) {
                                const halfW = cellW / 2;
                                const halfH = cellH / 2;
                                let triPts;
                                
                                if (diag === 0) {
                                    triPts = tri === 0
                                        ? [{ x: -halfW, y: -halfH }, { x: halfW, y: halfH }, { x: -halfW, y: halfH }]
                                        : [{ x: -halfW, y: -halfH }, { x: halfW, y: -halfH }, { x: halfW, y: halfH }];
                                } else {
                                    triPts = tri === 0
                                        ? [{ x: -halfW, y: -halfH }, { x: halfW, y: -halfH }, { x: -halfW, y: halfH }]
                                        : [{ x: halfW, y: -halfH }, { x: halfW, y: halfH }, { x: -halfW, y: halfH }];
                                }
                                
                                const ddx = cellCX - impactX;
                                const ddy = cellCY - impactY;
                                const tDist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
                                const angle = Math.atan2(ddy, ddx);
                                const flyDist = randomBetween(cfg.flyDistance.min, cfg.flyDistance.max) + tDist * cfg.flyDistanceByDist;
                                
                                fragments.push({
                                    image: img,
                                    srcX: col * srcCellW, srcY: row * srcCellH,
                                    srcWidth: srcCellW, srcHeight: srcCellH,
                                    centerX: cx, centerY: cy, rotation: layout.rotation,
                                    startX: cellCX, startY: cellCY,
                                    targetX: cellCX, targetY: cellCY,
                                    targetWidth: cellW, targetHeight: cellH,
                                    flyX: Math.cos(angle) * flyDist,
                                    flyY: Math.sin(angle) * flyDist - randomBetween(cfg.flyUpBias.min, cfg.flyUpBias.max),
                                    rotateSpeed: randomBetween(cfg.rotateSpeed.min, cfg.rotateSpeed.max),
                                    currentRotation: 0, opacity: 1,
                                    isFragment: true,
                                    edgeGlow: randomBetween(cfg.edgeGlow.min, cfg.edgeGlow.max),
                                    glowEdge: Math.floor(Math.random() * 3),
                                    triPts, minTX: -halfW, minTY: -halfH,
                                    triW: cellW, triH: cellH,
                                    //z: (Math.random() - 0.5) * 400,
                                });
                            }
                        }
                    }
                }
                window.fragments = fragments;
                console.log('C段：碎玻璃飞出，碎片数:', fragments.length);
            }
            
            for (const frag of window.fragments) {
                if (frag.isFragment) {
                    frag.targetX = frag.startX + frag.flyX * eased;
                    frag.targetY = frag.startY + frag.flyY * eased;
                    frag.currentRotation = frag.rotateSpeed * eased;
                    frag.opacity = 1 - progress * cfg.flyFade;
                    frag.edgeGlow = (frag.edgeGlow || 0.9) * (1 - progress * cfg.glowFade);
                }
            }
        }
        
        // ========== D段：缩小消失 + 重生 + 雨丝 ==========
        if (elapsed >= cfg.phaseC) {
            const dElapsed = elapsed - cfg.phaseC;
            const dDuration = cfg.duration - cfg.phaseC;
            const progress = Math.min(1, dElapsed / dDuration);
            
            if (!phaseInitD) {
                phaseInitD = true;
                window._rainParticles = [];
                window._phaseDStage = 0;
            }
            
            // 雨丝
        if (window._rainParticles && window._rainParticles.length < cfg.rainCount) {
            for (let i = 0; i < cfg.rainSpawnPerFrame; i++) {
                    window._rainParticles.push({
                        x: randomBetween(-100, canvas.width + 100),
                        y: randomBetween(-300, canvas.height),
                        length: randomBetween(cfg.rainLength.min, cfg.rainLength.max),
                        speed: randomBetween(cfg.rainSpeed.min, cfg.rainSpeed.max),
                        angle: randomBetween(cfg.rainAngle.min, cfg.rainAngle.max) * Math.PI / 180,
                        opacity: randomBetween(cfg.rainOpacity.min, cfg.rainOpacity.max),
                        color: cfg.rainColors[Math.floor(Math.random() * cfg.rainColors.length)],
                        z: (Math.random() - 0.5) * 200,
                    });
                }
            }
            
            // 阶段1：碎玻璃缩小
            if (progress < cfg.shrinkEnd) {
                const shrink = 1 - progress / cfg.shrinkEnd;
                for (const frag of window.fragments) {
                    if (!frag.origWidth) frag.origWidth = frag.targetWidth;
                    if (!frag.origHeight) frag.origHeight = frag.targetHeight;
                    if (frag.origGlow === undefined) frag.origGlow = frag.edgeGlow;
                    frag.targetX = frag.scatterX || frag.targetX;
                    frag.targetY = frag.scatterY || frag.targetY;
                    frag.targetWidth = frag.origWidth * Math.max(cfg.shrinkMin, shrink);
                    frag.targetHeight = frag.origHeight * Math.max(cfg.shrinkMin, shrink);
                    frag.opacity = Math.max(cfg.shrinkMin, shrink);
                    frag.edgeGlow = frag.origGlow * shrink;
                }
            }
            
            // 阶段2：清除碎玻璃，初始化重生
            if (progress >= cfg.shrinkEnd && window._phaseDStage === 0) {
                window._phaseDStage = 1;
                for (const frag of window.fragments) {
                    if (!frag.origWidth) frag.origWidth = frag.targetWidth;
                    if (!frag.origHeight) frag.origHeight = frag.targetHeight;
                }
                
                const grid = cfg.rebirthGrid;
                const allSlots = generateFragmentSlots(layouts, grid);
                const slotsByImage = {};
                for (let i = 0; i < layouts.length; i++) {
                    slotsByImage[i] = { all: [], available: [] };
                }
                for (const slot of allSlots) {
                    slotsByImage[slot.imageId].all.push(slot);
                    slotsByImage[slot.imageId].available.push({ ...slot });
                }
                window._slotsByImage = slotsByImage;
                window._imageDelays = {};
                for (let i = 0; i < layouts.length; i++) {
                    window._imageDelays[i] = randomBetween(0, cfg.rebirthDelay);
                }
                window.fragments = [];
                window._rebirthStart = dElapsed;
            }
            
            // 阶段3：碎片重生
            if (progress >= cfg.shrinkEnd && progress < cfg.rebirthEnd) {
                const rebirthElapsed = dElapsed - window._rebirthStart;
                const rebirthDuration = dDuration * (cfg.rebirthEnd - cfg.shrinkEnd);
                const slotsByImage = window._slotsByImage;
                const imageDelays = window._imageDelays;
                
                for (let imgId = 0; imgId < layouts.length; imgId++) {
                    const group = slotsByImage[imgId];
                    const adjustedElapsed = Math.max(0, rebirthElapsed - imageDelays[imgId]);
                    const rebirthProgress = Math.min(1, adjustedElapsed / rebirthDuration);
                    const targetTotal = Math.floor(cfg.rebirthStartCount + rebirthProgress * (group.all.length - cfg.rebirthStartCount));
                    const clampedTarget = Math.min(targetTotal, group.all.length);
                    
                    const currentFrags = window.fragments.filter(f => f.imageId === imgId);
                    
                    if (clampedTarget > currentFrags.length && group.available.length > 0) {
                        const toAdd = Math.min(clampedTarget - currentFrags.length, group.available.length);
                        const shuffled = [...group.available].sort(() => Math.random() - 0.5);
                        for (let i = 0; i < toAdd; i++) {
                            const slot = shuffled[i];
                            const idx = group.available.findIndex(s => s.srcX === slot.srcX && s.srcY === slot.srcY);
                            if (idx > -1) group.available.splice(idx, 1);
                            window.fragments.push({
                                ...slot,
                                offsetX: 0, offsetY: 0,
                                currentOffsetX: randomBetween(cfg.rebirthOffset.min, cfg.rebirthOffset.max),
                                currentOffsetY: randomBetween(cfg.rebirthOffset.min, cfg.rebirthOffset.max),
                                arcOffset: 0, opacity: 0, spawnTime: rebirthElapsed,
                                floatPhase: Math.random() * Math.PI * 2,
                                floatSpeed: randomBetween(cfg.rebirthFloatSpeed.min, cfg.rebirthFloatSpeed.max),
                                scale: cfg.rebirthStartScale,
                                //z: (Math.random() - 0.5) * 200,
                            });
                        }
                    }
                }
                
                for (const frag of window.fragments) {
                    const age = rebirthElapsed - (frag.spawnTime || 0);
                    frag.opacity = age < cfg.rebirthFadeIn ? Math.min(1, age / cfg.rebirthFadeIn) : 1;
                    frag.scale = Math.min(1, cfg.rebirthStartScale + age / cfg.rebirthScaleDuration);
                    frag.currentOffsetX = Math.sin(rebirthElapsed * frag.floatSpeed + frag.floatPhase) * cfg.rebirthFloatAmp;
                    frag.currentOffsetY = Math.cos(rebirthElapsed * frag.floatSpeed + frag.floatPhase + 1) * cfg.rebirthFloatAmp;
                }
            }
            
            // 阶段4：替换完整小图
            if (progress >= cfg.rebirthEnd && !window._dReplaced) {
                window._dReplaced = true;
                const layoutMap = {};
                for (const layout of layouts) {
                    layoutMap[layout.id] = {
                        image: layout.image,
                        centerX: layout.x + layout.width / 2,
                        centerY: layout.y + layout.height / 2,
                        targetX: layout.x, targetY: layout.y,
                        targetWidth: layout.width, targetHeight: layout.height,
                        rotation: layout.rotation, opacity: 1,
                        currentOffsetX: 0, currentOffsetY: 0, arcOffset: 0,
                        srcX: 0, srcY: 0,
                        srcWidth: layout.image.width, srcHeight: layout.image.height,
                        isFullImage: true, imageId: layout.id,
                    };
                }
                window.fragments = Object.values(layoutMap);
                console.log('D段：重生完成');
                window._dCompleteTime = elapsed;
            }
            
            // 更新雨丝
if (window._rainParticles && window._rainParticles.length > 0) {
    const rainFade = progress >= cfg.rebirthEnd ? Math.max(0, 1 - (progress - cfg.rebirthEnd) / (1 - cfg.rebirthEnd)) : 1;
    for (const r of window._rainParticles) {
        r.x -= Math.cos(r.angle) * r.speed * 0.016;
        r.y += Math.sin(r.angle) * r.speed * 0.016;
        if (r.y > canvas.height + 50) { r.y = randomBetween(-100, -20); r.x = randomBetween(-50, canvas.width + 50); }
        if (r.x < -50) { r.x = canvas.width + randomBetween(20, 80); r.y = randomBetween(-100, canvas.height / 2); }
        r.opacity = r.opacity * rainFade;
    }
    if (progress >= 1.0) window._rainParticles = null;
}
            
            if (window._dCompleteTime && elapsed - window._dCompleteTime > cfg.finalPause) {
                console.log('第二幕结束');
                window._rainParticles = null;
                if (typeof startStage3 === 'function') startStage3(window.fragments);
                return;
            }
        }
        
        requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
}