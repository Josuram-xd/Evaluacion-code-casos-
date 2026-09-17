# Front de BiciTaller — Tkinter

Un único archivo, `app.py`, con una ventana Tkinter (librería estándar, no instala nada).

## Cómo se conecta con `Back/`

No reimplementa ninguna regla de negocio. Al arrancar:

1. Agrega `../Back` a `sys.path` e importa `BiciTaller` de `bicitaller.py`, y `leer_flota`/`ejecutar_comando` de `main.py` — las mismas funciones que usa la consola.
2. Carga `../Back/taller.txt` con `leer_flota()` y llama a `taller.cargar_flota(...)`, igual que hace `main.py` al arrancar.
3. Cada vez que el usuario escribe una línea y presiona Enter/"Ejecutar", se la pasa tal cual a `ejecutar_comando(taller, linea)` — la misma función que usa `main.py` para procesar `taller.txt` línea por línea — y muestra el texto que devuelve en el área de transcripción.

En otras palabras: el Front es una consola con ventana en vez de una consola de texto plano. La sintaxis de comandos es la misma (`REPORTAR BIC-0412 frenos sueltos`, `RECIBIR BIC-0412`, `INICIAR`, `DESMONTAR pieza`, `MONTAR`, `SUSPENDER motivo`, `REANUDAR BIC-0412`, `CERRAR`, `REPORTE`).

## Cómo ejecutar

```bash
cd Caso1/Python/Front (posible)
python app.py
```

No requiere `pip install` — Tkinter viene con Python.
