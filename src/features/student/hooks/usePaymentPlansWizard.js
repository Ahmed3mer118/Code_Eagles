// src/features/student/hooks/usePaymentPlansWizard.js
import { useEffect, useState } from 'react';
import paymentPlansApi from '../api/paymentPlans.api';

export default function usePaymentPlansWizard() {
  const [step, setStep] = useState(1);

  const [academy, setAcademy] = useState(null);
  const [plans, setPlans] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Upload
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofUrl, setProofUrl] = useState(null);

  // ✅ Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState(null);

  // Loading / Errors
  const [loadingAcademy, setLoadingAcademy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [checking, setChecking] = useState(true);
  const [canSubmit, setCanSubmit] = useState(true);
  const [blockingRequest, setBlockingRequest] = useState(null);
  const [blockReason, setBlockReason] = useState(null);

  useEffect(() => {
    setChecking(false);
  }, []);

  /* ───────── Step 1 ───────── */
  const selectAcademy = async (acad) => {
    setError(null);
    setLoadingAcademy(true);

    try {
      try {
        const checkRes = await paymentPlansApi.canSubmitNewRequest(acad.id);
        const checkData = checkRes?.data?.data ?? checkRes?.data;

        if (checkData?.canSubmit === false) {
          setCanSubmit(false);
          setBlockingRequest(checkData.blockingRequest || null);
          setBlockReason(
            checkData.reason || 'لديك طلب قيد المراجعة في هذه الأكاديمية'
          );
          setAcademy(acad);
          setLoadingAcademy(false);
          return;
        }

        setCanSubmit(true);
        setBlockingRequest(null);
        setBlockReason(null);
      } catch (err) {
        console.warn('Can-submit check failed:', err);
        setCanSubmit(true);
      }

      setAcademy(acad);
      setSelectedPlan(null);
      setSelectedGroup(null);
      setPromoCode('');
      setAppliedPromo(null);
      setPromoError(null);

      const [plansRes, groupsRes] = await Promise.all([
        paymentPlansApi.getAcademyPlans(acad.slug),
        paymentPlansApi.getAcademyGroups(acad.slug).catch(() => ({ data: [] })),
      ]);

      const plansList = plansRes?.data?.data ?? plansRes?.data ?? [];
      const groupsList = groupsRes?.data?.data ?? groupsRes?.data ?? [];

      setPlans(Array.isArray(plansList) ? plansList : []);
      setGroups(Array.isArray(groupsList) ? groupsList : []);
      setStep(2);
    } catch (err) {
      console.error('selectAcademy error:', err);
      setError(
        err?.response?.data?.message || 'تعذر تحميل خطط الدفع. حاول مرة أخرى.'
      );
    } finally {
      setLoadingAcademy(false);
    }
  };

  /* ───────── Step 2 ───────── */
  const selectPlan = (plan) => {
    setSelectedPlan(plan);
    setAppliedPromo(null);
    setPromoError(null);
  };
  const selectGroup = (group) => setSelectedGroup(group);

  const confirmStep2 = () => {
    if (!selectedPlan) {
      setError('اختر خطة الدفع أولاً');
      return;
    }
    if (!selectedGroup) {
      setError('اختر مجموعة');
      return;
    }
    setError(null);
    setStep(3);
  };

  /* ───────── Step 3: Promo Code ───────── */
   const applyPromoCode = async () => {
    if (!promoCode.trim() || !selectedPlan || !selectedGroup) return;

    setValidatingPromo(true);
    setPromoError(null);
    setAppliedPromo(null);

    try {
      const res = await paymentPlansApi.validatePromoCode({
        code: promoCode,
        amount: Number(selectedPlan.price),
        groupId: selectedGroup.id,
        paymentPlanId: selectedPlan.id,
        tenantId: academy.id, // ✅ ضيفي السطر ده
      });

      const data = res?.data?.data ?? res?.data;
      if (data?.valid) {
        setAppliedPromo(data);
      } else {
        setPromoError(data?.message || 'كود الخصم غير صالح');
      }
    } catch (err) {
      setPromoError(
        err?.response?.data?.message || 'تعذر التحقق من كود الخصم'
      );
    } finally {
      setValidatingPromo(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setPromoError(null);
  };

  /* ───────── Step 3: Upload ───────── */
  const pickFile = (file) => {
    if (!file) {
      setProofFile(null);
      setProofPreview(null);
      setProofUrl(null);
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    setProofUrl(null);
  };

  const uploadFile = async () => {
    if (!proofFile) {
      setError('اختر صورة التحويل أولاً');
      return null;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await paymentPlansApi.uploadProofImage(proofFile);
      const url =
        res?.data?.url ??
        res?.data?.data?.url ??
        res?.data?.data?.secure_url ??
        null;
      if (!url) throw new Error('لم يتم استلام رابط الصورة');
      setProofUrl(url);
      return url;
    } catch (err) {
      console.error('uploadFile error:', err);
      setError(
        err?.response?.data?.message || 'تعذر رفع الصورة. جرب مرة أخرى.'
      );
      return null;
    } finally {
      setUploading(false);
    }
  };

  /* ───────── Submit ───────── */
  const submit = async () => {
    if (!academy || !selectedPlan || !selectedGroup) {
      setError('البيانات ناقصة');
      return null;
    }
    setSubmitting(true);
    setError(null);

    try {
      const finalProofUrl = proofUrl ?? (await uploadFile());
      if (!finalProofUrl) {
        setSubmitting(false);
        return null;
      }

      const enrollmentRes = await paymentPlansApi.requestEnrollment({
        tenantId: academy.id,
        groupId: selectedGroup.id,
        planId: selectedPlan.id,
        notes: 'طلب انضمام عبر صفحة خطط الدفع',
      });

      const enrollment = enrollmentRes?.data?.data ?? enrollmentRes?.data;
      if (!enrollment?.id) {
        throw new Error('لم يتم استلام enrollmentId');
      }

      const paymentRes = await paymentPlansApi.requestPayment({
        tenantId: academy.id,
        enrollmentId: enrollment.id,
        paymentPlanId: selectedPlan.id,
        proofImageUrl: finalProofUrl,
        amount: Number(selectedPlan.price) || 0,
        // ✅ إرسال كود الخصم
        promoCode: appliedPromo ? promoCode : undefined,
      });

      const payment = paymentRes?.data?.data ?? paymentRes?.data;

      return { enrollment, payment };
    } catch (err) {
      console.error('submit error:', err);
      const message =
        err?.response?.data?.message || 'تعذر إرسال الطلب. جرب مرة أخرى.';
      setError(message);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  /* ───────── Reset ───────── */
  const reset = () => {
    setStep(1);
    setAcademy(null);
    setPlans([]);
    setGroups([]);
    setSelectedPlan(null);
    setSelectedGroup(null);
    setProofFile(null);
    setProofPreview(null);
    setProofUrl(null);
    setPromoCode('');
    setAppliedPromo(null);
    setPromoError(null);
    setError(null);
    setUploading(false);
    setSubmitting(false);
    setLoadingAcademy(false);
    setCanSubmit(true);
    setBlockingRequest(null);
    setBlockReason(null);
  };

  const back = () => {
    setError(null);
    if (step === 3) setStep(2);
    else if (step === 2) {
      setStep(1);
      setAcademy(null);
      setPlans([]);
      setGroups([]);
      setSelectedPlan(null);
      setSelectedGroup(null);
      setCanSubmit(true);
      setBlockingRequest(null);
      setBlockReason(null);
    }
  };

  return {
    step,
    academy,
    plans,
    groups,
    selectedPlan,
    selectedGroup,
    proofFile,
    proofPreview,
    proofUrl,
    loadingAcademy,
    uploading,
    submitting,
    error,
    checking,
    canSubmit,
    blockingRequest,
    blockReason,
    // Promo
    promoCode,
    setPromoCode,
    appliedPromo,
    validatingPromo,
    promoError,
    applyPromoCode,
    removePromoCode,
    // Actions
    selectAcademy,
    selectPlan,
    selectGroup,
    confirmStep2,
    pickFile,
    uploadFile,
    submit,
    reset,
    back,
    setError,
  };
}
