import { Route, Routes } from 'react-router';
import Navbar from './components/Navbar';
import RutaAdmin from './components/RutaAdmin';
import RutaPrivada from './components/RutaPrivada';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import ProductoDetalle from './pages/ProductoDetalle';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfil from './pages/Perfil';
import Pedidos from './pages/Pedidos';
import Reclamos from './pages/Reclamos';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <CartProvider>
      <a href="#contenido" className="saltar-contenido">Saltar al contenido</a>
      <Navbar />
      <main id="contenido">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<RutaPrivada><Checkout /></RutaPrivada>} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/perfil" element={<RutaPrivada><Perfil /></RutaPrivada>} />
          <Route path="/pedidos" element={<RutaPrivada><Pedidos /></RutaPrivada>} />
          <Route path="/reclamos" element={<RutaPrivada><Reclamos /></RutaPrivada>} />
          <Route path="/admin" element={<RutaAdmin><Admin /></RutaAdmin>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="pie">SensoriToys · Juguetes sensoriales para el desarrollo y la calma</footer>
    </CartProvider>
  );
};

export default App;
