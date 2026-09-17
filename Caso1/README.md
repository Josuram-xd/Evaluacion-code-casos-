# Caso 1 — BiciTaller

Un taller central de bicicletas públicas repara en un solo puesto de trabajo, por orden de llegada. Este proyecto simula ese taller: mantiene la **flota** completa (altas, bajas y búsquedas), el **turno de reparación** (y la espera por repuestos) y el **armado/desarmado** de la bicicleta que está en el puesto en un momento dado.

Las tres estructuras de datos son propias (sin usar `list`, `Stack`, `Queue`, `deque`, `Array` como backing, etc.), porque cada una modela algo que las otras no pueden:

- **Lista enlazada** → la flota: se recorre completa para reportes y admite altas/bajas en cualquier punto, sin orden de llegada ni de apilamiento.
- **Cola** → el turno del taller y la cola de espera de repuestos: atención estrictamente FIFO.
- **Pila** → las piezas desmontadas del puesto de trabajo: montar es desmontar en reversa (LIFO).

Hay dos implementaciones equivalentes, ambas leyendo el mismo `taller.txt` y produciendo la misma salida:

- `Python/Back/` — `estructuras.py` (Lista/Cola/Pila), `entidades.py` (clase `Bicicleta`), `bicitaller.py` (servicio con las reglas de negocio y RF-01..RF-09), `reportes.py` (RF-09/métricas), `main.py` (runner). Ejecutar con `python main.py taller.txt`.
- `TypeScript/Back/` — mismos módulos en `.ts` (`estructuras.ts`, `entidades.ts`, `bicitaller.ts`, `reportes.ts`, `main.ts`). Ejecutar con `npm install` y luego `npx ts-node main.ts taller.txt` (o `npx tsc` y `node dist/main.js taller.txt`).

## Preguntas de análisis

**1. ¿Por qué la flota no puede modelarse con una cola, y por qué el turno del taller no puede modelarse con una pila?**

La flota necesita altas y bajas en cualquier posición (una bicicleta puede pasar de activa a dada de baja sin importar cuándo entró) y se consulta completa para reportes por estado; una cola solo permite ver y sacar el elemento del frente, no "buscar y sacar" a mitad. El turno del taller, en cambio, no puede ser una pila porque la regla de negocio es la equidad por llegada: la primera bicicleta reportada debe ser la primera atendida. Con una pila, la última en llegar sería la primera en salir, que es exactamente lo contrario de lo que exige el taller.

**2. ¿Cómo se guarda y restaura la pila de piezas (R4/R5) conservando el orden? ¿Cuántas transferencias hace y cuál es el costo?**

Cero transferencias, costo O(1). La `Pila` es un objeto con nodos enlazados; al suspender, `bici.pilaGuardada` simplemente apunta a esa misma instancia de pila (no se copia ni se recorre elemento por elemento), y el puesto queda libre porque a la siguiente bicicleta se le asigna una `Pila` nueva. Al reanudar y volver a iniciar la reparación, se reutiliza esa misma referencia como pila del puesto, así que el orden queda idéntico porque nunca se tocó un solo nodo. (La alternativa ingenua —vaciar la pila hacia otra pila auxiliar y de ahí a una tercera— sí conserva el orden, pero cuesta 2n transferencias O(n); no hace falta si simplemente se conserva la referencia.)

**3. ¿Qué ocurre si se intenta montar con la pila vacía o cerrar con piezas pendientes?**

Salida real del programa (ver `taller.txt`, bicicleta BIC-0777):

```
> MONTAR
RECHAZADO: no hay piezas para montar, la pila esta vacia

> DESMONTAR cadena
cadena desmontada y apilada (tope=cadena)

> CERRAR
RECHAZADA (R6): quedan piezas sin montar en BIC-0777, la bicicleta quedaria incompleta
```

Ninguno de los dos casos rompe el programa ni cierra la orden: ambos devuelven un mensaje de rechazo explícito y el puesto sigue ocupado con el mismo estado.

**4. ¿Cuál es el costo de `buscar(codigo)` y cómo se podría mejorar?**

`buscar` recorre la lista enlazada nodo por nodo comparando códigos: O(n) en el peor caso (bicicleta al final o inexistente). Se puede bajar a O(1) amortizado agregando un diccionario/mapa auxiliar `codigo -> nodo` que se actualiza en cada alta y cada baja de la flota. El costo adicional es memoria O(n) para el índice y la disciplina de mantenerlo sincronizado con cada `insertar_ordenado`/`eliminar` (si se olvida actualizarlo en algún punto de alta o baja, el índice queda desincronizado de la lista real).

**5. Si el taller abriera un segundo puesto de trabajo, ¿qué se duplica y qué sigue siendo uno solo?**

Se duplica únicamente la **pila** de piezas: cada puesto arma/desarma su propia bicicleta y necesita su propio LIFO independiente. La **lista** de la flota sigue siendo una sola, porque es el inventario completo de la ciudad, no algo por puesto. La **cola** del taller también sigue siendo una sola: la equidad es global (orden de llegada de toda la ciudad), y cada puesto que queda libre simplemente toma la siguiente bicicleta de esa misma cola compartida; si se duplicara la cola, ya no habría un único orden de llegada y se rompería la regla de negocio.
