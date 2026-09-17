/**
 * Generación del reporte/métricas de BiciTaller (RF-09), separada de la
 * clase de servicio para que ésta no mezcle orquestación con presentación.
 */

import { ListaEnlazada, Cola } from "./estructuras";
import { Bicicleta } from "./entidades";

export function generarReporte(
  flota: ListaEnlazada<Bicicleta>,
  bajas: ListaEnlazada<Bicicleta>,
  colaTaller: Cola<string>,
  colaEspera: Cola<string>,
  tiemposEspera: Array<[string, number]>,
  ordenesCerradas: number,
  ordenesSuspendidas: number,
  ordenesRechazadas: number
): string {
  const conteo: Record<string, number> = {
    OPERATIVA: 0,
    REPORTADA: 0,
    EN_TALLER: 0,
    ESPERA_REPUESTO: 0,
    DE_BAJA: 0,
  };
  for (const b of flota.recorrer()) conteo[b.estado] = (conteo[b.estado] ?? 0) + 1;
  conteo["DE_BAJA"] += bajas.length;

  const lineas: string[] = ["=== REPORTE DEL DIA ==="];
  lineas.push(
    "Bicicletas por estado: " +
      Object.entries(conteo)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")
  );
  lineas.push(`Flota activa: ${flota.length}  De baja: ${bajas.length}`);
  lineas.push(
    `Cola taller: ${colaTaller.estaVacia() ? "vacia" : colaTaller.length}  ` +
      `Cola repuestos: ${colaEspera.estaVacia() ? "vacia" : colaEspera.length}`
  );
  lineas.push(
    `Ordenes cerradas: ${ordenesCerradas}  Suspendidas: ${ordenesSuspendidas}  ` +
      `Rechazadas por armado incompleto: ${ordenesRechazadas}`
  );
  if (tiemposEspera.length > 0) {
    const detalle = tiemposEspera.map(([c, t]) => `${c}:${t}t`).join(", ");
    lineas.push(`Espera hasta iniciar reparacion (turnos): ${detalle}`);
  }
  if (bajas.length > 0) {
    const bajasTxt = [...bajas.recorrer()].map((b) => `${b.codigo} (${b.estacion})`).join(", ");
    lineas.push(`Bajas por R7: ${bajasTxt}`);
  }
  return lineas.join("\n");
}
