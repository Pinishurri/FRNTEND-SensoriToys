import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import DetallePedidoModal from '../components/DetallePedidoModal';
import { obtenerMensajeError } from '../services/api.client';
import PedidoService, { type Pedido } from '../services/pedido.service';
import ProductoService, { type Producto } from '../services/producto.service';
import SesionService from '../services/sesion.service';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  const cargarPedidos = useCallback(async () => {
    const sesion = SesionService.obtener();
    if (!sesion) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [listaPedidos, listaProductos] = await Promise.all([
        PedidoService.listarPorUsuario(sesion.id),
        ProductoService.listar()
      ]);
      setPedidos(listaPedidos);
      setProductos(listaProductos);
    } catch (err) {
      setError(obtenerMensajeError(err, 'No se pudieron cargar tus pedidos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarPedidos();
  }, [cargarPedidos]);

  const nombreProducto = (productoId: number) =>
    productos.find((producto) => producto.id === productoId)?.nombre ?? `Producto #${productoId}`;

  const cerrarDetalle = useCallback(() => setPedidoSeleccionado(null), []);

  const resumenProductos = (pedido: Pedido) => {
    const total = (pedido.detalles ?? []).reduce((suma, detalle) => suma + detalle.cantidad, 0);
    return `${total} ${total === 1 ? 'producto' : 'productos'} en este pedido`;
  };

  return (
    <div className="contenedor">
      <h1 className="titulo-pagina">Mis pedidos</h1>

      {loading && <p role="status" className="texto-suave">Cargando tus pedidos…</p>}

      {error && (
        <div role="alert" className="mensaje mensaje-error">
          <p>{error}</p>
          <button type="button" className="boton boton-borde" onClick={() => void cargarPedidos()}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && pedidos.length === 0 && (
        <section className="tarjeta vacio">
          <h2>Aún no tienes pedidos</h2>
          <p className="texto-suave">Cuando compres, tus pedidos aparecerán aquí.</p>
          <Link to="/" className="boton boton-primario">Ir al catálogo</Link>
        </section>
      )}

      {!loading && !error && pedidos.length > 0 && (
        <ul className="row g-4 list-unstyled">
          {pedidos.map((pedido) => (
            <li key={pedido.id} className="col-12 col-md-6 col-lg-4">
              <div
                className="tarjeta h-100 d-flex flex-column gap-2"
                style={{ cursor: 'pointer' }}
                onClick={() => setPedidoSeleccionado(pedido)}
              >
                <div className="pedido-cabecera">
                  <h2>Pedido #{pedido.id}</h2>
                  <span className="texto-suave">
                    {new Date(pedido.fechaCreacion).toLocaleDateString('es-CL')}
                  </span>
                </div>
                <p className="texto-suave mb-0">{resumenProductos(pedido)}</p>
                <p className="precio mb-0">Total: ${pedido.total.toLocaleString('es-CL')}</p>
                <button
                  type="button"
                  className="boton boton-borde mt-auto"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPedidoSeleccionado(pedido);
                  }}
                >
                  Ver detalle<span className="visually-hidden"> del pedido #{pedido.id}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pedidoSeleccionado && (
        <DetallePedidoModal
          pedido={pedidoSeleccionado}
          nombreProducto={nombreProducto}
          onCerrar={cerrarDetalle}
        />
      )}
    </div>
  );
};

export default Pedidos;