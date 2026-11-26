import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ciudadesDeRegion, REGIONES_CHILE } from '../data/regionesChile';
import { obtenerMensajeError } from '../services/api.client';
import SesionService from '../services/sesion.service';
import UsuarioService, { type Usuario } from '../services/usuario.service';

const LARGO_MINIMO_CONTRASENIA = 8;
const FORMATO_COMUNA = /^[\p{L}][\p{L}\s'.-]*$/u;
const LARGO_MAXIMO_COMUNA = 50;
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Perfil = () => {
  const sesion = SesionService.obtener();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [email, setEmail] = useState('');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [deptoOficina, setDeptoOficina] = useState('');
  const [comuna, setComuna] = useState('');
  const [region, setRegion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);
  const [exitoPerfil, setExitoPerfil] = useState<string | null>(null);

  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
  const [contraseniaActual, setContraseniaActual] = useState('');
  const [contraseniaNueva, setContraseniaNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [cambiando, setCambiando] = useState(false);
  const [errorContrasenia, setErrorContrasenia] = useState<string | null>(null);
  const [exitoContrasenia, setExitoContrasenia] = useState<string | null>(null);

  const cargarFormulario = useCallback((datos: Usuario) => {
    setNombre(datos.nombre ?? '');
    setApellido(datos.apellido ?? '');
    setSegundoApellido(datos.segundoApellido ?? '');
    setEmail(datos.email ?? '');
    setCalle(datos.calle ?? '');
    setNumero(datos.numero ?? '');
    setDeptoOficina(datos.deptoOficina ?? '');
    setComuna(datos.comuna ?? '');
    setRegion(datos.region ?? '');
    setCiudad(datos.ciudad ?? '');
  }, []);

  const cargarUsuario = useCallback(async () => {
    const actual = SesionService.obtener();
    if (!actual) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setErrorCarga(null);
    try {
      const datos = await UsuarioService.obtener(actual.id);
      setUsuario(datos);
      cargarFormulario(datos);
    } catch (err) {
      setErrorCarga(obtenerMensajeError(err, 'No se pudieron cargar tus datos.'));
    } finally {
      setCargando(false);
    }
  }, [cargarFormulario]);

  useEffect(() => {
    void cargarUsuario();
  }, [cargarUsuario]);

  const handleGuardarPerfil = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorPerfil(null);
    setExitoPerfil(null);

    if (!sesion) return;

    if (!nombre.trim() || !apellido.trim()) {
      setErrorPerfil('El nombre y el primer apellido son obligatorios.');
      return;
    }
    if (!FORMATO_CORREO.test(email.trim())) {
      setErrorPerfil('Ingresa un correo electrónico válido.');
      return;
    }

    const comunaLimpia = comuna.trim();
    if (comunaLimpia && (comunaLimpia.length > LARGO_MAXIMO_COMUNA || !FORMATO_COMUNA.test(comunaLimpia))) {
      setErrorPerfil('Ingresa una comuna válida, solo con letras (máximo 50 caracteres).');
      return;
    }

    const camposDireccion = [calle, numero, comuna, region, ciudad];
    const algunoCompleto = [...camposDireccion, deptoOficina].some((campo) => campo.trim() !== '');
    if (algunoCompleto && camposDireccion.some((campo) => campo.trim() === '')) {
      setErrorPerfil('Para guardar la dirección completa calle, número, región, ciudad y comuna.');
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await UsuarioService.actualizar(sesion.id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        segundoApellido: segundoApellido.trim(),
        email: email.trim(),
        calle: calle.trim(),
        numero: numero.trim(),
        deptoOficina: deptoOficina.trim(),
        comuna: comunaLimpia,
        region,
        ciudad,
        referenciaPago: usuario?.referenciaPago
      });
      setUsuario(actualizado);
      cargarFormulario(actualizado);
      SesionService.iniciar({ ...sesion, nombre: actualizado.nombre, email: actualizado.email });
      setExitoPerfil('Tus datos fueron actualizados.');
    } catch (err) {
      setErrorPerfil(obtenerMensajeError(err, 'No se pudieron guardar los cambios. Inténtalo nuevamente.'));
    } finally {
      setGuardando(false);
    }
  };

  const handleCambioRegion = (nuevaRegion: string) => {
    setRegion(nuevaRegion);
    setCiudad('');
  };

  const handleDescartar = () => {
    if (usuario) cargarFormulario(usuario);
    setErrorPerfil(null);
    setExitoPerfil(null);
  };

  const handleCancelarContrasenia = () => {
    setMostrarContrasenia(false);
    setContraseniaActual('');
    setContraseniaNueva('');
    setConfirmacion('');
    setErrorContrasenia(null);
  };

  const handleCambiarContrasenia = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorContrasenia(null);
    setExitoContrasenia(null);

    if (!sesion) return;

    if (!contraseniaActual) {
      setErrorContrasenia('Ingresa tu contraseña actual.');
      return;
    }
    if (contraseniaNueva.length < LARGO_MINIMO_CONTRASENIA) {
      setErrorContrasenia(`La nueva contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENIA} caracteres.`);
      return;
    }
    if (contraseniaNueva === contraseniaActual) {
      setErrorContrasenia('La nueva contraseña debe ser distinta de la actual.');
      return;
    }
    if (contraseniaNueva !== confirmacion) {
      setErrorContrasenia('Las contraseñas no coinciden.');
      return;
    }

    setCambiando(true);
    try {
      await UsuarioService.cambiarContrasenia(sesion.id, { contraseniaActual, contraseniaNueva });
      setContraseniaActual('');
      setContraseniaNueva('');
      setConfirmacion('');
      setMostrarContrasenia(false);
      setExitoContrasenia('Tu contraseña fue actualizada.');
    } catch (err) {
      setErrorContrasenia(obtenerMensajeError(err, 'No se pudo cambiar la contraseña. Inténtalo nuevamente.'));
    } finally {
      setCambiando(false);
    }
  };

  return (
    <div className="contenedor">
      <h1 className="titulo-pagina">Mi perfil</h1>

      {cargando && <p role="status" className="texto-suave">Cargando tus datos…</p>}

      {errorCarga && (
        <div role="alert" className="mensaje mensaje-error">
          <p>{errorCarga}</p>
          <button type="button" className="boton boton-borde" onClick={() => void cargarUsuario()}>
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !errorCarga && usuario && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <section className="tarjeta h-100" aria-labelledby="titulo-datos">
              <h2 id="titulo-datos">Mis datos</h2>
              <p className="texto-suave">
                Cuenta {usuario.estado === 'ACTIVO' ? 'activa' : 'inactiva'}
                {usuario.fechaCreacion && ` · Miembro desde ${new Date(usuario.fechaCreacion).toLocaleDateString('es-CL')}`}
              </p>

              {errorPerfil && <p role="alert" className="mensaje mensaje-error">{errorPerfil}</p>}
              {exitoPerfil && <p role="status" className="mensaje mensaje-exito">{exitoPerfil}</p>}

              <form onSubmit={handleGuardarPerfil} className="row g-3 my-2" noValidate>
                <div className="campo col-12">
                  <label htmlFor="perfil-nombre">Nombre</label>
                  <input
                    id="perfil-nombre"
                    type="text"
                    autoComplete="given-name"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    required
                  />
                </div>

                <div className="campo col-12 col-md-6">
                  <label htmlFor="perfil-apellido">Primer apellido</label>
                  <input
                    id="perfil-apellido"
                    type="text"
                    autoComplete="family-name"
                    value={apellido}
                    onChange={(event) => setApellido(event.target.value)}
                    required
                  />
                </div>

                <div className="campo col-12 col-md-6">
                  <label htmlFor="perfil-segundo-apellido">Segundo apellido (opcional)</label>
                  <input
                    id="perfil-segundo-apellido"
                    type="text"
                    value={segundoApellido}
                    onChange={(event) => setSegundoApellido(event.target.value)}
                  />
                </div>

                <div className="campo col-12">
                  <label htmlFor="perfil-email">Correo electrónico</label>
                  <input
                    id="perfil-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <h3 className="fs-6 fw-bold mb-0">Dirección de envío</h3>
                </div>

                <div className="campo col-12 col-sm-8">
                  <label htmlFor="perfil-calle">Calle</label>
                  <input
                    id="perfil-calle"
                    type="text"
                    autoComplete="address-line1"
                    value={calle}
                    onChange={(event) => setCalle(event.target.value)}
                  />
                </div>

                <div className="campo col-12 col-sm-4">
                  <label htmlFor="perfil-numero">Número</label>
                  <input
                    id="perfil-numero"
                    type="text"
                    inputMode="numeric"
                    value={numero}
                    onChange={(event) => setNumero(event.target.value)}
                  />
                </div>

                <div className="campo col-12">
                  <label htmlFor="perfil-depto">Casa / depto / oficina (opcional)</label>
                  <input
                    id="perfil-depto"
                    type="text"
                    autoComplete="address-line2"
                    value={deptoOficina}
                    onChange={(event) => setDeptoOficina(event.target.value)}
                  />
                </div>

                <div className="campo col-12 col-sm-6">
                  <label htmlFor="perfil-region">Región</label>
                  <select
                    id="perfil-region"
                    autoComplete="address-level1"
                    value={region}
                    onChange={(event) => handleCambioRegion(event.target.value)}
                  >
                    <option value="">Selecciona una región</option>
                    {REGIONES_CHILE.map((opcion) => (
                      <option key={opcion.nombre} value={opcion.nombre}>{opcion.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="campo col-12 col-sm-6">
                  <label htmlFor="perfil-ciudad">Ciudad</label>
                  <select
                    id="perfil-ciudad"
                    autoComplete="address-level2"
                    value={ciudad}
                    onChange={(event) => setCiudad(event.target.value)}
                    disabled={!region}
                  >
                    <option value="">{region ? 'Selecciona una ciudad' : 'Primero elige una región'}</option>
                    {ciudadesDeRegion(region).map((nombre) => (
                      <option key={nombre} value={nombre}>{nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="campo col-12">
                  <label htmlFor="perfil-comuna">Comuna</label>
                  <input
                    id="perfil-comuna"
                    type="text"
                    maxLength={LARGO_MAXIMO_COMUNA}
                    value={comuna}
                    onChange={(event) => setComuna(event.target.value)}
                  />
                </div>

                <div className="col-12 col-sm-6 d-grid">
                  <button type="submit" className="boton boton-primario" disabled={guardando}>
                    {guardando ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
                <div className="col-12 col-sm-6 d-grid">
                  <button type="button" className="boton boton-borde" onClick={handleDescartar} disabled={guardando}>
                    Descartar cambios
                  </button>
                </div>
              </form>
            </section>
          </div>

          <div className="col-12 col-lg-6">
            <section className="tarjeta" aria-labelledby="titulo-contrasenia">
              <h2 id="titulo-contrasenia">Contraseña</h2>

              {exitoContrasenia && <p role="status" className="mensaje mensaje-exito">{exitoContrasenia}</p>}

              {!mostrarContrasenia && (
                <>
                  <p className="texto-suave">Por seguridad, te pediremos tu contraseña actual para cambiarla.</p>
                  <button
                    type="button"
                    className="boton boton-borde"
                    onClick={() => {
                      setExitoContrasenia(null);
                      setMostrarContrasenia(true);
                    }}
                  >
                    Cambiar contraseña
                  </button>
                </>
              )}

              {mostrarContrasenia && (
                <>
                  <p className="texto-suave">Usa al menos {LARGO_MINIMO_CONTRASENIA} caracteres.</p>

                  {errorContrasenia && <p role="alert" className="mensaje mensaje-error">{errorContrasenia}</p>}

                  <form onSubmit={handleCambiarContrasenia} className="row g-3 my-2" noValidate>
                    <div className="campo col-12">
                      <label htmlFor="contrasenia-actual">Contraseña actual</label>
                      <input
                        id="contrasenia-actual"
                        type="password"
                        autoComplete="current-password"
                        value={contraseniaActual}
                        onChange={(event) => setContraseniaActual(event.target.value)}
                        required
                      />
                    </div>

                    <div className="campo col-12">
                      <label htmlFor="contrasenia-nueva">Nueva contraseña</label>
                      <input
                        id="contrasenia-nueva"
                        type="password"
                        autoComplete="new-password"
                        value={contraseniaNueva}
                        onChange={(event) => setContraseniaNueva(event.target.value)}
                        required
                      />
                    </div>

                    <div className="campo col-12">
                      <label htmlFor="contrasenia-confirmacion">Confirmar nueva contraseña</label>
                      <input
                        id="contrasenia-confirmacion"
                        type="password"
                        autoComplete="new-password"
                        value={confirmacion}
                        onChange={(event) => setConfirmacion(event.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12 col-sm-6 d-grid">
                      <button type="submit" className="boton boton-primario" disabled={cambiando}>
                        {cambiando ? 'Actualizando…' : 'Actualizar contraseña'}
                      </button>
                    </div>
                    <div className="col-12 col-sm-6 d-grid">
                      <button type="button" className="boton boton-borde" onClick={handleCancelarContrasenia} disabled={cambiando}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
