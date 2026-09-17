"""
Generacion del texto de reporte() (RF-08) de CentralAscensores.

Separado de central.py porque armar el texto del reporte no es logica
de negocio: solo lee las metricas que la orquestacion ya calculo.
"""

from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from central import CentralAscensores


def generar_reporte(central: "CentralAscensores") -> str:
    lineas = ["=== REPORTE DE LA JORNADA ==="]
    en_cola = len(central.cola_emergencia) + len(central.cola_mantenimiento)
    lineas.append(
        f"Emergencias atendidas: {central.atendidas['EMERGENCIA']}  "
        f"Mantenimientos atendidos: {central.atendidas['MANTENIMIENTO']}  "
        f"En cola al cierre: {en_cola}"
    )
    for tipo in ("EMERGENCIA", "MANTENIMIENTO"):
        tiempos = central.tiempos_respuesta[tipo]
        if tiempos:
            promedio = sum(tiempos) / len(tiempos)
            maximo = max(tiempos)
            pct = 100 * sum(central.cumplimiento[tipo]) / len(central.cumplimiento[tipo])
            lineas.append(
                f"Tiempo de respuesta {tipo.lower()}: promedio {promedio:.1f} min / "
                f"maximo {maximo} min | cumplimiento {pct:.0f}%"
            )
    lineas.append(
        f"Rescates completados: {central.completados}  Abortados: {len(central.abortados)} "
        f"({', '.join(central.abortados) if central.abortados else '-'})"
    )
    lineas.append(
        f"Llamadas rechazadas: {central.rechazadas_duplicado} duplicada, "
        f"{central.rechazadas_fuera_servicio} fuera de servicio"
    )
    lineas.append(
        "Ascensores a FUERA_DE_SERVICIO: "
        + (", ".join(central.pasaron_fuera_de_servicio) if central.pasaron_fuera_de_servicio else "ninguno")
    )
    return "\n".join(lineas)
