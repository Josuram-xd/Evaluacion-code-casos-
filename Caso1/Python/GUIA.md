# Python — BiciTaller

Esta carpeta tiene dos subcarpetas:

## `Back/`

Contiene toda la implementación funcional del caso, lista para trabajar por consola: la flota, el turno de reparación y el puesto de trabajo, con lista enlazada, cola y pila propias (nada de `list`/`deque` como backing). El caso de estudio no exige ninguna interfaz gráfica, así que esto ya es una solución completa y autosuficiente por sí sola.

Archivos:
- `estructuras.py` — `ListaEnlazada`, `Cola`, `Pila` genéricas.
- `entidades.py` — la entidad `Bicicleta` (solo datos).
- `bicitaller.py` — el servicio `BiciTaller` (reglas R1-R7 y operaciones RF-01..RF-09).
- `reportes.py` — arma el texto de `reporte()`.
- `main.py` — runner: lee un archivo de comandos y va imprimiendo cada resultado.

Ejecutar:
```
cd Caso1/Python/Back
python main.py taller.txt
```

Ver detalle en `Back/NOTAS.md`.

## `Front (posible)/`

Opcional, no implementada todavía. Es una carpeta reservada por si se quiere construir una interfaz de escritorio con **Tkinter** que reutilice la lógica de `Back/` en vez de reimplementarla (mismas clases, mismos métodos — solo cambia cómo se muestra el resultado). El detalle de cómo se conectaría está en `Front (posible)/NOTAS.md`.
