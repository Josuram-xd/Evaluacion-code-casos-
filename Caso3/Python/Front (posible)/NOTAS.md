# Front en Tkinter — CuraduriaTramites

Ventana de escritorio mínima, implementada en [`app.py`](app.py). No reescribe ninguna regla de negocio: importa `CuraduriaTramites` y `procesar_linea` directamente de [`../Back/main.py`](<../Back/main.py>), el mismo módulo que usa el runner de consola.

## Por qué un solo input de comando y no un formulario por operación

`CuraduriaTramites` tiene ocho operaciones (`RADICAR`, `FOLIO`, `ANULAR`, `ATENDER`, `AVANZAR`, `DEVOLVER`, `IMPRIMIR`, `REPORTE`), cada una con su propia sintaxis. Un formulario por operación significa ocho pantallas y duplicar en la interfaz el parseo de argumentos que `procesar_linea` ya hace. En cambio, un campo de texto tipo "línea de comando" + botón "Ejecutar" reutiliza el 100% del parser existente: la ventana solo captura el texto, se lo pasa tal cual a `procesar_linea(sistema, linea)` y muestra lo que devuelve.

## Cómo se conecta con el Back

```python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "Back"))
from main import inicializar_desde_archivo, procesar_linea
```

- `inicializar_desde_archivo("../Back/tramites.txt")` — al abrir la ventana, lee solo el encabezado del archivo (`CAPACIDAD_BANDEJA`, `PLAZO_DIAS`) y crea una instancia de `CuraduriaTramites` ya configurada. No ejecuta los comandos de ejemplo que vienen después de `---`; la ventana arranca con la curaduría vacía, lista para que el usuario escriba sus propios comandos.
- Cada vez que el usuario escribe una línea y presiona "Ejecutar" (o Enter), la ventana llama a `procesar_linea(sistema, linea)` y agrega el texto devuelto a la caja de salida — es el mismo texto que `main.py` imprimiría por consola.
- El botón "Ver reporte" simplemente arma la línea `REPORTE dia=<N>` con el número que se haya escrito al lado y la pasa por el mismo camino.

## Cómo ejecutarlo

```
cd "Front (posible)"
python app.py
```

No requiere instalar nada (Tkinter viene con Python).
