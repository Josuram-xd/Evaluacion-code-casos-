/**
 * Front minimo para BiciTaller: un servidor HTTP con SOLO el modulo "http"
 * de Node (sin Express, sin dependencias nuevas) que sirve una pagina
 * HTML+CSS+JS y expone POST /comando.
 *
 * No reimplementa ninguna regla de negocio: reutiliza tal cual BiciTaller,
 * leerFlota() y ejecutarComando() de ../Back/main.ts. El navegador solo
 * manda la misma sintaxis de comandos de taller.txt y recibe el mismo
 * texto que imprimiria la consola.
 *
 * Uso:
 *   npm install
 *   npx ts-node server.ts        (o: npx tsx server.ts si ts-node falla)
 *   abrir http://localhost:4000
 */

import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { BiciTaller } from "../Back/bicitaller";
import { leerFlota, ejecutarComando } from "../Back/main";

const PUERTO = 4000;
const BACK_DIR = path.join(__dirname, "..", "Back");

const taller = new BiciTaller();
{
  const lineas = fs.readFileSync(path.join(BACK_DIR, "taller.txt"), "utf-8").split(/\r?\n/);
  const { filas } = leerFlota(lineas, 0);
  for (const mensaje of taller.cargarFlota(filas)) console.log(mensaje);
}

const ARCHIVOS_ESTATICOS: Record<string, string> = {
  "/": "index.html",
  "/index.html": "index.html",
  "/styles.css": "styles.css",
  "/app.js": "app.js",
};

const TIPOS_MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function servirEstatico(nombre: string, res: http.ServerResponse): void {
  const ruta = path.join(__dirname, nombre);
  fs.readFile(ruta, (err, contenido) => {
    if (err) {
      res.writeHead(404);
      res.end("No encontrado");
      return;
    }
    res.writeHead(200, { "Content-Type": TIPOS_MIME[path.extname(nombre)] ?? "text/plain" });
    res.end(contenido);
  });
}

function manejarComando(req: http.IncomingMessage, res: http.ServerResponse): void {
  let cuerpo = "";
  req.on("data", (fragmento) => (cuerpo += fragmento));
  req.on("end", () => {
    try {
      const { linea } = JSON.parse(cuerpo) as { linea: string };
      const salida = ejecutarComando(taller, linea);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ salida }));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ salida: `RECHAZADA: no se pudo procesar el comando (${error})` }));
    }
  });
}

const servidor = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/comando") {
    manejarComando(req, res);
    return;
  }
  if (req.method === "GET" && req.url && ARCHIVOS_ESTATICOS[req.url]) {
    servirEstatico(ARCHIVOS_ESTATICOS[req.url], res);
    return;
  }
  res.writeHead(404);
  res.end("No encontrado");
});

servidor.listen(PUERTO, () => {
  console.log(`BiciTaller front escuchando en http://localhost:${PUERTO}`);
});
