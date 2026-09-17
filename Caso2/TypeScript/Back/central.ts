/**
 * Logica de negocio (orquestacion) de CentralAscensores.
 *
 * Ver ../../Caso_Estudio_2.pdf para el enunciado completo. Aqui se
 * implementan las reglas R1-R7 y los requerimientos RF-01..RF-08 usando
 * las estructuras propias de estructuras.ts y las entidades de
 * entidades.ts. El armado del texto de reporte() vive en reportes.ts.
 */

import { Lista, Cola, Pila } from "./estructuras";
import {
  Ascensor,
  Llamada,
  RechazoOperacion,
  PROTOCOLO,
  TOTAL_PASOS,
  OBJETIVO_MINUTOS,
  LIMITE_EMERGENCIAS_ANTES_DE_MANTENIMIENTO,
  EMERGENCIAS_PARA_FUERA_DE_SERVICIO,
  TipoLlamada,
  PasoPila,
} from "./entidades";
import { generarReporte } from "./reportes";

export class CentralAscensores {
  parque = new Lista<Ascensor>();
  colaEmergencia = new Cola<Llamada>();
  colaMantenimiento = new Cola<Llamada>();
  pilaProtocolo: Pila<PasoPila> | null = null;
  llamadaActual: Llamada | null = null;
  ascensorActual: Ascensor | null = null;
  // R1: emergencias atendidas seguidas desde el ultimo mantenimiento;
  // al llegar a 4 se fuerza el siguiente mantenimiento en espera.
  contadorEmergenciasConsecutivas = 0;

  atendidas: Record<TipoLlamada, number> = { EMERGENCIA: 0, MANTENIMIENTO: 0 };
  tiemposRespuesta: Record<TipoLlamada, number[]> = { EMERGENCIA: [], MANTENIMIENTO: [] };
  cumplimiento: Record<TipoLlamada, boolean[]> = { EMERGENCIA: [], MANTENIMIENTO: [] };
  completados = 0;
  abortados: string[] = [];
  rechazadasDuplicado = 0;
  rechazadasFueraServicio = 0;
  pasaronFueraDeServicio: string[] = [];

  // ---- RF-01 ----
  cargarParque(filas: string[][]): void {
    for (const [codigo, edificio, estado, emergencias] of filas) {
      if (this.parque.buscar((a) => a.codigo === codigo) !== null) {
        throw new RechazoOperacion(`codigo duplicado en el parque: ${codigo}`);
      }
      this.parque.agregar(new Ascensor(codigo, edificio, estado, Number(emergencias)));
    }
  }

  private buscarAscensor(codigo: string): Ascensor {
    const ascensor = this.parque.buscar((a) => a.codigo === codigo);
    if (ascensor === null) throw new RechazoOperacion(`el ascensor ${codigo} no existe`);
    return ascensor;
  }

  // ---- RF-02 ----
  registrarLlamada(codigo: string, tipo: TipoLlamada, minuto: number): string {
    const ascensor = this.buscarAscensor(codigo);
    if (ascensor.estado === "FUERA_DE_SERVICIO") {
      this.rechazadasFueraServicio++;
      throw new RechazoOperacion("(R7): el ascensor esta fuera de servicio");
    }
    if (ascensor.activa) {
      this.rechazadasDuplicado++;
      throw new RechazoOperacion("(R2): el ascensor ya tiene una llamada activa");
    }
    const llamada: Llamada = { codigo, tipo, minutoLlamada: minuto };
    ascensor.activa = true;
    if (tipo === "EMERGENCIA") this.colaEmergencia.encolar(llamada);
    else this.colaMantenimiento.encolar(llamada);
    return `${codigo} en cola de ${tipo}`;
  }

  // ---- RF-03 ----
  atenderSiguiente(minutoActual: number): string {
    const forzarMantenimiento =
      this.contadorEmergenciasConsecutivas >= LIMITE_EMERGENCIAS_ANTES_DE_MANTENIMIENTO &&
      !this.colaMantenimiento.vacia();

    let llamada: Llamada;
    if (forzarMantenimiento) {
      llamada = this.colaMantenimiento.desencolar();
      this.contadorEmergenciasConsecutivas = 0;
    } else if (!this.colaEmergencia.vacia()) {
      llamada = this.colaEmergencia.desencolar();
      this.contadorEmergenciasConsecutivas++;
    } else if (!this.colaMantenimiento.vacia()) {
      llamada = this.colaMantenimiento.desencolar();
      this.contadorEmergenciasConsecutivas = 0;
    } else {
      throw new RechazoOperacion("no hay llamadas en espera en ninguna cola");
    }

    const ascensor = this.buscarAscensor(llamada.codigo);
    ascensor.estado = "EN_ATENCION";
    llamada.minutoAtencion = minutoActual;
    this.llamadaActual = llamada;
    this.ascensorActual = ascensor;
    this.pilaProtocolo = new Pila<PasoPila>();

    const espera = minutoActual - llamada.minutoLlamada;
    const objetivo = OBJETIVO_MINUTOS[llamada.tipo];
    const cumple = espera <= objetivo;
    this.tiemposRespuesta[llamada.tipo].push(espera);
    this.cumplimiento[llamada.tipo].push(cumple);

    return `${ascensor.codigo} | ${llamada.tipo} | espera ${espera} min -> ${
      cumple ? "CUMPLE" : "INCUMPLE"
    } (objetivo ${objetivo})`;
  }

  private exigirLlamadaEnCurso(): void {
    if (this.llamadaActual === null) {
      throw new RechazoOperacion("no hay ninguna llamada en atencion en este momento");
    }
  }

  // ---- RF-04 ----
  ejecutarPaso(n: number): string {
    this.exigirLlamadaEnCurso();
    if (this.llamadaActual!.tipo !== "EMERGENCIA") {
      throw new RechazoOperacion("el protocolo de rescate solo aplica a emergencias");
    }
    // R3: el paso siguiente valido se decide consultando el TOPE de la
    // pila, no un contador aparte de "ultimo paso ejecutado".
    const esperado = this.pilaProtocolo!.vacia() ? 1 : this.pilaProtocolo!.tope()[0] + 1;
    if (n !== esperado) {
      throw new RechazoOperacion(
        `(R3): el tope de la pila es el paso ${esperado - 1}, se esperaba ejecutar el paso ${esperado}`
      );
    }
    const [directa, inversa] = PROTOCOLO[n];
    this.pilaProtocolo!.apilar([n, directa, inversa]);
    return `paso ${n} ejecutado -> ${directa}`;
  }

  // ---- RF-05 ----
  deshacerUltimo(): string {
    this.exigirLlamadaEnCurso();
    if (this.pilaProtocolo!.vacia()) {
      throw new RechazoOperacion("la pila del protocolo esta vacia, no hay nada que deshacer");
    }
    const [n, , inversa] = this.pilaProtocolo!.desapilar();
    return `deshacer paso ${n} -> ${inversa}`;
  }

  // ---- RF-06 ----
  abortarRescate(motivo: string): string[] {
    this.exigirLlamadaEnCurso();
    const lineas: string[] = [];
    while (!this.pilaProtocolo!.vacia()) {
      const [n, , inversa] = this.pilaProtocolo!.desapilar();
      lineas.push(`deshacer paso ${n} -> ${inversa}`);
    }
    this.ascensorActual!.estado = "OPERATIVO";
    this.ascensorActual!.activa = false;
    this.abortados.push(motivo);
    lineas.push("pila vacia -> llamada cerrada como ABORTADA, ascensor OPERATIVO");
    this.liberarPuesto();
    return lineas;
  }

  // ---- RF-07 ----
  cerrarLlamada(): string {
    this.exigirLlamadaEnCurso();
    const llamada = this.llamadaActual!;
    const ascensor = this.ascensorActual!;
    let mensaje: string;

    if (llamada.tipo === "EMERGENCIA") {
      if (this.pilaProtocolo!.length !== TOTAL_PASOS) {
        throw new RechazoOperacion(
          `(R5): el protocolo tiene ${this.pilaProtocolo!.length} de ${TOTAL_PASOS} pasos, no se puede cerrar`
        );
      }
      ascensor.emergencias++;
      if (ascensor.emergencias >= EMERGENCIAS_PARA_FUERA_DE_SERVICIO) {
        ascensor.estado = "FUERA_DE_SERVICIO";
        this.pasaronFueraDeServicio.push(ascensor.codigo);
        mensaje = `emergencias = ${ascensor.emergencias} -> (R7): ${ascensor.codigo} pasa a FUERA_DE_SERVICIO`;
      } else {
        ascensor.estado = "OPERATIVO";
        mensaje = `${ascensor.codigo} cerrada con exito, vuelve a OPERATIVO`;
      }
    } else {
      ascensor.estado = "OPERATIVO";
      mensaje = `${ascensor.codigo} (mantenimiento) cerrada, vuelve a OPERATIVO`;
    }

    ascensor.activa = false;
    this.atendidas[llamada.tipo]++;
    if (llamada.tipo === "EMERGENCIA") this.completados++;
    this.liberarPuesto();
    return mensaje;
  }

  private liberarPuesto(): void {
    this.llamadaActual = null;
    this.ascensorActual = null;
    this.pilaProtocolo = null;
  }

  // ---- RF-08 ----
  reporte(): string {
    return generarReporte(this);
  }
}
