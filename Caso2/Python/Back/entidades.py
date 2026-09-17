"""
Entidades de dominio de CentralAscensores: datos y constantes del negocio,
sin logica de orquestacion (eso vive en central.py).
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Optional

# Protocolo fijo: paso -> (maniobra directa, maniobra inversa)
PROTOCOLO = {
    1: ("cortar energia", "restablecer energia"),
    2: ("bloquear puertas de piso", "desbloquear puertas de piso"),
    3: ("enganchar freno manual", "soltar freno manual"),
    4: ("nivelar cabina", "dejar cabina libre"),
    5: ("abrir puertas y evacuar", "cerrar puertas"),
}
TOTAL_PASOS = len(PROTOCOLO)

OBJETIVO_MINUTOS = {"EMERGENCIA": 30, "MANTENIMIENTO": 240}
LIMITE_EMERGENCIAS_ANTES_DE_MANTENIMIENTO = 4
EMERGENCIAS_PARA_FUERA_DE_SERVICIO = 3


@dataclass
class Ascensor:
    codigo: str
    edificio: str
    estado: str = "OPERATIVO"
    emergencias: int = 0
    activa: bool = False  # True si ya tiene una llamada en curso (R2)


@dataclass
class Llamada:
    codigo: str
    tipo: str
    minuto_llamada: int
    minuto_atencion: Optional[int] = None


class RechazoOperacion(Exception):
    """Se lanza cuando una operacion viola una regla de negocio (Rx)."""
