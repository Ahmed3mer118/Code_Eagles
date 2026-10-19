import { useState, useEffect, useCallback } from 'react';
import { platformPlansService } from '../../../shared/api/platformPlansService';
import tenantSubscriptionService from '../../../shared/api/tenantSubscriptionService';

export function usePlatformSubscription() {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, currentRes, historyRes] = await Promise.allSettled([
        platformPlansService.list(),
        tenantSubscriptionService.getCurrentSubscription(),
        tenantSubscriptionService.getSubscriptionHistory({ limit: 20 }),
      ]);

      if (plansRes.status === 'fulfilled') {
        const raw = plansRes.value;
        const list = Array.isArray(raw) ? raw : raw?.data ?? [];
        setPlans(list.filter((p) => p.status === 'active'));
      }

      if (currentRes.status === 'fulfilled') {
        setCurrentSubscription(currentRes.value);
      }

      if (historyRes.status === 'fulfilled') {
        const raw = historyRes.value;
        setHistory(Array.isArray(raw) ? raw : raw?.data ?? []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل بيانات الاشتراك');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const requestSubscription = async (planSlug, periodMonths = 1, notes = '') => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await tenantSubscriptionService.requestSubscription({
        plan: planSlug,
        periodMonths,
        notes,
      });
      await fetchAll();
      return { success: true, data: result };
    } catch (err) {
      const msg = err?.response?.data?.message || 'فشل إرسال طلب الاشتراك';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  };

  const uploadAndSubmitProof = async (subscriptionId, file) => {
    setActionLoading(true);
    setError(null);
    try {
      const uploadResult = await tenantSubscriptionService.uploadImage(file, 'payments/proofs');
      
      // التعامل مع شكل الـ Response سواء كان { url } أو { data: { url } }
      const url = uploadResult?.url || uploadResult?.data?.url || uploadResult?.data?.data?.url;
      if (!url) throw new Error('لم يتم استلام رابط الصورة من السيرفر');

      const result = await tenantSubscriptionService.submitPaymentProof(subscriptionId, url);
      await fetchAll();
      return { success: true, data: result, url };
    } catch (err) {
      const msg = err?.response?.data?.message || 'فشل رفع إثبات الدفع';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    plans,
    currentSubscription,
    history,
    loading,
    actionLoading,
    error,
    refetch: fetchAll,
    requestSubscription,
    uploadAndSubmitProof,
  };
}

export default usePlatformSubscription;
