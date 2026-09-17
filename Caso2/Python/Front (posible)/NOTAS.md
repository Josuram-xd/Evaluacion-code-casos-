# CentralAscensores — Front (posible) en Tkinter

No hay código en esta carpeta. Esto es una guía de cómo se construiría una interfaz de escritorio con **Tkinter** (librería estándar de Python, no requiere instalar nada) que reutilice `../Back/` tal cual — sin reescribir ninguna regla de negocio, solo envolviendo `CentralAscensores` en widgets.

## Cómo conectar con el Back

```python
import sys
sys.path.append("../Back")   # o mover Back a un paquete instalable

from central import CentralAscensores
from entidades import RechazoOperacion

central = CentralAscensores()
central.cargar_parque(filas_leidas_de_algun_lado)
```

La UI nunca reimplementa `Lista`/`Cola`/`Pila` ni las reglas R1-R7: solo llama a los métodos de `CentralAscensores` y muestra el resultado (o el mensaje de `RechazoOperacion`) en un widget en vez de un `print()`.

## Qué widgets tendrían sentido

- Dos `Listbox` (o `Treeview`) mostrando el contenido de `central.cola_emergencia` y `central.cola_mantenimiento` — hay que agregar un método de solo lectura en `Cola` para recorrerla sin desencolar, si no existe ya.
- Un botón **"Atender siguiente"** que llame `central.atender_siguiente(minuto_actual)` y muestre el resultado.
- Cinco botones **"Paso 1".."Paso 5"** (o uno solo con un spinner) que llamen `central.ejecutar_paso(n)`, deshabilitando los pasos que ya no aplican según el tope real de `central.pila_protocolo`.
- Un botón **"Abortar"** que pida el motivo (`simpledialog.askstring`) y llame `central.abortar_rescate(motivo)`, mostrando cada línea de la traza en un `Text`.
- Un botón **"Reporte"** que llame `central.reporte()` y lo muestre en un `Text` de solo lectura.

## Boceto (ilustrativo, no probado)

```python
import tkinter as tk
from tkinter import messagebox

def on_atender():
    try:
        resultado = central.atender_siguiente(minuto_actual())
        salida.insert(tk.END, resultado + "\n")
    except RechazoOperacion as e:
        messagebox.showwarning("Rechazada", str(e))

ventana = tk.Tk()
salida = tk.Text(ventana)
salida.pack()
tk.Button(ventana, text="Atender siguiente", command=on_atender).pack()
ventana.mainloop()
```

El patrón se repite igual para los demás botones: llamar al método de `CentralAscensores`, capturar `RechazoOperacion`, mostrar el resultado en un widget.
