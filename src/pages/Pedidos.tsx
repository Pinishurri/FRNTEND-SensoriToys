import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { obtenerMensajeError } from '../services/api.client';
import PedidoService, { type Pedido } from '../services/pedido.service';
import ProductoService, { type Producto } from '../services/producto.service';
import SesionService from '../services/sesion.service';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <ul className="lista-pedidos">
          {pedidos.map((pedido) => (
            <li key={pedido.id} className="tarjeta">
              <div className="pedido-cabecera">
                <h2>Pedido #{pedido.id}</h2>
                <span className="texto-suave">
                  {new Date(pedido.fechaCreacion).toLocaleDateString('es-CL')}
                </span>
              </div>
              <ul className="pedido-detalle">
                {(pedido.detalles ?? []).map((detalle) => (
                  <li key={detalle.id}>
                    {detalle.cantidad} × {nombreProducto(detalle.productoId)} — $
                    {detalle.precioUnitario.toLocaleString('es-CL')} c/u
                  </li>
                ))}
              </ul>
              <p className="precio">Total: ${pedido.total.toLocaleString('es-CL')}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Pedidos;