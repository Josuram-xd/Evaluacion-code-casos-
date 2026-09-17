# CentralAscensores — Front (posible) en HTML + CSS

No hay código en esta carpeta. Esto es una guía de cómo se construiría una página web que reutilice `../Back/` sin reescribir la lógica de negocio.

## Dos formas de conectar

**(a) Servidor local pequeño (Node/Express) como puente HTTP.**
Un `server.ts` importa `CentralAscensores` de `../Back/central.ts`, mantiene una instancia en memoria y expone endpoints (`POST /llamadas`, `POST /atender`, `POST /paso/:n`, `POST /abortar`, `GET /reporte`) que internamente llaman a los métodos de la clase y devuelven JSON. El HTML+CSS hace `fetch()` a esos endpoints.

**(b) Usar `Back/` directamente desde el navegador, sin servidor.**
Revisando los imports: `central.ts`, `entidades.ts`, `estructuras.ts` y `reportes.ts` no importan nada de Node (`fs` solo lo usa `main.ts`, que no hace falta para el front). Eso significa que se pueden compilar a JS (`tsc --module es2020` o con `esbuild`/`vite`) y cargar directo con `<script type="module">`, sin ningún servidor: el HTML llama a `new CentralAscensores()` en el propio navegador y usa un `<input type="file">` o botones para simular la entrada, en vez de leer `central.txt` desde disco.

**Recomendación:** la opción (b) es más simple para este caso — es un programa autocontenido en memoria, no necesita persistencia ni un backend real, así que montar un servidor solo para reenviar llamadas a la misma clase es una capa innecesaria. (a) tendría sentido si más adelante se quisiera compartir estado entre varios usuarios o persistir datos.

## Boceto de `index.html` + `app.js` (opción b, ilustrativo)

```html
<!-- index.html -->
<div id="colas"></div>
<button id="btnAtender">Atender siguiente</button>
<div id="pasos"></div>
<button id="btnAbortar">Abortar</button>
<pre id="salida"></pre>
<script type="module" src="./app.js"></script>
```

```js
// app.js (compilado desde central.ts/entidades.ts/estructuras.ts/reportes.ts)
import { CentralAscensores } from "./dist/central.js";
import { RechazoOperacion } from "./dist/entidades.js";

const central = new CentralAscensores();
central.cargarParque(filasIniciales);

document.getElementById("btnAtender").onclick = () => {
  try {
    const resultado = central.atenderSiguiente(minutoActual());
    log(resultado);
  } catch (e) {
    if (e instanceof RechazoOperacion) log("RECHAZADA " + e.message);
  }
};

function log(texto) {
  document.getElementById("salida").textContent += texto + "\n";
}
```

Un botón por paso (1 a 5) llamaría `central.ejecutarPaso(n)` con el mismo patrón, y `styles.css` solo se encarga de la presentación (paneles de colas, resaltar el paso actual, etc.) — la lógica de negocio sigue viviendo íntegramente en los módulos de `Back/`.
