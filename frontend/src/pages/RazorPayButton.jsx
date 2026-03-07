import React from "react";

const RazorpayButton = () => {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    // 🔹 Step 1: Create order from backend
    const orderResponse = await fetch(
      "http://localhost:5000/api/payment/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 500 }),
      },
    );

    const order = await orderResponse.json();

    const options = {
      key: "YOUR_LIVE_OR_TEST_KEY_ID",
      amount: order.amount,
      currency: "INR",
      name: "My Website",
      description: "Test Transaction",
      order_id: order.id,

      handler: async function (response) {
        // 🔹 Step 2: Verify payment
        const verifyResponse = await fetch(
          "http://localhost:5000/api/payment/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(response),
          },
        );

        const result = await verifyResponse.json();

        if (result.success) {
          alert("Payment Successful!");
        } else {
          alert("Payment Verification Failed!");
        }
      },

      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },

      theme: {
        color: "#0f172a",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <button
      onClick={handlePayment}
      style={{
        padding: "12px 24px",
        backgroundColor: "#0f172a",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      Pay ₹500
    </button>
  );
};

export default RazorpayButton;
