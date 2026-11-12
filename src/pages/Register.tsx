import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { obtenerMensajeError } from '../services/api.client';
import UsuarioService from '../services/usuario.service';

const Register = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (contrasenia !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);
    try {
      await UsuarioService.registrar({ nombre: nombre.trim(), email: email.trim(), contrasenia });
      navigate('/login', { state: { mensaje: 'Tu cuenta fue creada. Ya puedes iniciar sesión.' } });
    } catch (err) {
      setError(obtenerMensajeError(err, 'No se pudo conectar con el servidor. Inténtalo nuevamente.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contenedor contenedor-angosto">
      <section className="tarjeta" aria-labelledby="titulo-registro">
        <h1 id="titulo-registro">Crear cuenta</h1>

        {error && <p role="alert" className="mensaje mensaje-error">{error}</p>}

        <form onSubmit={handleSubmit} className="formulario">
          <div className="campo">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
            />
          </div>

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
              autoComplete="new-password"
              value={contrasenia}
              onChange={(event) => setContrasenia(event.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="confirmacion">Confirmar contraseña</label>
            <input
              id="confirmacion"
              name="confirmacion"
              type="password"
              autoComplete="new-password"
              value={confirmacion}
              onChange={(event) => setConfirmacion(event.target.value)}
              required
            />
          </div>

          <button type="submit" className="boton boton-primario" disabled={enviando}>
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="texto-suave centrado">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </section>
    </div>
  );
};

export default Register;
