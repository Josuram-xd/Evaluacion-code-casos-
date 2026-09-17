# Front (posible, TypeScript) — CuraduriaTramites

No hay código aquí todavía. Esto es una guía de cómo se conectaría una página web (HTML + CSS) con la lógica ya construida en `../Back/`, sin reescribir ni una sola regla de negocio.

## Dos formas de conectar, y cuál conviene aquí

**(a) Servidor local que envuelve `Back/` en una API HTTP.** Un pequeño servidor (Node `http` o Express) importa `CuraduriaTramites` y expone un endpoint por operación (`POST /radicar`, `POST /avanzar`, etc.); el HTML hace `fetch()` a esos endpoints. Necesario cuando la lógica depende de APIs de Node (archivos, base de datos, `process`, etc.) que no existen en el navegador.

**(b) Usar el código de `Back/` directamente desde el navegador**, sin servidor intermedio. Revisando los imports: `estructuras.ts`, `entidades.ts`, `curaduria.ts` y `reportes.ts` **no importan nada de Node** (no hay `fs`, `path`, `process` en ninguno de los cuatro) — el único archivo que usa Node es `main.ts` (por `fs.readFileSync` y `process.argv`, porque lee un archivo de comandos). Eso significa que las clases de dominio son código TypeScript puro y **sí pueden compilarse para el navegador tal cual**, sin bundler pesado ni servidor.

**Recomendación: (b)**, es más simple y no requiere mantener un backend aparte para este caso — el HTML reemplaza a `main.ts` como "punto de entrada", pero usa las mismas clases.

## Cómo armarlo

1. Compilar `estructuras.ts`, `entidades.ts`, `curaduria.ts` y `reportes.ts` a JavaScript de módulos ES (`tsc --module es2020` o con `esbuild`/`vite`), apuntando a una carpeta servible, por ejemplo `dist/`.
2. Un `app.ts` nuevo (compilado junto con los anteriores) reemplaza a `main.ts`: en vez de leer un archivo y hacer `console.log`, escucha eventos de botones/formularios del HTML y escribe los resultados en el DOM.
3. `index.html` + `styles.css` cargan `dist/app.js` como `<script type="module">`.

## Boceto de `index.html` (ilustrativo)

```html
<form id="form-radicar">
  <input name="solicitante" placeholder="Solicitante" required />
  <input name="dia" type="number" placeholder="Día" required />
  <button type="submit">Radicar</button>
</form>

<table id="tabla-folios"><thead><tr><th>#</th><th>Descripción</th><th>Estado</th></tr></thead><tbody></tbody></table>

<button id="btn-avanzar">Avanzar</button>
<button id="btn-devolver">Devolver</button>
<pre id="resultado"></pre>
```

## Boceto de `app.ts` (ilustrativo, no funcional)

```typescript
import { CuraduriaTramites } from "./curaduria";

const sistema = new CuraduriaTramites();

document.getElementById("form-radicar")!.addEventListener("submit", (e) => {
  e.preventDefault();
  const datos = new FormData(e.target as HTMLFormElement);
  const expediente = sistema.radicar(String(datos.get("solicitante")), Number(datos.get("dia")));
  document.getElementById("resultado")!.textContent =
    `${expediente.radicado} creado en ${expediente.dependencia}`;
});

document.getElementById("btn-avanzar")!.addEventListener("click", () => {
  try {
    const { destino, encolado } = sistema.avanzar(radicadoSeleccionado);
    mostrarResultado(`avanza a ${destino}${encolado ? "" : " (represado)"}`);
  } catch (error) {
    mostrarResultado(`RECHAZADO: ${(error as Error).message}`);
  }
});
```

La tabla de folios se llena iterando `expediente.folios` (la `Lista` implementa `Symbol.iterator` igual que en `main.ts`), y la ruta se muestra con `expediente.rutaActual()` exactamente igual que en el runner de consola — el front solo cambia el destino de la salida (DOM en vez de `console.log`).
