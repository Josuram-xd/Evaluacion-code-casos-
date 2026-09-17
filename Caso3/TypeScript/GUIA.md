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

- **`Front (posible)/`** — carpeta reservada, sin implementar. Es opcional porque el caso no la exige; queda documentada por si en algún momento se quiere envolver `Back/` en una página web (HTML + CSS) en vez de usarlo por consola. La guía de cómo hacerlo está en [`Front (posible)/NOTAS.md`](<Front (posible)/NOTAS.md>) — no reescribe la lógica de negocio, solo explica cómo conectarse a la de `Back/`.
