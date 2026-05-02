// stage0_staticDisplay.js

const canvas = document.getElementById('myCanvas');
canvas.width = CONFIG.canvas.width;
canvas.height = CONFIG.canvas.height;
const ctx = canvas.getContext('2d');

// 工具函数
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

// 加载所有图片
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

// 计算不重叠的位置
function calculateLayout(images) {
    const layouts = [];
    const gap = CONFIG.images.gap;
    const padding = CONFIG.images.padding;
    const maxAttempts = 500;
    
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        // 随机目标显示尺寸
        const targetWidth = randomBetween(CONFIG.images.displaySize.min, CONFIG.images.displaySize.max);
        const aspectRatio = img.width / img.height;
        const targetHeight = targetWidth / aspectRatio;
        
        let placed = false;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const x = randomBetween(padding, canvas.width - targetWidth - padding);
            const y = randomBetween(padding, canvas.height - targetHeight - padding);
            
            const candidate = {
                x: x,
                y: y,
                width: targetWidth,
                height: targetHeight,
            };
            
            // 检查是否与已放置的图片重叠
            let overlaps = false;
            for (const placed of layouts) {
                if (rectsOverlap(candidate, placed, gap)) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps) {
                layouts.push({
                    ...candidate,
                    rotation: randomBetween(CONFIG.images.rotation.min, CONFIG.images.rotation.max),
                    image: img,
                });
                placed = true;
                break;
            }
        }
        
        // 如果500次都没找到位置，强制放置
        if (!placed) {
            layouts.push({
                x: randomBetween(padding, canvas.width - targetWidth - padding),
                y: randomBetween(padding, canvas.height - targetHeight - padding),
                width: targetWidth,
                height: targetHeight,
                rotation: randomBetween(CONFIG.images.rotation.min, CONFIG.images.rotation.max),
                image: img,
            });
        }
    }
    
    return layouts;
}

// 绘制
function drawLayouts(layouts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景
    ctx.fillStyle = '#1a0010';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 画每张图
    for (const item of layouts) {
        ctx.save();
        
        // 移动到图片中心，旋转，再移回来
        const centerX = item.x + item.width / 2;
        const centerY = item.y + item.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((item.rotation * Math.PI) / 180);
        
        // 阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // 画图片
        ctx.drawImage(item.image, -item.width / 2, -item.height / 2, item.width, item.height);
        
        // 边框
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(220, 5, 45, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
        
        ctx.restore();
    }
}

// 主函数
async function init() {
    const images = await loadAllImages();
    if (images.length === 0) {
        console.error('没有图片可显示');
        return;
    }
    
    const layouts = calculateLayout(images);
    console.log(`布局完成，共 ${layouts.length} 张图片`);
    drawLayouts(layouts);
}

init();