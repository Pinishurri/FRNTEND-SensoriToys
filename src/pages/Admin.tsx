import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { obtenerMensajeError } from '../services/api.client';
import CategoriaService from '../services/categoria.service';
import PedidoService, { type Pedido } from '../services/pedido.service';
import ProductoService, {
    type Categoria,
    type Producto,
    type ProductoPayload
} from '../services/producto.service';
import UsuarioService, { type Usuario } from '../services/usuario.service';

type Pestania = 'dashboard' | 'productos' | 'pedidos' | 'usuarios';

interface FormularioProducto {
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    categoriaId: string;
    edad: string;
    imagenUrl: string;
}

interface FormularioUsuario {
    nombre: string;
    apellido: string;
    email: string;
    activo: boolean;
}

const STOCK_BAJO = 5;

const formularioProductoVacio: FormularioProducto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoriaId: '',
    edad: '',
    imagenUrl: ''
};

const aPayload = (producto: Producto, activo: boolean): ProductoPayload => ({
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    stock: producto.stock,
    categoria: producto.categoria,
    edad: producto.edad,
    imagenUrl: producto.imagenUrl,
    activo
});

const Admin = () => {
    const [pestania, setPestania] = useState<Pestania>('dashboard');

    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [pedidos, setPedidos] = useState<Pedido[]>([]);

    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState<string | null>(null);
    const [errorAccion, setErrorAccion] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);

    const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
    const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
    const [formularioProducto, setFormularioProducto] = useState<FormularioProducto>(formularioProductoVacio);
    const [productoADesactivar, setProductoADesactivar] = useState<Producto | null>(null);

    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
    const [formularioUsuario, setFormularioUsuario] = useState<FormularioUsuario>({
        nombre: '',
        apellido: '',
        email: '',
        activo: true
    });

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        setErrorCarga(null);
        try {
            const [listaProductos, listaCategorias, listaUsuarios, listaPedidos] = await Promise.all([
                ProductoService.listarTodos(),
                CategoriaService.listar(),
                UsuarioService.listar(),
                PedidoService.listar()
            ]);
            setProductos(listaProductos);
            setCategorias(listaCategorias);
            setUsuarios(listaUsuarios);
            setPedidos(listaPedidos);
        } catch (error) {
            setErrorCarga(obtenerMensajeError(error, 'No se pudieron cargar los datos del panel.'));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        void cargarDatos();
    }, [cargarDatos]);

    const nombreCompleto = (usuario: Usuario) =>
        [usuario.nombre, usuario.apellido].filter(Boolean).join(' ');

    const nombreCliente = (usuarioId: number) => {
        const usuario = usuarios.find((u) => u.id === usuarioId);
        return usuario ? nombreCompleto(usuario) : `Usuario #${usuarioId}`;
    };

    const nombreProducto = (productoId: number) =>
        productos.find((p) => p.id === productoId)?.nombre ?? `Producto #${productoId}`;

    const ventasTotales = pedidos.reduce((suma, pedido) => suma + pedido.total, 0);
    const productosStockBajo = productos.filter((p) => p.activo !== false && p.stock <= STOCK_BAJO).length;

    const abrirCrearProducto = () => {
        setProductoEditando(null);
        setFormularioProducto(formularioProductoVacio);
        setErrorAccion(null);
        setMostrarModalProducto(true);
    };

    const abrirEditarProducto = (producto: Producto) => {
        setProductoEditando(producto);
        setFormularioProducto({
            nombre: producto.nombre,
            descripcion: producto.descripcion ?? '',
            precio: producto.precio,
            stock: producto.stock,
            categoriaId: producto.categoria ? String(producto.categoria.id) : '',
            edad: producto.edad ?? '',
            imagenUrl: producto.imagenUrl ?? ''
        });
        setErrorAccion(null);
        setMostrarModalProducto(true);
    };

    const cerrarModalProducto = () => {
        setMostrarModalProducto(false);
        setErrorAccion(null);
    };

    const refrescarProductos = async () => {
        setProductos(await ProductoService.listarTodos());
    };

    const handleGuardarProducto = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setGuardando(true);
        setErrorAccion(null);

        const categoria = categorias.find((c) => String(c.id) === formularioProducto.categoriaId) ?? null;
        const payload: ProductoPayload = {
            nombre: formularioProducto.nombre.trim(),
            descripcion: formularioProducto.descripcion.trim(),
            precio: formularioProducto.precio,
            stock: formularioProducto.stock,
            categoria,
            edad: formularioProducto.edad.trim() || undefined,
            imagenUrl: formularioProducto.imagenUrl.trim() || undefined,
            activo: productoEditando?.activo ?? true
        };

        try {
            if (productoEditando) {
                await ProductoService.actualizar(productoEditando.id, payload);
            } else {
                await ProductoService.crear(payload);
            }
            await refrescarProductos();
            setMostrarModalProducto(false);
        } catch (error) {
            setErrorAccion(obtenerMensajeError(error, 'No se pudo guardar el producto.'));
        } finally {
            setGuardando(false);
        }
    };

    const handleActivarProducto = async (producto: Producto) => {
        setGuardando(true);
        setErrorAccion(null);
        try {
            await ProductoService.actualizar(producto.id, aPayload(producto, true));
            await refrescarProductos();
            setMostrarModalProducto(false);
        } catch (error) {
            setErrorAccion(obtenerMensajeError(error, 'No se pudo activar el producto.'));
        } finally {
            setGuardando(false);
        }
    };

    const handleConfirmarDesactivacion = async () => {
        if (!productoADesactivar) return;
        setGuardando(true);
        setErrorAccion(null);
        try {
            await ProductoService.eliminar(productoADesactivar.id);
            await refrescarProductos();
            setProductoADesactivar(null);
            setMostrarModalProducto(false);
        } catch (error) {
            setErrorAccion(obtenerMensajeError(error, 'No se pudo desactivar el producto.'));
        } finally {
            setGuardando(false);
        }
    };

    const abrirEditarUsuario = (usuario: Usuario) => {
        setUsuarioEditando(usuario);
        setFormularioUsuario({
            nombre: usuario.nombre,
            apellido: usuario.apellido ?? '',
            email: usuario.email,
            activo: usuario.estado === 'ACTIVO'
        });
        setErrorAccion(null);
    };

    const cerrarModalUsuario = () => {
        setUsuarioEditando(null);
        setErrorAccion(null);
    };

    const handleGuardarUsuario = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!usuarioEditando) return;

        setGuardando(true);
        setErrorAccion(null);
        try {
            await UsuarioService.actualizar(usuarioEditando.id, {
                nombre: formularioUsuario.nombre.trim(),
                apellido: formularioUsuario.apellido.trim(),
                email: formularioUsuario.email.trim(),
                direccionEnvio: usuarioEditando.direccionEnvio,
                referenciaPago: usuarioEditando.referenciaPago
            });

            if (usuarioEditando.rol !== 'ADMIN') {
                const estabaActivo = usuarioEditando.estado === 'ACTIVO';
                if (formularioUsuario.activo && !estabaActivo) {
                    await UsuarioService.activar(usuarioEditando.id);
                }
                if (!formularioUsuario.activo && estabaActivo) {
                    await UsuarioService.desactivar(usuarioEditando.id);
                }
            }

            setUsuarios(await UsuarioService.listar());
            setUsuarioEditando(null);
        } catch (error) {
            setErrorAccion(obtenerMensajeError(error, 'No se pudo guardar el usuario.'));
        } finally {
            setGuardando(false);
        }
    };

    const hayModalAbierto = mostrarModalProducto || productoADesactivar !== null || usuarioEditando !== null;

    const pestanias: { id: Pestania; etiqueta: string; icono: string }[] = [
        { id: 'dashboard', etiqueta: 'Dashboard', icono: 'bi-graph-up' },
        { id: 'productos', etiqueta: 'Gestión de Productos', icono: 'bi-box-seam' },
        { id: 'pedidos', etiqueta: 'Historial de Pedidos', icono: 'bi-receipt' },
        { id: 'usuarios', etiqueta: 'Gestión de Usuarios', icono: 'bi-people' }
    ];

    return (
        <div className="contenedor">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle p-3 text-white" style={{ backgroundColor: '#16498C' }}>
                        <i className="bi bi-speedometer2 fs-3" aria-hidden="true"></i>
                    </div>
                    <div>
                        <h1 className="fs-3 fw-bold mb-0" style={{ color: '#16498C' }}>Panel de Administración</h1>
                        <small className="text-muted">Ventas, inventario y usuarios de SensoriToys</small>
                    </div>
                </div>
                <Link to="/" className="btn btn-sm text-white rounded-3 px-3 py-2" style={{ backgroundColor: '#16498C' }}>
                    <i className="bi bi-shop me-1" aria-hidden="true"></i> Volver a la Tienda
                </Link>
            </div>

            <div className="d-flex gap-2 mb-4 flex-wrap" role="tablist" aria-label="Secciones del panel">
                {pestanias.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={pestania === tab.id}
                        className={`btn rounded-pill px-4 ${pestania === tab.id ? 'text-white' : 'btn-light'}`}
                        style={{ backgroundColor: pestania === tab.id ? '#16498C' : undefined }}
                        onClick={() => setPestania(tab.id)}
                    >
                        <i className={`bi ${tab.icono} me-2`} aria-hidden="true"></i>{tab.etiqueta}
                    </button>
                ))}
            </div>

            {errorAccion && !hayModalAbierto && (
                <div role="alert" className="alert alert-danger">{errorAccion}</div>
            )}

            {cargando && <p role="status" className="text-muted">Cargando datos del panel…</p>}

            {errorCarga && (
                <div role="alert" className="alert alert-danger d-flex justify-content-between align-items-center">
                    <span>{errorCarga}</span>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => void cargarDatos()}>
                        Reintentar
                    </button>
                </div>
            )}

            {!cargando && !errorCarga && pestania === 'dashboard' && (
                <div className="row g-4">
                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
                            <span className="text-muted small fw-semibold">Ventas Totales</span>
                            <p className="fs-3 fw-bold mt-2 mb-0 text-success">${ventasTotales.toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
                            <span className="text-muted small fw-semibold">Pedidos Registrados</span>
                            <p className="fs-3 fw-bold mt-2 mb-0" style={{ color: '#16498C' }}>{pedidos.length}</p>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
                            <span className="text-muted small fw-semibold">Usuarios Registrados</span>
                            <p className="fs-3 fw-bold mt-2 mb-0" style={{ color: '#16498C' }}>{usuarios.length}</p>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
                            <span className="text-muted small fw-semibold">Productos con Stock Bajo</span>
                            <p className="fs-3 fw-bold mt-2 mb-0 text-danger">{productosStockBajo}</p>
                        </div>
                    </div>
                </div>
            )}

            {!cargando && !errorCarga && pestania === 'productos' && (
                <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <h2 className="fs-5 fw-bold text-dark mb-0">Inventario Registrado</h2>
                        <button
                            type="button"
                            className="btn text-white rounded-3"
                            style={{ backgroundColor: '#16498C' }}
                            onClick={abrirCrearProducto}
                        >
                            + Nuevo Producto
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table align-middle tabla-apilable">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Nombre</th>
                                    <th scope="col">Categoría</th>
                                    <th scope="col">Edad</th>
                                    <th scope="col">Precio</th>
                                    <th scope="col">Stock</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map((p) => (
                                    <tr key={p.id}>
                                        <td data-label="ID">{p.id}</td>
                                        <td data-label="Nombre" className="fw-bold">{p.nombre}</td>
                                        <td data-label="Categoría">{p.categoria?.nombre ?? '—'}</td>
                                        <td data-label="Edad">{p.edad ?? '—'}</td>
                                        <td data-label="Precio">${p.precio.toLocaleString('es-CL')}</td>
                                        <td data-label="Stock">
                                            <span className={`badge ${p.stock <= STOCK_BAJO ? 'bg-danger' : 'bg-success'}`}>
                                                {p.stock} unidades
                                            </span>
                                        </td>
                                        <td data-label="Estado">
                                            <span className={`badge ${p.activo !== false ? 'bg-primary' : 'bg-secondary'}`}>
                                                {p.activo !== false ? 'Activo' : 'Desactivado'}
                                            </span>
                                        </td>
                                        <td data-label="Acciones">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => abrirEditarProducto(p)}
                                            >
                                                Editar<span className="visually-hidden"> {p.nombre}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {productos.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-4 text-muted">No hay productos registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!cargando && !errorCarga && pestania === 'pedidos' && (
                <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4">
                    <h2 className="fs-5 fw-bold text-dark mb-3">Historial de Ventas Registradas</h2>
                    <div className="table-responsive">
                        <table className="table align-middle tabla-apilable">
                            <thead>
                                <tr>
                                    <th scope="col">ID Pedido</th>
                                    <th scope="col">Fecha</th>
                                    <th scope="col">Cliente</th>
                                    <th scope="col">Detalle</th>
                                    <th scope="col">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...pedidos].sort((a, b) => b.id - a.id).map((pedido) => (
                                    <tr key={pedido.id}>
                                        <td data-label="ID Pedido" className="fw-bold">#{pedido.id}</td>
                                        <td data-label="Fecha">{new Date(pedido.fechaCreacion).toLocaleDateString('es-CL')}</td>
                                        <td data-label="Cliente">{nombreCliente(pedido.usuarioId)}</td>
                                        <td data-label="Detalle">
                                            {(pedido.detalles ?? [])
                                                .map((d) => `${d.cantidad} × ${nombreProducto(d.productoId)}`)
                                                .join(', ')}
                                        </td>
                                        <td data-label="Total" className="fw-bold" style={{ color: '#16498C' }}>
                                            ${pedido.total.toLocaleString('es-CL')}
                                        </td>
                                    </tr>
                                ))}
                                {pedidos.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-muted">No se han registrado pedidos aún.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!cargando && !errorCarga && pestania === 'usuarios' && (
                <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4">
                    <h2 className="fs-5 fw-bold text-dark mb-3">Usuarios Registrados</h2>
                    <div className="table-responsive">
                        <table className="table align-middle tabla-apilable">
                            <thead>
                                <tr>
                                    <th scope="col">Usuario</th>
                                    <th scope="col">Correo</th>
                                    <th scope="col">Rol</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((u) => (
                                    <tr key={u.id}>
                                        <td data-label="Usuario" className="fw-bold">{nombreCompleto(u)}</td>
                                        <td data-label="Correo">{u.email}</td>
                                        <td data-label="Rol">
                                            <span className={`badge ${u.rol === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                                                {u.rol ?? '—'}
                                            </span>
                                        </td>
                                        <td data-label="Estado">
                                            <span className={`badge ${u.estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`}>
                                                {u.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td data-label="Acciones">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => abrirEditarUsuario(u)}
                                            >
                                                Editar<span className="visually-hidden"> {nombreCompleto(u)}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {mostrarModalProducto && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-producto">
                        <div className="modal-content border-0 rounded-4 shadow p-3">
                            <div className="modal-header border-0 pb-0">
                                <h2 id="titulo-modal-producto" className="fs-5 fw-bold modal-title" style={{ color: '#16498C' }}>
                                    {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
                                </h2>
                                <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrarModalProducto}></button>
                            </div>
                            <form onSubmit={handleGuardarProducto}>
                                <div className="modal-body">
                                    {errorAccion && <div role="alert" className="alert alert-danger">{errorAccion}</div>}

                                    <div className="mb-3">
                                        <label htmlFor="producto-nombre" className="form-label text-muted small fw-semibold">Nombre del Producto</label>
                                        <input
                                            id="producto-nombre"
                                            type="text"
                                            className="form-control rounded-3"
                                            value={formularioProducto.nombre}
                                            onChange={(e) => setFormularioProducto({ ...formularioProducto, nombre: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="producto-descripcion" className="form-label text-muted small fw-semibold">Descripción</label>
                                        <input
                                            id="producto-descripcion"
                                            type="text"
                                            className="form-control rounded-3"
                                            value={formularioProducto.descripcion}
                                            onChange={(e) => setFormularioProducto({ ...formularioProducto, descripcion: e.target.value })}
                                        />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-12 col-sm-6">
                                            <label htmlFor="producto-precio" className="form-label text-muted small fw-semibold">Precio ($)</label>
                                            <input
                                                id="producto-precio"
                                                type="number"
                                                min={1}
                                                className="form-control rounded-3"
                                                value={formularioProducto.precio}
                                                onChange={(e) => setFormularioProducto({ ...formularioProducto, precio: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <label htmlFor="producto-stock" className="form-label text-muted small fw-semibold">Stock</label>
                                            <input
                                                id="producto-stock"
                                                type="number"
                                                min={0}
                                                className="form-control rounded-3"
                                                value={formularioProducto.stock}
                                                onChange={(e) => setFormularioProducto({ ...formularioProducto, stock: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-12 col-sm-6">
                                            <label htmlFor="producto-categoria" className="form-label text-muted small fw-semibold">Categoría</label>
                                            <select
                                                id="producto-categoria"
                                                className="form-select rounded-3"
                                                value={formularioProducto.categoriaId}
                                                onChange={(e) => setFormularioProducto({ ...formularioProducto, categoriaId: e.target.value })}
                                                required
                                            >
                                                <option value="">Selecciona…</option>
                                                {categorias.map((c) => (
                                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <label htmlFor="producto-edad" className="form-label text-muted small fw-semibold">Edad recomendada</label>
                                            <input
                                                id="producto-edad"
                                                type="text"
                                                placeholder="Ej: 3-6 años"
                                                className="form-control rounded-3"
                                                value={formularioProducto.edad}
                                                onChange={(e) => setFormularioProducto({ ...formularioProducto, edad: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="producto-imagen" className="form-label text-muted small fw-semibold">URL de la imagen</label>
                                        <input
                                            id="producto-imagen"
                                            type="url"
                                            className="form-control rounded-3"
                                            value={formularioProducto.imagenUrl}
                                            onChange={(e) => setFormularioProducto({ ...formularioProducto, imagenUrl: e.target.value })}
                                        />
                                    </div>

                                    {productoEditando && (
                                        <div className="border-top pt-3 mt-3">
                                            {productoEditando.activo !== false ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => setProductoADesactivar(productoEditando)}
                                                >
                                                    Desactivar Producto
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    disabled={guardando}
                                                    onClick={() => void handleActivarProducto(productoEditando)}
                                                >
                                                    Activar Producto
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        type="submit"
                                        disabled={guardando}
                                        className="btn w-100 rounded-3 py-2 fw-semibold"
                                        style={{ backgroundColor: '#F2845C', color: '#14213D' }}
                                    >
                                        {guardando ? 'Guardando…' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {productoADesactivar && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered" role="alertdialog" aria-modal="true" aria-labelledby="titulo-confirmar">
                        <div className="modal-content border-0 rounded-4 shadow p-3 text-center">
                            <div className="modal-body">
                                <i className="bi bi-exclamation-triangle-fill text-warning display-3 mb-3" aria-hidden="true"></i>
                                <h2 id="titulo-confirmar" className="fs-5 fw-bold mb-2" style={{ color: '#16498C' }}>
                                    ¿Desactivar “{productoADesactivar.nombre}”?
                                </h2>
                                <p className="text-muted small mb-4">
                                    El producto dejará de mostrarse en el catálogo y no podrá agregarse al carrito.
                                    Podrás volver a activarlo cuando quieras.
                                </p>
                                {errorAccion && <div role="alert" className="alert alert-danger">{errorAccion}</div>}
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    <button
                                        type="button"
                                        className="btn btn-light rounded-3 px-4"
                                        onClick={() => {
                                            setProductoADesactivar(null);
                                            setErrorAccion(null);
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger rounded-3 px-4"
                                        disabled={guardando}
                                        onClick={() => void handleConfirmarDesactivacion()}
                                    >
                                        {guardando ? 'Desactivando…' : 'Desactivar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {usuarioEditando && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-usuario">
                        <div className="modal-content border-0 rounded-4 shadow p-3">
                            <div className="modal-header border-0 pb-0">
                                <h2 id="titulo-modal-usuario" className="fs-5 fw-bold modal-title" style={{ color: '#16498C' }}>Editar Usuario</h2>
                                <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrarModalUsuario}></button>
                            </div>
                            <form onSubmit={handleGuardarUsuario}>
                                <div className="modal-body">
                                    {errorAccion && <div role="alert" className="alert alert-danger">{errorAccion}</div>}

                                    <div className="row g-2 mb-3">
                                        <div className="col-12 col-sm-6">
                                            <label htmlFor="usuario-nombre" className="form-label text-muted small fw-semibold">Nombre</label>
                                            <input
                                                id="usuario-nombre"
                                                type="text"
                                                className="form-control rounded-3"
                                                value={formularioUsuario.nombre}
                                                onChange={(e) => setFormularioUsuario({ ...formularioUsuario, nombre: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <label htmlFor="usuario-apellido" className="form-label text-muted small fw-semibold">Apellido</label>
                                            <input
                                                id="usuario-apellido"
                                                type="text"
                                                className="form-control rounded-3"
                                                value={formularioUsuario.apellido}
                                                onChange={(e) => setFormularioUsuario({ ...formularioUsuario, apellido: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="usuario-email" className="form-label text-muted small fw-semibold">Correo Electrónico</label>
                                        <input
                                            id="usuario-email"
                                            type="email"
                                            className="form-control rounded-3"
                                            value={formularioUsuario.email}
                                            onChange={(e) => setFormularioUsuario({ ...formularioUsuario, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {usuarioEditando.rol === 'ADMIN' ? (
                                        <div className="alert alert-info border-0 rounded-3 text-muted small mt-4 mb-2" role="note">
                                            <i className="bi bi-shield-check me-2 text-primary" aria-hidden="true"></i>
                                            Las cuentas con rol de <strong>Administrador</strong> se mantienen siempre activas por seguridad del sistema.
                                        </div>
                                    ) : (
                                        <div className="form-check form-switch mt-4 mb-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="usuario-activo"
                                                checked={formularioUsuario.activo}
                                                onChange={(e) => setFormularioUsuario({ ...formularioUsuario, activo: e.target.checked })}
                                            />
                                            <label className="form-check-label fw-bold" htmlFor="usuario-activo" style={{ color: '#16498C' }}>
                                                {formularioUsuario.activo ? 'Cuenta de Usuario Activa' : 'Cuenta de Usuario Inactiva (Desactivada)'}
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        type="submit"
                                        disabled={guardando}
                                        className="btn w-100 rounded-3 py-2 fw-semibold"
                                        style={{ backgroundColor: '#F2845C', color: '#14213D' }}
                                    >
                                        {guardando ? 'Guardando…' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
