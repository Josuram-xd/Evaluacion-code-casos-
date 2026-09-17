/**
 * Runner de comandos para CuraduriaTramites.
 *
 * `procesarLinea` ejecuta una sola linea de comando y devuelve el texto de
 * salida como string, sin imprimir nada: la reutiliza tanto este runner de
 * consola como el front de `../Front (posible)/server.ts` (mismo servicio,
 * mismo parser de comandos, ninguna regla de negocio duplicada).
 *
 * Uso:
 *   npx --yes tsx main.ts tramites.txt
 *   (o compilado: npx tsc && node dist/main.js tramites.txt)
 */

import * as fs from "fs";
import { CuraduriaTramites, Dependencia, DEPENDENCIAS, Expediente } from "./curaduria";

export function parseEncabezado(linea: string, sistemaActual: CuraduriaTramites | null): CuraduriaTramites | null {
  if (linea.startsWith("CAPACIDAD_BANDEJA")) {
    const partes = linea.replace(/:/g, " ").split(/\s+/).filter(Boolean);
    const capacidad = parseInt(partes[1], 10);
    const plazo = parseInt(partes[3], 10);
    return new CuraduriaTramites(capacidad, plazo);
  }
  return sistemaActual;
}

/** Lee solo el encabezado (antes de '---') y devuelve un CuraduriaTramites ya
 * configurado. No ejecuta los comandos de ejemplo que vengan despues de '---'. */
export function inicializarDesdeArchivo(rutaArchivo: string): CuraduriaTramites {
  let sistema: CuraduriaTramites | null = null;
  const contenido = fs.readFileSync(rutaArchivo, "utf-8");
  for (const lineaCruda of contenido.split(/\r?\n/)) {
    const linea = lineaCruda.split("#")[0].trim();
    if (!linea) continue;
    if (linea === "---") break;
    sistema = parseEncabezado(linea, sistema);
  }
  if (!sistema) {
    throw new Error(`no se encontro un encabezado CAPACIDAD_BANDEJA valido en ${rutaArchivo}`);
  }
  return sistema;
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
    console.log(procesarLinea(sistema as CuraduriaTramites, linea));
  }
}

/** Ejecuta una linea de comando sobre `sistema` y devuelve el texto de salida
 * (una o varias lineas unidas con '\n'), sin imprimirlo. */
export function procesarLinea(sistema: CuraduriaTramites, linea: string): string {
  const salida: string[] = [];
  const tokens = linea.split(/\s+/);
  const comando = tokens[0].toUpperCase();

  if (comando === "RADICAR") {
    const resto = tokens.slice(1);
    const indiceDia = resto.findIndex((t) => t.startsWith("dia="));
    const solicitante = resto.slice(0, indiceDia).join(" ");
    const dia = parseInt(resto[indiceDia].split("=")[1], 10);
    salida.push(`> RADICAR ${solicitante} dia=${dia}`);
    const expediente = sistema.radicar(solicitante, dia);
    salida.push(`  ${expediente.radicado} creado | dependencia: ${expediente.dependencia} | folio 1: solicitud`);
  } else if (comando === "FOLIO") {
    const [radicado, descripcion] = [tokens[1], tokens[2]];
    salida.push(`> FOLIO ${radicado} ${descripcion}`);
    try {
      const folio = sistema.agregarFolio(radicado, descripcion);
      salida.push(`  folio ${folio.numero} (${descripcion}) agregado, VIGENTE`);
    } catch (error) {
      salida.push(`  ERROR: ${(error as Error).message}`);
    }
  } else if (comando === "ANULAR") {
    const radicado = tokens[1];
    const numero = parseInt(tokens[2], 10);
    salida.push(`> ANULAR ${radicado} ${numero}`);
    try {
      const folio = sistema.anularFolio(radicado, numero);
      salida.push(`  folio ${folio.numero} (${folio.descripcion}) -> ANULADO (no se renumera, R4)`);
    } catch (error) {
      salida.push(`  ERROR: ${(error as Error).message}`);
    }
  } else if (comando === "ATENDER") {
    const dependencia = tokens[1] as Dependencia;
    salida.push(`> ATENDER ${dependencia}`);
    try {
      const expediente = sistema.atenderSiguiente(dependencia);
      salida.push(`  toma ${expediente.radicado} (${expediente.solicitante})`);
    } catch (error) {
      salida.push(`  ERROR: ${(error as Error).message}`);
    }
  } else if (comando === "AVANZAR") {
    const radicado = tokens[1];
    salida.push(`> AVANZAR ${radicado}`);
    try {
      const { destino, encolado } = sistema.avanzar(radicado);
      const estado = encolado ? `encolado en ${destino}` : `represado, en espera de cupo en ${destino}`;
      salida.push(`  ${radicado} avanza a ${destino} | ${estado}`);
    } catch (error) {
      salida.push(`  ${(error as Error).message}`);
    }
  } else if (comando === "DEVOLVER") {
    const radicado = tokens[1];
    const observacion = tokens.slice(2).join(" ");
    salida.push(`> DEVOLVER ${radicado} ${observacion}`);
    try {
      const expediente = sistema.buscarExpediente(radicado);
      const rutaAntes = expediente.rutaActual();
      salida.push(`  ruta antes : ${rutaAntes.join(" > ")} (tope = ${rutaAntes[rutaAntes.length - 1]})`);
      const { actual, anterior, archivado } = sistema.devolver(radicado, observacion);
      salida.push(`  se desapila ${actual} -> regresa al final de la bandeja de ${anterior}`);
      if (archivado) {
        salida.push(`  devoluciones = 3 de 3 -> R3: ${radicado} se archiva por desistimiento`);
      } else {
        salida.push(`  devoluciones = ${expediente.devoluciones} de 3`);
      }
    } catch (error) {
      salida.push(`  ${(error as Error).message}`);
    }
  } else if (comando === "IMPRIMIR") {
    const radicado = tokens[1];
    salida.push(`> IMPRIMIR ${radicado}`);
    try {
      const expediente: Expediente = sistema.buscarExpediente(radicado);
      salida.push(
        `  EXPEDIENTE ${expediente.radicado} | ${expediente.solicitante} | dependencia actual: ${expediente.dependencia}`
      );
      let vigentes = 0;
      let anulados = 0;
      for (const folio of expediente.folios) {
        salida.push(`    folio ${folio.numero} ${folio.descripcion.padEnd(28)} ${folio.estado}`);
        if (folio.estado === "VIGENTE") vigentes += 1;
        else anulados += 1;
      }
      const etiqueta = anulados === 1 ? "anulado" : "anulados";
      salida.push(`  folios: ${vigentes + anulados} total, ${vigentes} vigentes, ${anulados} ${etiqueta}`);
      const ruta = expediente.rutaActual();
      salida.push(`  ruta recorrida: ${ruta.join(" > ")} (pila intacta)`);
    } catch (error) {
      salida.push(`  ERROR: ${(error as Error).message}`);
    }
  } else if (comando === "REPORTE") {
    const diaActual = parseInt(tokens[1].split("=")[1], 10);
    salida.push(`> REPORTE dia=${diaActual}`);
    const reporte = sistema.reporte(diaActual);
    const bandejasStr = DEPENDENCIAS.map((dep) => `${dep} ${reporte.bandejas[dep]}`).join(" | ");
    salida.push(`  Bandejas: ${bandejasStr}`);
    salida.push(
      `  Represados: ${reporte.represados}  Archivados por R3: ${reporte.archivados}  Resueltos: ${reporte.resueltos}`
    );
    const devolucionesStr =
      DEPENDENCIAS.map((dep) => [dep, reporte.devoluciones[dep]] as const)
        .filter(([, cantidad]) => cantidad > 0)
        .map(([dep, cantidad]) => `${dep} ${cantidad}`)
        .join(", ") || "ninguna";
    salida.push(`  Devoluciones por dependencia: ${devolucionesStr}`);
    if (reporte.vencidos.length > 0) {
      const vencidosStr = reporte.vencidos.map(([r, d]) => `${r} (${d} dias habiles)`).join(", ");
      salida.push(`  VENCIDOS (R6): ${vencidosStr}`);
    } else {
      salida.push("  VENCIDOS (R6): ninguno");
    }
  } else {
    salida.push(`> ${linea}`);
    salida.push(`  comando desconocido: ${comando}`);
  }

  return salida.join("\n");
}

if (require.main === module) {
  const archivo = process.argv[2];
  if (!archivo) {
    console.log("Uso: tsx main.ts <archivo_de_comandos>");
    process.exit(1);
  }
  ejecutar(archivo);
}
