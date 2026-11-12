interface FiltroChipsProps {
  etiqueta: string;
  textoTodos: string;
  opciones: string[];
  valor: string;
  onChange: (valor: string) => void;
}

const FiltroChips = ({ etiqueta, textoTodos, opciones, valor, onChange }: FiltroChipsProps) => (
  <div role="group" aria-label={etiqueta} className="filtro-chips">
    <button type="button" className="chip" aria-pressed={valor === ''} onClick={() => onChange('')}>
      {textoTodos}
    </button>
    {opciones.map((opcion) => (
      <button
        key={opcion}
        type="button"
        className="chip"
        aria-pressed={valor === opcion}
        onClick={() => onChange(opcion)}
      >
        {opcion}
      </button>
    ))}
  </div>
);

export default FiltroChips;
