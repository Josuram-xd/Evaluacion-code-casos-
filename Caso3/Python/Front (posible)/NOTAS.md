# Front (posible, Python) — CuraduriaTramites

No hay código aquí todavía. Esto es una guía de cómo se conectaría una interfaz de escritorio en **Tkinter** con la lógica ya construida en `../Back/`, sin reescribir ni una sola regla de negocio: el front solo la envuelve.

## Cómo importar la lógica existente

Tkinter es parte de la librería estándar de Python (`import tkinter as tk`), así que no hace falta instalar nada extra. Para reutilizar `Back/` sin copiar código, el módulo de la interfaz debe poder ver esos archivos en su `sys.path` — la forma más simple es correr el front desde dentro de `Back/`, o agregar la carpeta al path al inicio:

```python
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "Back"))

from curaduria import CuraduriaTramites
```

`CuraduriaTramites` ya expone exactamente los métodos que un botón necesita llamar (`radicar`, `agregar_folio`, `anular_folio`, `atender_siguiente`, `avanzar`, `devolver`, `reporte`), y lanza `ValueError` con el mensaje de rechazo cuando una regla no se cumple — el front solo necesita capturar esa excepción y mostrarla, en vez de dejar que el programa termine.

## Qué widgets tendrían sentido

- Un formulario **"Radicar"**: campos de texto para `solicitante` y `dia`, botón que llama a `sistema.radicar(...)`.
- Una vista de **expediente seleccionado**: un `ttk.Treeview` (tabla) con columnas `número | descripción | estado`, poblada iterando `expediente.folios` (la `Lista` es iterable con `for folio in expediente.folios`). Los folios `ANULADO` se pueden pintar en gris/tachado sin quitarlos de la tabla — igual que en el dominio, no se eliminan.
- Botones **"Avanzar"** y **"Devolver"** sobre el expediente seleccionado, que muestran la ruta (`expediente.ruta_actual()`) en una etiqueta antes y después de la operación.
- Un botón **"Reporte"** que llama a `sistema.reporte(dia_actual)` y vuelca el diccionario resultante en un cuadro de texto de solo lectura.

## Boceto de conexión (ilustrativo, no funcional)

```python
import tkinter as tk
from tkinter import messagebox
from curaduria import CuraduriaTramites

sistema = CuraduriaTramites()

def on_avanzar():
    radicado = entrada_radicado.get()
    try:
        destino, encolado = sistema.avanzar(radicado)
        estado = f"encolado en {destino}" if encolado else f"represado, esperando cupo en {destino}"
        etiqueta_resultado.config(text=f"{radicado} avanza a {destino} | {estado}")
    except ValueError as error:
        messagebox.showerror("Rechazado", str(error))

ventana = tk.Tk()
entrada_radicado = tk.Entry(ventana)
boton_avanzar = tk.Button(ventana, text="Avanzar", command=on_avanzar)
etiqueta_resultado = tk.Label(ventana, text="")
entrada_radicado.pack(); boton_avanzar.pack(); etiqueta_resultado.pack()
ventana.mainloop()
```

La diferencia clave frente a `main.py` es que en vez de `print(...)` cada resultado se escribe en un widget (`Label`, `Treeview`, cuadro de texto), y en vez de leer un archivo de comandos, cada acción del usuario en la ventana dispara directamente el método correspondiente de `CuraduriaTramites`.
