import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import ApartmentCard, { type PropertyCardData } from '../../components/ApartmentCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function Favorites() {
  const { user } = useAuth();
  const [items, setItems] = useState<{ id: number; property_id: number; properties: PropertyCardData }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    apiGet<typeof items>(`/api/favorites?user_id=${user.id}`)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (propertyId: number) => {
    if (!user) return;
    await apiSend('/api/favorites', 'DELETE', { user_id: user.id, property_id: propertyId });
    load();
  };

  if (loading) return <LoadingSpinner />;
  if (!items.length) {
    return (
      <EmptyState
        title="No favorites yet"
        description="Save apartments while browsing to compare them later."
        action={
          <Link to="/search" className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm">
            Explore housing
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {items.map((f) =>
        f.properties ? (
          <ApartmentCard
            key={f.id}
            property={f.properties}
            favorited
            onToggleFavorite={remove}
          />
        ) : null
      )}
    </div>
  );
}
