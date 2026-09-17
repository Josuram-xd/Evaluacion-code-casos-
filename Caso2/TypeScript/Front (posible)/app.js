const transcripcion = document.getElementById("transcripcion");
const form = document.getElementById("form-comando");
const campo = document.getElementById("campo");
const btnReporte = document.getElementById("btn-reporte");

function escribir(texto) {
  transcripcion.textContent += texto + "\n";
  transcripcion.scrollTop = transcripcion.scrollHeight;
}

async function correr(linea) {
  escribir("> " + linea);
  const resp = await fetch("/comando", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ linea }),
  });
  const datos = await resp.json();
  if (datos.error) {
    escribir("  " + datos.error);
    return;
  }
  for (const l of datos.salida) {
    escribir("  " + l);
  }
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const linea = campo.value.trim();
  if (!linea) return;
  campo.value = "";
  correr(linea);
});

btnReporte.addEventListener("click", () => correr("REPORTE"));

escribir("parque cargado, escribe un comando, por ejemplo: LLAMADA ASC-118 EMERGENCIA 480");
