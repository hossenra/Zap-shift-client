import { useForm } from "react-hook-form";
import { useLoaderData } from "react-router";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const BeARider = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  // const navigate = useNavigate();

  const serviceCenters = useLoaderData();

  const uniqueRegions = [
    ...new Set((serviceCenters || []).map((center) => center.region)),
  ];

  const getDistrictsByRegion = (region) => [
    ...new Set(
      (serviceCenters || [])
        .filter((center) => center.region === region)
        .map((center) => center.district),
    ),
  ];

  const selectedRegion = watch("region");

  const onSubmit = async (data) => {
    const riderData = {
      ...data,
      name: user?.displayName || user?.name || "",
      email: user?.email || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    try {
      const res = await axiosSecure.post("/riders", riderData);

      if (res.data?.insertedId || res.data?.acknowledged) {
        Swal.fire({
          icon: "success",
          title: "Application Submitted",
          text: "Your rider application is pending approval.",
          confirmButtonColor: "#16a34a",
        });
        // navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text:
          error?.response?.data?.message ||
          "Something went wrong while submitting your application.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-base-100 border border-base-200 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/15 via-secondary/10 to-accent/15 px-6 md:px-10 py-10 border-b border-base-200">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-base-content">
              Apply to Be a Rider
            </h2>
            <p className="text-center text-base-content/70 mt-3 max-w-2xl mx-auto">
              Join our delivery team and start delivering parcels in your area.
              Fill up the application form below carefully.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 md:p-10 space-y-8"
          >
            {/* Personal Information */}
            <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-5 md:p-6">
              <h3 className="text-xl font-bold mb-5 border-l-4 border-primary pl-3">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label font-semibold">Full Name</label>
                  <input
                    type="text"
                    readOnly
                    defaultValue={user?.displayName || user?.name || ""}
                    {...register("name")}
                    className="input input-bordered w-full bg-base-200 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="label font-semibold">Email Address</label>
                  <input
                    type="email"
                    readOnly
                    defaultValue={user?.email || ""}
                    {...register("email")}
                    className="input input-bordered w-full bg-base-200 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="label font-semibold">Age</label>
                  <input
                    type="number"
                    placeholder="Enter your age"
                    {...register("age", {
                      required: "Age is required",
                      min: { value: 18, message: "Minimum age is 18" },
                    })}
                    className="input input-bordered w-full"
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.age.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label font-semibold">Phone Number</label>
                  <input
                    type="text"
                    placeholder="Enter your phone number"
                    {...register("phone", {
                      required: "Phone number is required",
                    })}
                    className="input input-bordered w-full"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label font-semibold">
                    National ID Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your NID number"
                    {...register("national_id", {
                      required: "National ID card number is required",
                    })}
                    className="input input-bordered w-full"
                  />
                  {errors.national_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.national_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label font-semibold">Date of Birth</label>
                  <input
                    type="date"
                    {...register("date_of_birth", {
                      required: "Date of birth is required",
                    })}
                    className="input input-bordered w-full"
                  />
                  {errors.date_of_birth && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.date_of_birth.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-5 md:p-6">
              <h3 className="text-xl font-bold mb-5 border-l-4 border-primary pl-3">
                Location Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label font-semibold">Region</label>
                  <select
                    {...register("region", {
                      required: "Region is required",
                    })}
                    defaultValue=""
                    className="select select-bordered w-full"
                  >
                    <option value="" disabled>
                      Select Region
                    </option>
                    {uniqueRegions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  {errors.region && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.region.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label font-semibold">District</label>
                  <select
                    {...register("district", {
                      required: "District is required",
                    })}
                    defaultValue=""
                    className="select select-bordered w-full"
                  >
                    <option value="" disabled>
                      Select District
                    </option>
                    {getDistrictsByRegion(selectedRegion).map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.district.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="label font-semibold">Full Address</label>
                  <textarea
                    placeholder="Enter your full address"
                    {...register("address", {
                      required: "Address is required",
                    })}
                    className="textarea textarea-bordered w-full min-h-[110px]"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-5 md:p-6">
              <h3 className="text-xl font-bold mb-5 border-l-4 border-primary pl-3">
                Vehicle Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label font-semibold">Bike Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Honda, Yamaha"
                    {...register("bike_brand", {
                      required: "Bike brand is required",
                    })}
                    className="input input-bordered w-full"
                  />
                  {errors.bike_brand && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.bike_brand.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label font-semibold">
                    Bike Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter bike registration number"
                    {...register("bike_registration_number", {
                      required: "Bike registration number is required",
                    })}
                    className="input input-bordered w-full"
                  />
                  {errors.bike_registration_number && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.bike_registration_number.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label font-semibold">
                    Driving License Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter driving license number"
                    {...register("driving_license", {
                      required: "Driving license number is required",
                    })}
                    className="input input-bordered w-full"
                  />
                  {errors.driving_license && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.driving_license.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label font-semibold">
                    Years of Riding Experience
                  </label>
                  <input
                    type="number"
                    placeholder="Enter experience in years"
                    {...register("experience", {
                      required: "Riding experience is required",
                    })}
                    className="input input-bordered w-full"
                  />
                  {errors.experience && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.experience.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-5 md:p-6">
              <h3 className="text-xl font-bold mb-5 border-l-4 border-primary pl-3">
                Additional Information
              </h3>

              <div>
                <label className="label font-semibold">
                  Why do you want to join as a rider?
                </label>
                <textarea
                  placeholder="Write a short message..."
                  {...register("motivation", {
                    required: "This field is required",
                  })}
                  className="textarea textarea-bordered w-full min-h-[130px]"
                />
                {errors.motivation && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.motivation.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn btn-primary px-10 text-black font-bold ${
                  isSubmitting ? "loading" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BeARider;
