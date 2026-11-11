// src/features/teacher/hooks/usePlatformSubscription.js
import { useCallback, useEffect, useState } from 'react';
import tenantSubscriptionService from '@/shared/api/tenantSubscriptionService';
import platformApi from '@/lib/platformApi';

export function usePlatformSubscription() {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [plansRes, currentRes, historyRes] = await Promise.allSettled([
        platformApi.getPlans(),
        tenantSubscriptionService.getCurrentSubscription(),
        tenantSubscriptionService.getSubscriptionHistory({ limit: 50 }),
      ]);

      if (plansRes.status === 'fulfilled') {
        setPlans(Array.isArray(plansRes.value) ? plansRes.value : []);
      }
      if (currentRes.status === 'fulfilled') {
        setCurrentSubscription(currentRes.value);
      }
      if (historyRes.status === 'fulfilled') {
        const h = historyRes.value;
        setHistory(Array.isArray(h?.data) ? h.data : Array.isArray(h) ? h : []);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const requestSubscription = async (planSlug, periodMonths = 1) => {
    setActionLoading(true);
    setError('');
    try {
      const plan = plans.find((p) => p.slug === planSlug);
      await tenantSubscriptionService.requestSubscription({
        plan: plan?.name || planSlug,
        amount: Number(plan?.price) || 0,
        periodMonths,
      });
      await loadAll();
      return { success: true };
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Request failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  };

  // ✅✅✅ رفع إثبات الدفع — المصحح
  const uploadAndSubmitProof = async (subscriptionId, file) => {
    setActionLoading(true);
    setError('');
    try {
      // 1) رفع الصورة أولاً
      const uploadRes = await tenantSubscriptionService.uploadImage(
        file,
        'payments/proofs',
      );

      // 2) استخراج URL من الـ Response (بيدعم أكثر من شكل)
      const url =
        uploadRes?.url ||
        uploadRes?.data?.url ||
        uploadRes?.data?.data?.url;

      if (!url) throw new Error('Upload response missing URL');

      // 3) إرسال الـ URL للـ subscription (لو الـ backend بياخد URL)
      //    أو استخدم submitPaymentProof مع file مباشرة (لو بياخد file)
      await tenantSubscriptionService.submitPaymentProof(
        subscriptionId,
        file, // ✅ بنبعت الملف نفسه — الـ controller بيستقبل @UploadedFile
      );

      await loadAll();
      return { success: true, url };
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Failed to upload payment proof';
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
    refetch: loadAll,
    requestSubscription,
    uploadAndSubmitProof,
  };
}

export default usePlatformSubscription;
