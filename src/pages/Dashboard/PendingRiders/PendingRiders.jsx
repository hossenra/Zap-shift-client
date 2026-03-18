import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const PendingRiders = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedRider, setSelectedRider] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const {
    data: riders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pending-riders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/riders/pending");
      return res.data || [];
    },
  });

  const closeModal = () => {
    document.getElementById("rider_details_modal")?.close();
    setSelectedRider(null);
  };

  const openDetailsModal = (rider) => {
    setSelectedRider(rider);
    document.getElementById("rider_details_modal")?.showModal();
  };

  const updateRiderStatus = async (
    rider,
    updateData,
    successTitle,
    successText,
  ) => {
    try {
      setActionLoadingId(rider._id);

      const res = await axiosSecure.patch(`/riders/${rider._id}`, updateData);

      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: successTitle,
          text: successText,
          timer: 1500,
          showConfirmButton: false,
        });

        if (selectedRider?._id === rider._id) {
          closeModal();
        }

        refetch();
      } else {
        Swal.fire({
          icon: "info",
          title: "No changes made",
          text: "The rider data was already updated.",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Action failed",
        text: error?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprove = async (rider) => {
    const result = await Swal.fire({
      title: "Approve Rider?",
      text: `Approve ${rider.name} as an active rider?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "No",
      confirmButtonColor: "#16a34a",
    });

    if (!result.isConfirmed) return;

    updateRiderStatus(
      rider,
      { status: "active", role: "rider", email: rider.email },
      "Approved",
      `${rider.name} is now an active rider.`,
    );
  };

  const handleCancel = async (rider) => {
    const result = await Swal.fire({
      title: "Cancel Application?",
      text: `Cancel ${rider.name}'s rider application?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    updateRiderStatus(
      rider,
      { status: "cancelled", email: rider.email },
      "Application Cancelled",
      `${rider.name}'s application has been cancelled.`,
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-lg">
        <div className="flex flex-col gap-3 border-b border-base-200 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Pending Riders</h2>
            <p className="text-base-content/70">
              Review rider applications and approve or cancel them.
            </p>
          </div>

          <div className="badge badge-warning badge-lg">
            Total Pending: {riders.length}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : riders.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="text-xl font-semibold">No pending riders found</h3>
            <p className="mt-2 text-base-content/60">
              All rider applications have already been processed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead className="bg-base-200 text-base-content">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Region</th>
                  <th>District</th>
                  <th>Bike Brand</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((rider, index) => (
                  <tr key={rider._id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{rider.name}</td>
                    <td>{rider.email}</td>
                    <td>{rider.phone}</td>
                    <td>{rider.region}</td>
                    <td>{rider.district}</td>
                    <td>{rider.bike_brand}</td>
                    <td>
                      <span className="badge badge-warning capitalize">
                        {rider.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => openDetailsModal(rider)}
                          className="btn btn-info btn-sm text-white"
                        >
                          View
                        </button>

                        <button
                          onClick={() => handleApprove(rider)}
                          disabled={actionLoadingId === rider._id}
                          className="btn btn-success btn-sm text-white"
                        >
                          {actionLoadingId === rider._id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          onClick={() => handleCancel(rider)}
                          disabled={actionLoadingId === rider._id}
                          className="btn btn-error btn-sm text-white"
                        >
                          {actionLoadingId === rider._id
                            ? "Processing..."
                            : "Cancel"}
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

      <dialog id="rider_details_modal" className="modal">
        <div className="modal-box max-w-4xl">
          <h3 className="mb-5 text-2xl font-bold">Rider Application Details</h3>

          {selectedRider && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-base-200 p-4">
                  <h4 className="mb-3 text-lg font-bold">
                    Personal Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {selectedRider.name}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {selectedRider.email}
                    </p>
                    <p>
                      <span className="font-semibold">Age:</span>{" "}
                      {selectedRider.age}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span>{" "}
                      {selectedRider.phone}
                    </p>
                    <p>
                      <span className="font-semibold">National ID:</span>{" "}
                      {selectedRider.national_id}
                    </p>
                    <p>
                      <span className="font-semibold">Date of Birth:</span>{" "}
                      {selectedRider.date_of_birth}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-base-200 p-4">
                  <h4 className="mb-3 text-lg font-bold">
                    Location Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Region:</span>{" "}
                      {selectedRider.region}
                    </p>
                    <p>
                      <span className="font-semibold">District:</span>{" "}
                      {selectedRider.district}
                    </p>
                    <p>
                      <span className="font-semibold">Address:</span>{" "}
                      {selectedRider.address}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-base-200 p-4">
                  <h4 className="mb-3 text-lg font-bold">
                    Vehicle Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Bike Brand:</span>{" "}
                      {selectedRider.bike_brand}
                    </p>
                    <p>
                      <span className="font-semibold">Bike Registration:</span>{" "}
                      {selectedRider.bike_registration_number}
                    </p>
                    <p>
                      <span className="font-semibold">Driving License:</span>{" "}
                      {selectedRider.driving_license}
                    </p>
                    <p>
                      <span className="font-semibold">Experience:</span>{" "}
                      {selectedRider.experience} years
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-base-200 p-4">
                  <h4 className="mb-3 text-lg font-bold">Application Meta</h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      <span className="badge badge-warning capitalize">
                        {selectedRider.status}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Applied At:</span>{" "}
                      {selectedRider.created_at}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-base-200 p-4">
                <h4 className="mb-3 text-lg font-bold">Motivation</h4>
                <p>{selectedRider.motivation}</p>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => handleCancel(selectedRider)}
                  disabled={actionLoadingId === selectedRider._id}
                  className="btn btn-error text-white"
                >
                  {actionLoadingId === selectedRider._id
                    ? "Processing..."
                    : "Cancel Application"}
                </button>

                <button
                  onClick={() => handleApprove(selectedRider)}
                  disabled={actionLoadingId === selectedRider._id}
                  className="btn btn-success text-white"
                >
                  {actionLoadingId === selectedRider._id
                    ? "Processing..."
                    : "Accept Rider"}
                </button>
              </div>
            </div>
          )}

          <div className="modal-action">
            <button onClick={closeModal} className="btn">
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default PendingRiders;
