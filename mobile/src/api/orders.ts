import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import type { Order, Paginated } from '../types';

export const useMyOrders = () => {
  const isAuth = useAuth((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['orders'],
    enabled: isAuth,
    queryFn: () => api.get('/orders/my', { params: { limit: 20 } }).then((r) => r.data as Paginated<Order>),
  });
};

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ['order', id],
    enabled: !!id,
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data.data as Order),
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { addressId: string; paymentMethod: string; couponCode?: string }) =>
      api.post('/orders', p).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; reason?: string }) =>
      api.patch(`/orders/${p.id}/cancel`, { reason: p.reason }),
    onSuccess: (_d, p) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order', p.id] });
    },
  });
};
