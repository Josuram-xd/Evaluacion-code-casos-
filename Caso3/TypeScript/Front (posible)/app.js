const salida = document.getElementById("salida");
const formulario = document.getElementById("formulario");
const input = document.getElementById("linea");
const botonReiniciar = document.getElementById("reiniciar");

function escribir(texto) {
  salida.textContent += texto + "\n\n";
  salida.scrollTop = salida.scrollHeight;
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const linea = input.value.trim();
  if (!linea) return;
  input.value = "";

  const respuesta = await fetch("/comando", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ linea }),
  });
  const datos = await respuesta.json();
  escribir(datos.salida ?? `ERROR: ${datos.error}`);
});

botonReiniciar.addEventListener("click", async () => {
  await fetch("/reiniciar", { method: "POST" });
  salida.textContent = "";
  escribir("(sistema reiniciado desde tramites.txt)");
});
