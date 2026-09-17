# Builder 3 — CuraduriaTramites

> Guía general del repositorio: [`../README.md`](../README.md). Fuente de verdad completa: [`Caso_Estudio_3.pdf`](Caso_Estudio_3.pdf). Este README es un resumen operativo; ante cualquier ambigüedad, el PDF manda.

## 1. Contexto

Una curaduría urbana recibe solicitudes de licencia de construcción. Cada solicitud se radica y se convierte en un **expediente** que pasa, en orden fijo, por cuatro dependencias: `RECEPCIÓN -> JURÍDICA -> TÉCNICA -> URBANÍSTICA`, y solo entonces llega a `RESOLUCIÓN`. Cada dependencia tiene su propia bandeja de entrada y atiende en el orden de llegada. El expediente crece con **folios numerados consecutivamente que nunca se borran ni renumeran** (si quedan sin efecto, se anulan). Cuando una dependencia encuentra observaciones, **devuelve** el expediente a la dependencia anterior (y si allí lo devuelven otra vez, retrocede un paso más).

Debes construir la aplicación **CuraduriaTramites**, que controla el expediente, las bandejas y ese retroceso.

## 2. Estructuras de datos exigidas (las tres, obligatorias)

| Estructura | Qué modela | Por qué |
|---|---|---|
| **Lista enlazada** | Folios de cada expediente, en orden de incorporación. | Se agregan al final, se recorre completa para imprimir, y los folios se anulan sin eliminarse ni renumerarse. |
| **Cola** (una por dependencia) | Bandeja de entrada de cada dependencia. | FIFO: se atiende en el orden en que llegó a esa dependencia. |
| **Pila** (una por expediente) | Ruta ya recorrida por el expediente. | Devolver = volver sobre los pasos: la última dependencia visitada es la primera a la que se regresa. LIFO. |

Importante: **la lista de folios y la pila de ruta son por expediente** (no globales); las colas son una por dependencia. Prohibido usar `List`, `ArrayList`, `LinkedList`, `Stack`, `Queue`, `deque` de la librería estándar.

## 3. Datos de un expediente y de un folio

| Atributo | Tipo | Descripción |
|---|---|---|
| `radicado` | cadena | Número de radicación, ej. `11001-2026-0147`. |
| `solicitante` | cadena | Propietario o apoderado. |
| `dependencia` | cadena | Dependencia donde está el expediente ahora. |
| `devoluciones` | entero | Número de veces devuelto. |
| `diaRadicacion` | entero | Día hábil de radicación (para el plazo legal). |
| `folio.numero` | entero | Consecutivo dentro del expediente, empieza en 1, nunca se reutiliza. |
| `folio.estado` | cadena | `VIGENTE` o `ANULADO`. |

## 4. Reglas de negocio

| ID | Regla |
|---|---|
| R1 | Orden de dependencias fijo, no se puede saltar ninguna. |
| R2 | Devolución: retrocede a la dependencia inmediatamente anterior **según la ruta recorrida** y entra al final de esa bandeja. Un expediente en `RECEPCIÓN` no puede devolverse. |
| R3 | 3 devoluciones → se archiva por desistimiento (sale del trámite, va a la lista de archivados). |
| R4 | Folios consecutivos, sin reutilización. Anular **no** elimina ni renumera; solo cambia el estado a `ANULADO`. |
| R5 | No puede avanzar a `RESOLUCIÓN` con menos de 4 folios vigentes. |
| R6 | Plazo legal: 45 días hábiles desde radicación. Si se supera, se marca `VENCIDO` (aparece en reporte aparte) pero el trámite continúa. |
| R7 | Cada bandeja tiene capacidad máxima de 20 expedientes. Si está llena, el expediente espera en la **cola de represamiento general** y entra apenas se libere un cupo. |

**Trampa del caso:** anular un folio (R4) no es lo mismo que eliminarlo, y devolver un expediente no es lo mismo que restarle uno a un contador de etapa. Ambas reglas existen para que el trámite pueda reconstruirse tal como ocurrió — tu implementación debe reflejar esa diferencia.

## 5. Requerimientos funcionales

| ID | Operación | Comportamiento |
|---|---|---|
| RF-01 | `radicar(solicitante, dia)` | Crea el expediente, lo encola en `RECEPCIÓN`, apila `RECEPCIÓN` en su ruta, agrega folio 1 (solicitud). |
| RF-02 | `agregarFolio(radicado, descripcion)` | Agrega folio al final con el siguiente consecutivo (R4). |
| RF-03 | `anularFolio(radicado, numero)` | Marca folio como `ANULADO`. Valida existencia y que no esté ya anulado. No renumera. |
| RF-04 | `atenderSiguiente(dependencia)` | Toma el primer expediente de la bandeja (FIFO), lo deja listo para decisión. |
| RF-05 | `avanzar(radicado)` | Envía a la siguiente dependencia, apila en su ruta, encola en destino. Valida R1, R5, R7. |
| RF-06 | `devolver(radicado, observacion)` | Aplica R2: desapila la dependencia actual, encola al final de la bandeja anterior, incrementa contador, aplica R3 si corresponde. |
| RF-07 | `imprimirExpediente(radicado)` | Recorre folios (número, descripción, estado) y muestra la ruta recorrida **sin destruirla**. |
| RF-08 | `reporte(diaActual)` | Estado de bandejas, expedientes vencidos (R6) y métricas (sección 7). |

## 6. Restricciones de implementación

- Lista, cola y pila propias.
- Cola y pila **O(1)**.
- `imprimirExpediente` (RF-07) no puede destruir la pila: si la vacías para imprimirla, debes dejarla exactamente igual al terminar.
- La devolución (R2) se resuelve **consultando la pila de ruta**, nunca calculando la dependencia anterior con un índice o un `if` por dependencia.

## 7. Métricas del reporte

- Expedientes en cada bandeja y en la cola de represamiento.
- Expedientes por dependencia actual, archivados por R3 y resueltos.
- Devoluciones por dependencia (para ver cuál devuelve más).
- Expedientes vencidos según R6, con días transcurridos.
- Por expediente: total de folios, vigentes y anulados.

## 8. Formato de entrada/salida (ejemplo, ver PDF para el completo)

Archivo `tramites.txt`:
```
DEPENDENCIAS: RECEPCION > JURIDICA > TECNICA > URBANISTICA > RESOLUCION
CAPACIDAD_BANDEJA: 20 PLAZO_DIAS: 45
---
RADICAR Ana Restrepo dia=1
ATENDER RECEPCION
AVANZAR 11001-2026-0001
ATENDER JURIDICA
DEVOLVER 11001-2026-0001 planos_sin_firma_de_ingeniero
ANULAR 11001-2026-0001 2
IMPRIMIR 11001-2026-0001
REPORTE dia=50
```

Ejemplo de salida esperada:
```
> DEVOLVER 11001-2026-0001 planos_sin_firma_de_ingeniero
ruta antes : RECEPCION > JURIDICA > TECNICA (tope = TECNICA)
se desapila TECNICA -> regresa al final de la bandeja de JURIDICA
devoluciones = 1 de 3
```

## 9. Preguntas de análisis (van en el informe)

1. Por qué la ruta del expediente se modela con una pila y no con un contador de etapa; escenario de devoluciones sucesivas donde el contador daría un resultado incorrecto.
2. Por qué los folios se modelan con una lista y no con cola o pila, en relación con R4.
3. Cómo se imprime la ruta recorrida sin destruir la pila: estructuras auxiliares usadas y costo O-grande.
4. Costo de `agregarFolio` en tu implementación; si tu lista solo guarda la cabeza el costo es O(n) — propone el cambio a O(1) y qué debe mantenerse actualizado.
5. R7 crea una cola de represamiento: qué problema aparecería si, en lugar de represar, los expedientes se insertaran al frente de la bandeja destino apenas hubiera cupo.

## 10. Rúbrica

| Criterio | Puntos |
|---|---|
| Lista propia de folios (R4) | 20 |
| Colas propias por dependencia (R1, R7) | 20 |
| Pila propia de ruta (R2) | 20 |
| Reglas R3, R5 y R6 | 15 |
| Reportes y métricas | 15 |
| Informe y justificación de las tres estructuras | 10 |

## 11. Estructura de carpetas de este caso

```
Caso3/
├── README.md                  <- este archivo
├── Caso_Estudio_3.pdf
├── Python/
│   ├── Back/                  <- CuraduriaTramites en Python
│   └── Front (posible)/       <- interfaz opcional sobre el back de Python
└── TypeScript/
    ├── Back/                  <- CuraduriaTramites en TypeScript (misma lógica, mismo formato de E/S)
    └── Front (posible)/       <- interfaz opcional sobre el back de TypeScript
```

## 12. Entregables

- [ ] `Python/Back` funcional, procesa `tramites.txt` y reproduce la salida esperada.
- [ ] `TypeScript/Back` funcional, equivalente al de Python.
- [ ] Informe con las 5 preguntas de análisis (sugerido: `Caso3/informe.md`).
- [ ] (Opcional) Front en uno o ambos lenguajes.

## 13. Notas del builder

*(Espacio para que el builder registre decisiones propias.)*
