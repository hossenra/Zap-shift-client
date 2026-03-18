import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const AssignRider = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [assignLoadingId, setAssignLoadingId] = useState(null);

  const {
    data: readyParcels = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["assign-rider-parcels"],
    queryFn: async () => {
      const res = await axiosSecure.get("/parcels/ready-for-assignment");
      return res.data || [];
    },
  });

  const parcelDistrict =
    selectedParcel?.receiver_service_center ||
    selectedParcel?.sender_service_center ||
    "";

  const {
    data: riders = [],
    isLoading: ridersLoading,
    isError: ridersError,
    error: ridersQueryError,
  } = useQuery({
    queryKey: ["active-riders-by-district", parcelDistrict],
    enabled: !!selectedParcel && !!parcelDistrict,
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/riders/active-by-district?district=${encodeURIComponent(parcelDistrict)}`,
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

  const openAssignModal = (parcel) => {
    setSelectedParcel(parcel);
    document.getElementById("assign_rider_modal")?.showModal();
  };

  const closeAssignModal = () => {
    setSelectedParcel(null);
    document.getElementById("assign_rider_modal")?.close();
  };

  const handleAssignNow = async (rider) => {
    if (!selectedParcel?._id) return;

    const result = await Swal.fire({
      title: "Assign rider?",
      html: `
        <p><strong>Parcel:</strong> ${
          selectedParcel.tracking_id || selectedParcel.trackingId || "N/A"
        }</p>
        <p><strong>Rider:</strong> ${rider.name || "N/A"}</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, assign",
    });

    if (!result.isConfirmed) return;

    try {
      setAssignLoadingId(rider._id);

      const res = await axiosSecure.patch(
        `/parcels/assign-rider/${selectedParcel._id}`,
        {
          riderId: rider._id,
        },
      );

      if (res.data?.success) {
        await Swal.fire({
          icon: "success",
          title: "Assigned",
          text: res.data?.message || "Rider assigned successfully.",
        });

        closeAssignModal();
        refetch();
      } else {
        Swal.fire({
          icon: "info",
          title: "No change",
          text: res.data?.message || "Assignment was not completed.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error?.response?.data?.message || "Failed to assign rider.",
      });
    } finally {
      setAssignLoadingId(null);
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
          <h2 className="text-2xl font-bold">Assign Rider</h2>
          <p className="mt-3 text-error">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load parcels."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Assign Rider</h2>
        <p className="mt-1 text-sm text-base-content/70">
          Showing paid parcels that are waiting to be collected.
        </p>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="border-b border-base-300 p-4">
          <h3 className="text-lg font-semibold">Available Parcels</h3>
          <p className="text-sm text-base-content/70">
            Total ready for assignment:{" "}
            <span className="font-semibold">{readyParcels.length}</span>
          </p>
        </div>

        {readyParcels.length === 0 ? (
          <div className="p-8 text-center text-base-content/60">
            No paid parcels found with delivery status{" "}
            <span className="font-medium">not_collected</span>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tracking ID</th>
                  <th>Type</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Pickup</th>
                  <th>Delivery</th>
                  <th>Cost</th>
                  <th>Created At</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {readyParcels.map((parcel, index) => (
                  <tr key={parcel._id}>
                    <td>{index + 1}</td>
                    <td className="font-medium">
                      {parcel.tracking_id || parcel.trackingId || "N/A"}
                    </td>
                    <td>{parcel.type || parcel.parcel_type || "N/A"}</td>
                    <td>
                      <div>
                        <p className="font-medium">
                          {parcel.sender_name || parcel.senderName || "N/A"}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {parcel.sender_contact ||
                            parcel.senderContact ||
                            "N/A"}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">
                          {parcel.receiver_name || parcel.receiverName || "N/A"}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {parcel.receiver_contact ||
                            parcel.receiverContact ||
                            "N/A"}
                        </p>
                      </div>
                    </td>
                    <td>
                      {parcel.sender_service_center ||
                        parcel.pickup_address ||
                        parcel.pickupAddress ||
                        "N/A"}
                    </td>
                    <td>
                      {parcel.receiver_service_center ||
                        parcel.delivery_address ||
                        parcel.deliveryAddress ||
                        "N/A"}
                    </td>
                    <td>${parcel.cost || parcel.delivery_cost || 0}</td>
                    <td>
                      {formatDate(
                        parcel.creation_date ||
                          parcel.created_at ||
                          parcel.createdAt,
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => openAssignModal(parcel)}
                        className="btn btn-primary btn-sm"
                      >
                        Assign Rider
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <dialog id="assign_rider_modal" className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="text-xl font-bold">Assign Rider</h3>

          {selectedParcel && (
            <div className="mt-4 rounded-xl border border-base-300 bg-base-200 p-4">
              <p>
                <span className="font-semibold">Tracking ID:</span>{" "}
                {selectedParcel.tracking_id ||
                  selectedParcel.trackingId ||
                  "N/A"}
              </p>
              <p>
                <span className="font-semibold">Receiver:</span>{" "}
                {selectedParcel.receiver_name ||
                  selectedParcel.receiverName ||
                  "N/A"}
              </p>
              <p>
                <span className="font-semibold">
                  Service Center / District:
                </span>{" "}
                {parcelDistrict || "N/A"}
              </p>
            </div>
          )}

          <div className="mt-5">
            <h4 className="mb-3 text-lg font-semibold">Available Riders</h4>

            {ridersLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : ridersError ? (
              <p className="text-error">
                {ridersQueryError?.response?.data?.message ||
                  ridersQueryError?.message ||
                  "Failed to load riders."}
              </p>
            ) : riders.length === 0 ? (
              <p className="text-base-content/70">
                No active rider found for district{" "}
                <span className="font-semibold">{parcelDistrict || "N/A"}</span>
                .
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>District</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riders.map((rider, index) => (
                      <tr key={rider._id}>
                        <td>{index + 1}</td>
                        <td>{rider.name || "N/A"}</td>
                        <td>{rider.email || "N/A"}</td>
                        <td>{rider.phone || rider.contact || "N/A"}</td>
                        <td>{rider.district || "N/A"}</td>
                        <td className="text-center">
                          <button
                            onClick={() => handleAssignNow(rider)}
                            className="btn btn-success btn-sm"
                            disabled={assignLoadingId === rider._id}
                          >
                            {assignLoadingId === rider._id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              "Assign"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-action">
            <button onClick={closeAssignModal} className="btn">
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default AssignRider;
