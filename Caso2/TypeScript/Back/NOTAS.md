# CentralAscensores — Back (consola)

Implementación 100% de consola. Único requisito externo: TypeScript/ts-node (o `tsc` + `node`) para compilar/ejecutar.

| Archivo | Qué contiene |
|---|---|
| `estructuras.ts` | `Lista<T>`, `Cola<T>`, `Pila<T>` genéricas, con nodos enlazados propios (nada de `Array` como almacenamiento). |
| `entidades.ts` | Clase `Ascensor`, interfaz `Llamada`, tipo `TipoLlamada`, constantes del protocolo (`PROTOCOLO`, `OBJETIVO_MINUTOS`, etc.) y `RechazoOperacion`. |
| `central.ts` | Clase `CentralAscensores`: usa `estructuras` + `entidades`, implementa `cargarParque`, `registrarLlamada`, `atenderSiguiente`, `ejecutarPaso`, `deshacerUltimo`, `abortarRescate`, `cerrarLlamada`, `reporte`. |
| `reportes.ts` | Función `generarReporte(central)`: solo lee métricas ya calculadas, no decide reglas. |
| `main.ts` | Único archivo que usa `fs` (Node): lee el archivo de comandos y por cada línea imprime `> <comando>` y el resultado. |
| `central.txt` | Ejemplo de entrada (mismo que la versión Python). |
| `package.json` / `tsconfig.json` | Dependencias de desarrollo (`typescript`, `ts-node`, `@types/node`) y configuración del compilador. |

**Nota para el front:** solo `main.ts` importa `fs`; `central.ts`, `entidades.ts`, `estructuras.ts` y `reportes.ts` son TypeScript puro sin APIs de Node, así que se pueden usar directamente en el navegador (ver `Front (posible)/NOTAS.md`).

## Cómo ejecutar

```bash
npm install
npx ts-node main.ts central.txt
# o compilado:
npx tsc && node dist/main.js central.txt
```
