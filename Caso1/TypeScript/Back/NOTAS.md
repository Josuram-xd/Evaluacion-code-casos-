# BiciTaller — Back (TypeScript)

Implementación 100% de consola: sin ninguna dependencia de interfaz gráfica. Lee un archivo de comandos y va imprimiendo el resultado de cada operación, siguiendo el formato de entrada/salida del PDF del caso.

## Archivos

- `estructuras.ts` — `ListaEnlazada<T>`, `Cola<T>` (O(1) encolar/desencolar) y `Pila<T>` (O(1) apilar/desapilar), todas con nodos enlazados a mano (nada de `Array` como almacenamiento interno).
- `entidades.ts` — clase `Bicicleta` y tipo `FilaFlota` (fila cruda del bloque `FLOTA`).
- `bicitaller.ts` — clase `BiciTaller`: la flota (`ListaEnlazada`), el turno del taller y la espera de repuestos (`Cola`), el puesto de trabajo (`Pila`), y las operaciones RF-01 a RF-09 con las reglas R1-R7.
- `reportes.ts` — función `generarReporte(...)` que arma el texto de `RF-09 reporte()`.
- `main.ts` — runner: parsea el bloque `FLOTA` y luego cada línea de comando, imprimiendo `> comando` seguido del resultado. Es el único archivo que usa una API de Node (`fs` para leer el archivo).
- `taller.txt` — archivo de ejemplo de entrada.
- `package.json` / `tsconfig.json` — configuración mínima para compilar/ejecutar.

## Cómo ejecutar

```
npm install
npx ts-node main.ts taller.txt
```

o compilando primero:

```
npx tsc
node main.js taller.txt
```

Cambiar `taller.txt` por cualquier otro archivo con el mismo formato para probar otros escenarios.
