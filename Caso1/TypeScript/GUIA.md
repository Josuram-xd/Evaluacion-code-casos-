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

Opcional, no implementada todavía. Es una carpeta reservada por si se quiere construir una interfaz web en **HTML + CSS** que reutilice la lógica de `Back/` en vez de reimplementarla. El detalle de cómo se conectaría (y por qué en este caso se puede hacer sin servidor intermedio) está en `Front (posible)/NOTAS.md`.
