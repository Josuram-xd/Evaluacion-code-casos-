# CentralAscensores — Front en Tkinter

Implementado. `app.py` es una ventana Tkinter (librería estándar, no instala nada) que reutiliza `../Back/` tal cual: importa `CentralAscensores` y la función `procesar_linea`/`cargar_archivo` que ya usa el runner de consola, y muestra la conversación en una caja de texto en vez de imprimirla en la terminal. No hay ninguna regla de negocio reescrita aquí — el Front solo despacha texto al mismo `central.py` de siempre.

## Cómo se conecta

```python
sys.path.insert(0, "../Back")
from central import CentralAscensores
from main import cargar_archivo, procesar_linea   # el mismo despachador que usa la consola
```

Al arrancar, `app.py` carga `../Back/central.txt` (solo el bloque `PARQUE`) para no empezar con el parque vacío, y cada línea que se escribe en el campo de texto se pasa tal cual a `procesar_linea(central, linea)` — es exactamente lo que hace `main.py` por cada línea del archivo de comandos, solo que aquí la línea la escribe una persona en vez de venir de un `.txt`.

## Qué hay en la ventana

- Un área de transcripción (`ScrolledText`) que va acumulando cada comando y su resultado, igual que la consola.
- Un campo de texto + botón "Ejecutar" (o Enter) para escribir cualquier comando de la gramática del caso: `LLAMADA`, `ATENDER`, `PASO`, `DESHACER`, `ABORTAR`, `CERRAR`, `REPORTE`.
- Un botón "Reporte" como atajo.

## Cómo correrlo

```
cd "Python/Front (posible)"
python app.py
```

No necesita `pip install` — Tkinter viene con Python. Si `python` no tiene Tkinter compilado (pasa en algunas instalaciones minimalistas de Linux), instalar el paquete del sistema (`sudo apt install python3-tk` o equivalente); en Windows con el instalador oficial de python.org ya viene incluido.
