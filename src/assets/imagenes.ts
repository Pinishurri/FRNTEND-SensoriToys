const imagenes = import.meta.glob<string>('./images/*.{jpg,jpeg,png,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default'
});

const imagenesPorNombre = new Map<string, string>(
  Object.entries(imagenes).map(([ruta, url]) => [ruta.split('/').pop() ?? ruta, url])
);

export const resolverImagen = (imagenUrl?: string | null): string | undefined => {
  if (!imagenUrl) return undefined;
  if (/^(https?:|data:|blob:)/i.test(imagenUrl)) return imagenUrl;
  const nombre = imagenUrl.split('/').pop() ?? imagenUrl;
  return imagenesPorNombre.get(nombre) ?? imagenUrl;
};
