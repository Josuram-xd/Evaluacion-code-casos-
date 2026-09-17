"""
Estructuras propias exigidas por el caso: lista enlazada, cola y pila.
No usan `list`, `collections.deque` ni ninguna colección estándar como
almacenamiento interno; todo se maneja con nodos enlazados a mano.
"""


class ColaVaciaError(Exception):
    pass


class ColaLlenaError(Exception):
    pass


class PilaVaciaError(Exception):
    pass


class _NodoLista:
    __slots__ = ("valor", "siguiente")

    def __init__(self, valor):
        self.valor = valor
        self.siguiente = None


class Lista:
    """Lista enlazada simple. Guarda puntero a cola para que agregar()
    sea O(1) en vez de O(n) (evita recorrer toda la lista cada vez)."""

    def __init__(self):
        self._cabeza = None
        self._cola = None
        self._tamano = 0

    def agregar(self, valor):
        nodo = _NodoLista(valor)
        if self._cola is None:
            self._cabeza = nodo
        else:
            self._cola.siguiente = nodo
        self._cola = nodo
        self._tamano += 1
        return valor

    def buscar(self, predicado):
        actual = self._cabeza
        while actual is not None:
            if predicado(actual.valor):
                return actual.valor
            actual = actual.siguiente
        return None

    def __len__(self):
        return self._tamano

    def __iter__(self):
        actual = self._cabeza
        while actual is not None:
            yield actual.valor
            actual = actual.siguiente


class _NodoCola:
    __slots__ = ("valor", "siguiente")

    def __init__(self, valor):
        self.valor = valor
        self.siguiente = None


class Cola:
    """Cola FIFO con puntero a frente y a final: encolar/desencolar son O(1)
    porque nunca se recorre ni se desplaza el resto de los elementos."""

    def __init__(self, capacidad=None):
        self._frente = None
        self._final = None
        self._tamano = 0
        self.capacidad = capacidad

    def esta_vacia(self):
        return self._tamano == 0

    def esta_llena(self):
        return self.capacidad is not None and self._tamano >= self.capacidad

    def encolar(self, valor):
        if self.esta_llena():
            raise ColaLlenaError("la cola alcanzo su capacidad maxima")
        nodo = _NodoCola(valor)
        if self._final is None:
            self._frente = nodo
        else:
            self._final.siguiente = nodo
        self._final = nodo
        self._tamano += 1

    def desencolar(self):
        if self.esta_vacia():
            raise ColaVaciaError("la cola esta vacia")
        nodo = self._frente
        self._frente = nodo.siguiente
        if self._frente is None:
            self._final = None
        self._tamano -= 1
        return nodo.valor

    def frente(self):
        if self.esta_vacia():
            raise ColaVaciaError("la cola esta vacia")
        return self._frente.valor

    def remover(self, predicado):
        """Quita el primer elemento que cumpla `predicado`, sin importar su
        posicion. A diferencia de desencolar() (O(1), siempre por el frente),
        esto es O(n) porque hay que recorrer para encontrarlo y reconectar
        los punteros. Se usa solo cuando una accion (avanzar/devolver) actua
        directamente sobre un elemento por su identidad, no por orden FIFO.
        Devuelve el valor removido, o None si no estaba en la cola."""
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

    def __len__(self):
        return self._tamano


class _NodoPila:
    __slots__ = ("valor", "anterior")

    def __init__(self, valor):
        self.valor = valor
        self.anterior = None


class Pila:
    """Pila LIFO con puntero al tope: apilar/desapilar son O(1)."""

    def __init__(self):
        self._tope = None
        self._tamano = 0

    def esta_vacia(self):
        return self._tamano == 0

    def apilar(self, valor):
        nodo = _NodoPila(valor)
        nodo.anterior = self._tope
        self._tope = nodo
        self._tamano += 1

    def desapilar(self):
        if self.esta_vacia():
            raise PilaVaciaError("la pila esta vacia")
        nodo = self._tope
        self._tope = nodo.anterior
        self._tamano -= 1
        return nodo.valor

    def tope(self):
        if self.esta_vacia():
            raise PilaVaciaError("la pila esta vacia")
        return self._tope.valor

    def __len__(self):
        return self._tamano
