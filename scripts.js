const HEROES_URL = './data/heroes.json';
const ATTRIBUTE_LABELS = {
  universal: 'Universal',
  intellect: 'Intellect',
  agility: 'Agility',
  strength: 'Strength',
};
const FEEDBACK_DELAY_MS = 1200;

const state = {
  heroes: [],
  queue: [],
  currentIndex: 0,
  answers: [],
  correctCount: 0,
  status: 'loading',
  advanceTimeoutId: null,
};

const elements = {
  dataStatus: document.getElementById('data-status'),
  startButton: document.getElementById('start-button'),
  restartButton: document.getElementById('restart-button'),
  statusBar: document.getElementById('status-bar'),
  answeredCount: document.getElementById('answered-count'),
  remainingCount: document.getElementById('remaining-count'),
  correctCount: document.getElementById('correct-count'),
  screenStart: document.getElementById('screen-start'),
  screenGame: document.getElementById('screen-game'),
  screenEnd: document.getElementById('screen-end'),
  gameCardContent: document.getElementById('game-card-content'),
  heroImage: document.getElementById('hero-image'),
  heroName: document.getElementById('hero-name'),
  resultsBody: document.getElementById('results-body'),
  summaryTitle: document.getElementById('summary-title'),
  summaryCopy: document.getElementById('summary-copy'),
  answerButtons: [...document.querySelectorAll('.answer-button')],
};

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function clearAdvanceTimeout() {
  if (state.advanceTimeoutId !== null) {
    window.clearTimeout(state.advanceTimeoutId);
    state.advanceTimeoutId = null;
  }
}

function setVisibleScreen(screen) {
  elements.screenStart.classList.toggle('hidden', screen !== 'start');
  elements.screenGame.classList.toggle('hidden', screen !== 'game');
  elements.screenEnd.classList.toggle('hidden', screen !== 'end');
}

function updateStatusBar() {
  const answered = state.answers.length;
  const total = state.queue.length;
  const remaining = Math.max(total - answered, 0);

  elements.answeredCount.textContent = `${answered}/${total}`;
  elements.remainingCount.textContent = String(remaining);
  elements.correctCount.textContent = String(state.correctCount);
  elements.statusBar.classList.toggle('hidden', total === 0);
}

function resetAnswerButtons() {
  for (const button of elements.answerButtons) {
    button.disabled = false;
    button.classList.remove('selected', 'correct', 'wrong');
  }
}

function disableAnswerButtons() {
  for (const button of elements.answerButtons) {
    button.disabled = true;
  }
}

function resetFeedbackState() {
  elements.gameCardContent.classList.remove('flash-correct', 'flash-wrong');
}

function currentHero() {
  return state.queue[state.currentIndex] ?? null;
}

function renderCurrentHero() {
  const hero = currentHero();
  if (!hero) {
    finishGame();
    return;
  }

  resetFeedbackState();
  elements.heroName.textContent = hero.name;
  elements.heroImage.src = hero.image;
  elements.heroImage.alt = `${hero.name} hero portrait`;
  resetAnswerButtons();
  updateStatusBar();
}

function startGame() {
  clearAdvanceTimeout();
  state.queue = shuffleArray(state.heroes);
  state.currentIndex = 0;
  state.answers = [];
  state.correctCount = 0;
  state.status = 'playing';
  setVisibleScreen('game');
  renderCurrentHero();
}

function scheduleAdvance() {
  clearAdvanceTimeout();
  state.advanceTimeoutId = window.setTimeout(() => {
    state.advanceTimeoutId = null;
    nextHero();
  }, FEEDBACK_DELAY_MS);
}

function recordGuess(guess) {
  if (state.status !== 'playing') {
    return;
  }

  const hero = currentHero();
  if (!hero) {
    return;
  }

  const isCorrect = guess === hero.attribute;
  state.answers.push({
    hero: hero.name,
    guess,
    correctAttribute: hero.attribute,
    isCorrect,
  });

  if (isCorrect) {
    state.correctCount += 1;
  }

  disableAnswerButtons();
  for (const button of elements.answerButtons) {
    if (button.dataset.attribute === guess) {
      button.classList.add('selected');
      button.classList.add(isCorrect ? 'correct' : 'wrong');
    }
    if (button.dataset.attribute === hero.attribute) {
      button.classList.add('correct');
    }
  }

  elements.gameCardContent.classList.toggle('flash-correct', isCorrect);
  elements.gameCardContent.classList.toggle('flash-wrong', !isCorrect);

  updateStatusBar();
  scheduleAdvance();
}

function nextHero() {
  clearAdvanceTimeout();

  if (state.answers.length >= state.queue.length) {
    finishGame();
    return;
  }

  state.currentIndex += 1;
  if (state.currentIndex >= state.queue.length) {
    finishGame();
    return;
  }

  renderCurrentHero();
}

function finishGame() {
  clearAdvanceTimeout();
  state.status = 'finished';
  setVisibleScreen('end');
  updateStatusBar();

  const wrongAnswers = state.answers.filter((answer) => !answer.isCorrect);

  elements.summaryTitle.textContent = `You got ${state.correctCount}/${state.queue.length} correct`;
  elements.summaryCopy.textContent =
    wrongAnswers.length === 0
      ? 'Perfect run. You did not miss any heroes.'
      : `You missed ${wrongAnswers.length} hero${wrongAnswers.length === 1 ? '' : 'es'}. Review only the wrong guesses below.`;

  elements.resultsBody.innerHTML = '';

  if (wrongAnswers.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="5">
        <span class="result-badge correct">✓ No wrong guesses</span>
      </td>
    `;
    elements.resultsBody.appendChild(row);
    return;
  }

  wrongAnswers.forEach((answer, index) => {
    const row = document.createElement('tr');
    row.className = 'wrong-row';

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${answer.hero}</td>
      <td>${ATTRIBUTE_LABELS[answer.guess]}</td>
      <td>${ATTRIBUTE_LABELS[answer.correctAttribute]}</td>
      <td>
        <span class="result-badge wrong">✗ Wrong</span>
      </td>
    `;

    elements.resultsBody.appendChild(row);
  });
}

async function loadHeroes() {
  try {
    const response = await fetch(HEROES_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const heroes = await response.json();
    if (!Array.isArray(heroes) || heroes.length === 0) {
      throw new Error('Hero data is empty or invalid.');
    }

    state.heroes = heroes;
    state.status = 'ready';
    elements.dataStatus.textContent = `${heroes.length} heroes loaded.`;
    elements.startButton.disabled = false;
  } catch (error) {
    state.status = 'error';
    elements.dataStatus.textContent = `Could not load hero data: ${error.message}`;
  }
}

function bindEvents() {
  elements.startButton.addEventListener('click', startGame);
  elements.restartButton.addEventListener('click', startGame);

  for (const button of elements.answerButtons) {
    button.addEventListener('click', () => recordGuess(button.dataset.attribute));
  }
}

bindEvents();
loadHeroes();
