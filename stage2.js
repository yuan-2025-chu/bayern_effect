// stage2.js

function startStage2(fragments) {
    console.log('第二幕开始，碎片数:', fragments.length);
    const cfg = CONFIG.stage2;
    
    // 按小图分组
    const fragmentsByImage = {};
    for (const frag of fragments) {
        if (!fragmentsByImage[frag.imageId]) {
            fragmentsByImage[frag.imageId] = [];
        }
        fragmentsByImage[frag.imageId].push(frag);
    }
    
    // 为每个碎片添加状态
    for (const frag of fragments) {
        frag.originalOffsetX = frag.offsetX;
        frag.originalOffsetY = frag.offsetY;
        frag.currentOffsetX = frag.offsetX;
        frag.currentOffsetY = frag.offsetY;
        frag.arcOffset = 0;
        frag.repaired = false;       // 是否已归位
        frag.waveActivated = false;
        frag.waveActivateTime = 0;
        frag.arcDirection = Math.random() > 0.5 ? 1 : -1;
        frag.opacity = 1;
        delete frag.dying;
        delete frag.spawnTime;
        delete frag.deathTime;
        delete frag.floatPhase;
        delete frag.floatSpeed;
    }
    
    // 每张小图自己的波源
    const imageWaveOrigins = {};
    for (const imgId in fragmentsByImage) {
        const group = fragmentsByImage[imgId];
        imageWaveOrigins[imgId] = { x: group[0].centerX, y: group[0].centerY };
    }
    
    let startTime = null;
    
    function getDist(frag) {
        const dx = frag.targetX - frag.centerX;
        const dy = frag.targetY - frag.centerY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
function update(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = (currentTime - startTime) / 1000;

    if (elapsed > cfg.duration) {
        // 兜底：强制替换为完整小图
        if (!window._replaced) {
            window._replaced = true;
            const layoutMap = {};
            for (const frag of fragments) {
                if (!layoutMap[frag.imageId]) {
                    layoutMap[frag.imageId] = {
                        image: frag.image,
                        centerX: frag.centerX,
                        centerY: frag.centerY,
                        targetX: frag.centerX - (frag.targetWidth * CONFIG.stage1.grid) / 2,
                        targetY: frag.centerY - (frag.targetHeight * CONFIG.stage1.grid) / 2,
                        targetWidth: frag.targetWidth * CONFIG.stage1.grid,
                        targetHeight: frag.targetHeight * CONFIG.stage1.grid,
                        rotation: frag.rotation,
                        opacity: 1,
                        currentOffsetX: 0,
                        currentOffsetY: 0,
                        arcOffset: 0,
                        srcX: 0,
                        srcY: 0,
                        srcWidth: frag.image.width,
                        srcHeight: frag.image.height,
                    };
                }
            }
            window.fragments = Object.values(layoutMap);
            console.log('第二幕结束，替换为完整小图');
        }
        if (typeof startStage3 === 'function') {
            startStage3(window.fragments);
        }
        return;
    }

    const wave3Start = 2 * cfg.waveInterval;
    const wave3Age = elapsed - wave3Start;

    // 波1 + 波2
    if (wave3Age <= 0) {
        for (const imgId in fragmentsByImage) {
            const group = fragmentsByImage[imgId];

            for (let w = 0; w < 2; w++) {
                const waveAge = elapsed - w * cfg.waveInterval;
                if (waveAge < 0) continue;
                const waveRadius = waveAge * cfg.waveSpeed;

                for (const frag of group) {
                    const dist = getDist(frag);
                    if (dist <= waveRadius && !frag[`hit${w}`]) {
                        frag[`hit${w}`] = true;
                        frag[`hitTime${w}`] = elapsed;
                    }
                    if (frag[`hit${w}`] && !frag[`done${w}`]) {
                        const age = elapsed - frag[`hitTime${w}`];
                        const shakeDuration = 0.3;
                        if (age < shakeDuration) {
                            const sp = age / shakeDuration;
                            const damping = Math.exp(-sp * 3);
                            const shake = Math.sin(sp * Math.PI * 3) * cfg.overshoot * 1.5 * damping;
                            frag.currentOffsetX = frag.originalOffsetX + shake * 0.6;
                            frag.currentOffsetY = frag.originalOffsetY + shake * 0.6;
                            frag.arcOffset = shake * 0.5;
                        } else {
                            frag.currentOffsetX = 0;
                            frag.currentOffsetY = 0;
                            frag.arcOffset = 0;
                            frag[`done${w}`] = true;
                        }
                    }
                }
            }
        }
    }

    // 波3：强制归位 + 替换
    if (wave3Age > 0 && !window._replaced) {
        const forceDuration = 0.15;

        for (const frag of fragments) {
            if (!frag.forceReset) {
                frag.forceReset = true;
                frag.resetStart = elapsed;
                frag.resetFromX = frag.currentOffsetX || frag.originalOffsetX || 0;
                frag.resetFromY = frag.currentOffsetY || frag.originalOffsetY || 0;
                frag.resetFromArc = frag.arcOffset || 0;
            }

            const age = elapsed - frag.resetStart;
            if (age < forceDuration) {
                const p = age / forceDuration;
                frag.currentOffsetX = frag.resetFromX * (1 - p);
                frag.currentOffsetY = frag.resetFromY * (1 - p);
                frag.arcOffset = frag.resetFromArc * (1 - p);
            }
        }

        // 波3完成，立刻替换
        if (wave3Age >= forceDuration) {
            window._replaced = true;
            const layoutMap = {};
            for (const frag of fragments) {
                if (!layoutMap[frag.imageId]) {
                    layoutMap[frag.imageId] = {
                        image: frag.image,
                        centerX: frag.centerX,
                        centerY: frag.centerY,
                        targetX: frag.centerX - (frag.targetWidth * CONFIG.stage1.grid) / 2,
                        targetY: frag.centerY - (frag.targetHeight * CONFIG.stage1.grid) / 2,
                        targetWidth: frag.targetWidth * CONFIG.stage1.grid,
                        targetHeight: frag.targetHeight * CONFIG.stage1.grid,
                        rotation: frag.rotation,
                        opacity: 1,
                        currentOffsetX: 0,
                        currentOffsetY: 0,
                        arcOffset: 0,
                        srcX: 0,
                        srcY: 0,
                        srcWidth: frag.image.width,
                        srcHeight: frag.image.height,
                    };
                }
            }
            window.fragments = Object.values(layoutMap);
            console.log('波3结束，替换为完整小图');
        }
    }

    requestAnimationFrame(update);
}

requestAnimationFrame(update);
}