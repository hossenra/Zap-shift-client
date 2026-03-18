import { FiLock, FiArrowLeft, FiHome } from "react-icons/fi";
import { Link } from "react-router";

const Forbidden = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-base-300 bg-base-100 p-8 text-center shadow-xl md:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
          <FiLock className="text-4xl text-error" />
        </div>

        <h1 className="mt-6 text-3xl font-bold md:text-4xl">403 Forbidden</h1>

        <p className="mt-3 text-base-content/70">
          You do not have permission to access this page.
        </p>

        <p className="mt-2 text-sm text-base-content/60">
          This area is restricted based on your account role. Please go back or
          return to the home page.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="btn btn-primary text-black">
            <FiHome className="text-lg" />
            Go Home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn btn-outline"
          >
            <FiArrowLeft className="text-lg" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
