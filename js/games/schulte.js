/**
 * 숫자 순서 맞추기 (Schulte Grid 1 to 25)
 */
window.SchulteGame = {
  container: null,
  currentNumber: 1,
  startTime: null,
  timerInterval: null,
  elapsedMs: 0,
  isPlaying: false,
  bestTime: null, // in seconds string or ms

  init(containerEl) {
    this.container = containerEl;
    this.bestTime = localStorage.getItem('gt_best_schulte') || null;
    this.isPlaying = false;
    clearInterval(this.timerInterval);
    this.render();
  },

  render() {
    this.container.innerHTML = `
      <div class="game-flex-center">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          1부터 25까지의 숫자를 순서대로 빠르게 찾아 클릭하세요. 1번을 누르는 순간 타이머가 시작됩니다!
        </div>

        <div style="display:flex; gap:1rem; margin-bottom:1rem; flex-wrap:wrap; justify-content:center;">
          <div class="stat-pill">다음 찾을 숫자: <strong id="schulteNextText" style="color:var(--primary-purple); font-size:1.15rem;">1</strong></div>
          <div class="stat-pill">경과 시간: <strong id="schulteStopwatch">0.00 초</strong></div>
          <div class="stat-pill">최고 기록: <strong>${this.bestTime ? this.bestTime + '초' : '기록 없음'}</strong></div>
        </div>

        <div class="schulte-grid" id="schulteGrid"></div>

        <div class="game-controls-bar">
          <button class="btn btn-secondary" onclick="SchulteGame.reset()">판 다시 섞기</button>
        </div>
      </div>
    `;

    this.setupGrid();
  },

  setupGrid() {
    this.currentNumber = 1;
    this.isPlaying = false;
    this.elapsedMs = 0;
    clearInterval(this.timerInterval);

    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    // Shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    const gridEl = document.getElementById('schulteGrid');
    gridEl.innerHTML = numbers.map(num => `
      <div class="schulte-cell" id="schulteCell_${num}" onclick="SchulteGame.handleClick(${num})">${num}</div>
    `).join('');
  },

  handleClick(num) {
    if (num === this.currentNumber) {
      // First click starts timer
      if (num === 1 && !this.isPlaying) {
        this.isPlaying = true;
        this.startTime = performance.now();
        this.timerInterval = setInterval(() => {
          this.elapsedMs = performance.now() - this.startTime;
          document.getElementById('schulteStopwatch').textContent = `${(this.elapsedMs / 1000).toFixed(2)} 초`;
        }, 30);
      }

      // Mark cell as clicked
      const cell = document.getElementById(`schulteCell_${num}`);
      if (cell) cell.classList.add('clicked');
      App.playSound('pop');

      this.currentNumber++;

      if (this.currentNumber > 25) {
        this.finish();
      } else {
        document.getElementById('schulteNextText').textContent = this.currentNumber;
      }
    } else {
      App.playSound('wrong');
    }
  },

  finish() {
    clearInterval(this.timerInterval);
    this.isPlaying = false;
    const finalSeconds = (this.elapsedMs / 1000).toFixed(2);

    let isNewBest = false;
    if (!this.bestTime || parseFloat(finalSeconds) < parseFloat(this.bestTime)) {
      this.bestTime = finalSeconds;
      localStorage.setItem('gt_best_schulte', String(this.bestTime));
      App.updateRecordDisplay('schulte', `${this.bestTime}초`);
      isNewBest = true;
      App.confettiBurst();
    }

    App.playSound('win');
    App.toast(`🎉 25번까지 모두 찾았습니다! 기록: ${finalSeconds}초`);

    let tier = '';
    const sec = parseFloat(finalSeconds);
    if (sec < 15) tier = '👑 S급 (초인적인 시야)';
    else if (sec < 25) tier = '⚡ A급 (매우 빠른 반응)';
    else if (sec < 35) tier = '👍 B급 (우수한 집중력)';
    else tier = '🌱 C급 (더 빨라질 수 있어요!)';

    this.container.innerHTML = `
      <div class="game-flex-center">
        <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:2.5rem; text-align:center; max-width:480px; width:100%;">
          <h2 style="font-size:2rem; font-weight:900; margin-bottom:0.5rem;">🎉 정복 완료!</h2>
          <p style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:1.5rem;">${isNewBest ? '✨ 신기록 달성!' : '최종 기록'}</p>
          <div style="font-size:3.5rem; font-weight:900; color:var(--primary-purple); margin-bottom:0.5rem;">${finalSeconds}초</div>
          <div style="font-weight:800; font-size:1.1rem; color:var(--primary-mint); margin-bottom:1.5rem;">${tier}</div>
          <button class="btn btn-primary" style="padding:0.8rem 2rem;" onclick="SchulteGame.init(document.getElementById('gameStageContainer'))">다시 도전하기</button>
        </div>
      </div>
    `;
  },

  reset() {
    this.setupGrid();
    document.getElementById('schulteNextText').textContent = '1';
    document.getElementById('schulteStopwatch').textContent = '0.00 초';
    App.playSound('click');
  },

  cleanup() {
    clearInterval(this.timerInterval);
    this.isPlaying = false;
  }
};
