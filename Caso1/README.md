# Builder 1 — BiciTaller

> Guía general del repositorio: [`../README.md`](../README.md). Fuente de verdad completa: [`Caso_Estudio_1.pdf`](Caso_Estudio_1.pdf). Este README es un resumen operativo para trabajar sin tener que releer el PDF a cada paso; ante cualquier ambigüedad, el PDF manda.

## 1. Contexto

Taller de mantenimiento de un sistema de bicicletas públicas: 1.200 bicicletas, 40 estaciones, un solo puesto de trabajo. Las bicicletas se reparan **en el orden en que llegaron** al taller, y el mecánico desarma la bicicleta pieza por pieza sobre una mesa, montándola luego en orden inverso al desarmado. Dos problemas actuales: bicicletas que esperan semanas un repuesto sin seguimiento, y bicicletas mal armadas porque el montaje no respetó el orden del desarmado.

Debes construir la aplicación **BiciTaller**, que controla tres cosas: la flota, el turno de atención y el armado.

## 2. Estructuras de datos exigidas (las tres, obligatorias)

| Estructura | Qué modela | Por qué |
|---|---|---|
| **Lista enlazada** | La flota completa: bicicletas con estado, estación y reparaciones acumuladas. | Altas/bajas en cualquier posición, recorrido completo para reportes. Sin orden de llegada ni apilamiento. |
| **Cola** | Turno de reparación del taller + espera por repuestos. | FIFO: primero en entrar, primero en atenderse. Es la equidad del taller. |
| **Pila** | Piezas desmontadas de la bicicleta en el puesto de trabajo. | LIFO físico: solo se puede tomar la pieza de encima; montar = desarmar en reversa. |

Una solución que use una sola estructura para todo no se acepta. Prohibido usar `List`, `ArrayList`, `LinkedList`, `Stack`, `Queue`, `deque` de la librería estándar — implementa tus propias estructuras.

## 3. Datos de una bicicleta

| Atributo | Tipo | Descripción |
|---|---|---|
| `codigo` | cadena | Identificador, ej. `BIC-0412`. |
| `estacion` | cadena | Estación a la que pertenece. |
| `estado` | cadena | `OPERATIVA`, `REPORTADA`, `EN_TALLER`, `ESPERA_REPUESTO`, `DE_BAJA`. |
| `reparaciones` | entero | Reparaciones acumuladas en el trimestre. |
| `falla` | cadena | Descripción de la falla (vacío si está operativa). |

## 4. Reglas de negocio

| ID | Regla |
|---|---|
| R1 | Solo entra al taller una bicicleta registrada en la flota con estado `REPORTADA`. Cualquier otro caso se rechaza con mensaje explícito. |
| R2 | Atención estrictamente por orden de llegada. No hay forma de adelantar una bicicleta en la cola. |
| R3 | Cada pieza desmontada se apila. Para montar solo se puede tomar la pieza del tope. |
| R4 | Falta de repuesto: se suspende la reparación. Las piezas desmontadas se guardan **conservando su orden**, la bicicleta pasa a la cola `ESPERA_REPUESTO`, el puesto queda libre. |
| R5 | Al llegar el repuesto: la bicicleta sale de la cola de espera, vuelve al **final** de la cola del taller, y al retomarla la pila de piezas debe quedar **idéntica** a como estaba al suspender. |
| R6 | Una orden no puede cerrarse si la pila de piezas no está vacía (bicicleta incompleta). |
| R7 | 3 reparaciones en el trimestre → `DE_BAJA`: sale de la flota activa y entra a la lista de bajas. |

**Trampa del caso (R4+R5):** guardar una pila y volver a cargarla tiende a invertir el orden si se usa una sola estructura auxiliar. Resuelve cuántas transferencias necesitas para conservar el orden y explícalo en el informe.

## 5. Requerimientos funcionales

| ID | Operación | Comportamiento |
|---|---|---|
| RF-01 | `cargarFlota(archivo)` | Construye la lista de bicicletas ordenada por código, a partir del archivo. Rechaza códigos duplicados. |
| RF-02 | `buscar(codigo)` | Devuelve la bicicleta o informa que no existe. Validación previa de las demás operaciones. |
| RF-03 | `reportarFalla(codigo, falla)` | Cambia estado a `REPORTADA`. Valida R1. |
| RF-04 | `recibirEnTaller(codigo)` | Encola en el taller, estado `EN_TALLER`. Valida R1 y capacidad de la cola. |
| RF-05 | `iniciarReparacion()` | Toma la siguiente bicicleta de la cola (FIFO), pila de piezas vacía. |
| RF-06 | `desmontar(pieza)` / `montar()` | Apila/desapila piezas. `montar()` sobre pila vacía = error explícito. |
| RF-07 | `suspender(motivo)` / `reanudar(codigo)` | Aplica R4 y R5. |
| RF-08 | `cerrarOrden()` | Valida R6, incrementa reparaciones, aplica R7 si corresponde, vuelve a `OPERATIVA`. |
| RF-09 | `reporte()` | Imprime flota, cola de espera, cola de repuestos y métricas (sección 7). |

## 6. Restricciones de implementación

- Lista, cola y pila propias — nada de colecciones estándar.
- Cola y pila deben ser **O(1)** (desencolar no desplaza elementos).
- Toda operación valida precondiciones (pila vacía, cola vacía/llena, bicicleta inexistente, estado incorrecto).
- La reanudación (R5) debe restaurar el orden **exacto**. Demuestra con una traza que no se invierte.

## 7. Métricas del reporte

- Bicicletas por estado.
- Longitud actual de cola del taller y de espera de repuestos.
- Tiempo (en turnos) entre `recibirEnTaller` e `iniciarReparacion` por bicicleta.
- Órdenes cerradas, suspendidas y rechazadas por armado incompleto (R6).
- Bicicletas dadas de baja por R7, con estación de origen.

## 8. Formato de entrada/salida (ejemplo, ver PDF para el completo)

Archivo `taller.txt`:
```
FLOTA
BIC-0101, Parque Norte, OPERATIVA, 0
BIC-0412, Universidad, OPERATIVA, 2
BIC-0530, Estadio, OPERATIVA, 0
BIC-0777, Centro, OPERATIVA, 1
---
REPORTAR BIC-0412 frenos sueltos
RECIBIR BIC-0412
INICIAR
DESMONTAR cable_freno
DESMONTAR manubrio
SUSPENDER falta_zapata
REANUDAR BIC-0412
MONTAR
MONTAR
CERRAR
REPORTE
```

Ejemplo de rechazo esperado:
```
> RECIBIR BIC-0101
RECHAZADA (R1): estado OPERATIVA, no fue reportada
```

## 9. Preguntas de análisis (van en el informe)

1. Por qué la flota no puede modelarse con una cola, y por qué el turno del taller no puede modelarse con una pila (comportamiento del negocio, no implementación).
2. Cómo se guarda y restaura la pila de piezas (R4/R5) conservando el orden: número de transferencias y costo O-grande.
3. Qué pasa si se intenta `montar()` con pila vacía o `cerrarOrden()` con piezas pendientes — mostrar la salida real del programa.
4. Costo de `buscar(codigo)` en tu lista, y una mejora posible con su costo adicional.
5. Si el taller abriera un segundo puesto de trabajo: qué estructuras se duplican y cuáles siguen siendo una sola.

## 10. Rúbrica

| Criterio | Puntos |
|---|---|
| Lista propia (flota): alta, baja, búsqueda | 20 |
| Cola propia y turno FIFO | 20 |
| Pila propia y armado inverso | 20 |
| Reglas R4/R5 (suspender/reanudar) | 15 |
| Validaciones, reportes y métricas | 15 |
| Informe y justificación de las tres estructuras | 10 |

## 11. Estructura de carpetas de este caso

```
Caso1/
├── README.md                  <- este archivo
├── Caso_Estudio_1.pdf
├── Python/
│   ├── Back/                  <- BiciTaller en Python (lista/cola/pila propias + reglas + runner de comandos)
│   └── Front (posible)/       <- interfaz opcional sobre el back de Python
└── TypeScript/
    ├── Back/                  <- BiciTaller en TypeScript (misma lógica, mismo formato de E/S)
    └── Front (posible)/       <- interfaz opcional sobre el back de TypeScript
```

## 12. Entregables

- [ ] `Python/Back` funcional, procesa `taller.txt` y reproduce la salida esperada.
- [ ] `TypeScript/Back` funcional, equivalente al de Python.
- [ ] Informe con las 5 preguntas de análisis (sugerido: `Caso1/informe.md`).
- [ ] (Opcional) Front en uno o ambos lenguajes.

## 13. Notas del builder

*(Espacio para que el builder registre decisiones propias: por ejemplo si se omite el front, o si se prioriza un lenguaje sobre otro y por qué.)*
