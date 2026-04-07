import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

const PendingDeliveries = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const {
    data: parcels = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["pending-deliveries", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/parcels/rider-pending?email=${encodeURIComponent(user.email)}`,
      );
      return res.data || [];
    },
  });

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleString();
  };

  const handleView = (parcel) => {
    console.log("View parcel:", parcel);
  };

  const handleStatusUpdate = async (parcel, nextStatus) => {
    const labels = {
      "in-transit": "In Transit",
      delivered: "Delivered",
      delivery_failed: "Delivery Failed",
    };

    const result = await Swal.fire({
      title: "Update delivery status?",
      html: `
        <p><strong>Tracking ID:</strong> ${
          parcel.tracking_id || parcel.trackingId || "N/A"
        }</p>
        <p><strong>New Status:</strong> ${labels[nextStatus] || nextStatus}</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoadingId(`${parcel._id}-${nextStatus}`);

      const res = await axiosSecure.patch(
        `/parcels/rider-status/${parcel._id}`,
        {
          status: nextStatus,
        },
      );

      if (res.data?.success) {
        await Swal.fire({
          icon: "success",
          title: "Updated",
          text: res.data?.message || "Delivery status updated successfully.",
        });
        refetch();
      } else {
        Swal.fire({
          icon: "info",
          title: "No change",
          text: res.data?.message || "Status was not updated.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error?.response?.data?.message || "Failed to update delivery status.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold">Pending Deliveries</h2>
          <p className="mt-3 text-error">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load pending deliveries."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Pending Deliveries</h2>
        <p className="mt-1 text-sm text-base-content/70">
          Parcels assigned to you that are currently in transit.
        </p>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="border-b border-base-300 p-4">
          <h3 className="text-lg font-semibold">Assigned Parcels</h3>
          <p className="text-sm text-base-content/70">
            Total pending deliveries:{" "}
            <span className="font-semibold">{parcels.length}</span>
          </p>
        </div>

        {parcels.length === 0 ? (
          <div className="p-8 text-center text-base-content/60">
            No pending deliveries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tracking ID</th>
                  <th>Parcel Type</th>
                  <th>Receiver</th>
                  <th>Receiver Contact</th>
                  <th>Delivery Address</th>
                  <th>Status</th>
                  <th>Assigned At</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {parcels.map((parcel, index) => (
                  <tr key={parcel._id}>
                    <td>{index + 1}</td>

                    <td className="font-medium">
                      {parcel.tracking_id || parcel.trackingId || "N/A"}
                    </td>

                    <td>{parcel.type || parcel.parcel_type || "N/A"}</td>

                    <td>
                      {parcel.receiver_name || parcel.receiverName || "N/A"}
                    </td>

                    <td>
                      {parcel.receiver_contact ||
                        parcel.receiverContact ||
                        "N/A"}
                    </td>

                    <td>
                      {parcel.receiver_service_center ||
                        parcel.delivery_address ||
                        parcel.deliveryAddress ||
                        "N/A"}
                    </td>

                    <td>
                      <span className="badge badge-info">
                        {parcel.delivery_status || "N/A"}
                      </span>
                    </td>

                    <td>
                      {formatDate(parcel.assigned_at || parcel.updatedAt)}
                    </td>

                    <td className="text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(parcel)}
                          className="btn btn-outline btn-sm"
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            handleStatusUpdate(parcel, "delivered")
                          }
                          className="btn btn-success btn-sm"
                          disabled={
                            actionLoadingId === `${parcel._id}-delivered`
                          }
                        >
                          {actionLoadingId === `${parcel._id}-delivered` ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            "Mark Delivered"
                          )}
                        </button>

                        <button
                          onClick={() =>
                            handleStatusUpdate(parcel, "delivery_failed")
                          }
                          className="btn btn-error btn-sm"
                          disabled={
                            actionLoadingId === `${parcel._id}-delivery_failed`
                          }
                        >
                          {actionLoadingId ===
                          `${parcel._id}-delivery_failed` ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            "Delivery Failed"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingDeliveries;
