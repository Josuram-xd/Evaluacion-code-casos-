# TypeScript — CentralAscensores

Esta carpeta tiene dos subcarpetas con roles distintos:

## `Back/` — implementación de consola (obligatoria, ya hecha)

Resuelve el caso completo: lista, cola y pila propias, las reglas R1-R7 y los requerimientos RF-01 a RF-08. El caso no exige una interfaz gráfica — la entrada es un archivo de comandos y la salida es texto — así que esto ya es una solución completa desde la terminal.

Archivos:
- `estructuras.ts` — `Lista`, `Cola`, `Pila` propias, genéricas (nodos enlazados, sin `Array` como backing).
- `entidades.ts` — `Ascensor`, `Llamada`, `PROTOCOLO` y `RechazoOperacion`.
- `central.ts` — clase `CentralAscensores`: orquesta todo (RF-01..RF-08, reglas R1-R7).
- `reportes.ts` — arma el texto de `reporte()`.
- `main.ts` — runner: lee un archivo de comandos con `fs` y ejecuta cada línea.

Ejecutar:
```
cd Back
npm install
npx ts-node main.ts central.txt        # o: npx tsc && node dist/main.js central.txt
```

Detalle de cada archivo: [`Back/NOTAS.md`](Back/NOTAS.md).

## `Front (posible)/` — interfaz web (opcional, ya implementada)

Página HTML+CSS servida por un puente HTTP mínimo (`server.ts`, solo el módulo `http` de Node, sin Express) que reutiliza `../Back/central.ts` y `../Back/main.ts` sin reescribir ninguna regla. Se ejecuta con `npm install && npm start` desde esa carpeta y se abre en `http://localhost:5175`. Detalle en [`Front (posible)/NOTAS.md`](<Front (posible)/NOTAS.md>).
