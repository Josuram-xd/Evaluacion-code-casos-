/**
 * Construccion del reporte/metricas de CuraduriaTramites. `generarReporte`
 * recibe el servicio (tipado por la forma minima que necesita leer, no la
 * clase completa, para no crear un import circular con curaduria.ts) y
 * arma un objeto plano con lo que pide el numeral 6 del PDF, sin tocar ni
 * conocer las reglas de negocio: solo lee el estado ya validado.
 */

import { Cola } from "./estructuras";
import { DEPENDENCIAS, Dependencia, Expediente } from "./entidades";

export interface EstadoParaReporte {
  bandejas: Record<Dependencia, Cola<Expediente>>;
  represamiento: Cola<[Expediente, Dependencia]>;
  expedientes: Map<string, Expediente>;
  archivados: Expediente[];
  devolucionesPorDependencia: Record<Dependencia, number>;
  plazoDias: number;
}

export interface Reporte {
  bandejas: Record<Dependencia, number>;
  represados: number;
  archivados: number;
  resueltos: number;
  devoluciones: Record<Dependencia, number>;
  vencidos: Array<[string, number]>;
}

export function generarReporte(servicio: EstadoParaReporte, diaActual: number): Reporte {
  const bandejas = Object.fromEntries(
    DEPENDENCIAS.map((dep) => [dep, servicio.bandejas[dep].longitud])
  ) as Record<Dependencia, number>;

  const vencidos: Array<[string, number]> = [];
  for (const [radicado, expediente] of servicio.expedientes) {
    const dias = diaActual - expediente.diaRadicacion;
    if (dias > servicio.plazoDias) vencidos.push([radicado, dias]);
  }

  return {
    bandejas,
    represados: servicio.represamiento.longitud,
    archivados: servicio.archivados.length,
    resueltos: bandejas.RESOLUCION,
    devoluciones: servicio.devolucionesPorDependencia,
    vencidos,
  };
}
