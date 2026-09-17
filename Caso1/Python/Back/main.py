"""
Runner de comandos para BiciTaller.

Uso:
    python main.py taller.txt

El archivo de entrada trae un bloque FLOTA (una bicicleta por línea,
separada por comas), un separador "---" y luego un comando por línea.
"""

import sys

from bicitaller import BiciTaller


def _sin_comentario(linea):
    return linea.split("#", 1)[0].strip()


def leer_flota(lineas, i):
    while i < len(lineas) and lineas[i].strip() != "FLOTA":
        i += 1
    i += 1
    filas = []
    while i < len(lineas) and lineas[i].strip() != "---":
        cruda = _sin_comentario(lineas[i])
        i += 1
        if not cruda:
            continue
        codigo, estacion, estado, reparaciones = (p.strip() for p in cruda.split(","))
        filas.append((codigo, estacion, estado, int(reparaciones)))
    return filas, i + 1  # saltar la línea "---"


def ejecutar_comando(taller, cruda):
    partes = cruda.split(maxsplit=2)
    cmd = partes[0].upper()

    if cmd == "REPORTAR":
        falla = partes[2] if len(partes) > 2 else ""
        return taller.reportar_falla(partes[1], falla)
    if cmd == "RECIBIR":
        return taller.recibir_en_taller(partes[1])
    if cmd == "INICIAR":
        return taller.iniciar_reparacion()
    if cmd == "DESMONTAR":
        return taller.desmontar(partes[1])
    if cmd == "MONTAR":
        return taller.montar()
    if cmd == "SUSPENDER":
        motivo = partes[1] if len(partes) > 1 else ""
        return taller.suspender(motivo)
    if cmd == "REANUDAR":
        return taller.reanudar(partes[1])
    if cmd == "CERRAR":
        return taller.cerrar_orden()
    if cmd == "REPORTE":
        return taller.reporte()
    return f"Comando desconocido: {cmd}"


def main():
    if len(sys.argv) != 2:
        print("uso: python main.py <archivo_comandos>")
        return

    with open(sys.argv[1], encoding="utf-8") as f:
        lineas = [linea.rstrip("\n") for linea in f]

    taller = BiciTaller()
    filas, i = leer_flota(lineas, 0)
    for mensaje in taller.cargar_flota(filas):
        print(mensaje)

    while i < len(lineas):
        cruda = _sin_comentario(lineas[i])
        i += 1
        if not cruda:
            continue
        print(f"> {cruda}")
        print(ejecutar_comando(taller, cruda))
        print()


if __name__ == "__main__":
    main()
