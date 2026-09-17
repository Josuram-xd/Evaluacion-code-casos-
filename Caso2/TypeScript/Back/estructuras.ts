/**
 * Estructuras de datos propias para CentralAscensores.
 *
 * Nada de Array como almacenamiento de estas tres estructuras: cada una
 * se arma con nodos enlazados por punteros (this.siguiente), que es lo
 * que permite O(1) en los extremos correctos.
 */

class Nodo<T> {
  dato: T;
  siguiente: Nodo<T> | null = null;
  constructor(dato: T) {
    this.dato = dato;
  }
}

/** Lista enlazada simple con cabeza y cola: altas en cualquier momento,
 * sin orden de llegada ni de apilamiento, recorrido completo para reportes. */
export class Lista<T> {
  private cabeza: Nodo<T> | null = null;
  private cola: Nodo<T> | null = null;
  private tamano = 0;

  agregar(dato: T): void {
    const nodo = new Nodo(dato);
    if (this.cabeza === null) {
      this.cabeza = nodo;
      this.cola = nodo;
    } else {
      this.cola!.siguiente = nodo;
      this.cola = nodo;
    }
    this.tamano++;
  }

  buscar(predicado: (dato: T) => boolean): T | null {
    let actual = this.cabeza;
    while (actual !== null) {
      if (predicado(actual.dato)) return actual.dato;
      actual = actual.siguiente;
    }
    return null;
  }

  *recorrer(): Generator<T> {
    let actual = this.cabeza;
    while (actual !== null) {
      yield actual.dato;
      actual = actual.siguiente;
    }
  }

  get length(): number {
    return this.tamano;
  }
}

/** Cola FIFO: encolar/desencolar en O(1), desencolar solo mueve la cabeza. */
export class Cola<T> {
  private cabeza: Nodo<T> | null = null;
  private cola: Nodo<T> | null = null;
  private tamano = 0;

  encolar(dato: T): void {
    const nodo = new Nodo(dato);
    if (this.cola === null) {
      this.cabeza = nodo;
      this.cola = nodo;
    } else {
      this.cola.siguiente = nodo;
      this.cola = nodo;
    }
    this.tamano++;
  }

  desencolar(): T {
    if (this.cabeza === null) throw new Error("cola vacia");
    const nodo = this.cabeza;
    this.cabeza = nodo.siguiente;
    if (this.cabeza === null) this.cola = null;
    this.tamano--;
    return nodo.dato;
  }

  vacia(): boolean {
    return this.cabeza === null;
  }

  get length(): number {
    return this.tamano;
  }
}

/** Pila LIFO: push/pop/tope en O(1), solo se toca la cabeza. */
export class Pila<T> {
  private tope_: Nodo<T> | null = null;
  private tamano = 0;

  apilar(dato: T): void {
    const nodo = new Nodo(dato);
    nodo.siguiente = this.tope_;
    this.tope_ = nodo;
    this.tamano++;
  }

  desapilar(): T {
    if (this.tope_ === null) throw new Error("pila vacia");
    const nodo = this.tope_;
    this.tope_ = nodo.siguiente;
    this.tamano--;
    return nodo.dato;
  }

  tope(): T {
    if (this.tope_ === null) throw new Error("pila vacia");
    return this.tope_.dato;
  }

  vacia(): boolean {
    return this.tope_ === null;
  }

  get length(): number {
    return this.tamano;
  }
}
