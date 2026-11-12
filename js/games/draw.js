/**
 * 제비뽑기 (Drawing Lots)
 */
window.DrawLotsGame = {
  container: null,
  participants: ['김민준', '이서연', '박도윤', '최지우', '정예은'],
  results: ['당첨! 🎁', '당첨! ☕', '꽝 💨', '꽝 💨', '꽝 💨'],
  cards: [],

  init(containerEl) {
    this.container = containerEl;
    this.render();
  },

  render() {
    this.container.innerHTML = `
      <div class="ladder-setup">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          참가자와 결과를 입력한 후 [제비 생성]을 누르세요. 생성된 제비를 하나씩 클릭하여 결과를 확인하세요!
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <h3 style="font-weight:800; font-size:1.1rem;">참가자 & 결과 목록 (2~12명)</h3>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="DrawLotsGame.addSlot()">+ 항목 추가</button>
            <button class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="DrawLotsGame.removeSlot()">- 항목 삭제</button>
          </div>
        </div>

        <div class="ladder-columns-input" id="drawLotsInputCols"></div>

        <div class="game-controls-bar">
          <button class="btn btn-primary" onclick="DrawLotsGame.createLots()">✨ 제비 섞고 생성하기</button>
        </div>

        <div id="drawLotsStage" style="display:none; margin-top:2rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
            <span style="font-weight:700; color:var(--text-secondary);">카드를 터치하여 결과를 열어보세요!</span>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-secondary" style="padding:0.4rem 0.85rem; font-size:0.85rem;" onclick="DrawLotsGame.revealAll()">모두 열기</button>
              <button class="btn btn-mint" style="padding:0.4rem 0.85rem; font-size:0.85rem;" onclick="DrawLotsGame.createLots()">다시 섞기</button>
            </div>
          </div>
          <div class="draw-lots-grid" id="drawLotsGrid"></div>
        </div>
      </div>
    `;

    this.renderInputs();
  },

  renderInputs() {
    const colsEl = document.getElementById('drawLotsInputCols');
    if (!colsEl) return;
    colsEl.innerHTML = this.participants.map((p, idx) => `
      <div class="ladder-col-field">
        <span class="ladder-col-label">참가자 ${idx + 1}</span>
        <input type="text" class="ladder-input" value="${p}" onchange="DrawLotsGame.updateParticipant(${idx}, this.value)" placeholder="참가자">
        <span class="ladder-col-label" style="color:var(--primary-mint);">결과 ${idx + 1}</span>
        <input type="text" class="ladder-input" value="${this.results[idx] || '꽝'}" onchange="DrawLotsGame.updateResult(${idx}, this.value)" placeholder="결과">
      </div>
    `).join('');
  },

  updateParticipant(idx, val) {
    this.participants[idx] = val.trim() || `참가자${idx + 1}`;
  },

  updateResult(idx, val) {
    this.results[idx] = val.trim() || `결과${idx + 1}`;
  },

  addSlot() {
    if (this.participants.length >= 12) {
      App.toast('최대 12명까지 가능합니다.');
      return;
    }
    const nextIdx = this.participants.length + 1;
    this.participants.push(`참가자 ${nextIdx}`);
    this.results.push(`꽝 💨`);
    this.renderInputs();
  },

  removeSlot() {
    if (this.participants.length <= 2) {
      App.toast('최소 2명 이상이어야 합니다.');
      return;
    }
    this.participants.pop();
    this.results.pop();
    this.renderInputs();
  },

  createLots() {
    // Shuffle results
    const shuffledResults = [...this.results];
    for (let i = shuffledResults.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledResults[i], shuffledResults[j]] = [shuffledResults[j], shuffledResults[i]];
    }

    this.cards = this.participants.map((p, idx) => ({
      participant: p,
      result: shuffledResults[idx],
      opened: false
    }));

    const stageEl = document.getElementById('drawLotsStage');
    stageEl.style.display = 'block';

    this.renderGrid();
    App.playSound('click');
  },

  renderGrid() {
    const gridEl = document.getElementById('drawLotsGrid');
    gridEl.innerHTML = this.cards.map((c, idx) => {
      const isWinner = c.result.includes('당첨') || c.result.includes('🎁') || c.result.includes('1등');
      return `
        <div class="lot-card ${c.opened ? 'opened' : ''} ${c.opened && isWinner ? 'winner' : ''}" onclick="DrawLotsGame.openCard(${idx})">
          <div class="lot-participant-label">${c.participant}</div>
          <div>${c.opened ? c.result : '❓'}</div>
        </div>
      `;
    }).join('');
  },

  openCard(idx) {
    if (this.cards[idx].opened) return;
    this.cards[idx].opened = true;
    this.renderGrid();
    const result = this.cards[idx].result;
    if (result.includes('당첨') || result.includes('🎁') || result.includes('1등')) {
      App.playSound('win');
      App.confettiBurst();
      App.toast(`🎉 [${this.cards[idx].participant}] → ${result}!`);
    } else {
      App.playSound('pop');
    }
  },

  revealAll() {
    let hasWinner = false;
    this.cards.forEach(c => {
      c.opened = true;
      if (c.result.includes('당첨') || c.result.includes('🎁')) hasWinner = true;
    });
    this.renderGrid();
    if (hasWinner) {
      App.playSound('win');
      App.confettiBurst();
    } else {
      App.playSound('success');
    }
  }
};
