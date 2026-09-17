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

## `Front (posible)/` — interfaz web (opcional, no implementada)

Carpeta reservada por si se quiere una página HTML+CSS en vez de la consola. No hay código aquí todavía: [`Front (posible)/NOTAS.md`](Front%20(posible)/NOTAS.md) explica cómo se conectaría con `Back/` (directo en el navegador, sin servidor, porque la lógica no depende de Node — solo `main.ts` usa `fs`).
