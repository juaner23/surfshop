// Marcador para las pantallas que todavía no se construyeron.
// Se va dejando de usar a medida que avanzan las etapas.
export default function PaginaPendiente({ titulo, etapa }) {
  return (
    <section>
      <h1>{titulo}</h1>
      <p>Esta pantalla se construye en la etapa {etapa}.</p>
    </section>
  );
}
