/**
 * 룰렛 돌리기 (Roulette / Wheel of Fortune)
 */
window.RouletteGame = {
  container: null,
  canvas: null,
  ctx: null,
  items: ['치킨 🍗', '피자 🍕', '초밥 🍣', '삼겹살 🥩', '햄버거 🍔', '커피 ☕', '꽝 💥', '한번 더 🔄'],
  colors: ['#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#a78bfa'],
  currentRotation: 0,
  isSpinning: false,

  init(containerEl) {
    this.container = containerEl;
    this.render();
  },

  render() {
    this.container.innerHTML = `
      <div class="roulette-container">
        <div class="roulette-wheel-wrapper">
          <div class="roulette-pointer"></div>
          <canvas id="rouletteCanvas" width="380" height="380"></canvas>
          <div class="roulette-center-cap">GO!</div>
        </div>

        <div class="roulette-controls">
          <h3 style="font-weight:800; margin-bottom:0.75rem;">항목 편집</h3>
          
          <div style="display:flex; gap:0.4rem; margin-bottom:0.75rem;">
            <input type="text" id="newRouletteItem" class="ladder-input" placeholder="새 항목 입력" style="flex:1;">
            <button class="btn btn-primary" style="padding:0.45rem 0.85rem;" onclick="RouletteGame.addItem()">추가</button>
          </div>

          <div class="roulette-item-list" id="rouletteItemList"></div>

          <div style="display:flex; gap:0.4rem; margin-top:0.75rem;">
            <button class="btn btn-secondary" style="flex:1; font-size:0.8rem; padding:0.4rem;" onclick="RouletteGame.loadPreset('lunch')">점심 메뉴</button>
            <button class="btn btn-secondary" style="flex:1; font-size:0.8rem; padding:0.4rem;" onclick="RouletteGame.loadPreset('penalty')">내기 벌칙</button>
            <button class="btn btn-secondary" style="flex:1; font-size:0.8rem; padding:0.4rem;" onclick="RouletteGame.loadPreset('numbers')">숫자 추첨</button>
          </div>

          <div style="margin-top:1.25rem;">
            <button id="spinBtn" class="btn btn-primary" style="width:100%; font-size:1.1rem; padding:0.85rem;" onclick="RouletteGame.spin()">🎡 룰렛 돌리기!</button>
          </div>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('rouletteCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.renderItemList();
    this.drawWheel();

    // Allow Enter key to add item
    document.getElementById('newRouletteItem').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addItem();
    });
  },

  renderItemList() {
    const listEl = document.getElementById('rouletteItemList');
    listEl.innerHTML = this.items.map((item, idx) => `
      <div class="roulette-item-row">
        <div class="roulette-color-dot" style="background:${this.colors[idx % this.colors.length]};"></div>
        <span style="flex:1; font-weight:600; font-size:0.9rem;">${item}</span>
        <button style="border:none; background:none; color:#ef4444; cursor:pointer; font-weight:bold;" onclick="RouletteGame.removeItem(${idx})">×</button>
      </div>
    `).join('');
  },

  addItem() {
    const input = document.getElementById('newRouletteItem');
    const val = input.value.trim();
    if (!val) return;
    if (this.items.length >= 16) {
      App.toast('최대 16개 항목까지 추가 가능합니다.');
      return;
    }
    this.items.push(val);
    input.value = '';
    this.renderItemList();
    this.drawWheel();
    App.playSound('click');
  },

  removeItem(idx) {
    if (this.items.length <= 2) {
      App.toast('최소 2개 항목은 유지되어야 합니다.');
      return;
    }
    this.items.splice(idx, 1);
    this.renderItemList();
    this.drawWheel();
    App.playSound('click');
  },

  loadPreset(type) {
    if (type === 'lunch') {
      this.items = ['짜장면 🍜', '삼겹살 🥩', '마라탕 🍲', '샐러드 🥗', '초밥 🍣', '돈까스 🍱', '김치찌개 🍲', '햄버거 🍔'];
    } else if (type === 'penalty') {
      this.items = ['커피 쏘기 ☕', '노래 부르기 🎤', '엉덩이로 이름쓰기 🍑', '벌주 마시기 🍺', '다음 모임 간식 🍪', '안마 해주기 💆'];
    } else if (type === 'numbers') {
      this.items = ['1번', '2번', '3번', '4번', '5번', '6번'];
    }
    this.renderItemList();
    this.drawWheel();
    App.playSound('click');
  },

  drawWheel() {
    const { ctx, canvas, items, colors, currentRotation } = this;
    const numSlices = items.length;
    const sliceAngle = (Math.PI * 2) / numSlices;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);

    for (let i = 0; i < numSlices; i++) {
      const angle = i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 14px Pretendard, sans-serif';
      ctx.fillText(items[i], radius - 20, 5);
      ctx.restore();
    }

    ctx.restore();
  },

  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    document.getElementById('spinBtn').disabled = true;

    const spins = 5 + Math.random() * 5; // 5 to 10 full spins
    const extraAngle = Math.random() * Math.PI * 2;
    const totalAngle = spins * Math.PI * 2 + extraAngle;
    const duration = 4000;
    const startAngle = this.currentRotation;
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      this.currentRotation = startAngle + totalAngle * ease;
      this.drawWheel();

      if (Math.floor(elapsed / 160) % 2 === 0) {
        App.playSound('tick');
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        document.getElementById('spinBtn').disabled = false;
        this.determineWinner();
      }
    };

    requestAnimationFrame(animate);
  },

  determineWinner() {
    const numSlices = this.items.length;
    const sliceAngle = (Math.PI * 2) / numSlices;
    // Pointer is at top: 3*PI/2
    const normalizedAngle = (Math.PI * 1.5 - (this.currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const winningIdx = Math.floor(normalizedAngle / sliceAngle) % numSlices;
    const winner = this.items[winningIdx];

    App.playSound('win');
    App.confettiBurst();
    App.toast(`🎉 당첨 결과: [${winner}]! 축하합니다!`);
  }
};
