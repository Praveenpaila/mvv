import React from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  StyleSheet,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * In-app Razorpay checkout using WebView (same flow as website).
 * Uses checkout.razorpay.com and posts success/failure back via postMessage.
 */
export function RazorpayCheckout({ options, onSuccess, onFailure, onClose }) {
  const { handler, ...optionsWithoutHandler } = options || {};
  const optionsString = JSON.stringify(optionsWithoutHandler || {});

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>body { margin: 0; background: transparent; }</style>
      </head>
      <body>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          var options = ${optionsString};
          options.handler = function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_SUCCESS',
              data: response
            }));
          };
          options.modal = {
            ondismiss: function () {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_CLOSED'
              }));
            }
          };
          var rzp1 = new Razorpay(options);
          rzp1.on('payment.failed', function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_FAILED',
              error: response.error || {}
            }));
          });
          rzp1.open();
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === "PAYMENT_SUCCESS") {
        onSuccess?.(message.data);
      } else if (message.type === "PAYMENT_FAILED") {
        onFailure?.(message.error || { description: "Payment failed" });
      } else if (message.type === "PAYMENT_CLOSED") {
        onClose?.();
      }
    } catch (e) {
      onClose?.();
    }
  };

  const handleNavigation = (request) => {
    const { url } = request;
    if (!url.startsWith("http") && !url.startsWith("https") && !url.startsWith("about:blank")) {
      Linking.openURL(url).catch(() => {});
      return false;
    }
    return true;
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeContainer} edges={["bottom", "left", "right"]}>
          <WebView
            originWhitelist={["*", "http://*", "https://*", "upi://*", "tez://*", "phonepe://*"]}
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleNavigation}
            javaScriptEnabled
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={options?.theme?.color || "#10B981"} />
              </View>
            )}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  safeContainer: { flex: 1 },
  webview: { flex: 1, backgroundColor: "transparent" },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 1001,
  },
});
