import { NavLink, Outlet } from "react-router";
import ProFastLogo from "../pages/shared/ProfastLogo/ProfastLogo";
import {
  FiHome,
  FiPackage,
  FiCreditCard,
  FiMapPin,
  FiUser,
} from "react-icons/fi";

const DashboardLayout = () => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 ${isActive ? "active font-semibold" : ""}`;

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-300 w-full lg:hidden">
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
          <div className="mx-2 flex-1 px-2 lg:hidden">Dashboard</div>
        </div>

        <Outlet />
      </div>

      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <ul className="menu bg-base-200 min-h-full w-80 p-4">
          <ProFastLogo />

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

          <li>
            <NavLink to="/dashboard/profile" className={linkClass}>
              <FiUser className="text-lg" />
              <span>Update Profile</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardLayout;
