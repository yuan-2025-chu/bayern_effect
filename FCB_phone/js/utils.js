// utils.js

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function rectsOverlap(a, b, padding) {
    return !(
        a.x + a.width + padding < b.x ||
        b.x + b.width + padding < a.x ||
        a.y + a.height + padding < b.y ||
        b.y + b.height + padding < a.y
    );
}

async function loadAllImages() {
    const promises = CONFIG.images.list.map(src => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`图片加载失败: ${src}`));
            img.src = CONFIG.images.path + src;
        });
    });
    
    try {
        const images = await Promise.all(promises);
        console.log(`成功加载 ${images.length} 张图片`);
        return images;
    } catch (err) {
        console.error(err);
        return [];
    }
}

function calculateLayout(images) {
    const layouts = [];
    const gap = CONFIG.images.gap;
    const padding = CONFIG.images.padding;
    const canvasW = CONFIG.canvas.width;
    const canvasH = CONFIG.canvas.height;
    const centerX = canvasW / 2;
    const centerY = canvasH / 2;
    
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const targetWidth = randomBetween(CONFIG.images.displaySize.min, CONFIG.images.displaySize.max);
        const aspectRatio = img.width / img.height;
        const targetHeight = targetWidth / aspectRatio;
        
        let bestX = centerX - targetWidth / 2;
        let bestY = centerY - targetHeight / 2;
        let bestDistance = Infinity;
        let placed = false;
        
        // 螺旋扫描：从中心向外
        const maxRadius = Math.max(canvasW, canvasH);
        const angleStep = 0.3;
        const radiusStep = 15;
        
        for (let r = 0; r < maxRadius; r += radiusStep) {
            for (let a = 0; a < Math.PI * 2; a += angleStep) {
                const sx = centerX + Math.cos(a) * r - targetWidth / 2;
                const sy = centerY + Math.sin(a) * r - targetHeight / 2;
                const x = Math.max(padding, Math.min(canvasW - targetWidth - padding, sx));
                const y = Math.max(padding, Math.min(canvasH - targetHeight - padding, sy));
                
                const candidate = { x, y, width: targetWidth, height: targetHeight };
                
                let overlaps = false;
                for (const placedItem of layouts) {
                    if (rectsOverlap(candidate, placedItem, gap)) {
                        overlaps = true;
                        break;
                    }
                }
                
                if (!overlaps) {
                    const dx = x + targetWidth / 2 - centerX;
                    const dy = y + targetHeight / 2 - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < bestDistance) {
                        bestX = x;
                        bestY = y;
                        bestDistance = dist;
                        placed = true;
                    }
                }
            }
            // 找到合适位置后，再多扫几圈找更近的
            if (placed && r > bestDistance + 200) break;
        }
        
        // 螺旋没找到，回退到网格扫描
        if (!placed) {
            const stepX = Math.max(10, (canvasW - padding * 2) / 30);
            const stepY = Math.max(10, (canvasH - padding * 2) / 20);
            
            for (let sy = padding; sy < canvasH - targetHeight - padding; sy += stepY) {
                for (let sx = padding; sx < canvasW - targetWidth - padding; sx += stepX) {
                    const candidate = { x: sx, y: sy, width: targetWidth, height: targetHeight };
                    
                    let overlaps = false;
                    for (const placedItem of layouts) {
                        if (rectsOverlap(candidate, placedItem, gap)) {
                            overlaps = true;
                            break;
                        }
                    }
                    
                    if (!overlaps) {
                        bestX = sx;
                        bestY = sy;
                        placed = true;
                        break;
                    }
                }
                if (placed) break;
            }
        }
        
        layouts.push({
            x: bestX,
            y: bestY,
            width: targetWidth,
            height: targetHeight,
            rotation: randomBetween(CONFIG.images.rotation.min, CONFIG.images.rotation.max),
            image: img,
            id: i,
        });
    }
    
    return layouts;
}

function generateFragmentSlots(layouts, grid) {
    const allSlots = [];
    
    for (const layout of layouts) {
        const img = layout.image;
        const imgWidth = img.width;    // 原图宽
        const imgHeight = img.height;  // 原图高
        
        const fragSrcW = imgWidth / grid;
        const fragSrcH = imgHeight / grid;
        
        const displayW = layout.width;
        const displayH = layout.height;
        const fragDisplayW = displayW / grid;
        const fragDisplayH = displayH / grid;
        
        const cx = layout.x + displayW / 2;
        const cy = layout.y + displayH / 2;
        
        for (let row = 0; row < grid; row++) {
            for (let col = 0; col < grid; col++) {
                const localX = (col + 0.5) * fragDisplayW - displayW / 2;
                const localY = (row + 0.5) * fragDisplayH - displayH / 2;
                
                allSlots.push({
                    imageId: layout.id,
                    image: img,
                    srcX: col * fragSrcW,
                    srcY: row * fragSrcH,
                    srcWidth: fragSrcW,
                    srcHeight: fragSrcH,
                    targetX: cx + localX,
                    targetY: cy + localY,
                    targetWidth: fragDisplayW,
                    targetHeight: fragDisplayH,
                    centerX: cx,
                    centerY: cy,
                    rotation: layout.rotation,
                });
            }
        }
    }
    
    return allSlots;
}

function getTargetFragmentCount(elapsed, waves) {
    let prev = waves[0];
    let next = waves[waves.length - 1];
    
    for (const wave of waves) {
        if (wave.time <= elapsed) prev = wave;
        if (wave.time > elapsed && next === waves[waves.length - 1]) {
            next = wave;
            break;
        }
    }
    
    if (prev.time === next.time) {
        return randomBetween(prev.count.min, prev.count.max);
    }
    
    const progress = (elapsed - prev.time) / (next.time - prev.time);
    const countMin = prev.count.min + (next.count.min - prev.count.min) * progress;
    const countMax = prev.count.max + (next.count.max - prev.count.max) * progress;
    
    return Math.floor(randomBetween(countMin, countMax));
}