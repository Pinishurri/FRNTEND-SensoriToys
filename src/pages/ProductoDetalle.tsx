import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useCart } from '../context/CartContext';
import ProductoService, { type Producto } from '../services/producto.service';

const ProductoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    const cargarProducto = async () => {
      const numericId = Number(id);
      if (!id || Number.isNaN(numericId)) {
        setError('Identificador de producto inválido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await ProductoService.obtener(numericId);
        setProducto(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el producto.');
      } finally {
        setLoading(false);
      }
    };

    void cargarProducto();
  }, [id]);

  useEffect(() => {
    if (!agregado) return;
    const temporizador = window.setTimeout(() => setAgregado(false), 1500);
    return () => window.clearTimeout(temporizador);
  }, [agregado]);

  const handleAgregar = () => {
    if (!producto) return;
    addToCart(producto);
    setAgregado(true);
  };

  if (loading) {
    return (
      <div className="contenedor">
        <p role="status" className="texto-suave">Cargando producto…</p>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="contenedor">
        <div role="alert" className="mensaje mensaje-error">
          <p>{error ?? 'Producto no encontrado.'}</p>
          <Link to="/" className="boton boton-borde">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  const agotado = producto.stock <= 0;

  return (
    <div className="contenedor">
      <Link to="/" className="enlace-volver">← Volver al catálogo</Link>

      <article className="detalle">
        <div className="row g-0">
          <div className="col-12 col-md-6">
            <div className="detalle-imagen">
              {producto.imagenUrl ? (
                <img src={producto.imagenUrl} alt={producto.nombre} />
              ) : (
                <span className="sin-imagen">Sin imagen</span>
              )}
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="detalle-info">
              <span className="tarjeta-meta">
                {[producto.categoria?.nombre, producto.edad].filter(Boolean).join(' · ')}
              </span>
              <h1>{producto.nombre}</h1>
              <p className="precio precio-grande">${producto.precio.toLocaleString('es-CL')}</p>
              {producto.descripcion && <p>{producto.descripcion}</p>}

              <p className={agotado ? 'etiqueta etiqueta-agotado' : 'texto-suave'}>
                {agotado ? 'Agotado' : `Disponible: ${producto.stock} unidades`}
              </p>

              <button type="button" className="boton boton-naranja" disabled={agotado} onClick={handleAgregar}>
                {agotado ? 'Agotado' : agregado ? 'Agregado al carrito' : 'Agregar al carrito'}
              </button>
              <span className="solo-lectores" role="status">
                {agregado ? `${producto.nombre} agregado al carrito` : ''}
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ProductoDetalle;
