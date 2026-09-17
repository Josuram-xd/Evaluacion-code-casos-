# Python — CuraduriaTramites

Esta carpeta tiene dos subcarpetas con roles distintos:

- **`Back/`** — la implementación completa y funcional del caso, para trabajar por consola. El caso de estudio no exige ninguna interfaz gráfica: pide un programa que lea un archivo de comandos y produzca una salida de texto (ver `Caso_Estudio_3.pdf`, numeral 7). Eso es exactamente lo que hay aquí, ya terminado y validado: `estructuras.py` (Lista/Cola/Pila propias), `entidades.py` (`Folio`, `Expediente`), `curaduria.py` (orquestador `CuraduriaTramites` con las reglas R1-R7 y RF-01..RF-08) y `reportes.py` (armado del reporte final), ejecutados desde `main.py`.

  Ejecutar:
  ```
  cd Back
  python main.py tramites.txt
  ```

  Detalle de cada archivo en [`Back/NOTAS.md`](Back/NOTAS.md).

- **`Front (posible)/`** — opcional porque el caso no la exige, pero sí está implementada: una ventana de Tkinter (`app.py`) con un campo para escribir comandos y una consola de salida, que importa `CuraduriaTramites` y `procesar_linea` directamente de `../Back/main.py` (mismo parser de comandos, ninguna regla de negocio duplicada). Ejecutar:
  ```
  cd "Front (posible)"
  python app.py
  ```
  Detalle en [`Front (posible)/NOTAS.md`](<Front (posible)/NOTAS.md>).
