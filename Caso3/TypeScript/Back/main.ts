/**
 * Runner de comandos para CuraduriaTramites.
 *
 * Uso:
 *   npx ts-node main.ts tramites.txt
 *   (o compilado: npx tsc && node main.js tramites.txt)
 */

import * as fs from "fs";
import { CuraduriaTramites, Dependencia, DEPENDENCIAS, Expediente } from "./curaduria";

function parseEncabezado(linea: string, sistemaActual: CuraduriaTramites | null): CuraduriaTramites | null {
  if (linea.startsWith("CAPACIDAD_BANDEJA")) {
    const partes = linea.replace(/:/g, " ").split(/\s+/).filter(Boolean);
    const capacidad = parseInt(partes[1], 10);
    const plazo = parseInt(partes[3], 10);
    return new CuraduriaTramites(capacidad, plazo);
  }
  return sistemaActual;
}

function ejecutar(rutaArchivo: string): void {
  let sistema: CuraduriaTramites | null = null;
  let enComandos = false;

  const contenido = fs.readFileSync(rutaArchivo, "utf-8");
  for (const lineaCruda of contenido.split(/\r?\n/)) {
    const linea = lineaCruda.split("#")[0].trim();
    if (!linea) continue;
    if (linea === "---") {
      enComandos = true;
      continue;
    }
    if (!enComandos) {
      sistema = parseEncabezado(linea, sistema);
      continue;
    }
    procesarComando(sistema as CuraduriaTramites, linea);
  }
}

function procesarComando(sistema: CuraduriaTramites, linea: string): void {
  const tokens = linea.split(/\s+/);
  const comando = tokens[0].toUpperCase();

  if (comando === "RADICAR") {
    const resto = tokens.slice(1);
    const indiceDia = resto.findIndex((t) => t.startsWith("dia="));
    const solicitante = resto.slice(0, indiceDia).join(" ");
    const dia = parseInt(resto[indiceDia].split("=")[1], 10);
    console.log(`> RADICAR ${solicitante} dia=${dia}`);
    const expediente = sistema.radicar(solicitante, dia);
    console.log(`  ${expediente.radicado} creado | dependencia: ${expediente.dependencia} | folio 1: solicitud`);
  } else if (comando === "FOLIO") {
    const [radicado, descripcion] = [tokens[1], tokens[2]];
    console.log(`> FOLIO ${radicado} ${descripcion}`);
    try {
      const folio = sistema.agregarFolio(radicado, descripcion);
      console.log(`  folio ${folio.numero} (${descripcion}) agregado, VIGENTE`);
    } catch (error) {
      console.log(`  ERROR: ${(error as Error).message}`);
    }
  } else if (comando === "ANULAR") {
    const radicado = tokens[1];
    const numero = parseInt(tokens[2], 10);
    console.log(`> ANULAR ${radicado} ${numero}`);
    try {
      const folio = sistema.anularFolio(radicado, numero);
      console.log(`  folio ${folio.numero} (${folio.descripcion}) -> ANULADO (no se renumera, R4)`);
    } catch (error) {
      console.log(`  ERROR: ${(error as Error).message}`);
    }
  } else if (comando === "ATENDER") {
    const dependencia = tokens[1] as Dependencia;
    console.log(`> ATENDER ${dependencia}`);
    try {
      const expediente = sistema.atenderSiguiente(dependencia);
      console.log(`  toma ${expediente.radicado} (${expediente.solicitante})`);
    } catch (error) {
      console.log(`  ERROR: ${(error as Error).message}`);
    }
  } else if (comando === "AVANZAR") {
    const radicado = tokens[1];
    console.log(`> AVANZAR ${radicado}`);
    try {
      const { destino, encolado } = sistema.avanzar(radicado);
      const estado = encolado ? `encolado en ${destino}` : `represado, en espera de cupo en ${destino}`;
      console.log(`  ${radicado} avanza a ${destino} | ${estado}`);
    } catch (error) {
      console.log(`  ${(error as Error).message}`);
    }
  } else if (comando === "DEVOLVER") {
    const radicado = tokens[1];
    const observacion = tokens.slice(2).join(" ");
    console.log(`> DEVOLVER ${radicado} ${observacion}`);
    try {
      const expediente = sistema.buscarExpediente(radicado);
      const rutaAntes = expediente.rutaActual();
      console.log(`  ruta antes : ${rutaAntes.join(" > ")} (tope = ${rutaAntes[rutaAntes.length - 1]})`);
      const { actual, anterior, archivado } = sistema.devolver(radicado, observacion);
      console.log(`  se desapila ${actual} -> regresa al final de la bandeja de ${anterior}`);
      if (archivado) {
        console.log(`  devoluciones = 3 de 3 -> R3: ${radicado} se archiva por desistimiento`);
      } else {
        console.log(`  devoluciones = ${expediente.devoluciones} de 3`);
      }
    } catch (error) {
      console.log(`  ${(error as Error).message}`);
    }
  } else if (comando === "IMPRIMIR") {
    const radicado = tokens[1];
    console.log(`> IMPRIMIR ${radicado}`);
    try {
      const expediente: Expediente = sistema.buscarExpediente(radicado);
      console.log(
        `  EXPEDIENTE ${expediente.radicado} | ${expediente.solicitante} | dependencia actual: ${expediente.dependencia}`
      );
      let vigentes = 0;
      let anulados = 0;
      for (const folio of expediente.folios) {
        console.log(`    folio ${folio.numero} ${folio.descripcion.padEnd(28)} ${folio.estado}`);
        if (folio.estado === "VIGENTE") vigentes += 1;
        else anulados += 1;
      }
      const etiqueta = anulados === 1 ? "anulado" : "anulados";
      console.log(`  folios: ${vigentes + anulados} total, ${vigentes} vigentes, ${anulados} ${etiqueta}`);
      const ruta = expediente.rutaActual();
      console.log(`  ruta recorrida: ${ruta.join(" > ")} (pila intacta)`);
    } catch (error) {
      console.log(`  ERROR: ${(error as Error).message}`);
    }
  } else if (comando === "REPORTE") {
    const diaActual = parseInt(tokens[1].split("=")[1], 10);
    console.log(`> REPORTE dia=${diaActual}`);
    const reporte = sistema.reporte(diaActual);
    const bandejasStr = DEPENDENCIAS.map((dep) => `${dep} ${reporte.bandejas[dep]}`).join(" | ");
    console.log(`  Bandejas: ${bandejasStr}`);
    console.log(
      `  Represados: ${reporte.represados}  Archivados por R3: ${reporte.archivados}  Resueltos: ${reporte.resueltos}`
    );
    const devolucionesStr =
      DEPENDENCIAS.map((dep) => [dep, reporte.devoluciones[dep]] as const)
        .filter(([, cantidad]) => cantidad > 0)
        .map(([dep, cantidad]) => `${dep} ${cantidad}`)
        .join(", ") || "ninguna";
    console.log(`  Devoluciones por dependencia: ${devolucionesStr}`);
    if (reporte.vencidos.length > 0) {
      const vencidosStr = reporte.vencidos.map(([r, d]) => `${r} (${d} dias habiles)`).join(", ");
      console.log(`  VENCIDOS (R6): ${vencidosStr}`);
    } else {
      console.log("  VENCIDOS (R6): ninguno");
    }
  } else {
    console.log(`> ${linea}`);
    console.log(`  comando desconocido: ${comando}`);
  }
}

const archivo = process.argv[2];
if (!archivo) {
  console.log("Uso: ts-node main.ts <archivo_de_comandos>");
  process.exit(1);
}
ejecutar(archivo);
