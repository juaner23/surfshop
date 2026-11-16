export const TEXTO_UNIDAD = {
  hora: 'hora',
  clase: 'clase',
  grupo: 'grupo',
  dia: 'día',
  unidad: 'unidad',
};

// useGrouping "always" para que 4500 se vea "4.500"
const formatoPrecio = new Intl.NumberFormat('es-AR', { useGrouping: 'always' });

export const formatearPrecio = (precio) => `$ ${formatoPrecio.format(precio)}`;