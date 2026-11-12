import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { obtenerMensajeError } from '../services/api.client';
import SesionService from '../services/sesion.service';
import UsuarioService from '../services/usuario.service';

interface EstadoLogin {
  desde?: string;
  mensaje?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const estado = location.state as EstadoLogin | null;

  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnviando(true);
    setError(null);

    try {
      const respuesta = await UsuarioService.login({ email: email.trim(), contrasenia });
      SesionService.iniciar(respuesta);
      navigate(estado?.desde ?? (respuesta.rol === 'ADMIN' ? '/admin' : '/'), { replace: true });
    } catch (err) {
      setError(obtenerMensajeError(err, 'No se pudo conectar con el servidor. Inténtalo nuevamente.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contenedor">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-4">
          <section className="tarjeta" aria-labelledby="titulo-login">
            <h1 id="titulo-login">Iniciar sesión</h1>

            {estado?.mensaje && <p role="status" className="mensaje mensaje-exito">{estado.mensaje}</p>}
            {error && <p role="alert" className="mensaje mensaje-error">{error}</p>}

            <form onSubmit={handleSubmit} className="formulario">
              <div className="campo">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="contrasenia">Contraseña</label>
                <input
                  id="contrasenia"
                  name="contrasenia"
                  type="password"
                  autoComplete="current-password"
                  value={contrasenia}
                  onChange={(event) => setContrasenia(event.target.value)}
                  required
                />
              </div>

              <button type="submit" className="boton boton-primario" disabled={enviando}>
                {enviando ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>

            <p className="texto-suave centrado">
              ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
