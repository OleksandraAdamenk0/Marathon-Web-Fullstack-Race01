let turnTimerInterval;
let turnTime = 20;

export function startTurnTimer(onTimeout) {
  const timerValueEl = document.getElementById('timer-value');
  if (!timerValueEl) return;

  clearInterval(turnTimerInterval);
  turnTime = 20;
  timerValueEl.textContent = `00:${turnTime.toString().padStart(2, '0')}`;

  turnTimerInterval = setInterval(() => {
    turnTime--;
    timerValueEl.textContent = `00:${turnTime.toString().padStart(2, '0')}`;

    if (turnTime <= 0) {
      clearInterval(turnTimerInterval);
      console.log('[Timer] Time is up!');
      if (typeof onTimeout === 'function') onTimeout();
    }
  }, 1000);
}

export function stopTurnTimer() {
  clearInterval(turnTimerInterval);
  if (turnTime <= 0) {
    clearInterval(turnTimerInterval);

  
    if (typeof onTimeout === 'function') onTimeout();
  }
  
}

export function resetTurnTimerDisplay() {
  const timerValueEl = document.getElementById('timer-value');
  if (timerValueEl) timerValueEl.textContent = '00:20';
}
