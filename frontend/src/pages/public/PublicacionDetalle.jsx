import { useParams } from 'react-router-dom';
import PaginaPendiente from '../../components/PaginaPendiente.jsx';

export default function PublicacionDetalle() {
  const { id } = useParams();
  return <PaginaPendiente titulo={`Detalle de la publicación ${id}`} etapa={3} />;
}
