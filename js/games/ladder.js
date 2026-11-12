/**
 * 사다리 타기 (Ghost Leg / Ladder Game)
 */
window.LadderGame = {
  container: null,
  canvas: null,
  ctx: null,
  players: ['철수', '영희', '민수', '지훈'],
  results: ['당첨 🎉', '커피 ☕', '꽝 💥', '점심 🍔'],
  rungs: [],
  animating: false,

  init(containerEl) {
    this.container = containerEl;
    this.renderSetup();
  },

  renderSetup() {
    this.container.innerHTML = `
      <div class="ladder-setup">
        <div class="game-instructions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          참가자와 결과를 입력한 후 [사다리 생성]을 누르세요. 생성 후 참가자를 클릭하면 사다리를 타고 내려갑니다!
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; flex-wrap:wrap; gap:0.5rem;">
          <h3 style="font-weight:800; font-size:1.1rem;">참가자 & 결과 설정 (2~8명)</h3>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="LadderGame.addPlayer()">+ 참가자 추가</button>
            <button class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="LadderGame.removePlayer()">- 참가자 삭제</button>
          </div>
        </div>

        <div class="ladder-columns-input" id="ladderInputCols"></div>

        <div class="game-controls-bar">
          <button class="btn btn-primary" onclick="LadderGame.generateLadder()">🪜 사다리 생성하기</button>
        </div>

        <div id="ladderPlayArea" style="display:none; margin-top:1.5rem;">
          <div style="text-align:center; margin-bottom:0.75rem; font-weight:700; color:var(--text-secondary);">
            👇 상단의 참가자 이름을 클릭하면 해당 경로를 따라 결과로 이동합니다!
          </div>
          <div class="ladder-canvas-container">
            <canvas id="ladderCanvas" width="600" height="420"></canvas>
          </div>
          <div class="game-controls-bar">
            <button class="btn btn-secondary" onclick="LadderGame.showAllResults()">전체 결과 한번에 보기</button>
            <button class="btn btn-mint" onclick="LadderGame.generateLadder()">다시 섞기</button>
          </div>
          <div id="ladderSummaryArea"></div>
        </div>
      </div>
    `;

    this.renderInputFields();
  },

  renderInputFields() {
    const colsEl = document.getElementById('ladderInputCols');
    if (!colsEl) return;
    colsEl.innerHTML = this.players.map((p, idx) => `
      <div class="ladder-col-field">
        <span class="ladder-col-label">참가자 ${idx + 1}</span>
        <input type="text" class="ladder-input" value="${p}" onchange="LadderGame.updatePlayer(${idx}, this.value)" placeholder="이름">
        <span class="ladder-col-label" style="color:var(--primary-mint);">결과 ${idx + 1}</span>
        <input type="text" class="ladder-input" value="${this.results[idx] || '결과'}" onchange="LadderGame.updateResult(${idx}, this.value)" placeholder="결과">
      </div>
    `).join('');
  },

  updatePlayer(idx, val) {
    this.players[idx] = val.trim() || `참가자${idx + 1}`;
  },

  updateResult(idx, val) {
    this.results[idx] = val.trim() || `결과${idx + 1}`;
  },

  addPlayer() {
    if (this.players.length >= 8) {
      App.toast('최대 8명까지 참여할 수 있습니다.');
      return;
    }
    const nextIdx = this.players.length + 1;
    this.players.push(`참가자 ${nextIdx}`);
    this.results.push(`결과 ${nextIdx}`);
    this.renderInputFields();
  },

  removePlayer() {
    if (this.players.length <= 2) {
      App.toast('최소 2명 이상이어야 합니다.');
      return;
    }
    this.players.pop();
    this.results.pop();
    this.renderInputFields();
  },

  generateLadder() {
    const playArea = document.getElementById('ladderPlayArea');
    playArea.style.display = 'block';
    document.getElementById('ladderSummaryArea').innerHTML = '';

    this.canvas = document.getElementById('ladderCanvas');
    this.ctx = this.canvas.getContext('2d');

    const numPlayers = this.players.length;
    const canvasWidth = Math.max(540, numPlayers * 90);
    this.canvas.width = canvasWidth;
    this.canvas.height = 440;

    // Generate random horizontal rungs
    this.rungs = [];
    const numRungLevels = 10;
    const paddingY = 60;
    const levelHeight = (this.canvas.height - paddingY * 2) / (numRungLevels + 1);

    for (let lvl = 1; lvl <= numRungLevels; lvl++) {
      const y = paddingY + lvl * levelHeight;
      for (let col = 0; col < numPlayers - 1; col++) {
        // avoid adjacent rungs at same level
        const prevHasRung = this.rungs.some(r => r.y === y && r.col === col - 1);
        if (!prevHasRung && Math.random() < 0.45) {
          this.rungs.push({ col, y });
        }
      }
    }

    // Ensure at least one rung per column
    for (let col = 0; col < numPlayers - 1; col++) {
      const hasRung = this.rungs.some(r => r.col === col);
      if (!hasRung) {
        const y = paddingY + Math.floor(1 + Math.random() * numRungLevels) * levelHeight;
        this.rungs.push({ col, y });
      }
    }

    this.drawLadder();

    this.canvas.onclick = (e) => {
      if (this.animating) return;
      const rect = this.canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const clickY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

      if (clickY <= 60) {
        const numCols = this.players.length;
        const padX = 60;
        const colSpacing = (this.canvas.width - padX * 2) / (numCols - 1);
        for (let i = 0; i < numCols; i++) {
          const colX = padX + i * colSpacing;
          if (Math.abs(clickX - colX) < 40) {
            this.animatePath(i);
            break;
          }
        }
      }
    };

    App.playSound('click');
  },

  drawLadder(highlightPath = null) {
    const { ctx, canvas, players, results, rungs } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const numCols = players.length;
    const padX = 60;
    const padY = 60;
    const bottomY = canvas.height - padY;
    const colSpacing = (canvas.width - padX * 2) / (numCols - 1);

    // Draw vertical columns
    for (let i = 0; i < numCols; i++) {
      const x = padX + i * colSpacing;
      ctx.beginPath();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.moveTo(x, padY);
      ctx.lineTo(x, bottomY);
      ctx.stroke();

      // Draw Player Header Pill
      ctx.fillStyle = '#7c3aed';
      this.drawRoundedRect(ctx, x - 38, padY - 38, 76, 30, 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(players[i], x, padY - 23);

      // Draw Result Bottom Pill
      ctx.fillStyle = '#059669';
      this.drawRoundedRect(ctx, x - 38, bottomY + 10, 76, 30, 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(results[i], x, bottomY + 25);
    }

    // Draw horizontal rungs
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    rungs.forEach(rung => {
      const x1 = padX + rung.col * colSpacing;
      const x2 = padX + (rung.col + 1) * colSpacing;
      ctx.beginPath();
      ctx.moveTo(x1, rung.y);
      ctx.lineTo(x2, rung.y);
      ctx.stroke();
    });

    // Draw Highlighted Path if tracing
    if (highlightPath && highlightPath.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 6;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.moveTo(highlightPath[0].x, highlightPath[0].y);
      for (let i = 1; i < highlightPath.length; i++) {
        ctx.lineTo(highlightPath[i].x, highlightPath[i].y);
      }
      ctx.stroke();

      // Draw lead ball
      const head = highlightPath[highlightPath.length - 1];
      ctx.beginPath();
      ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ec4899';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  },

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  },

  computePath(startCol) {
    const numCols = this.players.length;
    const padX = 60;
    const padY = 60;
    const bottomY = this.canvas.height - padY;
    const colSpacing = (this.canvas.width - padX * 2) / (numCols - 1);

    const points = [{ x: padX + startCol * colSpacing, y: padY }];
    let currentCol = startCol;
    let currentY = padY;

    // Sort rungs by y coordinate
    const sortedRungs = [...this.rungs].sort((a, b) => a.y - b.y);

    sortedRungs.forEach(rung => {
      if (rung.y > currentY) {
        if (rung.col === currentCol) {
          // Rung goes right
          points.push({ x: padX + currentCol * colSpacing, y: rung.y });
          currentCol++;
          points.push({ x: padX + currentCol * colSpacing, y: rung.y });
          currentY = rung.y;
        } else if (rung.col === currentCol - 1) {
          // Rung goes left
          points.push({ x: padX + currentCol * colSpacing, y: rung.y });
          currentCol--;
          points.push({ x: padX + currentCol * colSpacing, y: rung.y });
          currentY = rung.y;
        }
      }
    });

    points.push({ x: padX + currentCol * colSpacing, y: bottomY });
    return { endCol: currentCol, points };
  },

  animatePath(startCol) {
    if (this.animating) return;
    this.animating = true;
    const { endCol, points } = this.computePath(startCol);

    let pointIdx = 0;
    let t = 0;
    const currentTrail = [{ x: points[0].x, y: points[0].y }];

    const step = () => {
      if (pointIdx >= points.length - 1) {
        this.animating = false;
        App.playSound('win');
        App.confettiBurst();
        App.toast(`🎉 [${this.players[startCol]}] → [${this.results[endCol]}] 당첨!`);
        return;
      }

      t += 0.08;
      const p1 = points[pointIdx];
      const p2 = points[pointIdx + 1];
      const curX = p1.x + (p2.x - p1.x) * Math.min(1, t);
      const curY = p1.y + (p2.y - p1.y) * Math.min(1, t);

      currentTrail.push({ x: curX, y: curY });
      this.drawLadder(currentTrail);

      if (t >= 1) {
        t = 0;
        pointIdx++;
        App.playSound('tick');
      }

      requestAnimationFrame(step);
    };

    step();
  },

  showAllResults() {
    const summaryArea = document.getElementById('ladderSummaryArea');
    const pairings = this.players.map((p, idx) => {
      const { endCol } = this.computePath(idx);
      return { player: p, result: this.results[endCol] };
    });

    summaryArea.innerHTML = `
      <table class="ladder-results-table">
        <thead>
          <tr><th>참가자</th><th>화살표</th><th>최종 결과</th></tr>
        </thead>
        <tbody>
          ${pairings.map(item => `
            <tr>
              <td><strong>${item.player}</strong></td>
              <td>➔</td>
              <td><span style="color:var(--primary-purple); font-weight:800;">${item.result}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    App.playSound('success');
  }
};
