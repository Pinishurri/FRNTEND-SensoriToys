import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import useProductos from '../hooks/useProductos';
import FiltroChips from '../components/FiltroChips';
import ProductoList from '../components/ProductoList';

const Home = () => {
  const { productos, loading, error, recargar } = useProductos();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoria, setCategoria] = useState('');
  const [edad, setEdad] = useState('');

  const busqueda = (searchParams.get('q') ?? '').trim().toLowerCase();

  const categorias = useMemo(
    () => [...new Set(productos.flatMap((p) => (p.categoria ? [p.categoria.nombre] : [])))],
    [productos]
  );
  const edades = useMemo(
    () => [...new Set(productos.flatMap((p) => (p.edad ? [p.edad] : [])))],
    [productos]
  );

  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria = !categoria || p.categoria?.nombre === categoria;
    const coincideEdad = !edad || p.edad === edad;
    const coincideBusqueda =
      !busqueda || `${p.nombre} ${p.descripcion ?? ''}`.toLowerCase().includes(busqueda);
    return coincideCategoria && coincideEdad && coincideBusqueda;
  });

  const hayFiltros = Boolean(categoria || edad || busqueda);

  const limpiarFiltros = () => {
    setCategoria('');
    setEdad('');
    setSearchParams({});
  };

  return (
    <div className="contenedor">
      <section className="portada" aria-labelledby="titulo-portada">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-8">
            <h1 id="titulo-portada">Juguetes para sentir, calmar y aprender</h1>
            <p>Estimulación táctil, visual y auditiva pensada para el desarrollo y la autorregulación emocional.</p>
            <a href="#catalogo" className="boton boton-naranja">Ver catálogo</a>
          </div>
          <div className="col-lg-4 d-none d-lg-block">
            <div className="portada-decoracion" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section id="catalogo" aria-labelledby="titulo-catalogo" className="seccion-catalogo">
        <h2 id="titulo-catalogo">Catálogo</h2>

        {productos.length > 0 && (
          <div className="row g-3 filtros">
            <div className="col-12 col-md-6">
              <FiltroChips
                etiqueta="Categoría"
                textoTodos="Todas"
                opciones={categorias}
                valor={categoria}
                onChange={setCategoria}
              />
            </div>
            <div className="col-12 col-md-6">
              <FiltroChips
                etiqueta="Edad recomendada"
                textoTodos="Todas las edades"
                opciones={edades}
                valor={edad}
                onChange={setEdad}
              />
            </div>
          </div>
        )}

        {loading && <p role="status" className="texto-suave">Cargando productos…</p>}

        {error && (
          <div role="alert" className="mensaje mensaje-error">
            <p>No se pudo cargar el catálogo. Revisa tu conexión e inténtalo de nuevo.</p>
            <button type="button" className="boton boton-borde" onClick={() => void recargar()}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <p role="status" className="texto-suave resumen-resultados">
              Mostrando {productosFiltrados.length} de {productos.length} productos
              {hayFiltros && (
                <>
                  {' · '}
                  <button type="button" className="enlace-boton" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </button>
                </>
              )}
            </p>

            {productosFiltrados.length > 0 ? (
              <ProductoList productos={productosFiltrados} />
            ) : (
              <p className="texto-suave">No se encontraron productos con los filtros seleccionados.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
