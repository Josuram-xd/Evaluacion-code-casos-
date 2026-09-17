"""
Runner de comandos para CuraduriaTramites.

Uso:
    python main.py tramites.txt
"""

import sys

from curaduria import CuraduriaTramites
from entidades import DEPENDENCIAS


def _parse_encabezado(linea, sistema_actual):
    if linea.startswith("CAPACIDAD_BANDEJA"):
        partes = linea.replace(":", " ").split()
        capacidad = int(partes[1])
        plazo = int(partes[3])
        return CuraduriaTramites(capacidad_bandeja=capacidad, plazo_dias=plazo)
    return sistema_actual


def ejecutar(ruta_archivo):
    sistema = None
    en_comandos = False

    with open(ruta_archivo, encoding="utf-8") as archivo:
        for linea_cruda in archivo:
            linea = linea_cruda.split("#", 1)[0].strip()
            if not linea:
                continue
            if linea == "---":
                en_comandos = True
                continue
            if not en_comandos:
                sistema = _parse_encabezado(linea, sistema)
                continue

            _procesar_comando(sistema, linea)


def _procesar_comando(sistema, linea):
    tokens = linea.split()
    comando = tokens[0].upper()

    if comando == "RADICAR":
        resto = tokens[1:]
        indice_dia = next(i for i, t in enumerate(resto) if t.startswith("dia="))
        solicitante = " ".join(resto[:indice_dia])
        dia = int(resto[indice_dia].split("=")[1])
        print(f"> RADICAR {solicitante} dia={dia}")
        expediente = sistema.radicar(solicitante, dia)
        print(f"  {expediente.radicado} creado | dependencia: {expediente.dependencia} | folio 1: solicitud")

    elif comando == "FOLIO":
        radicado, descripcion = tokens[1], tokens[2]
        print(f"> FOLIO {radicado} {descripcion}")
        try:
            folio = sistema.agregar_folio(radicado, descripcion)
            print(f"  folio {folio.numero} ({descripcion}) agregado, VIGENTE")
        except ValueError as error:
            print(f"  ERROR: {error}")

    elif comando == "ANULAR":
        radicado, numero = tokens[1], int(tokens[2])
        print(f"> ANULAR {radicado} {numero}")
        try:
            folio = sistema.anular_folio(radicado, numero)
            print(f"  folio {folio.numero} ({folio.descripcion}) -> ANULADO (no se renumera, R4)")
        except ValueError as error:
            print(f"  ERROR: {error}")

    elif comando == "ATENDER":
        dependencia = tokens[1]
        print(f"> ATENDER {dependencia}")
        try:
            expediente = sistema.atender_siguiente(dependencia)
            print(f"  toma {expediente.radicado} ({expediente.solicitante})")
        except ValueError as error:
            print(f"  ERROR: {error}")

    elif comando == "AVANZAR":
        radicado = tokens[1]
        print(f"> AVANZAR {radicado}")
        try:
            destino, encolado = sistema.avanzar(radicado)
            estado = f"encolado en {destino}" if encolado else f"represado, en espera de cupo en {destino}"
            print(f"  {radicado} avanza a {destino} | {estado}")
        except ValueError as error:
            print(f"  {error}")

    elif comando == "DEVOLVER":
        radicado = tokens[1]
        observacion = " ".join(tokens[2:])
        print(f"> DEVOLVER {radicado} {observacion}")
        try:
            expediente = sistema.buscar_expediente(radicado)
            ruta_antes = expediente.ruta_actual()
            print(f"  ruta antes : {' > '.join(ruta_antes)} (tope = {ruta_antes[-1]})")
            actual, anterior, archivado = sistema.devolver(radicado, observacion)
            print(f"  se desapila {actual} -> regresa al final de la bandeja de {anterior}")
            if archivado:
                print(f"  devoluciones = 3 de 3 -> R3: {radicado} se archiva por desistimiento")
            else:
                print(f"  devoluciones = {expediente.devoluciones} de 3")
        except ValueError as error:
            print(f"  {error}")

    elif comando == "IMPRIMIR":
        radicado = tokens[1]
        print(f"> IMPRIMIR {radicado}")
        try:
            expediente = sistema.buscar_expediente(radicado)
            print(
                f"  EXPEDIENTE {expediente.radicado} | {expediente.solicitante} "
                f"| dependencia actual: {expediente.dependencia}"
            )
            vigentes = anulados = 0
            for folio in expediente.folios:
                print(f"    folio {folio.numero} {folio.descripcion:<28} {folio.estado}")
                if folio.estado == "VIGENTE":
                    vigentes += 1
                else:
                    anulados += 1
            etiqueta_anulados = "anulado" if anulados == 1 else "anulados"
            print(f"  folios: {vigentes + anulados} total, {vigentes} vigentes, {anulados} {etiqueta_anulados}")
            ruta = expediente.ruta_actual()
            print(f"  ruta recorrida: {' > '.join(ruta)} (pila intacta)")
        except ValueError as error:
            print(f"  ERROR: {error}")

    elif comando == "REPORTE":
        dia_actual = int(tokens[1].split("=")[1])
        print(f"> REPORTE dia={dia_actual}")
        reporte = sistema.reporte(dia_actual)
        bandejas_str = " | ".join(f"{dep} {reporte['bandejas'][dep]}" for dep in DEPENDENCIAS)
        print(f"  Bandejas: {bandejas_str}")
        print(
            f"  Represados: {reporte['represados']}  "
            f"Archivados por R3: {reporte['archivados']}  "
            f"Resueltos: {reporte['resueltos']}"
        )
        devoluciones = ", ".join(
            f"{dep} {cantidad}" for dep, cantidad in reporte["devoluciones"].items() if cantidad > 0
        ) or "ninguna"
        print(f"  Devoluciones por dependencia: {devoluciones}")
        if reporte["vencidos"]:
            vencidos_str = ", ".join(f"{r} ({d} dias habiles)" for r, d in reporte["vencidos"])
            print(f"  VENCIDOS (R6): {vencidos_str}")
        else:
            print("  VENCIDOS (R6): ninguno")

    else:
        print(f"> {linea}")
        print(f"  comando desconocido: {comando}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python main.py <archivo_de_comandos>")
        sys.exit(1)
    ejecutar(sys.argv[1])
