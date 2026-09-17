"""
Entidades del caso: Folio y Expediente. Solo datos y comportamiento propio
de un expediente individual (sus folios, su ruta). La orquestacion entre
expedientes (bandejas por dependencia, represamiento, reglas R1-R7) vive en
servicio.py, no aqui.
"""

from estructuras import Pila, Lista

DEPENDENCIAS = ["RECEPCION", "JURIDICA", "TECNICA", "URBANISTICA", "RESOLUCION"]


class Folio:
    def __init__(self, numero, descripcion):
        self.numero = numero
        self.descripcion = descripcion
        self.estado = "VIGENTE"


class Expediente:
    """Cada expediente tiene su PROPIA lista de folios y su PROPIA pila de
    ruta (R4 y R2 son reglas por-expediente, no globales)."""

    def __init__(self, radicado, solicitante, dia_radicacion):
        self.radicado = radicado
        self.solicitante = solicitante
        self.dia_radicacion = dia_radicacion
        self.dependencia = DEPENDENCIAS[0]
        self.devoluciones = 0
        self.folios = Lista()
        self.ruta = Pila()
        self._siguiente_folio = 1

    def agregar_folio(self, descripcion):
        # self._siguiente_folio es el contador de consecutivo (R4): nunca se
        # reutiliza aunque haya folios anulados. Lista.agregar() es O(1).
        folio = Folio(self._siguiente_folio, descripcion)
        self._siguiente_folio += 1
        self.folios.agregar(folio)
        return folio

    def anular_folio(self, numero):
        folio = self.folios.buscar(lambda f: f.numero == numero)
        if folio is None:
            raise ValueError(f"el folio {numero} no existe en {self.radicado}")
        if folio.estado == "ANULADO":
            raise ValueError(f"el folio {numero} ya estaba anulado")
        folio.estado = "ANULADO"  # R4: se marca, no se elimina ni renumera
        return folio

    def folios_vigentes(self):
        return sum(1 for f in self.folios if f.estado == "VIGENTE")

    def ruta_actual(self):
        """Devuelve la ruta recorrida (bottom->top) SIN destruir la pila.

        Se vacia la pila hacia una auxiliar y luego se reconstruye desde la
        auxiliar: al terminar, self.ruta queda identica a como estaba antes
        de llamar este metodo. Costo O(n) en tiempo (dos pasadas) y O(n) en
        espacio auxiliar, con n = pasos recorridos.
        """
        auxiliar = Pila()
        while not self.ruta.esta_vacia():
            auxiliar.apilar(self.ruta.desapilar())
        recorrido = []
        while not auxiliar.esta_vacia():
            valor = auxiliar.desapilar()
            recorrido.append(valor)
            self.ruta.apilar(valor)
        return recorrido
