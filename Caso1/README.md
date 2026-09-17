# Caso 1 — BiciTaller

## El problema

Una ciudad tiene 1.200 bicicletas públicas repartidas en 40 estaciones, y un solo taller central con un solo puesto de trabajo. Cuando alguien reporta una falla, un camión recoge la bicicleta y la deja en el taller; de ahí en adelante todo se maneja hoy con planillas de papel, y eso genera dos problemas concretos: bicicletas que llevan semanas esperando un repuesto porque nadie vuelve a mirarlas, y bicicletas que salen mal armadas porque el mecánico montó las piezas en un orden distinto al que las desmontó. El enunciado completo está en [`Caso_Estudio_1.pdf`](Caso_Estudio_1.pdf).

## Qué pide el ejercicio

Construir una aplicación (`BiciTaller`) que controle tres cosas a la vez, cada una con su propia estructura de datos hecha a mano — nada de `list`, `Stack`, `Queue`, `deque` ni `Array` como respaldo:

| Se necesita para... | Estructura | Por qué esa y no otra |
|---|---|---|
| Llevar el inventario completo de la ciudad, con altas, bajas y búsquedas | Lista enlazada | No hay orden de llegada ni de apilamiento; se recorre completa para los reportes |
| Respetar "primero en llegar, primero en atenderse" en el taller y en la espera de repuestos | Cola | FIFO estricto, sin adelantamientos |
| Recordar en qué orden se desmontó la bicicleta que está en el puesto ahora mismo | Pila | Montar es literalmente desmontar en reversa (LIFO) |

La parte que de verdad exige pensar es la regla de suspender/reanudar (R4/R5 en el PDF): si falta un repuesto, la reparación se detiene, las piezas ya desmontadas se guardan, y cuando el repuesto llega la bicicleta debe volver a quedar exactamente como estaba, en el mismo orden. Es fácil invertir sin querer ese orden si se guarda la pila copiándola a otra estructura.

## Cómo se conecta el código

Los cinco archivos de `Back/` se llaman entre sí en un solo sentido, de abajo hacia arriba — ninguno depende de uno que esté más arriba en esta lista:

1. [`estructuras.py`](Python/Back/estructuras.py) / [`estructuras.ts`](TypeScript/Back/estructuras.ts) — `Lista`, `Cola` y `Pila` genéricas. No saben nada de bicicletas.
2. [`entidades.py`](Python/Back/entidades.py) / [`entidades.ts`](TypeScript/Back/entidades.ts) — la clase `Bicicleta`: solo datos y algún helper propio de la entidad.
3. [`bicitaller.py`](Python/Back/bicitaller.py) / [`bicitaller.ts`](TypeScript/Back/bicitaller.ts) — importa los dos anteriores y arma la clase `BiciTaller`: aquí viven las reglas R1-R7 y las operaciones RF-01 a RF-08.
4. [`reportes.py`](Python/Back/reportes.py) / [`reportes.ts`](TypeScript/Back/reportes.ts) — recibe el `BiciTaller` ya resuelto y arma el texto de `reporte()` (RF-09); no conoce las reglas de negocio, solo lee el estado final.
5. [`main.py`](Python/Back/main.py) / [`main.ts`](TypeScript/Back/main.ts) — el runner: abre [`taller.txt`](Python/Back/taller.txt), va línea por línea llamando a los métodos de `BiciTaller` según el comando (`REPORTAR`, `RECIBIR`, `DESMONTAR`, `SUSPENDER`, `REANUDAR`, `CERRAR`, `REPORTE`...) e imprime lo que cada uno devuelve.

Para levantarlo:

```bash
# Python — no necesita instalar nada
cd Python/Back
python main.py taller.txt

# TypeScript — necesita Node
cd TypeScript/Back
npm install
npx ts-node main.ts taller.txt        # o: npx tsc && node dist/main.js taller.txt
```

Las dos versiones leen el mismo `taller.txt` y producen la misma salida, línea por línea.

Si en algún momento quieres una interfaz en vez de la consola, [`Python/GUIA.md`](<Python/GUIA.md>) y [`TypeScript/GUIA.md`](<TypeScript/GUIA.md>) explican cómo montarla (Tkinter y HTML+CSS respectivamente) sin tocar nada de lo anterior.

## Preguntas de análisis

**1. ¿Por qué la flota no puede modelarse con una cola, y por qué el turno del taller no puede modelarse con una pila?**

La flota necesita altas y bajas en cualquier posición (una bicicleta puede pasar de activa a dada de baja sin importar cuándo entró) y se consulta completa para reportes por estado; una cola solo permite ver y sacar el elemento del frente, no "buscar y sacar" a mitad. El turno del taller, en cambio, no puede ser una pila porque la regla de negocio es la equidad por llegada: la primera bicicleta reportada debe ser la primera atendida. Con una pila, la última en llegar sería la primera en salir, justo lo contrario de lo que exige el taller.

**2. ¿Cómo se guarda y restaura la pila de piezas (R4/R5) conservando el orden? ¿Cuántas transferencias hace y cuál es el costo?**

Cero transferencias, costo O(1). La `Pila` es un objeto con nodos enlazados; al suspender, `bici.pilaGuardada` simplemente apunta a esa misma instancia (no se copia ni se recorre nodo por nodo), y el puesto queda libre porque a la siguiente bicicleta se le asigna una `Pila` nueva. Al reanudar, se reutiliza esa misma referencia como pila del puesto, así que el orden queda idéntico porque nunca se tocó un solo nodo. La alternativa de vaciarla hacia una pila auxiliar y de ahí a una tercera también conserva el orden, pero cuesta 2n transferencias O(n); no hace falta si simplemente se conserva la referencia.

**3. ¿Qué ocurre si se intenta montar con la pila vacía o cerrar con piezas pendientes?**

Salida real del programa (bicicleta BIC-0777 en `taller.txt`):

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

`buscar` recorre la lista enlazada nodo por nodo comparando códigos: O(n) en el peor caso. Se puede bajar a O(1) amortizado agregando un diccionario/mapa auxiliar `codigo -> nodo` que se actualice en cada alta y cada baja de la flota. El costo adicional es memoria O(n) para el índice, más la disciplina de mantenerlo sincronizado en cada inserción/eliminación — si se olvida actualizarlo en algún punto, el índice queda desincronizado de la lista real.

**5. Si el taller abriera un segundo puesto de trabajo, ¿qué se duplica y qué sigue siendo uno solo?**

Se duplica únicamente la **pila** de piezas: cada puesto arma/desarma su propia bicicleta y necesita su propio LIFO independiente. La **lista** de la flota sigue siendo una sola, porque es el inventario completo de la ciudad, no algo por puesto. La **cola** del taller también sigue siendo una sola: la equidad es global, y cada puesto que queda libre toma la siguiente bicicleta de esa misma cola compartida; si se duplicara la cola, ya no habría un único orden de llegada y se rompería la regla de negocio.
