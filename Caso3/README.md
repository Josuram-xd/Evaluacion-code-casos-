# Caso 3 — CuraduriaTramites

Una curaduría urbana recibe solicitudes de licencia de construcción. Cada solicitud se convierte en un **expediente** que pasa, en orden fijo, por cuatro dependencias (`RECEPCION -> JURIDICA -> TECNICA -> URBANISTICA`) antes de llegar a `RESOLUCION`. Cada dependencia atiende por orden de llegada. El expediente crece con **folios** numerados de forma consecutiva que nunca se borran ni se renumeran (si quedan sin efecto, se anulan). Cuando una dependencia encuentra observaciones, **devuelve** el expediente a la dependencia inmediatamente anterior según la ruta realmente recorrida. Este proyecto simula ese trámite: el **expediente** (sus folios), las **bandejas** de cada dependencia y ese **retroceso**.

Las tres estructuras son propias (sin `list`/`Array` como backing, sin `Stack`/`Queue`/`deque`):

- **Lista enlazada** (una por expediente) → los folios: se agregan al final, se recorren completos para imprimir, y se marcan como anulados sin eliminarse ni renumerarse.
- **Cola** (una por dependencia, más una cola general de represamiento) → la bandeja de entrada de cada dependencia: FIFO estricto.
- **Pila** (una por expediente) → la ruta recorrida: devolver es volver sobre los pasos, la última dependencia visitada es la primera a la que se regresa (LIFO).

Hay dos implementaciones equivalentes, ambas leyendo el mismo `tramites.txt` y produciendo la misma salida (verificado ejecutando ambas):

- `Python/Back/` — `estructuras.py` (Lista/Cola/Pila genéricas), `entidades.py` (Folio y Expediente, con su propia lista de folios y su propia pila de ruta), `curaduria.py` (solo la clase orquestadora `CuraduriaTramites`: bandejas por dependencia, represamiento, reglas R1-R7, RF-01..RF-08), `reportes.py` (armado del reporte/métricas), `main.py` (runner). Ejecutar con `python main.py tramites.txt`.
- `TypeScript/Back/` — mismos módulos en `.ts` (`estructuras.ts`, `entidades.ts`, `curaduria.ts`, `reportes.ts`, `main.ts`). Ejecutar con `npx --yes tsx main.ts tramites.txt` (o `npx tsc && node dist/main.js tramites.txt`).

## Preguntas de análisis

**1. ¿Por qué la ruta del expediente se modela con una pila y no con un contador de etapa? Escenario de devoluciones sucesivas donde el contador daría un resultado incorrecto.**

Un contador de etapa solo guarda la posición *actual*, no el historial de cómo se llegó ahí. Nuestro `avanzar()` apila la dependencia destino cada vez que se invoca, incluso si esa dependencia ya había sido visitada antes en el mismo expediente; `devolver()` simplemente desapila. Eso hace que la pila sea, en todo momento, un registro exacto de la secuencia real de visitas, mientras que un contador solo puede representar "en qué paso voy", perdiendo cuántas veces se pasó por cada una. Escenario concreto: un expediente avanza RECEPCION→JURIDICA→TECNICA, es devuelto a JURIDICA, avanza otra vez a TECNICA, y es devuelto una segunda vez. Con la pila, en ese punto `ruta` contiene `[RECEPCION, JURIDICA]` y el tope (JURIDICA) es exactamente la dependencia correcta a la que se debe regresar. Un contador de etapa que intente calcular "dependencia anterior" a partir de aritmética sobre el total de avances menos el total de devoluciones (en vez de sobre la secuencia real) se desincroniza apenas hay un avance después de una devolución previa: el número de devoluciones acumuladas (que usamos para R3 y nunca se resetea) ya no corresponde a "cuántos pasos hay que retroceder desde la posición máxima", porque esa posición máxima cambió con el reavance. La pila no tiene ese problema porque cada `avanzar`/`devolver` es una operación simétrica (push/pop) sobre el mismo dato, nunca un cálculo derivado.

**2. ¿Por qué los folios se modelan con una lista y no con una cola o una pila? Relación con R4.**

R4 exige dos cosas a la vez: que los folios se puedan recorrer completos en su orden de creación (para `imprimirExpediente`) y que cualquiera de ellos —no solo el primero o el último— pueda anularse sin eliminarse ni renumerar los demás. Una cola solo expone el frente para sacar elementos (semántica de "atender y descartar"), y una pila solo expone el tope: ninguna de las dos permite "entrar hasta la mitad, cambiar un campo, y dejar todo lo demás intacto en su lugar" sin romper su propia disciplina de acceso. La lista enlazada sí: `agregar()` añade al final en O(1) gracias al puntero a cola, y `anularFolio()` recorre buscando el folio por número y solo cambia su campo `estado`, sin tocar el enlace de nodos ni el orden de los demás. Es la única de las tres estructuras cuyo contrato es "conservar todo, en orden, y permitir tocar cualquier elemento in-place".

**3. ¿Cómo se imprime la ruta recorrida sin destruir la pila? Estructuras auxiliares y costo O-grande.**

`rutaActual()` (en `Expediente`) usa una **pila auxiliar** temporal: mientras la pila original no esté vacía, se desapila un elemento y se apila en la auxiliar (esto invierte el orden). Luego se hace lo mismo a la inversa, desapilando de la auxiliar y apilando de vuelta en la original mientras se va guardando cada valor en una lista de salida — como se invierte dos veces, la pila original queda exactamente igual a como estaba, y la lista de salida queda en orden bottom→top (RECEPCION primero), listo para imprimir con `" > ".join(...)`. Costo: dos recorridos completos de la pila, O(n) en tiempo y O(n) en espacio auxiliar, con n = número de dependencias visitadas (como máximo 5, uno por dependencia del trámite).

**4. Costo de `agregarFolio` en esta implementación. Si la lista solo guardara la cabeza sería O(n): ¿qué se mantiene actualizado para que sea O(1)?**

En esta implementación `agregarFolio` es **O(1)**: la clase `Lista` guarda, además del puntero a la cabeza, un puntero a la **cola** (último nodo). Al agregar, si ya hay cola se enlaza `cola.siguiente = nuevoNodo` y se actualiza `cola = nuevoNodo`; si la lista estaba vacía, el nuevo nodo se vuelve cabeza y cola a la vez. Si esa referencia a la cola no existiera, cada `agregar()` tendría que recorrer la lista completa hasta el último nodo para enlazar ahí, lo que sí sería O(n). Lo único que hay que disciplinar es mantener el puntero a cola sincronizado en cada inserción (en este caso solo hay inserciones al final, nunca al medio ni eliminaciones reales, así que no hay otros puntos donde pueda desincronizarse).

**5. R7 crea una cola de represamiento general. ¿Qué problema aparecería si, en vez de represar, los expedientes se insertaran al frente de la bandeja destino apenas hubiera cupo?**

Rompería la equidad de atención que es la razón de ser de todas las colas del sistema. Si dos expedientes distintos quedaron represados esperando cupo en la misma dependencia, y el que se liberó primero se insertara "al frente" de la bandeja destino en vez de al final (o en vez de respetar el orden de la cola de represamiento), el expediente que lleva **menos** tiempo esperando podría terminar atendiéndose antes que uno que lleva más tiempo represado — exactamente lo contrario de "primero en llegar, primero en atenderse" que ya rige cada bandeja. Además, nuestra `Cola.remover()`/`frente()` solo permiten mirar y sacar el primer elemento de la cola general de represamiento en O(1); insertar arbitrariamente "al frente" de una bandeja destino rompería esa disciplina de un único punto de entrada/salida y obligaría a recorrer o reordenar colas para decidir a quién le toca, perdiendo la garantía O(1) de las operaciones de cola.

---

Cómo ejecutar: `python main.py tramites.txt` (Python) o `npx --yes tsx main.ts tramites.txt` (TypeScript), ambos dentro de su respectiva carpeta `Back/`.
