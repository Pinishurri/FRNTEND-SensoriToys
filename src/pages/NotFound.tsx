import { Link } from 'react-router';

const NotFound = () => (
  <div className="contenedor">
    <section className="tarjeta vacio">
      <h1>Página no encontrada</h1>
      <p className="texto-suave">La dirección a la que intentas acceder no existe en SensoriToys.</p>
      <Link to="/" className="boton boton-primario">Volver al catálogo</Link>
    </section>
  </div>
);

export default NotFound;
