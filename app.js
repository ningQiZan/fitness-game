// 🦾 减肥大作战 - 游戏主逻辑

// 游戏数据
let gameData = {
    character: null,
    currentWeight: 0,
    initialWeight: 0,
    targetWeight: 0,
    caloriesToday: 0,
    totalCalories: 0,
    totalLost: 0,
    history: [],
    cards: [],
    lastCardDraw: null,
    createdAt: null
};

// 锻炼动作库
const exercises = [
    { id: 1, name: '俯卧撑', icon: '💪', calories: 50, duration: 60 },
    { id: 2, name: '仰卧起坐', icon: '🤸', calories: 40, duration: 60 },
    { id: 3, name: '深蹲', icon: '🦵', calories: 60, duration: 60 },
    { id: 4, name: '跳绳', icon: '🪢', calories: 100, duration: 60 },
    { id: 5, name: '平板支撑', icon: '🧘', calories: 30, duration: 60 },
    { id: 6, name: '开合跳', icon: '🏃', calories: 80, duration: 60 },
    { id: 7, name: '高抬腿', icon: '🦵', calories: 70, duration: 60 },
    { id: 8, name: '波比跳', icon: '🤸', calories: 120, duration: 60 },
];

// 离谱动作库
const crazyExercises = [
    { id: 101, name: '举起地球', icon: '🌍', calories: 10000, duration: 1 },
    { id: 102, name: '单手俯卧撑', icon: '🦾', calories: 500, duration: 30 },
    { id: 103, name: '倒立行走', icon: '🙃', calories: 300, duration: 60 },
    { id: 104, name: '飞檐走壁', icon: '🧗', calories: 800, duration: 120 },
    { id: 105, name: '一拳超人', icon: '👊', calories: 2000, duration: 1 },
    { id: 106, name: '太空漫步', icon: '🚀', calories: 1500, duration: 180 },
    { id: 107, name: '时间停止锻炼', icon: '⏰', calories: 5000, duration: 1 },
    { id: 108, name: '量子波动减肥', icon: '⚛️', calories: 3000, duration: 1 },
];

// 绝对特性卡牌库
const cardDeck = [
    { name: '绝对减重', desc: '每天自动减少 5 斤体重', effect: { type: 'auto_loss', value: 2.5 } },
    { name: '燃烧之心', desc: '所有锻炼消耗翻倍', effect: { type: 'calorie_boost', value: 2 } },
    { name: '轻盈如燕', desc: '基础代谢 +500 kcal/天', effect: { type: 'metabolism', value: 500 } },
    { name: '暴食诅咒', desc: '每天自动增加 3 斤体重', effect: { type: 'auto_gain', value: 1.5 } },
    { name: '钢铁意志', desc: '不会自动增重', effect: { type: 'no_auto_gain', value: 1 } },
    { name: '重力加倍', desc: '锻炼效果减半', effect: { type: 'calorie_nerf', value: 0.5 } },
    { name: '时间加速', desc: '一天算作两天', effect: { type: 'time_boost', value: 2 } },
    { name: '幸运之星', desc: '抽卡必出正面效果', effect: { type: 'lucky_draw', value: 1 } },
    { name: '无限食欲', desc: '每次锻炼后体重 +1kg', effect: { type: 'exercise_gain', value: 1 } },
    { name: '光合作用', desc: '不吃饭也能活，每天 -0.5kg', effect: { type: 'auto_loss', value: 0.5 } },
];

// 初始化游戏
function init() {
    const saved = localStorage.getItem('fitnessGame');
    if (saved) {
        gameData = JSON.parse(saved);
        showPage('game');
        updateUI();
    } else {
        showPage('create-character');
    }
}

// 创建角色
function createCharacter() {
    const name = document.getElementById('character-name').value.trim();
    const currentWeight = parseFloat(document.getElementById('current-weight').value);
    const targetWeight = parseFloat(document.getElementById('target-weight').value);

    if (!name || !currentWeight || !targetWeight) {
        alert('请填写完整信息！');
        return;
    }

    gameData = {
        character: name,
        currentWeight: currentWeight,
        initialWeight: currentWeight,
        targetWeight: targetWeight,
        caloriesToday: 0,
        totalCalories: 0,
        totalLost: 0,
        history: [],
        cards: [],
        lastCardDraw: null,
        createdAt: new Date().toISOString()
    };

    saveGame();
    showPage('game');
    updateUI();
    
    // 添加初始记录
    addHistory('创建角色', 0, 'start');
}

// 保存游戏
function saveGame() {
    localStorage.setItem('fitnessGame', JSON.stringify(gameData));
}

// 显示页面
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    if (pageName === 'game') {
        document.getElementById('game-page').classList.remove('hidden');
        document.querySelectorAll('.nav-btn')[0].classList.add('active');
    } else if (pageName === 'stats') {
        document.getElementById('stats-page').classList.remove('hidden');
        document.querySelectorAll('.nav-btn')[1].classList.add('active');
        updateStats();
    } else if (pageName === 'settings') {
        document.getElementById('settings-page').classList.remove('hidden');
        document.querySelectorAll('.nav-btn')[2].classList.add('active');
    }
}

// 更新 UI
function updateUI() {
    document.getElementById('char-name').textContent = gameData.character;
    document.getElementById('char-weight').textContent = gameData.currentWeight.toFixed(1) + ' kg';
    document.getElementById('calories-today').textContent = Math.round(gameData.caloriesToday);
    
    // 更新进度条
    const dailyGoal = 500;
    const progress = Math.min((gameData.caloriesToday / dailyGoal) * 100, 100);
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('progress-text').textContent = `目标：消耗 ${dailyGoal} kcal (已完成 ${Math.round(progress)}%)`;
    
    // 渲染锻炼列表
    renderExerciseList();
}

// 渲染锻炼列表
function renderExerciseList() {
    const exerciseList = document.getElementById('exercise-list');
    const crazyList = document.getElementById('crazy-list');
    
    exerciseList.innerHTML = exercises.map(ex => `
        <div class="exercise-item" onclick="doExercise(${ex.id})">
            <div class="exercise-icon">${ex.icon}</div>
            <div class="exercise-name">${ex.name}</div>
            <div class="exercise-cal">-${ex.calories} kcal</div>
        </div>
    `).join('');
    
    crazyList.innerHTML = crazyExercises.map(ex => `
        <div class="exercise-item crazy" onclick="doExercise(${ex.id})">
            <div class="exercise-icon">${ex.icon}</div>
            <div class="exercise-name">${ex.name}</div>
            <div class="exercise-cal">-${ex.calories} kcal</div>
        </div>
    `).join('');
}

// 执行锻炼
function doExercise(exerciseId) {
    const allExercises = [...exercises, ...crazyExercises];
    const exercise = allExercises.find(e => e.id === exerciseId);
    
    if (!exercise) return;
    
    // 应用卡牌效果
    let calorieMultiplier = 1;
    gameData.cards.forEach(card => {
        if (card.effect.type === 'calorie_boost') calorieMultiplier *= card.effect.value;
        if (card.effect.type === 'calorie_nerf') calorieMultiplier *= card.effect.value;
    });
    
    const actualCalories = exercise.calories * calorieMultiplier;
    
    // 计算体重变化 (约 7700 kcal = 1 kg)
    const weightChange = -(actualCalories / 7700);
    
    // 更新数据
    gameData.caloriesToday += actualCalories;
    gameData.totalCalories += actualCalories;
    gameData.currentWeight += weightChange;
    gameData.totalLost = gameData.initialWeight - gameData.currentWeight;
    
    // 检查无限食欲卡牌
    gameData.cards.forEach(card => {
        if (card.effect.type === 'exercise_gain') {
            gameData.currentWeight += card.effect.value;
            showWeightChange(card.effect.value, 'gain');
        }
    });
    
    // 显示体重变化动画
    if (weightChange < 0) {
        showWeightChange(Math.abs(weightChange), 'loss');
    }
    
    // 添加历史记录
    addHistory(exercise.name, actualCalories, 'exercise');
    
    saveGame();
    updateUI();
}

// 显示体重变化动画
function showWeightChange(value, type) {
    const el = document.getElementById('weight-change');
    el.textContent = (type === 'loss' ? '-' : '+') + value.toFixed(2) + ' kg';
    el.className = 'weight-change ' + type;
    
    setTimeout(() => {
        el.classList.add('hidden');
    }, 1500);
}

// 抽卡
function drawCard() {
    const today = new Date().toDateString();
    
    if (gameData.lastCardDraw === today) {
        alert('今天已经抽过卡了，明天再来吧！');
        return;
    }
    
    // 检查幸运之星卡牌
    let availableCards = [...cardDeck];
    const hasLucky = gameData.cards.some(c => c.effect.type === 'lucky_draw');
    if (hasLucky) {
        // 只抽正面效果
        availableCards = cardDeck.filter(c => 
            !['暴食诅咒', '重力加倍', '无限食欲'].includes(c.name)
        );
    }
    
    // 随机抽卡
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const card = availableCards[randomIndex];
    
    gameData.cards.push(card);
    gameData.lastCardDraw = today;
    
    // 显示抽到的卡
    const cardDisplay = document.getElementById('card-display');
    cardDisplay.innerHTML = `
        <div class="card-name">🎴 ${card.name}</div>
        <div class="card-desc">${card.desc}</div>
    `;
    cardDisplay.classList.remove('hidden');
    
    addHistory(`抽到卡牌：${card.name}`, 0, 'card');
    saveGame();
}

// 显示排行榜
function showLeaderboard(type) {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.classList.remove('hidden');
    
    // 模拟排行榜数据（本地版先用自己的数据）
    const mockData = [
        { name: '健身达人', value: type === 'loss' ? 15.5 : 50 },
        { name: '减肥王者', value: type === 'loss' ? 12.3 : 80 },
        { name: '运动健将', value: type === 'loss' ? 10.8 : 30 },
        { name: gameData.character + ' (你)', value: type === 'loss' ? 
            Math.max(0, gameData.totalLost) : Math.max(0, -gameData.totalLost) },
        { name: '新手小白', value: type === 'loss' ? 5.2 : 20 },
    ];
    
    // 排序
    mockData.sort((a, b) => b.value - a.value);
    
    leaderboard.innerHTML = mockData.slice(0, 10).map((item, index) => `
        <div class="leaderboard-item">
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">${item.name}</span>
            <span class="leaderboard-value">${item.value.toFixed(1)} kg</span>
        </div>
    `).join('');
}

// 更新统计
function updateStats() {
    document.getElementById('stat-initial').textContent = gameData.initialWeight.toFixed(1) + ' kg';
    document.getElementById('stat-current').textContent = gameData.currentWeight.toFixed(1) + ' kg';
    document.getElementById('stat-lost').textContent = gameData.totalLost.toFixed(1) + ' kg';
    document.getElementById('stat-calories').textContent = Math.round(gameData.totalCalories) + ' kcal';
    
    // 渲染历史记录
    const historyList = document.getElementById('history-list');
    if (gameData.history.length === 0) {
        historyList.innerHTML = '<p style="text-align:center;color:#888;">暂无记录</p>';
    } else {
        historyList.innerHTML = gameData.history.slice().reverse().slice(0, 50).map(h => `
            <div class="history-item">
                <div>
                    <div class="history-action">${h.action}</div>
                    <div class="history-time">${new Date(h.time).toLocaleString('zh-CN')}</div>
                </div>
                <div class="history-value ${h.type === 'gain' ? 'gain' : ''}">
                    ${h.value !== 0 ? (h.value > 0 ? '+' : '') + h.value.toFixed(1) + ' kg' : ''}
                </div>
            </div>
        `).join('');
    }
}

// 添加历史记录
function addHistory(action, value, type) {
    gameData.history.push({
        action,
        value,
        type,
        time: new Date().toISOString()
    });
    
    // 只保留最近 100 条
    if (gameData.history.length > 100) {
        gameData.history = gameData.history.slice(-100);
    }
}

// 更新体重
function updateWeight() {
    const newWeight = parseFloat(document.getElementById('update-weight').value);
    
    if (!newWeight || newWeight <= 0) {
        alert('请输入有效的体重！');
        return;
    }
    
    const diff = newWeight - gameData.currentWeight;
    gameData.currentWeight = newWeight;
    gameData.totalLost = gameData.initialWeight - gameData.currentWeight;
    
    if (diff > 0) {
        showWeightChange(diff, 'gain');
    } else {
        showWeightChange(Math.abs(diff), 'loss');
    }
    
    addHistory('手动更新体重', diff, diff > 0 ? 'gain' : 'loss');
    saveGame();
    updateUI();
    
    document.getElementById('update-weight').value = '';
}

// 重置游戏
function resetGame() {
    if (confirm('确定要重置游戏吗？所有数据将被清空！')) {
        localStorage.removeItem('fitnessGame');
        location.reload();
    }
}

// 每日自动处理（检查新的一天）
function checkNewDay() {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('fitnessGame_lastLogin');
    
    if (lastLogin && lastLogin !== today) {
        // 新的一天
        gameData.caloriesToday = 0;
        
        // 处理自动增减重卡牌
        gameData.cards.forEach(card => {
            if (card.effect.type === 'auto_loss') {
                gameData.currentWeight -= card.effect.value;
                gameData.totalLost = gameData.initialWeight - gameData.currentWeight;
            }
            if (card.effect.type === 'auto_gain') {
                gameData.currentWeight += card.effect.value;
                gameData.totalLost = gameData.initialWeight - gameData.currentWeight;
            }
        });
        
        // 检查是否锻炼（没有锻炼就自动增重）
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        const exercisedYesterday = gameData.history.some(h => 
            h.type === 'exercise' && new Date(h.time).toDateString() === yesterdayStr
        );
        
        if (!exercisedYesterday) {
            const autoGain = 0.3; // 不锻炼每天自动增重 0.3kg
            gameData.currentWeight += autoGain;
            gameData.totalLost = gameData.initialWeight - gameData.currentWeight;
            addHistory('未锻炼自动增重', autoGain, 'gain');
        }
        
        saveGame();
        updateUI();
    }
    
    localStorage.setItem('fitnessGame_lastLogin', today);
}

// 启动游戏
init();
checkNewDay();
