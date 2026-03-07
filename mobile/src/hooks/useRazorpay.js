import { useState } from "react";
import { RazorpayCheckout } from "../components/RazorpayCheckout";

/**
 * Hook to open Razorpay checkout (WebView). Same API as @codearcade/expo-razorpay.
 * Returns openCheckout and the RazorpayUI element that must be rendered.
 */
export function useRazorpay() {
  const [isVisible, setIsVisible] = useState(false);
  const [checkoutOptions, setCheckoutOptions] = useState(null);
  const [callbacks, setCallbacks] = useState(null);

  const openCheckout = (options, cbs) => {
    if (isVisible) return;
    setCheckoutOptions(options);
    setCallbacks(cbs || {});
    setIsVisible(true);
  };

  const closeCheckout = () => {
    setIsVisible(false);
    callbacks?.onClose?.();
    setTimeout(() => {
      setCallbacks(null);
      setCheckoutOptions(null);
    }, 100);
  };

  const handleSuccess = (data) => {
    callbacks?.onSuccess?.(data);
    closeCheckout();
  };

  const handleFailure = (error) => {
    callbacks?.onFailure?.(error);
    closeCheckout();
  };

  const RazorpayUI = isVisible && checkoutOptions ? (
    <RazorpayCheckout
      options={checkoutOptions}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      onClose={() => {
        callbacks?.onClose?.();
        closeCheckout();
      }}
    />
  ) : null;

  return { openCheckout, closeCheckout, RazorpayUI, isVisible };
}
