/**
 * Runner de CentralAscensores: lee un archivo de comandos y ejecuta cada
 * linea, imprimiendo el resultado en el mismo estilo del PDF.
 *
 * Uso: npx ts-node main.ts central.txt
 *
 * Gramatica del archivo (una instruccion por linea, '#' inicia comentario):
 *
 *   PARQUE
 *   <codigo>, <edificio>, <estado>, <emergencias>
 *   ...
 *   ---
 *   LLAMADA <codigo> <EMERGENCIA|MANTENIMIENTO> <minuto>
 *   ATENDER <minutoAtencion>
 *   PASO <n>
 *   DESHACER
 *   ABORTAR <motivo>
 *   CERRAR
 *   REPORTE
 */
import * as fs from "fs";
import { CentralAscensores } from "./central";
import { RechazoOperacion, TipoLlamada } from "./entidades";

function quitarComentario(linea: string): string {
  return linea.split("#")[0].trim();
}

function cargarArchivo(ruta: string): { filasParque: string[][]; comandos: string[] } {
  const crudo = fs.readFileSync(ruta, "utf-8").split(/\r?\n/);
  const lineas = crudo.map(quitarComentario).filter((l) => l.length > 0);

  if (lineas[0].toUpperCase() !== "PARQUE") {
    throw new Error("el archivo debe empezar con PARQUE");
  }
  const filasParque: string[][] = [];
  let i = 1;
  while (lineas[i] !== "---") {
    filasParque.push(lineas[i].split(",").map((p) => p.trim()));
    i++;
  }
  const comandos = lineas.slice(i + 1);
  return { filasParque, comandos };
}

function ejecutar(ruta: string): void {
  const { filasParque, comandos } = cargarArchivo(ruta);
  const central = new CentralAscensores();
  central.cargarParque(filasParque);

  for (const linea of comandos) {
    console.log(`> ${linea}`);
    const partes = linea.split(/\s+/);
    const cmd = partes[0].toUpperCase();
    try {
      switch (cmd) {
        case "LLAMADA": {
          const [, codigo, tipo, minuto] = partes;
          console.log(" ", central.registrarLlamada(codigo, tipo as TipoLlamada, Number(minuto)));
          break;
        }
        case "ATENDER":
          console.log(" ", central.atenderSiguiente(Number(partes[1])));
          break;
        case "PASO":
          console.log(" ", central.ejecutarPaso(Number(partes[1])));
          break;
        case "DESHACER":
          console.log(" ", central.deshacerUltimo());
          break;
        case "ABORTAR":
          for (const l of central.abortarRescate(partes.slice(1).join(" "))) {
            console.log(" ", l);
          }
          break;
        case "CERRAR":
          console.log(" ", central.cerrarLlamada());
          break;
        case "REPORTE":
          console.log(central.reporte());
          break;
        default:
          console.log(`  comando desconocido: ${cmd}`);
      }
    } catch (err) {
      if (err instanceof RechazoOperacion) {
        console.log(`  RECHAZADA ${err.message}`);
      } else {
        throw err;
      }
    }
  }
}

const ruta = process.argv[2] ?? "central.txt";
ejecutar(ruta);
