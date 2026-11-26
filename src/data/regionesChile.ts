export interface Region {
  nombre: string;
  ciudades: string[];
}

export const REGIONES_CHILE: Region[] = [
  {
    nombre: 'Arica y Parinacota',
    ciudades: ['Arica', 'Putre']
  },
  {
    nombre: 'Tarapacá',
    ciudades: ['Iquique', 'Alto Hospicio', 'Pozo Almonte']
  },
  {
    nombre: 'Antofagasta',
    ciudades: ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'San Pedro de Atacama']
  },
  {
    nombre: 'Atacama',
    ciudades: ['Copiapó', 'Vallenar', 'Caldera', 'Chañaral']
  },
  {
    nombre: 'Coquimbo',
    ciudades: ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña']
  },
  {
    nombre: 'Valparaíso',
    ciudades: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'San Antonio', 'Quillota', 'Los Andes', 'San Felipe', 'La Calera', 'Limache']
  },
  {
    nombre: 'Metropolitana de Santiago',
    ciudades: ['Santiago', 'Puente Alto', 'Maipú', 'San Bernardo', 'Melipilla', 'Talagante', 'Colina', 'Buin', 'Peñaflor']
  },
  {
    nombre: "Libertador General Bernardo O'Higgins",
    ciudades: ['Rancagua', 'San Fernando', 'Rengo', 'Machalí', 'Santa Cruz', 'San Vicente', 'Pichilemu']
  },
  {
    nombre: 'Maule',
    ciudades: ['Talca', 'Curicó', 'Linares', 'Constitución', 'Cauquenes', 'Parral']
  },
  {
    nombre: 'Ñuble',
    ciudades: ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes', 'Quirihue']
  },
  {
    nombre: 'Biobío',
    ciudades: ['Concepción', 'Talcahuano', 'Los Ángeles', 'Coronel', 'Chiguayante', 'San Pedro de la Paz', 'Lota', 'Hualpén', 'Penco', 'Tomé', 'Lebu']
  },
  {
    nombre: 'La Araucanía',
    ciudades: ['Temuco', 'Padre Las Casas', 'Villarrica', 'Angol', 'Pucón', 'Victoria', 'Lautaro']
  },
  {
    nombre: 'Los Ríos',
    ciudades: ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli']
  },
  {
    nombre: 'Los Lagos',
    ciudades: ['Puerto Montt', 'Osorno', 'Castro', 'Puerto Varas', 'Ancud', 'Calbuco', 'Quellón']
  },
  {
    nombre: 'Aysén del General Carlos Ibáñez del Campo',
    ciudades: ['Coyhaique', 'Puerto Aysén', 'Chile Chico']
  },
  {
    nombre: 'Magallanes y de la Antártica Chilena',
    ciudades: ['Punta Arenas', 'Puerto Natales', 'Porvenir']
  },
];

export const ciudadesDeRegion = (nombreRegion: string): string[] =>
  REGIONES_CHILE.find((region) => region.nombre === nombreRegion)?.ciudades ?? [];
