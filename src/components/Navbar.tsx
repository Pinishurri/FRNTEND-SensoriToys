import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useCart } from '../context/CartContext';
import Icono from './Icono';
import SesionService from '../services/sesion.service';

interface Sesion {
  esAdmin: boolean;
  sesionIniciada: boolean;
}

const leerSesion = (): Sesion => ({
  esAdmin: SesionService.esAdmin(),
  sesionIniciada: SesionService.estaAutenticado()
});

const Navbar = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const menuRef = useRef<HTMLDivElement>(null);

  const [sesion, setSesion] = useState<Sesion>(leerSesion);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [navAbierto, setNavAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState(searchParams.get('q') ?? '');

  const totalItems = cart.reduce((suma, item) => suma + item.cantidad, 0);

  useEffect(() => {
    setSesion(leerSesion());
    setMenuAbierto(false);
    setNavAbierto(false);
  }, [location.pathname]);

  useEffect(() => {
    setBusqueda(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    if (!navAbierto) return;

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavAbierto(false);
    };

    document.addEventListener('keydown', cerrarConEscape);
    return () => document.removeEventListener('keydown', cerrarConEscape);
  }, [navAbierto]);

  useEffect(() => {
    if (!menuAbierto) return;

    const cerrarAlHacerClicFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuAbierto(false);
    };

    document.addEventListener('mousedown', cerrarAlHacerClicFuera);
    document.addEventListener('keydown', cerrarConEscape);
    return () => {
      document.removeEventListener('mousedown', cerrarAlHacerClicFuera);
      document.removeEventListener('keydown', cerrarConEscape);
    };
  }, [menuAbierto]);

  const handleBuscar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const termino = busqueda.trim();
    navigate(termino ? `/?q=${encodeURIComponent(termino)}` : '/');
  };

  const handleLogout = () => {
    SesionService.cerrar();
    setSesion({ esAdmin: false, sesionIniciada: false });
    setMenuAbierto(false);
    navigate('/login');
  };

  return (
    <>
      <div className="aviso-envio">Envío gratis sobre $30.000 · Despacho a todo Chile</div>
      <header className="encabezado">
        <div className="encabezado-interior">
          <button
            type="button"
            className="boton boton-menu"
            aria-label={navAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={navAbierto}
            aria-controls="nav-principal"
            onClick={() => setNavAbierto((abierto) => !abierto)}
          >
            <Icono nombre={navAbierto ? 'cerrar' : 'menu'} />
          </button>

          <Link to="/" className="logo">
            <Icono nombre="globo" />
            SensoriToys
          </Link>

          <nav
            id="nav-principal"
            aria-label="Principal"
            className={`nav-principal${navAbierto ? ' abierto' : ''}`}
            onClick={() => setNavAbierto(false)}
          >
            <NavLink to="/" end>Catálogo</NavLink>
            {!sesion.sesionIniciada && (
              <NavLink to="/registro" className="nav-crear-cuenta">Crear cuenta</NavLink>
            )}
          </nav>

          <form role="search" className="buscador" onSubmit={handleBuscar}>
            <input
              type="search"
              aria-label="Buscar juguete"
              placeholder="Buscar juguete…"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
            <button type="submit" aria-label="Buscar">
              <Icono nombre="buscar" />
            </button>
          </form>

          <div className="acciones">
            <Link to="/carrito" className="boton boton-naranja boton-carrito" aria-label={`Carrito, ${totalItems} productos`}>
              <Icono nombre="carrito" />
              <span className="insignia" aria-hidden="true">{totalItems}</span>
            </Link>

            {sesion.sesionIniciada ? (
              <div className="menu-usuario" ref={menuRef}>
                <button
                  type="button"
                  className="boton boton-amarillo"
                  aria-expanded={menuAbierto}
                  aria-controls="menu-cuenta"
                  onClick={() => setMenuAbierto((abierto) => !abierto)}
                >
                  <Icono nombre="usuario" />
                  <span className="etiqueta-responsive">Mi cuenta</span>
                  <span className="etiqueta-responsive"><Icono nombre="chevron" /></span>
                </button>
                {menuAbierto && (
                  <ul id="menu-cuenta" className="menu-desplegable">
                    {sesion.esAdmin ? (
                      <li><Link to="/admin">Panel de administración</Link></li>
                    ) : (
                      <>
                        <li><Link to="/perfil">Mi perfil</Link></li>
                        <li><Link to="/pedidos">Mis pedidos</Link></li>
                        <li><Link to="/reclamos">Reclamos y reembolsos</Link></li>
                      </>
                    )}
                    <li><button type="button" onClick={handleLogout}>Cerrar sesión</button></li>
                  </ul>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="boton boton-amarillo">
                  <Icono nombre="usuario" />
                  <span className="etiqueta-responsive">Ingresar</span>
                </Link>
                <Link to="/registro" className="enlace-crear-cuenta">Crear cuenta</Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;