"""
Orquestador del caso: CuraduriaTramites. Usa las entidades (Folio,
Expediente) y las estructuras propias (Cola, Pila) para implementar
RF-01..RF-08 y las reglas R1-R7. No define datos de dominio propios (eso
vive en entidades.py) ni el armado del reporte (eso vive en reportes.py).
"""

from estructuras import Cola
from entidades import DEPENDENCIAS, Expediente
from reportes import generar_reporte


class CuraduriaTramites:
    def __init__(self, capacidad_bandeja=20, plazo_dias=45):
        self.capacidad_bandeja = capacidad_bandeja
        self.plazo_dias = plazo_dias
        # Una cola por dependencia (bandeja de entrada). No es una sola cola
        # global: cada dependencia atiende su propio orden de llegada.
        self.bandejas = {dep: Cola(capacidad=capacidad_bandeja) for dep in DEPENDENCIAS}
        self.represamiento = Cola()  # cola general (R7), sin limite de capacidad
        # Indice radicado->expediente: es una ayuda de busqueda, no reemplaza
        # ninguna de las tres estructuras exigidas (esas son folios y ruta,
        # que viven dentro de cada Expediente, y las bandejas de arriba).
        self.expedientes = {}
        self.archivados = []
        self._contador_radicado = 0
        self.devoluciones_por_dependencia = {dep: 0 for dep in DEPENDENCIAS}

    def buscar_expediente(self, radicado):
        expediente = self.expedientes.get(radicado)
        if expediente is None:
            raise ValueError(f"el expediente {radicado} no existe")
        return expediente

    def radicar(self, solicitante, dia):
        self._contador_radicado += 1
        radicado = f"11001-2026-{self._contador_radicado:04d}"
        expediente = Expediente(radicado, solicitante, dia)
        expediente.ruta.apilar(DEPENDENCIAS[0])
        expediente.agregar_folio("solicitud")
        self.bandejas[DEPENDENCIAS[0]].encolar(expediente)
        self.expedientes[radicado] = expediente
        return expediente

    def agregar_folio(self, radicado, descripcion):
        return self.buscar_expediente(radicado).agregar_folio(descripcion)

    def anular_folio(self, radicado, numero):
        return self.buscar_expediente(radicado).anular_folio(numero)

    def atender_siguiente(self, dependencia):
        cola = self.bandejas[dependencia]
        if cola.esta_vacia():
            raise ValueError(f"la bandeja {dependencia} esta vacia")
        expediente = cola.desencolar()
        self._intentar_liberar_represado(dependencia)
        return expediente

    def _encolar_en(self, dependencia, expediente):
        cola = self.bandejas[dependencia]
        if cola.esta_llena():
            self.represamiento.encolar((expediente, dependencia))
            return False
        cola.encolar(expediente)
        return True

    def _intentar_liberar_represado(self, dependencia_liberada):
        # R7: represar es una sola cola general. Solo miramos su FRENTE (no
        # se reordena): si el expediente que mas tiempo lleva esperando iba
        # justo para la dependencia que acaba de liberar un cupo, entra.
        if self.represamiento.esta_vacia():
            return
        expediente, destino = self.represamiento.frente()
        if destino == dependencia_liberada and not self.bandejas[destino].esta_llena():
            self.represamiento.desencolar()
            self.bandejas[destino].encolar(expediente)

    def _quitar_de_bandeja_actual(self, expediente):
        # Si el expediente fue tomado con atender_siguiente() ya no esta en
        # ninguna bandeja y esto no hace nada. Si en cambio avanzar/devolver
        # se invoca directamente sobre un radicado que sigue esperando en su
        # bandeja (sin pasar por ATENDER), lo sacamos de ahi para no dejar
        # una copia fantasma. remover() es O(n); ver comentario en Cola.
        dependencia_previa = expediente.dependencia
        self.bandejas[dependencia_previa].remover(lambda e: e.radicado == expediente.radicado)

    def avanzar(self, radicado):
        expediente = self.buscar_expediente(radicado)
        indice = DEPENDENCIAS.index(expediente.dependencia)
        if indice >= len(DEPENDENCIAS) - 1:
            raise ValueError(f"{radicado} ya esta en {expediente.dependencia}, no hay siguiente dependencia")
        destino = DEPENDENCIAS[indice + 1]  # R1: el orden es fijo, no se puede saltar
        if destino == "RESOLUCION" and expediente.folios_vigentes() < 4:
            raise ValueError(
                f"RECHAZADO (R5): {radicado} tiene {expediente.folios_vigentes()} "
                "folios vigentes, se requieren 4"
            )
        self._quitar_de_bandeja_actual(expediente)
        expediente.dependencia = destino
        expediente.ruta.apilar(destino)
        encolado = self._encolar_en(destino, expediente)
        return destino, encolado

    def devolver(self, radicado, observacion):
        expediente = self.buscar_expediente(radicado)
        if len(expediente.ruta) <= 1:
            raise ValueError(f"RECHAZADO (R2): {radicado} esta en RECEPCION, no se puede devolver")
        self._quitar_de_bandeja_actual(expediente)
        # R2: la dependencia anterior se calcula CONSULTANDO LA PILA de ruta,
        # nunca con un indice o un if por dependencia.
        actual = expediente.ruta.desapilar()
        anterior = expediente.ruta.tope()
        expediente.dependencia = anterior
        expediente.devoluciones += 1
        self.devoluciones_por_dependencia[actual] += 1
        if expediente.devoluciones >= 3:
            self.archivados.append(expediente)  # R3: archivado por desistimiento
            del self.expedientes[radicado]
            return actual, anterior, True
        self._encolar_en(anterior, expediente)
        return actual, anterior, False

    def reporte(self, dia_actual):
        return generar_reporte(self, dia_actual)
