/**
 * Servicio/orquestador de BiciTaller: la flota (lista), el turno del taller
 * y la espera de repuestos (colas), y el puesto de trabajo (pila de
 * piezas). La entidad `Bicicleta` vive en entidades.ts; el detalle del
 * reporte, en reportes.ts.
 *
 * Punto clave del caso (R4/R5 - suspender/reanudar):
 * Guardar una pila "vaciándola" en otra estructura auxiliar y volviéndola a
 * llenar invierte el orden si solo se usa una transferencia (con una sola
 * pila auxiliar, lo que era el tope queda en el fondo). Aquí se evita el
 * problema por completo: como nuestra Pila ya es un objeto con nodos
 * enlazados, "guardar" la pila de la orden es simplemente quedarnos con la
 * referencia a ese mismo objeto (bici.pilaGuardada = pila), sin mover ni
 * un solo elemento. El puesto queda libre porque a la siguiente bicicleta
 * se le entrega una Pila nueva. Al reanudar, se vuelve a usar esa misma
 * referencia como pila del puesto: el orden queda idéntico porque nunca se
 * tocó. Costo: O(1), 0 transferencias.
 */

import { ListaEnlazada, Cola, Pila } from "./estructuras";
import { Bicicleta, FilaFlota } from "./entidades";
import { generarReporte } from "./reportes";

const CAPACIDAD_COLA_TALLER = 50;
const REPARACIONES_PARA_BAJA = 3;

type Puesto = { codigo: string; pila: Pila<string> };

export class BiciTaller {
  flota = new ListaEnlazada<Bicicleta>();
  bajas = new ListaEnlazada<Bicicleta>();
  colaTaller = new Cola<string>();
  colaEspera = new Cola<string>();
  puesto: Puesto | null = null;

  private turno = 0;
  tiemposEspera: Array<[string, number]> = [];
  ordenesCerradas = 0;
  ordenesSuspendidas = 0;
  ordenesRechazadas = 0;

  // ---- RF-01 / RF-02 ------------------------------------------------
  cargarFlota(filas: FilaFlota[]): string[] {
    const mensajes: string[] = [];
    for (const fila of filas) {
      if (this.buscar(fila.codigo) !== null) {
        mensajes.push(`RECHAZADO: codigo duplicado ${fila.codigo}`);
        continue;
      }
      const bici = new Bicicleta(fila.codigo, fila.estacion, fila.estado, fila.reparaciones);
      this.flota.insertarOrdenado(bici, (b) => b.codigo);
    }
    return mensajes;
  }

  /** O(n): recorre la lista enlazada buscando el código. */
  buscar(codigo: string): Bicicleta | null {
    return this.flota.buscar((b) => b.codigo === codigo);
  }

  // ---- RF-03 ----------------------------------------------------------
  reportarFalla(codigo: string, falla: string): string {
    const bici = this.buscar(codigo);
    if (bici === null) return `RECHAZADA: la bicicleta ${codigo} no existe`;
    if (bici.estado !== "OPERATIVA") {
      return `RECHAZADA (R1): estado ${bici.estado}, solo se reporta una bicicleta OPERATIVA`;
    }
    bici.estado = "REPORTADA";
    bici.falla = falla;
    return `${codigo} -> REPORTADA (${falla})`;
  }

  // ---- RF-04 ----------------------------------------------------------
  recibirEnTaller(codigo: string): string {
    const bici = this.buscar(codigo);
    if (bici === null) return `RECHAZADA: la bicicleta ${codigo} no existe`;
    if (bici.estado !== "REPORTADA") {
      return `RECHAZADA (R1): estado ${bici.estado}, no fue reportada`;
    }
    if (this.colaTaller.length >= CAPACIDAD_COLA_TALLER) {
      return "RECHAZADA: cola del taller llena";
    }
    bici.estado = "EN_TALLER";
    bici.turnoIngreso = this.turno;
    this.colaTaller.encolar(bici.codigo);
    return `${codigo} -> EN_TALLER, encolada en el taller (posicion ${this.colaTaller.length})`;
  }

  // ---- RF-05 ----------------------------------------------------------
  iniciarReparacion(): string {
    if (this.puesto !== null) return "RECHAZADA: el puesto de trabajo ya esta ocupado";
    if (this.colaTaller.estaVacia()) return "RECHAZADA: no hay bicicletas en espera";

    const codigo = this.colaTaller.desencolar();
    const bici = this.buscar(codigo)!;
    const espera = this.turno - (bici.turnoIngreso ?? this.turno);
    this.tiemposEspera.push([codigo, espera]);

    let pila: Pila<string>;
    let origen: string;
    if (bici.pilaGuardada !== null) {
      pila = bici.pilaGuardada;
      bici.pilaGuardada = null;
      origen = "restaurada";
    } else {
      pila = new Pila<string>();
      origen = "vacia";
    }

    this.puesto = { codigo, pila };
    this.turno++;
    const tope = pila.estaVacia() ? "-" : pila.verTope();
    return `${codigo} en el puesto de trabajo | pila ${origen} (tope=${tope}) | espero ${espera} turno(s)`;
  }

  // ---- RF-06 ----------------------------------------------------------
  desmontar(pieza: string): string {
    if (this.puesto === null) return "RECHAZADA: no hay bicicleta en el puesto de trabajo";
    this.puesto.pila.apilar(pieza);
    return `${pieza} desmontada y apilada (tope=${pieza})`;
  }

  montar(): string {
    if (this.puesto === null) return "RECHAZADA: no hay bicicleta en el puesto de trabajo";
    const pila = this.puesto.pila;
    if (pila.estaVacia()) return "RECHAZADO: no hay piezas para montar, la pila esta vacia";
    const pieza = pila.desapilar();
    return `${pieza} montada`;
  }

  // ---- RF-07 ----------------------------------------------------------
  suspender(motivo: string): string {
    if (this.puesto === null) return "RECHAZADA: no hay bicicleta en el puesto de trabajo";
    const { codigo, pila } = this.puesto;
    const bici = this.buscar(codigo)!;
    const piezasFondoATope = [...pila.recorrerDesdeTope()].reverse();

    bici.pilaGuardada = pila; // misma referencia: 0 transferencias
    bici.motivoSuspension = motivo;
    bici.estado = "ESPERA_REPUESTO";
    this.colaEspera.encolar(codigo);
    this.puesto = null;
    this.ordenesSuspendidas++;

    return (
      `${codigo} -> ESPERA_REPUESTO | piezas guardadas: [${piezasFondoATope.join(", ")}] (fondo -> tope)\n` +
      `  puesto de trabajo liberado`
    );
  }

  reanudar(codigo: string): string {
    const bici = this.buscar(codigo);
    if (bici === null || bici.estado !== "ESPERA_REPUESTO") {
      return `RECHAZADA: ${codigo} no esta en espera de repuesto`;
    }
    const extraido = this.colaEspera.extraer((c) => c === codigo);
    if (extraido === null) return `RECHAZADA: ${codigo} no esta en la cola de repuestos`;

    bici.estado = "EN_TALLER";
    bici.turnoIngreso = this.turno;
    this.colaTaller.encolar(codigo);
    return `${codigo} vuelve al final de la cola del taller | pila conservada (se restaura intacta al iniciar)`;
  }

  // ---- RF-08 ----------------------------------------------------------
  cerrarOrden(): string {
    if (this.puesto === null) return "RECHAZADA: no hay bicicleta en el puesto de trabajo";
    const { codigo, pila } = this.puesto;

    if (!pila.estaVacia()) {
      this.ordenesRechazadas++;
      return `RECHAZADA (R6): quedan piezas sin montar en ${codigo}, la bicicleta quedaria incompleta`;
    }

    const bici = this.buscar(codigo)!;
    bici.reparaciones++;
    this.puesto = null;
    this.ordenesCerradas++;

    if (bici.reparaciones >= REPARACIONES_PARA_BAJA) {
      bici.estado = "DE_BAJA";
      this.flota.eliminar((b) => b.codigo === codigo);
      this.bajas.agregarAlFinal(bici);
      return (
        `CERRADA ${codigo} | reparaciones = ${bici.reparaciones} -> ` +
        `R7: ${codigo} pasa a DE_BAJA (retirada de la flota activa)`
      );
    }
    bici.estado = "OPERATIVA";
    return `CERRADA ${codigo} | reparaciones = ${bici.reparaciones} -> OPERATIVA`;
  }

  // ---- RF-09 ----------------------------------------------------------
  reporte(): string {
    return generarReporte(
      this.flota,
      this.bajas,
      this.colaTaller,
      this.colaEspera,
      this.tiemposEspera,
      this.ordenesCerradas,
      this.ordenesSuspendidas,
      this.ordenesRechazadas
    );
  }
}
