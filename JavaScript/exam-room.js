import { questions } from "../data/questions.js";

const instruction = document.querySelector('.toggle-instruction');
const instructionContainer = document.querySelector('.instruction');

instruction.addEventListener('click', () => {
  if (getComputedStyle(instructionContainer).display === "none") {
    instructionContainer.style.display = "block";
  } else {
    instructionContainer.style.display = "none";
  }
});

let questionNum = 0;

function renderQuestions(number) {
  const question = questions[number];

  const innerHtml = `
  <div class="timer-container">
        <p class="timer"></p>
      </div>
  <div class="question">
        <p class="number">${questionNum + 1},</p>
        <p>${question.question}</p>
      </div>
      <div class="answer">
        <div class="choice-holder" data-choice-aplha="A">
          <input type="radio" id="choice-A" name="choice">
          <label for="choice">${question.choice.A}</label>
        </div>

        <div class="choice-holder" data-choice-aplha="B">
          <input type="radio" id="choice-B" name="choice">
          <label for="choice-B">${question.choice.B}</label>
        </div>

        <div class="choice-holder" data-choice-aplha="C">
          <input type="radio" id="choice-C" name="choice">
          <label for="choice-C">${question.choice.C}</label>
        </div>

        <div class="choice-holder" data-choice-aplha="D">
          <input type="radio" id="choice-D" name="choice">
          <label for="choice-D">${question.choice.D}</label>
        </div>
      </div>

      <div class="navigate">
        ${questionNum === 0
          ? `<button class="next-button">Next</button>`
            : questionNum + 1 === questions.length
             ? `<button class="previous-button js-previous-button">Previous</button>
             <button class="previous-button js-submit">Submit</button>`
             : `<button class="previous-button js-previous-button">Previous</button>
             <button class="next-button">Next</button>` }
      </div>`

  const questionHolder = document.querySelector('.question-holder')

  questionHolder.innerHTML = innerHtml;

  if(question.givenAnswer) {
    const selectedRadio = document.querySelector(`#choice-${question.givenAnswer}`);
    selectedRadio.checked = true;
  }

  if (!(questionNum + 1 === questions.length)) {
    const nextBtn = document.querySelector('.next-button');nextBtn.addEventListener('click', () => {
      questionNum++;
      renderQuestions(questionNum);
    });
  }

  if (questionNum != 0) {
    const previousBtn = document.querySelector('.js-previous-button')
    previousBtn.addEventListener('click', () => {
      questionNum--;
      renderQuestions(questionNum);
    });
  }

  if (questionNum + 1 === questions.length) {
    const submitBtn = document.querySelector('.js-submit');
    submitBtn.addEventListener('click', () => {
      submitAnswer();
    });
  }

  const choices = document.querySelectorAll('.choice-holder');
  choices.forEach((choice) => {
    choice.addEventListener('click', () => {
      question.givenAnswer = choice.dataset.choiceAplha;

      const selectedRadio = document.querySelector(`#choice-${choice.dataset.choiceAplha}`);
      selectedRadio.checked = true;
    });
  });
}

const startBtn = document.querySelector('.start-exam');

startBtn.addEventListener('click', () => {
  removeWelcome();
  displayQuestion();
  renderQuestions(questionNum);
  timer();
});

function submitAnswer() {
  let innerHTML = `
      <div class="inner-result">
        <h1>Result</h1>
        <div class="score-grade">
          <p class="score">Score: ${calculateResult()}/${questions.length}</p>
          <p class="grade">Grade: ${calculateGrade()}</p>
        </div>
        <p class="remark">
          ${calculateRmark()}!
        </p>
        <a href=""><button href>Try again</button></a>
      </div>`;

      const resultcontainer = document.querySelector('.result');
      resultcontainer.innerHTML = innerHTML;

      displayResult();
      removeQuestion();
}

function calculateRmark() {
  let score = calculateResult();

  if (score >= 0.50 *(questions.length)) {
    return 'Passed';
  } else {
    return 'Faild';
  }
}

function calculateGrade() {
  let score = calculateResult();

  if(score >= 0.85 *(questions.length)) {
    return 'A';
  } else if (score >= 0.65 *(questions.length)) {
    return 'B';
  } else if (score >= 0.50 *(questions.length)) {
    return 'C';
  } else {
    return 'F';
  }
}

function calculateResult() {
  let score = 0;
  questions.forEach((question) => {
    if(question.givenAnswer === question.correctAnswer) {
      score++;
    }
  });
  return score;
}


function timer() {
  let timeLeft = 3600; // total time in seconds (2 minutes)

  const countdown = setInterval(() => {
    const timerElement = document.querySelector(".timer");
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    timerElement.textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timeLeft--;

    console.log(timeLeft);
    
    if (timeLeft < 0) {
      clearInterval(countdown);
      timerElement.textContent = "Time's up!";
      setTimeout(() => {
        /* submitAnswer(); */
      }, 2000);
    }
  }, 1000);

}

function removeWelcome() {
  const welcome = document.querySelector('.welcome-examroom');
  welcome.style.display = "none";
}

function displayQuestion() {
  const questionHolder = document.querySelector('.question-holder');
  questionHolder.style.display = "block";
}

function removeQuestion() {
  const questionHolder = document.querySelector('.question-holder');
  questionHolder.style.display = "none";
}

function displayResult() {
  const resultcontainer = document.querySelector('.result');
  resultcontainer.style.display = "block";
}