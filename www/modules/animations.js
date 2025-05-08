function createConfetti(confettiCanvas, ctx, gameState) {
  // Skip animations in low-end mode
  if (gameState && gameState.lowEndMode) return;
  
  const confettiCount = 12; // meno elementi
  const colors = ['#05d9e8', '#ff2a6d', '#d1f7ff', '#16213e'];
  const confettiItems = [];

  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = 0; i < confettiCount; i++) {
    confettiItems.push({
      x: Math.random() * confettiCanvas.width,
      y: -20,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 1,
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let stillActive = false;

    confettiItems.forEach((item) => {
      item.y += item.speed;

      if (item.y < confettiCanvas.height) {
        stillActive = true;
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x, item.y, item.size, item.size);
      }
    });

    if (stillActive) {
      setTimeout(() => requestAnimationFrame(animate), 30);
    }
  };

  animate();
}

function createMoveParticles(index, cells, gameState) {
  // Skip animations in low-end mode
  if (gameState && gameState.lowEndMode) return;
  
  const cell = cells[index];
  const rect = cell.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const particleCount = 8; // meno particelle
  const color = gameState.currentPlayer === 'X' ? '#05d9e8' : '#ff2a6d';

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;

    const size = Math.random() * 6 + 3;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 60 + 20;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);

    particle.style.backgroundColor = color;
    particle.style.borderRadius = '50%';

    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 800);
  }
}

function addFloatingElements(gameState) {
  // Skip animations in low-end mode
  if (gameState && gameState.lowEndMode) return;
  
  const shapes = ['circle', 'square'];
  const container = document.body;

  for (let i = 0; i < 10; i++) {
    const element = document.createElement('div');
    element.className = 'floating';

    element.style.left = `${Math.random() * 100}%`;
    element.style.top = `${Math.random() * 100}%`;

    const size = Math.random() * 30 + 10;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;

    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    if (shape === 'circle') {
      element.style.borderRadius = '50%';
    }

    element.style.background =
      Math.random() > 0.5 ? 'rgba(5, 217, 232, 0.05)' : 'rgba(255, 42, 109, 0.05)';

    const duration = Math.random() * 20 + 20;
    const delay = Math.random() * 3;
    element.style.animationDuration = `${duration}s`;
    element.style.animationDelay = `${delay}s`;

    container.appendChild(element);
  }
}

// Function to add vibration effect
function vibrate(duration, gameState) {
  if (gameState && gameState.vibrationEnabled && navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

// Function to remove all animations
function removeAllAnimations() {
  const floatingElements = document.querySelectorAll('.floating');
  floatingElements.forEach(el => el.remove());
  
  const particles = document.querySelectorAll('.particle');
  particles.forEach(el => el.remove());
}

export { createConfetti, createMoveParticles, addFloatingElements, vibrate, removeAllAnimations };
