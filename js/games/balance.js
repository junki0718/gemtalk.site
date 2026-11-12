/**
 * 밸런스 게임 (Balance Game / Would You Rather)
 */
window.BalanceGame = {
  container: null,
  questions: [
    { a: '평생 라면만 먹기 🍜', b: '평생 탄산음료 없이 치킨 먹기 🍗', pctA: 52 },
    { a: '100% 확률로 1억원 받기 💰', b: '50% 확률로 100억원 받기 💎', pctA: 64 },
    { a: '월 200만원 받으며 평생 백수로 살기 🛌', b: '월 1000만원 받으며 주 6일 매일 야근하기 💼', pctA: 58 },
    { a: '여름에 에어컨 없이 살기 ☀️', b: '겨울에 난방 없이 살기 ❄️', pctA: 45 },
    { a: '잠 안 자도 피곤하지 않은 능력 ⚡', b: '아무리 많이 먹어도 살 안 찌는 능력 🍕', pctA: 38 },
    { a: '과거로 돌아가서 다시 살기 ⏳', b: '미래로 가서 10년 뒤 내 모습 보기 🚀', pctA: 71 },
    { a: '내가 좋아하는 사람과 연애하기 ❤️', b: '나를 미치도록 좋아해 주는 사람과 연애하기 🥰', pctA: 49 },
    { a: '스마트폰 없이 일주일 살기 📵', b: '친구/가족과 대화 없이 일주일 살기 🤐', pctA: 55 },
    { a: '평생 양치 안 하기 🪥', b: '평생 샤워 안 하기 🚿', pctA: 82 },
    { a: '모든 비밀을 다 알게 되는 능력 🔮', b: '남의 속마음을 들을 수 있는 능력 🧠', pctA: 43 },
    { a: '말 한마디 할 때마다 10초씩 버벅거리기 🐢', b: '하고 싶은 말을 무조건 육성으로 외치기 📢', pctA: 66 },
    { a: '환생하면 초천재 빌게이츠 💻', b: '환생하면 월드스타 BTS 멤버 🌟', pctA: 51 }
  ],
  currentIndex: 0,
  hasVoted: false,

  init(containerEl) {
    this.container = containerEl;
    this.currentIndex = 0;
    this.hasVoted = false;
    this.render();
  },

  render() {
    const q = this.questions[this.currentIndex];
    this.hasVoted = false;

    this.container.innerHTML = `
      <div class="game-flex-center">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          당신의 선택은? 둘 중 하나를 선택하면 대중의 선택 통계 비율이 공개됩니다!
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:780px; margin-bottom:1rem;">
          <span style="font-weight:800; color:var(--text-secondary);">질문 ${this.currentIndex + 1} / ${this.questions.length}</span>
          <button class="btn btn-secondary" style="font-size:0.85rem; padding:0.35rem 0.8rem;" onclick="BalanceGame.showCustomModal()">+ 내 질문 만들기</button>
        </div>

        <div class="balance-options-wrap">
          <!-- Option A -->
          <div class="balance-card opt-a" id="balanceCardA" onclick="BalanceGame.vote('A')">
            <span style="font-size:1.1rem; font-weight:900; background:rgba(255,255,255,0.25); padding:0.25rem 0.85rem; border-radius:var(--radius-full);">OPTION A</span>
            <div class="balance-card-text">${q.a}</div>
            <div class="balance-percent-text" id="pctTextA"></div>
            <div class="balance-percentage-bar" id="pctBarA">
              <div class="balance-percentage-fill" id="pctFillA"></div>
            </div>
          </div>

          <!-- Option B -->
          <div class="balance-card opt-b" id="balanceCardB" onclick="BalanceGame.vote('B')">
            <span style="font-size:1.1rem; font-weight:900; background:rgba(255,255,255,0.25); padding:0.25rem 0.85rem; border-radius:var(--radius-full);">OPTION B</span>
            <div class="balance-card-text">${q.b}</div>
            <div class="balance-percent-text" id="pctTextB"></div>
            <div class="balance-percentage-bar" id="pctBarB">
              <div class="balance-percentage-fill" id="pctFillB"></div>
            </div>
          </div>
        </div>

        <div class="game-controls-bar">
          <button class="btn btn-primary" id="balanceNextBtn" style="padding:0.75rem 1.8rem; display:none;" onclick="BalanceGame.nextQuestion()">다음 질문 보기 ➔</button>
          <button class="btn btn-secondary" onclick="BalanceGame.randomQuestion()">랜덤 질문 🎲</button>
        </div>

        <div id="balanceCustomModal" style="display:none; margin-top:2rem; background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; width:100%; max-width:600px;">
          <h4 style="font-size:1.1rem; font-weight:800; margin-bottom:0.75rem;">나만의 밸런스 질문 추가</h4>
          <input type="text" id="customOptA" class="typing-input" placeholder="A 선택지 (예: 평생 여름 vs 평생 겨울)" style="margin-bottom:0.5rem;">
          <input type="text" id="customOptB" class="typing-input" placeholder="B 선택지" style="margin-bottom:0.75rem;">
          <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
            <button class="btn btn-secondary" onclick="document.getElementById('balanceCustomModal').style.display='none'">취소</button>
            <button class="btn btn-primary" onclick="BalanceGame.addCustomQuestion()">등록하기</button>
          </div>
        </div>
      </div>
    `;
  },

  vote(chosen) {
    if (this.hasVoted) return;
    this.hasVoted = true;

    const q = this.questions[this.currentIndex];
    const pctA = q.pctA;
    const pctB = 100 - pctA;

    App.playSound('win');
    App.confettiBurst();

    // Show Bars & Percentages
    const barA = document.getElementById('pctBarA');
    const barB = document.getElementById('pctBarB');
    const fillA = document.getElementById('pctFillA');
    const fillB = document.getElementById('pctFillB');
    const textA = document.getElementById('pctTextA');
    const textB = document.getElementById('pctTextB');

    barA.style.display = 'block';
    barB.style.display = 'block';
    textA.style.display = 'block';
    textB.style.display = 'block';

    textA.textContent = `${pctA}%`;
    textB.textContent = `${pctB}%`;

    setTimeout(() => {
      fillA.style.width = `${pctA}%`;
      fillB.style.width = `${pctB}%`;
    }, 50);

    const nextBtn = document.getElementById('balanceNextBtn');
    if (nextBtn) nextBtn.style.display = 'inline-flex';

    App.toast(`당신의 선택: [OPTION ${chosen}]!`);
  },

  nextQuestion() {
    this.currentIndex = (this.currentIndex + 1) % this.questions.length;
    this.render();
    App.playSound('click');
  },

  randomQuestion() {
    let next;
    do {
      next = Math.floor(Math.random() * this.questions.length);
    } while (next === this.currentIndex && this.questions.length > 1);
    this.currentIndex = next;
    this.render();
    App.playSound('click');
  },

  showCustomModal() {
    const modal = document.getElementById('balanceCustomModal');
    modal.style.display = 'block';
    App.playSound('click');
  },

  addCustomQuestion() {
    const a = document.getElementById('customOptA').value.trim();
    const b = document.getElementById('customOptB').value.trim();
    if (!a || !b) {
      App.toast('두 선택지를 모두 입력해주세요.');
      return;
    }

    this.questions.push({ a, b, pctA: 50 });
    this.currentIndex = this.questions.length - 1;
    this.render();
    App.toast('🎉 새 질문이 등록되었습니다!');
    App.playSound('win');
  }
};
