/**
 * 업다운 게임 (Up & Down / Number Guessing)
 */
window.UpDownGame = {
  container: null,
  targetNumber: 0,
  minRange: 1,
  maxRange: 100,
  attempts: 0,
  history: [],
  isWon: false,
  bestAttempts: null,

  init(containerEl) {
    this.container = containerEl;
    this.bestAttempts = parseInt(localStorage.getItem('gt_best_updown') || '0', 10) || null;
    this.reset();
  },

  reset() {
    this.targetNumber = Math.floor(Math.random() * 100) + 1;
    this.minRange = 1;
    this.maxRange = 100;
    this.attempts = 0;
    this.history = [];
    this.isWon = false;
    this.render();
  },

  render() {
    this.container.innerHTML = `
      <div class="updown-container">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          1부터 100 사이의 숨겨진 숫자를 맞춰보세요! 입력한 숫자에 따라 UP 또는 DOWN 힌트가 주어집니다.
        </div>

        <div style="display:flex; gap:1rem; margin-bottom:1.25rem; justify-content:center;">
          <div class="stat-pill">시도 횟수: <strong id="updownAttempts" style="color:var(--primary-purple);">${this.attempts}회</strong></div>
          <div class="stat-pill">최소 시도 기록: <strong>${this.bestAttempts ? this.bestAttempts + '회' : '기록 없음'}</strong></div>
        </div>

        <div class="updown-range-indicator">
          <span style="color:#2563eb;" id="rangeMin">${this.minRange}</span>
          <span style="font-size:0.9rem; color:var(--text-muted);">현재 탐색 범위</span>
          <span style="color:#ef4444;" id="rangeMax">${this.maxRange}</span>
        </div>

        <div class="updown-hint-display" id="updownHintText">
          <span>숫자를 맞춰보세요!</span>
        </div>

        <div style="display:flex; gap:0.5rem; max-width:360px; margin:0 auto 1rem auto;">
          <input type="number" id="updownInput" class="typing-input" min="1" max="100" placeholder="숫자 입력 (1~100)" autofocus>
          <button class="btn btn-primary" onclick="UpDownGame.guess()" style="flex-shrink:0;">확인</button>
        </div>

        <div style="display:flex; gap:0.4rem; justify-content:center; margin-bottom:1.5rem;">
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.3rem 0.6rem;" onclick="UpDownGame.adjustInput(-5)">-5</button>
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.3rem 0.6rem;" onclick="UpDownGame.adjustInput(-1)">-1</button>
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.3rem 0.6rem;" onclick="UpDownGame.adjustInput(1)">+1</button>
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.3rem 0.6rem;" onclick="UpDownGame.adjustInput(5)">+5</button>
        </div>

        <div class="updown-history-list" id="updownHistory"></div>

        <div class="game-controls-bar">
          <button class="btn btn-secondary" onclick="UpDownGame.reset()">새 숫자로 다시 시작</button>
        </div>
      </div>
    `;

    document.getElementById('updownInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.guess();
    });
  },

  adjustInput(delta) {
    const input = document.getElementById('updownInput');
    let val = parseInt(input.value || '50', 10);
    val = Math.max(1, Math.min(100, val + delta));
    input.value = val;
  },

  guess() {
    if (this.isWon) return;
    const input = document.getElementById('updownInput');
    const val = parseInt(input.value, 10);

    if (isNaN(val) || val < 1 || val > 100) {
      App.toast('1부터 100 사이의 숫자를 입력해주세요.');
      return;
    }

    this.attempts++;
    document.getElementById('updownAttempts').textContent = `${this.attempts}회`;
    const hintEl = document.getElementById('updownHintText');

    if (val < this.targetNumber) {
      // UP
      this.minRange = Math.max(this.minRange, val + 1);
      hintEl.innerHTML = `<span style="color:#2563eb;">🔼 UP!</span> 더 큰 숫자입니다!`;
      this.history.unshift({ num: val, result: 'UP', type: 'up' });
      App.playSound('pop');
    } else if (val > this.targetNumber) {
      // DOWN
      this.maxRange = Math.min(this.maxRange, val - 1);
      hintEl.innerHTML = `<span style="color:#ef4444;">🔽 DOWN!</span> 더 작은 숫자입니다!`;
      this.history.unshift({ num: val, result: 'DOWN', type: 'down' });
      App.playSound('pop');
    } else {
      // Correct!
      this.isWon = true;
      hintEl.innerHTML = `<span style="color:#10b981;">🎉 정답! (${this.targetNumber})</span>`;
      this.history.unshift({ num: val, result: '정답 🎯', type: 'win' });
      this.finish();
      return;
    }

    document.getElementById('rangeMin').textContent = this.minRange;
    document.getElementById('rangeMax').textContent = this.maxRange;
    this.renderHistory();
    input.value = '';
    input.focus();
  },

  renderHistory() {
    const listEl = document.getElementById('updownHistory');
    listEl.innerHTML = this.history.map(item => `
      <span class="updown-guess-chip ${item.type}">
        ${item.num} (${item.result})
      </span>
    `).join('');
  },

  finish() {
    let isNewBest = false;
    if (!this.bestAttempts || this.attempts < this.bestAttempts) {
      this.bestAttempts = this.attempts;
      localStorage.setItem('gt_best_updown', String(this.bestAttempts));
      App.updateRecordDisplay('updown', `${this.bestAttempts}회`);
      isNewBest = true;
      App.confettiBurst();
    }

    App.playSound('win');
    App.toast(`🎉 정답 [${this.targetNumber}]! ${this.attempts}번 만에 맞췄습니다!`);

    let tier = '';
    if (this.attempts <= 4) tier = '👑 갓챠! 천재적인 감각!';
    else if (this.attempts <= 7) tier = '⚡ 이진 탐색의 달인!';
    else tier = '👍 끝까지 찾아낸 끈기!';

    setTimeout(() => {
      this.container.innerHTML = `
        <div class="game-flex-center">
          <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:2.5rem; text-align:center; max-width:480px; width:100%;">
            <h2 style="font-size:2rem; font-weight:900; margin-bottom:0.5rem;">🎉 정답: ${this.targetNumber}</h2>
            <p style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:1.5rem;">${isNewBest ? '✨ 최소 시도 신기록 달성!' : '성공!'}</p>
            <div style="font-size:3.2rem; font-weight:900; color:var(--primary-purple); margin-bottom:0.5rem;">${this.attempts}회 시도</div>
            <div style="font-weight:800; font-size:1.1rem; color:var(--primary-mint); margin-bottom:1.5rem;">${tier}</div>
            <button class="btn btn-primary" style="padding:0.8rem 2rem;" onclick="UpDownGame.init(document.getElementById('gameStageContainer'))">다시 하기</button>
          </div>
        </div>
      `;
    }, 1200);
  }
};
