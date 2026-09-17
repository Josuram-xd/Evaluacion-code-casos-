"""
Entidad de dominio de BiciTaller: solo datos y estado propios de una
bicicleta. Las reglas de negocio (R1-R7) y las operaciones (RF-01..RF-09)
viven en el servicio, no aquí.
"""


class Bicicleta:
    def __init__(self, codigo, estacion, estado, reparaciones):
        self.codigo = codigo
        self.estacion = estacion
        self.estado = estado
        self.reparaciones = reparaciones
        self.falla = ""
        self.pila_guardada = None      # Pila de una orden suspendida (R4/R5), o None
        self.motivo_suspension = None
        self.turno_ingreso = None      # turno en que entró a una cola, para medir espera
