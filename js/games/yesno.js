/**
 * YES or NO Decision Maker
 */
window.YesNoGame = {
  container: null,
  isDeciding: false,
  history: [],

  yesAdvices: [
    '고민할 시간에 지금 바로 시작하세요! 확실한 찬스입니다.',
    '망설이지 마세요. 당신의 직감이 옳습니다!',
    '우주의 기운이 당신을 응원하고 있습니다. GO!',
    '지금 안 하면 평생 후회할지도 모릅니다. 무조건 YES!',
    '행운의 여신이 미소 짓고 있습니다. 거침없이 돌진하세요!'
  ],

  noAdvices: [
    '오늘은 한 템포 쉬어가는 것이 현명합니다. 잠시 멈추세요.',
    '지갑과 멘탈을 지킬 타이밍입니다. 절대 NO!',
    '다시 한번 신중하게 생각해 보세요. 지금은 때가 아닙니다.',
    '위험 신호가 감지되었습니다! 다른 길을 모색해 보세요.',
    '자고 일어나서 내일 다시 생각해 보세요. 오늘은 패스!'
  ],

  init(containerEl) {
    this.container = containerEl;
    this.render();
  },

  render() {
    this.container.innerHTML = `
      <div class="yesno-box">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          고민 중인 질문을 입력하고 신비의 구슬을 눌러 운명의 결정을 확인하세요!
        </div>

        <input type="text" id="yesnoInput" class="yesno-question-input" placeholder="고민 중인 질문을 적어보세요 (예: 오늘 야식 치킨 먹을까?)" maxlength="80">

        <div style="display:flex; justify-content:center; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap;">
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.75rem;" onclick="YesNoGame.setSample('오늘 야식으로 치킨 시킬까?')">치킨 시킬까? 🍗</button>
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.75rem;" onclick="YesNoGame.setSample('지금 장바구니 결제할까?')">장바구니 살까? 🛒</button>
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.75rem;" onclick="YesNoGame.setSample('주말에 여행 갈까?')">여행 갈까? ✈️</button>
        </div>

        <div class="yesno-orb-wrap" id="yesnoOrb" onclick="YesNoGame.decide()">
          <span class="yesno-orb-text" id="yesnoResultText">?</span>
        </div>

        <div class="yesno-commentary" id="yesnoCommentary">신비의 구슬을 터치해 보세요</div>

        <div class="game-controls-bar">
          <button class="btn btn-primary" id="yesnoBtn" style="padding:0.75rem 1.8rem;" onclick="YesNoGame.decide()">🔮 운명의 결정 확인하기</button>
        </div>

        <div id="yesnoHistoryWrap" style="margin-top:2rem; text-align:left; max-width:480px; margin-left:auto; margin-right:auto; display:none;">
          <h4 style="font-size:0.9rem; font-weight:800; color:var(--text-secondary); margin-bottom:0.5rem;">최근 결정 기록</h4>
          <div id="yesnoHistoryList" style="display:flex; flex-direction:column; gap:0.4rem;"></div>
        </div>
      </div>
    `;

    document.getElementById('yesnoInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.decide();
    });
  },

  setSample(text) {
    const input = document.getElementById('yesnoInput');
    input.value = text;
    this.decide();
  },

  decide() {
    if (this.isDeciding) return;
    const input = document.getElementById('yesnoInput');
    const question = input.value.trim() || '오늘의 운명은?';

    this.isDeciding = true;
    const orb = document.getElementById('yesnoOrb');
    const textEl = document.getElementById('yesnoResultText');
    const commentEl = document.getElementById('yesnoCommentary');
    const btn = document.getElementById('yesnoBtn');

    btn.disabled = true;
    orb.classList.add('spinning');
    textEl.textContent = '...';
    commentEl.textContent = '운명의 주사위를 굴리는 중...';
    App.playSound('tick');

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      textEl.textContent = counter % 2 === 0 ? 'YES' : 'NO';
      App.playSound('pop');
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      orb.classList.remove('spinning');
      this.isDeciding = false;
      btn.disabled = false;

      const isYes = Math.random() < 0.5;
      const result = isYes ? 'YES' : 'NO';
      const adviceList = isYes ? this.yesAdvices : this.noAdvices;
      const advice = adviceList[Math.floor(Math.random() * adviceList.length)];

      textEl.textContent = result;
      if (isYes) {
        orb.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        orb.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.45)';
        commentEl.innerHTML = `<span style="color:#059669; font-weight:800;">[YES]</span> ${advice}`;
        App.playSound('win');
        App.confettiBurst();
      } else {
        orb.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        orb.style.boxShadow = '0 10px 30px rgba(239, 68, 68, 0.45)';
        commentEl.innerHTML = `<span style="color:#dc2626; font-weight:800;">[NO]</span> ${advice}`;
        App.playSound('wrong');
      }

      this.addHistory(question, result);
    }, 2200);
  },

  addHistory(question, result) {
    this.history.unshift({ question, result, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    if (this.history.length > 5) this.history.pop();

    const wrap = document.getElementById('yesnoHistoryWrap');
    const list = document.getElementById('yesnoHistoryList');
    wrap.style.display = 'block';

    list.innerHTML = this.history.map(item => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:0.4rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.85rem;">
        <span style="font-weight:600; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:280px;">${item.question}</span>
        <span style="font-weight:800; color:${item.result === 'YES' ? '#059669' : '#dc2626'};">${item.result}</span>
      </div>
    `).join('');
  }
};
