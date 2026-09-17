/**
 * Orquestador del caso: CuraduriaTramites. Usa las entidades (Folio,
 * Expediente) y las estructuras propias (Cola, Pila) para implementar
 * RF-01..RF-08 y las reglas R1-R7. No define datos de dominio propios (eso
 * vive en entidades.ts) ni el armado del reporte (eso vive en reportes.ts).
 */

import { Cola } from "./estructuras";
import { DEPENDENCIAS, Dependencia, Expediente } from "./entidades";
import { generarReporte, Reporte } from "./reportes";

export { DEPENDENCIAS, Dependencia, Expediente } from "./entidades";
export type { Reporte } from "./reportes";

export interface ResultadoAvance {
  destino: Dependencia;
  encolado: boolean;
}

export interface ResultadoDevolucion {
  actual: Dependencia;
  anterior: Dependencia;
  archivado: boolean;
}

export class CuraduriaTramites {
  bandejas: Record<Dependencia, Cola<Expediente>>;
  represamiento = new Cola<[Expediente, Dependencia]>(); // cola general (R7), sin limite
  // Indice radicado->expediente: es una ayuda de busqueda, no reemplaza
  // ninguna de las tres estructuras exigidas (esas son folios y ruta, que
  // viven dentro de cada Expediente, y las bandejas de abajo).
  expedientes = new Map<string, Expediente>();
  archivados: Expediente[] = [];
  devolucionesPorDependencia: Record<Dependencia, number>;
  plazoDias: number;

  private contadorRadicado = 0;

  constructor(private readonly capacidadBandeja = 20, plazoDias = 45) {
    this.plazoDias = plazoDias;
    this.bandejas = Object.fromEntries(
      DEPENDENCIAS.map((dep) => [dep, new Cola<Expediente>(capacidadBandeja)])
    ) as Record<Dependencia, Cola<Expediente>>;
    this.devolucionesPorDependencia = Object.fromEntries(DEPENDENCIAS.map((dep) => [dep, 0])) as Record<
      Dependencia,
      number
    >;
  }

  buscarExpediente(radicado: string): Expediente {
    const expediente = this.expedientes.get(radicado);
    if (expediente === undefined) throw new Error(`el expediente ${radicado} no existe`);
    return expediente;
  }

  radicar(solicitante: string, dia: number): Expediente {
    this.contadorRadicado += 1;
    const radicado = `11001-2026-${String(this.contadorRadicado).padStart(4, "0")}`;
    const expediente = new Expediente(radicado, solicitante, dia);
    expediente.ruta.apilar(DEPENDENCIAS[0]);
    expediente.agregarFolio("solicitud");
    this.bandejas[DEPENDENCIAS[0]].encolar(expediente);
    this.expedientes.set(radicado, expediente);
    return expediente;
  }

  agregarFolio(radicado: string, descripcion: string) {
    return this.buscarExpediente(radicado).agregarFolio(descripcion);
  }

  anularFolio(radicado: string, numero: number) {
    return this.buscarExpediente(radicado).anularFolio(numero);
  }

  atenderSiguiente(dependencia: Dependencia): Expediente {
    const cola = this.bandejas[dependencia];
    if (cola.estaVacia()) throw new Error(`la bandeja ${dependencia} esta vacia`);
    const expediente = cola.desencolar();
    this.intentarLiberarRepresado(dependencia);
    return expediente;
  }

  private encolarEn(dependencia: Dependencia, expediente: Expediente): boolean {
    const cola = this.bandejas[dependencia];
    if (cola.estaLlena()) {
      this.represamiento.encolar([expediente, dependencia]);
      return false;
    }
    cola.encolar(expediente);
    return true;
  }

  private intentarLiberarRepresado(dependenciaLiberada: Dependencia): void {
    // R7: represar es una sola cola general. Solo miramos su FRENTE (no se
    // reordena): si el expediente que mas tiempo lleva esperando iba justo
    // para la dependencia que acaba de liberar un cupo, entra.
    if (this.represamiento.estaVacia()) return;
    const [expediente, destino] = this.represamiento.frente();
    if (destino === dependenciaLiberada && !this.bandejas[destino].estaLlena()) {
      this.represamiento.desencolar();
      this.bandejas[destino].encolar(expediente);
    }
  }

  private quitarDeBandejaActual(expediente: Expediente): void {
    // Si el expediente fue tomado con atenderSiguiente() ya no esta en
    // ninguna bandeja y esto no hace nada. Si en cambio avanzar/devolver se
    // invoca directamente sobre un radicado que sigue esperando en su
    // bandeja (sin pasar por ATENDER), lo sacamos de ahi para no dejar una
    // copia fantasma. remover() es O(n); ver comentario en Cola.
    this.bandejas[expediente.dependencia].remover((e) => e.radicado === expediente.radicado);
  }

  avanzar(radicado: string): ResultadoAvance {
    const expediente = this.buscarExpediente(radicado);
    const indice = DEPENDENCIAS.indexOf(expediente.dependencia);
    if (indice >= DEPENDENCIAS.length - 1) {
      throw new Error(`${radicado} ya esta en ${expediente.dependencia}, no hay siguiente dependencia`);
    }
    const destino = DEPENDENCIAS[indice + 1]; // R1: el orden es fijo, no se puede saltar
    if (destino === "RESOLUCION" && expediente.foliosVigentes() < 4) {
      throw new Error(
        `RECHAZADO (R5): ${radicado} tiene ${expediente.foliosVigentes()} folios vigentes, se requieren 4`
      );
    }
    this.quitarDeBandejaActual(expediente);
    expediente.dependencia = destino;
    expediente.ruta.apilar(destino);
    const encolado = this.encolarEn(destino, expediente);
    return { destino, encolado };
  }

  devolver(radicado: string, _observacion: string): ResultadoDevolucion {
    const expediente = this.buscarExpediente(radicado);
    if (expediente.ruta.longitud <= 1) {
      throw new Error(`RECHAZADO (R2): ${radicado} esta en RECEPCION, no se puede devolver`);
    }
    this.quitarDeBandejaActual(expediente);
    // R2: la dependencia anterior se calcula CONSULTANDO LA PILA de ruta,
    // nunca con un indice o un if por dependencia.
    const actual = expediente.ruta.desapilar();
    const anterior = expediente.ruta.tope();
    expediente.dependencia = anterior;
    expediente.devoluciones += 1;
    this.devolucionesPorDependencia[actual] += 1;
    if (expediente.devoluciones >= 3) {
      this.archivados.push(expediente); // R3: archivado por desistimiento
      this.expedientes.delete(radicado);
      return { actual, anterior, archivado: true };
    }
    this.encolarEn(anterior, expediente);
    return { actual, anterior, archivado: false };
  }

  reporte(diaActual: number): Reporte {
    return generarReporte(this, diaActual);
  }
}
