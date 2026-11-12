/**
 * 지뢰찾기 (Minesweeper)
 */
window.MinesweeperGame = {
  container: null,
  rows: 8,
  cols: 8,
  mineCount: 10,
  grid: [],
  isFirstClick: true,
  isGameOver: false,
  timerInterval: null,
  elapsedSec: 0,
  flagMode: false,
  flagsPlaced: 0,

  difficulties: {
    easy: { rows: 8, cols: 8, mines: 10, label: '초급 (8x8)' },
    medium: { rows: 10, cols: 10, mines: 16, label: '중급 (10x10)' },
    hard: { rows: 12, cols: 12, mines: 25, label: '고급 (12x12)' }
  },
  currentDiff: 'easy',

  init(containerEl) {
    this.container = containerEl;
    this.setDifficulty('easy', false);
  },

  setDifficulty(diffKey, doRerender = true) {
    this.currentDiff = diffKey;
    const diff = this.difficulties[diffKey];
    this.rows = diff.rows;
    this.cols = diff.cols;
    this.mineCount = diff.mines;
    this.resetState();
    if (doRerender) this.render();
    else this.render();
  },

  resetState() {
    clearInterval(this.timerInterval);
    this.isFirstClick = true;
    this.isGameOver = false;
    this.elapsedSec = 0;
    this.flagsPlaced = 0;
    this.flagMode = false;

    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        row.push({
          r, c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        });
      }
      this.grid.push(row);
    }
  },

  render() {
    this.container.innerHTML = `
      <div class="game-flex-center">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          지뢰를 피해 모든 안전한 칸을 열어보세요! 마우스 우클릭 또는 [🚩 깃발 모드]로 의심되는 칸에 깃발을 꽂을 수 있습니다.
        </div>

        <div style="display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap; justify-content:center;">
          <button class="btn ${this.currentDiff === 'easy' ? 'btn-primary' : 'btn-secondary'}" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="MinesweeperGame.setDifficulty('easy')">초급</button>
          <button class="btn ${this.currentDiff === 'medium' ? 'btn-primary' : 'btn-secondary'}" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="MinesweeperGame.setDifficulty('medium')">중급</button>
          <button class="btn ${this.currentDiff === 'hard' ? 'btn-primary' : 'btn-secondary'}" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="MinesweeperGame.setDifficulty('hard')">고급</button>
        </div>

        <div class="minesweeper-header-bar">
          <div class="stat-pill">남은 지뢰: <strong id="minesRemainingText">${this.mineCount - this.flagsPlaced}</strong></div>
          <button id="flagModeBtn" class="btn btn-secondary" style="padding:0.4rem 0.85rem; font-size:0.85rem;" onclick="MinesweeperGame.toggleFlagMode()">
            🚩 깃발 모드: <strong>OFF</strong>
          </button>
          <div class="stat-pill">시간: <strong id="minesTimer">0초</strong></div>
        </div>

        <div class="mines-board" id="minesBoard" style="grid-template-columns: repeat(${this.cols}, 36px);"></div>

        <div class="game-controls-bar">
          <button class="btn btn-primary" onclick="MinesweeperGame.restart()">새 게임 다시 시작</button>
        </div>
      </div>
    `;

    this.renderBoard();
  },

  renderBoard() {
    const boardEl = document.getElementById('minesBoard');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        const cellEl = document.createElement('div');
        cellEl.className = 'mine-cell';
        cellEl.id = `cell_${r}_${c}`;

        if (cell.isRevealed) {
          cellEl.classList.add('revealed');
          if (cell.isMine) {
            cellEl.classList.add('has-mine');
            cellEl.textContent = '💣';
          } else if (cell.neighborMines > 0) {
            cellEl.textContent = cell.neighborMines;
            cellEl.setAttribute('data-count', cell.neighborMines);
          }
        } else if (cell.isFlagged) {
          cellEl.textContent = '🚩';
        }

        cellEl.addEventListener('click', (e) => this.handleCellClick(r, c));
        cellEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.toggleFlag(r, c);
        });

        boardEl.appendChild(cellEl);
      }
    }
  },

  toggleFlagMode() {
    this.flagMode = !this.flagMode;
    const btn = document.getElementById('flagModeBtn');
    if (btn) {
      if (this.flagMode) {
        btn.className = 'btn btn-primary';
        btn.innerHTML = '🚩 깃발 모드: <strong>ON</strong>';
      } else {
        btn.className = 'btn btn-secondary';
        btn.innerHTML = '🚩 깃발 모드: <strong>OFF</strong>';
      }
    }
    App.playSound('click');
  },

  handleCellClick(r, c) {
    if (this.isGameOver) return;

    if (this.flagMode) {
      this.toggleFlag(r, c);
      return;
    }

    const cell = this.grid[r][c];
    if (cell.isFlagged || cell.isRevealed) return;

    if (this.isFirstClick) {
      this.isFirstClick = false;
      this.placeMines(r, c);
      this.startTime = performance.now();
      this.timerInterval = setInterval(() => {
        this.elapsedSec = Math.floor((performance.now() - this.startTime) / 1000);
        const timerEl = document.getElementById('minesTimer');
        if (timerEl) timerEl.textContent = `${this.elapsedSec}초`;
      }, 1000);
    }

    if (cell.isMine) {
      this.hitMine();
    } else {
      this.revealCell(r, c);
      App.playSound('pop');
      this.checkWin();
    }
  },

  toggleFlag(r, c) {
    if (this.isGameOver) return;
    const cell = this.grid[r][c];
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    this.flagsPlaced += cell.isFlagged ? 1 : -1;
    document.getElementById('minesRemainingText').textContent = Math.max(0, this.mineCount - this.flagsPlaced);
    this.renderBoard();
    App.playSound('tick');
  },

  placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < this.mineCount) {
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);

      // Safe zone around first click
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
      if (!this.grid[r][c].isMine) {
        this.grid[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighbor mines
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                if (this.grid[nr][nc].isMine) count++;
              }
            }
          }
          this.grid[r][c].neighborMines = count;
        }
      }
    }
  },

  revealCell(r, c) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
    const cell = this.grid[r][c];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;

    // Flood fill if 0 neighbors
    if (cell.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          this.revealCell(r + dr, c + dc);
        }
      }
    }

    this.renderBoard();
  },

  hitMine() {
    this.isGameOver = true;
    clearInterval(this.timerInterval);

    // Reveal all mines
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c].isMine) {
          this.grid[r][c].isRevealed = true;
        }
      }
    }
    this.renderBoard();
    App.playSound('wrong');
    App.toast('💣 쾅! 지뢰를 밟았습니다. 다시 도전해보세요!');
  },

  checkWin() {
    let unrevealedSafeCells = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r][c].isMine && !this.grid[r][c].isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      this.isGameOver = true;
      clearInterval(this.timerInterval);
      App.playSound('win');
      App.confettiBurst();
      App.toast(`🏆 승리! ${this.elapsedSec}초 만에 모든 지뢰를 피했습니다!`);
    }
  },

  restart() {
    this.resetState();
    this.render();
    App.playSound('click');
  },

  cleanup() {
    clearInterval(this.timerInterval);
    this.isGameOver = true;
  }
};
