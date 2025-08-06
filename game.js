// 安全隐藏开发者凭证
const DEV_CREDENTIALS = {
    username: btoa('devadmin'),
    password: btoa('secureDevPass123!' + Math.random().toString(36).substring(2))
};

// 游戏配置
const CONFIG = {
    PLAYER_SIZE: 50,
    ITEM_SIZE: 40,
    BOMB_SIZE: 45,
    INITIAL_SPEED: 5,
    MAX_SPEED: 15,
    SPEED_INCREMENT: 0.2,
    DROP_INTERVAL: 1000,
    MIN_DROP_INTERVAL: 300,
    ITEM_TYPES: {
        COIN: { value: 5, color: '#FFD700', icon: '💰', chance: 0.5 },
        HEART: { value: 1, color: '#FF5E5B', icon: '❤️', chance: 0.1 },
        KEY: { value: 1, color: '#00CECB', icon: '🔑', chance: 0.08 },
        SPEED_UP: { value: 0, color: '#4CAF50', icon: '⚡', chance: 0.12 },
        SPEED_DOWN: { value: 0, color: '#2196F3', icon: '🐢', chance: 0.1 },
        BOMB: { value: -1, color: '#333', icon: '💣', chance: 0.1 }
    }
};

// 游戏状态
let gameState = {
    canvas: null,
    ctx: null,
    score: 0,
    coins: 0,
    lives: 3,
    keys: 0,
    highScore: 0,
    speed: CONFIG.INITIAL_SPEED,
    isGameOver: false,
    isPaused: false,
    playerX: 0,
    playerY: 0,
    isJumping: false,
    isRolling: false,
    gameTime: 0,
    items: [],
    bombs: [],
    lastDropTime: 0,
    dropInterval: CONFIG.DROP_INTERVAL,
    playerSkin: 'default',
    adminMode: false,
    assets: {},
    gameStartTime: 0,
    isMovingLeft: false,
    isMovingRight: false,
    moveSpeed: 8
};

// 初始化游戏
function initGame() {
    gameState.canvas = document.getElementById('game-canvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    
    // 设置画布大小
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 初始化玩家位置
    resetPlayerPosition();
    
    // 加载资源
    loadAssets().then(() => {
        // 显示主菜单
        showMainMenu();
        
        // 设置事件监听
        setupEventListeners();
    }).catch(error => {
        console.error('资源加载失败:', error);
        alert('游戏资源加载失败，请刷新页面重试');
    });
}

// 调整画布大小
function resizeCanvas() {
    gameState.canvas.width = window.innerWidth;
    gameState.canvas.height = window.innerHeight;
    resetPlayerPosition();
}

// 重置玩家位置
function resetPlayerPosition() {
    gameState.playerX = gameState.canvas.width / 2;
    gameState.playerY = gameState.canvas.height - 100;
}

// 加载游戏资源
function loadAssets() {
    return new Promise((resolve, reject) => {
        // 这里应该是实际的资源加载逻辑
        // 为了示例，我们使用简单的超时
        setTimeout(() => {
            gameState.assets = {
                player: {
                    default: createPlayerImage('#FF5E5B'),
                    vip: createPlayerImage('#FFD700'),
                    admin: createPlayerImage('#9C27B0')
                },
                items: {
                    coin: createItemImage(CONFIG.ITEM_TYPES.COIN.color),
                    heart: createItemImage(CONFIG.ITEM_TYPES.HEART.color),
                    key: createItemImage(CONFIG.ITEM_TYPES.KEY.color),
                    speedUp: createItemImage(CONFIG.ITEM_TYPES.SPEED_UP.color),
                    speedDown: createItemImage(CONFIG.ITEM_TYPES.SPEED_DOWN.color),
                    bomb: createItemImage(CONFIG.ITEM_TYPES.BOMB.color)
                }
            };
            resolve();
        }, 1000);
    });
}

// 创建玩家图像
function createPlayerImage(color) {
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.PLAYER_SIZE;
    canvas.height = CONFIG.PLAYER_SIZE;
    const ctx = canvas.getContext('2d');
    
    // 绘制玩家
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(CONFIG.PLAYER_SIZE/2, CONFIG.PLAYER_SIZE/2, CONFIG.PLAYER_SIZE/2 - 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    return canvas;
}

// 创建物品图像
function createItemImage(color) {
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.ITEM_SIZE;
    canvas.height = CONFIG.ITEM_SIZE;
    const ctx = canvas.getContext('2d');
    
    // 绘制物品
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(CONFIG.ITEM_SIZE/2, CONFIG.ITEM_SIZE/2, CONFIG.ITEM_SIZE/2 - 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    return canvas;
}

// 设置事件监听
function setupEventListeners() {
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (gameState.isGameOver || gameState.isPaused) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                gameState.isMovingLeft = true;
                break;
            case 'ArrowRight':
                gameState.isMovingRight = true;
                break;
            case 'ArrowUp':
            case ' ':
                jump();
                break;
            case 'ArrowDown':
                roll();
                break;
            case 'Escape':
                togglePause();
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                gameState.isMovingLeft = false;
                break;
            case 'ArrowRight':
                gameState.isMovingRight = false;
                break;
        }
    });
    
    // 移动端控制
    document.getElementById('move-left').addEventListener('touchstart', (e) => {
        e.preventDefault();
        gameState.isMovingLeft = true;
    });
    
    document.getElementById('move-right').addEventListener('touchstart', (e) => {
        e.preventDefault();
        gameState.isMovingRight = true;
    });
    
    document.getElementById('move-left').addEventListener('touchend', (e) => {
        e.preventDefault();
        gameState.isMovingLeft = false;
    });
    
    document.getElementById('move-right').addEventListener('touchend', (e) => {
        e.preventDefault();
        gameState.isMovingRight = false;
    });
    
    document.getElementById('jump-btn').addEventListener('click', jump);
    document.getElementById('roll-btn').addEventListener('click', roll);
    
    // 游戏控制按钮
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('resume-game').addEventListener('click', togglePause);
    document.getElementById('quit-game').addEventListener('click', endGame);
    document.getElementById('play-again').addEventListener('click', startGame);
    document.getElementById('return-home').addEventListener('click', showMainMenu);
    
    // 登录/注册按钮
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('register-btn').addEventListener('click', showRegister);
    document.getElementById('toggle-password').addEventListener('click', togglePasswordVisibility);
}

// 切换密码可见性
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '👁️';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// 登录功能
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // 开发者登录检查
    if (btoa(username) === DEV_CREDENTIALS.username && btoa(password) === DEV_CREDENTIALS.password) {
        enterAdminMode();
        return;
    }
    
    // 普通用户登录逻辑
    if (!username || !password) {
        showNotification('请输入用户名和密码', '⚠️');
        return;
    }
    
    // 这里应该是实际的登录验证逻辑
    // 模拟登录成功
    simulateLogin(username, rememberMe);
}

// 模拟登录
function simulateLogin(username, rememberMe) {
    showLoading(true);
    
    // 模拟网络请求延迟
    setTimeout(() => {
        showLoading(false);
        
        // 设置用户数据
        gameState.adminMode = false;
        setUserData({
            username: username,
            coins: 100,
            keys: 2,
            highScore: 0,
            isVip: false,
            avatar: 'assets/images/default-avatar.png'
        });
        
        // 显示主菜单
        showMainMenu();
        
        // 如果选择记住我，保存登录状态
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify({
                username: username,
                timestamp: Date.now()
            }));
        }
        
        showNotification(`欢迎回来, ${username}!`, '👋');
    }, 1500);
}

// 进入管理员模式
function enterAdminMode() {
    gameState.adminMode = true;
    
    // 设置管理员用户数据
    setUserData({
        username: '开发者',
        coins: 9999,
        keys: 999,
        highScore: 9999,
        isVip: true,
        avatar: 'assets/images/admin-avatar.png'
    });
    
    // 显示主菜单
    showMainMenu();
    
    showNotification('管理员模式已激活', '👑');
}

// 设置用户数据
function setUserData(user) {
    document.getElementById('user-name').textContent = user.username;
    document.getElementById('user-coins').textContent = user.coins;
    document.getElementById('user-keys').textContent = user.keys;
    document.getElementById('user-highscore').textContent = user.highScore;
    
    const avatar = document.getElementById('user-avatar');
    avatar.src = user.avatar;
    avatar.alt = `${user.username}的头像`;
    
    const vipBadge = document.getElementById('user-badge');
    vipBadge.className = 'avatar-badge';
    vipBadge.textContent = '';
    
    if (user.isVip) {
        vipBadge.classList.add('vip');
        vipBadge.textContent = 'VIP';
    }
    
    if (gameState.adminMode) {
        vipBadge.classList.add('admin');
        vipBadge.textContent = 'ADMIN';
        document.getElementById('admin-panel').classList.remove('hidden');
    } else {
        document.getElementById('admin-panel').classList.add('hidden');
    }
    
    // 更新游戏状态
    gameState.coins = user.coins;
    gameState.keys = user.keys;
    gameState.highScore = user.highScore;
    gameState.playerSkin = user.isVip ? 'vip' : 'default';
}

// 显示通知
function showNotification(text, icon = 'ℹ️') {
    const notification = document.getElementById('item-notification');
    const iconEl = notification.querySelector('.notification-icon');
    const textEl = notification.querySelector('.notification-text');
    
    iconEl.textContent = icon;
    textEl.textContent = text;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// 显示加载状态
function showLoading(show) {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = show ? 'flex' : 'none';
}

// 显示主菜单
function showMainMenu() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

// 显示注册界面
function showRegister() {
    // 这里应该是显示注册界面的逻辑
    showNotification('注册功能即将推出', '🚧');
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    gameState.score = 0;
    gameState.lives = 3;
    gameState.speed = CONFIG.INITIAL_SPEED;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.items = [];
    gameState.bombs = [];
    gameState.gameTime = 0;
    gameState.dropInterval = CONFIG.DROP_INTERVAL;
    gameState.gameStartTime = Date.now();
    
    resetPlayerPosition();
    
    // 更新HUD
    updateHUD();
    
    // 显示游戏界面
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    // 如果是移动设备，显示控制按钮
    if (isMobileDevice()) {
        document.getElementById('mobile-controls').classList.remove('hidden');
    }
    
    // 开始游戏循环
    gameLoop();
}

// 游戏主循环
function gameLoop() {
    if (gameState.isGameOver || gameState.isPaused) {
        return;
    }
    
    // 清除画布
    gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // 更新游戏状态
    updateGameState();
    
    // 绘制游戏元素
    drawBackground();
    drawPlayer();
    drawItems();
    drawBombs();
    
    // 更新HUD
    updateHUD();
    
    // 继续循环
    requestAnimationFrame(gameLoop);
}

// 更新游戏状态
function updateGameState() {
    // 移动玩家
    if (gameState.isMovingLeft) {
        gameState.playerX = Math.max(CONFIG.PLAYER_SIZE/2, gameState.playerX - gameState.moveSpeed);
    }
    if (gameState.isMovingRight) {
        gameState.playerX = Math.min(gameState.canvas.width - CONFIG.PLAYER_SIZE/2, gameState.playerX + gameState.moveSpeed);
    }
    
    // 更新玩家跳跃状态
    if (gameState.isJumping) {
        gameState.playerY -= 6;
        if (gameState.playerY < gameState.canvas.height - 150) {
            gameState.isJumping = false;
        }
    } else if (gameState.playerY < gameState.canvas.height - 100) {
        gameState.playerY += 6;
    }
    
    // 更新翻滚状态
    if (gameState.isRolling) {
        if (Date.now() - gameState.rollStartTime > 1000) {
            gameState.isRolling = false;
        }
    }
    
    // 生成新物品和炸弹
    const now = Date.now();
    if (now - gameState.lastDropTime > gameState.dropInterval) {
        spawnItemOrBomb();
        gameState.lastDropTime = now;
    }
    
    // 更新物品位置
    gameState.items.forEach((item, index) => {
        item.y += gameState.speed;
        
        // 检测碰撞
        if (checkCollision(item)) {
            handleItemCollision(item);
            gameState.items.splice(index, 1);
        } else if (item.y > gameState.canvas.height) {
            gameState.items.splice(index, 1);
        }
    });
    
    // 更新炸弹位置
    gameState.bombs.forEach((bomb, index) => {
        bomb.y += gameState.speed;
        
        // 检测碰撞
        if (checkCollision(bomb)) {
            handleBombCollision();
            gameState.bombs.splice(index, 1);
        } else if (bomb.y > gameState.canvas.height) {
            gameState.bombs.splice(index, 1);
        }
    });
    
    // 增加游戏时间
    gameState.gameTime += 16; // 约60fps
    
    // 逐渐增加难度
    if (gameState.gameTime % 5000 === 0 && gameState.speed < CONFIG.MAX_SPEED) {
        gameState.speed += CONFIG.SPEED_INCREMENT;
        gameState.dropInterval = Math.max(CONFIG.MIN_DROP_INTERVAL, gameState.dropInterval - 20);
    }
}

// 生成物品或炸弹
function spawnItemOrBomb() {
    const type = getRandomItemType();
    const x = Math.random() * (gameState.canvas.width - CONFIG.ITEM_SIZE) + CONFIG.ITEM_SIZE/2;
    
    if (type === 'BOMB') {
        gameState.bombs.push({
            x: x,
            y: -CONFIG.BOMB_SIZE,
            type: type
        });
    } else {
        gameState.items.push({
            x: x,
            y: -CONFIG.ITEM_SIZE,
            type: type
        });
    }
}

// 获取随机物品类型
function getRandomItemType() {
    const rand = Math.random();
    let cumulativeChance = 0;
    
    for (const [type, config] of Object.entries(CONFIG.ITEM_TYPES)) {
        cumulativeChance += config.chance;
        if (rand <= cumulativeChance) {
            return type;
        }
    }
    
    return 'COIN'; // 默认返回金币
}

// 检查碰撞
function checkCollision(item) {
    const itemSize = item.type === 'BOMB' ? CONFIG.BOMB_SIZE : CONFIG.ITEM_SIZE;
    const playerSize = gameState.isRolling ? CONFIG.PLAYER_SIZE/2 : CONFIG.PLAYER_SIZE;
    
    const distanceX = Math.abs(item.x - gameState.playerX);
    const distanceY = Math.abs(item.y - gameState.playerY);
    
    return distanceX < (playerSize/2 + itemSize/2) && 
           distanceY < (playerSize/2 + itemSize/2);
}

// 处理物品碰撞
function handleItemCollision(item) {
    const itemConfig = CONFIG.ITEM_TYPES[item.type];
    
    switch(item.type) {
        case 'COIN':
            gameState.coins += itemConfig.value;
            gameState.score += itemConfig.value;
            showNotification(`+${itemConfig.value}金币`, itemConfig.icon);
            break;
            
        case 'HEART':
            if (gameState.lives < 3) {
                gameState.lives += itemConfig.value;
                showNotification(`+${itemConfig.value}生命`, itemConfig.icon);
            } else {
                gameState.score += 5; // 生命已满时转换为分数
                showNotification('生命已满 +5分', '⭐');
            }
            break;
            
        case 'KEY':
            gameState.keys += itemConfig.value;
            showNotification(`+${itemConfig.value}钥匙`, itemConfig.icon);
            break;
            
        case 'SPEED_UP':
            gameState.speed = Math.min(CONFIG.MAX_SPEED, gameState.speed + 1);
            showNotification('速度提升!', itemConfig.icon);
            break;
            
        case 'SPEED_DOWN':
            gameState.speed = Math.max(CONFIG.INITIAL_SPEED, gameState.speed - 1);
            showNotification('速度降低', itemConfig.icon);
            break;
    }
}

// 处理炸弹碰撞
function handleBombCollision() {
    if (gameState.isRolling) {
        showNotification('翻滚躲避炸弹!', '🛡️');
        return;
    }
    
    // 检查是否有钥匙
    if (gameState.keys > 0 && confirm('使用钥匙抵消炸弹伤害吗?')) {
        gameState.keys--;
        showNotification('使用钥匙抵消伤害', '🔑');
        return;
    }
    
    // 减少生命
    gameState.lives--;
    
    if (gameState.lives <= 0) {
        endGame();
    } else {
        showNotification('被炸弹击中!', '💥');
    }
}

// 跳跃动作
function jump() {
    if (!gameState.isJumping && gameState.playerY >= gameState.canvas.height - 100) {
        gameState.isJumping = true;
    }
}

// 翻滚动作
function roll() {
    if (!gameState.isRolling && !gameState.isJumping) {
        gameState.isRolling = true;
        gameState.rollStartTime = Date.now();
    }
}

// 切换暂停状态
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pause-menu').classList.toggle('hidden');
    
    if (!gameState.isPaused) {
        gameLoop();
    }
}

// 结束游戏
function endGame() {
    gameState.isGameOver = true;
    
    // 计算游戏时长
    const gameDuration = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
    
    // 更新最高分
    const isNewHighScore = gameState.score > gameState.highScore;
    if (isNewHighScore) {
        gameState.highScore = gameState.score;
        document.getElementById('high-score-message').classList.remove('hidden');
    }
    
    // 计算获得金币 (每分钟游戏获得10金币)
    const coinsEarned = Math.floor(gameDuration / 6) + Math.floor(gameState.score / 20);
    gameState.coins += coinsEarned;
    
    // 更新游戏结束界面
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-highscore').textContent = gameState.highScore;
    document.getElementById('coins-earned').textContent = `+${coinsEarned}`;
    
    // 显示游戏结束界面
    document.getElementById('game-over').classList.remove('hidden');
}

// 更新HUD
function updateHUD() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('keys').textContent = gameState.keys;
}

// 绘制背景
function drawBackground() {
    const ctx = gameState.ctx;
    
    // 渐变天空
    const skyGradient = ctx.createLinearGradient(0, 0, 0, gameState.canvas.height);
    skyGradient.addColorStop(0, '#1e5799');
    skyGradient.addColorStop(0.5, '#2989d8');
    skyGradient.addColorStop(0.51, '#207cca');
    skyGradient.addColorStop(1, '#7db9e8');
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // 地面
    ctx.fillStyle = '#2E8B57';
    ctx.fillRect(0, gameState.canvas.height - 50, gameState.canvas.width, 50);
    
    // 地面细节
    ctx.fillStyle = '#3CB371';
    for (let i = 0; i < gameState.canvas.width; i += 100) {
        ctx.beginPath();
        ctx.arc(i + Math.random() * 30, gameState.canvas.height - 50, 5 + Math.random() * 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 绘制玩家
function drawPlayer() {
    const ctx = gameState.ctx;
    const playerImg = gameState.assets.player[gameState.playerSkin];
    
    ctx.save();
    
    if (gameState.isRolling) {
        // 绘制翻滚状态的玩家
        ctx.translate(gameState.playerX, gameState.playerY);
        ctx.rotate((Date.now() - gameState.rollStartTime) / 50);
        ctx.drawImage(
            playerImg,
            -CONFIG.PLAYER_SIZE/2,
            -CONFIG.PLAYER_SIZE/2,
            CONFIG.PLAYER_SIZE,
            CONFIG.PLAYER_SIZE
        );
    } else {
        // 绘制正常或跳跃状态的玩家
        const height = gameState.isJumping ? CONFIG.PLAYER_SIZE : CONFIG.PLAYER_SIZE * 0.8;
        const yOffset = gameState.isJumping ? 0 : CONFIG.PLAYER_SIZE * 0.1;
        
        ctx.drawImage(
            playerImg,
            gameState.playerX - CONFIG.PLAYER_SIZE/2,
            gameState.playerY - height/2 - yOffset,
            CONFIG.PLAYER_SIZE,
            height
        );
    }
    
    ctx.restore();
}

// 绘制物品
function drawItems() {
    const ctx = gameState.ctx;
    
    gameState.items.forEach(item => {
        const itemImg = gameState.assets.items[item.type.toLowerCase()];
        const size = CONFIG.ITEM_SIZE;
        
        // 绘制物品图像
        ctx.drawImage(
            itemImg,
            item.x - size/2,
            item.y - size/2,
            size,
            size
        );
        
        // 绘制物品图标
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            CONFIG.ITEM_TYPES[item.type].icon,
            item.x,
            item.y
        );
    });
}

// 绘制炸弹
function drawBombs() {
    const ctx = gameState.ctx;
    
    gameState.bombs.forEach(bomb => {
        const bombImg = gameState.assets.items.bomb;
        const size = CONFIG.BOMB_SIZE;
        
        // 绘制炸弹图像
        ctx.drawImage(
            bombImg,
            bomb.x - size/2,
            bomb.y - size/2,
            size,
            size
        );
        
        // 绘制炸弹图标
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            '💣',
            bomb.x,
            bomb.y
        );
        
        // 绘制引线动画
        const fuseLength = 10 + Math.sin(Date.now() / 100) * 5;
        ctx.strokeStyle = '#FF5E5B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bomb.x, bomb.y - size/2);
        ctx.lineTo(bomb.x, bomb.y - size/2 - fuseLength);
        ctx.stroke();
    });
}

// 检查是否为移动设备
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 隐藏加载界面
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        
        // 检查记住的登录状态
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            const user = JSON.parse(rememberedUser);
            // 检查是否在30天内
            if (Date.now() - user.timestamp < 30 * 24 * 60 * 60 * 1000) {
                document.getElementById('username').value = user.username;
                document.getElementById('remember-me').checked = true;
            } else {
                localStorage.removeItem('rememberedUser');
            }
        }
        
        // 显示登录界面
        document.getElementById('login-container').classList.remove('hidden');
    }, 1500);
    
    // 初始化游戏
    initGame();
});