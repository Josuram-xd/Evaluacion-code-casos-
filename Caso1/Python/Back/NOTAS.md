# BiciTaller — Back (Python)

Implementación 100% de consola: sin ninguna dependencia de interfaz gráfica. Lee un archivo de comandos y va imprimiendo el resultado de cada operación, siguiendo el formato de entrada/salida del PDF del caso.

## Archivos

- `estructuras.py` — `ListaEnlazada`, `Cola` (O(1) encolar/desencolar) y `Pila` (O(1) apilar/desapilar), todas con nodos enlazados a mano.
- `entidades.py` — clase `Bicicleta`: solo datos y estado (código, estación, estado, reparaciones, falla, pila guardada).
- `bicitaller.py` — clase `BiciTaller`: la flota (`ListaEnlazada`), el turno del taller y la espera de repuestos (`Cola`), el puesto de trabajo (`Pila`), y las operaciones RF-01 a RF-09 con las reglas R1-R7.
- `reportes.py` — función `generar_reporte(...)` que arma el texto de `RF-09 reporte()` a partir del estado del servicio.
- `main.py` — runner: parsea el bloque `FLOTA` y luego cada línea de comando (`REPORTAR`, `RECIBIR`, `INICIAR`, `DESMONTAR`, `MONTAR`, `SUSPENDER`, `REANUDAR`, `CERRAR`, `REPORTE`), imprimiendo `> comando` seguido del resultado.
- `taller.txt` — archivo de ejemplo de entrada.

## Cómo ejecutar

```
python main.py taller.txt
```

Cambiar `taller.txt` por cualquier otro archivo con el mismo formato para probar otros escenarios.
