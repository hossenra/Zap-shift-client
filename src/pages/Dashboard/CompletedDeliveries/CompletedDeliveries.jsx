import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

const CompletedDeliveries = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const {
    data: parcels = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["completed-deliveries", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/parcels/rider-completed?email=${encodeURIComponent(user.email)}`,
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
    console.log("View completed parcel:", parcel);
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
          <h2 className="text-2xl font-bold">Completed Deliveries</h2>
          <p className="mt-3 text-error">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load completed deliveries."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Completed Deliveries</h2>
        <p className="mt-1 text-sm text-base-content/70">
          Parcels successfully delivered by you.
        </p>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="border-b border-base-300 p-4">
          <h3 className="text-lg font-semibold">Delivered Parcels</h3>
          <p className="text-sm text-base-content/70">
            Total completed deliveries:{" "}
            <span className="font-semibold">{parcels.length}</span>
          </p>
        </div>

        {parcels.length === 0 ? (
          <div className="p-8 text-center text-base-content/60">
            No completed deliveries found.
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
                  <th>Delivered At</th>
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
                      <span className="badge badge-success">
                        {parcel.delivery_status || "N/A"}
                      </span>
                    </td>

                    <td>
                      {formatDate(
                        parcel.delivered_at ||
                          parcel.updatedAt ||
                          parcel.assigned_at,
                      )}
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() => handleView(parcel)}
                        className="btn btn-outline btn-sm"
                      >
                        View
                      </button>
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

export default CompletedDeliveries;
