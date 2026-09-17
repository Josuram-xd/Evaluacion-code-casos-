# BiciTaller — Front (posible) en Tkinter

No implementado: esta es la guía de cómo se construiría, reutilizando por completo la lógica de `../Back/` sin duplicarla. El front nunca reescribe una regla de negocio; solo llama a los mismos métodos que ya usa `Back/main.py` y muestra el resultado con widgets en vez de `print()`.

## 1. Importar la lógica de `Back/`

La forma más simple sin reestructurar nada: agregar la carpeta `Back/` al `sys.path` antes de importar.

```python
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "Back"))

from bicitaller import BiciTaller
from reportes import generar_reporte  # ya lo usa BiciTaller.reporte(), no hace falta importarlo aparte
```

(Alternativa más "correcta" a futuro: convertir `Back/` en un paquete con `__init__.py` e importar como `from Back.bicitaller import BiciTaller`. Para un caso de este tamaño, el `sys.path.append` es suficiente y no obliga a tocar `Back/`.)

## 2. Qué widgets tienen sentido

- Un formulario con `Entry` para código + descripción de falla, y un botón "Reportar falla" → llama a `taller.reportar_falla(codigo, falla)`.
- Un botón "Recibir en taller" (con su `Entry` de código) → `taller.recibir_en_taller(codigo)`.
- Un botón "Iniciar reparación" → `taller.iniciar_reparacion()`.
- Dos botones "Desmontar" (con `Entry` de la pieza) y "Montar" → `taller.desmontar(pieza)` / `taller.montar()`. Al lado, una `Label` o `Listbox` que muestre el estado actual de la pila del puesto (se puede leer con `taller.puesto["pila"].recorrer_desde_tope()` si se expone, o agregando un pequeño método de solo lectura en `BiciTaller` para no romper el encapsulamiento).
- Botones "Suspender" / "Reanudar" / "Cerrar orden".
- Un botón "Reporte" que llama a `taller.reporte()` y vuelca el texto en un `Text` de solo lectura.
- Un área de log (`Text` o `Listbox`) donde se van agregando los mensajes de retorno de cada operación (éxito o rechazo), igual que `main.py` los imprime por consola.

## 3. Boceto de código (patrón general)

```python
import tkinter as tk
from bicitaller import BiciTaller  # via sys.path como arriba

taller = BiciTaller()

def on_recibir():
    codigo = entry_codigo.get()
    mensaje = taller.recibir_en_taller(codigo)
    log.insert(tk.END, mensaje + "\n")

ventana = tk.Tk()
entry_codigo = tk.Entry(ventana)
entry_codigo.pack()
tk.Button(ventana, text="Recibir en taller", command=on_recibir).pack()
log = tk.Text(ventana, height=15, width=60)
log.pack()
ventana.mainloop()
```

Cada botón sigue el mismo patrón: leer los `Entry`, llamar al método de `BiciTaller` correspondiente, y volcar el string devuelto en el log — el mismo string que hoy imprime `main.py`, solo que aquí se muestra en un widget en lugar de la terminal.
