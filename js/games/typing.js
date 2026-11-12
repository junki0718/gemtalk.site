/**
 * 타자 속도 테스트 (Typing Speed Test)
 */
window.TypingGame = {
  container: null,
  sentences: [
    '간장 공장 공장장은 강 공장장이고 된장 공장 공장장은 공 공장장이다.',
    '내가 그린 기린 그림은 잘 그린 기린 그림이고 네가 그린 기린 그림은 못 그린 기린 그림이다.',
    '동해 물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세.',
    '시작이 반이다. 작은 한 걸음이 위대한 도약의 시작이 된다.',
    '인생은 타이밍이고 승부는 기세다. 망설이지 말고 도전하라.',
    '달리는 기차 위에 중립 기어를 넣고 창밖의 풍경을 감상하는 여유를 갖자.',
    '실패를 두려워하지 마라. 실패는 성공으로 향하는 가장 빠른 나침반이다.',
    '눈부신 아침 햇살을 맞이하며 오늘도 최고의 하루를 만들어 가자.'
  ],
  currentSentence: '',
  startTime: null,
  isFinished: false,
  bestCPM: 0,

  init(containerEl) {
    this.container = containerEl;
    this.bestCPM = parseInt(localStorage.getItem('gt_best_typing') || '0', 10) || 0;
    this.pickNewSentence();
    this.render();
  },

  pickNewSentence() {
    const next = this.sentences[Math.floor(Math.random() * this.sentences.length)];
    this.currentSentence = next;
    this.startTime = null;
    this.isFinished = false;
  },

  render() {
    this.container.innerHTML = `
      <div class="typing-container">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          아래 제시된 문장을 최대한 빠르고 정확하게 입력하세요. 첫 타자를 치는 순간 측정이 시작됩니다!
        </div>

        <div style="display:flex; gap:0.75rem; justify-content:center; margin-bottom:1.25rem; flex-wrap:wrap;">
          <div class="stat-pill">최고 타수: <strong id="bestCpmText">${this.bestCPM} CPM</strong></div>
          <div class="stat-pill">현재 타수: <strong id="currentCpmText">0 CPM</strong></div>
          <div class="stat-pill">정확도: <strong id="currentAccText">100%</strong></div>
        </div>

        <div class="typing-target-box" id="typingTargetBox"></div>

        <input type="text" id="typingInputField" class="typing-input" placeholder="문장을 입력하세요..." autocomplete="off" autofocus>

        <div class="game-controls-bar">
          <button class="btn btn-secondary" onclick="TypingGame.nextSentence()">다른 문장 하기</button>
          <button class="btn btn-primary" onclick="TypingGame.restart()">다시 도전</button>
        </div>

        <div id="typingResultModal" style="display:none; margin-top:1.5rem; background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; text-align:center;">
          <h3 style="font-size:1.4rem; font-weight:800; color:var(--text-primary); margin-bottom:0.5rem;" id="typingFinalHeader">🎉 측정 완료!</h3>
          <p id="typingFinalDetails" style="font-size:1.05rem; color:var(--text-secondary); margin-bottom:1rem;"></p>
          <button class="btn btn-primary" onclick="TypingGame.nextSentence()">다음 문장 도전하기</button>
        </div>
      </div>
    `;

    this.renderSentenceVisual('');
    const input = document.getElementById('typingInputField');
    input.addEventListener('input', (e) => this.handleInput(e.target.value));
  },

  renderSentenceVisual(typed) {
    const box = document.getElementById('typingTargetBox');
    const target = this.currentSentence;
    let html = '';

    for (let i = 0; i < target.length; i++) {
      const targetChar = target[i];
      let cls = 'typing-char';
      if (i < typed.length) {
        cls += (typed[i] === targetChar) ? ' correct' : ' incorrect';
      } else if (i === typed.length) {
        cls += ' current';
      }
      html += `<span class="${cls}">${targetChar}</span>`;
    }

    box.innerHTML = html;
  },

  handleInput(typed) {
    if (this.isFinished) return;

    if (!this.startTime && typed.length > 0) {
      this.startTime = performance.now();
    }

    this.renderSentenceVisual(typed);

    // Calculate real-time CPM & Accuracy
    if (this.startTime && typed.length > 0) {
      const elapsedMinutes = (performance.now() - this.startTime) / 60000;
      let correctChars = 0;
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === this.currentSentence[i]) correctChars++;
      }

      // CPM (Characters Per Minute)
      const cpm = Math.round(correctChars / Math.max(0.01, elapsedMinutes));
      const accuracy = Math.round((correctChars / typed.length) * 100);

      document.getElementById('currentCpmText').textContent = `${cpm} CPM`;
      document.getElementById('currentAccText').textContent = `${accuracy}%`;

      // Check if finished
      if (typed.length >= this.currentSentence.length) {
        this.finish(cpm, accuracy);
      }
    }
  },

  finish(cpm, accuracy) {
    this.isFinished = true;
    const input = document.getElementById('typingInputField');
    input.disabled = true;

    if (accuracy >= 90 && cpm > this.bestCPM) {
      this.bestCPM = cpm;
      localStorage.setItem('gt_best_typing', String(cpm));
      document.getElementById('bestCpmText').textContent = `${cpm} CPM`;
      App.updateRecordDisplay('typing', `${cpm} CPM`);
      App.confettiBurst();
    }

    App.playSound('win');
    const modal = document.getElementById('typingResultModal');
    const details = document.getElementById('typingFinalDetails');
    modal.style.display = 'block';

    let rank = '';
    if (cpm >= 500) rank = '👑 신의 손놀림';
    else if (cpm >= 350) rank = '⚡ 타자의 달인';
    else if (cpm >= 200) rank = '👍 평균 이상';
    else rank = '🌱 연습하면 더 빨라져요!';

    details.innerHTML = `타수: <strong>${cpm} CPM</strong> | 정확도: <strong>${accuracy}%</strong><br><span style="color:var(--primary-purple); font-weight:800;">${rank}</span>`;
  },

  nextSentence() {
    this.pickNewSentence();
    this.render();
    App.playSound('click');
  },

  restart() {
    this.startTime = null;
    this.isFinished = false;
    this.render();
    App.playSound('click');
  }
};
