"""
Estructuras de datos propias para CentralAscensores.

No se usa list, collections.deque ni ninguna coleccion estandar como
almacenamiento de estas tres estructuras: cada una se construye con nodos
enlazados por punteros, que es lo que permite que insertar/quitar en los
extremos correctos sea O(1).
"""

from __future__ import annotations
from typing import Any, Callable, Optional


class _Nodo:
    __slots__ = ("dato", "siguiente")

    def __init__(self, dato: Any):
        self.dato = dato
        self.siguiente: Optional["_Nodo"] = None


class Lista:
    """Lista enlazada simple con cabeza y cola.

    Se usa para el parque de ascensores: hay altas en cualquier momento,
    no hay orden de llegada (no es FIFO) ni de apilamiento (no es LIFO),
    y hay que recorrer todo para los reportes -> ni cola ni pila encajan,
    una lista si.
    """

    def __init__(self):
        self._cabeza: Optional[_Nodo] = None
        self._cola: Optional[_Nodo] = None
        self._tamano = 0

    def agregar(self, dato: Any) -> None:
        nodo = _Nodo(dato)
        if self._cabeza is None:
            self._cabeza = nodo
            self._cola = nodo
        else:
            self._cola.siguiente = nodo
            self._cola = nodo
        self._tamano += 1

    def buscar(self, predicado: Callable[[Any], bool]) -> Optional[Any]:
        actual = self._cabeza
        while actual is not None:
            if predicado(actual.dato):
                return actual.dato
            actual = actual.siguiente
        return None

    def recorrer(self):
        actual = self._cabeza
        while actual is not None:
            yield actual.dato
            actual = actual.siguiente

    def __len__(self) -> int:
        return self._tamano


class Cola:
    """Cola FIFO con cabeza y cola (encolar/desencolar en O(1)).

    Desencolar solo mueve el puntero de cabeza: no recorre ni desplaza
    los elementos restantes.
    """

    def __init__(self):
        self._cabeza: Optional[_Nodo] = None
        self._cola: Optional[_Nodo] = None
        self._tamano = 0

    def encolar(self, dato: Any) -> None:
        nodo = _Nodo(dato)
        if self._cola is None:
            self._cabeza = nodo
            self._cola = nodo
        else:
            self._cola.siguiente = nodo
            self._cola = nodo
        self._tamano += 1

    def desencolar(self) -> Any:
        if self._cabeza is None:
            raise IndexError("cola vacia")
        nodo = self._cabeza
        self._cabeza = nodo.siguiente
        if self._cabeza is None:
            self._cola = None
        self._tamano -= 1
        return nodo.dato

    def vacia(self) -> bool:
        return self._cabeza is None

    def __len__(self) -> int:
        return self._tamano


class Pila:
    """Pila LIFO con push/pop/tope en O(1) (solo se toca la cabeza)."""

    def __init__(self):
        self._tope: Optional[_Nodo] = None
        self._tamano = 0

    def apilar(self, dato: Any) -> None:
        nodo = _Nodo(dato)
        nodo.siguiente = self._tope
        self._tope = nodo
        self._tamano += 1

    def desapilar(self) -> Any:
        if self._tope is None:
            raise IndexError("pila vacia")
        nodo = self._tope
        self._tope = nodo.siguiente
        self._tamano -= 1
        return nodo.dato

    def tope(self) -> Any:
        if self._tope is None:
            raise IndexError("pila vacia")
        return self._tope.dato

    def vacia(self) -> bool:
        return self._tope is None

    def __len__(self) -> int:
        return self._tamano
