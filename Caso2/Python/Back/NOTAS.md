# CentralAscensores — Back (consola)

Implementación 100% de consola: sin ventanas, sin servidor, sin dependencias externas (solo librería estándar de Python).

| Archivo | Qué contiene |
|---|---|
| `estructuras.py` | `Lista`, `Cola`, `Pila` genéricas, con nodos enlazados propios (nada de `list`/`collections.deque`). |
| `entidades.py` | Clase `Ascensor`, clase `Llamada`, el diccionario `PROTOCOLO` (paso → maniobra directa/inversa) y la excepción `RechazoOperacion`. |
| `central.py` | Clase `CentralAscensores`: usa `estructuras` + `entidades` para implementar `cargarParque`, `registrarLlamada`, `atenderSiguiente`, `ejecutarPaso`, `deshacerUltimo`, `abortarRescate`, `cerrarLlamada` y `reporte`, aplicando R1-R7. |
| `reportes.py` | Función `generar_reporte(central)`: solo lee métricas ya calculadas por `central.py` y arma el texto — no decide reglas de negocio. |
| `main.py` | Lee un archivo de comandos (formato `PARQUE` + lista de ascensores + `---` + comandos) y por cada línea imprime `> <comando>` seguido del resultado o del rechazo. |
| `central.txt` | Ejemplo de entrada que ejercita R1 (anti-inanición), R2 (duplicado), R3 (paso fuera de orden), R4 (abortar), R6 (tiempos) y R7 (fuera de servicio). |

## Cómo ejecutar

```bash
python main.py central.txt
```

Cada línea del archivo se imprime como `> <comando>` y debajo su resultado; los rechazos por regla de negocio se imprimen como `RECHAZADA <mensaje>` y no detienen la ejecución del resto del archivo.
