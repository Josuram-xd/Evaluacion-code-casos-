# Repaso — Lista, Cola y Pila con casos de estudio

Este repo nació de tres casos de evaluación distintos que comparten el mismo fondo: hay que construir, a mano, una lista enlazada, una cola y una pila, y usarlas para modelar un negocio real donde cada una cumple un papel que las otras dos no pueden cumplir. La idea de tenerlos todos juntos es poder repasar rápido: si en un examen cae uno de estos tres negocios, ya está resuelto y comentado; si cae otro completamente distinto, el patrón de ataque (mirar qué necesita orden de llegada, qué necesita reversa, qué necesita recorrido completo) es el mismo y aquí hay tres ejemplos de cómo se razona.

Cada caso está resuelto dos veces, en Python y en TypeScript, con el mismo comportamiento exacto, para poder comparar cómo se ve la misma idea en cada lenguaje.

## Los 3 casos

| Caso | Aplicación | Negocio | Lo que hace especial a la pila del caso |
|---|---|---|---|
| [Caso1](Caso1/README.md) — [PDF](Caso1/Caso_Estudio_1.pdf) | BiciTaller | Taller de mantenimiento de bicicletas públicas | Guarda las piezas desmontadas del puesto de trabajo; armar es desarmar en reversa |
| [Caso2](Caso2/README.md) — [PDF](Caso2/Caso_Estudio_2.pdf) | CentralAscensores | Central de emergencias de una empresa de ascensores | Guarda las maniobras del protocolo de rescate; abortar es deshacerlas en reversa |
| [Caso3](Caso3/README.md) — [PDF](Caso3/Caso_Estudio_3.pdf) | CuraduriaTramites | Curaduría urbana que tramita licencias de construcción | Guarda la ruta de dependencias del expediente; devolver es retroceder por esa ruta |

## Cómo está organizado cada caso

```
CasoN/
├── README.md                          De qué trata el caso + las respuestas al apartado 8 del PDF
├── Caso_Estudio_N.pdf                 Enunciado original — es la fuente de verdad si algo en el README queda corto
├── Python/
│   ├── GUIA.md                        Qué hay en Back/ y qué haría falta para un Front en Tkinter
│   ├── Back/                          Implementación completa, funciona por consola
│   │   └── NOTAS.md                   Qué hace cada archivo y cómo correrlo
│   └── Front (posible)/
│       └── NOTAS.md                   Cómo se conectaría una interfaz Tkinter con el Back (sin construirla)
└── TypeScript/                        Misma idea que Python/, con GUIA.md y NOTAS.md propios
    ├── GUIA.md
    ├── Back/
    │   └── NOTAS.md
    └── Front (posible)/
        └── NOTAS.md
```

Ningún caso pedía una interfaz gráfica utilizable — todos se resuelven leyendo un archivo de comandos y escribiendo la salida por consola — así que el trabajo real está en `Back/`. Las carpetas `Front (posible)/` quedan documentadas pero sin implementar, por si algún día vale la pena ponerle una cara.

## Por dónde empezar a leer

1. Este README (ya vas por acá).
2. El `README.md` del caso que te interese — trae el contexto de negocio, qué pide el PDF y las respuestas a las preguntas de análisis.
3. `Python/GUIA.md` o `TypeScript/GUIA.md` del mismo caso, según el lenguaje que quieras repasar — señala en qué orden conviene abrir los archivos de `Back/`.
4. El código en sí, y si algo no cuadra, el PDF (`Caso_Estudio_N.pdf`) manda sobre cualquier resumen.

## Reglas comunes a los tres casos

- Nada de `list`, `ArrayList`, `LinkedList`, `Stack`, `Queue`, `deque`, ni `Array` como respaldo de la lista/cola/pila exigidas — esas tres estructuras están escritas a mano en `estructuras.py` / `estructuras.ts` de cada caso.
- Encolar/desencolar y apilar/desapilar son O(1) en las tres implementaciones (cola con punteros a cabeza y cola, pila con puntero al tope).
- Cada caso lee un archivo de comandos de texto plano y va imprimiendo el resultado de cada comando, terminando en un `REPORTE` con métricas — el mismo molde en Python y en TypeScript.
