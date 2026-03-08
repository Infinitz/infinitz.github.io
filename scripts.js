const HEROES_URL = './data/heroes.json';
const ATTRIBUTE_LABELS = {
  universal: 'Universal',
  intellect: 'Intellect',
  agility: 'Agility',
  strength: 'Strength',
};

const state = {
  heroes: [],
  queue: [],
  currentIndex: 0,
  answers: [],
  correctCount: 0,
  status: 'loading',
};

const elements = {
  dataStatus: document.getElementById('data-status'),
  startButton: document.getElementById('start-button'),
  nextButton: document.getElementById('next-button'),
  restartButton: document.getElementById('restart-button'),
  statusBar: document.getElementById('status-bar'),
  answeredCount: document.getElementById('answered-count'),
  remainingCount: document.getElementById('remaining-count'),
  correctCount: document.getElementById('correct-count'),
  screenStart: document.getElementById('screen-start'),
  screenGame: document.getElementById('screen-game'),
  screenEnd: document.getElementById('screen-end'),
  heroImage: document.getElementById('hero-image'),
  heroName: document.getElementById('hero-name'),
  feedbackPanel: document.getElementById('feedback-panel'),
  feedbackText: document.getElementById('feedback-text'),
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

function currentHero() {
  return state.queue[state.currentIndex] ?? null;
}

function renderCurrentHero() {
  const hero = currentHero();
  if (!hero) {
    finishGame();
    return;
  }

  elements.heroName.textContent = hero.name;
  elements.heroImage.src = hero.image;
  elements.heroImage.alt = `${hero.name} hero portrait`;
  elements.feedbackPanel.classList.add('hidden');
  elements.nextButton.textContent = state.currentIndex === state.queue.length - 1 ? 'Finish game' : 'Next hero';
  resetAnswerButtons();
  updateStatusBar();
}

function startGame() {
  state.queue = shuffleArray(state.heroes);
  state.currentIndex = 0;
  state.answers = [];
  state.correctCount = 0;
  state.status = 'playing';
  setVisibleScreen('game');
  renderCurrentHero();
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

  elements.feedbackText.textContent = isCorrect
    ? `${hero.name} is ${ATTRIBUTE_LABELS[hero.attribute]}. Nice.`
    : `You guessed ${ATTRIBUTE_LABELS[guess]}. ${hero.name} is ${ATTRIBUTE_LABELS[hero.attribute]}.`;

  elements.feedbackPanel.classList.remove('hidden');
  updateStatusBar();
}

function nextHero() {
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
  state.status = 'finished';
  setVisibleScreen('end');
  updateStatusBar();

  elements.summaryTitle.textContent = `You got ${state.correctCount}/${state.queue.length} correct`;
  elements.summaryCopy.textContent = `All heroes have been answered. Review every hero, your guess, and the correct attribute below.`;

  elements.resultsBody.innerHTML = '';

  state.answers.forEach((answer, index) => {
    const row = document.createElement('tr');
    row.className = answer.isCorrect ? 'correct-row' : 'wrong-row';

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${answer.hero}</td>
      <td>${ATTRIBUTE_LABELS[answer.guess]}</td>
      <td>${ATTRIBUTE_LABELS[answer.correctAttribute]}</td>
      <td>
        <span class="result-badge ${answer.isCorrect ? 'correct' : 'wrong'}">
          ${answer.isCorrect ? '✓ Correct' : '✗ Wrong'}
        </span>
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
    elements.dataStatus.textContent = `${heroes.length} heroes loaded from ./data/heroes.json.`;
    elements.startButton.disabled = false;
  } catch (error) {
    state.status = 'error';
    elements.dataStatus.textContent = `Could not load hero data: ${error.message}`;
  }
}

function bindEvents() {
  elements.startButton.addEventListener('click', startGame);
  elements.nextButton.addEventListener('click', nextHero);
  elements.restartButton.addEventListener('click', startGame);

  for (const button of elements.answerButtons) {
    button.addEventListener('click', () => recordGuess(button.dataset.attribute));
  }
}

bindEvents();
loadHeroes();
