/**
 * Entidades de dominio de CentralAscensores: datos y constantes del
 * negocio, sin logica de orquestacion (eso vive en central.ts).
 */

export type TipoLlamada = "EMERGENCIA" | "MANTENIMIENTO";

// Protocolo fijo: paso -> [maniobra directa, maniobra inversa]
export const PROTOCOLO: Record<number, [string, string]> = {
  1: ["cortar energia", "restablecer energia"],
  2: ["bloquear puertas de piso", "desbloquear puertas de piso"],
  3: ["enganchar freno manual", "soltar freno manual"],
  4: ["nivelar cabina", "dejar cabina libre"],
  5: ["abrir puertas y evacuar", "cerrar puertas"],
};
export const TOTAL_PASOS = Object.keys(PROTOCOLO).length;

export const OBJETIVO_MINUTOS: Record<TipoLlamada, number> = {
  EMERGENCIA: 30,
  MANTENIMIENTO: 240,
};
export const LIMITE_EMERGENCIAS_ANTES_DE_MANTENIMIENTO = 4;
export const EMERGENCIAS_PARA_FUERA_DE_SERVICIO = 3;

export class Ascensor {
  emergencias: number;
  estado: string;
  activa = false; // true si ya tiene una llamada en curso (R2)

  constructor(
    public codigo: string,
    public edificio: string,
    estado: string,
    emergencias: number
  ) {
    this.estado = estado;
    this.emergencias = emergencias;
  }
}

export interface Llamada {
  codigo: string;
  tipo: TipoLlamada;
  minutoLlamada: number;
  minutoAtencion?: number;
}

export type PasoPila = [numero: number, directa: string, inversa: string];

export class RechazoOperacion extends Error {}
