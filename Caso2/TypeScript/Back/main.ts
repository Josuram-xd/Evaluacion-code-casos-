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

export function cargarArchivo(ruta: string): { filasParque: string[][]; comandos: string[] } {
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

/**
 * Ejecuta una linea de comando sobre `central` y devuelve el resultado como
 * arreglo de lineas (una sola para la mayoria de comandos, varias para
 * ABORTAR y REPORTE). No imprime nada: la usan tanto main.ts como el Front
 * para no duplicar el despacho de comandos en dos lugares.
 */
export function procesarLinea(central: CentralAscensores, linea: string): string[] {
  const partes = linea.split(/\s+/);
  const cmd = partes[0].toUpperCase();
  try {
    switch (cmd) {
      case "LLAMADA": {
        const [, codigo, tipo, minuto] = partes;
        return [central.registrarLlamada(codigo, tipo as TipoLlamada, Number(minuto))];
      }
      case "ATENDER":
        return [central.atenderSiguiente(Number(partes[1]))];
      case "PASO":
        return [central.ejecutarPaso(Number(partes[1]))];
      case "DESHACER":
        return [central.deshacerUltimo()];
      case "ABORTAR":
        return central.abortarRescate(partes.slice(1).join(" "));
      case "CERRAR":
        return [central.cerrarLlamada()];
      case "REPORTE":
        return central.reporte().split("\n");
      default:
        return [`comando desconocido: ${cmd}`];
    }
  } catch (err) {
    if (err instanceof RechazoOperacion) {
      return [`RECHAZADA ${err.message}`];
    }
    throw err;
  }
}

function ejecutar(ruta: string): void {
  const { filasParque, comandos } = cargarArchivo(ruta);
  const central = new CentralAscensores();
  central.cargarParque(filasParque);

  for (const linea of comandos) {
    console.log(`> ${linea}`);
    const cmd = linea.split(/\s+/)[0].toUpperCase();
    const resultado = procesarLinea(central, linea);
    if (cmd === "REPORTE") {
      console.log(resultado.join("\n"));
    } else {
      for (const l of resultado) {
        console.log(" ", l);
      }
    }
  }
}

// Solo corre el archivo de ejemplo cuando este modulo se ejecuta
// directamente (node main.js / tsx main.ts); al importarlo desde el Front
// para reusar cargarArchivo/procesarLinea, esto no debe dispararse.
if (require.main === module) {
  const ruta = process.argv[2] ?? "central.txt";
  ejecutar(ruta);
}
