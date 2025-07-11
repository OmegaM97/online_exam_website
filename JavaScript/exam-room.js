import { questions } from "../data/questions.js";

    // DOM Elements
    const welcomeScreen = document.querySelector('.welcome-screen');
    const examInterface = document.querySelector('.exam-interface');
    const resultsScreen = document.querySelector('.results-screen');
    const questionContainer = document.querySelector('.question-container');
    const instructionToggle = document.querySelector('.toggle-instruction');
    const instructionPanel = document.querySelector('.instruction-panel');
    const closeInstruction = document.querySelector('.close-instruction');
    const startExamBtn = document.querySelector('.start-exam');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const examSubmit = document.querySelector('.exam-submit');
    const submitBtn = document.querySelector('.submit-exam');
    const questionIndicators = document.querySelector('.question-indicators');
    const currentQ = document.querySelector('.current-q');
    const totalQ = document.querySelector('.total-q');
    const progressFill = document.querySelector('.progress-fill');
    const timerText = document.querySelector('.timer-text');
    const timerCircleFill = document.querySelector('.timer-circle-fill');
    const attemptError = document.querySelector('.attempt-error');
    const viewDetailsBtn = document.querySelector('.view-details');
    const detailedResults = document.querySelector('.detailed-results');
    const closeDetailsBtn = document.querySelectorAll('.close-details');
    const newExamBtn = document.querySelector('.new-exam');
    const scorePercent = document.querySelector('.score-percent');
    const scoreGrade = document.querySelector('.score-grade');
    const correctCount = document.querySelector('.correct-count');
    const wrongCount = document.querySelector('.wrong-count');
    const unattemptedCount = document.querySelector('.unattempted-count');
    const feedbackText = document.querySelector('.feedback-text');

    // Exam State
    let currentQuestion = 0;
    let timerInterval;
    let timeLeft = 3600; // 60 minutes in seconds

    // Initialize exam
    totalQ.textContent = questions.length;
    createQuestionIndicators();

    // Event Listeners
    instructionToggle.addEventListener('click', toggleInstructions);
    closeInstruction.addEventListener('click', toggleInstructions);
    startExamBtn.addEventListener('click', startExam);
    prevBtn.addEventListener('click', goToPreviousQuestion);
    nextBtn.addEventListener('click', goToNextQuestion);
    submitBtn.addEventListener('click', checkAttempt);
    closeDetailsBtn.forEach(btn => btn.addEventListener('click', () => toggleDetails(false)));
    newExamBtn.addEventListener('click', resetExam);

    viewDetailsBtn.addEventListener('click', () => {
      if(!detailedResults.querySelector('.result-item')) {
        generateDetailedResults();
        viewDetailsBtn.innerHTML = '<i class="fas fa-list-ol"></i> Remove Detailed Results';
      }
      else {
        detailedResults.innerHTML = '';
        viewDetailsBtn.innerHTML = '<i class="fas fa-list-ol"></i> View Detailed Results';
      }
    });
    // Functions
    function toggleInstructions() {
      instructionPanel.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    }

    function startExam() {
      welcomeScreen.classList.remove('active-screen');
      examInterface.classList.add('active-screen');
      renderQuestion();
      startTimer();
    }

    function renderQuestion() {
      const question = questions[currentQuestion];
      
      // Update progress
      currentQ.textContent = currentQuestion + 1;
      progressFill.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
      
      // Update active indicator
      document.querySelectorAll('.q-indicator').forEach((indicator, index) => {
        indicator.classList.remove('current');
        if (questions[index].givenAnswer) {
          indicator.classList.add('answered');
        } else {
          indicator.classList.remove('answered');
        }
      });
      document.querySelectorAll('.q-indicator')[currentQuestion].classList.add('current');
      
      // Render question HTML
      questionContainer.innerHTML = `
        <div class="question-card">
          <div class="question-header">
            <h2 class="question-text">${question.question}</h2>
          </div>
          
          <div class="answer-options">
            ${Object.entries(question.choice).map(([key, value]) => `
              <div class="option">
                <input 
                  type="radio" 
                  name="answer" 
                  id="option-${currentQuestion}-${key}" 
                  value="${key}"
                  ${question.givenAnswer === key ? 'checked' : ''}
                >
                <label for="option-${currentQuestion}-${key}" class="option-label">
                  <span class="option-letter">${key}</span>
                  <span class="option-text">${value}</span>
                </label>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      // Add event listeners to options
      document.querySelectorAll('.option input').forEach(input => {
        input.addEventListener('change', (e) => {
          questions[currentQuestion].givenAnswer = e.target.value;
          document.querySelectorAll('.q-indicator')[currentQuestion].classList.add('answered');
        });
      });
      
      // Update navigation buttons
      prevBtn.disabled = currentQuestion === 0;
      nextBtn.style.display = currentQuestion === questions.length - 1 ? 'none' : 'block';
      examSubmit.style.display = currentQuestion === questions.length - 1 ? 'block' : 'none';
    }

    function createQuestionIndicators() {
      questionIndicators.innerHTML = '';
      questions.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'q-indicator';
        indicator.addEventListener('click', () => {
          if (index !== currentQuestion) {
            currentQuestion = index;
            renderQuestion();
          }
        });
        questionIndicators.appendChild(indicator);
      });
    }

    function goToPreviousQuestion() {
      if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
        attemptError.innerHTML = '';
        submitBtn.addEventListener('click', checkAttempt);
        submitBtn.removeEventListener('click', submitExam);
      }
    }

    function goToNextQuestion() {
      if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
        attemptError.innerHTML = '';
        submitBtn.addEventListener('click', checkAttempt);
        submitBtn.removeEventListener('click', submitExam);
        submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> Submit Exam`;
      }
    }

    function checkAttempt() {
      const unattempted = questions.filter(q => !q.givenAnswer).length;
      
      if (unattempted > 0) {
        const unattemptedList = questions
          .map((q, i) => !q.givenAnswer ? i + 1 : null)
          .filter(Boolean)
          .join(', ');
        
        attemptError.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
              <p>Please attempt all questions!</p>
              <p>Questions <strong>${unattemptedList}</strong> are unattempted.</p>
              <p>Click submit again to proceed anyway.</p>
            </div>
          </div>
        `;
        
        // Allow submit on second click
        submitBtn.removeEventListener('click', checkAttempt);
        submitBtn.addEventListener('click', submitExam);
        submitBtn.textContent = 'Submit Anyway';
        return;
      }
      
      submitExam();
    }

    function submitExam() {
      clearInterval(timerInterval);
      examInterface.classList.remove('active-screen');
      resultsScreen.classList.add('active-screen');
      
      // Calculate results
      const correct = questions.filter(q => q.givenAnswer === q.correctAnswer).length;
      const wrong = questions.filter(q => q.givenAnswer && q.givenAnswer !== q.correctAnswer).length;
      const unattempted = questions.length - correct - wrong;
      const percentage = Math.round((correct / questions.length) * 100);
      
      // Update results display
      scorePercent.textContent = `${percentage}%`;
      correctCount.textContent = correct;
      wrongCount.textContent = wrong;
      unattemptedCount.textContent = unattempted;
      
      // Set score circle animation
      const scoreCircleFill = document.querySelector('.score-circle-fill');
      scoreCircleFill.style.strokeDasharray = `${percentage}, 100`;
      
      // Set grade and feedback
      scoreGrade.textContent = calculateGrade(percentage);
      feedbackText.textContent = getFeedback(percentage);
      
    }

    function calculateGrade(percentage) {
      if (percentage >= 85) return 'A';
      if (percentage >= 65) return 'B';
      if (percentage >= 50) return 'C';
      return 'F';
    }

    function getFeedback(percentage) {
      if (percentage >= 85) return 'Excellent work! You have mastered this material.';
      if (percentage >= 65) return 'Good job! You have a solid understanding of the material.';
      if (percentage >= 50) return 'You passed, but consider reviewing the material again.';
      return 'Keep practicing! Review the material and try again.';
    }

    function generateDetailedResults() {
      let html = '';
      
      questions.forEach((question, index) => {
        const isCorrect = question.givenAnswer === question.correctAnswer;
        const isAttempted = question.givenAnswer != null;
        
        html += `
          <div class="result-item ${isCorrect ? 'correct' : isAttempted ? 'incorrect' : 'unattempted'}">
            <div class="result-question">
              <span class="result-qnum">${index + 1}.</span>
              <span class="result-qtext">${question.question}</span>
            </div>
            
            ${isAttempted ? `
              <div class="result-answer">
                <span class="result-label">Your Answer:</span>
                <span class="result-response ${isCorrect ? 'correct-answer' : 'wrong-answer'}">
                  ${question.choice[question.givenAnswer]}
                  ${!isCorrect ? ' (Incorrect)' : '(Correct)'}
                </span>
              </div>
            ` : ''}
            
            ${!isCorrect || !isAttempted ? `
              <div class="result-answer">
                <span class="result-label">Correct Answer:</span>
                <span class="result-response correct-answer">
                  ${question.choice[question.correctAnswer]}
                </span>
              </div>
            ` : ''}
          </div>
        `;
      });
      
      document.querySelector('.detailed-results').insertAdjacentHTML('afterbegin', html);
    }

    function toggleDetails(show) {
      if (show) {
        detailedResults.classList.add('active');
        document.body.classList.add('no-scroll');
      } else {
        detailedResults.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    }

    function resetExam() {
      // Reset exam state
      currentQuestion = 0;
      questions.forEach(q => delete q.givenAnswer);
      
      // Reset timer
      clearInterval(timerInterval);
      timeLeft = 3600;
      timerText.textContent = '60:00';
      timerCircleFill.style.strokeDasharray = '100, 100';
      
      // Reset UI
      resultsScreen.classList.remove('active-screen');
      welcomeScreen.classList.add('active-screen');
      document.querySelectorAll('.q-indicator').forEach(ind => {
        ind.classList.remove('answered', 'current');
      });
      attemptError.innerHTML = '';
      submitBtn.textContent = 'Submit Exam';
      submitBtn.addEventListener('click', checkAttempt);
      submitBtn.removeEventListener('click', submitExam);
    }

    function startTimer() {
      clearInterval(timerInterval);
      
      timerInterval = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          submitExam();
          return;
        }
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update timer circle
        const percentage = (timeLeft / 3600) * 100;
        timerCircleFill.style.strokeDasharray = `${percentage}, 100`;
        
        // Change color when time is running low
        if (timeLeft <= 300) { // 5 minutes
          timerCircleFill.style.stroke = 'var(--danger-color)';
        } else if (timeLeft <= 900) { // 15 minutes
          timerCircleFill.style.stroke = 'var(--warning-color)';
        }
      }, 1000);
    }