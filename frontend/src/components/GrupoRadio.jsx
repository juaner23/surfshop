import './GrupoRadio.css';

export default function GrupoRadio({ nombre, legend, opciones, valor, onChange, error }) {
  const idError = `${nombre}-error`;

  return (
    <fieldset
      className={`radios${error ? ' radios--error' : ''}`}
      aria-describedby={error ? idError : undefined}
    >
      <legend className="radios__legend">{legend}</legend>

      <div className="radios__lista">
        {opciones.map((op) => (
          <label
            key={op.valor}
            className={`radios__opcion${valor === op.valor ? ' radios__opcion--activa' : ''}`}
          >
            <input
              type="radio"
              name={nombre}
              value={op.valor}
              checked={valor === op.valor}
              onChange={() => onChange(op.valor)}
            />
            <span>{op.etiqueta}</span>
          </label>
        ))}
      </div>

      {error && (
        <p id={idError} className="radios__error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}