"""
Construccion del reporte/metricas de CuraduriaTramites. Recibe el servicio
(el objeto CuraduriaTramites, ya con sus bandejas/represamiento/expedientes)
y arma un diccionario plano con lo que pide el numeral 6 del PDF, sin tocar
ni conocer las reglas de negocio: solo lee el estado ya validado.
"""

from entidades import DEPENDENCIAS


def generar_reporte(servicio, dia_actual):
    conteo_bandejas = {dep: len(servicio.bandejas[dep]) for dep in DEPENDENCIAS}

    vencidos = []
    for radicado, expediente in servicio.expedientes.items():
        dias = dia_actual - expediente.dia_radicacion
        if dias > servicio.plazo_dias:
            vencidos.append((radicado, dias))

    return {
        "bandejas": conteo_bandejas,
        "represados": len(servicio.represamiento),
        "archivados": len(servicio.archivados),
        "resueltos": conteo_bandejas["RESOLUCION"],
        "devoluciones": servicio.devoluciones_por_dependencia,
        "vencidos": vencidos,
    }
