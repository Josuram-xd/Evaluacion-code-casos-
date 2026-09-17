"""
Runner de comandos para CuraduriaTramites.

`procesar_linea` ejecuta una sola linea de comando y devuelve el texto de
salida como string, sin imprimir nada: la reutiliza tanto este runner de
consola como el front de `../Front (posible)/app.py` (mismo servicio, mismo
parser de comandos, ninguna regla de negocio duplicada).

Uso:
    python main.py tramites.txt
"""

import sys

from curaduria import CuraduriaTramites
from entidades import DEPENDENCIAS


def parse_encabezado(linea, sistema_actual):
    if linea.startswith("CAPACIDAD_BANDEJA"):
        partes = linea.replace(":", " ").split()
        capacidad = int(partes[1])
        plazo = int(partes[3])
        return CuraduriaTramites(capacidad_bandeja=capacidad, plazo_dias=plazo)
    return sistema_actual


def inicializar_desde_archivo(ruta_archivo):
    """Lee solo el encabezado (antes de '---') y devuelve un CuraduriaTramites
    ya configurado con la capacidad de bandeja y el plazo del archivo. No
    ejecuta los comandos de ejemplo que vengan despues de '---'."""
    sistema = None
    with open(ruta_archivo, encoding="utf-8") as archivo:
        for linea_cruda in archivo:
            linea = linea_cruda.split("#", 1)[0].strip()
            if not linea:
                continue
            if linea == "---":
                break
            sistema = parse_encabezado(linea, sistema)
    return sistema


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
                sistema = parse_encabezado(linea, sistema)
                continue

            print(procesar_linea(sistema, linea))


def procesar_linea(sistema, linea):
    """Ejecuta una linea de comando sobre `sistema` y devuelve el texto de
    salida (una o varias lineas unidas con '\\n'), sin imprimirlo."""
    salida = []
    tokens = linea.split()
    comando = tokens[0].upper()

    if comando == "RADICAR":
        resto = tokens[1:]
        indice_dia = next(i for i, t in enumerate(resto) if t.startswith("dia="))
        solicitante = " ".join(resto[:indice_dia])
        dia = int(resto[indice_dia].split("=")[1])
        salida.append(f"> RADICAR {solicitante} dia={dia}")
        expediente = sistema.radicar(solicitante, dia)
        salida.append(f"  {expediente.radicado} creado | dependencia: {expediente.dependencia} | folio 1: solicitud")

    elif comando == "FOLIO":
        radicado, descripcion = tokens[1], tokens[2]
        salida.append(f"> FOLIO {radicado} {descripcion}")
        try:
            folio = sistema.agregar_folio(radicado, descripcion)
            salida.append(f"  folio {folio.numero} ({descripcion}) agregado, VIGENTE")
        except ValueError as error:
            salida.append(f"  ERROR: {error}")

    elif comando == "ANULAR":
        radicado, numero = tokens[1], int(tokens[2])
        salida.append(f"> ANULAR {radicado} {numero}")
        try:
            folio = sistema.anular_folio(radicado, numero)
            salida.append(f"  folio {folio.numero} ({folio.descripcion}) -> ANULADO (no se renumera, R4)")
        except ValueError as error:
            salida.append(f"  ERROR: {error}")

    elif comando == "ATENDER":
        dependencia = tokens[1]
        salida.append(f"> ATENDER {dependencia}")
        try:
            expediente = sistema.atender_siguiente(dependencia)
            salida.append(f"  toma {expediente.radicado} ({expediente.solicitante})")
        except ValueError as error:
            salida.append(f"  ERROR: {error}")

    elif comando == "AVANZAR":
        radicado = tokens[1]
        salida.append(f"> AVANZAR {radicado}")
        try:
            destino, encolado = sistema.avanzar(radicado)
            estado = f"encolado en {destino}" if encolado else f"represado, en espera de cupo en {destino}"
            salida.append(f"  {radicado} avanza a {destino} | {estado}")
        except ValueError as error:
            salida.append(f"  {error}")

    elif comando == "DEVOLVER":
        radicado = tokens[1]
        observacion = " ".join(tokens[2:])
        salida.append(f"> DEVOLVER {radicado} {observacion}")
        try:
            expediente = sistema.buscar_expediente(radicado)
            ruta_antes = expediente.ruta_actual()
            salida.append(f"  ruta antes : {' > '.join(ruta_antes)} (tope = {ruta_antes[-1]})")
            actual, anterior, archivado = sistema.devolver(radicado, observacion)
            salida.append(f"  se desapila {actual} -> regresa al final de la bandeja de {anterior}")
            if archivado:
                salida.append(f"  devoluciones = 3 de 3 -> R3: {radicado} se archiva por desistimiento")
            else:
                salida.append(f"  devoluciones = {expediente.devoluciones} de 3")
        except ValueError as error:
            salida.append(f"  {error}")

    elif comando == "IMPRIMIR":
        radicado = tokens[1]
        salida.append(f"> IMPRIMIR {radicado}")
        try:
            expediente = sistema.buscar_expediente(radicado)
            salida.append(
                f"  EXPEDIENTE {expediente.radicado} | {expediente.solicitante} "
                f"| dependencia actual: {expediente.dependencia}"
            )
            vigentes = anulados = 0
            for folio in expediente.folios:
                salida.append(f"    folio {folio.numero} {folio.descripcion:<28} {folio.estado}")
                if folio.estado == "VIGENTE":
                    vigentes += 1
                else:
                    anulados += 1
            etiqueta_anulados = "anulado" if anulados == 1 else "anulados"
            salida.append(f"  folios: {vigentes + anulados} total, {vigentes} vigentes, {anulados} {etiqueta_anulados}")
            ruta = expediente.ruta_actual()
            salida.append(f"  ruta recorrida: {' > '.join(ruta)} (pila intacta)")
        except ValueError as error:
            salida.append(f"  ERROR: {error}")

    elif comando == "REPORTE":
        dia_actual = int(tokens[1].split("=")[1])
        salida.append(f"> REPORTE dia={dia_actual}")
        reporte = sistema.reporte(dia_actual)
        bandejas_str = " | ".join(f"{dep} {reporte['bandejas'][dep]}" for dep in DEPENDENCIAS)
        salida.append(f"  Bandejas: {bandejas_str}")
        salida.append(
            f"  Represados: {reporte['represados']}  "
            f"Archivados por R3: {reporte['archivados']}  "
            f"Resueltos: {reporte['resueltos']}"
        )
        devoluciones = ", ".join(
            f"{dep} {cantidad}" for dep, cantidad in reporte["devoluciones"].items() if cantidad > 0
        ) or "ninguna"
        salida.append(f"  Devoluciones por dependencia: {devoluciones}")
        if reporte["vencidos"]:
            vencidos_str = ", ".join(f"{r} ({d} dias habiles)" for r, d in reporte["vencidos"])
            salida.append(f"  VENCIDOS (R6): {vencidos_str}")
        else:
            salida.append("  VENCIDOS (R6): ninguno")

    else:
        salida.append(f"> {linea}")
        salida.append(f"  comando desconocido: {comando}")

    return "\n".join(salida)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python main.py <archivo_de_comandos>")
        sys.exit(1)
    ejecutar(sys.argv[1])
