import { useState } from 'react';
import { Link } from 'react-router';
import { useCart } from '../context/CartContext';

const Carrito = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const [confirmandoVaciado, setConfirmandoVaciado] = useState(false);

  const totalProductos = cart.reduce((suma, item) => suma + item.cantidad, 0);

  if (cart.length === 0) {
    return (
      <div className="contenedor">
        <section className="tarjeta vacio">
          <h1>Tu carrito está vacío</h1>
          <p className="texto-suave">Agrega juguetes desde el catálogo para armar tu pedido.</p>
          <Link to="/" className="boton boton-primario">Volver al catálogo</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="contenedor">
      <h1 className="titulo-pagina">Tu carrito de compras</h1>

      <div className="carrito-layout">
        <ul className="lista-carrito">
          {cart.map((item) => (
            <li key={item.id} className="item-carrito">
              <div className="item-imagen">
                {item.imagenUrl ? <img src={item.imagenUrl} alt="" /> : <span className="sin-imagen">Sin imagen</span>}
              </div>

              <div className="item-info">
                <Link to={`/producto/${item.id}`} className="item-nombre">{item.nombre}</Link>
                <span className="texto-suave">${item.precio.toLocaleString('es-CL')} c/u</span>
              </div>

              <div className="cantidad" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                <button
                  type="button"
                  aria-label="Disminuir cantidad"
                  disabled={item.cantidad <= 1}
                  onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                >
                  −
                </button>
                <output aria-live="polite">{item.cantidad}</output>
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  disabled={item.cantidad >= item.stock}
                  onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                >
                  +
                </button>
              </div>

              <div className="item-subtotal">
                <strong>${(item.precio * item.cantidad).toLocaleString('es-CL')}</strong>
                <button type="button" className="enlace-boton" onClick={() => removeFromCart(item.id)}>
                  Eliminar<span className="solo-lectores"> {item.nombre} del carrito</span>
                </button>
              </div>

              {item.cantidad >= item.stock && (
                <small className="item-aviso">Alcanzaste el stock disponible de este producto.</small>
              )}
            </li>
          ))}
        </ul>

        <aside className="tarjeta resumen" aria-labelledby="titulo-resumen">
          <h2 id="titulo-resumen">Resumen del pedido</h2>
          <dl>
            <div>
              <dt>Productos ({totalProductos})</dt>
              <dd>${total.toLocaleString('es-CL')}</dd>
            </div>
            <div>
              <dt>Despacho</dt>
              <dd className="texto-suave">Se calcula con tu dirección</dd>
            </div>
            <div className="resumen-total">
              <dt>Total</dt>
              <dd>${total.toLocaleString('es-CL')}</dd>
            </div>
          </dl>

          <Link to="/checkout" className="boton boton-primario">Proceder al checkout</Link>

          {confirmandoVaciado ? (
            <div role="alert" className="confirmacion">
              <p>¿Quieres vaciar todo el carrito?</p>
              <div className="acciones-fila">
                <button type="button" className="boton boton-peligro" onClick={clearCart}>Sí, vaciar</button>
                <button type="button" className="boton boton-borde" onClick={() => setConfirmandoVaciado(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="boton boton-peligro-borde" onClick={() => setConfirmandoVaciado(true)}>
              Vaciar carrito
            </button>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Carrito;
