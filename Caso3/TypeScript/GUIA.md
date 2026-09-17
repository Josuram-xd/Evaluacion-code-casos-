# TypeScript — CuraduriaTramites

Esta carpeta tiene dos subcarpetas con roles distintos:

- **`Back/`** — la implementación completa y funcional del caso, para trabajar por consola. El caso de estudio no exige ninguna interfaz gráfica: pide un programa que lea un archivo de comandos y produzca una salida de texto (ver `Caso_Estudio_3.pdf`, numeral 7). Eso es exactamente lo que hay aquí, ya terminado y validado: `estructuras.ts` (Lista/Cola/Pila propias), `entidades.ts` (`Folio`, `Expediente`), `curaduria.ts` (orquestador `CuraduriaTramites` con las reglas R1-R7 y RF-01..RF-08) y `reportes.ts` (armado del reporte final), ejecutados desde `main.ts`.

  Ejecutar:
  ```
  cd Back
  npm install
  npx --yes tsx main.ts tramites.txt
  ```
  (o `npx tsc && node main.js tramites.txt` si prefieres compilar).

  Detalle de cada archivo en [`Back/NOTAS.md`](Back/NOTAS.md).

- **`Front (posible)/`** — opcional porque el caso no la exige, pero sí está implementada: una página HTML+CSS con un input de comando y una consola de salida, servida por un `server.ts` minimo (módulo `http` de Node, sin Express) que importa `CuraduriaTramites` y `procesarLinea` directamente de `../Back/main.ts` (mismo parser de comandos, ninguna regla de negocio duplicada). Ejecutar:
  ```
  cd "Front (posible)"
  npm install
  npx --yes tsx server.ts
  ```
  y abrir `http://localhost:3000`. Detalle en [`Front (posible)/NOTAS.md`](<Front (posible)/NOTAS.md>).
