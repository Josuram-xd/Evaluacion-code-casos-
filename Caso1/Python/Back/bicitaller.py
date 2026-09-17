"""
Servicio/orquestador de BiciTaller: la flota (lista), el turno del taller y
la espera de repuestos (colas), y el puesto de trabajo (pila de piezas).
La entidad `Bicicleta` vive en entidades.py; el detalle del reporte, en
reportes.py.

Punto clave del caso (R4/R5 - suspender/reanudar):
Guardar una pila "vaciándola" en otra estructura auxiliar y volviéndola a
llenar invierte el orden si solo se usa una transferencia (con una sola
pila auxiliar, lo que era el tope queda en el fondo). Aquí se evita el
problema por completo: como nuestra Pila ya es un objeto con nodos
enlazados, "guardar" la pila de la orden es simplemente quedarnos con la
referencia a ese mismo objeto (bici.pila_guardada = pila), sin mover ni
un solo elemento. El puesto queda libre porque a la siguiente bicicleta
se le entrega una Pila() nueva. Al reanudar, se vuelve a usar esa misma
referencia como pila del puesto: el orden queda idéntico porque nunca se
tocó. Costo: O(1), 0 transferencias.
"""

from estructuras import ListaEnlazada, Cola, Pila
from entidades import Bicicleta
from reportes import generar_reporte

CAPACIDAD_COLA_TALLER = 50
REPARACIONES_PARA_BAJA = 3


class BiciTaller:
    def __init__(self):
        self.flota = ListaEnlazada()
        self.bajas = ListaEnlazada()
        self.cola_taller = Cola()
        self.cola_espera = Cola()
        self.puesto = None             # {"codigo": str, "pila": Pila} o None si está libre
        self._turno = 0
        self.tiempos_espera = []       # [(codigo, turnos_esperados)]
        self.ordenes_cerradas = 0
        self.ordenes_suspendidas = 0
        self.ordenes_rechazadas = 0

    # ---- RF-01 / RF-02 ----------------------------------------------------
    def cargar_flota(self, filas):
        """filas: lista de (codigo, estacion, estado, reparaciones)."""
        mensajes = []
        for codigo, estacion, estado, reparaciones in filas:
            if self.buscar(codigo) is not None:
                mensajes.append(f"RECHAZADO: codigo duplicado {codigo}")
                continue
            bici = Bicicleta(codigo, estacion, estado, reparaciones)
            self.flota.insertar_ordenado(bici, clave=lambda b: b.codigo)
        return mensajes

    def buscar(self, codigo):
        """O(n): recorre la lista enlazada buscando el código."""
        return self.flota.buscar(lambda b: b.codigo == codigo)

    # ---- RF-03 --------------------------------------------------------
    def reportar_falla(self, codigo, falla):
        bici = self.buscar(codigo)
        if bici is None:
            return f"RECHAZADA: la bicicleta {codigo} no existe"
        if bici.estado != "OPERATIVA":
            return f"RECHAZADA (R1): estado {bici.estado}, solo se reporta una bicicleta OPERATIVA"
        bici.estado = "REPORTADA"
        bici.falla = falla
        return f"{codigo} -> REPORTADA ({falla})"

    # ---- RF-04 --------------------------------------------------------
    def recibir_en_taller(self, codigo):
        bici = self.buscar(codigo)
        if bici is None:
            return f"RECHAZADA: la bicicleta {codigo} no existe"
        if bici.estado != "REPORTADA":
            return f"RECHAZADA (R1): estado {bici.estado}, no fue reportada"
        if len(self.cola_taller) >= CAPACIDAD_COLA_TALLER:
            return "RECHAZADA: cola del taller llena"
        bici.estado = "EN_TALLER"
        bici.turno_ingreso = self._turno
        self.cola_taller.encolar(bici.codigo)
        return f"{codigo} -> EN_TALLER, encolada en el taller (posicion {len(self.cola_taller)})"

    # ---- RF-05 --------------------------------------------------------
    def iniciar_reparacion(self):
        if self.puesto is not None:
            return "RECHAZADA: el puesto de trabajo ya esta ocupado"
        if self.cola_taller.esta_vacia():
            return "RECHAZADA: no hay bicicletas en espera"
        codigo = self.cola_taller.desencolar()
        bici = self.buscar(codigo)
        espera = self._turno - bici.turno_ingreso
        self.tiempos_espera.append((codigo, espera))

        if bici.pila_guardada is not None:
            pila = bici.pila_guardada
            bici.pila_guardada = None
            origen = "restaurada"
        else:
            pila = Pila()
            origen = "vacia"

        self.puesto = {"codigo": codigo, "pila": pila}
        self._turno += 1
        tope = "-" if pila.esta_vacia() else pila.ver_tope()
        return f"{codigo} en el puesto de trabajo | pila {origen} (tope={tope}) | espero {espera} turno(s)"

    # ---- RF-06 --------------------------------------------------------
    def desmontar(self, pieza):
        if self.puesto is None:
            return "RECHAZADA: no hay bicicleta en el puesto de trabajo"
        self.puesto["pila"].apilar(pieza)
        return f"{pieza} desmontada y apilada (tope={pieza})"

    def montar(self):
        if self.puesto is None:
            return "RECHAZADA: no hay bicicleta en el puesto de trabajo"
        pila = self.puesto["pila"]
        if pila.esta_vacia():
            return "RECHAZADO: no hay piezas para montar, la pila esta vacia"
        pieza = pila.desapilar()
        return f"{pieza} montada"

    # ---- RF-07 --------------------------------------------------------
    def suspender(self, motivo):
        if self.puesto is None:
            return "RECHAZADA: no hay bicicleta en el puesto de trabajo"
        codigo = self.puesto["codigo"]
        bici = self.buscar(codigo)
        piezas_desde_tope = list(self.puesto["pila"].recorrer_desde_tope())
        piezas_fondo_a_tope = list(reversed(piezas_desde_tope))

        bici.pila_guardada = self.puesto["pila"]   # misma referencia: 0 transferencias
        bici.motivo_suspension = motivo
        bici.estado = "ESPERA_REPUESTO"
        self.cola_espera.encolar(codigo)
        self.puesto = None
        self.ordenes_suspendidas += 1
        return (
            f"{codigo} -> ESPERA_REPUESTO | piezas guardadas: {piezas_fondo_a_tope} (fondo -> tope)\n"
            f"  puesto de trabajo liberado"
        )

    def reanudar(self, codigo):
        bici = self.buscar(codigo)
        if bici is None or bici.estado != "ESPERA_REPUESTO":
            return f"RECHAZADA: {codigo} no esta en espera de repuesto"
        extraido = self.cola_espera.extraer(lambda c: c == codigo)
        if extraido is None:
            return f"RECHAZADA: {codigo} no esta en la cola de repuestos"
        bici.estado = "EN_TALLER"
        bici.turno_ingreso = self._turno
        self.cola_taller.encolar(codigo)
        return f"{codigo} vuelve al final de la cola del taller | pila conservada (se restaura intacta al iniciar)"

    # ---- RF-08 --------------------------------------------------------
    def cerrar_orden(self):
        if self.puesto is None:
            return "RECHAZADA: no hay bicicleta en el puesto de trabajo"
        pila = self.puesto["pila"]
        codigo = self.puesto["codigo"]
        if not pila.esta_vacia():
            self.ordenes_rechazadas += 1
            return f"RECHAZADA (R6): quedan piezas sin montar en {codigo}, la bicicleta quedaria incompleta"

        bici = self.buscar(codigo)
        bici.reparaciones += 1
        self.puesto = None
        self.ordenes_cerradas += 1

        if bici.reparaciones >= REPARACIONES_PARA_BAJA:
            bici.estado = "DE_BAJA"
            self.flota.eliminar(lambda b: b.codigo == codigo)
            self.bajas.agregar_al_final(bici)
            return (
                f"CERRADA {codigo} | reparaciones = {bici.reparaciones} -> "
                f"R7: {codigo} pasa a DE_BAJA (retirada de la flota activa)"
            )
        bici.estado = "OPERATIVA"
        return f"CERRADA {codigo} | reparaciones = {bici.reparaciones} -> OPERATIVA"

    # ---- RF-09 --------------------------------------------------------
    def reporte(self):
        return generar_reporte(
            self.flota,
            self.bajas,
            self.cola_taller,
            self.cola_espera,
            self.tiempos_espera,
            self.ordenes_cerradas,
            self.ordenes_suspendidas,
            self.ordenes_rechazadas,
        )
