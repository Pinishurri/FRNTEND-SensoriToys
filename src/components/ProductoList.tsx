import type { Producto } from '../services/producto.service';
import ProductoCard from './ProductoCard';

interface ProductoListProps {
  productos: Producto[];
}

const ProductoList = ({ productos }: ProductoListProps) => (
  <div className="grilla-productos">
    {productos.map((producto) => (
      <ProductoCard key={producto.id} producto={producto} />
    ))}
  </div>
);

export default ProductoList;
