const iconos = {
  carrito: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  buscar: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  globo: (
    <>
      <circle cx="12" cy="10" r="7" />
      <path d="M12 17v4" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  cerrar: <path d="M6 6l12 12M18 6L6 18" />
};

export type NombreIcono = keyof typeof iconos;

interface IconoProps {
  nombre: NombreIcono;
}

const Icono = ({ nombre }: IconoProps) => (
  <svg className="icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {iconos[nombre]}
  </svg>
);

export default Icono;