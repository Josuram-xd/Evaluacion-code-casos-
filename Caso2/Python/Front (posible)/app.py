"""
Front minimo de escritorio (Tkinter) para CentralAscensores.

No reimplementa ninguna regla de negocio: importa el mismo servicio y el
mismo despachador de comandos que usa el runner de consola en
../Back/main.py, y solo muestra la conversacion en una ventana en vez de
imprimirla en la terminal. Es la misma gramatica de comandos del PDF
(LLAMADA, ATENDER, PASO, DESHACER, ABORTAR, CERRAR, REPORTE).

Uso:
    cd "Caso2/Python/Front (posible)"
    python app.py
"""

import sys
import tkinter as tk
from pathlib import Path
from tkinter.scrolledtext import ScrolledText

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "Back"))

from central import CentralAscensores  # noqa: E402
from main import cargar_archivo, procesar_linea  # noqa: E402

RUTA_DATOS = Path(__file__).resolve().parent.parent / "Back" / "central.txt"


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("CentralAscensores - consola")
        self.geometry("760x480")

        self.central = CentralAscensores()
        filas_parque, _ = cargar_archivo(str(RUTA_DATOS))
        self.central.cargar_parque(filas_parque)

        self.transcripcion = ScrolledText(self, state="disabled", font=("Consolas", 10))
        self.transcripcion.pack(fill="both", expand=True, padx=8, pady=(8, 4))

        entrada = tk.Frame(self)
        entrada.pack(fill="x", padx=8, pady=(0, 8))
        self.campo = tk.Entry(entrada, font=("Consolas", 10))
        self.campo.pack(side="left", fill="x", expand=True)
        self.campo.bind("<Return>", lambda _evt: self.ejecutar())
        tk.Button(entrada, text="Ejecutar", command=self.ejecutar).pack(side="left", padx=(4, 0))
        tk.Button(entrada, text="Reporte", command=lambda: self._correr("REPORTE")).pack(side="left", padx=(4, 0))

        self._escribir(f"parque cargado desde {RUTA_DATOS.name} ({len(filas_parque)} ascensores)")
        self._escribir("escribe un comando, por ejemplo: LLAMADA ASC-118 EMERGENCIA 480")
        self.campo.focus()

    def ejecutar(self) -> None:
        linea = self.campo.get().strip()
        if not linea:
            return
        self.campo.delete(0, tk.END)
        self._correr(linea)

    def _correr(self, linea: str) -> None:
        self._escribir(f"> {linea}")
        for l in procesar_linea(self.central, linea):
            self._escribir(f"  {l}")

    def _escribir(self, texto: str) -> None:
        self.transcripcion.configure(state="normal")
        self.transcripcion.insert(tk.END, texto + "\n")
        self.transcripcion.configure(state="disabled")
        self.transcripcion.see(tk.END)


if __name__ == "__main__":
    App().mainloop()
