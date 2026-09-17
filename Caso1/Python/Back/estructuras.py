"""
Estructuras de datos propias para BiciTaller: lista enlazada, cola y pila.

Ninguna usa `list`, `collections.deque` ni otra colección de la librería
estándar como almacenamiento interno: todo se resuelve con nodos enlazados
a mano, que es justo lo que exige el enunciado.
"""


class _Nodo:
    __slots__ = ("valor", "siguiente")

    def __init__(self, valor):
        self.valor = valor
        self.siguiente = None


class ListaEnlazada:
    """
    Lista simplemente enlazada de propósito general.

    Se usa para la flota: hay altas y bajas en cualquier posición y se
    recorre completa para generar reportes, pero no hay orden de llegada
    ni de apilamiento -> ni una cola ni una pila modelan esto.
    """

    def __init__(self):
        self._cabeza = None
        self._tamano = 0

    def __len__(self):
        return self._tamano

    def insertar_ordenado(self, valor, clave):
        """Inserta manteniendo la lista ordenada según clave(valor). O(n)."""
        nuevo = _Nodo(valor)
        if self._cabeza is None or clave(valor) < clave(self._cabeza.valor):
            nuevo.siguiente = self._cabeza
            self._cabeza = nuevo
        else:
            actual = self._cabeza
            while actual.siguiente is not None and clave(actual.siguiente.valor) < clave(valor):
                actual = actual.siguiente
            nuevo.siguiente = actual.siguiente
            actual.siguiente = nuevo
        self._tamano += 1

    def agregar_al_final(self, valor):
        """O(n): solo se usa para listas pequeñas (ej. bajas) donde no importa el costo."""
        nuevo = _Nodo(valor)
        if self._cabeza is None:
            self._cabeza = nuevo
        else:
            actual = self._cabeza
            while actual.siguiente is not None:
                actual = actual.siguiente
            actual.siguiente = nuevo
        self._tamano += 1

    def buscar(self, predicado):
        """Devuelve el primer valor que cumple predicado(valor), o None. O(n)."""
        actual = self._cabeza
        while actual is not None:
            if predicado(actual.valor):
                return actual.valor
            actual = actual.siguiente
        return None

    def eliminar(self, predicado):
        """Elimina y devuelve el primer valor que cumple predicado. O(n)."""
        anterior = None
        actual = self._cabeza
        while actual is not None:
            if predicado(actual.valor):
                if anterior is None:
                    self._cabeza = actual.siguiente
                else:
                    anterior.siguiente = actual.siguiente
                self._tamano -= 1
                return actual.valor
            anterior = actual
            actual = actual.siguiente
        return None

    def recorrer(self):
        """Genera los valores en orden (de cabeza a cola). O(n)."""
        actual = self._cabeza
        while actual is not None:
            yield actual.valor
            actual = actual.siguiente


class Cola:
    """
    Cola FIFO con punteros a frente y a final: encolar/desencolar son O(1)
    porque nunca se recorre ni desplaza el resto de los elementos.
    """

    def __init__(self):
        self._frente = None
        self._final = None
        self._tamano = 0

    def __len__(self):
        return self._tamano

    def esta_vacia(self):
        return self._tamano == 0

    def encolar(self, valor):
        nodo = _Nodo(valor)
        if self._final is None:
            self._frente = nodo
        else:
            self._final.siguiente = nodo
        self._final = nodo
        self._tamano += 1

    def desencolar(self):
        if self._frente is None:
            raise IndexError("cola vacia")
        nodo = self._frente
        self._frente = nodo.siguiente
        if self._frente is None:
            self._final = None
        self._tamano -= 1
        return nodo.valor

    def ver_frente(self):
        if self._frente is None:
            raise IndexError("cola vacia")
        return self._frente.valor

    def extraer(self, predicado):
        """
        Quita el primer elemento que cumple predicado, sin importar su
        posición (lo usa REANUDAR para sacar una bicicleta puntual de la
        cola de espera de repuestos). A propósito NO es O(1): es una
        operación distinta de desencolar(), que sigue siendo O(1) y es la
        única exigida por el enunciado a ese costo.
        """
        anterior = None
        actual = self._frente
        while actual is not None:
            if predicado(actual.valor):
                if anterior is None:
                    self._frente = actual.siguiente
                else:
                    anterior.siguiente = actual.siguiente
                if actual is self._final:
                    self._final = anterior
                self._tamano -= 1
                return actual.valor
            anterior = actual
            actual = actual.siguiente
        return None

    def recorrer(self):
        actual = self._frente
        while actual is not None:
            yield actual.valor
            actual = actual.siguiente


class Pila:
    """
    Pila LIFO con puntero al tope: apilar/desapilar son O(1).
    """

    def __init__(self):
        self._tope = None
        self._tamano = 0

    def __len__(self):
        return self._tamano

    def esta_vacia(self):
        return self._tamano == 0

    def apilar(self, valor):
        nodo = _Nodo(valor)
        nodo.siguiente = self._tope
        self._tope = nodo
        self._tamano += 1

    def desapilar(self):
        if self._tope is None:
            raise IndexError("pila vacia")
        nodo = self._tope
        self._tope = nodo.siguiente
        self._tamano -= 1
        return nodo.valor

    def ver_tope(self):
        if self._tope is None:
            raise IndexError("pila vacia")
        return self._tope.valor

    def recorrer_desde_tope(self):
        """Genera los valores empezando por el tope. O(n)."""
        actual = self._tope
        while actual is not None:
            yield actual.valor
            actual = actual.siguiente
