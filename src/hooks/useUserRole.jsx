import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useUserRole = () => {
  const { user, loading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const email = user?.email;

  const {
    data,
    isLoading: roleLoading,
    isError,
    error,
    refetch: refetchRole,
  } = useQuery({
    queryKey: ["user-role", email],
    enabled: !loading && !!email,
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/users/role/${encodeURIComponent(email)}`,
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    role: data?.role || null,
    roleLoading,
    isRoleError: isError,
    roleError: error,
    refetchRole,
  };
};

export default useUserRole;
