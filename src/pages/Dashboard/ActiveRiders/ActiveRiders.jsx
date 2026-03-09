import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ActiveRiders = () => {
  const axiosSecure = useAxiosSecure();
  const [searchText, setSearchText] = useState("");

  const {
    data: riders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["active-riders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/riders/active");
      return res.data;
    },
  });

  const filteredRiders = useMemo(() => {
    return riders.filter((rider) =>
      rider?.name?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [riders, searchText]);

  const handleDeactivate = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to deactivate ${name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, deactivate",
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.patch(`/riders/deactivate/${id}`);

        if (res.data?.modifiedCount > 0 || res.data?.success) {
          Swal.fire({
            icon: "success",
            title: "Rider deactivated successfully",
            timer: 1500,
            showConfirmButton: false,
          });
          refetch();
        } else {
          Swal.fire({
            icon: "info",
            title: "No changes made",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Failed to deactivate rider",
          text: error.message,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-3 text-sm text-gray-500">Loading active riders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="rounded-2xl bg-white shadow-lg border border-gray-100">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Active Riders
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage all currently active riders from here.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:items-center">
            <div className="stats shadow-sm border border-gray-200 bg-gray-50">
              <div className="stat px-4 py-3">
                <div className="stat-title text-xs">Total Active Riders</div>
                <div className="stat-value text-primary text-2xl">
                  {filteredRiders.length}
                </div>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search rider by name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input input-bordered w-full md:w-80 bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th>#</th>
                <th>Rider</th>
                <th>Contact</th>
                <th>Region</th>
                <th>District</th>
                <th>Bike</th>
                <th>Registration</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRiders.length > 0 ? (
                filteredRiders.map((rider, index) => (
                  <tr key={rider._id} className="hover">
                    <td className="font-medium text-gray-600">{index + 1}</td>

                    <td>
                      <div>
                        <p className="font-bold text-gray-800">{rider.name}</p>
                        <p className="text-sm text-gray-500">{rider.email}</p>
                      </div>
                    </td>

                    <td className="text-sm text-gray-700">
                      {rider.phoneNumber || rider.phone || "N/A"}
                    </td>

                    <td className="text-sm text-gray-700">
                      {rider.region || "N/A"}
                    </td>

                    <td className="text-sm text-gray-700">
                      {rider.district || "N/A"}
                    </td>

                    <td className="text-sm text-gray-700">
                      {rider.bikeBrand || "N/A"}
                    </td>

                    <td className="text-sm text-gray-700">
                      {rider.bikeRegistrationNumber || "N/A"}
                    </td>

                    <td>
                      <span className="badge badge-success badge-outline px-3 py-3 font-semibold capitalize">
                        {rider.status || "active"}
                      </span>
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() => handleDeactivate(rider._id, rider.name)}
                        className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none rounded-lg"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 text-5xl">🚴</div>
                      <h3 className="text-lg font-semibold text-gray-700">
                        No active riders found
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Try searching with another name or check later.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActiveRiders;
