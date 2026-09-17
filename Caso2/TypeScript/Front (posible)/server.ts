/**
 * Servidor local minimo (solo el modulo "http" de Node, sin Express) que
 * sirve el Front estatico (index.html/styles.css/app.js) y expone un unico
 * endpoint POST /comando que reutiliza el mismo despachador de comandos que
 * usa el runner de consola en ../Back/main.ts: no se reimplementa ninguna
 * regla de negocio aqui, solo se envuelve.
 *
 * Uso:
 *   npm install
 *   npm start            (= npx tsx server.ts)
 *   abrir http://localhost:5175
 */
import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { CentralAscensores } from "../Back/central";
import { cargarArchivo, procesarLinea } from "../Back/main";

const PUERTO = 5175;
const DIR_PUBLICO = __dirname;
const RUTA_DATOS = path.join(__dirname, "..", "Back", "central.txt");

function crearCentral(): CentralAscensores {
  const { filasParque } = cargarArchivo(RUTA_DATOS);
  const central = new CentralAscensores();
  central.cargarParque(filasParque);
  return central;
}

// Un unico CentralAscensores en memoria mientras el servidor esta arriba;
// /reiniciar lo vuelve a cargar desde el mismo central.txt del Back.
let central = crearCentral();

const TIPOS_MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function servirEstatico(res: http.ServerResponse, archivo: string): void {
  const ruta = path.join(DIR_PUBLICO, archivo);
  fs.readFile(ruta, (err, datos) => {
    if (err) {
      res.writeHead(404);
      res.end("no encontrado");
      return;
    }
    res.writeHead(200, { "Content-Type": TIPOS_MIME[path.extname(ruta)] ?? "application/octet-stream" });
    res.end(datos);
  });
}

const servidor = http.createServer((req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    servirEstatico(res, "index.html");
    return;
  }
  if (req.method === "GET" && (req.url === "/styles.css" || req.url === "/app.js")) {
    servirEstatico(res, req.url.slice(1));
    return;
  }
  if (req.method === "POST" && req.url === "/comando") {
    let cuerpo = "";
    req.on("data", (trozo) => (cuerpo += trozo));
    req.on("end", () => {
      try {
        const { linea } = JSON.parse(cuerpo || "{}") as { linea?: string };
        if (!linea || !linea.trim()) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "falta 'linea'" }));
          return;
        }
        const salida = procesarLinea(central, linea.trim());
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ salida }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
    return;
  }
  if (req.method === "POST" && req.url === "/reiniciar") {
    central = crearCentral();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end("no encontrado");
});

servidor.listen(PUERTO, () => {
  console.log(`CentralAscensores (front) escuchando en http://localhost:${PUERTO}`);
});
