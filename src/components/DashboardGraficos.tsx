import { useMemo } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import type { Pedido } from '../services/pedido.service';
import type { Producto } from '../services/producto.service';

interface Props {
    pedidos: Pedido[];
    productos: Producto[];
}

interface VentaPorMes {
    mes: string;
    ingresos: number;
}

interface ProductoVendido {
    producto: string;
    unidades: number;
}

interface VentaPorCategoria {
    categoria: string;
    ingresos: number;
}

const COLORES = ['#16498C', '#27A6A1', '#F3A712', '#8B5CF6', '#E56B6F', '#64748B'];

const formatoMoneda = (valor: number) =>
    new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    }).format(valor);

const obtenerClaveMes = (fecha: string): string | null => {
    // fechaCreacion normalmente llega como ISO: YYYY-MM-DDTHH:mm:ss.
    const coincidencia = /^(\d{4})-(\d{2})/.exec(fecha);
    if (!coincidencia) return null;

    const anio = Number(coincidencia[1]);
    const mes = Number(coincidencia[2]);
    if (mes < 1 || mes > 12) return null;

    return `${anio}-${String(mes).padStart(2, '0')}`;
};

const etiquetaMes = (clave: string) => {
    const [anio, mes] = clave.split('-').map(Number);
    return new Intl.DateTimeFormat('es-CL', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
    }).format(new Date(Date.UTC(anio, mes - 1, 1)));
};

const DashboardGraficos = ({ pedidos, productos }: Props) => {
    const ventasPorMes = useMemo<VentaPorMes[]>(() => {
        const totales = new Map<string, number>();

        pedidos.forEach((pedido) => {
            const claveMes = obtenerClaveMes(pedido.fechaCreacion);
            if (!claveMes) return;
            totales.set(claveMes, (totales.get(claveMes) ?? 0) + Number(pedido.total || 0));
        });

        return Array.from(totales.entries())
            .sort(([mesA], [mesB]) => mesA.localeCompare(mesB))
            .map(([mes, ingresos]) => ({ mes: etiquetaMes(mes), ingresos }));
    }, [pedidos]);

    const productosMasVendidos = useMemo<ProductoVendido[]>(() => {
        const unidadesPorProducto = new Map<number, number>();

        pedidos.forEach((pedido) => {
            (pedido.detalles ?? []).forEach((detalle) => {
                const cantidad = Number(detalle.cantidad || 0);
                unidadesPorProducto.set(
                    detalle.productoId,
                    (unidadesPorProducto.get(detalle.productoId) ?? 0) + cantidad
                );
            });
        });

        const nombresPorId = new Map(productos.map((producto) => [producto.id, producto.nombre]));

        return Array.from(unidadesPorProducto.entries())
            .map(([productoId, unidades]) => ({
                producto: nombresPorId.get(productoId) ?? `Producto #${productoId}`,
                unidades
            }))
            .sort((a, b) => b.unidades - a.unidades)
            .slice(0, 8);
    }, [pedidos, productos]);

    const ventasPorCategoria = useMemo<VentaPorCategoria[]>(() => {
        const productosPorId = new Map(productos.map((producto) => [producto.id, producto]));
        const ingresosPorCategoria = new Map<string, number>();

        pedidos.forEach((pedido) => {
            (pedido.detalles ?? []).forEach((detalle) => {
                const producto = productosPorId.get(detalle.productoId);
                const categoria = producto?.categoria?.nombre ?? 'Sin categoría';
                const subtotal = Number(detalle.precioUnitario || 0) * Number(detalle.cantidad || 0);
                ingresosPorCategoria.set(
                    categoria,
                    (ingresosPorCategoria.get(categoria) ?? 0) + subtotal
                );
            });
        });

        return Array.from(ingresosPorCategoria.entries())
            .map(([categoria, ingresos]) => ({ categoria, ingresos }))
            .sort((a, b) => b.ingresos - a.ingresos);
    }, [pedidos, productos]);

    return (
        <div className="row g-4 mt-1">
            <div className="col-12 col-xl-6">
                <section className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 h-100">
                    <h2 className="fs-5 fw-bold text-dark mb-1">Ventas por mes</h2>
                    <p className="small text-muted mb-3">Ingresos generados según la fecha de cada pedido.</p>
                    {ventasPorMes.length === 0 ? (
                        <p className="text-muted text-center py-5 mb-0">Todavía no hay ventas para graficar.</p>
                    ) : (
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <BarChart data={ventasPorMes} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="mes" />
                                    <YAxis tickFormatter={(valor: number) => `$${Number(valor).toLocaleString('es-CL')}`} />
                                    <Tooltip formatter={(valor) => formatoMoneda(Number(valor))} />
                                    <Bar dataKey="ingresos" name="Ingresos" fill="#16498C" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </section>
            </div>

            <div className="col-12 col-xl-6">
                <section className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 h-100">
                    <h2 className="fs-5 fw-bold text-dark mb-1">Ventas por categoría</h2>
                    <p className="small text-muted mb-3">Distribución de ingresos según la categoría de los juguetes.</p>
                    {ventasPorCategoria.length === 0 ? (
                        <p className="text-muted text-center py-5 mb-0">Todavía no hay categorías con ventas.</p>
                    ) : (
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={ventasPorCategoria}
                                        dataKey="ingresos"
                                        nameKey="categoria"
                                        cx="50%"
                                        cy="45%"
                                        outerRadius={105}
                                        paddingAngle={2}
                                        label={({ payload, percent }) => {
                                            const nombre = (payload as VentaPorCategoria | undefined)?.categoria ?? '';
                                            return `${nombre} (${((percent ?? 0) * 100).toFixed(0)}%)`;
                                        }}
                                    >
                                        {ventasPorCategoria.map((entrada, indice) => (
                                            <Cell key={entrada.categoria} fill={COLORES[indice % COLORES.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(valor) => formatoMoneda(Number(valor))} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </section>
            </div>

            <div className="col-12">
                <section className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4">
                    <h2 className="fs-5 fw-bold text-dark mb-1">Productos más vendidos</h2>
                    <p className="small text-muted mb-3">Top 8 de juguetes según las unidades incluidas en los pedidos.</p>
                    {productosMasVendidos.length === 0 ? (
                        <p className="text-muted text-center py-5 mb-0">Todavía no hay productos vendidos para graficar.</p>
                    ) : (
                        <div style={{ width: '100%', height: 360 }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={productosMasVendidos}
                                    layout="vertical"
                                    margin={{ top: 8, right: 24, left: 12, bottom: 8 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="producto" width={150} />
                                    <Tooltip formatter={(valor) => [`${Number(valor)} unidades`, 'Unidades vendidas']} />
                                    <Bar dataKey="unidades" name="Unidades vendidas" fill="#27A6A1" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default DashboardGraficos;
