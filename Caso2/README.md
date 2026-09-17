# Caso 2 — CentralAscensores

## El problema

Una empresa mantiene 300 ascensores y su central recibe dos tipos de llamada: **emergencias** (alguien atrapado en la cabina) y **mantenimientos** (ruidos, puertas, revisiones). Las cuadrillas atienden una llamada a la vez, y cuando un técnico llega a una emergencia sigue un protocolo de rescate de 5 pasos en orden fijo. Lo delicado es abortar: si el rescate se cancela a mitad de camino, el técnico tiene que deshacer cada maniobra ya ejecutada en orden inverso antes de irse, porque dejar el ascensor a medio intervenir (energía cortada, freno puesto, puertas bloqueadas) es más peligroso que no haber tocado nada. El enunciado completo está en [`Caso_Estudio_2.pdf`](Caso_Estudio_2.pdf).

## Qué pide el ejercicio

Construir `CentralAscensores` controlando tres cosas, cada una con su propia estructura hecha a mano (sin `list`, `Stack`, `Queue`, `deque` ni `Array` de respaldo):

- **Lista enlazada** — el parque completo de ascensores: se dan de alta y de baja contratos en cualquier momento, y se recorre entera para los reportes.
- **Dos colas** — una de llamadas `EMERGENCIA` y otra de `MANTENIMIENTO`. Dentro de cada tipo manda estrictamente el orden de llegada, pero hay una política de anti-inanición: cada 4 emergencias atendidas seguidas, toca un mantenimiento si hay alguno esperando.
- **Pila** — las maniobras del protocolo de rescate ya ejecutadas en la llamada en curso. Es la única estructura del caso donde el orden de deshacer *importa por seguridad física*, no solo por prolijidad: la regla obliga a validar el paso siguiente mirando el tope de la pila, no un contador aparte.

## Cómo se conecta el código

Mismo esquema de capas en Python y en TypeScript, cada archivo dependiendo solo de los de abajo:

| Capa | Python | TypeScript | Qué hace |
|---|---|---|---|
| Estructuras | [`estructuras.py`](Python/Back/estructuras.py) | [`estructuras.ts`](TypeScript/Back/estructuras.ts) | `Lista`, `Cola`, `Pila` genéricas, sin nada de negocio |
| Entidades | [`entidades.py`](Python/Back/entidades.py) | [`entidades.ts`](TypeScript/Back/entidades.ts) | `Ascensor`, `Llamada` y las constantes del protocolo (los 5 pasos y sus maniobras inversas) |
| Servicio | [`central.py`](Python/Back/central.py) | [`central.ts`](TypeScript/Back/central.ts) | La clase `CentralAscensores`: usa las dos capas anteriores para resolver R1-R7 y RF-01 a RF-08 |
| Reportes | [`reportes.py`](Python/Back/reportes.py) | [`reportes.ts`](TypeScript/Back/reportes.ts) | Toma el estado ya resuelto del servicio y arma el texto de `reporte()` |
| Runner | [`main.py`](Python/Back/main.py) | [`main.ts`](TypeScript/Back/main.ts) | Lee [`central.txt`](Python/Back/central.txt) comando por comando y llama al servicio |

Para levantarlo:

```bash
# Python
cd Python/Back
python main.py central.txt

# TypeScript
cd TypeScript/Back
npm install
npx tsc && node dist/main.js central.txt   # o: npx ts-node main.ts central.txt
```

Ambas versiones quedaron verificadas contra el mismo `central.txt`, salida idéntica carácter por carácter.

El caso no exige una interfaz gráfica utilizable, así que `Back/` ya es una solución completa por sí sola — de ahí que las carpetas de interfaz se llamen `Front (posible)/`, algo opcional y no una obligación del enunciado. Aun así, cada lenguaje trae una funcional: Tkinter en Python (`Python/Front (posible)/app.py`) y HTML+CSS con un servidor mínimo en TypeScript (`TypeScript/Front (posible)/server.ts` + `index.html`), ambas reutilizando esta misma capa de servicio (`CentralAscensores`) tal cual, sin reescribir ninguna regla. [`Python/GUIA.md`](<Python/GUIA.md>) y [`TypeScript/GUIA.md`](<TypeScript/GUIA.md>) explican cómo se conecta cada una.

## Preguntas de análisis

**1. ¿Por qué el protocolo de rescate debe modelarse con una pila, y qué error operativo se produciría si se deshicieran las maniobras en orden FIFO?**

Cada maniobra deja al ascensor en un estado físico que depende de las maniobras anteriores: no es seguro restablecer la energía (deshacer el paso 1) mientras el freno manual sigue enganchado (paso 3) y las puertas de piso siguen bloqueadas (paso 2). El orden seguro de reversa es siempre "lo último aplicado, lo primero deshecho" — soltar el freno, luego desbloquear puertas, y solo al final restablecer energía —, que es exactamente LIFO. Si se deshiciera en orden FIFO, la cabina podría quedar con energía y movimiento posible mientras el freno manual sigue mecánicamente enganchado y las puertas de piso siguen sin poder abrirse: un ascensor "vivo" con el freno de emergencia trabado, que puede dañar el mecanismo o dejar a alguien atrapado detrás de una puerta que ya no puede desbloquearse con el sistema energizado.

**2. La regla R1 mezcla prioridad con orden de llegada. Traza que demuestra que un mantenimiento no queda esperando indefinidamente:**

El algoritmo (`atender_siguiente`) lleva un contador de emergencias atendidas seguidas; en cuanto llega a 4 **y** hay un mantenimiento esperando, la siguiente atención se fuerza hacia esa cola sin importar si hay emergencias en espera, y el contador se reinicia. Traza real capturada con `central.txt`:

```
> LLAMADA ASC-118 EMERGENCIA 690
  ASC-118 en cola de EMERGENCIA
> ATENDER 700
  ASC-101 | MANTENIMIENTO | espera 215 min -> CUMPLE (objetivo 240)
```

En ese punto ya se habían atendido 4 emergencias seguidas y ASC-101 llevaba esperando desde el minuto 485. A pesar de que ASC-118 tenía una nueva emergencia esperando desde el minuto 690, `ATENDER 700` elige el mantenimiento: la elección se hace sobre de cuál cola se desencola, nunca reordenando elementos dentro de una cola, así que un mantenimiento nunca puede quedar esperando más de 4 emergencias.

**3. Costo de `registrarLlamada` en notación O-grande:**

Primero busca el ascensor en la lista del parque recorriéndola nodo por nodo — O(n), con n = tamaño del parque — y luego encola la llamada en la cola correspondiente, O(1) porque la cola mantiene punteros de cabeza y cola. El costo total es **O(n)**, dominado por la búsqueda; encolar no aporta costo adicional.

**4. Salida real ante los dos casos borde pedidos (pila vacía / ambas colas vacías):**

```
RECHAZADA no hay ninguna llamada en atencion en este momento
RECHAZADA no hay llamadas en espera en ninguna cola
```

`deshacerUltimo()` sin llamada en curso y `atenderSiguiente()` con ambas colas vacías se rechazan con un mensaje explícito; ninguno de los dos casos lanza una excepción sin controlar ni corrompe el estado de la central.

**5. Con 3 cuadrillas simultáneas: cuántas pilas, colas y listas.**

**3 pilas** (una por cuadrilla: cada protocolo de rescate en curso es independiente, y solo tiene sentido el tope de la pila de esa cuadrilla). **2 colas** (siguen siendo una por tipo, porque la prioridad y el orden de llegada son del sistema completo, no por cuadrilla; cada cuadrilla libre desencola de esas mismas colas compartidas). **1 lista** (el parque sigue siendo uno solo, el inventario completo de la empresa, no algo por cuadrilla).
