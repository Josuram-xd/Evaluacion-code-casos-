# Python — CentralAscensores

Esta carpeta tiene dos subcarpetas con roles distintos:

## `Back/` — implementación de consola (obligatoria, ya hecha)

Resuelve el caso completo: lista, cola y pila propias, las reglas R1-R7 y los requerimientos RF-01 a RF-08. El caso no exige una interfaz gráfica — la entrada es un archivo de comandos y la salida es texto — así que esto ya es una solución completa y utilizable tal cual, desde la terminal.

Archivos:
- `estructuras.py` — Lista, Cola y Pila propias (nodos enlazados, sin `list`/`deque`).
- `entidades.py` — `Ascensor`, `Llamada`, constantes del protocolo de rescate y `RechazoOperacion`.
- `central.py` — clase `CentralAscensores`: orquesta todo (RF-01..RF-08, reglas R1-R7).
- `reportes.py` — arma el texto de `reporte()` a partir de las métricas ya calculadas.
- `main.py` — runner: lee un archivo de comandos y ejecuta cada línea.

Ejecutar:
```
cd Back
python main.py central.txt
```

Detalle de cada archivo y cómo leer la salida: [`Back/NOTAS.md`](Back/NOTAS.md).

## `Front (posible)/` — interfaz gráfica (opcional, ya implementada)

Ventana de escritorio en Tkinter (`app.py`) que reutiliza `Back/` tal cual, sin reescribir ninguna regla: un campo de comando + botón "Ejecutar" + una transcripción tipo consola. Se ejecuta con `python app.py` desde esa carpeta. Detalle en [`Front (posible)/NOTAS.md`](<Front (posible)/NOTAS.md>).
