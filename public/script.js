// Selección de elementos del DOM
const textoPregunta = document.getElementById("question-text");
const contenedorOpciones = document.getElementById("options");
const contenedorBandera = document.getElementById("flag-container");
const imagenBandera = document.getElementById("flag-image");
const retroalimentacion = document.getElementById("feedback");
const botonSiguiente = document.getElementById("next-btn");
const seccionResultados = document.getElementById("result-section");
const cantidadCorrectas = document.getElementById("correct-count");
const cantidadIncorrectas = document.getElementById("incorrect-count");
const tiempoTotalSpan = document.getElementById("total-time");
const tiempoPromedioSpan = document.getElementById("avg-time");
const botonReiniciar = document.getElementById("restart-btn");

// Variables para el juego
let paises = []; // Lista de países
let cantidadPreguntas = 0;
let cantidadAciertos = 0;
let cantidadErrores = 0;
let tiempoInicio = 0;
let tiempoInicioPregunta = 0;
let tiempoTotal = 0;

const LIMITE_PREGUNTAS = 10; // Total de preguntas por partida

// Cargar datos de la API de países
fetch("https://restcountries.com/v3.1/all")
  .then(res => res.json())
  .then(data => {
    paises = data.filter(p => p.capital && p.borders && p.name.common && p.flags);
    iniciarJuego(); // Inicia el juego cuando se tienen los datos
  })
  .catch(err => {
    textoPregunta.textContent = "Error al cargar datos.";
    console.error(err);
  });

// Iniciar variables y mostrar la primera pregunta
function iniciarJuego() {
  cantidadPreguntas = 0;
  cantidadAciertos = 0;
  cantidadErrores = 0;
  tiempoTotal = 0;
  tiempoInicio = Date.now();
  seccionResultados.classList.add("hidden");
  mostrarSiguientePregunta();
}

// Mostrar la siguiente pregunta
function mostrarSiguientePregunta() {
  retroalimentacion.classList.add("hidden");
  botonSiguiente.classList.add("hidden");
  contenedorOpciones.innerHTML = "";
  contenedorBandera.classList.add("hidden");

  if (cantidadPreguntas >= LIMITE_PREGUNTAS) {
    finalizarJuego(); // Finaliza el juego si ya se contestaron todas
    return;
  }

  tiempoInicioPregunta = Date.now(); // Tiempo de inicio por pregunta
  cantidadPreguntas++;

  const tipo = obtenerTipoPreguntaAleatoria();
  const pais = obtenerPaisAleatorio();
  let respuestaCorrecta, pregunta;
  let opciones = [];

  switch (tipo) {
    case "capital":
      pregunta = `¿Cuál es el país de la siguiente ciudad capital: ${pais.capital[0]}?`;
      respuestaCorrecta = pais.name.common;
      opciones = generarOpciones(respuestaCorrecta, "name.common");
      break;

    case "flag":
      pregunta = `El país representado por esta bandera es:`;
      contenedorBandera.classList.remove("hidden");
      imagenBandera.src = pais.flags.png;
      respuestaCorrecta = pais.name.common;
      opciones = generarOpciones(respuestaCorrecta, "name.common");
      break;

    case "borders":
      pregunta = `¿Cuántos países limítrofes tiene ${pais.name.common}?`;
      respuestaCorrecta = pais.borders.length.toString();
      opciones = generarOpciones(respuestaCorrecta, "borders.length", true);
      break;
  }

  textoPregunta.textContent = pregunta;
  opciones.forEach(opcion => {
    const boton = document.createElement("button");
    boton.classList.add("option");
    boton.textContent = opcion;
    boton.onclick = () => verificarRespuesta(opcion, respuestaCorrecta);
    contenedorOpciones.appendChild(boton);
  });
}

// Verificar la respuesta del usuario
function verificarRespuesta(seleccionado, correcto) {
  const tiempoPregunta = (Date.now() - tiempoInicioPregunta) / 1000;
  tiempoTotal += tiempoPregunta;

  retroalimentacion.classList.remove("hidden");

  if (seleccionado === correcto) {
    cantidadAciertos++;
    retroalimentacion.textContent = "¡Correcto!";
    retroalimentacion.style.color = "green";
  } else {
    cantidadErrores++;
    retroalimentacion.textContent = `Incorrecto. La respuesta correcta era: ${correcto}`;
    retroalimentacion.style.color = "red";
  }

  botonSiguiente.classList.remove("hidden");
}

// Mostrar resultados finales
function finalizarJuego() {
  const duracion = (Date.now() - tiempoInicio) / 1000;
  const promedio = tiempoTotal / LIMITE_PREGUNTAS;

  cantidadCorrectas.textContent = cantidadAciertos;
  cantidadIncorrectas.textContent = cantidadErrores;
  tiempoTotalSpan.textContent = `${duracion.toFixed(2)} segundos`;
  tiempoPromedioSpan.textContent = `${promedio.toFixed(2)} segundos`;

  seccionResultados.classList.remove("hidden");
  textoPregunta.textContent = "Juego finalizado.";
  contenedorOpciones.innerHTML = "";
  contenedorBandera.classList.add("hidden");
  retroalimentacion.classList.add("hidden");
  botonSiguiente.classList.add("hidden");
}

// Generar 4 opciones aleatorias incluyendo la correcta
function generarOpciones(correcta, claveRuta, esNumerico = false) {
  const claves = claveRuta.split(".");
  const obtenerValor = (obj) => claves.reduce((acc, k) => acc && acc[k], obj);

  let opciones = new Set([correcta]);

  while (opciones.size < 4) {
    const aleatorio = obtenerPaisAleatorio();
    let valor = obtenerValor(aleatorio);
    if (valor === undefined) continue;
    if (esNumerico) valor = valor.toString();
    if (valor !== correcta) opciones.add(valor);
  }

  return Array.from(opciones).sort(() => 0.5 - Math.random());
}

// Obtener país aleatorio
function obtenerPaisAleatorio() {
  return paises[Math.floor(Math.random() * paises.length)];
}

// Elegir tipo de pregunta al azar
function obtenerTipoPreguntaAleatoria() {
  const tipos = ["capital", "flag", "borders"];
  return tipos[Math.floor(Math.random() * tipos.length)];
}

// Eventos
botonSiguiente.addEventListener("click", mostrarSiguientePregunta);
botonReiniciar.addEventListener("click", iniciarJuego);