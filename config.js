// config.js

const CONFIG = {
    canvas: {
        width: window.innerWidth,
        height: window.innerHeight,
    },
    images: {
        path: 'images/',
        list: Array.from({ length: 24 }, (_, i) => `${i + 1}.jpeg`),
        count: 24,
        displaySize: { min: 40, max: 70 },      // 小图显示尺寸范围
        gap: 20,         // 小图之间的最小间距
        rotation: { min: -30, max: 30 },    // 小图的随机旋转范围
        padding: 20,     // 小图距离画布边缘的最小距离
    },
    stage1: {
    duration: 3.0,
    grid: 10,
    initialFragments: { min: 10, max: 30 },
    flashDuration: 0.3,       // 出现快
    floatAmplitude: 3,
    floatSpeed: 2,
    offsetX: { min: -5, max: 5 },
    offsetY: { min: -2, max: 2 },
    deathDuration: 0.5,        // 消失慢
    waves: [
        { time: 0.0, count: { min: 10, max: 30 } },
        { time: 0.6, count: { min: 15, max: 25 } },    // 微减
        { time: 1.2, count: { min: 40, max: 65 } },
        { time: 1.8, count: { min: 30, max: 50 } },    // 微减
        { time: 2.4, count: { min: 65, max: 90 } },
        { time: 3.0, count: { min: 85, max: 100 } },
    ],
    },
    stage2: {
        duration: 1.5,
        waveCount: 3,
        waveInterval: 0.3,        // 波之间的时间间隔
        waveSpeed: 250,
        waveOriginX: window.innerWidth / 2,
        waveOriginY: window.innerHeight * 0.4,
        arcHeight: 15,
        overshoot: 5,
        bounceDuration: 0.3,
        arrivalDuration: { min: 0.4, max: 0.6 },
    },
    stage3: {
        duration: 2.5,
        grid: 5,
        flyDistance: { min: 50, max: 200 },   // 飞出距离范围
        fragmentShrink: 0.7,             // 碎片缩小比例
        particleStartRatio: 0.2,         // 从碎片飞出到粒子出现的时间占比
        particleSpawnRate: 0.18,          // 粒子生成速率（每秒每碎片）
        particleSize: { min: 2, max: 5 },          // 粒子尺寸范围
        particleSpeedX: { min: -40, max: 40 },        // 粒子水平速度范围
        particleSpeedY: { min: -40, max: 40 },        // 粒子垂直速度范围
        particleOpacity: { min: 0.95, max: 1 },       // 粒子初始不透明度范围
        particleLife: { min: 1.5, max: 3 },         // 粒子生命周期范围（秒）
        particleFadeRate: 0.005,                    // 粒子每帧的淡出速率
        particleGlow: 5,           // 发光半径
        //particleColors: ['#f5a623'],
        // particleColors: [
        // '#4dc9f6',   // 亮科技蓝
        // '#00d4ff',   // 电光蓝
        // ],
        particleColors: [
           '#fff5cc',   // 亮金白
           '#ffe680',   // 亮金
           //'#ff9999',   // 亮红
        ],
        },
    stage4: {
        duration: 10.0,
        phaseA: 1.0,        // 随机跳动1秒
        phaseB: 2.0,        // 多波涌动2秒（3.0-1.0=2秒）
        phaseC: 5.5,
        topPosition: 0.01,  // 停在画布顶部12%位置
        gatherWidth: 0.05,   // 聚集宽度为画布40%
        waveAmplitude: { min: 40, max: 100, phase: 60 },
        waveFrequency: { min: 1.2, max: 2.5, phase: 2.5 },
        },
};