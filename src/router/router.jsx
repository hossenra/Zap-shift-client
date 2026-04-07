import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home/Home/Home";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import Coverage from "../pages/Coverage/Coverage";
import PrivateRoute from "../routes/PrivateRoute";
import SendParcel from "../pages/SendParcel/SendParcel";
import DashboardLayout from "../layouts/DashboardLayout";
import MyParcels from "../pages/Dashboard/MyParcels/MyParcels";
import Payment from "../pages/Dashboard/Payment/Payment";
import PaymentHistory from "../pages/Dashboard/PaymentHistory/PaymentHistory";
import TrackParcel from "../pages/Dashboard/TrackParcel/TrackParcel";
import BeARider from "../pages/Dashboard/BeARider/BeARider";
import ActiveRiders from "../pages/Dashboard/ActiveRiders/ActiveRiders";
import PendingRiders from "../pages/Dashboard/PendingRiders/PendingRiders";
import MakeAdmin from "../pages/Dashboard/MakeAdmin/MakeAdmin";
import Forbidden from "../pages/Forbidden";
import AdminRoutes from "../routes/AdminRoutes";
import RiderRoutes from "../routes/RiderRoutes";
import AssignRider from "../pages/Dashboard/AssignRider/AssignRider";
import PendingDeliveries from "../pages/Dashboard/PendingDeliveries/PendingDeliveries";
import CompletedDeliveries from "../pages/Dashboard/CompletedDeliveries/CompletedDeliveries";
// import Profile from "../pages/Dashboard/Profile/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "coverage",
        Component: Coverage,
        loader: () => fetch("./serviceCenters.json"),
      },
      {
        path: "forbidden",
        Component: Forbidden,
      },
      {
        path: "beARider",
        element: (
          <PrivateRoute>
            <BeARider />
          </PrivateRoute>
        ),
        loader: () => fetch("./serviceCenters.json"),
      },
      {
        path: "sendParcel",
        element: (
          <PrivateRoute>
            <SendParcel />
          </PrivateRoute>
        ),
        loader: () => fetch("./serviceCenters.json"),
      },
    ],
  },
  {
    path: "/",
    Component: AuthLayout,
    children: [
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        Component: MyParcels,
      },
      {
        path: "myParcels",
        Component: MyParcels,
      },
      {
        path: "payment/:parcelId",
        Component: Payment,
      },
      {
        path: "paymentHistory",
        Component: PaymentHistory,
      },
      {
        path: "track",
        Component: TrackParcel,
      },
      {
        path: "be-a-rider",
        element: <BeARider />,
        loader: () => fetch("./serviceCenters.json"),
      },
      {
        path: "pending-deliveries",
        element: (
          <RiderRoutes>
            <PendingDeliveries />
          </RiderRoutes>
        ),
      },
      {
        path: "completed-deliveries",
        element: (
          <RiderRoutes>
            <CompletedDeliveries />
          </RiderRoutes>
        ),
      },
      {
        path: "activeRiders",
        element: (
          <AdminRoutes>
            <ActiveRiders />
          </AdminRoutes>
        ),
      },
      {
        path: "assign-rider",
        element: (
          <AdminRoutes>
            <AssignRider />
          </AdminRoutes>
        ),
      },
      {
        path: "pendingRiders",
        element: (
          <AdminRoutes>
            <PendingRiders />
          </AdminRoutes>
        ),
      },
      {
        path: "make-admin",
        element: (
          <AdminRoutes>
            <MakeAdmin />
          </AdminRoutes>
        ),
      },
      // Uncomment when Profile page is ready
      // {
      //   path: "profile",
      //   Component: Profile,
      // },
    ],
  },
]);
