import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { obtenerMensajeError } from '../services/api.client';
import PedidoService from '../services/pedido.service';
import SesionService from '../services/sesion.service';

interface OrderSuccessData {
    id: string;
    cliente: string;
    direccion: string;
}

const COMUNAS_CHILE = [
    'Concepción',
    'Hualpén',
    'Talcahuano',
    'San Pedro de la Paz',
    'Chiguayante',
    'Providencia',
    'Santiago Centro',
    'Las Condes',
    'Viña del Mar',
    'Valparaíso'
];

const CIUDADES_CHILE = [
    'Concepción',
    'Santiago',
    'Valparaíso',
    'Antofagasta',
    'La Serena',
    'Temuco',
    'Puerto Montt'
];

const Checkout = () => {
    const { cart, clearCart, total } = useCart() as any;
    const navigate = useNavigate();

    const cartList = cart || [];
    const calculatedTotal = cartList.reduce((acc: number, item: any) => acc + ((item.precio || item.price || 0) * item.cantidad), 0);
    const finalTotal = total || calculatedTotal;
    const totalItemsCount = cartList.reduce((acc: number, item: any) => acc + item.cantidad, 0);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        calle: '',
        numero: '',
        comuna: '',
        ciudad: '',
        deptoOficina: '',
        infoAdicional: '',
        tarjeta: ''
    });

    const [completedOrder, setCompletedOrder] = useState<OrderSuccessData | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [errorPedido, setErrorPedido] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const sesion = SesionService.obtener();
        if (!sesion) return;

        const direccionEnvioCompleta = `${formData.calle} #${formData.numero}${formData.deptoOficina ? ', Depto/Of: ' + formData.deptoOficina : ''}, ${formData.comuna}, ${formData.ciudad}`;

        setEnviando(true);
        setErrorPedido(null);
        try {
            const pedido = await PedidoService.crear({
                usuarioId: sesion.id,
                detalles: cartList.map((item: any) => ({
                    productoId: item.id,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio
                }))
            });

            setCompletedOrder({
                id: String(pedido.id),
                cliente: formData.nombre,
                direccion: direccionEnvioCompleta
            });
        } catch (error) {
            setErrorPedido(obtenerMensajeError(error, 'No se pudo registrar el pedido. Inténtalo nuevamente.'));
        } finally {
            setEnviando(false);
        }
    };

    const handleAcceptModal = () => {
        setCompletedOrder(null);
        if (clearCart) clearCart();
        navigate('/');
    };

    return (
        <div className="contenedor">
            <div className="row g-4">

                {/* COLUMNA IZQUIERDA: Formulario */}
                <div className="col-12 col-lg-8">
                    <form onSubmit={handleSubmit}>
                        {/* 1. Datos del Cliente */}
                        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
                            <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#16498C' }}>
                                <i className="bi bi-person me-2"></i> Datos del Cliente
                            </h5>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label text-muted small fw-semibold">Nombre*</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3"
                                        placeholder="Ej: Ignacio"
                                        required
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label text-muted small fw-semibold">Apellido*</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3"
                                        placeholder="Ej: Valenzuela"
                                        required
                                        value={formData.apellido}
                                        onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Despacho a Domicilio */}
                        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
                            <div className="d-flex align-items-center mb-3">
                                <input type="radio" checked readOnly className="form-check-input me-2" style={{ width: '20px', height: '20px' }} />
                                <div>
                                    <h6 className="fw-bold mb-0 text-dark">Despacho a Domicilio</h6>
                                    <small className="text-muted">Ingresa la dirección donde quieras recibir tu pedido</small>
                                </div>
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-12 col-md-8">
                                    <label className="form-label text-muted small fw-semibold">Calle*</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3"
                                        placeholder="Ej: Manuel Montt"
                                        required
                                        value={formData.calle}
                                        onChange={e => setFormData({ ...formData, calle: e.target.value })}
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label text-muted small fw-semibold">Número*</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3"
                                        placeholder="Ej: 123"
                                        required
                                        value={formData.numero}
                                        onChange={e => setFormData({ ...formData, numero: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* MENÚS DESPLEGABLES DE COMUNA Y CIUDAD */}
                            <div className="row g-3 mb-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label text-muted small fw-semibold">Comuna*</label>
                                    <select
                                        className="form-select rounded-3"
                                        required
                                        value={formData.comuna}
                                        onChange={e => setFormData({ ...formData, comuna: e.target.value })}
                                    >
                                        <option value="">Seleccionar comuna</option>
                                        {COMUNAS_CHILE.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label text-muted small fw-semibold">Ciudad*</label>
                                    <select
                                        className="form-select rounded-3"
                                        required
                                        value={formData.ciudad}
                                        onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                                    >
                                        <option value="">Seleccionar ciudad</option>
                                        {CIUDADES_CHILE.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label text-muted small fw-semibold">Depto / Oficina / Nº Casa</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3"
                                        placeholder="Ej: Oficina 456"
                                        value={formData.deptoOficina}
                                        onChange={e => setFormData({ ...formData, deptoOficina: e.target.value })}
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label text-muted small fw-semibold">Información adicional</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3"
                                        placeholder="Ej: Dejar en el casillero"
                                        value={formData.infoAdicional}
                                        onChange={e => setFormData({ ...formData, infoAdicional: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Método de Pago */}
                        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
                            <h5 className="fw-bold mb-3" style={{ color: '#16498C' }}>3. Método de Pago</h5>
                            <div>
                                <label className="form-label text-muted small fw-semibold">Número de Tarjeta (Simulado)*</label>
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    placeholder="XXXX XXXX XXXX XXXX"
                                    required
                                    maxLength={16}
                                    value={formData.tarjeta}
                                    onChange={e => setFormData({ ...formData, tarjeta: e.target.value })}
                                />
                            </div>
                        </div>

                        {errorPedido && (
                            <div role="alert" className="alert alert-danger">{errorPedido}</div>
                        )}

                        <button type="submit" disabled={enviando} className="btn text-white w-100 rounded-3 py-3 fw-bold fs-5 shadow-sm" style={{ backgroundColor: '#198754' }}>
                            {enviando ? 'Procesando pedido…' : 'Confirmar y Pagar'}
                        </button>
                    </form>
                </div>

                {/* COLUMNA DERECHA: Resumen Tu Carro */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm p-4 rounded-4 bg-white sticky-lg-top" style={{ top: '20px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                            <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ color: '#16498C' }}>
                                <i className="bi bi-cart3 me-2"></i> Tu carro ({totalItemsCount} Producto{totalItemsCount !== 1 ? 's' : ''})
                            </h5>
                            <Link to="/carrito" className="btn btn-sm btn-link text-decoration-none text-muted">
                                <i className="bi bi-pencil me-1"></i>Editar
                            </Link>
                        </div>

                        <div className="cart-items-preview mb-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            {cartList.map((item: any) => {
                                const unitPrice = item.precio || item.price || 0;
                                return (
                                    <div key={item.id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                        <div className="d-flex align-items-center me-2">
                                            <img
                                                src={item.imagenUrl || item.img || 'https://via.placeholder.com/50'}
                                                alt={item.nombre || item.name}
                                                className="rounded-2 me-2"
                                                style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                            />
                                            <div>
                                                <h6 className="mb-0 small fw-bold text-dark">{item.nombre || item.name}</h6>
                                                <small className="text-muted">{item.cantidad} Unid.</small>
                                            </div>
                                        </div>
                                        <span className="fw-bold small" style={{ color: '#5F94D9' }}>
                                            ${(unitPrice * item.cantidad).toLocaleString('es-CL')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-top pt-3">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">Subtotal</span>
                                <span className="fw-semibold small">${finalTotal.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted small">Costo de Envío</span>
                                <span className="text-success small fw-bold">GRATIS</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                                <span className="fw-bold text-dark fs-5">Total Pago</span>
                                <span className="fw-bold fs-4" style={{ color: '#16498C' }}>
                                    ${finalTotal.toLocaleString('es-CL')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* MODAL PERSONALIZADO DE CONFIRMACIÓN */}
            {completedOrder && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow p-4 text-center">
                            <div className="modal-body py-3">
                                <i className="bi bi-check-circle-fill display-2 mb-3" style={{ color: '#5F94D9' }}></i>
                                <h4 className="fw-bold mb-3" style={{ color: '#16498C' }}>¡Compra Realizada con Éxito!</h4>
                                <p className="text-muted mb-4 px-2 fs-6">
                                    ¡Gracias por tu compra, <strong>{completedOrder.cliente}</strong>! Tu pedido <strong>#{completedOrder.id}</strong> está en camino a {completedOrder.direccion}.
                                </p>
                                <button
                                    type="button"
                                    className="btn text-white rounded-3 px-5 py-2 fw-bold"
                                    style={{ backgroundColor: '#16498C' }}
                                    onClick={handleAcceptModal}
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
