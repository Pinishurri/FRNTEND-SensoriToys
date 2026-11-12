import { Link } from 'react-router';

const NotFound = () => (
  <div className="contenedor">
    <div className="row justify-content-center">
      <div className="col-12 col-md-10 col-lg-8">
        <section className="tarjeta vacio">
          <h1>Página no encontrada</h1>
          <p className="texto-suave">La dirección a la que intentas acceder no existe en SensoriToys.</p>
          <Link to="/" className="boton boton-primario">Volver al catálogo</Link>
        </section>
      </div>
    </div>
  </div>
);

export default NotFound;