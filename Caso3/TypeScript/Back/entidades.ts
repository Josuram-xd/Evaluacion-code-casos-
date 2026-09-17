/**
 * Entidades del caso: Folio y Expediente. Solo datos y comportamiento
 * propio de un expediente individual (sus folios, su ruta). La
 * orquestacion entre expedientes (bandejas por dependencia, represamiento,
 * reglas R1-R7) vive en servicio.ts (curaduria.ts), no aqui.
 Taller-Evaluativo-Caso1/
├── index.html
├── package.json
├── tsconfig.json
└── src/
    ├── data-structures.ts
    ├── kitchen-system.ts
    ├── app.ts
    └── style.css
 */

import { Pila, Lista } from "./estructuras";

export const DEPENDENCIAS = ["RECEPCION", "JURIDICA", "TECNICA", "URBANISTICA", "RESOLUCION"] as const;
export type Dependencia = (typeof DEPENDENCIAS)[number];

export type EstadoFolio = "VIGENTE" | "ANULADO";

export class Folio {
  estado: EstadoFolio = "VIGENTE";
  constructor(public numero: number, public descripcion: string) {}
}

/** Cada expediente tiene su PROPIA lista de folios y su PROPIA pila de
 * ruta (R4 y R2 son reglas por-expediente, no globales). */
export class Expediente {
  dependencia: Dependencia = DEPENDENCIAS[0];
  devoluciones = 0;
  folios = new Lista<Folio>();
  ruta = new Pila<Dependencia>();
  private siguienteFolio = 1;

  constructor(public radicado: string, public solicitante: string, public diaRadicacion: number) {}

  agregarFolio(descripcion: string): Folio {
    // siguienteFolio es el contador de consecutivo (R4): nunca se reutiliza
    // aunque haya folios anulados. Lista.agregar() es O(1).
    const folio = new Folio(this.siguienteFolio, descripcion);
    this.siguienteFolio += 1;
    this.folios.agregar(folio);
    return folio;
  }

  anularFolio(numero: number): Folio {
    const folio = this.folios.buscar((f) => f.numero === numero);
    if (folio === null) throw new Error(`el folio ${numero} no existe en ${this.radicado}`);
    if (folio.estado === "ANULADO") throw new Error(`el folio ${numero} ya estaba anulado`);
    folio.estado = "ANULADO"; // R4: se marca, no se elimina ni renumera
    return folio;
  }

  foliosVigentes(): number {
    let total = 0;
    for (const folio of this.folios) if (folio.estado === "VIGENTE") total += 1;
    return total;
  }

  /**
   * Devuelve la ruta recorrida (bottom->top) SIN destruir la pila.
   *
   * Se vacia la pila hacia una auxiliar y luego se reconstruye desde la
   * auxiliar: al terminar, this.ruta queda identica a como estaba antes de
   * llamar este metodo. Costo O(n) en tiempo (dos pasadas) y O(n) en
   * espacio auxiliar, con n = pasos recorridos.
   */
  rutaActual(): Dependencia[] {
    const auxiliar = new Pila<Dependencia>();
    while (!this.ruta.estaVacia()) auxiliar.apilar(this.ruta.desapilar());
    const recorrido: Dependencia[] = [];
    while (!auxiliar.estaVacia()) {
      const valor = auxiliar.desapilar();
      recorrido.push(valor);
      this.ruta.apilar(valor);
    }
    return recorrido;
  }
}
