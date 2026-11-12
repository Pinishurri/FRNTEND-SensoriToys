import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useCart } from '../context/CartContext';
import type { Producto } from '../services/producto.service';

interface ProductoCardProps {
  producto: Producto;
}

const STOCK_BAJO = 5;

const ProductoCard = ({ producto }: ProductoCardProps) => {
  const { addToCart } = useCart();
  const [agregado, setAgregado] = useState(false);

  const agotado = producto.stock <= 0;
  const stockBajo = !agotado && producto.stock <= STOCK_BAJO;

  useEffect(() => {
    if (!agregado) return;
    const temporizador = window.setTimeout(() => setAgregado(false), 1500);
    return () => window.clearTimeout(temporizador);
  }, [agregado]);

  const handleAgregar = () => {
    addToCart(producto);
    setAgregado(true);
  };

  return (
    <article className="tarjeta-producto">
      <Link to={`/producto/${producto.id}`} className="tarjeta-imagen" tabIndex={-1} aria-hidden="true">
        {producto.imagenUrl ? (
          <img src={producto.imagenUrl} alt="" loading="lazy" />
        ) : (
          <span className="sin-imagen">Sin imagen</span>
        )}
      </Link>

      <div className="tarjeta-cuerpo">
        <span className="tarjeta-meta">
          {[producto.categoria?.nombre, producto.edad].filter(Boolean).join(' · ')}
        </span>
        <h3 className="tarjeta-titulo">
          <Link to={`/producto/${producto.id}`}>{producto.nombre}</Link>
        </h3>
        {agotado && <span className="etiqueta etiqueta-agotado">Agotado</span>}
        {stockBajo && <span className="etiqueta etiqueta-stock">¡Quedan {producto.stock}!</span>}
        <p className="precio">${producto.precio.toLocaleString('es-CL')}</p>
        <button type="button" className="boton boton-naranja" disabled={agotado} onClick={handleAgregar}>
          {agotado ? 'Agotado' : agregado ? 'Agregado al carrito' : 'Agregar al carrito'}
        </button>
        <span className="solo-lectores" role="status">
          {agregado ? `${producto.nombre} agregado al carrito` : ''}
        </span>
      </div>
    </article>
  );
};

export default ProductoCard;
