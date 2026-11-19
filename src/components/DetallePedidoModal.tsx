import { useEffect, useRef } from 'react';
import type { Pedido } from '../services/pedido.service';

interface DetallePedidoModalProps {
  pedido: Pedido;
  cliente?: string;
  nombreProducto: (productoId: number) => string;
  onCerrar: () => void;
}

const formatoPesos = (valor: number) => `$${valor.toLocaleString('es-CL')}`;

const DetallePedidoModal = ({ pedido, cliente, nombreProducto, onCerrar }: DetallePedidoModalProps) => {
  const botonCerrarRef = useRef<HTMLButtonElement>(null);
  const detalles = pedido.detalles ?? [];
  const totalProductos = detalles.reduce((suma, detalle) => suma + detalle.cantidad, 0);

  useEffect(() => {
    botonCerrarRef.current?.focus();
    const desbordePrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = desbordePrevio;
    };
  }, []);

  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCerrar();
    };

    document.addEventListener('keydown', cerrarConEscape);
    return () => document.removeEventListener('keydown', cerrarConEscape);
  }, [onCerrar]);

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCerrar();
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-pedido"
      >
        <div className="modal-content border-0 rounded-4 shadow p-2 p-sm-3">
          <div className="modal-header border-0 pb-0">
            <h2 id="titulo-modal-pedido" className="fs-5 fw-bold modal-title" style={{ color: '#16498C' }}>
              Pedido #{pedido.id}
            </h2>
            <button
              ref={botonCerrarRef}
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={onCerrar}
            ></button>
          </div>

          <div className="modal-body">
            <dl className="row g-1 mb-3 small">
              <dt className="col-5 col-sm-3 text-muted fw-semibold">Fecha</dt>
              <dd className="col-7 col-sm-9 mb-0">{new Date(pedido.fechaCreacion).toLocaleDateString('es-CL')}</dd>
              {cliente && (
                <>
                  <dt className="col-5 col-sm-3 text-muted fw-semibold">Cliente</dt>
                  <dd className="col-7 col-sm-9 mb-0" style={{ overflowWrap: 'anywhere' }}>{cliente}</dd>
                </>
              )}
              <dt className="col-5 col-sm-3 text-muted fw-semibold">Productos</dt>
              <dd className="col-7 col-sm-9 mb-0">
                {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
              </dd>
            </dl>

            <div className="border rounded-3 overflow-auto" style={{ maxHeight: '45vh' }}>
              <table className="table table-sm small align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col" className="sticky-top bg-light">Producto</th>
                    <th scope="col" className="sticky-top bg-light text-end text-nowrap">Cant.</th>
                    <th scope="col" className="sticky-top bg-light text-end text-nowrap">
                      <span className="d-none d-sm-inline">Precio unit.</span>
                      <span className="d-sm-none">Precio</span>
                    </th>
                    <th scope="col" className="sticky-top bg-light text-end text-nowrap">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((detalle) => (
                    <tr key={detalle.id}>
                      <td style={{ minWidth: '6rem', overflowWrap: 'break-word' }}>{nombreProducto(detalle.productoId)}</td>
                      <td className="text-end text-nowrap">{detalle.cantidad}</td>
                      <td className="text-end text-nowrap">{formatoPesos(detalle.precioUnitario)}</td>
                      <td className="text-end text-nowrap fw-semibold">
                        {formatoPesos(detalle.cantidad * detalle.precioUnitario)}
                      </td>
                    </tr>
                  ))}
                  {detalles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-3 text-muted">Este pedido no tiene productos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="fw-semibold">Total del pedido</span>
              <span className="fs-4 fw-bold" style={{ color: '#16498C' }}>{formatoPesos(pedido.total)}</span>
            </div>
          </div>

          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn w-100 rounded-3 py-2 fw-semibold"
              style={{ backgroundColor: '#F2845C', color: '#14213D' }}
              onClick={onCerrar}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePedidoModal;
