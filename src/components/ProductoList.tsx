import type { Producto } from '../services/producto.service';
import ProductoCard from './ProductoCard';

interface ProductoListProps {
  productos: Producto[];
}

const ProductoList = ({ productos }: ProductoListProps) => (
  <div className="row g-4">
    {productos.map((producto) => (
      <div key={producto.id} className="col-12 col-sm-6 col-lg-4">
        <ProductoCard producto={producto} />
      </div>
    ))}
  </div>
);

export default ProductoList;