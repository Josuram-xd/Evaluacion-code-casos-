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

## `Front (posible)/` — interfaz gráfica (opcional, no implementada)

Carpeta reservada por si se quiere una ventana de escritorio (Tkinter) en vez de la consola. No hay código aquí todavía: [`Front (posible)/NOTAS.md`](Front%20(posible)/NOTAS.md) explica cómo se construiría reutilizando las clases de `Back/` sin reescribir la lógica de negocio.
