# BiciTaller — Front (posible) en HTML + CSS

No implementado: esta es la guía de cómo se construiría, reutilizando por completo la lógica de `../Back/` sin duplicarla.

## Dos formas de conectar

**(a) Servidor local como puente.** Un pequeño servidor (Node `http` o Express) importa las clases de `../Back/` y expone cada operación como un endpoint (ej. `POST /recibir-en-taller`). La página `index.html` + `styles.css` hace `fetch()` a esos endpoints y pinta el resultado en el DOM.

**(b) Compilar `Back/` directamente para el navegador, sin servidor.** Se revisaron los imports de `estructuras.ts`, `entidades.ts`, `bicitaller.ts` y `reportes.ts`: ninguno usa una API de Node — solo `main.ts` importa `fs` (para leer el archivo de comandos por consola). Eso significa que `estructuras.ts` + `entidades.ts` + `bicitaller.ts` + `reportes.ts` se pueden compilar tal cual con `tsc` (target ES2020, module esnext) o pasar por un bundler simple (esbuild/vite) y cargarse directo en un `<script type="module">` del navegador, instanciando `BiciTaller` ahí mismo. **Se recomienda la opción (b)** para este caso: es más simple, no requiere levantar ni mantener un servidor, y toda la lógica de negocio ya es JS/TS puro sin dependencias de Node.

## Boceto de `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>BiciTaller</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>BiciTaller</h1>

  <form id="form-recibir">
    <input id="codigo-recibir" placeholder="Código, ej. BIC-0412" />
    <button type="submit">Recibir en taller</button>
  </form>

  <button id="btn-iniciar">Iniciar reparación</button>
  <button id="btn-reporte">Reporte</button>

  <pre id="log"></pre>

  <script type="module" src="./app.js"></script>
</body>
</html>
```

## Boceto de `app.js` (o `app.ts` compilado)

```js
import { BiciTaller } from "./bicitaller.js"; // salida de compilar Back/ para el navegador

const taller = new BiciTaller();
const log = document.getElementById("log");

function escribir(mensaje) {
  log.textContent += mensaje + "\n";
}

document.getElementById("form-recibir").addEventListener("submit", (e) => {
  e.preventDefault();
  const codigo = document.getElementById("codigo-recibir").value;
  escribir(taller.recibirEnTaller(codigo));
});

document.getElementById("btn-iniciar").addEventListener("click", () => {
  escribir(taller.iniciarReparacion());
});

document.getElementById("btn-reporte").addEventListener("click", () => {
  escribir(taller.reporte());
});
```

El patrón se repite para cada operación: un control de formulario, un listener que llama al método correspondiente de la misma instancia de `BiciTaller`, y el string devuelto (idéntico al que hoy imprime `main.ts` por consola) se muestra en la página en vez de en la terminal.
