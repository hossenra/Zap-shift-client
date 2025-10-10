import { Outlet } from "react-router";
import authImg from "../../src/assets/authImage.png";
import ProFastLogo from "../pages/shared/ProfastLogo/ProfastLogo";

const AuthLayout = () => {
  return (
    <div className="p-12 bg-base-200 ">
      <div>
        <ProFastLogo />
      </div>
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="flex-1">
          <img src={authImg} className="max-w-sm rounded-lg shadow-2xl" />
        </div>
        <div className="flex-1">
          <Outlet></Outlet>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
