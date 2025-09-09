import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../state/DataContext';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items } = useData();

  const [item, setItem] = useState(() => {
    const fromList = items.find((it) => String(it.id) === String(id));
    return fromList || null;
  });

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/items/${id}`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
      .then((res) => {
        if (res.status === 304) return null;
        if (!res.ok) throw res;
        return res.json();
      })
      .then((data) => {
        if (data) setItem(data);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        if (err?.status === 404) navigate('/');
        else console.error('ItemDetail fetch failed:', err);
      });

    return () => controller.abort();
  }, [id, navigate]);

  if (!item) return <p>Loading...</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>{item.name}</h2>
      <p><strong>Category:</strong> {item.category}</p>
      <p><strong>Price:</strong> ${item.price}</p>
    </div>
  );
}

export default ItemDetail;
