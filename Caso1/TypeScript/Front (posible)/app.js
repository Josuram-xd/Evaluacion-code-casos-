// JS plano de navegador: nada de logica de negocio aqui, solo manda la
// linea de comando al servidor (que reutiliza BiciTaller) y pinta la salida.

const salida = document.getElementById("salida");
const entrada = document.getElementById("entrada");

function escribir(texto) {
  salida.textContent += "\n" + texto;
  salida.scrollTop = salida.scrollHeight;
}

async function ejecutar(linea) {
  if (!linea) return;
  escribir("> " + linea);
  try {
    const respuesta = await fetch("/comando", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linea }),
    });
    const datos = await respuesta.json();
    escribir(datos.salida);
  } catch (error) {
    escribir("RECHAZADA: no se pudo contactar al servidor (" + error + ")");
  }
}

document.getElementById("ejecutar").addEventListener("click", () => {
  const linea = entrada.value.trim();
  entrada.value = "";
  ejecutar(linea);
});

entrada.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    document.getElementById("ejecutar").click();
  }
});

document.getElementById("reporte").addEventListener("click", () => ejecutar("REPORTE"));
