/**
 * Generacion del texto de reporte() (RF-08) de CentralAscensores.
 *
 * Separado de central.ts porque armar el texto del reporte no es
 * logica de negocio: solo lee las metricas que la orquestacion ya
 * calculo. El import de CentralAscensores es solo de tipo (`import
 * type`), asi que no genera una dependencia circular en tiempo de
 * ejecucion con central.ts (que si importa este modulo).
 */

import type { CentralAscensores } from "./central";
import type { TipoLlamada } from "./entidades";

export function generarReporte(central: CentralAscensores): string {
  const lineas: string[] = ["=== REPORTE DE LA JORNADA ==="];
  const enCola = central.colaEmergencia.length + central.colaMantenimiento.length;
  lineas.push(
    `Emergencias atendidas: ${central.atendidas.EMERGENCIA}  Mantenimientos atendidos: ${central.atendidas.MANTENIMIENTO}  En cola al cierre: ${enCola}`
  );
  (["EMERGENCIA", "MANTENIMIENTO"] as TipoLlamada[]).forEach((tipo) => {
    const tiempos = central.tiemposRespuesta[tipo];
    if (tiempos.length > 0) {
      const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
      const maximo = Math.max(...tiempos);
      const cumplidos = central.cumplimiento[tipo].filter(Boolean).length;
      const pct = (100 * cumplidos) / central.cumplimiento[tipo].length;
      lineas.push(
        `Tiempo de respuesta ${tipo.toLowerCase()}: promedio ${promedio.toFixed(1)} min / maximo ${maximo} min | cumplimiento ${pct.toFixed(0)}%`
      );
    }
  });
  lineas.push(
    `Rescates completados: ${central.completados}  Abortados: ${central.abortados.length} (${
      central.abortados.length ? central.abortados.join(", ") : "-"
    })`
  );
  lineas.push(
    `Llamadas rechazadas: ${central.rechazadasDuplicado} duplicada, ${central.rechazadasFueraServicio} fuera de servicio`
  );
  lineas.push(
    `Ascensores a FUERA_DE_SERVICIO: ${
      central.pasaronFueraDeServicio.length ? central.pasaronFueraDeServicio.join(", ") : "ninguno"
    }`
  );
  return lineas.join("\n");
}
