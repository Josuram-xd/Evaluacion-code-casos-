/**
 * Runner de comandos para BiciTaller.
 *
 * Uso:
 *   npx ts-node main.ts taller.txt
 *   (o compilar con `npx tsc` y correr `node main.js taller.txt`)
 *
 * El archivo de entrada trae un bloque FLOTA (una bicicleta por línea,
 * separada por comas), un separador "---" y luego un comando por línea.
 */

import * as fs from "fs";
import { BiciTaller } from "./bicitaller";
import { FilaFlota } from "./entidades";

export function sinComentario(linea: string): string {
  return linea.split("#")[0].trim();
}

export function leerFlota(lineas: string[], iInicial: number): { filas: FilaFlota[]; siguiente: number } {
  let i = iInicial;
  while (i < lineas.length && lineas[i].trim() !== "FLOTA") i++;
  i++;
  const filas: FilaFlota[] = [];
  while (i < lineas.length && lineas[i].trim() !== "---") {
    const cruda = sinComentario(lineas[i]);
    i++;
    if (!cruda) continue;
    const [codigo, estacion, estado, reparaciones] = cruda.split(",").map((p) => p.trim());
    filas.push({ codigo, estacion, estado, reparaciones: parseInt(reparaciones, 10) });
  }
  return { filas, siguiente: i + 1 }; // saltar la línea "---"
}

export function ejecutarComando(taller: BiciTaller, cruda: string): string {
  const espacio = cruda.indexOf(" ");
  const cmd = (espacio === -1 ? cruda : cruda.slice(0, espacio)).toUpperCase();
  const resto = espacio === -1 ? "" : cruda.slice(espacio + 1).trim();
  const primerArg = resto.split(/\s+/)[0] ?? "";

  switch (cmd) {
    case "REPORTAR": {
      const codigo = primerArg;
      const falla = resto.slice(codigo.length).trim();
      return taller.reportarFalla(codigo, falla);
    }
    case "RECIBIR":
      return taller.recibirEnTaller(primerArg);
    case "INICIAR":
      return taller.iniciarReparacion();
    case "DESMONTAR":
      return taller.desmontar(primerArg);
    case "MONTAR":
      return taller.montar();
    case "SUSPENDER":
      return taller.suspender(resto);
    case "REANUDAR":
      return taller.reanudar(primerArg);
    case "CERRAR":
      return taller.cerrarOrden();
    case "REPORTE":
      return taller.reporte();
    default:
      return `Comando desconocido: ${cmd}`;
  }
}

function main(): void {
  const ruta = process.argv[2];
  if (!ruta) {
    console.log("uso: npx ts-node main.ts <archivo_comandos>");
    return;
  }

  const lineas = fs.readFileSync(ruta, "utf-8").split(/\r?\n/);
  const taller = new BiciTaller();

  const { filas, siguiente } = leerFlota(lineas, 0);
  for (const mensaje of taller.cargarFlota(filas)) console.log(mensaje);

  for (let i = siguiente; i < lineas.length; i++) {
    const cruda = sinComentario(lineas[i]);
    if (!cruda) continue;
    console.log(`> ${cruda}`);
    console.log(ejecutarComando(taller, cruda));
    console.log("");
  }
}

if (require.main === module) {
  main();
}
