# CentralAscensores — Back (consola)

Implementación 100% de consola. Único requisito externo: TypeScript/ts-node (o `tsc` + `node`) para compilar/ejecutar.

| Archivo | Qué contiene |
|---|---|
| `estructuras.ts` | `Lista<T>`, `Cola<T>`, `Pila<T>` genéricas, con nodos enlazados propios (nada de `Array` como almacenamiento). |
| `entidades.ts` | Clase `Ascensor`, interfaz `Llamada`, tipo `TipoLlamada`, constantes del protocolo (`PROTOCOLO`, `OBJETIVO_MINUTOS`, etc.) y `RechazoOperacion`. |
| `central.ts` | Clase `CentralAscensores`: usa `estructuras` + `entidades`, implementa `cargarParque`, `registrarLlamada`, `atenderSiguiente`, `ejecutarPaso`, `deshacerUltimo`, `abortarRescate`, `cerrarLlamada`, `reporte`. |
| `reportes.ts` | Función `generarReporte(central)`: solo lee métricas ya calculadas, no decide reglas. |
| `main.ts` | Único archivo que usa `fs` (Node): lee el archivo de comandos y por cada línea imprime `> <comando>` y el resultado. Exporta `cargarArchivo()` y `procesarLinea()`, que es justo lo que reutiliza el Front. El arranque (`ejecutar(ruta)`) está protegido con `require.main === module` para que importar este archivo no dispare la ejecución del `central.txt` de ejemplo. |
| `central.txt` | Ejemplo de entrada (mismo que la versión Python). |
| `package.json` / `tsconfig.json` | Dependencias de desarrollo (`typescript`, `ts-node`, `@types/node`) y configuración del compilador. |

**Nota para el front:** el Front (`Front (posible)/server.ts`) importa `CentralAscensores` de `central.ts` y `cargarArchivo`/`procesarLinea` de este `main.ts` — no reimplementa el despacho de comandos, solo lo expone por HTTP.

## Cómo ejecutar

```bash
npm install
npx ts-node main.ts central.txt
# o compilado:
npx tsc && node dist/main.js central.txt
```
