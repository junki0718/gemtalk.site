/**
 * gemtalk PLAYGROUND - Core Application Engine
 * Router, Game Registry, Web Audio FX, Canvas Confetti & State Management
 */

window.App = {
  currentGameId: null,
  activeCategory: 'all',
  searchQuery: '',
  soundEnabled: true,
  audioCtx: null,

  // 15 Games Registry
  games: [
    // Category 1: 랜덤 / 내기 게임
    {
      id: 'ladder',
      name: '사다리 타기',
      category: '랜덤 / 내기 게임',
      catKey: 'random',
      desc: '참가자와 벌칙/당첨 결과를 설정하고 스릴 넘치는 사다리를 타보세요!',
      icon: '🪜',
      iconBg: 'linear-gradient(135deg, #fbcfe8, #f472b6)',
      popular: true,
      tag: 'HOT',
      module: 'LadderGame',
      instructions: '참가자와 결과를 입력한 후 사다리를 생성하고, 이름을 클릭하여 결과를 확인하세요.'
    },
    {
      id: 'roulette',
      name: '룰렛 돌리기',
      category: '랜덤 / 내기 게임',
      catKey: 'random',
      desc: '점심 메뉴, 벌칙, 당첨자 추첨까지! 시원하게 돌아가는 원판 룰렛!',
      icon: '🎡',
      iconBg: 'linear-gradient(135deg, #fed7aa, #fb923c)',
      popular: true,
      tag: 'BEST',
      module: 'RouletteGame',
      instructions: '항목을 추가하고 [룰렛 돌리기]를 누르면 물리 회전 애니메이션 후 당첨 항목이 결정됩니다.'
    },
    {
      id: 'draw',
      name: '제비뽑기',
      category: '랜덤 / 내기 게임',
      catKey: 'random',
      desc: '카드 속에 숨겨진 운명! 친구들과 모여 긴장감 넘치는 제비를 뽑아보세요.',
      icon: '🎁',
      iconBg: 'linear-gradient(135deg, #ddd6fe, #a78bfa)',
      popular: false,
      tag: '인기',
      module: 'DrawLotsGame',
      instructions: '참가자 목록을 설정한 후 카드를 뒤집어 당첨과 꽝을 확인하세요.'
    },
    {
      id: 'yesno',
      name: 'YES or NO',
      category: '랜덤 / 내기 게임',
      catKey: 'random',
      desc: '결정 장애가 올 땐? 신비의 운명 구슬이 명쾌한 해답을 내려줍니다.',
      icon: '🔮',
      iconBg: 'linear-gradient(135deg, #c7d2fe, #818cf8)',
      popular: false,
      tag: 'NEW',
      module: 'YesNoGame',
      instructions: '고민되는 질문을 입력하고 구슬을 클릭하여 YES 또는 NO의 조언을 얻으세요.'
    },

    // Category 2: 반응속도 / 기록 경쟁
    {
      id: 'reaction',
      name: '반응속도 테스트',
      category: '반응속도 / 기록 경쟁',
      catKey: 'speed',
      desc: '초록색으로 바뀌는 찰나의 순간을 포착하라! 내 순발력 등급은?',
      icon: '⚡',
      iconBg: 'linear-gradient(135deg, #bbf7d0, #4ade80)',
      popular: true,
      tag: 'HOT',
      module: 'ReactionGame',
      recordKey: 'gt_best_reaction',
      recordSuffix: ' ms',
      instructions: '화면이 초록색으로 변하는 순간 최대한 빠르게 화면을 클릭하세요.'
    },
    {
      id: 'typing',
      name: '타자 속도 테스트',
      category: '반응속도 / 기록 경쟁',
      catKey: 'speed',
      desc: '명언과 재미있는 문장들을 빠르게 입력하고 나의 CPM 타수를 측정하세요.',
      icon: '⌨️',
      iconBg: 'linear-gradient(135deg, #bae6fd, #38bdf8)',
      popular: false,
      tag: '기록',
      module: 'TypingGame',
      recordKey: 'gt_best_typing',
      recordSuffix: ' CPM',
      instructions: '제시된 문장을 오타 없이 빠르게 타이핑하여 분당 타수와 정확도를 겨루세요.'
    },
    {
      id: 'colormatch',
      name: '색깔 맞추기',
      category: '반응속도 / 기록 경쟁',
      catKey: 'speed',
      desc: '글자의 뜻에 속지 마세요! 실제 칠해진 색상을 맞추는 두뇌 트레이닝!',
      icon: '🎨',
      iconBg: 'linear-gradient(135deg, #fef08a, #facc15)',
      popular: false,
      tag: '두뇌',
      module: 'ColorMatchGame',
      recordKey: 'gt_best_colormatch',
      recordSuffix: '점',
      instructions: '글자의 글자색(폰트 컬러)에 해당하는 색상 버튼을 재빨리 클릭하세요.'
    },
    {
      id: 'schulte',
      name: '숫자 순서 맞추기',
      category: '반응속도 / 기록 경쟁',
      catKey: 'speed',
      desc: '1부터 25까지 흩어진 숫자를 순서대로 터치! 슐테 그리드 순발력 측정!',
      icon: '🔢',
      iconBg: 'linear-gradient(135deg, #e9d5ff, #c084fc)',
      popular: true,
      tag: '추천',
      module: 'SchulteGame',
      recordKey: 'gt_best_schulte',
      recordSuffix: '초',
      instructions: '1부터 25까지의 숫자를 순서대로 최대한 빠른 시간 안에 터치하세요.'
    },

    // Category 3: 두뇌 / 캐주얼 게임
    {
      id: '2048',
      name: '2048',
      category: '두뇌 / 캐주얼 게임',
      catKey: 'brain',
      desc: '방향키와 스와이프로 같은 숫자를 합쳐 전설의 2048 타일을 달성하세요.',
      icon: '🧩',
      iconBg: 'linear-gradient(135deg, #fed7aa, #fb923c)',
      popular: true,
      tag: 'BEST',
      module: 'Game2048',
      recordKey: 'gt_best_2048',
      recordSuffix: '점',
      instructions: '방향키나 모바일 스와이프로 타일을 밀어 같은 숫자를 2048까지 합쳐보세요.'
    },
    {
      id: 'rps',
      name: '가위바위보',
      category: '두뇌 / 캐주얼 게임',
      catKey: 'brain',
      desc: '인공지능 컴퓨터와의 숨 막히는 심리전! 최고 연승 기록에 도전하세요.',
      icon: '✊',
      iconBg: 'linear-gradient(135deg, #fecdd3, #fb7185)',
      popular: false,
      tag: '클래식',
      module: 'RpsGame',
      recordKey: 'gt_best_rps',
      recordSuffix: '연승',
      instructions: '가위, 바위, 보 중 하나를 골라 컴퓨터와 대결하고 연승 기록을 세우세요.'
    },
    {
      id: 'memory',
      name: '카드 짝 맞추기',
      category: '두뇌 / 캐주얼 게임',
      catKey: 'brain',
      desc: '뒤집힌 16장의 카드 속 같은 그림 8쌍을 가장 적은 횟수로 찾아내세요.',
      icon: '🃏',
      iconBg: 'linear-gradient(135deg, #a7f3d0, #34d399)',
      popular: false,
      tag: '두뇌',
      module: 'MemoryGame',
      recordKey: 'gt_best_memory',
      recordSuffix: '회',
      instructions: '카드를 두 장씩 뒤집어 같은 그림의 짝을 모두 맞추세요.'
    },
    {
      id: 'minesweeper',
      name: '지뢰찾기',
      category: '두뇌 / 캐주얼 게임',
      catKey: 'brain',
      desc: '숫자 힌트로 지뢰를 추리하라! 초급부터 고급까지 클래식 지뢰찾기 퍼즐!',
      icon: '💣',
      iconBg: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
      popular: true,
      tag: '명작',
      module: 'MinesweeperGame',
      instructions: '주변 지뢰 수를 나타내는 숫자를 보고 안전한 칸을 열고 지뢰엔 깃발을 꽂으세요.'
    },

    // Category 4: 친구들과 함께하는 게임
    {
      id: 'choseong',
      name: '초성 퀴즈',
      category: '친구들과 함께하는 게임',
      catKey: 'party',
      desc: '음식, 영화, 사자성어 초성을 보고 정답을 맞춰보세요! 두뇌 회전 UP!',
      icon: '🎯',
      iconBg: 'linear-gradient(135deg, #fbcfe8, #f472b6)',
      popular: true,
      tag: 'HOT',
      module: 'ChoseongGame',
      recordKey: 'gt_best_choseong',
      recordSuffix: '점',
      instructions: '제시된 카테고리와 초성을 보고 제한시간 내에 올바른 단어를 입력하세요.'
    },
    {
      id: 'updown',
      name: '업다운 게임',
      category: '친구들과 함께하는 게임',
      catKey: 'party',
      desc: '1~100 사이의 숨겨진 숫자를 찾아라! UP/DOWN 힌트로 범위를 좁히세요.',
      icon: '📈',
      iconBg: 'linear-gradient(135deg, #bae6fd, #38bdf8)',
      popular: false,
      tag: '파티',
      module: 'UpDownGame',
      recordKey: 'gt_best_updown',
      recordSuffix: '회',
      instructions: '숫자를 추측하여 입력하면 정답보다 큰지 작은지 힌트가 주어집니다.'
    },
    {
      id: 'balance',
      name: '밸런스 게임',
      category: '친구들과 함께하는 게임',
      catKey: 'party',
      desc: '둘 다 포기할 수 없는 극한의 딜레마! 실시간 대중의 투표 비율 확인!',
      icon: '⚖️',
      iconBg: 'linear-gradient(135deg, #fed7aa, #fb7185)',
      popular: true,
      tag: '인기',
      module: 'BalanceGame',
      instructions: '두 가지 선택지 중 마음에 드는 쪽을 골라 대중의 선택 비율을 확인하세요.'
    }
  ],

  init() {
    this.soundEnabled = localStorage.getItem('gt_sound_enabled') !== 'false';
    this.updateSoundBtnVisual();
    this.initConfetti();
    this.renderPopularGames();
    this.renderAllGames();
    this.setupEvents();
    this.handleRoute();
  },

  setupEvents() {
    window.addEventListener('hashchange', () => this.handleRoute());

    // Search input
    const searchInput = document.getElementById('globalSearchInput');
    const searchClear = document.getElementById('searchClearBtn');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (searchClear) searchClear.classList.toggle('visible', this.searchQuery.length > 0);
        this.renderAllGames();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        this.searchQuery = '';
        searchClear.classList.remove('visible');
        this.renderAllGames();
      });
    }

    // Sound toggle
    const soundBtn = document.getElementById('globalSoundToggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => this.toggleSound());
    }
  },

  handleRoute() {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && hash !== 'home') {
      const game = this.games.find(g => g.id === hash);
      if (game) {
        this.openGame(game.id, false);
        return;
      }
    }
    this.showHomeView();
  },

  cleanupActiveGame() {
    if (!this.currentGameId) return;
    const game = this.games.find(g => g.id === this.currentGameId);
    if (game && window[game.module] && typeof window[game.module].cleanup === 'function') {
      try { window[game.module].cleanup(); } catch (e) {}
    }
  },

  showHomeView() {
    this.cleanupActiveGame();
    this.currentGameId = null;
    document.getElementById('homeView').style.display = 'block';
    document.getElementById('gameView').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openGame(gameId, updateHash = true) {
    this.cleanupActiveGame();
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    this.currentGameId = gameId;
    if (updateHash) {
      window.location.hash = `#${gameId}`;
    }

    document.getElementById('homeView').style.display = 'none';
    const gameView = document.getElementById('gameView');
    gameView.style.display = 'block';

    // Populate game view header
    document.getElementById('gameStageTitle').textContent = game.name;
    document.getElementById('gameStageCategory').textContent = game.category;
    const iconEl = document.getElementById('gameStageIcon');
    iconEl.textContent = game.icon;
    iconEl.style.background = game.iconBg;

    // Instructions bar
    document.getElementById('gameStageInstructions').innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      ${game.instructions}
    `;

    // Initialize the module
    const stageContainer = document.getElementById('gameStageContainer');
    stageContainer.innerHTML = '';

    const moduleObj = window[game.module];
    if (moduleObj && typeof moduleObj.init === 'function') {
      moduleObj.init(stageContainer);
    } else {
      stageContainer.innerHTML = `<p>게임을 불러오는 중...</p>`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.playSound('click');
  },

  restartCurrentGame() {
    if (!this.currentGameId) return;
    const game = this.games.find(g => g.id === this.currentGameId);
    if (game && window[game.module] && typeof window[game.module].init === 'function') {
      window[game.module].init(document.getElementById('gameStageContainer'));
      this.playSound('click');
      this.toast('게임을 다시 시작했습니다.');
    }
  },

  goHome() {
    window.location.hash = '#home';
    this.showHomeView();
    this.playSound('click');
  },

  startRandomGame() {
    const rand = this.games[Math.floor(Math.random() * this.games.length)];
    this.toast(`🎲 [${rand.name}] 게임으로 이동합니다!`);
    this.playSound('pop');
    this.openGame(rand.id);
  },

  filterCategory(catKey, el) {
    this.activeCategory = catKey;
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    if (el) el.classList.add('active');
    this.renderAllGames();
    this.playSound('click');
  },

  renderPopularGames() {
    const grid = document.getElementById('popularGamesGrid');
    if (!grid) return;
    const populars = this.games.filter(g => g.popular);

    grid.innerHTML = populars.map(g => `
      <div class="popular-card" onclick="App.openGame('${g.id}')">
        <div class="popular-card-icon" style="background:${g.iconBg};">${g.icon}</div>
        <div class="popular-card-info">
          <div class="popular-card-title">
            ${g.name}
            <span class="hot-badge">${g.tag}</span>
          </div>
          <div class="popular-card-desc">${g.desc}</div>
        </div>
      </div>
    `).join('');
  },

  renderAllGames() {
    const grid = document.getElementById('allGamesGrid');
    if (!grid) return;

    let filtered = this.games;

    // Filter by Category
    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(g => g.catKey === this.activeCategory);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(this.searchQuery) ||
        g.desc.toLowerCase().includes(this.searchQuery) ||
        g.category.toLowerCase().includes(this.searchQuery)
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">검색 결과가 없습니다.</div>
          <div class="empty-state-desc">다른 검색어를 입력하거나 카테고리를 변경해 보세요.</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(g => {
      let recordDisplay = '';
      if (g.recordKey) {
        const val = localStorage.getItem(g.recordKey);
        if (val) {
          recordDisplay = `<div class="game-record-pill">🏆 내 최고: ${val}${g.recordSuffix || ''}</div>`;
        }
      }

      return `
        <div class="game-card" onclick="App.openGame('${g.id}')">
          <div class="game-card-header">
            <div class="game-icon-box" style="background:${g.iconBg};">${g.icon}</div>
            <div class="game-badges">
              <span class="category-tag cat-${g.catKey}">${g.category}</span>
              ${g.tag ? `<span class="hot-badge">${g.tag}</span>` : ''}
            </div>
          </div>
          <div class="game-card-body">
            <h3 class="game-title">${g.name}</h3>
            <p class="game-desc">${g.desc}</p>
            ${recordDisplay}
          </div>
          <div class="game-card-footer">
            <button class="game-play-btn">
              플레이하기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  updateRecordDisplay(gameId, text) {
    this.renderAllGames();
  },

  resetAllRecords() {
    if (confirm('모든 게임의 최고 기록과 점수를 초기화하시겠습니까?')) {
      const keys = ['gt_best_reaction', 'gt_best_typing', 'gt_best_colormatch', 'gt_best_schulte', 'gt_best_2048', 'gt_best_rps', 'gt_best_memory', 'gt_best_choseong', 'gt_best_updown'];
      keys.forEach(k => localStorage.removeItem(k));
      this.renderAllGames();
      this.toast('모든 기록이 초기화되었습니다.');
      this.playSound('pop');
    }
  },

  // ========================================================
  // Sound FX Engine (Web Audio API Synthesizer)
  // ========================================================
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('gt_sound_enabled', String(this.soundEnabled));
    this.updateSoundBtnVisual();
    this.toast(this.soundEnabled ? '🔊 효과음이 켜졌습니다.' : '🔇 효과음이 꺼졌습니다.');
  },

  updateSoundBtnVisual() {
    const btn = document.getElementById('globalSoundToggle');
    if (btn) {
      btn.innerHTML = this.soundEnabled 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      btn.title = this.soundEnabled ? '효과음 끄기' : '효과음 켜기';
    }
  },

  playSound(type) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);

      } else if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);

      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);

      } else if (type === 'win') {
        // Joyful chord (C5, E5, G5, C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.35);
        });

      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);

      } else if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // AudioContext might be blocked until user gesture
    }
  },

  // ========================================================
  // Confetti Particle Engine
  // ========================================================
  initConfetti() {
    this.confettiCanvas = document.getElementById('confetti-canvas');
    if (!this.confettiCanvas) return;
    this.confettiCtx = this.confettiCanvas.getContext('2d');
    this.confettiParticles = [];
    this.confettiRunning = false;

    const resize = () => {
      this.confettiCanvas.width = window.innerWidth;
      this.confettiCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
  },

  confettiBurst() {
    if (!this.confettiCanvas) return;
    const colors = ['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const count = 90;

    for (let i = 0; i < count; i++) {
      this.confettiParticles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    if (!this.confettiRunning) {
      this.confettiRunning = true;
      this.animateConfetti();
    }
  },

  animateConfetti() {
    if (!this.confettiRunning) return;
    const ctx = this.confettiCtx;
    ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

    for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
      const p = this.confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // Gravity
      p.vx *= 0.98; // Air resistance
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.012;

      if (p.opacity <= 0 || p.y > window.innerHeight + 20) {
        this.confettiParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }

    if (this.confettiParticles.length > 0) {
      requestAnimationFrame(() => this.animateConfetti());
    } else {
      this.confettiRunning = false;
      ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
    }
  },

  // ========================================================
  // Toast Notice
  // ========================================================
  toast(msg) {
    let toastEl = document.getElementById('appToast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'appToast';
      toastEl.className = 'toast-notice';
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = `<span>✨</span> <span>${msg}</span>`;
    toastEl.classList.add('show');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }
};

// Auto start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
