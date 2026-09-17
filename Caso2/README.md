# Builder 2 — CentralAscensores

> Guía general del repositorio: [`../README.md`](../README.md). Fuente de verdad completa: [`Caso_Estudio_2.pdf`](Caso_Estudio_2.pdf). Este README es un resumen operativo; ante cualquier ambigüedad, el PDF manda.

## 1. Contexto

Empresa de mantenimiento con 300 ascensores. Su central telefónica recibe dos tipos de llamada: **emergencias** (personas atrapadas) y **mantenimientos** (ruidos, puertas, revisiones). Las cuadrillas atienden una llamada a la vez. En una emergencia, el técnico ejecuta un **protocolo de rescate** fijo paso a paso; si debe abortar, está obligado a deshacer cada maniobra ya ejecutada **en orden inverso** antes de retirarse (dejar el ascensor a medio intervenir es más peligroso que no haber empezado).

Debes construir la aplicación **CentralAscensores**, que controla el parque, el turno de atención y el estado del protocolo.

## 2. Estructuras de datos exigidas (las tres, obligatorias)

| Estructura | Qué modela | Por qué |
|---|---|---|
| **Lista enlazada** | Parque de ascensores: equipo, edificio, estado, contador de emergencias. | Altas/bajas de contrato en cualquier momento, recorrido completo para reportes. |
| **Cola** (dos colas) | Llamadas en espera: una de `EMERGENCIA` y una de `MANTENIMIENTO`. | Dentro de cada tipo manda el orden de llegada. |
| **Pila** | Maniobras del protocolo de rescate ya ejecutadas en la llamada en curso. | Abortar exige deshacer la última maniobra primero. LIFO puro. |

Prohibido usar `List`, `ArrayList`, `LinkedList`, `Stack`, `Queue`, `deque` de la librería estándar — implementa tus propias estructuras.

## 3. Datos de un ascensor y de una llamada

| Atributo | Tipo | Descripción |
|---|---|---|
| `codigo` | cadena | Identificador, ej. `ASC-118`. |
| `edificio` | cadena | Nombre y dirección. |
| `estado` | cadena | `OPERATIVO`, `EN_ATENCION`, `FUERA_DE_SERVICIO`. |
| `emergencias` | entero | Emergencias atendidas en los últimos 30 días. |
| `tipoLlamada` | cadena | `EMERGENCIA` o `MANTENIMIENTO`. |
| `minutoLlamada` | entero | Minuto del día en que entró la llamada (para tiempo de respuesta). |

**Protocolo de rescate (orden fijo):** 1) cortar energía · 2) bloquear puertas de piso · 3) enganchar freno manual · 4) nivelar cabina · 5) abrir puertas y evacuar. Cada paso tiene su maniobra inversa (restablecer energía, desbloquear puertas, soltar freno, dejar cabina libre).

## 4. Reglas de negocio

| ID | Regla |
|---|---|
| R1 | Emergencias antes que mantenimientos, **pero** por cada 4 emergencias atendidas debe atenderse 1 mantenimiento si hay alguno esperando (anti-inanición). El contador se reinicia al atender un mantenimiento. |
| R2 | Un ascensor con llamada activa no puede recibir otra: se rechaza como duplicada (validado sobre la lista del parque). |
| R3 | No se puede ejecutar el paso `n` si no se ejecutó el `n-1`. La validación se hace mirando el **tope de la pila**, no un contador aparte. |
| R4 | Abortar obliga a deshacer todas las maniobras ejecutadas en orden inverso hasta vaciar la pila. Solo entonces se cierra como `ABORTADA`. |
| R5 | Cierre exitoso de emergencia exige protocolo completo hasta el paso 5 (pila con los 5 pasos), si no, se rechaza el cierre. |
| R6 | Tiempo objetivo de respuesta: 30 min emergencias, 240 min mantenimientos (desde `minutoLlamada` hasta inicio de atención). Se marca `CUMPLE`/`INCUMPLE`. |
| R7 | 3 emergencias en 30 días → `FUERA_DE_SERVICIO`, no admite nuevas llamadas hasta revisión mayor. |

**Trampa del caso:** R4 exige dejar el ascensor en el mismo estado físico en que se encontró. Si tu pila solo guarda el número del paso (no la maniobra inversa asociada), el informe debe explicar cómo reconstruyes esa maniobra al deshacer.

## 5. Requerimientos funcionales

| ID | Operación | Comportamiento |
|---|---|---|
| RF-01 | `cargarParque(archivo)` | Construye la lista de ascensores. Rechaza códigos duplicados. |
| RF-02 | `registrarLlamada(codigo, tipo, minuto)` | Valida R2 y R7, encola en la cola correspondiente. |
| RF-03 | `atenderSiguiente()` | Selecciona próxima llamada aplicando R1, marca `EN_ATENCION`, calcula tiempo de respuesta (R6), inicia protocolo con pila vacía. |
| RF-04 | `ejecutarPaso(n)` | Apila la maniobra del paso `n` validando R3. |
| RF-05 | `deshacerUltimo()` | Desapila la última maniobra y reporta la maniobra inversa aplicada. |
| RF-06 | `abortarRescate(motivo)` | Aplica R4: deshace todo en orden inverso, cierra como `ABORTADA`. |
| RF-07 | `cerrarLlamada()` | Valida R5, incrementa contador de emergencias, aplica R7 si corresponde, ascensor vuelve a `OPERATIVO`. |
| RF-08 | `reporte()` | Bitácora de la jornada + métricas (sección 7). |

## 6. Restricciones de implementación

- Lista, cola y pila propias.
- Cola y pila **O(1)**.
- R3 se valida consultando el **tope de la pila**, no un contador de "último paso" aparte — se considera incorrecto usar solo un entero.
- La política anti-inanición (R1) se resuelve eligiendo **de cuál cola se desencola**, nunca reordenando elementos dentro de una cola.
- Toda operación valida precondiciones (pila vacía, colas vacías, ascensor inexistente, llamada duplicada, fuera de servicio).

## 7. Métricas del reporte

- Llamadas atendidas por tipo y llamadas que quedaron en cola al cierre.
- Tiempo de respuesta promedio y máximo por tipo, y % de cumplimiento de R6.
- Rescates completados vs. abortados, con motivo de cada aborto.
- Llamadas rechazadas por duplicado (R2) y por fuera de servicio (R7).
- Ascensores que pasaron a `FUERA_DE_SERVICIO` en la jornada.

## 8. Formato de entrada/salida (ejemplo, ver PDF para el completo)

Archivo `central.txt`:
```
PARQUE
ASC-101, Torre Bolivar, OPERATIVO, 0
ASC-118, Edificio Aurora, OPERATIVO, 2
---
LLAMADA ASC-118 EMERGENCIA 480
ATENDER
PASO 1
PASO 3
PASO 2
PASO 3
ABORTAR llegaron_bomberos
REPORTE
```

Ejemplo de rechazo esperado:
```
> PASO 3
RECHAZADO (R3): el tope de la pila es el paso 1, se esperaba ejecutar el paso 2
```

## 9. Preguntas de análisis (van en el informe)

1. Por qué el protocolo de rescate debe modelarse con una pila, y qué error operativo se produciría si se deshicieran las maniobras en orden FIFO en lugar de inverso.
2. R1 mezcla prioridad con orden de llegada: describe el algoritmo de selección y demuestra con una traza que un mantenimiento no queda esperando indefinidamente.
3. Costo O-grande de `registrarLlamada`, separando validación sobre la lista y encolado.
4. Qué pasa si se intenta `deshacerUltimo()` con pila vacía o `atenderSiguiente()` con ambas colas vacías — mostrar la salida real.
5. Con 3 cuadrillas simultáneas: cuántas pilas, colas y listas tendría el sistema. Justificar cada respuesta.

## 10. Rúbrica

| Criterio | Puntos |
|---|---|
| Lista propia (parque): alta, baja, búsqueda | 15 |
| Colas propias y política R1 | 25 |
| Pila propia y protocolo (R3, R4, R5) | 25 |
| Métricas y cumplimiento de R6 | 15 |
| Validaciones y casos borde | 10 |
| Informe y justificación de las tres estructuras | 10 |

## 11. Estructura de carpetas de este caso

```
Caso2/
├── README.md                  <- este archivo
├── Caso_Estudio_2.pdf
├── Python/
│   ├── Back/                  <- CentralAscensores en Python
│   └── Front (posible)/       <- interfaz opcional sobre el back de Python
└── TypeScript/
    ├── Back/                  <- CentralAscensores en TypeScript (misma lógica, mismo formato de E/S)
    └── Front (posible)/       <- interfaz opcional sobre el back de TypeScript
```

## 12. Entregables

- [ ] `Python/Back` funcional, procesa `central.txt` y reproduce la salida esperada.
- [ ] `TypeScript/Back` funcional, equivalente al de Python.
- [ ] Informe con las 5 preguntas de análisis (sugerido: `Caso2/informe.md`).
- [ ] (Opcional) Front en uno o ambos lenguajes.

## 13. Notas del builder

*(Espacio para que el builder registre decisiones propias.)*
