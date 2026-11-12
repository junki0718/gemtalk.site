/**
 * 2048 Casual Puzzle Game
 */
window.Game2048 = {
  container: null,
  board: [],
  score: 0,
  bestScore: 0,
  isGameOver: false,
  hasWon: false,
  touchStartX: 0,
  touchStartY: 0,
  keyHandlerBound: false,

  init(containerEl) {
    this.container = containerEl;
    this.bestScore = parseInt(localStorage.getItem('gt_best_2048') || '0', 10) || 0;
    this.score = 0;
    this.isGameOver = false;
    this.hasWon = false;
    this.initBoard();
    this.render();
    this.bindEvents();
  },

  initBoard() {
    this.board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    this.spawnTile();
    this.spawnTile();
  },

  spawnTile() {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  },

  render() {
    this.container.innerHTML = `
      <div class="game-flex-center">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          키보드 방향키(↑ ↓ ← →) 또는 모바일 화면 스와이프로 타일을 밀어 합치세요. 2048을 완성해보세요!
        </div>

        <div style="display:flex; gap:1rem; margin-bottom:1.25rem; justify-content:center;">
          <div class="stat-pill">현재 점수: <strong id="g2048Score">${this.score}</strong></div>
          <div class="stat-pill">최고 점수: <strong>${this.bestScore}</strong></div>
        </div>

        <div class="g2048-board" id="g2048Board"></div>

        <div style="display:flex; gap:0.5rem; margin-top:1.25rem;">
          <button class="btn btn-secondary" onclick="Game2048.move('up')">⬆️</button>
        </div>
        <div style="display:flex; gap:0.5rem; margin-top:0.4rem;">
          <button class="btn btn-secondary" onclick="Game2048.move('left')">⬅️</button>
          <button class="btn btn-secondary" onclick="Game2048.move('down')">⬇️</button>
          <button class="btn btn-secondary" onclick="Game2048.move('right')">➡️</button>
        </div>

        <div class="game-controls-bar">
          <button class="btn btn-primary" onclick="Game2048.restart()">새 게임 시작</button>
        </div>
      </div>
    `;

    this.renderBoard();
  },

  renderBoard() {
    const boardEl = document.getElementById('g2048Board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = this.board[r][c];
        const cell = document.createElement('div');
        cell.className = `g2048-cell ${val > 0 ? 'tile-' + val : ''}`;
        cell.textContent = val > 0 ? val : '';
        boardEl.appendChild(cell);
      }
    }

    const scoreEl = document.getElementById('g2048Score');
    if (scoreEl) scoreEl.textContent = this.score;
  },

  bindEvents() {
    if (this.keyHandlerBound) return;
    this.keyHandlerBound = true;

    window.addEventListener('keydown', (e) => {
      if (!document.getElementById('g2048Board')) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(e.key)) {
        e.preventDefault();
        if (e.key === 'ArrowUp' || e.key === 'w') this.move('up');
        if (e.key === 'ArrowDown' || e.key === 's') this.move('down');
        if (e.key === 'ArrowLeft' || e.key === 'a') this.move('left');
        if (e.key === 'ArrowRight' || e.key === 'd') this.move('right');
      }
    });

    // Touch swipe support
    window.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (!document.getElementById('g2048Board')) return;
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const dy = e.changedTouches[0].clientY - this.touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 30) {
        if (absDx > absDy) {
          this.move(dx > 0 ? 'right' : 'left');
        } else {
          this.move(dy > 0 ? 'down' : 'up');
        }
      }
    }, { passive: true });
  },

  slide(row) {
    let arr = row.filter(val => val !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        this.score += arr[i];
        arr[i + 1] = 0;
        if (arr[i] === 2048 && !this.hasWon) {
          this.hasWon = true;
          App.playSound('win');
          App.confettiBurst();
          App.toast('🏆 2048 타일을 달성했습니다!');
        }
      }
    }
    arr = arr.filter(val => val !== 0);
    while (arr.length < 4) {
      arr.push(0);
    }
    return arr;
  },

  move(direction) {
    if (this.isGameOver) return;
    let moved = false;
    const oldBoard = JSON.stringify(this.board);

    if (direction === 'left') {
      for (let r = 0; r < 4; r++) {
        this.board[r] = this.slide(this.board[r]);
      }
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) {
        this.board[r] = this.slide(this.board[r].reverse()).reverse();
      }
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        let col = [this.board[0][c], this.board[1][c], this.board[2][c], this.board[3][c]];
        col = this.slide(col);
        for (let r = 0; r < 4; r++) this.board[r][c] = col[r];
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        let col = [this.board[3][c], this.board[2][c], this.board[1][c], this.board[0][c]];
        col = this.slide(col);
        for (let r = 0; r < 4; r++) this.board[3 - r][c] = col[r];
      }
    }

    if (JSON.stringify(this.board) !== oldBoard) {
      moved = true;
      this.spawnTile();
      this.renderBoard();
      App.playSound('pop');

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('gt_best_2048', String(this.bestScore));
        App.updateRecordDisplay('2048', `${this.bestScore}점`);
      }

      this.checkGameOver();
    }
  },

  checkGameOver() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) return;
        if (r < 3 && this.board[r][c] === this.board[r + 1][c]) return;
        if (c < 3 && this.board[r][c] === this.board[r][c + 1]) return;
      }
    }
    this.isGameOver = true;
    App.playSound('wrong');
    App.toast(`게임 오버! 최종 점수: ${this.score}`);
  },

  restart() {
    this.score = 0;
    this.isGameOver = false;
    this.hasWon = false;
    this.initBoard();
    this.render();
    App.playSound('click');
  }
};
