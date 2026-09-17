"""
Front minimo en Tkinter para CuraduriaTramites (Caso 3).

No reimplementa ninguna regla de negocio: importa `CuraduriaTramites` y la
funcion `procesar_linea` directamente de `../Back/main.py`, la misma que usa
el runner de consola. La ventana es un input de "linea de comando" + boton
Ejecutar + una caja de texto con la transcripcion, porque eso reutiliza el
parser de comandos completo (RADICAR, FOLIO, ANULAR, ATENDER, AVANZAR,
DEVOLVER, IMPRIMIR, REPORTE) sin tener que armar un formulario por operacion.

Uso:
    python app.py
"""

import os
import sys
import tkinter as tk
from tkinter import scrolledtext

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "Back"))

from main import inicializar_desde_archivo, procesar_linea  # noqa: E402

ARCHIVO_INICIAL = os.path.join(os.path.dirname(__file__), "..", "Back", "tramites.txt")


class VentanaCuraduria:
    def __init__(self, root):
        self.sistema = inicializar_desde_archivo(ARCHIVO_INICIAL)

        root.title("CuraduriaTramites - consola")

        self.texto = scrolledtext.ScrolledText(root, width=90, height=28, state="disabled")
        self.texto.pack(padx=8, pady=8)

        marco_entrada = tk.Frame(root)
        marco_entrada.pack(fill="x", padx=8, pady=(0, 8))

        self.entrada = tk.Entry(marco_entrada)
        self.entrada.pack(side="left", fill="x", expand=True)
        self.entrada.bind("<Return>", self._ejecutar)
        self.entrada.focus()

        tk.Button(marco_entrada, text="Ejecutar", command=self._ejecutar).pack(side="left", padx=(6, 0))

        marco_reporte = tk.Frame(root)
        marco_reporte.pack(fill="x", padx=8, pady=(0, 8))
        tk.Label(marco_reporte, text="Reporte del dia:").pack(side="left")
        self.dia_reporte = tk.Entry(marco_reporte, width=6)
        self.dia_reporte.insert(0, "1")
        self.dia_reporte.pack(side="left", padx=(4, 6))
        tk.Button(marco_reporte, text="Ver reporte", command=self._reporte).pack(side="left")

        self._escribir(
            "Sistema inicializado desde tramites.txt (encabezado).\n"
            "Escribe comandos como los del PDF, por ejemplo:\n"
            "  RADICAR Ana Restrepo dia=1\n"
            "  FOLIO 11001-2026-0001 planos_arquitectonicos\n"
            "  ATENDER RECEPCION\n"
            "  AVANZAR 11001-2026-0001\n"
        )

    def _escribir(self, texto):
        self.texto.configure(state="normal")
        self.texto.insert("end", texto + "\n")
        self.texto.configure(state="disabled")
        self.texto.see("end")

    def _ejecutar(self, _evento=None):
        linea = self.entrada.get().strip()
        if not linea:
            return
        self.entrada.delete(0, "end")
        try:
            self._escribir(procesar_linea(self.sistema, linea))
        except Exception as error:  # noqa: BLE001 - se muestra tal cual en la ventana
            self._escribir(f"> {linea}\n  ERROR: {error}")

    def _reporte(self):
        dia = self.dia_reporte.get().strip() or "1"
        self._ejecutar_directo(f"REPORTE dia={dia}")

    def _ejecutar_directo(self, linea):
        self._escribir(procesar_linea(self.sistema, linea))


if __name__ == "__main__":
    raiz = tk.Tk()
    VentanaCuraduria(raiz)
    raiz.mainloop()
