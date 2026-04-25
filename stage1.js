// stage1.js

function startStage1(imageList, layouts) {
    const grid = CONFIG.stage1.grid;
    const allSlots = generateFragmentSlots(layouts, grid);
    
    // 按小图分组
    const slotsByImage = {};
    for (let i = 0; i < layouts.length; i++) {
        slotsByImage[i] = { all: [], available: [] };
    }
    for (const slot of allSlots) {
        slotsByImage[slot.imageId].all.push(slot);
        slotsByImage[slot.imageId].available.push({ ...slot });
    }
    
    // 每张小图的微小延迟
    const imageDelays = {};
    for (let i = 0; i < layouts.length; i++) {
        imageDelays[i] = randomBetween(0, 0.3);
    }
    
    // 初始碎片
    window.fragments = [];
    for (let imgId = 0; imgId < layouts.length; imgId++) {
        const group = slotsByImage[imgId];
        const count = Math.floor(randomBetween(
            CONFIG.stage1.initialFragments.min,
            CONFIG.stage1.initialFragments.max
        ));
        const shuffled = [...group.available].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            const slot = shuffled[i];
            const idx = group.available.findIndex(s =>
                s.srcX === slot.srcX && s.srcY === slot.srcY
            );
            if (idx > -1) group.available.splice(idx, 1);
            
            window.fragments.push({
                ...slot,
                offsetX: randomBetween(CONFIG.stage1.offsetX.min, CONFIG.stage1.offsetX.max),
                offsetY: randomBetween(CONFIG.stage1.offsetY.min, CONFIG.stage1.offsetY.max),
                currentOffsetX: 0,
                currentOffsetY: 0,
                arcOffset: 0,
                opacity: 0,
                spawnTime: 0,
                dying: false,
                floatPhase: Math.random() * Math.PI * 2,
                floatSpeed: randomBetween(0.8, 1.2) * CONFIG.stage1.floatSpeed,
            });
        }
    }
    
    let startTime = null;
    
    function update(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = (currentTime - startTime) / 1000;
        
        if (elapsed > CONFIG.stage1.duration) {
            console.log('第一幕结束，碎片数:', window.fragments.length);
            // ========== 第二幕接口 ==========
            if (typeof startStage2 === 'function') {
                startStage2(window.fragments);
            }
            return;
        }
        
        // 每张小图独立更新
        for (let imgId = 0; imgId < layouts.length; imgId++) {
            const group = slotsByImage[imgId];
            const adjustedElapsed = Math.max(0, elapsed - imageDelays[imgId]);
            const targetTotal = getTargetFragmentCount(adjustedElapsed, CONFIG.stage1.waves);
            const clampedTarget = Math.min(targetTotal, group.all.length);
            
            const currentFrags = window.fragments.filter(f => f.imageId === imgId);
            const aliveCount = currentFrags.filter(f => !f.dying).length;
            
            // 增加碎片
            if (clampedTarget > aliveCount && group.available.length > 0) {
                const toAdd = Math.min(clampedTarget - aliveCount, group.available.length);
                const shuffled = [...group.available].sort(() => Math.random() - 0.5);
                
                for (let i = 0; i < toAdd; i++) {
                    const slot = shuffled[i];
                    const idx = group.available.findIndex(s =>
                        s.srcX === slot.srcX && s.srcY === slot.srcY
                    );
                    if (idx > -1) group.available.splice(idx, 1);
                    
                    window.fragments.push({
                        ...slot,
                        offsetX: randomBetween(CONFIG.stage1.offsetX.min, CONFIG.stage1.offsetX.max),
                        offsetY: randomBetween(CONFIG.stage1.offsetY.min, CONFIG.stage1.offsetY.max),
                        currentOffsetX: 0,
                        currentOffsetY: 0,
                        arcOffset: 0,
                        opacity: 0,
                        spawnTime: elapsed,
                        dying: false,
                        floatPhase: Math.random() * Math.PI * 2,
                        floatSpeed: randomBetween(0.8, 1.2) * CONFIG.stage1.floatSpeed,
                    });
                }
            }
            
            // 减少碎片
            if (clampedTarget < aliveCount) {
                const toRemove = aliveCount - clampedTarget;
                const notDying = currentFrags.filter(f => !f.dying);
                const shuffled = notDying.sort(() => Math.random() - 0.5);
                
                for (let i = 0; i < Math.min(toRemove, shuffled.length); i++) {
                    shuffled[i].dying = true;
                    shuffled[i].deathTime = elapsed;
                }
            }
        }
        
        // 更新透明度
        for (const frag of window.fragments) {
            const age = elapsed - frag.spawnTime;
            if (age < CONFIG.stage1.flashDuration && !frag.dying) {
                frag.opacity = Math.min(1, age / CONFIG.stage1.flashDuration);
            } else if (!frag.dying) {
                frag.opacity = 1;
            }
            if (frag.dying) {
                const deathAge = elapsed - frag.deathTime;
                frag.opacity = Math.max(0, 1 - deathAge / CONFIG.stage1.deathDuration);
                //frag.opacity = Math.max(0, 1 - deathAge / 0.3);
            }
        }
        
        // 清理消失的碎片
        window.fragments = window.fragments.filter(frag => {
            if (frag.dying && frag.opacity <= 0) {
                const group = slotsByImage[frag.imageId];
                const alreadyThere = group.available.find(s =>
                    s.srcX === frag.srcX && s.srcY === frag.srcY
                );
                if (!alreadyThere) {
                    group.available.push({
                        imageId: frag.imageId,
                        image: frag.image,
                        srcX: frag.srcX,
                        srcY: frag.srcY,
                        srcWidth: frag.srcWidth,
                        srcHeight: frag.srcHeight,
                        targetX: frag.targetX,
                        targetY: frag.targetY,
                        targetWidth: frag.targetWidth,
                        targetHeight: frag.targetHeight,
                        centerX: frag.centerX,
                        centerY: frag.centerY,
                        rotation: frag.rotation,
                    });
                }
                return false;
            }
            return true;
        });
        
        requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
}