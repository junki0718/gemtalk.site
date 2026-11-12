/**
 * 반응속도 테스트 (Reaction Time Test)
 */
window.ReactionGame = {
  container: null,
  state: 'idle', // 'idle', 'waiting', 'ready', 'result', 'early'
  timerId: null,
  startTime: 0,
  reactionTime: 0,
  history: [],
  bestScore: null,

  init(containerEl) {
    this.container = containerEl;
    this.bestScore = parseInt(localStorage.getItem('gt_best_reaction') || '0', 10) || null;
    this.history = [];
    this.state = 'idle';
    this.render();
  },

  render() {
    this.container.innerHTML = `
      <div class="game-flex-center">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          화면을 클릭하여 시작하세요. 화면이 [초록색]으로 바뀌는 순간 최대한 빠르게 클릭하세요!
        </div>

        <div style="display:flex; gap:1rem; margin-bottom:1.25rem;">
          <div class="stat-pill">내 최고 기록: <strong id="reactionBestText">${this.bestScore ? this.bestScore + ' ms' : '기록 없음'}</strong></div>
          <div class="stat-pill">진행 회차: <strong id="reactionRoundsText">${this.history.length}/5</strong></div>
          <div class="stat-pill">5회 평균: <strong id="reactionAvgText">-</strong></div>
        </div>

        <div class="reaction-screen state-result" id="reactionScreen" onclick="ReactionGame.handleClick()">
          <h2 id="reactionMainText">터치하여 시작</h2>
          <p id="reactionSubText">초록색이 되면 즉시 클릭하세요</p>
        </div>

        <div class="game-controls-bar">
          <button class="btn btn-secondary" onclick="ReactionGame.resetGame()">기록 초기화 및 다시 시작</button>
        </div>
      </div>
    `;
  },

  handleClick() {
    const screen = document.getElementById('reactionScreen');
    const mainText = document.getElementById('reactionMainText');
    const subText = document.getElementById('reactionSubText');

    if (this.state === 'idle' || this.state === 'result' || this.state === 'early') {
      // Transition to Waiting state (Red)
      this.state = 'waiting';
      screen.className = 'reaction-screen state-wait';
      mainText.textContent = '기다리세요...';
      subText.textContent = '초록색으로 바뀔 때까지 클릭하지 마세요';
      App.playSound('tick');

      // Random delay between 1.8s and 4.8s
      const delay = 1800 + Math.random() * 3000;
      this.timerId = setTimeout(() => {
        this.state = 'ready';
        this.startTime = performance.now();
        screen.className = 'reaction-screen state-ready';
        mainText.textContent = '지금 클릭하세요!';
        subText.textContent = '빠르게 터치!';
        App.playSound('pop');
      }, delay);

    } else if (this.state === 'waiting') {
      // Clicked too early!
      clearTimeout(this.timerId);
      this.state = 'early';
      screen.className = 'reaction-screen state-early';
      mainText.textContent = '너무 일찍 눌렀습니다!';
      subText.textContent = '초록색이 되기 전에 클릭했습니다. 다시 터치하세요.';
      App.playSound('wrong');

    } else if (this.state === 'ready') {
      // Successful reaction click!
      const endTime = performance.now();
      this.reactionTime = Math.round(endTime - this.startTime);
      this.history.push(this.reactionTime);

      this.state = 'result';
      screen.className = 'reaction-screen state-result';
      mainText.textContent = `${this.reactionTime} ms`;

      let tier = '';
      if (this.reactionTime < 210) tier = '⚡ 신의 반응속도 (프로게이머)';
      else if (this.reactionTime < 270) tier = '🚀 상위 10% (엄청난 순발력)';
      else if (this.reactionTime < 340) tier = '👍 평균적인 인간의 반응속도';
      else tier = '🐢 조금 느려요! 더 집중해보세요';

      subText.textContent = `${tier} - 터치하여 다음 측정 진행`;

      // Check Best score
      if (!this.bestScore || this.reactionTime < this.bestScore) {
        this.bestScore = this.reactionTime;
        localStorage.setItem('gt_best_reaction', String(this.bestScore));
        App.updateRecordDisplay('reaction', `${this.bestScore} ms`);
        App.confettiBurst();
      }

      App.playSound('win');
      this.updateStats();

      if (this.history.length === 5) {
        const sum = this.history.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / 5);
        App.toast(`🎯 5회 완료! 평균 반응속도: ${avg} ms`);
      }
    }
  },

  updateStats() {
    const bestEl = document.getElementById('reactionBestText');
    const roundsEl = document.getElementById('reactionRoundsText');
    const avgEl = document.getElementById('reactionAvgText');

    if (bestEl) bestEl.textContent = this.bestScore ? `${this.bestScore} ms` : '-';
    if (roundsEl) roundsEl.textContent = `${this.history.length}/5`;

    if (avgEl && this.history.length > 0) {
      const avg = Math.round(this.history.reduce((a, b) => a + b, 0) / this.history.length);
      avgEl.textContent = `${avg} ms`;
    }
  },

  resetGame() {
    clearTimeout(this.timerId);
    this.history = [];
    this.state = 'idle';
    this.render();
    App.playSound('click');
  },

  cleanup() {
    clearTimeout(this.timerId);
    this.state = 'idle';
  }
};
