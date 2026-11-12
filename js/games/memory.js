/**
 * 카드 짝 맞추기 (Memory Card Match)
 */
window.MemoryGame = {
  container: null,
  emojis: ['🎮', '🚀', '🍕', '💎', '🐱', '⚽', '🌈', '👑'],
  cards: [],
  flippedCards: [],
  moves: 0,
  matchedPairs: 0,
  startTime: null,
  timerInterval: null,
  elapsedSec: 0,
  isLocked: false,
  bestMoves: null,

  init(containerEl) {
    this.container = containerEl;
    this.bestMoves = parseInt(localStorage.getItem('gt_best_memory') || '0', 10) || null;
    this.moves = 0;
    this.matchedPairs = 0;
    this.elapsedSec = 0;
    this.isLocked = false;
    clearInterval(this.timerInterval);
    this.setupDeck();
    this.render();
  },

  setupDeck() {
    const deck = [...this.emojis, ...this.emojis];
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    this.cards = deck.map((icon, id) => ({
      id,
      icon,
      isFlipped: false,
      isMatched: false
    }));
  },

  render() {
    this.container.innerHTML = `
      <div class="game-flex-center">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          카드를 뒤집어 같은 그림의 짝 8쌍을 모두 찾으세요. 적은 시도 횟수와 빠른 시간으로 완성해 보세요!
        </div>

        <div style="display:flex; gap:1rem; margin-bottom:1.25rem; justify-content:center; flex-wrap:wrap;">
          <div class="stat-pill">시도 횟수: <strong id="memoryMoves">${this.moves}회</strong></div>
          <div class="stat-pill">경과 시간: <strong id="memoryTimer">0초</strong></div>
          <div class="stat-pill">최소 시도 기록: <strong>${this.bestMoves ? this.bestMoves + '회' : '기록 없음'}</strong></div>
        </div>

        <div class="memory-grid" id="memoryGrid"></div>

        <div class="game-controls-bar">
          <button class="btn btn-primary" onclick="MemoryGame.restart()">카드 다시 섞기</button>
        </div>
      </div>
    `;

    this.renderGrid();
  },

  renderGrid() {
    const gridEl = document.getElementById('memoryGrid');
    if (!gridEl) return;
    gridEl.innerHTML = this.cards.map((c) => `
      <div class="memory-card ${c.isFlipped ? 'flipped' : ''} ${c.isMatched ? 'matched' : ''}" 
           onclick="MemoryGame.flipCard(${c.id})">
        ${c.isFlipped || c.isMatched ? c.icon : '❓'}
      </div>
    `).join('');
  },

  flipCard(id) {
    if (this.isLocked) return;
    const card = this.cards[id];
    if (card.isFlipped || card.isMatched) return;

    if (!this.startTime) {
      this.startTime = performance.now();
      this.timerInterval = setInterval(() => {
        this.elapsedSec = Math.floor((performance.now() - this.startTime) / 1000);
        const timerEl = document.getElementById('memoryTimer');
        if (timerEl) timerEl.textContent = `${this.elapsedSec}초`;
      }, 1000);
    }

    card.isFlipped = true;
    this.flippedCards.push(card);
    this.renderGrid();
    App.playSound('pop');

    if (this.flippedCards.length === 2) {
      this.moves++;
      document.getElementById('memoryMoves').textContent = `${this.moves}회`;
      this.checkMatch();
    }
  },

  checkMatch() {
    const [c1, c2] = this.flippedCards;
    this.isLocked = true;

    if (c1.icon === c2.icon) {
      // Match!
      c1.isMatched = true;
      c2.isMatched = true;
      this.matchedPairs++;
      this.flippedCards = [];
      this.isLocked = false;
      this.renderGrid();
      App.playSound('success');

      if (this.matchedPairs === this.emojis.length) {
        this.finish();
      }
    } else {
      // No match
      setTimeout(() => {
        c1.isFlipped = false;
        c2.isFlipped = false;
        this.flippedCards = [];
        this.isLocked = false;
        this.renderGrid();
      }, 900);
    }
  },

  finish() {
    clearInterval(this.timerInterval);
    let isNewBest = false;
    if (!this.bestMoves || this.moves < this.bestMoves) {
      this.bestMoves = this.moves;
      localStorage.setItem('gt_best_memory', String(this.bestMoves));
      App.updateRecordDisplay('memory', `${this.bestMoves}회`);
      isNewBest = true;
      App.confettiBurst();
    }

    App.playSound('win');
    App.toast(`🎉 모든 짝을 맞췄습니다! ${this.moves}회 (${this.elapsedSec}초 소요)`);

    this.container.innerHTML = `
      <div class="game-flex-center">
        <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:2.5rem; text-align:center; max-width:480px; width:100%;">
          <h2 style="font-size:2rem; font-weight:900; margin-bottom:0.5rem;">🎉 축하합니다!</h2>
          <p style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:1.5rem;">${isNewBest ? '✨ 최소 시도 신기록 달성!' : '게임 완료'}</p>
          <div style="font-size:2.8rem; font-weight:900; color:var(--primary-purple); margin-bottom:0.5rem;">${this.moves}회 시도</div>
          <p style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:1.5rem;">소요 시간: <strong>${this.elapsedSec}초</strong></p>
          <button class="btn btn-primary" style="padding:0.8rem 2rem;" onclick="MemoryGame.init(document.getElementById('gameStageContainer'))">다시 하기</button>
        </div>
      </div>
    `;
  },

  restart() {
    this.moves = 0;
    this.matchedPairs = 0;
    this.elapsedSec = 0;
    this.isLocked = false;
    this.flippedCards = [];
    this.startTime = null;
    clearInterval(this.timerInterval);
    this.setupDeck();
    this.render();
    App.playSound('click');
  },

  cleanup() {
    clearInterval(this.timerInterval);
    this.isLocked = false;
  }
};
