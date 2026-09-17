"""
Runner de CentralAscensores: lee un archivo de comandos y ejecuta cada
linea sobre una instancia de CentralAscensores, imprimiendo el resultado
en el mismo estilo del PDF.

Uso:
    python main.py central.txt

Gramatica del archivo (una instruccion por linea, '#' inicia comentario):

    PARQUE
    <codigo>, <edificio>, <estado>, <emergencias>
    ...
    ---
    LLAMADA <codigo> <EMERGENCIA|MANTENIMIENTO> <minuto>
    ATENDER <minutoAtencion>
    PASO <n>
    DESHACER
    ABORTAR <motivo>
    CERRAR
    REPORTE
"""

import sys

from central import CentralAscensores
from entidades import RechazoOperacion


def quitar_comentario(linea: str) -> str:
    return linea.split("#", 1)[0].strip()


def cargar_archivo(ruta: str):
    with open(ruta, encoding="utf-8") as f:
        crudo = [linea.rstrip("\n") for linea in f]

    lineas = [quitar_comentario(l) for l in crudo]
    lineas = [l for l in lineas if l]

    assert lineas[0].upper() == "PARQUE", "el archivo debe empezar con PARQUE"
    filas_parque = []
    i = 1
    while lineas[i] != "---":
        partes = [p.strip() for p in lineas[i].split(",")]
        filas_parque.append(partes)
        i += 1
    comandos = lineas[i + 1:]
    return filas_parque, comandos


def procesar_linea(central: CentralAscensores, linea: str) -> list[str]:
    """Ejecuta una linea de comando sobre `central` y devuelve el resultado
    como lista de lineas (una sola para la mayoria de comandos, varias para
    ABORTAR y REPORTE). No imprime nada: la usan tanto main.py como el Front
    para no duplicar el despacho de comandos en dos lugares.
    """
    partes = linea.split()
    cmd = partes[0].upper()
    try:
        if cmd == "LLAMADA":
            _, codigo, tipo, minuto = partes
            return [central.registrar_llamada(codigo, tipo, int(minuto))]
        elif cmd == "ATENDER":
            return [central.atender_siguiente(int(partes[1]))]
        elif cmd == "PASO":
            return [central.ejecutar_paso(int(partes[1]))]
        elif cmd == "DESHACER":
            return [central.deshacer_ultimo()]
        elif cmd == "ABORTAR":
            return central.abortar_rescate(" ".join(partes[1:]))
        elif cmd == "CERRAR":
            return [central.cerrar_llamada()]
        elif cmd == "REPORTE":
            return central.reporte().splitlines()
        else:
            return [f"comando desconocido: {cmd}"]
    except RechazoOperacion as err:
        return [f"RECHAZADA {err}"]


def ejecutar(ruta: str) -> None:
    filas_parque, comandos = cargar_archivo(ruta)
    central = CentralAscensores()
    central.cargar_parque(filas_parque)

    for linea in comandos:
        print(f"> {linea}")
        cmd = linea.split()[0].upper()
        resultado = procesar_linea(central, linea)
        if cmd == "REPORTE":
            print("\n".join(resultado))
        else:
            for l in resultado:
                print(" ", l)


if __name__ == "__main__":
    ruta = sys.argv[1] if len(sys.argv) > 1 else "central.txt"
    ejecutar(ruta)
