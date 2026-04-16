import { useState, useCallback, useRef, useEffect } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cancel any pending auto-dismiss when the hook unmounts.
  useEffect(() => clearTimer, [clearTimer]);

  const show = useCallback((type, message) => {
    clearTimer();
    setToast({ type, message });
    timerRef.current = setTimeout(() => setToast(null), 5000);
  }, [clearTimer]);

  const showSuccess = useCallback((message) => show('success', message), [show]);
  const showError = useCallback((message) => show('error', message), [show]);

  const dismiss = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  return { toast, showSuccess, showError, dismiss };
}
