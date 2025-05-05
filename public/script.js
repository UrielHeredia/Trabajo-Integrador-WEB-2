
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
const tablaRanking = document.getElementById("ranking-body");

  const pantallaInicial = document.getElementById("pantalla-inicial");
  const pantallaJuego = document.getElementById("pantalla-juego");
  const btnComenzar = document.getElementById("btn-comenzar");
  const inputNombre = document.getElementById("nombre-jugador");

// Variables para el juego
let paises = []; // Lista de países
let nombreJugador = "";
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
    paises = data.filter(p => p.capital && p.capital.length > 0 && p.borders && p.name?.common && p.flags?.png);
    if (paises.length === 0) throw new Error("No se encontraron países válidos.");
    iniciarJuego();
    mostrarRanking();
  })
  .catch(err => {
    textoPregunta.textContent = "Error al cargar datos.";
    console.error("Error al cargar datos de la API:", err);
  });

function iniciarJuego() {
  cantidadPreguntas = 0;
  cantidadAciertos = 0;
  cantidadErrores = 0;
  tiempoTotal = 0;
  tiempoInicio = Date.now();
  seccionResultados.classList.add("hidden");
  mostrarSiguientePregunta();
}

function mostrarSiguientePregunta() {
  retroalimentacion.classList.add("hidden");
  botonSiguiente.classList.add("hidden");
  contenedorOpciones.innerHTML = "";
  contenedorBandera.classList.add("hidden");

  if (cantidadPreguntas >= LIMITE_PREGUNTAS) {
    finalizarJuego();
    return;
  }

  tiempoInicioPregunta = Date.now();
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

btnComenzar.addEventListener("click", () => {
  nombreJugador = inputNombre.value.trim();
  if (!nombreJugador) {
    alert("Por favor, ingresa tu nombre.");
    return;
  }

  pantallaInicial.classList.add("hidden");
  pantallaJuego.classList.remove("hidden");
});





function finalizarJuego() {
  const duracion = (Date.now() - tiempoInicio) / 1000;
  const promedio = tiempoTotal / LIMITE_PREGUNTAS;

  cantidadCorrectas.textContent = cantidadAciertos;
  cantidadIncorrectas.textContent = cantidadErrores;
  tiempoTotalSpan.textContent = `${duracion.toFixed(2)} segundos`;
  tiempoPromedioSpan.textContent = `${promedio.toFixed(2)} segundos`;

  guardarEnRanking(cantidadAciertos * 3 + cantidadErrores * 0, cantidadAciertos, duracion);
  mostrarRanking();

  seccionResultados.classList.remove("hidden");
  textoPregunta.textContent = "Juego finalizado.";
  contenedorOpciones.innerHTML = "";
  contenedorBandera.classList.add("hidden");
  retroalimentacion.classList.add("hidden");
  botonSiguiente.classList.add("hidden");
}

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

function obtenerPaisAleatorio() {
  return paises[Math.floor(Math.random() * paises.length)];
}

function obtenerTipoPreguntaAleatoria() {
  const tipos = ["capital", "flag", "borders"];
  return tipos[Math.floor(Math.random() * tipos.length)];
}

function guardarEnRanking(puntaje, aciertos, tiempo) {
  const ranking = JSON.parse(localStorage.getItem("ranking") || "[]");
  ranking.push({ jugador: nombreJugador, puntaje, aciertos, tiempo }); // AÑADIR 'jugador'
  ranking.sort((a, b) => b.puntaje - a.puntaje || b.aciertos - a.aciertos || a.tiempo - b.tiempo);
  localStorage.setItem("ranking", JSON.stringify(ranking.slice(0, 20)));
}

function mostrarRanking() {
  const ranking = JSON.parse(localStorage.getItem("ranking") || "[]");
  tablaRanking.innerHTML = ""; // Limpiar tabla antes de agregar filas
  ranking.forEach((entry, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
     
      <td>${entry.jugador}</td> <!-- Mostrar el nombre del jugador -->
      <td>${entry.puntaje}</td>
      <td>${entry.aciertos}</td>
      <td>${entry.tiempo.toFixed(2)}s</td>
    `;
    tablaRanking.appendChild(fila);
  });
}

botonSiguiente.addEventListener("click", mostrarSiguientePregunta);
botonReiniciar.addEventListener("click", iniciarJuego);

const botonResetearRanking = document.getElementById("reset-ranking-btn");

botonResetearRanking.addEventListener("click", () => {
  if (confirm("¿Estás seguro de que deseas borrar todos los rankings?")) {
    localStorage.removeItem("ranking");
    mostrarRanking(); // Actualiza la tabla
  }
});

mostrarRanking();
