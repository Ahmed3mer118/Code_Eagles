// src/features/superadmin/hooks/useAdminProfile.js
import { useState, useEffect, useCallback } from 'react';
import userService from '../../../shared/api/userService';

export function useAdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getMyProfile();
      setProfile(data);
      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'فشل تحميل بيانات الملف الشخصي';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (payload) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await userService.updateMyProfile(payload);
      setProfile((prev) => ({ ...prev, ...updated }));
      return { success: true, data: updated };
    } catch (err) {
      const msg = err?.response?.data?.message || 'فشل تحديث البيانات';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    setSaving(true);
    setError(null);
    try {
      const result = await userService.uploadAvatar(file);
      await fetchProfile();
      return { success: true, data: result };
    } catch (err) {
      const msg = err?.response?.data?.message || 'فشل رفع الصورة';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSaving(false);
    }
  };

  const deleteAvatar = async () => {
    setSaving(true);
    setError(null);
    try {
      await userService.removeAvatar();
      setProfile((prev) =>
        prev ? { ...prev, profileImageUrl: null } : prev,
      );
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || 'فشل حذف الصورة';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    error,
    refetch: fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  };
}
