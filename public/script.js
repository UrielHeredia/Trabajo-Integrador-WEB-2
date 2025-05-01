const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const flagContainer = document.getElementById("flag-container");
const flagImage = document.getElementById("flag-image");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const resultSection = document.getElementById("result-section");
const correctCountSpan = document.getElementById("correct-count");
const incorrectCountSpan = document.getElementById("incorrect-count");
const totalTimeSpan = document.getElementById("total-time");
const avgTimeSpan = document.getElementById("avg-time");
const restartBtn = document.getElementById("restart-btn");

let countries = [];
let questionCount = 0;
let correctCount = 0;
let incorrectCount = 0;
let startTime = 0;
let questionStart = 0;
let totalTime = 0;

const QUESTION_LIMIT = 10;

// Pa cargar los paises
fetch("https://restcountries.com/v3.1/all")
  .then(res => res.json())
  .then(data => {
    countries = data.filter(c => c.capital && c.borders && c.name.common && c.flags);
    startGame();
  })
  .catch(err => {
    questionText.textContent = "Error al cargar los datos.";
    console.error(err);
  });

function startGame() {
  questionCount = 0;
  correctCount = 0;
  incorrectCount = 0;
  totalTime = 0;
  startTime = Date.now();
  resultSection.classList.add("hidden");
  showNextQuestion();
}

function showNextQuestion() {
  feedback.classList.add("hidden");
  nextBtn.classList.add("hidden");
  optionsContainer.innerHTML = "";
  flagContainer.classList.add("hidden");

  if (questionCount >= QUESTION_LIMIT) {
    endGame();
    return;
  }

  questionStart = Date.now();
  questionCount++;

  const type = getRandomQuestionType();
  const country = getRandomCountry();
  let correctAnswer, question;

  let options = [];

  //Preguntas
  switch (type) {
    case "capital":
      question = `¿Cuál es el país de la siguiente ciudad capital: ${country.capital[0]}?`;
      correctAnswer = country.name.common;
      options = generateOptions(correctAnswer, "name.common");
      break;

    case "flag":
      question = `Cual es el pais al que pertenece esta bandera:`;
      flagContainer.classList.remove("hidden");
      flagImage.src = country.flags.png;
      correctAnswer = country.name.common;
      options = generateOptions(correctAnswer, "name.common");
      break;

    case "borders":
      question = `¿Cuántos países limítrofes tiene ${country.name.common}?`;
      correctAnswer = country.borders.length.toString();
      options = generateOptions(correctAnswer, "borders.length", true);
      break;
  }

  questionText.textContent = question;

  options.forEach(opt => {
    const button = document.createElement("button");
    button.classList.add("option");
    button.textContent = opt;
    button.onclick = () => checkAnswer(opt, correctAnswer);
    optionsContainer.appendChild(button);
  });
}

function checkAnswer(selected, correct) {
  const timeTaken = (Date.now() - questionStart) / 1000;
  totalTime += timeTaken;

  feedback.classList.remove("hidden");

  if (selected === correct) {
    correctCount++;
    feedback.textContent = "¡Correcto!";
    feedback.style.color = "green";
  } else {
    incorrectCount++;
    feedback.textContent = `Incorrecto. La respuesta correcta era: ${correct}`;
    feedback.style.color = "red";
  }

  nextBtn.classList.remove("hidden");
}
// Segundos
function endGame() {
  const duration = (Date.now() - startTime) / 1000;
  const average = totalTime / QUESTION_LIMIT;

  correctCountSpan.textContent = correctCount;
  incorrectCountSpan.textContent = incorrectCount;
  totalTimeSpan.textContent = `${duration.toFixed(2)} segundos`;
  avgTimeSpan.textContent = `${average.toFixed(2)} segundos`;

  resultSection.classList.remove("hidden");
  questionText.textContent = "Juego finalizado.";
  optionsContainer.innerHTML = "";
  flagContainer.classList.add("hidden");
  feedback.classList.add("hidden");
  nextBtn.classList.add("hidden");
}

function generateOptions(correct, keyPath, isNumeric = false) {
  const keys = keyPath.split(".");
  const getValue = (obj) =>
    keys.reduce((acc, k) => acc && acc[k], obj);

  let options = new Set([correct]);

  while (options.size < 4) {
    const rand = getRandomCountry();
    let value = getValue(rand);
    if (value === undefined) continue;
    if (isNumeric) value = value.toString();
    if (value !== correct) options.add(value);
  }

  const shuffled = Array.from(options).sort(() => 0.5 - Math.random());
  return shuffled;
}

function getRandomCountry() {
  return countries[Math.floor(Math.random() * countries.length)];
}

function getRandomQuestionType() {
  const types = ["capital", "flag", "borders"];
  return types[Math.floor(Math.random() * types.length)];
}

nextBtn.addEventListener("click", showNextQuestion);
restartBtn.addEventListener("click", startGame);
