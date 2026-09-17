/**
 * Puente HTTP minimo (sin Express) entre el Back de CuraduriaTramites y una
 * pagina HTML+CSS+JS servida como archivos estaticos. No reimplementa
 * ninguna regla de negocio: importa `inicializarDesdeArchivo`/`procesarLinea`
 * directamente de `../Back/main.ts`, el mismo modulo que usa el runner de
 * consola.
 *
 * Uso:
 *   npm install
 *   npx --yes tsx server.ts
 *   -> abrir http://localhost:3000
 */

import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { CuraduriaTramites } from "../Back/curaduria";
import { inicializarDesdeArchivo, procesarLinea } from "../Back/main";

const PUERTO = 3000;
const ARCHIVO_INICIAL = path.join(__dirname, "..", "Back", "tramites.txt");

let sistema: CuraduriaTramites = inicializarDesdeArchivo(ARCHIVO_INICIAL);

const TIPOS_MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function servirArchivoEstatico(nombre: string, res: http.ServerResponse): void {
  const ruta = path.join(__dirname, nombre);
  fs.readFile(ruta, (error, contenido) => {
    if (error) {
      res.writeHead(404).end("no encontrado");
      return;
    }
    const ext = path.extname(ruta);
    res.writeHead(200, { "Content-Type": TIPOS_MIME[ext] ?? "application/octet-stream" });
    res.end(contenido);
  });
}

function manejarComando(req: http.IncomingMessage, res: http.ServerResponse): void {
  let cuerpo = "";
  req.on("data", (parte) => (cuerpo += parte));
  req.on("end", () => {
    try {
      const { linea } = JSON.parse(cuerpo || "{}") as { linea?: string };
      if (!linea || !linea.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "falta 'linea'" }));
        return;
      }
      const salida = procesarLinea(sistema, linea.trim());
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ salida }));
    } catch (error) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ salida: `ERROR: ${(error as Error).message}` }));
    }
  });
}

function manejarReiniciar(_req: http.IncomingMessage, res: http.ServerResponse): void {
  sistema = inicializarDesdeArchivo(ARCHIVO_INICIAL);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true }));
}

const servidor = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/comando") {
    manejarComando(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/reiniciar") {
    manejarReiniciar(req, res);
    return;
  }
  const nombre = req.url === "/" ? "index.html" : (req.url ?? "").replace(/^\//, "");
  servirArchivoEstatico(nombre, res);
});

servidor.listen(PUERTO, () => {
  console.log(`CuraduriaTramites (front) escuchando en http://localhost:${PUERTO}`);
});
