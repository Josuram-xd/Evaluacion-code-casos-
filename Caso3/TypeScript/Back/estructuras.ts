/**
 * Estructuras propias exigidas por el caso: lista enlazada, cola y pila.
 * No usan `Array` como almacenamiento interno; todo se maneja con nodos
 * enlazados a mano (igual que en la version Python de este mismo caso).
 */

export class ColaVaciaError extends Error {}
export class ColaLlenaError extends Error {}
export class PilaVaciaError extends Error {}

class NodoLista<T> {
  siguiente: NodoLista<T> | null = null;
  constructor(public valor: T) {}
}

/** Lista enlazada simple. Guarda puntero a cola para que agregar() sea
 * O(1) en vez de O(n) (evita recorrer toda la lista cada vez). */
export class Lista<T> implements Iterable<T> {
  private cabeza: NodoLista<T> | null = null;
  private cola: NodoLista<T> | null = null;
  private tamano = 0;

  agregar(valor: T): T {
    const nodo = new NodoLista(valor);
    if (this.cola === null) {
      this.cabeza = nodo;
    } else {
      this.cola.siguiente = nodo;
    }
    this.cola = nodo;
    this.tamano += 1;
    return valor;
  }

  buscar(predicado: (valor: T) => boolean): T | null {
    let actual = this.cabeza;
    while (actual !== null) {
      if (predicado(actual.valor)) return actual.valor;
      actual = actual.siguiente;
    }
    return null;
  }

  get longitud(): number {
    return this.tamano;
  }

  [Symbol.iterator](): Iterator<T> {
    let actual = this.cabeza;
    return {
      next(): IteratorResult<T> {
        if (actual === null) return { value: undefined, done: true };
        const valor = actual.valor;
        actual = actual.siguiente;
        return { value: valor, done: false };
      },
    };
  }
}

class NodoCola<T> {
  siguiente: NodoCola<T> | null = null;
  constructor(public valor: T) {}
}

/** Cola FIFO con puntero a frente y a final: encolar/desencolar son O(1)
 * porque nunca se recorre ni se desplaza el resto de los elementos. */
export class Cola<T> {
  private frenteNodo: NodoCola<T> | null = null;
  private finalNodo: NodoCola<T> | null = null;
  private tamano = 0;

  constructor(private readonly capacidad: number | null = null) {}

  estaVacia(): boolean {
    return this.tamano === 0;
  }

  estaLlena(): boolean {
    return this.capacidad !== null && this.tamano >= this.capacidad;
  }

  encolar(valor: T): void {
    if (this.estaLlena()) throw new ColaLlenaError("la cola alcanzo su capacidad maxima");
    const nodo = new NodoCola(valor);
    if (this.finalNodo === null) {
      this.frenteNodo = nodo;
    } else {
      this.finalNodo.siguiente = nodo;
    }
    this.finalNodo = nodo;
    this.tamano += 1;
  }

  desencolar(): T {
    if (this.frenteNodo === null) throw new ColaVaciaError("la cola esta vacia");
    const nodo = this.frenteNodo;
    this.frenteNodo = nodo.siguiente;
    if (this.frenteNodo === null) this.finalNodo = null;
    this.tamano -= 1;
    return nodo.valor;
  }

  frente(): T {
    if (this.frenteNodo === null) throw new ColaVaciaError("la cola esta vacia");
    return this.frenteNodo.valor;
  }

  /** Quita el primer elemento que cumpla `predicado`, sin importar su
   * posicion. A diferencia de desencolar() (O(1), siempre por el frente),
   * esto es O(n) porque hay que recorrer para encontrarlo y reconectar los
   * punteros. Se usa solo cuando una accion (avanzar/devolver) actua
   * directamente sobre un elemento por su identidad, no por orden FIFO. */
  remover(predicado: (valor: T) => boolean): T | null {
    let anterior: NodoCola<T> | null = null;
    let actual = this.frenteNodo;
    while (actual !== null) {
      if (predicado(actual.valor)) {
        if (anterior === null) {
          this.frenteNodo = actual.siguiente;
        } else {
          anterior.siguiente = actual.siguiente;
        }
        if (actual === this.finalNodo) this.finalNodo = anterior;
        this.tamano -= 1;
        return actual.valor;
      }
      anterior = actual;
      actual = actual.siguiente;
    }
    return null;
  }

  get longitud(): number {
    return this.tamano;
  }
}

class NodoPila<T> {
  anterior: NodoPila<T> | null = null;
  constructor(public valor: T) {}
}

/** Pila LIFO con puntero al tope: apilar/desapilar son O(1). */
export class Pila<T> {
  private topeNodo: NodoPila<T> | null = null;
  private tamano = 0;

  estaVacia(): boolean {
    return this.tamano === 0;
  }

  apilar(valor: T): void {
    const nodo = new NodoPila(valor);
    nodo.anterior = this.topeNodo;
    this.topeNodo = nodo;
    this.tamano += 1;
  }

  desapilar(): T {
    if (this.topeNodo === null) throw new PilaVaciaError("la pila esta vacia");
    const nodo = this.topeNodo;
    this.topeNodo = nodo.anterior;
    this.tamano -= 1;
    return nodo.valor;
  }

  tope(): T {
    if (this.topeNodo === null) throw new PilaVaciaError("la pila esta vacia");
    return this.topeNodo.valor;
  }

  get longitud(): number {
    return this.tamano;
  }
}
