// stage1.js

function startStage1(imageList, layouts) {
    console.log('第一幕开始');
    
    const cfg = CONFIG.stage1;
    const grid = cfg.grid;
    const allSlots = generateFragmentSlots(layouts, grid);
    
    const slotsByImage = {};
    for (let i = 0; i < layouts.length; i++) {
        slotsByImage[i] = { all: [], available: [] };
    }
    for (const slot of allSlots) {
        slotsByImage[slot.imageId].all.push(slot);
        slotsByImage[slot.imageId].available.push({ ...slot });
    }
    
    const imageDelays = {};
    for (let i = 0; i < layouts.length; i++) {
        imageDelays[i] = randomBetween(0, 0.5);
    }
    
    window.fragments = [];
    for (let imgId = 0; imgId < layouts.length; imgId++) {
        const group = slotsByImage[imgId];
        const count = Math.floor(randomBetween(3, 8));
        const shuffled = [...group.available].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            const slot = shuffled[i];
            const idx = group.available.findIndex(s => s.srcX === slot.srcX && s.srcY === slot.srcY);
            if (idx > -1) group.available.splice(idx, 1);
            
            window.fragments.push({
                ...slot,
                offsetX: 0, offsetY: 0,
                currentOffsetX: randomBetween(-2, 2),
                currentOffsetY: randomBetween(-2, 2),
                arcOffset: 0, opacity: 0, spawnTime: 0, dying: false,
                floatPhase: Math.random() * Math.PI * 2,
                floatSpeed: randomBetween(0.3, 0.8),
                z: (Math.random() - 0.5) * 40,
            });
        }
    }
    
    let startTime = null;
    let phaseInitB = false;
    
    function update(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = (currentTime - startTime) / 1000;
        
        // A段：碎片慢慢生长
        if (elapsed < cfg.phaseA) {
            for (let imgId = 0; imgId < layouts.length; imgId++) {
                const group = slotsByImage[imgId];
                const adjustedElapsed = Math.max(0, elapsed - imageDelays[imgId]);
                const progress = Math.min(1, adjustedElapsed / (cfg.phaseA - imageDelays[imgId]));
                const targetTotal = Math.floor(3 + progress * (group.all.length - 3));
                const clampedTarget = Math.min(targetTotal, group.all.length);
                
                const currentFrags = window.fragments.filter(f => f.imageId === imgId);
                const aliveCount = currentFrags.filter(f => !f.dying).length;
                
                if (clampedTarget > aliveCount && group.available.length > 0) {
                    const toAdd = Math.min(clampedTarget - aliveCount, group.available.length);
                    const shuffled = [...group.available].sort(() => Math.random() - 0.5);
                    for (let i = 0; i < toAdd; i++) {
                        const slot = shuffled[i];
                        const idx = group.available.findIndex(s => s.srcX === slot.srcX && s.srcY === slot.srcY);
                        if (idx > -1) group.available.splice(idx, 1);
                        window.fragments.push({
                            ...slot,
                            offsetX: 0, offsetY: 0,
                            currentOffsetX: randomBetween(-3, 3),
                            currentOffsetY: randomBetween(-3, 3),
                            arcOffset: 0, opacity: 0, spawnTime: elapsed, dying: false,
                            floatPhase: Math.random() * Math.PI * 2,
                            floatSpeed: randomBetween(0.3, 0.8),
                            z: (Math.random() - 0.5) * 40,
                        });
                    }
                }
            }
            
            for (const frag of window.fragments) {
                const age = elapsed - frag.spawnTime;
                frag.opacity = age < 0.4 ? Math.min(1, age / 0.4) : 1;
                frag.currentOffsetX = Math.sin(elapsed * frag.floatSpeed + frag.floatPhase) * 2;
                frag.currentOffsetY = Math.cos(elapsed * frag.floatSpeed + frag.floatPhase + 1) * 2;
            }
        }
        
        // B段：波动 + 替换
        if (elapsed >= cfg.phaseA) {
            const bElapsed = elapsed - cfg.phaseA;
            const bDuration = cfg.duration - cfg.phaseA;
            const waveDuration = bDuration * 0.5;
            
            if (!phaseInitB) {
                phaseInitB = true;
                console.log('B段开始，碎片数:', window.fragments.length);
            }
            
            if (bElapsed < waveDuration) {
                const progress = bElapsed / waveDuration;
                const wave1 = Math.sin(progress * Math.PI * 3) * Math.exp(-progress * 2.5) * 30;
                const wave2 = Math.sin(progress * Math.PI * 5 + 1) * Math.exp(-progress * 2) * 20;
                
                for (const frag of window.fragments) {
                    frag.opacity = 1;
                    frag.currentOffsetX = wave1 * 0.6 + wave2 * 0.5;
                    frag.currentOffsetY = wave1 * 0.5 + wave2 * 0.7;
                }
            } else {
                if (!window._replaced) {
                    window._replaced = true;
                    const layoutMap = {};
                    for (const layout of layouts) {
                        layoutMap[layout.id] = {
                            image: layout.image,
                            centerX: layout.x + layout.width / 2,
                            centerY: layout.y + layout.height / 2,
                            targetX: layout.x,
                            targetY: layout.y,
                            targetWidth: layout.width,
                            targetHeight: layout.height,
                            rotation: layout.rotation,
                            opacity: 1,
                            currentOffsetX: 0,
                            currentOffsetY: 0,
                            arcOffset: 0,
                            srcX: 0, srcY: 0,
                            srcWidth: layout.image.width,
                            srcHeight: layout.image.height,
                            isFullImage: true,
                            imageId: layout.id,
                        };
                    }
                    window.fragments = Object.values(layoutMap);
                    console.log('B段：替换为完整小图');
                }
                
                for (const frag of window.fragments) {
                    frag.opacity = 1;
                    frag.currentOffsetX = Math.sin(elapsed * 0.8) * 2;
                    frag.currentOffsetY = Math.cos(elapsed * 0.6) * 2;
                }
            }
        }
        
        if (elapsed > cfg.duration) {
            console.log('第一幕结束');
            if (typeof startStage2 === 'function') startStage2(window.fragments, layouts);
            return;
        }
        
        requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
}