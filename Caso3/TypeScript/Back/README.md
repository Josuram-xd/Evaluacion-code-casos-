# Back (TypeScript) — CuraduriaTramites

Programa 100% de consola: no abre ninguna ventana ni interfaz gráfica. Lee un archivo de comandos línea por línea y escribe cada resultado en `stdout`, en el formato del numeral 7 del PDF.

## Archivos

| Archivo | Qué contiene |
|---|---|
| `estructuras.ts` | `Lista`, `Cola` y `Pila` genéricas y propias (nodos enlazados a mano, nada de `Array` como backing). Reutilizables para cualquier caso. |
| `entidades.ts` | `Folio` y `Expediente` — datos y comportamiento propio de un expediente individual: su propia lista de folios y su propia pila de ruta. Sin dependencias de Node (no usa `fs`, `process`, etc.), por eso también puede correr en un navegador — ver `Front (posible)/NOTAS.md`. |
| `curaduria.ts` | `CuraduriaTramites` — el orquestador: las colas por dependencia (bandejas) + la cola de represamiento (R7), y las reglas R1-R7 vía `RF-01..RF-08`. Tampoco depende de Node. |
| `reportes.ts` | `generarReporte(servicio, diaActual)` — arma el objeto de métricas del numeral 6 leyendo el estado ya validado por `curaduria.ts`. |
| `main.ts` | Runner: el único archivo que usa APIs de Node (`fs.readFileSync`, `process.argv`) para leer `tramites.txt` y llamar a los métodos de `CuraduriaTramites`, dando formato a cada línea de salida. |
| `tramites.txt` | Archivo de ejemplo (equivalente al del PDF). |

## Ejecutar

```
npm install
npx --yes tsx main.ts tramites.txt
```

`ts-node` puede fallar con versiones recientes de Node (incompatibilidad observada con Node 24); si pasa, usar `tsx` como arriba, o compilar y correr con Node directamente:

```
npx tsc
node main.js tramites.txt
```
