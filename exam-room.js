import { questions } from "./data/questions.js";

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
  <div class="question">
        <p class="number">${questionNum + 1},</p>
        <p>${question.question}</p>
      </div>
      <div class="answer">
        <div class="choice-holder">
          <input type="radio" data-choice-aplha="A" id="choice-A" name="choice">
          <label for="choice">${question.choice.A}</label>
        </div>

        <div class="choice-holder">
          <input type="radio" data-choice-aplha="B" id="choice-B" name="choice">
          <label for="choice-B">${question.choice.B}</label>
        </div>

        <div class="choice-holder">
          <input type="radio" data-choice-aplha="C" id="choice-C" name="choice">
          <label for="choice-C">${question.choice.C}</label>
        </div>

        <div class="choice-holder">
          <input type="radio" data-choice-aplha="D" id="choice-D" name="choice">
          <label for="choice-D">${question.choice.D}</label>
        </div>
      </div>

      <div class="navigate">
        ${questionNum === 0
          ? `<button class="next-button">Next</button>`
            : questionNum + 1 === questions.length
             ? `<button class="previous-button js-previous-button">Previous</button>
             <button class="previous-button submit">Submit</button>`
             : `<button class="previous-button js-previous-button">Previous</button>
             <button class="next-button">Next</button>` }
      </div>`

  const questionHolder = document.querySelector('.question-holder')

  questionHolder.innerHTML = innerHtml;

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
}

const startBtn = document.querySelector('.start-exam');

startBtn.addEventListener('click', () => {
  removeWelcome();
  displayQuestion();
  renderQuestions(questionNum);
});

function removeWelcome() {
  const welcome = document.querySelector('.welcome-examroom');
  welcome.style.display = "none";
}

function displayQuestion() {
  const questionHolder = document.querySelector('.question-holder');
  questionHolder.style.display = "block";
}