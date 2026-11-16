import './CampoFormulario.css';

export default function CampoFormulario({
  id,
  label,
  tipo = 'text',
  multilinea = false,
  valor,
  onChange,
  onBlur,
  error,
  opcional = false,
  ayuda,
  ...resto
}) {
  const idError = `${id}-error`;
  const Control = multilinea ? 'textarea' : 'input';

  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label htmlFor={id} className="campo__label">
        {label}
        {opcional && <span className="campo__opcional"> (opcional)</span>}
      </label>

      <Control
        id={id}
        name={id}
        className="campo__control"
        type={multilinea ? undefined : tipo}
        value={valor}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? idError : undefined}
        {...resto}
      />

      {error && (
        <p id={idError} className="campo__error" role="alert">
          {error}
        </p>
      )}
      {ayuda && <p className="campo__ayuda">{ayuda}</p>}
    </div>
  );
}