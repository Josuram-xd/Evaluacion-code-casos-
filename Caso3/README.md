# Caso 3 — CuraduriaTramites

## El problema

Una curaduría urbana tramita licencias de construcción. Cada solicitud se convierte en un expediente que tiene que pasar, en un orden fijo que no se puede saltar, por cuatro dependencias — `RECEPCION -> JURIDICA -> TECNICA -> URBANISTICA` — antes de llegar a `RESOLUCION`. Cada dependencia tiene su propia bandeja y atiende por orden de llegada. Dos particularidades legales lo complican: por ley, un documento (folio) que entra al expediente nunca se borra ni se renumera aunque quede sin efecto (solo se anula), y cuando una dependencia encuentra observaciones no rechaza el trámite, sino que lo **devuelve** a la dependencia inmediatamente anterior según la ruta que ese expediente realmente recorrió — no según una tabla fija de "quién va antes de quién". El enunciado completo está en [`Caso_Estudio_3.pdf`](Caso_Estudio_3.pdf).

## Qué pide el ejercicio

`CuraduriaTramites` necesita tres estructuras propias (sin `list`/`Array` de respaldo, sin `Stack`/`Queue`/`deque`), y aquí la particularidad es que dos de ellas viven **por expediente**, no de forma global:

- **Lista enlazada, una por expediente** — los folios, en el orden exacto en que se agregaron. Anular un folio le cambia el estado, nunca lo saca de la lista ni renumera los que siguen.
- **Cola, una por dependencia** (más una cola general de represamiento cuando una bandeja está llena) — la bandeja de entrada de cada dependencia, FIFO estricto.
- **Pila, una por expediente** — la ruta ya recorrida. Es la pieza clave del caso: devolver un expediente es desapilar su última dependencia visitada, nunca calcular "la anterior" con una tabla o un índice.

La trampa está en no confundir dos operaciones que se parecen pero no son lo mismo: anular un folio no es eliminarlo, y devolver un expediente no es restarle uno a un contador de etapa. Las preguntas 1 y 2 de abajo son justo sobre esa distinción.

## Cómo se conecta el código

```
main.ts / main.py
   │  lee tramites.txt, reparte cada línea al servicio
   ▼
curaduria.ts / curaduria.py   (clase CuraduriaTramites)
   │  usa las dos capas de abajo para resolver R1-R7 y RF-01..RF-08
   ├──▶ entidades.ts / entidades.py   (Folio, Expediente — con SU PROPIA Lista de folios y SU PROPIA Pila de ruta)
   └──▶ estructuras.ts / estructuras.py   (Lista, Cola, Pila genéricas)

reportes.ts / reportes.py
   │  recibe el CuraduriaTramites ya resuelto, arma el texto de reporte()
```

Archivos: [`estructuras.py`](Python/Back/estructuras.py)/[`.ts`](TypeScript/Back/estructuras.ts), [`entidades.py`](Python/Back/entidades.py)/[`.ts`](TypeScript/Back/entidades.ts), [`curaduria.py`](Python/Back/curaduria.py)/[`.ts`](TypeScript/Back/curaduria.ts), [`reportes.py`](Python/Back/reportes.py)/[`.ts`](TypeScript/Back/reportes.ts), [`main.py`](Python/Back/main.py)/[`.ts`](TypeScript/Back/main.ts).

Para levantarlo:

```bash
# Python
cd Python/Back
python main.py tramites.txt

# TypeScript — ts-node tuvo problemas de compatibilidad con Node 24 en esta máquina, tsx sí funcionó
cd TypeScript/Back
npm install
npx --yes tsx main.ts tramites.txt      # alternativa: npx tsc && node dist/main.js tramites.txt
```

Las dos versiones leen el mismo [`tramites.txt`](Python/Back/tramites.txt) y quedaron verificadas con la misma salida.

El caso no exige una interfaz gráfica utilizable, así que `Back/` ya es una solución completa por sí sola — de ahí que las carpetas de interfaz se llamen `Front (posible)/`, algo opcional y no una obligación del enunciado. Aun así, cada lenguaje trae una funcional: Tkinter en Python (`Python/Front (posible)/app.py`) y HTML+CSS con un servidor mínimo en TypeScript (`TypeScript/Front (posible)/server.ts` + `index.html`), ambas llamando a `CuraduriaTramites` tal cual está, sin duplicar reglas. [`Python/GUIA.md`](<Python/GUIA.md>) y [`TypeScript/GUIA.md`](<TypeScript/GUIA.md>) explican cómo se conecta cada una.

## Preguntas de análisis

**1. ¿Por qué la ruta del expediente se modela con una pila y no con un contador de etapa? Escenario de devoluciones sucesivas donde el contador daría un resultado incorrecto.**

Un contador de etapa solo guarda la posición *actual*, no el historial de cómo se llegó ahí. `avanzar()` apila la dependencia destino cada vez que se invoca, incluso si esa dependencia ya había sido visitada antes en el mismo expediente; `devolver()` simplemente desapila. Eso hace que la pila sea, en todo momento, un registro exacto de la secuencia real de visitas, mientras que un contador solo puede representar "en qué paso voy". Escenario concreto: un expediente avanza RECEPCION→JURIDICA→TECNICA, es devuelto a JURIDICA, avanza otra vez a TECNICA, y es devuelto una segunda vez. Con la pila, en ese punto `ruta` contiene `[RECEPCION, JURIDICA]` y el tope (JURIDICA) es exactamente la dependencia correcta a la que regresar. Un contador que calcule "dependencia anterior" con aritmética sobre total de avances menos total de devoluciones se desincroniza apenas hay un reavance después de una devolución, porque la posición máxima ya cambió. La pila no tiene ese problema porque cada `avanzar`/`devolver` es una operación simétrica (push/pop) sobre el mismo dato, nunca un cálculo derivado.

**2. ¿Por qué los folios se modelan con una lista y no con una cola o una pila? Relación con R4.**

R4 exige dos cosas a la vez: recorrer los folios completos en su orden de creación (para `imprimirExpediente`) y poder anular cualquiera de ellos —no solo el primero o el último— sin eliminarlo ni renumerar los demás. Una cola solo expone el frente para sacar elementos, y una pila solo expone el tope: ninguna de las dos permite "entrar hasta la mitad, cambiar un campo, y dejar todo lo demás intacto" sin romper su propia disciplina de acceso. La lista sí: `agregar()` añade al final en O(1) gracias al puntero a cola, y `anularFolio()` recorre buscando el folio por número y solo cambia su campo `estado`, sin tocar el enlace de nodos ni el orden de los demás.

**3. ¿Cómo se imprime la ruta recorrida sin destruir la pila? Estructuras auxiliares y costo O-grande.**

`rutaActual()` usa una pila auxiliar temporal: mientras la original no esté vacía, se desapila un elemento y se apila en la auxiliar (esto invierte el orden). Luego se hace lo mismo a la inversa, desapilando de la auxiliar y apilando de vuelta en la original mientras se guarda cada valor en una lista de salida — como se invierte dos veces, la original queda exactamente igual, y la lista de salida queda en orden bottom→top (RECEPCION primero), lista para imprimir con `" > ".join(...)`. Costo: dos recorridos completos de la pila, O(n) en tiempo y O(n) en espacio auxiliar, con n = número de dependencias visitadas (máximo 5).

**4. Costo de `agregarFolio` en esta implementación. Si la lista solo guardara la cabeza sería O(n): ¿qué se mantiene actualizado para que sea O(1)?**

Es O(1): la clase `Lista` guarda, además de la cabeza, un puntero a la **cola** (último nodo). Al agregar, si ya hay cola se enlaza `cola.siguiente = nuevoNodo` y se actualiza `cola = nuevoNodo`; si la lista estaba vacía, el nuevo nodo se vuelve cabeza y cola a la vez. Sin esa referencia, cada `agregar()` tendría que recorrer la lista completa hasta el último nodo, lo que sí sería O(n). Lo único que hay que disciplinar es mantener el puntero a cola sincronizado en cada inserción — acá no hay inserciones al medio ni eliminaciones reales, así que no hay otro punto donde pueda desincronizarse.

**5. R7 crea una cola de represamiento general. ¿Qué problema aparecería si, en vez de represar, los expedientes se insertaran al frente de la bandeja destino apenas hubiera cupo?**

Rompería la equidad de atención que es la razón de ser de todas las colas del sistema. Si dos expedientes quedaron represados esperando cupo en la misma dependencia, y el que se liberó primero se insertara "al frente" de la bandeja destino en vez de respetar el orden de la cola de represamiento, el expediente con **menos** tiempo de espera podría atenderse antes que uno con más tiempo represado — justo lo contrario de "primero en llegar, primero en atenderse". Además, `Cola.remover()`/`frente()` solo permiten mirar y sacar el primer elemento en O(1); insertar arbitrariamente "al frente" de una bandeja destino rompería esa disciplina de un único punto de entrada/salida y obligaría a recorrer o reordenar colas para decidir a quién le toca.
