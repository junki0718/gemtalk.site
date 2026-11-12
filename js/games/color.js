/**
 * 색깔 맞추기 (Stroop Effect / Color Match)
 */
window.ColorMatchGame = {
  container: null,
  colorDefs: [
    { name: '빨강', hex: '#ef4444' },
    { name: '파랑', hex: '#3b82f6' },
    { name: '초록', hex: '#10b981' },
    { name: '노랑', hex: '#eab308' },
    { name: '보라', hex: '#8b5cf6' },
    { name: '주황', hex: '#f97316' }
  ],
  score: 0,
  combo: 0,
  timeLeft: 30,
  timerInterval: null,
  isPlaying: false,
  targetColorDef: null,
  displayWord: '',
  bestScore: 0,

  init(containerEl) {
    this.container = containerEl;
    this.bestScore = parseInt(localStorage.getItem('gt_best_colormatch') || '0', 10) || 0;
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 30;
    this.isPlaying = false;
    clearInterval(this.timerInterval);
    this.render();
  },

  render() {
    this.container.innerHTML = `
      <div class="game-flex-center">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          글자의 '의미'가 아닌 <strong>실제 칠해진 [글자 색상]</strong> 버튼을 선택하세요! 30초 동안 최대한 많은 점수를 획득하세요.
        </div>

        <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; justify-content:center;">
          <div class="stat-pill">남은 시간: <strong id="cmTimerText" style="color:#ef4444;">30초</strong></div>
          <div class="stat-pill">현재 점수: <strong id="cmScoreText">0점</strong></div>
          <div class="stat-pill">콤보: <strong id="cmComboText">0 COMBO</strong></div>
          <div class="stat-pill">최고 점수: <strong>${this.bestScore}점</strong></div>
        </div>

        <div id="cmStartScreen" style="text-align:center; padding:3rem 0;">
          <button class="btn btn-primary" style="font-size:1.2rem; padding:0.9rem 2.2rem;" onclick="ColorMatchGame.startGame()">🎮 게임 시작하기</button>
        </div>

        <div id="cmPlayScreen" style="display:none; width:100%; max-width:540px; text-align:center;">
          <div class="colormatch-word-display" id="cmWordDisplay">빨강</div>
          <div class="colormatch-options-grid" id="cmOptionsGrid"></div>
        </div>
      </div>
    `;
  },

  startGame() {
    this.isPlaying = true;
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 30;

    document.getElementById('cmStartScreen').style.display = 'none';
    document.getElementById('cmPlayScreen').style.display = 'block';

    this.nextRound();

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('cmTimerText').textContent = `${this.timeLeft}초`;
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);

    App.playSound('click');
  },

  nextRound() {
    // Pick text word and pick actual font color (different or sometimes same)
    const wordDef = this.colorDefs[Math.floor(Math.random() * this.colorDefs.length)];
    let colorDef = this.colorDefs[Math.floor(Math.random() * this.colorDefs.length)];

    // Target is the font color, not the word text!
    this.targetColorDef = colorDef;
    this.displayWord = wordDef.name;

    const wordEl = document.getElementById('cmWordDisplay');
    wordEl.textContent = this.displayWord;
    wordEl.style.color = colorDef.hex;

    // Render options buttons (shuffle colorDefs)
    const shuffled = [...this.colorDefs].sort(() => Math.random() - 0.5);
    const gridEl = document.getElementById('cmOptionsGrid');
    gridEl.innerHTML = shuffled.map(c => `
      <button class="colormatch-btn" onclick="ColorMatchGame.handleChoice('${c.name}')">
        <span style="color:${c.hex}; font-size:1.2rem;">●</span> ${c.name}
      </button>
    `).join('');
  },

  handleChoice(chosenName) {
    if (!this.isPlaying) return;

    if (chosenName === this.targetColorDef.name) {
      // Correct!
      this.combo++;
      const points = 10 + this.combo * 2;
      this.score += points;
      App.playSound('pop');
    } else {
      // Mistake!
      this.combo = 0;
      this.timeLeft = Math.max(0, this.timeLeft - 1); // small penalty
      App.playSound('wrong');
    }

    document.getElementById('cmScoreText').textContent = `${this.score}점`;
    document.getElementById('cmComboText').textContent = `${this.combo} COMBO`;

    this.nextRound();
  },

  endGame() {
    clearInterval(this.timerInterval);
    this.isPlaying = false;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('gt_best_colormatch', String(this.bestScore));
      App.updateRecordDisplay('colormatch', `${this.bestScore}점`);
      App.confettiBurst();
    }

    App.playSound('win');
    App.toast(`게임 종료! 최종 점수: ${this.score}점`);

    this.container.innerHTML = `
      <div class="game-flex-center">
        <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:2.5rem; text-align:center; max-width:480px; width:100%;">
          <h2 style="font-size:2rem; font-weight:900; margin-bottom:0.5rem;">🎉 게임 종료!</h2>
          <p style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:1.5rem;">당신의 인지 집중력 점수입니다.</p>
          <div style="font-size:3.5rem; font-weight:900; color:var(--primary-purple); margin-bottom:1rem;">${this.score}점</div>
          <div class="stat-pill" style="margin-bottom:1.5rem;">최고 기록: ${this.bestScore}점</div>
          <button class="btn btn-primary" style="padding:0.8rem 2rem;" onclick="ColorMatchGame.init(document.getElementById('gameStageContainer'))">다시 도전하기</button>
        </div>
      </div>
    `;
  },

  cleanup() {
    clearInterval(this.timerInterval);
    this.isPlaying = false;
  }
};
