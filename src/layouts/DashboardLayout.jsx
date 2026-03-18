import { NavLink, Outlet } from "react-router";
import ProFastLogo from "../pages/shared/ProfastLogo/ProfastLogo";
import {
  FiHome,
  FiPackage,
  FiCreditCard,
  FiMapPin,
  FiUser,
  FiUsers,
  FiClock,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import useUserRole from "../hooks/useUserRole";

const DashboardLayout = () => {
  const { role, roleLoading } = useUserRole();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition ${
      isActive ? "bg-base-300 font-semibold" : "hover:bg-base-300/60"
    }`;

  if (roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        <div className="navbar w-full bg-base-300 lg:hidden">
          <div className="flex-none">
            <label
              htmlFor="my-drawer-2"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
          <div className="mx-2 flex-1 px-2">Dashboard</div>
        </div>

        <Outlet />
      </div>

      <div className="drawer-side z-40">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        />

        <ul className="menu min-h-full w-80 space-y-1 bg-base-200 p-4">
          <div className="mb-4">
            <ProFastLogo />
          </div>

          <li>
            <NavLink to="/" className={linkClass}>
              <FiHome className="text-lg" />
              <span>Home</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/myParcels" className={linkClass}>
              <FiPackage className="text-lg" />
              <span>My Parcels</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/paymentHistory" className={linkClass}>
              <FiCreditCard className="text-lg" />
              <span>Payment History</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/track" className={linkClass}>
              <FiMapPin className="text-lg" />
              <span>Track a Package</span>
            </NavLink>
          </li>

          {role === "user" && (
            <li>
              <NavLink to="/dashboard/be-a-rider" className={linkClass}>
                <FiTruck className="text-lg" />
                <span>Be A Rider</span>
              </NavLink>
            </li>
          )}

          {role === "admin" && (
            <>
              <li>
                <NavLink to="/dashboard/activeRiders" className={linkClass}>
                  <FiUsers className="text-lg" />
                  <span>Active Riders</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/dashboard/pendingRiders" className={linkClass}>
                  <FiClock className="text-lg" />
                  <span>Pending Riders</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/dashboard/assign-rider" className={linkClass}>
                  <FiTruck className="text-lg" />
                  <span>Assign Rider</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/dashboard/make-admin" className={linkClass}>
                  <FiShield className="text-lg" />
                  <span>Make Admin</span>
                </NavLink>
              </li>
            </>
          )}

          {role === "rider" && (
            <li>
              <NavLink to="/dashboard/profile" className={linkClass}>
                <FiUser className="text-lg" />
                <span>Rider Profile</span>
              </NavLink>
            </li>
          )}

          {(role === "user" || role === "admin") && (
            <li>
              <NavLink to="/dashboard/profile" className={linkClass}>
                <FiUser className="text-lg" />
                <span>Update Profile</span>
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardLayout;
