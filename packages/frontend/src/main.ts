import './style.css';
import axios from 'axios';
import * as PIXI from 'pixi.js';

// API URL
const API_URL = 'http://localhost:3001/api';

// State variables
let isSpinning = false;
let userVerified = false;
let isAdmin = false;
let adminToken = '';

// DOM elements
const app = document.querySelector<HTMLDivElement>('#app')!;

// Check if we're in admin mode
const isAdminMode = window.location.hash === '#admin';

if (isAdminMode) {
  renderAdminLogin();
} else {
  renderUserPage();
}

// Render user page (lottery)
function renderUserPage() {
  app.innerHTML = `
    <div class="container">
      <h1>幸运抽奖</h1>
      <div class="phone-input">
        <input type="tel" id="phone-number" placeholder="请输入您的手机号码" maxlength="11" />
        <button id="verify-btn">验证</button>
      </div>
      <div id="message" class="message"></div>
      <div id="wheel-container" class="wheel-container">
        <canvas id="wheel-canvas"></canvas>
        <button id="spin-btn" disabled>开始抽奖</button>
      </div>
      <div id="result" class="result"></div>
    </div>
  `;

  // Get DOM elements
  const phoneInput = document.querySelector<HTMLInputElement>('#phone-number')!;
  const verifyBtn = document.querySelector<HTMLButtonElement>('#verify-btn')!;
  const spinBtn = document.querySelector<HTMLButtonElement>('#spin-btn')!;
  const messageEl = document.querySelector<HTMLDivElement>('#message')!;
  const resultEl = document.querySelector<HTMLDivElement>('#result')!;

  // Initialize PIXI Application
  const pixiApp = new PIXI.Application({
    view: document.querySelector('#wheel-canvas') as HTMLCanvasElement,
    width: 300,
    height: 300,
    backgroundColor: 0xffffff,
  });

  // Prizes array (will be populated from API)
  let prizes: any[] = [];

  // Verify phone number
  verifyBtn.addEventListener('click', async () => {
    const phoneNumber = phoneInput.value.trim();
    if (!phoneNumber) {
      showMessage('请输入手机号码', 'error');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
      showMessage('请输入正确的手机号码格式', 'error');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/verify`, { phoneNumber });
      if (response.data.success) {
        if (response.data.data.hasParticipatedToday) {
          showMessage('您今天已经参与过抽奖，请明天再来！', 'error');
        } else {
          showMessage('验证成功，请点击开始抽奖', 'success');
          userVerified = true;
          spinBtn.disabled = false;
          verifyBtn.disabled = true;
          phoneInput.disabled = true;
          
          // Fetch prizes data
          fetchPrizes();
        }
      }
    } catch (error: any) {
      showMessage(error.response?.data?.message || '验证失败，请稍后再试', 'error');
    }
  });

  // Fetch prizes
  async function fetchPrizes() {
    try {
      const response = await axios.get(`${API_URL}/prizes`);
      if (response.data.success) {
        prizes = response.data.data;
        createWheel(prizes);
      }
    } catch (error) {
      showMessage('获取奖品信息失败', 'error');
    }
  }

  // Create the wheel
  function createWheel(prizes: any[]) {
    const container = new PIXI.Container();
    pixiApp.stage.addChild(container);
    container.position.set(pixiApp.screen.width / 2, pixiApp.screen.height / 2);

    const wheel = new PIXI.Graphics();
    container.addChild(wheel);

    // 计算总概率
    const totalProbability = prizes.reduce((sum, p) => sum + (p.probability || 0), 0);
    const radius = 130;
    let startAngle = 0;

    // Draw wheel segments
    prizes.forEach((prize, index) => {
      const prob = prize.probability || 0;
      const sliceAngle = (prob / totalProbability) * Math.PI * 2;
      wheel.beginFill(index % 2 === 0 ? 0xff9000 : 0xffdd00);
      wheel.moveTo(0, 0);
      wheel.arc(0, 0, radius, startAngle, startAngle + sliceAngle);
      wheel.lineTo(0, 0);
      wheel.endFill();

      // 动态计算字体大小和最大宽度
      const minFont = 12;
      const maxFont = 18;
      // 扇区弧长决定最大宽度
      const arcLength = radius * sliceAngle;
      const maxTextWidth = Math.max(arcLength * 0.7, 40);
      // 字体大小随扇区角度变化
      let fontSize = Math.max(minFont, Math.min(maxFont, arcLength / 2.5));

      // 处理奖品名过长，自动截断加省略号
      let displayName = prize.name;
      const tempText = new PIXI.Text(displayName, {
        fontFamily: 'Arial',
        fontSize,
        fill: 0x000000,
        align: 'center',
        fontWeight: 'bold',
        stroke: 0xffffff,
        strokeThickness: 2,
      });
      while (tempText.width > maxTextWidth && displayName.length > 2) {
        displayName = displayName.slice(0, -1);
        tempText.text = displayName + '…';
      }
      if (displayName.length < prize.name.length) {
        displayName = displayName + '…';
      }
      // 重新创建最终文本
      const text = new PIXI.Text(displayName, {
        fontFamily: 'Arial',
        fontSize,
        fill: 0x000000,
        align: 'center',
        fontWeight: 'bold',
        stroke: 0xffffff,
        strokeThickness: 2,
        wordWrap: false,
      });
      text.anchor.set(0.5);
      const textRadius = radius * 0.7;
      const middleAngle = startAngle + sliceAngle / 2;
      text.position.set(
        Math.cos(middleAngle) * textRadius,
        Math.sin(middleAngle) * textRadius
      );
      text.rotation = middleAngle + Math.PI / 2;
      container.addChild(text);

      startAngle += sliceAngle;
    });

    // Add pointer
    const pointer = new PIXI.Graphics();
    pointer.beginFill(0xff0000);
    pointer.moveTo(-10, -radius - 10);
    pointer.lineTo(10, -radius - 10);
    pointer.lineTo(0, -radius + 10);
    pointer.lineTo(-10, -radius - 10);
    pointer.endFill();
    pixiApp.stage.addChild(pointer);
    pointer.position.set(pixiApp.screen.width / 2, pixiApp.screen.height / 2);
  }

  // Spin the wheel
  spinBtn.addEventListener('click', async () => {
    if (!userVerified || isSpinning) return;
    
    const phoneNumber = phoneInput.value.trim();
    isSpinning = true;
    spinBtn.style.display = 'none';
    
    try {
      // Send draw request
      const response = await axios.post(`${API_URL}/prizes/draw`, { phoneNumber });
      if (response.data.success) {
        const prize = response.data.data;
        
        // Find the index of the won prize
        const prizeIndex = prizes.findIndex(p => p.id === prize.id);
        
        if (prizeIndex !== -1) {
          // Calculate rotation
          const totalSlices = prizes.length;
          const sliceAngle = 360 / totalSlices;
          
          // Calculate target angle (additional 5 rotations for effect)
          let targetAngle = 1800 + (totalSlices - prizeIndex - 1) * sliceAngle;
          
          // Animate the wheel
          let currentAngle = 0;
          let spinSpeed = 0;
          const maxSpeed = 30;
          const acceleration = 2;
          const deceleration = 0.95;
          
          // Animation
          const wheelContainer = pixiApp.stage.getChildAt(0) as PIXI.Container;
          
          function animate() {
            if (currentAngle < targetAngle / 2) {
              // Accelerating phase
              spinSpeed = Math.min(spinSpeed + acceleration, maxSpeed);
            } else {
              // Decelerating phase
              spinSpeed *= deceleration;
            }
            
            currentAngle += spinSpeed;
            wheelContainer.rotation = currentAngle * (Math.PI / 180);
            
            if (currentAngle < targetAngle && spinSpeed > 0.1) {
              requestAnimationFrame(animate);
            } else {
              // Animation completed
              isSpinning = false;
              // Show result
              showResult(`恭喜您获得了: ${prize.name}`);
            }
          }
          
          animate();
        }
      }
    } catch (error: any) {
      isSpinning = false;
      showMessage(error.response?.data?.message || '抽奖失败，请稍后再试', 'error');
    }
  });

  // Show message
  function showMessage(message: string, type: 'success' | 'error') {
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    
    // Hide after 3 seconds
    setTimeout(() => {
      messageEl.textContent = '';
      messageEl.className = 'message';
    }, 3000);
  }

  // Show result
  function showResult(result: string) {
    resultEl.textContent = result;
    resultEl.style.display = 'block';
  }
}

// Render admin login page
function renderAdminLogin() {
  app.innerHTML = `
    <div class="container admin-container">
      <h1>管理员登录</h1>
      <div class="admin-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input type="text" id="username" placeholder="请输入用户名" />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" placeholder="请输入密码" />
        </div>
        <button id="login-btn">登录</button>
        <div id="admin-message" class="message"></div>
      </div>
      <div class="back-link">
        <a href="#">返回抽奖页</a>
      </div>
    </div>
  `;

  const usernameInput = document.querySelector<HTMLInputElement>('#username')!;
  const passwordInput = document.querySelector<HTMLInputElement>('#password')!;
  const loginBtn = document.querySelector<HTMLButtonElement>('#login-btn')!;
  const messageEl = document.querySelector<HTMLDivElement>('#admin-message')!;

  loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showAdminMessage('请输入用户名和密码', 'error');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/admin/login`, { username, password });
      if (response.data.success) {
        // 保存 token
        adminToken = response.data.token;
        isAdmin = true;
        showAdminMessage('登录成功', 'success');
        
        // 延迟加载管理页面
        setTimeout(() => {
          renderAdminPanel();
        }, 1000);
      }
    } catch (error: any) {
      showAdminMessage(error.response?.data?.message || '登录失败', 'error');
    }
  });

  function showAdminMessage(message: string, type: 'success' | 'error') {
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
  }
}

// Render admin panel
function renderAdminPanel() {
  app.innerHTML = `
    <div class="container admin-container">
      <h1>奖品管理系统</h1>
      <div class="admin-tabs">
        <button id="tab-upload" class="tab-btn active">上传用户数据</button>
        <button id="tab-prizes" class="tab-btn">奖品配置</button>
      </div>
      
      <div id="upload-panel" class="panel">
        <h2>上传用户数据</h2>
        <div class="upload-form">
          <div class="file-input-container">
            <input type="file" id="file-input" accept=".xlsx,.xls" />
            <label for="file-input" class="file-label">选择 Excel 文件</label>
            <span id="file-name">未选择文件</span>
          </div>
          <button id="upload-btn">上传</button>
        </div>
        <div class="excel-format">
          <h3>Excel 格式说明</h3>
          <p>请确保 Excel 文件包含以下列：</p>
          <ul>
            <li>手机号（必须）</li>
            <li>姓名（可选）</li>
          </ul>
        </div>
        <div id="upload-message" class="message"></div>
      </div>
      
      <div id="prizes-panel" class="panel" style="display:none;">
        <h2>奖品配置</h2>
        <table id="prizes-table" class="prizes-table">
          <thead>
            <tr>
              <th>奖品级别</th>
              <th>奖品名称</th>
              <th>描述</th>
              <th>库存</th>
              <th>概率(%)</th>
            </tr>
          </thead>
          <tbody>
            <!-- 将由 JavaScript 填充 -->
          </tbody>
        </table>
        <button id="save-prizes-btn">保存配置</button>
        <div id="prizes-message" class="message"></div>
      </div>
      
      <div class="logout-section">
        <button id="logout-btn">登出</button>
        <a href="#">返回抽奖页</a>
      </div>
    </div>
  `;

  // Tab switching
  const tabUpload = document.querySelector<HTMLButtonElement>('#tab-upload')!;
  const tabPrizes = document.querySelector<HTMLButtonElement>('#tab-prizes')!;
  const uploadPanel = document.querySelector<HTMLDivElement>('#upload-panel')!;
  const prizesPanel = document.querySelector<HTMLDivElement>('#prizes-panel')!;

  tabUpload.addEventListener('click', () => {
    tabUpload.classList.add('active');
    tabPrizes.classList.remove('active');
    uploadPanel.style.display = 'block';
    prizesPanel.style.display = 'none';
  });

  tabPrizes.addEventListener('click', () => {
    tabPrizes.classList.add('active');
    tabUpload.classList.remove('active');
    prizesPanel.style.display = 'block';
    uploadPanel.style.display = 'none';
    loadPrizeConfig();
  });

  // File upload
  const fileInput = document.querySelector<HTMLInputElement>('#file-input')!;
  const fileName = document.querySelector<HTMLSpanElement>('#file-name')!;
  const uploadBtn = document.querySelector<HTMLButtonElement>('#upload-btn')!;
  const uploadMessage = document.querySelector<HTMLDivElement>('#upload-message')!;

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      fileName.textContent = fileInput.files[0].name;
    } else {
      fileName.textContent = '未选择文件';
    }
  });

  uploadBtn.addEventListener('click', async () => {
    if (!fileInput.files || !fileInput.files[0]) {
      showMessage(uploadMessage, '请选择文件', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      const response = await axios.post(`${API_URL}/admin/upload-users`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        showMessage(uploadMessage, response.data.message, 'success');
        // Reset file input
        fileInput.value = '';
        fileName.textContent = '未选择文件';
      }
    } catch (error: any) {
      showMessage(uploadMessage, error.response?.data?.message || '上传失败', 'error');
    }
  });

  // Prize configuration
  const prizesTable = document.querySelector<HTMLTableElement>('#prizes-table')!;
  const savePrizesBtn = document.querySelector<HTMLButtonElement>('#save-prizes-btn')!;
  const prizesMessage = document.querySelector<HTMLDivElement>('#prizes-message')!;

  // Load prize configuration
  async function loadPrizeConfig() {
    try {
      const response = await axios.get(`${API_URL}/admin/prizes/config`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        // Get prize data to display in the table
        const prizesResponse = await axios.get(`${API_URL}/prizes`);
        
        if (prizesResponse.data.success) {
          const prizes = prizesResponse.data.data;
          const probabilities = response.data.data.probabilities;
          
          // Clear table body
          const tbody = prizesTable.querySelector('tbody')!;
          tbody.innerHTML = '';
          
          // Add rows for each prize level
          prizes.sort((a: any, b: any) => a.level - b.level).forEach((prize: any) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>
                ${getLevelName(prize.level)}
                <input type="hidden" class="prize-id" value="${prize.id}">
                <input type="hidden" class="prize-level" value="${prize.level}">
              </td>
              <td><input type="text" class="prize-name" value="${prize.name}"></td>
              <td><input type="text" class="prize-desc" value="${prize.description}"></td>
              <td><input type="number" class="prize-stock" value="${prize.stock}" min="0"></td>
              <td><input type="number" class="prize-prob" value="${probabilities[prize.level]}" min="0" max="100" step="0.1"></td>
            `;
            tbody.appendChild(row);
          });
        }
      }
    } catch (error: any) {
      showMessage(prizesMessage, error.response?.data?.message || '加载失败', 'error');
    }
  }

  // Save prize configuration
  savePrizesBtn.addEventListener('click', async () => {
    // Get probabilities from inputs
    const probabilityInputs = document.querySelectorAll<HTMLInputElement>('.prize-prob');
    const probabilities: Record<number, number> = {};
    let totalProbability = 0;
    
    probabilityInputs.forEach(input => {
      const row = input.closest('tr')!;
      const levelInput = row.querySelector<HTMLInputElement>('.prize-level')!;
      const level = parseInt(levelInput.value);
      const probability = parseFloat(input.value);
      
      probabilities[level] = probability;
      totalProbability += probability;
    });
    
    // Check if total probability is 100%
    if (Math.abs(totalProbability - 100) > 0.1) {
      showMessage(prizesMessage, '所有奖品概率总和必须为100%', 'error');
      return;
    }
    
    try {
      // Save probabilities
      const configResponse = await axios.put(
        `${API_URL}/admin/prizes/config`,
        { probabilities },
        { headers: { 'Authorization': `Bearer ${adminToken}` } }
      );
      
      if (configResponse.data.success) {
        showMessage(prizesMessage, '奖品配置保存成功', 'success');
      }
    } catch (error: any) {
      showMessage(prizesMessage, error.response?.data?.message || '保存失败', 'error');
    }
  });

  // Logout
  const logoutBtn = document.querySelector<HTMLButtonElement>('#logout-btn')!;
  
  logoutBtn.addEventListener('click', () => {
    adminToken = '';
    isAdmin = false;
    renderAdminLogin();
  });

  // Helper functions
  function getLevelName(level: number): string {
    switch (level) {
      case 1: return '一等奖';
      case 2: return '二等奖';
      case 3: return '三等奖';
      case 4: return '参与奖';
      default: return `奖品 ${level}`;
    }
  }
}

// Generic message display function
function showMessage(element: HTMLElement, message: string, type: 'success' | 'error') {
  element.textContent = message;
  element.className = `message ${type}`;
  
  // Hide after 3 seconds
  setTimeout(() => {
    element.textContent = '';
    element.className = 'message';
  }, 3000);
}

// Listen for hash changes to handle navigation
window.addEventListener('hashchange', () => {
  const isAdminMode = window.location.hash === '#admin';
  
  if (isAdminMode) {
    if (isAdmin) {
      renderAdminPanel();
    } else {
      renderAdminLogin();
    }
  } else {
    renderUserPage();
  }
}); 