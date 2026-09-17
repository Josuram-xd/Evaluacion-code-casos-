/**
 * Estructuras de datos propias para BiciTaller: lista enlazada, cola y pila.
 *
 * Ninguna usa Array como almacenamiento interno: todo se resuelve con nodos
 * enlazados a mano (propiedad `siguiente`), que es justo lo que exige el
 * enunciado en vez de apoyarse en las colecciones del lenguaje.
 */

class Nodo<T> {
  siguiente: Nodo<T> | null = null;
  constructor(public valor: T) {}
}

/**
 * Lista simplemente enlazada de propósito general.
 *
 * Se usa para la flota: hay altas y bajas en cualquier posición y se
 * recorre completa para generar reportes, pero no hay orden de llegada ni
 * de apilamiento -> ni una cola ni una pila modelan esto.
 */
export class ListaEnlazada<T> {
  private cabeza: Nodo<T> | null = null;
  private tamano = 0;

  get length(): number {
    return this.tamano;
  }

  /** Inserta manteniendo la lista ordenada según clave(valor). O(n). */
  insertarOrdenado(valor: T, clave: (v: T) => string): void {
    const nuevo = new Nodo(valor);
    if (this.cabeza === null || clave(valor) < clave(this.cabeza.valor)) {
      nuevo.siguiente = this.cabeza;
      this.cabeza = nuevo;
      this.tamano++;
      return;
    }
    let actual = this.cabeza;
    while (actual.siguiente !== null && clave(actual.siguiente.valor) < clave(valor)) {
      actual = actual.siguiente;
    }
    nuevo.siguiente = actual.siguiente;
    actual.siguiente = nuevo;
    this.tamano++;
  }

  /** O(n): solo se usa para listas pequeñas (ej. bajas) donde no importa el costo. */
  agregarAlFinal(valor: T): void {
    const nuevo = new Nodo(valor);
    if (this.cabeza === null) {
      this.cabeza = nuevo;
    } else {
      let actual = this.cabeza;
      while (actual.siguiente !== null) actual = actual.siguiente;
      actual.siguiente = nuevo;
    }
    this.tamano++;
  }

  /** Devuelve el primer valor que cumple predicado(valor), o null. O(n). */
  buscar(predicado: (v: T) => boolean): T | null {
    let actual = this.cabeza;
    while (actual !== null) {
      if (predicado(actual.valor)) return actual.valor;
      actual = actual.siguiente;
    }
    return null;
  }

  /** Elimina y devuelve el primer valor que cumple predicado. O(n). */
  eliminar(predicado: (v: T) => boolean): T | null {
    let anterior: Nodo<T> | null = null;
    let actual = this.cabeza;
    while (actual !== null) {
      if (predicado(actual.valor)) {
        if (anterior === null) this.cabeza = actual.siguiente;
        else anterior.siguiente = actual.siguiente;
        this.tamano--;
        return actual.valor;
      }
      anterior = actual;
      actual = actual.siguiente;
    }
    return null;
  }

  /** Recorre los valores en orden (de cabeza a cola). O(n). */
  *recorrer(): IterableIterator<T> {
    let actual = this.cabeza;
    while (actual !== null) {
      yield actual.valor;
      actual = actual.siguiente;
    }
  }
}

/**
 * Cola FIFO con punteros a frente y a final: encolar/desencolar son O(1)
 * porque nunca se recorre ni desplaza el resto de los elementos.
 */
export class Cola<T> {
  private frente: Nodo<T> | null = null;
  private final: Nodo<T> | null = null;
  private tamano = 0;

  get length(): number {
    return this.tamano;
  }

  estaVacia(): boolean {
    return this.tamano === 0;
  }

  encolar(valor: T): void {
    const nodo = new Nodo(valor);
    if (this.final === null) this.frente = nodo;
    else this.final.siguiente = nodo;
    this.final = nodo;
    this.tamano++;
  }

  desencolar(): T {
    if (this.frente === null) throw new Error("cola vacia");
    const nodo = this.frente;
    this.frente = nodo.siguiente;
    if (this.frente === null) this.final = null;
    this.tamano--;
    return nodo.valor;
  }

  verFrente(): T {
    if (this.frente === null) throw new Error("cola vacia");
    return this.frente.valor;
  }

  /**
   * Quita el primer elemento que cumple predicado, sin importar su
   * posición (lo usa reanudar() para sacar una bicicleta puntual de la
   * cola de espera de repuestos). A propósito NO es O(1): es una
   * operación distinta de desencolar(), que sigue siendo O(1) y es la
   * única exigida por el enunciado a ese costo.
   */
  extraer(predicado: (v: T) => boolean): T | null {
    let anterior: Nodo<T> | null = null;
    let actual = this.frente;
    while (actual !== null) {
      if (predicado(actual.valor)) {
        if (anterior === null) this.frente = actual.siguiente;
        else anterior.siguiente = actual.siguiente;
        if (actual === this.final) this.final = anterior;
        this.tamano--;
        return actual.valor;
      }
      anterior = actual;
      actual = actual.siguiente;
    }
    return null;
  }
}

/**
 * Pila LIFO con puntero al tope: apilar/desapilar son O(1).
 */
export class Pila<T> {
  private tope: Nodo<T> | null = null;
  private tamano = 0;

  get length(): number {
    return this.tamano;
  }

  estaVacia(): boolean {
    return this.tamano === 0;
  }

  apilar(valor: T): void {
    const nodo = new Nodo(valor);
    nodo.siguiente = this.tope;
    this.tope = nodo;
    this.tamano++;
  }

  desapilar(): T {
    if (this.tope === null) throw new Error("pila vacia");
    const nodo = this.tope;
    this.tope = nodo.siguiente;
    this.tamano--;
    return nodo.valor;
  }

  verTope(): T {
    if (this.tope === null) throw new Error("pila vacia");
    return this.tope.valor;
  }

  /** Recorre los valores empezando por el tope. O(n). */
  *recorrerDesdeTope(): IterableIterator<T> {
    let actual = this.tope;
    while (actual !== null) {
      yield actual.valor;
      actual = actual.siguiente;
    }
  }
}
