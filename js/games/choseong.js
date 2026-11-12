/**
 * 초성 퀴즈 (Korean Consonant Quiz)
 */
window.ChoseongGame = {
  container: null,
  questions: [
    { category: '음식 / 과일 🍕', initials: 'ㅂㅅㅇ', answer: '복숭아', hint: '여름철 달콤한 과일' },
    { category: '음식 / 과일 🍕', initials: 'ㄸㅂㅇ', answer: '떡볶이', hint: '한국인의 대표 국민 분식' },
    { category: '음식 / 과일 🍕', initials: 'ㅈㅈㅁ', answer: '짜장면', hint: '이사할 때 먹는 대표 중식' },
    { category: '음식 / 과일 🍕', initials: 'ㅅㄱㅅ', answer: '삼겹살', hint: '회식 메뉴 부동의 1위' },
    { category: '음식 / 과일 🍕', initials: 'ㅁㄹㅌ', answer: '마라탕', hint: '얼얼하고 매운 중국식 국물 요리' },
    { category: '영화 제목 🎬', initials: 'ㄱㅅㅊ', answer: '기생충', hint: '오스카 4관왕 봉준호 감독 작품' },
    { category: '영화 제목 🎬', initials: 'ㅂㅌㅁ', answer: '베테랑', hint: '어이가 없네~ 유아인, 황정민' },
    { category: '영화 제목 🎬', initials: 'ㅇㅂㅈㅅ', answer: '어벤져스', hint: '마블 슈퍼히어로 총출동' },
    { category: '사자성어 📚', initials: 'ㅇㄱㅇㄷ', answer: '일거양득', hint: '하나의 일로 두 가지 이익을 얻음' },
    { category: '사자성어 📚', initials: 'ㄷㅅㄷㅍ', answer: '다사다난', hint: '여러 가지 일과 어려움이 많음' },
    { category: '동물 🐱', initials: 'ㅍㄱ', answer: '펭귄', hint: '남극에 사는 날지 못하는 새' },
    { category: '동물 🐱', initials: 'ㅋㅇㄹ', answer: '코알라', hint: '유칼립투스를 먹는 호주 동물' },
    { category: '일상 / 상식 💡', initials: 'ㅅㅁㅌㅍ', answer: '스마트폰', hint: '현대인의 필수 휴대 전자기기' },
    { category: '일상 / 상식 💡', initials: 'ㄴㅂㅅ', answer: '넷플릭스', hint: '세계 1위 글로벌 OTT 플랫폼' }
  ],
  currentIndex: 0,
  score: 0,
  timeLeft: 20,
  timerInterval: null,
  hintRevealed: false,
  bestScore: 0,

  init(containerEl) {
    this.container = containerEl;
    this.bestScore = parseInt(localStorage.getItem('gt_best_choseong') || '0', 10) || 0;
    this.score = 0;
    this.currentIndex = 0;
    this.shuffleQuestions();
    this.render();
  },

  shuffleQuestions() {
    for (let i = this.questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
    }
  },

  render() {
    const q = this.questions[this.currentIndex];
    this.hintRevealed = false;
    this.timeLeft = 20;
    clearInterval(this.timerInterval);

    this.container.innerHTML = `
      <div class="game-flex-center">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          제시된 초성을 보고 정답을 맞춰보세요! 제한시간 내에 입력하면 다음 문제로 넘어갑니다.
        </div>

        <div style="display:flex; gap:1rem; margin-bottom:1.5rem; justify-content:center; flex-wrap:wrap;">
          <div class="stat-pill">현재 점수: <strong id="choseongScore" style="color:var(--primary-purple);">${this.score}점</strong></div>
          <div class="stat-pill">남은 시간: <strong id="choseongTimer" style="color:#ef4444;">${this.timeLeft}초</strong></div>
          <div class="stat-pill">문제 번호: <strong>${this.currentIndex + 1} / ${this.questions.length}</strong></div>
          <div class="stat-pill">최고 점수: <strong>${this.bestScore}점</strong></div>
        </div>

        <div class="choseong-box">
          <div class="choseong-category-badge">${q.category}</div>
          <div class="choseong-display">${q.initials}</div>

          <div id="choseongHintBox" style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:1rem; min-height:1.4rem;"></div>

          <form class="choseong-form" onsubmit="event.preventDefault(); ChoseongGame.checkAnswer();">
            <input type="text" id="choseongAnswerInput" class="typing-input" placeholder="정답을 입력하세요..." autocomplete="off" autofocus>
            <button type="submit" class="btn btn-primary" style="flex-shrink:0; padding:0 1.5rem;">정답 확인</button>
          </form>

          <div style="display:flex; gap:0.5rem; justify-content:center;">
            <button class="btn btn-secondary" style="font-size:0.85rem; padding:0.4rem 0.8rem;" onclick="ChoseongGame.showHint()">💡 힌트 보기</button>
            <button class="btn btn-secondary" style="font-size:0.85rem; padding:0.4rem 0.8rem;" onclick="ChoseongGame.skipQuestion()">건너뛰기 ⏩</button>
          </div>
        </div>
      </div>
    `;

    this.startTimer();
  },

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      const timerEl = document.getElementById('choseongTimer');
      if (timerEl) timerEl.textContent = `${this.timeLeft}초`;

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        App.playSound('wrong');
        const q = this.questions[this.currentIndex];
        App.toast(`⏰ 시간 초과! 정답은 [${q.answer}] 이었습니다.`);
        setTimeout(() => this.nextQuestion(), 1500);
      }
    }, 1000);
  },

  showHint() {
    if (this.hintRevealed) return;
    this.hintRevealed = true;
    const q = this.questions[this.currentIndex];
    document.getElementById('choseongHintBox').innerHTML = `💡 힌트: <strong>${q.hint}</strong> (첫 글자: ${q.answer[0]})`;
    App.playSound('tick');
  },

  checkAnswer() {
    const input = document.getElementById('choseongAnswerInput');
    const userAns = input.value.trim().replace(/\s+/g, '');
    const correctAns = this.questions[this.currentIndex].answer.replace(/\s+/g, '');

    if (!userAns) return;

    if (userAns === correctAns) {
      clearInterval(this.timerInterval);
      const points = this.hintRevealed ? 5 : 10;
      this.score += points;
      App.playSound('win');
      App.toast(`🎉 정답입니다! (+${points}점)`);

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('gt_best_choseong', String(this.bestScore));
        App.updateRecordDisplay('choseong', `${this.bestScore}점`);
      }

      setTimeout(() => this.nextQuestion(), 1000);
    } else {
      input.value = '';
      App.playSound('wrong');
      App.toast('틀렸습니다! 다시 생각해보세요.');
    }
  },

  skipQuestion() {
    clearInterval(this.timerInterval);
    const q = this.questions[this.currentIndex];
    App.toast(`건너뜀! 정답은 [${q.answer}] 이었습니다.`);
    this.nextQuestion();
  },

  nextQuestion() {
    this.currentIndex++;
    if (this.currentIndex >= this.questions.length) {
      this.finish();
    } else {
      this.render();
    }
  },

  finish() {
    clearInterval(this.timerInterval);
    App.playSound('win');
    App.confettiBurst();

    this.container.innerHTML = `
      <div class="game-flex-center">
        <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:2.5rem; text-align:center; max-width:480px; width:100%;">
          <h2 style="font-size:2rem; font-weight:900; margin-bottom:0.5rem;">🎉 퀴즈 완료!</h2>
          <p style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:1.5rem;">모든 초성 퀴즈를 완료했습니다.</p>
          <div style="font-size:3.5rem; font-weight:900; color:var(--primary-purple); margin-bottom:0.5rem;">${this.score}점</div>
          <div class="stat-pill" style="margin-bottom:1.5rem;">최고 기록: ${this.bestScore}점</div>
          <button class="btn btn-primary" style="padding:0.8rem 2rem;" onclick="ChoseongGame.init(document.getElementById('gameStageContainer'))">다시 도전하기</button>
        </div>
      </div>
    `;
  },

  cleanup() {
    clearInterval(this.timerInterval);
  }
};
