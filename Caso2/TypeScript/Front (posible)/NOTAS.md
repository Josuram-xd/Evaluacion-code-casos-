# CentralAscensores — Front en HTML + CSS

Implementado. Es un puente HTTP mínimo: `server.ts` usa solo el módulo `http` de Node (sin Express) para servir `index.html`/`styles.css`/`app.js` y exponer un único endpoint, `POST /comando`, que reutiliza el mismo despachador de comandos que usa la consola. Ninguna regla de negocio vive en esta carpeta — `server.ts` importa `CentralAscensores` y `procesarLinea`/`cargarArchivo` directamente de `../Back/`.

## Por qué un servidor y no directo en el navegador

`central.ts`/`entidades.ts`/`estructuras.ts`/`reportes.ts` no dependen de Node y sí se podrían cargar directo en el navegador, pero `main.ts` (de donde sale `procesarLinea`, ya con todo el parseo de comandos hecho) sí usa `fs` para leer `central.txt`. Reescribir ese despacho en el navegador habría duplicado lógica; exponerlo por un servidor de 60 líneas es más simple y cumple la regla de no reimplementar nada.

## Cómo se conecta

```ts
import { CentralAscensores } from "../Back/central";
import { cargarArchivo, procesarLinea } from "../Back/main";
```

- Al arrancar, el servidor crea un `CentralAscensores`, lo carga con `../Back/central.txt` y lo mantiene en memoria mientras el proceso vive.
- `POST /comando` con `{ "linea": "LLAMADA ASC-118 EMERGENCIA 480" }` corre `procesarLinea(central, linea)` y devuelve `{ "salida": [...] }` — la misma lista de líneas que `main.ts` imprimiría.
- `POST /reiniciar` vuelve a cargar el parque desde cero.
- `index.html` + `app.js` son una consola web: un `<input>`, un botón "Ejecutar" y un `<pre>` que va acumulando la transcripción, haciendo `fetch("/comando", ...)` por cada línea. `styles.css` es solo apariencia.

## Cómo correrlo

```
cd "TypeScript/Front (posible)"
npm install
npm start                 # = npx tsx server.ts
```

Abrir `http://localhost:5175`. Se probó con `curl -X POST http://localhost:5175/comando -d '{"linea":"LLAMADA ASC-118 EMERGENCIA 480"}'` y la salida coincide con la de la consola.

`tsconfig.json` de esta carpeta es solo para que el editor tipe correctamente `../Back/*.ts` (`noEmit: true`); no hace falta compilar con `tsc` porque se ejecuta con `tsx`, igual que se hizo con el Back de Caso3 por la incompatibilidad de `ts-node` con Node 24.
