"""
Front minimo en Tkinter para BiciTaller.

No reimplementa ninguna regla de negocio: reutiliza tal cual BiciTaller,
leer_flota() y ejecutar_comando() de Back/main.py. La ventana es una
"consola" con un campo de texto para escribir la misma sintaxis de
comandos que usa taller.txt (REPORTAR, RECIBIR, INICIAR, DESMONTAR,
MONTAR, SUSPENDER, REANUDAR, CERRAR, REPORTE) y una transcripcion de
lo que cada comando devuelve.

Uso:
    python app.py
"""

import os
import sys
import tkinter as tk
from tkinter import scrolledtext

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "Back"))

from bicitaller import BiciTaller          # noqa: E402
from main import leer_flota, ejecutar_comando  # noqa: E402

TALLER_TXT = os.path.join(os.path.dirname(__file__), "..", "Back", "taller.txt")


class VentanaBiciTaller(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("BiciTaller - consola")
        self.geometry("720x480")

        self.taller = BiciTaller()
        self._cargar_flota_inicial()

        self.salida = scrolledtext.ScrolledText(self, state="disabled", font=("Consolas", 10))
        self.salida.pack(fill="both", expand=True, padx=8, pady=(8, 4))

        barra = tk.Frame(self)
        barra.pack(fill="x", padx=8, pady=(0, 8))

        self.entrada = tk.Entry(barra, font=("Consolas", 10))
        self.entrada.pack(side="left", fill="x", expand=True)
        self.entrada.bind("<Return>", lambda _evento: self._ejecutar())
        self.entrada.focus_set()

        tk.Button(barra, text="Ejecutar", command=self._ejecutar).pack(side="left", padx=(6, 0))
        tk.Button(barra, text="Reporte", command=self._reporte).pack(side="left", padx=(6, 0))

        self._escribir(f"Flota cargada desde taller.txt ({len(self.taller.flota)} bicicletas).")
        self._escribir("Escribe un comando (ej. REPORTAR BIC-0412 frenos sueltos) y presiona Enter.\n")

    def _cargar_flota_inicial(self):
        with open(TALLER_TXT, encoding="utf-8") as f:
            lineas = [linea.rstrip("\n") for linea in f]
        filas, _ = leer_flota(lineas, 0)
        for mensaje in self.taller.cargar_flota(filas):
            print(mensaje)

    def _escribir(self, texto):
        self.salida.configure(state="normal")
        self.salida.insert("end", texto + "\n")
        self.salida.configure(state="disabled")
        self.salida.see("end")

    def _ejecutar(self):
        comando = self.entrada.get().strip()
        if not comando:
            return
        self.entrada.delete(0, "end")
        self._escribir(f"> {comando}")
        self._escribir(ejecutar_comando(self.taller, comando))
        self._escribir("")

    def _reporte(self):
        self._escribir("> REPORTE")
        self._escribir(ejecutar_comando(self.taller, "REPORTE"))
        self._escribir("")


if __name__ == "__main__":
    VentanaBiciTaller().mainloop()
