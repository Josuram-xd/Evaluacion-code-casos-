# Back (Python) — CuraduriaTramites

Programa 100% de consola: no abre ninguna ventana ni interfaz gráfica. Lee un archivo de comandos línea por línea y escribe cada resultado en `stdout`, en el formato del numeral 7 del PDF.

## Archivos

| Archivo | Qué contiene |
|---|---|
| `estructuras.py` | `Lista`, `Cola` y `Pila` genéricas y propias (nodos enlazados a mano, nada de `list`/`deque`/`Stack`/`Queue`). Reutilizables para cualquier caso. |
| `entidades.py` | `Folio` y `Expediente` — datos y comportamiento propio de un expediente individual: su propia lista de folios y su propia pila de ruta (R2 y R4 son reglas por-expediente, no globales). |
| `curaduria.py` | `CuraduriaTramites` — el orquestador: las colas por dependencia (bandejas) + la cola de represamiento (R7), y las reglas R1, R2, R3, R5 vía `RF-01..RF-08`. No conoce detalles de cómo se imprime nada. |
| `reportes.py` | `generar_reporte(servicio, dia_actual)` — arma el diccionario de métricas del numeral 6 leyendo el estado ya validado por `curaduria.py`, sin decidir ninguna regla de negocio. |
| `main.py` | Runner: parsea `tramites.txt` línea por línea, llama a los métodos de `CuraduriaTramites` y da formato a cada línea de salida. |
| `tramites.txt` | Archivo de ejemplo (equivalente al del PDF) que ejercita radicación, folios, anulación, avance, devolución, archivado por R3 y vencidos por R6. |

## Ejecutar

```
python main.py tramites.txt
```

No requiere instalar nada (solo Python estándar).
