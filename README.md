# Repaso — Lista, Cola y Pila con casos de estudio

Repositorio personal de repaso: implementar las mismas tres estructuras de datos (**lista enlazada, cola y pila**, propias, sin usar las de la librería estándar) en **Python** y en **TypeScript**, aplicadas a un caso de negocio distinto en cada carpeta. La idea es tener ejemplos ya resueltos en ambos lenguajes para poder revisar rápido la estructura y el enfoque: si en una evaluación sale uno de estos mismos casos, ya está resuelto; si sale otro distinto, el patrón (estructuras propias + reglas de negocio + runner que procesa un archivo de comandos) es el mismo.

## Estructura del repositorio

```
Evaluacion-code-casos-/
├── README.md                   <- este archivo
├── Caso1/
│   ├── README.md                <- de qué va el caso + respuestas al apartado 8 del PDF
│   ├── Caso_Estudio_1.pdf        <- enunciado original
│   ├── Python/Back/              <- implementación en Python
│   ├── Python/Front (posible)/   <- sin usar por ahora
│   ├── TypeScript/Back/          <- implementación en TypeScript
│   └── TypeScript/Front (posible)/ <- sin usar por ahora
├── Caso2/                        <- misma estructura
└── Caso3/                        <- misma estructura
```

## Los 3 casos

| Caso | Nombre | Pila (lo distintivo del caso) |
|---|---|---|
| [Caso1](Caso1/README.md) | BiciTaller | Piezas desmontadas del puesto de trabajo (armar = desarmar en reversa) |
| [Caso2](Caso2/README.md) | CentralAscensores | Maniobras del protocolo de rescate (abortar = deshacer en reversa) |
| [Caso3](Caso3/README.md) | CuraduriaTramites | Ruta de dependencias recorrida por el expediente (devolver = retroceder) |

## Convención por caso

- **`Back` en Python y en TypeScript son obligatorios** y resuelven exactamente el mismo problema con el mismo formato de entrada/salida del PDF — sirven para comparar cómo se resuelve lo mismo en cada lenguaje.
- **`Front (posible)`** queda como carpeta reservada, sin implementar por ahora.
- El PDF de cada caso es la fuente de verdad completa (reglas, formato exacto de entrada/salida, rúbrica). El `README.md` de cada caso es solo un resumen de qué trata + las respuestas a las preguntas de análisis del PDF.
