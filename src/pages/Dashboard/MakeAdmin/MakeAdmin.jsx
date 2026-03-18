import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useUserRole from "../../../hooks/useUserRole";

const MakeAdmin = () => {
  const axiosSecure = useAxiosSecure();
  const { role, roleLoading } = useUserRole();

  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const isAdmin = role === "admin";

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-user-search", searchValue],
    enabled: !!searchValue && isAdmin && !roleLoading,
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/users/search?search=${encodeURIComponent(searchValue)}`,
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

  const handleSearch = (e) => {
    e.preventDefault();

    if (roleLoading) return;

    if (!isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Access denied",
        text: "Only admins can search and manage admin access.",
      });
      return;
    }

    const trimmed = searchText.trim();

    if (!trimmed) {
      Swal.fire({
        icon: "warning",
        title: "Search required",
        text: "Please enter an email to search.",
      });
      return;
    }

    setSearchValue(trimmed);
  };

  const handleClear = () => {
    setSearchText("");
    setSearchValue("");
  };

  const handleMakeAdmin = async (user) => {
    const result = await Swal.fire({
      title: "Make admin?",
      text: `Do you want to make ${user.email} an admin?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, make admin",
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoadingId(user._id);

      const res = await axiosSecure.patch(`/users/admin/${user._id}`);
      const data = res.data;

      if (data?.modifiedCount > 0 || data?.success) {
        await Swal.fire({
          icon: "success",
          title: "Updated",
          text: data?.message || "User is now admin.",
        });
        refetch();
      } else {
        Swal.fire({
          icon: "info",
          title: "No change",
          text: data?.message || "User admin status was not changed.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error?.response?.data?.message || "Failed to make user admin.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveAdmin = async (user) => {
    const result = await Swal.fire({
      title: "Remove admin?",
      text: `Do you want to remove admin access from ${user.email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoadingId(user._id);

      const res = await axiosSecure.patch(`/users/remove-admin/${user._id}`);
      const data = res.data;

      if (data?.modifiedCount > 0 || data?.success) {
        await Swal.fire({
          icon: "success",
          title: "Updated",
          text: data?.message || "Admin removed successfully.",
        });
        refetch();
      } else {
        Swal.fire({
          icon: "info",
          title: "No change",
          text: data?.message || "User role was not changed.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error?.response?.data?.message || "Failed to remove admin.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold">Make Admin</h2>
          <p className="mt-3 text-error">Admin only access</p>
          <p className="mt-2 text-sm text-base-content/70">
            Your account does not have permission to search users or manage
            admin access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Make Admin</h2>
        <p className="mt-1 text-sm text-base-content/70">
          Search a user by email and update admin access.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-4 flex flex-col gap-3 md:flex-row"
        >
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by email..."
            className="input input-bordered w-full"
          />

          <button type="submit" className="btn btn-primary md:w-40">
            Search
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="btn btn-ghost md:w-32"
          >
            Clear
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="border-b border-base-300 p-4">
          <h3 className="text-lg font-semibold">Search Result</h3>

          {searchValue ? (
            <p className="text-sm text-base-content/70">
              Showing result for:{" "}
              <span className="font-medium">{searchValue}</span>
            </p>
          ) : (
            <p className="text-sm text-base-content/70">
              Search for a user to see results.
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-error">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load users."}
          </div>
        ) : !searchValue ? (
          <div className="p-8 text-center text-base-content/60">
            No search yet.
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-base-content/60">
            No user found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td className="font-medium">{user.email || "N/A"}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "admin"
                            ? "badge-success"
                            : "badge-ghost"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {user.role === "admin" ? (
                          <button
                            onClick={() => handleRemoveAdmin(user)}
                            className="btn btn-error btn-sm"
                            disabled={actionLoadingId === user._id}
                          >
                            {actionLoadingId === user._id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              "Remove Admin"
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMakeAdmin(user)}
                            className="btn btn-primary btn-sm"
                            disabled={actionLoadingId === user._id}
                          >
                            {actionLoadingId === user._id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              "Make Admin"
                            )}
                          </button>
                        )}
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

export default MakeAdmin;
