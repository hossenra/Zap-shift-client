import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { parcelId } = useParams();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { isPending, data: parcelInfo = {} } = useQuery({
    queryKey: ["parcels", parcelId],
    enabled: !!parcelId,
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels/${parcelId}`);
      return res.data;
    },
  });

  if (isPending) return "...loading";

  const amount = Number(parcelInfo?.cost) || 0;
  const amountInCents = Math.round(amount * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
      setError("Invalid amount");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ MATCH BACKEND: create intent from /create-checkout-session
      const intentRes = await axiosSecure.post("/create-checkout-session", {
        amountInCents,
        parcelId,
        userEmail: user?.email,
      });

      const clientSecret = intentRes?.data?.clientSecret;
      if (!clientSecret) {
        setError("clientSecret missing from server response");
        return;
      }

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: user?.displayName || "Customer",
            email: user?.email || "",
          },
        },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
        return;
      }

      if (result.paymentIntent?.status !== "succeeded") {
        setError(
          `Payment status: ${result.paymentIntent?.status || "unknown"}`,
        );
        return;
      }

      const transactionId = result.paymentIntent.id;

      // ✅ MATCH BACKEND: save payment + mark parcel paid
      const paymentData = {
        parcelId,
        email: user?.email,
        amount,
        transactionId,
        paymentMethod: result.paymentIntent.payment_method_types,
      };

      const paymentRes = await axiosSecure.post("/payments", paymentData);

      if (paymentRes?.data?.insertedId) {
        await Swal.fire({
          icon: "success",
          title: "Payment Successful!",
          html: `<strong>Transaction ID:</strong> <code>${transactionId}</code>`,
          confirmButtonText: "Go to My Parcels",
        });

        navigate("/dashboard/myParcels");
      } else {
        setError("Payment succeeded but failed to save payment");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Payment request failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto"
      >
        <div className="p-3 border rounded bg-white">
          <CardElement options={{ hidePostalCode: true }} />
        </div>

        <button
          type="submit"
          className="btn btn-primary text-black w-full"
          disabled={!stripe || submitting}
        >
          {submitting ? "Processing..." : `Pay $${amount}`}
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default PaymentForm;
