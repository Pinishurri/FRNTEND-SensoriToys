import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { obtenerMensajeError } from '../services/api.client';
import PedidoService, { type Pedido } from '../services/pedido.service';
import ReclamoService, {
  ETIQUETA_ESTADO,
  ETIQUETA_MOTIVO,
  type EstadoReclamo,
  type MotivoReclamo,
  type Reclamo
} from '../services/reclamo.service';
import SesionService from '../services/sesion.service';

const LARGO_MINIMO_DESCRIPCION = 10;
const LARGO_MAXIMO_DESCRIPCION = 1000;

const CLASE_ESTADO: Record<EstadoReclamo, string> = {
  PENDIENTE: 'etiqueta-pendiente',
  EN_REVISION: 'etiqueta-revision',
  RESUELTO: 'etiqueta-resuelto'
};

const motivos = Object.keys(ETIQUETA_MOTIVO) as MotivoReclamo[];

const Reclamos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [pedidoId, setPedidoId] = useState('');
  const [motivo, setMotivo] = useState<MotivoReclamo | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    const sesion = SesionService.obtener();
    if (!sesion) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setErrorCarga(null);
    try {
      const [listaPedidos, listaReclamos] = await Promise.all([
        PedidoService.listarPorUsuario(sesion.id),
        ReclamoService.listarPorUsuario(sesion.id)
      ]);
      setPedidos(listaPedidos);
      setReclamos(listaReclamos);
    } catch (err) {
      setErrorCarga(obtenerMensajeError(err, 'No se pudieron cargar tus reclamos.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setExito(null);

    const sesion = SesionService.obtener();
    if (!sesion) return;

    if (!motivo) {
      setError('Selecciona el motivo de tu solicitud.');
      return;
    }
    const texto = descripcion.trim();
    if (texto.length < LARGO_MINIMO_DESCRIPCION) {
      setError(`Cuéntanos qué ocurrió con al menos ${LARGO_MINIMO_DESCRIPCION} caracteres.`);
      return;
    }

    setEnviando(true);
    try {
      const creado = await ReclamoService.crear({
        usuarioId: sesion.id,
        pedidoId: pedidoId ? Number(pedidoId) : null,
        motivo,
        descripcion: texto
      });
      setReclamos((anteriores) => [creado, ...anteriores]);
      setPedidoId('');
      setMotivo('');
      setDescripcion('');
      setExito(`Recibimos tu solicitud (reclamo #${creado.id}). Te avisaremos cuando cambie su estado.`);
    } catch (err) {
      setError(obtenerMensajeError(err, 'No se pudo enviar tu solicitud. Inténtalo nuevamente.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contenedor">
      <h1 className="titulo-pagina">Reclamos y reembolsos</h1>

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <section className="tarjeta h-100" aria-labelledby="titulo-nuevo-reclamo">
            <h2 id="titulo-nuevo-reclamo">Nueva solicitud</h2>

            {error && <p role="alert" className="mensaje mensaje-error">{error}</p>}
            {exito && <p role="status" className="mensaje mensaje-exito">{exito}</p>}

            <form onSubmit={handleSubmit} className="row g-3 my-2" noValidate>
              <div className="campo col-12">
                <label htmlFor="reclamo-pedido">Pedido relacionado (opcional)</label>
                <select
                  id="reclamo-pedido"
                  value={pedidoId}
                  onChange={(event) => setPedidoId(event.target.value)}
                  disabled={cargando}
                >
                  <option value="">Sin pedido asociado</option>
                  {pedidos.map((pedido) => (
                    <option key={pedido.id} value={pedido.id}>
                      Pedido #{pedido.id} · {new Date(pedido.fechaCreacion).toLocaleDateString('es-CL')} · $
                      {pedido.total.toLocaleString('es-CL')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo col-12">
                <label htmlFor="reclamo-motivo">Motivo</label>
                <select
                  id="reclamo-motivo"
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value as MotivoReclamo | '')}
                  required
                >
                  <option value="">Selecciona un motivo</option>
                  {motivos.map((clave) => (
                    <option key={clave} value={clave}>{ETIQUETA_MOTIVO[clave]}</option>
                  ))}
                </select>
              </div>

              <div className="campo col-12">
                <label htmlFor="reclamo-descripcion">Descripción</label>
                <textarea
                  id="reclamo-descripcion"
                  rows={5}
                  maxLength={LARGO_MAXIMO_DESCRIPCION}
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  aria-describedby="reclamo-descripcion-ayuda"
                  required
                />
                <span id="reclamo-descripcion-ayuda" className="campo-ayuda">
                  {descripcion.length}/{LARGO_MAXIMO_DESCRIPCION} caracteres
                </span>
              </div>

              <div className="col-12 d-grid">
                <button type="submit" className="boton boton-primario" disabled={enviando}>
                  {enviando ? 'Enviando…' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="col-12 col-lg-7">
          <section className="tarjeta h-100" aria-labelledby="titulo-historial-reclamos">
            <h2 id="titulo-historial-reclamos">Mis solicitudes</h2>

            {cargando && <p role="status" className="texto-suave">Cargando tus solicitudes…</p>}

            {errorCarga && (
              <div role="alert" className="mensaje mensaje-error">
                <p>{errorCarga}</p>
                <button type="button" className="boton boton-borde" onClick={() => void cargarDatos()}>
                  Reintentar
                </button>
              </div>
            )}

            {!cargando && !errorCarga && reclamos.length === 0 && (
              <p className="texto-suave">Aún no has enviado solicitudes.</p>
            )}

            {!cargando && !errorCarga && reclamos.length > 0 && (
              <ul className="list-unstyled d-grid gap-3 mb-0">
                {reclamos.map((reclamo) => (
                  <li key={reclamo.id} className="border rounded-3 p-3">
                    <div className="pedido-cabecera">
                      <h3 className="fs-6 fw-bold mb-0">
                        #{reclamo.id} · {ETIQUETA_MOTIVO[reclamo.motivo]}
                      </h3>
                      <span className={`etiqueta ${CLASE_ESTADO[reclamo.estado]}`}>
                        {ETIQUETA_ESTADO[reclamo.estado]}
                      </span>
                    </div>
                    <p className="texto-suave mb-1">
                      {new Date(reclamo.fechaCreacion).toLocaleDateString('es-CL')}
                      {reclamo.pedidoId !== null && ` · Pedido #${reclamo.pedidoId}`}
                    </p>
                    <p className="mb-0" style={{ overflowWrap: 'anywhere' }}>{reclamo.descripcion}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Reclamos;
