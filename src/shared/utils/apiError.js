export function extractApiError(error) {
  if (!error) return { message: 'حدث خطأ غير معروف' };

  const data = error?.response?.data;
  if (data) {
    const rawMsg = data.message;
    const message = Array.isArray(rawMsg)
      ? rawMsg.join(' • ')
      : rawMsg || data.error || 'Request failed';
    return {
      message,
      statusCode: data.statusCode || error.response?.status,
      error: data.error,
    };
  }
  return { message: error.message || 'Network error' };
}