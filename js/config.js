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
        displaySize: { min: 100, max: 120 },      // 小图显示尺寸范围
        gap: 40,         // 小图之间的最小间距
        rotation: { min: -40, max: 40 },    // 小图的随机旋转范围
        padding: 20,     // 小图距离画布边缘的最小距离
    },
        stage1: {
            duration: 6.0,
            phaseA: 4.0,
            grid: 10,
            initialFragments: { min: 3, max: 8 },
            flashDuration: 0.4,
            deathDuration: 0.8,
            floatAmplitude: 2,
            floatSpeed: 2,
            offsetX: { min: -3, max: 3 },
            offsetY: { min: -3, max: 3 },
        },
    stage2: {
        duration: 6.0,
        phaseC: 2.0,
        // C段：碎玻璃
        fragmentGrid: 3,
        impactRange: 0.15,
        flyDistance: { min: 80, max: 150 },
        flyDistanceByDist: 0.8,
        flyUpBias: { min: -200, max: 200 },   // 飞行时向上的额外偏移，制造更抛物线的飞行轨迹
        rotateSpeed: { min: -40, max: 40 },    // 飞行时的旋转速度范围
        edgeGlow: { min: 0.4, max: 0.65 },     // 碎片边缘发光强度范围
        flyFade: 0.25,       // 飞行过程中碎片淡出的速率
        glowFade: 0.6,         // 发光淡出的速率
        // D段
        shrinkEnd: 0.35,
        shrinkMin: 0.05,
        rainCount: 120,
        rainSpawnPerFrame: 5,
        rainLength: { min: 5, max: 12 },       // 雨丝长度范围
        rainSpeed: { min: 1500, max: 3000 },
        rainAngle: { min: 60, max: 72 },
        rainOpacity: { min: 0.2, max: 0.6 },     // 雨丝初始不透明度范围
        rainColors: ['#0fb1ec', '#ffffff'],
        rebirthGrid: 4,                 // 重生时每张小图切成的碎片网格数
        rebirthDelay: 0.4,
        rebirthEnd: 0.85,
        rebirthStartCount: 3,
        rebirthOffset: { min: -3, max: 3 },
        rebirthFloatSpeed: { min: 0.3, max: 0.8 },
        rebirthStartScale: 0.3,
        rebirthFadeIn: 0.5,
        rebirthScaleDuration: 1.5,
        rebirthFloatAmp: 2,
        finalPause: 1.5,
    },
    stage3: {
        duration: 3,
        grid: 4,
        flyDistance: { min: 80, max: 100 },   // 飞出距离范围
        fragmentShrink: 0.8,             // 碎片缩小比例
        particleStartRatio: 0.15,         // 从碎片飞出到粒子出现的时间占比
        particleSpawnRate: 0.25,          // 粒子生成速率（每秒每碎片）
        particleSize: { min: 1, max: 6 },          // 粒子尺寸范围
        particleSpeedX: { min: -20, max: 20 },        // 粒子水平速度范围
        particleSpeedY: { min: -20, max: 20 },        // 粒子垂直速度范围
        particleOpacity: { min: 0.8, max: 1 },       // 粒子初始不透明度范围
        particleLife: { min: 1.5, max: 2.5 },         // 粒子生命周期范围（秒）
        particleFadeRate: 0.001,                    // 粒子每帧的淡出速率
        particleGlow: 1.5,           // 发光半径
        particleColors: [
        '#4dc9f6',   // 亮科技蓝
        '#00d4ff',   // 电光蓝
        ],
        // particleColors: [
        //    '#fff5cc',   // 亮金白
        //    '#ffe680',   // 亮金
        //    //'#ff9999',   // 亮红
        // ],
        },
    stage4: {
        duration: 14.0,
        phaseA: 1.0,        // 随机跳动1秒
        phaseB: 4.0,        // 多波涌动2秒（3.0-1.0=2秒）
        phaseC: 8.0,
        topPosition: 0.01,  // 粒子飞向顶部的目标位置（占画布高度的比例）
        gatherWidth: 0.05,   // 粒子聚集时的水平范围（占画布宽度的比例）
        waveAmplitude: { min: 40, max: 100, phase: 60 },
        waveFrequency: { min: 1.2, max: 2.5, phase: 2.5 },
        },
    stage5: {
    duration: 1.5,
},
stage6: {
    duration: 30,
    videoSrc: 'video/1.mp4',
    videoWidth: 560,
    videoHeight: 315,
    goldColors: ['#f6b30b', '#d4a017'],
    particleSize: { min: 1.5, max: 4 },
    windFreq: { min: 0.4, max: 0.8 },     // 风动频率范围
    windAmp: { min: 0.3, max: 0.6 },      // 风动幅度范围
    fallSpeed: { min: 300, max: 500 },     // 金雨初始下落速度范围
    gravity: 1200,                  // 重力加速度 px/s²
    windStrength: 80,                   // 风力强度（影响风对粒子运动的影响程度）
    windRatio: 0.5,                     // 风力作用占比（控制风对粒子运动的整体影响程度）
},
};