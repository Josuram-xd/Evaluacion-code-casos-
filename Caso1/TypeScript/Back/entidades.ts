/**
 * Entidad de dominio de BiciTaller: solo datos y estado propios de una
 * bicicleta. Las reglas de negocio (R1-R7) y las operaciones (RF-01..RF-09)
 * viven en el servicio (bicitaller.ts), no aquí.
 */

import { Pila } from "./estructuras";

export type FilaFlota = {
  codigo: string;
  estacion: string;
  estado: string;
  reparaciones: number;
};

export class Bicicleta {
  falla = "";
  pilaGuardada: Pila<string> | null = null;
  motivoSuspension: string | null = null;
  turnoIngreso: number | null = null;

  constructor(
    public codigo: string,
    public estacion: string,
    public estado: string,
    public reparaciones: number
  ) {}
}
