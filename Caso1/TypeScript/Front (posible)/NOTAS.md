# Front de BiciTaller — HTML + CSS

Cinco archivos: `server.ts`, `index.html`, `styles.css`, `app.js`, más `package.json`/`tsconfig.json` propios de esta carpeta.

## Cómo se conecta con `Back/`

`server.ts` es un servidor HTTP mínimo (solo el módulo `http` de Node, sin Express, para no sumar dependencias) que:

1. Al arrancar, importa `BiciTaller` de `../Back/bicitaller.ts` y `leerFlota`/`ejecutarComando` de `../Back/main.ts` — las mismas funciones que usa la consola —, carga `../Back/taller.txt` y crea una única instancia de `BiciTaller` que vive en memoria mientras el servidor está prendido.
2. Sirve `index.html`, `styles.css` y `app.js` como archivos estáticos.
3. Expone `POST /comando`: recibe `{ "linea": "..." }`, se lo pasa tal cual a `ejecutarComando(taller, linea)` — la misma función que usa `main.ts` para procesar `taller.txt` — y responde `{ "salida": "..." }` con lo que esa función devolvió.

`app.js` es JavaScript plano de navegador (no hay que compilar nada para el lado del cliente): toma lo que el usuario escribe, hace `fetch('/comando', ...)` y pinta la respuesta en el `<pre>` de la página. No conoce ni reimplementa ninguna regla de negocio — solo llama al servidor.

## Cómo ejecutar

```bash
cd Caso1/TypeScript/Front (posible)
npm install
npx ts-node server.ts        # o: npx tsx server.ts si ts-node falla
```

Y abrir `http://localhost:4000` en el navegador.
