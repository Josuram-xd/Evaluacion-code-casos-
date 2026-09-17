# Front en HTML+CSS — CuraduriaTramites

Página web mínima ([`index.html`](index.html) + [`styles.css`](styles.css) + [`app.js`](app.js)) servida por un puente HTTP propio ([`server.ts`](server.ts)), sin Express ni ningún framework — solo el módulo `http` de Node. No reescribe ninguna regla de negocio: `server.ts` importa `CuraduriaTramites` de [`../Back/curaduria.ts`](<../Back/curaduria.ts>) y `inicializarDesdeArchivo`/`procesarLinea` de [`../Back/main.ts`](<../Back/main.ts>), el mismo módulo que usa el runner de consola.

## Por qué un servidor puente y no compilar `Back/` directo para el navegador

En los otros dos casos (BiciTaller, CentralAscensores) el `Back/` no toca nada de Node y se puede compilar directo para el navegador. Aquí no: `main.ts` usa `fs.readFileSync` para leer `tramites.txt`, y ese módulo (`fs`) no existe en el navegador. La forma simple de resolver esto sin duplicar la lógica de `curaduria.ts` es un servidor mínimo que se queda del lado de Node (donde `fs` sí funciona) y expone esa lógica por HTTP; la página en el navegador solo manda texto y pinta lo que recibe.

## Cómo se conecta con el Back

- Al arrancar, `server.ts` llama a `inicializarDesdeArchivo("../Back/tramites.txt")`, que lee solo el encabezado (`CAPACIDAD_BANDEJA`, `PLAZO_DIAS`) y crea una instancia de `CuraduriaTramites` en memoria — sin ejecutar los comandos de ejemplo que vienen después de `---`.
- `POST /comando` con `{ "linea": "RADICAR Ana Restrepo dia=1" }` llama a `procesarLinea(sistema, linea)` (la misma función que usa `main.ts`) y devuelve `{ "salida": "..." }` con el mismo texto que saldría por consola.
- `POST /reiniciar` vuelve a crear el sistema desde cero, por si se quiere empezar de nuevo sin reiniciar el servidor.
- `app.js` en el navegador solo hace `fetch("/comando", ...)` con lo que el usuario escribió y agrega la respuesta a un `<pre>` a modo de consola.

## Cómo ejecutarlo

```
cd "Front (posible)"
npm install
npx --yes tsx server.ts
```

Y abrir `http://localhost:3000`. Si `tsx` no está disponible, `npx tsc && node dist/server.js` compila y corre el mismo servidor (aunque `dist/` tendría que incluir también el `Back/` compilado, así que `tsx` es la vía más simple).
