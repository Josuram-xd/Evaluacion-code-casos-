# TypeScript — BiciTaller

Esta carpeta tiene dos subcarpetas:

## `Back/`

Contiene toda la implementación funcional del caso, lista para trabajar por consola: la flota, el turno de reparación y el puesto de trabajo, con lista enlazada, cola y pila propias (nada de `Array` como backing). El caso de estudio no exige ninguna interfaz gráfica, así que esto ya es una solución completa y autosuficiente por sí sola.

Archivos:
- `estructuras.ts` — `ListaEnlazada`, `Cola`, `Pila` genéricas.
- `entidades.ts` — la entidad `Bicicleta` (solo datos) y el tipo `FilaFlota`.
- `bicitaller.ts` — el servicio `BiciTaller` (reglas R1-R7 y operaciones RF-01..RF-09).
- `reportes.ts` — arma el texto de `reporte()`.
- `main.ts` — runner: lee un archivo de comandos y va imprimiendo cada resultado.

Ejecutar:
```
cd Caso1/TypeScript/Back
npm install
npx ts-node main.ts taller.txt
# o: npx tsc && node main.js taller.txt
```

Ver detalle en `Back/NOTAS.md`.

## `Front (posible)/`

Interfaz web en **HTML + CSS** (`index.html`/`styles.css`/`app.js`) servida por `server.ts`, un servidor mínimo con el módulo `http` de Node (sin Express) que reutiliza `BiciTaller` y `ejecutarComando()` de `Back/` tal cual, exponiéndolos como `POST /comando`. Ejecutar con `npm install && npx ts-node server.ts` (o `npx tsx server.ts`) desde esa carpeta y abrir `http://localhost:4000`. Detalle en `Front (posible)/NOTAS.md`.
