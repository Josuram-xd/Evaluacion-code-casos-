"""
Generación del reporte/métricas de BiciTaller (RF-09), separada de la
clase de servicio para que ésta no mezcle orquestación con presentación.
"""


def generar_reporte(
    flota,
    bajas,
    cola_taller,
    cola_espera,
    tiempos_espera,
    ordenes_cerradas,
    ordenes_suspendidas,
    ordenes_rechazadas,
):
    conteo = {"OPERATIVA": 0, "REPORTADA": 0, "EN_TALLER": 0, "ESPERA_REPUESTO": 0, "DE_BAJA": 0}
    for b in flota.recorrer():
        conteo[b.estado] = conteo.get(b.estado, 0) + 1
    conteo["DE_BAJA"] += len(bajas)

    lineas = ["=== REPORTE DEL DIA ==="]
    lineas.append("Bicicletas por estado: " + ", ".join(f"{k}={v}" for k, v in conteo.items()))
    lineas.append(f"Flota activa: {len(flota)}  De baja: {len(bajas)}")
    lineas.append(
        f"Cola taller: {'vacia' if cola_taller.esta_vacia() else len(cola_taller)}  "
        f"Cola repuestos: {'vacia' if cola_espera.esta_vacia() else len(cola_espera)}"
    )
    lineas.append(
        f"Ordenes cerradas: {ordenes_cerradas}  Suspendidas: {ordenes_suspendidas}  "
        f"Rechazadas por armado incompleto: {ordenes_rechazadas}"
    )
    if tiempos_espera:
        detalle = ", ".join(f"{c}:{t}t" for c, t in tiempos_espera)
        lineas.append(f"Espera hasta iniciar reparacion (turnos): {detalle}")
    if len(bajas):
        bajas_txt = ", ".join(f"{b.codigo} ({b.estacion})" for b in bajas.recorrer())
        lineas.append(f"Bajas por R7: {bajas_txt}")
    return "\n".join(lineas)
