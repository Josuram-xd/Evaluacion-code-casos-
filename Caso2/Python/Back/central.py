"""
Logica de negocio (orquestacion) de CentralAscensores.

Ver ../../Caso_Estudio_2.pdf para el enunciado completo. Aqui se
implementan las reglas R1-R7 y los requerimientos RF-01..RF-08 usando
las estructuras propias de estructuras.py y las entidades de
entidades.py. El armado del texto de reporte() vive en reportes.py.
"""

from __future__ import annotations
from typing import Optional

from estructuras import Lista, Cola, Pila
from entidades import (
    Ascensor,
    Llamada,
    RechazoOperacion,
    PROTOCOLO,
    TOTAL_PASOS,
    OBJETIVO_MINUTOS,
    LIMITE_EMERGENCIAS_ANTES_DE_MANTENIMIENTO,
    EMERGENCIAS_PARA_FUERA_DE_SERVICIO,
)
from reportes import generar_reporte


class CentralAscensores:
    def __init__(self):
        self.parque = Lista()
        self.cola_emergencia = Cola()
        self.cola_mantenimiento = Cola()
        self.pila_protocolo: Optional[Pila] = None
        self.llamada_actual: Optional[Llamada] = None
        self.ascensor_actual: Optional[Ascensor] = None
        # R1: cuenta emergencias atendidas seguidas desde el ultimo
        # mantenimiento atendido; al llegar a 4 se fuerza el siguiente
        # mantenimiento en espera antes de seguir con emergencias.
        self.contador_emergencias_consecutivas = 0

        # metricas para reporte()
        self.atendidas = {"EMERGENCIA": 0, "MANTENIMIENTO": 0}
        self.tiempos_respuesta = {"EMERGENCIA": [], "MANTENIMIENTO": []}
        self.cumplimiento = {"EMERGENCIA": [], "MANTENIMIENTO": []}
        self.completados = 0
        self.abortados = []
        self.rechazadas_duplicado = 0
        self.rechazadas_fuera_servicio = 0
        self.pasaron_fuera_de_servicio = []

    # ---- RF-01 ----
    def cargar_parque(self, filas) -> None:
        for codigo, edificio, estado, emergencias in filas:
            if self.parque.buscar(lambda a: a.codigo == codigo) is not None:
                raise RechazoOperacion(f"codigo duplicado en el parque: {codigo}")
            self.parque.agregar(Ascensor(codigo, edificio, estado, int(emergencias)))

    def _buscar_ascensor(self, codigo: str) -> Ascensor:
        ascensor = self.parque.buscar(lambda a: a.codigo == codigo)
        if ascensor is None:
            raise RechazoOperacion(f"el ascensor {codigo} no existe")
        return ascensor

    # ---- RF-02 ----
    def registrar_llamada(self, codigo: str, tipo: str, minuto: int) -> str:
        ascensor = self._buscar_ascensor(codigo)
        if ascensor.estado == "FUERA_DE_SERVICIO":
            self.rechazadas_fuera_servicio += 1
            raise RechazoOperacion("(R7): el ascensor esta fuera de servicio")
        if ascensor.activa:
            self.rechazadas_duplicado += 1
            raise RechazoOperacion("(R2): el ascensor ya tiene una llamada activa")

        llamada = Llamada(codigo, tipo, minuto)
        ascensor.activa = True
        if tipo == "EMERGENCIA":
            self.cola_emergencia.encolar(llamada)
        else:
            self.cola_mantenimiento.encolar(llamada)
        return f"{codigo} en cola de {tipo}"

    # ---- RF-03 ----
    def atender_siguiente(self, minuto_actual: int) -> str:
        # R1: prioridad a emergencias, salvo que ya se hayan atendido 4
        # seguidas y haya un mantenimiento esperando -> se fuerza ese
        # mantenimiento aunque haya emergencias en cola, y se reinicia
        # el contador. La eleccion es SIEMPRE "de que cola se desencola",
        # nunca se reordena nada dentro de una cola.
        forzar_mantenimiento = (
            self.contador_emergencias_consecutivas >= LIMITE_EMERGENCIAS_ANTES_DE_MANTENIMIENTO
            and not self.cola_mantenimiento.vacia()
        )
        if forzar_mantenimiento:
            llamada = self.cola_mantenimiento.desencolar()
            self.contador_emergencias_consecutivas = 0
        elif not self.cola_emergencia.vacia():
            llamada = self.cola_emergencia.desencolar()
            self.contador_emergencias_consecutivas += 1
        elif not self.cola_mantenimiento.vacia():
            llamada = self.cola_mantenimiento.desencolar()
            self.contador_emergencias_consecutivas = 0
        else:
            raise RechazoOperacion("no hay llamadas en espera en ninguna cola")

        ascensor = self._buscar_ascensor(llamada.codigo)
        ascensor.estado = "EN_ATENCION"
        llamada.minuto_atencion = minuto_actual
        self.llamada_actual = llamada
        self.ascensor_actual = ascensor
        self.pila_protocolo = Pila()

        espera = minuto_actual - llamada.minuto_llamada
        objetivo = OBJETIVO_MINUTOS[llamada.tipo]
        cumple = espera <= objetivo
        self.tiempos_respuesta[llamada.tipo].append(espera)
        self.cumplimiento[llamada.tipo].append(cumple)

        return (
            f"{ascensor.codigo} | {llamada.tipo} | espera {espera} min -> "
            f"{'CUMPLE' if cumple else 'INCUMPLE'} (objetivo {objetivo})"
        )

    def _exigir_llamada_en_curso(self) -> None:
        if self.llamada_actual is None:
            raise RechazoOperacion("no hay ninguna llamada en atencion en este momento")

    # ---- RF-04 ----
    def ejecutar_paso(self, n: int) -> str:
        self._exigir_llamada_en_curso()
        if self.llamada_actual.tipo != "EMERGENCIA":
            raise RechazoOperacion("el protocolo de rescate solo aplica a emergencias")
        # R3: el paso valido siguiente se decide consultando el TOPE de
        # la pila (no un contador aparte de "ultimo paso ejecutado").
        esperado = 1 if self.pila_protocolo.vacia() else self.pila_protocolo.tope()[0] + 1
        if n != esperado:
            raise RechazoOperacion(
                f"(R3): el tope de la pila es el paso {esperado - 1}, "
                f"se esperaba ejecutar el paso {esperado}"
            )
        directa, inversa = PROTOCOLO[n]
        self.pila_protocolo.apilar((n, directa, inversa))
        return f"paso {n} ejecutado -> {directa}"

    # ---- RF-05 ----
    def deshacer_ultimo(self) -> str:
        self._exigir_llamada_en_curso()
        if self.pila_protocolo.vacia():
            raise RechazoOperacion("la pila del protocolo esta vacia, no hay nada que deshacer")
        n, _, inversa = self.pila_protocolo.desapilar()
        return f"deshacer paso {n} -> {inversa}"

    # ---- RF-06 ----
    def abortar_rescate(self, motivo: str) -> list[str]:
        self._exigir_llamada_en_curso()
        lineas = []
        while not self.pila_protocolo.vacia():
            n, _, inversa = self.pila_protocolo.desapilar()
            lineas.append(f"deshacer paso {n} -> {inversa}")
        self.ascensor_actual.estado = "OPERATIVO"
        self.ascensor_actual.activa = False
        self.abortados.append(motivo)
        lineas.append("pila vacia -> llamada cerrada como ABORTADA, ascensor OPERATIVO")
        self._liberar_puesto()
        return lineas

    # ---- RF-07 ----
    def cerrar_llamada(self) -> str:
        self._exigir_llamada_en_curso()
        llamada, ascensor = self.llamada_actual, self.ascensor_actual

        if llamada.tipo == "EMERGENCIA":
            if len(self.pila_protocolo) != TOTAL_PASOS:
                raise RechazoOperacion(
                    f"(R5): el protocolo tiene {len(self.pila_protocolo)} de "
                    f"{TOTAL_PASOS} pasos, no se puede cerrar"
                )
            ascensor.emergencias += 1
            if ascensor.emergencias >= EMERGENCIAS_PARA_FUERA_DE_SERVICIO:
                ascensor.estado = "FUERA_DE_SERVICIO"
                self.pasaron_fuera_de_servicio.append(ascensor.codigo)
                mensaje = (
                    f"emergencias = {ascensor.emergencias} -> (R7): "
                    f"{ascensor.codigo} pasa a FUERA_DE_SERVICIO"
                )
            else:
                ascensor.estado = "OPERATIVO"
                mensaje = f"{ascensor.codigo} cerrada con exito, vuelve a OPERATIVO"
        else:
            ascensor.estado = "OPERATIVO"
            mensaje = f"{ascensor.codigo} (mantenimiento) cerrada, vuelve a OPERATIVO"

        ascensor.activa = False
        self.atendidas[llamada.tipo] += 1
        if llamada.tipo == "EMERGENCIA":
            self.completados += 1
        self._liberar_puesto()
        return mensaje

    def _liberar_puesto(self) -> None:
        self.llamada_actual = None
        self.ascensor_actual = None
        self.pila_protocolo = None

    # ---- RF-08 ----
    def reporte(self) -> str:
        return generar_reporte(self)
