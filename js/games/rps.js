/**
 * 가위바위보 (Rock Paper Scissors)
 */
window.RpsGame = {
  container: null,
  streak: 0,
  maxStreak: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  isRolling: false,

  choices: [
    { id: 'rock', name: '바위', icon: '✊' },
    { id: 'scissors', name: '가위', icon: '✌️' },
    { id: 'paper', name: '보', icon: '🖐️' }
  ],

  init(containerEl) {
    this.container = containerEl;
    this.maxStreak = parseInt(localStorage.getItem('gt_best_rps') || '0', 10) || 0;
    this.streak = 0;
    this.wins = 0;
    this.draws = 0;
    this.losses = 0;
    this.render();
  },

  render() {
    this.container.innerHTML = `
      <div class="game-flex-center">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          가위, 바위, 보 중 하나를 선택하여 컴퓨터와 대결하세요. 최고 연승 기록을 깨보세요!
        </div>

        <div style="display:flex; gap:0.75rem; justify-content:center; margin-bottom:1.25rem; flex-wrap:wrap;">
          <div class="stat-pill">현재 연승: <strong id="rpsStreakText" style="color:#ef4444;">${this.streak}연승</strong></div>
          <div class="stat-pill">최고 연승: <strong>${this.maxStreak}연승</strong></div>
          <div class="stat-pill">전적: <strong id="rpsRecordText">${this.wins}승 ${this.draws}무 ${this.losses}패</strong></div>
        </div>

        <div class="rps-battle-arena">
          <div class="rps-fighter-box">
            <span class="rps-fighter-badge">나 (PLAYER)</span>
            <div class="rps-hand-display" id="playerHand">❓</div>
          </div>

          <div style="font-size:2rem; font-weight:900; color:var(--text-muted);">VS</div>

          <div class="rps-fighter-box">
            <span class="rps-fighter-badge">컴퓨터 (CPU)</span>
            <div class="rps-hand-display" id="cpuHand">❓</div>
          </div>
        </div>

        <div id="rpsResultBanner" style="font-size:1.6rem; font-weight:900; margin:0.5rem 0 1.5rem 0; min-height:2.4rem; color:var(--primary-purple);">
          손을 선택해주세요!
        </div>

        <div class="rps-choices-bar">
          <button class="rps-btn" onclick="RpsGame.play('scissors')" title="가위">✌️</button>
          <button class="rps-btn" onclick="RpsGame.play('rock')" title="바위">✊</button>
          <button class="rps-btn" onclick="RpsGame.play('paper')" title="보">🖐️</button>
        </div>

        <div class="game-controls-bar">
          <button class="btn btn-secondary" onclick="RpsGame.resetStats()">전적 초기화</button>
        </div>
      </div>
    `;
  },

  play(userChoiceId) {
    if (this.isRolling) return;
    this.isRolling = true;

    const userObj = this.choices.find(c => c.id === userChoiceId);
    const playerHand = document.getElementById('playerHand');
    const cpuHand = document.getElementById('cpuHand');
    const banner = document.getElementById('rpsResultBanner');

    playerHand.textContent = userObj.icon;
    banner.textContent = '안 내면 진다, 가위바위보!';
    App.playSound('tick');

    // Shuffle CPU animation
    let shuffleCount = 0;
    const interval = setInterval(() => {
      cpuHand.textContent = this.choices[shuffleCount % 3].icon;
      shuffleCount++;
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      this.isRolling = false;

      // Computer choice
      const cpuObj = this.choices[Math.floor(Math.random() * 3)];
      cpuHand.textContent = cpuObj.icon;

      this.resolveMatch(userObj, cpuObj);
    }, 1000);
  },

  resolveMatch(user, cpu) {
    const banner = document.getElementById('rpsResultBanner');

    if (user.id === cpu.id) {
      // Draw
      this.draws++;
      banner.innerHTML = `<span style="color:#64748b;">비겼습니다! (무승부)</span>`;
      App.playSound('pop');
    } else if (
      (user.id === 'rock' && cpu.id === 'scissors') ||
      (user.id === 'scissors' && cpu.id === 'paper') ||
      (user.id === 'paper' && cpu.id === 'rock')
    ) {
      // User Win
      this.wins++;
      this.streak++;
      banner.innerHTML = `<span style="color:#10b981;">🎉 승리했습니다! (${this.streak}연승 달성)</span>`;
      App.playSound('win');

      if (this.streak > this.maxStreak) {
        this.maxStreak = this.streak;
        localStorage.setItem('gt_best_rps', String(this.maxStreak));
        App.updateRecordDisplay('rps', `${this.maxStreak}연승`);
        App.confettiBurst();
      }
    } else {
      // User Loss
      this.losses++;
      this.streak = 0;
      banner.innerHTML = `<span style="color:#ef4444;">아쉽게 졌습니다! 😭</span>`;
      App.playSound('wrong');
    }

    document.getElementById('rpsStreakText').textContent = `${this.streak}연승`;
    document.getElementById('rpsRecordText').textContent = `${this.wins}승 ${this.draws}무 ${this.losses}패`;
  },

  resetStats() {
    this.streak = 0;
    this.wins = 0;
    this.draws = 0;
    this.losses = 0;
    this.render();
    App.playSound('click');
  }
};
