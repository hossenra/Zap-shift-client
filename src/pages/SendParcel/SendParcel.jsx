import { useForm } from "react-hook-form";
import { useLoaderData } from "react-router";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const generateTrackingID = () => {
  const date = new Date();
  const datePart = date.toISOString().split("T")[0].replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PCL-${datePart}-${rand}`;
};

const SendParcel = () => {
  const {
    register,
    handleSubmit,
    watch,
    // reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const serviceCenters = useLoaderData(); // [{ region, district, ...}, ...]

  // Regions & Districts (from loader)
  const uniqueRegions = [
    ...new Set((serviceCenters || []).map((w) => w.region)),
  ];
  const getDistrictsByRegion = (region) =>
    (serviceCenters || [])
      .filter((w) => w.region === region)
      .map((w) => w.district);

  // Watches
  const parcelType = watch("type");
  const senderRegion = watch("sender_region");
  const receiverRegion = watch("receiver_region");

  // Prefill sender name on mount/update (keeps your pattern)
  // If you want hard prefill, set defaultValue prop on the input as well.
  // reset({ sender_name: user?.displayName || user?.name || "" }) // optional

  // const onSubmit = (data) => {
  //   // FORM-ONLY: no cost/toast/save here per your request
  //   // You’ll wire pricing + Swal + API later.
  //   console.log("Form values:", data);
  // };

  const onSubmit = (data) => {
    const weight = parseFloat(data.weight) || 0;
    const isSameDistrict = data.sender_center === data.receiver_center;

    let baseCost = 0;
    let extraCost = 0;
    let breakdown = "";

    if (data.type === "document") {
      baseCost = isSameDistrict ? 60 : 80;
      breakdown = `Document delivery ${
        isSameDistrict ? "within" : "outside"
      } the district.`;
    } else {
      if (weight <= 3) {
        baseCost = isSameDistrict ? 110 : 150;
        breakdown = `Non-document up to 3kg ${
          isSameDistrict ? "within" : "outside"
        } the district.`;
      } else {
        const extraKg = weight - 3;
        const perKgCharge = extraKg * 40;
        const districtExtra = isSameDistrict ? 0 : 40;
        baseCost = isSameDistrict ? 110 : 150;
        extraCost = perKgCharge + districtExtra;

        breakdown = `
        Non-document over 3kg ${
          isSameDistrict ? "within" : "outside"
        } the district.<br/>
        Extra charge: ৳40 x ${extraKg.toFixed(1)}kg = ৳${perKgCharge}<br/>
        ${districtExtra ? "+ ৳40 extra for outside district delivery" : ""}
      `;
      }
    }

    const totalCost = baseCost + extraCost;

    Swal.fire({
      title: "Delivery Cost Breakdown",
      icon: "info",
      html: `
      <div class="text-left text-base space-y-2">
        <p><strong>Parcel Type:</strong> ${data.type}</p>
        <p><strong>Weight:</strong> ${weight} kg</p>
        <p><strong>Delivery Zone:</strong> ${
          isSameDistrict ? "Within Same District" : "Outside District"
        }</p>
        <hr class="my-2"/>
        <p><strong>Base Cost:</strong> ৳${baseCost}</p>
        ${
          extraCost > 0
            ? `<p><strong>Extra Charges:</strong> ৳${extraCost}</p>`
            : ""
        }
        <div class="text-gray-500 text-sm">${breakdown}</div>
        <hr class="my-2"/>
        <p class="text-xl font-bold text-green-600">Total Cost: ৳${totalCost}</p>
      </div>
    `,
      showDenyButton: true,
      confirmButtonText: "💳 Proceed to Payment",
      denyButtonText: "✏️ Continue Editing",
      confirmButtonColor: "#16a34a",
      denyButtonColor: "#d3d3d3",
      customClass: {
        popup: "rounded-xl shadow-md px-6 py-6",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const parcelData = {
          ...data,
          cost: totalCost,
          created_by: user.email,
          payment_status: "unpaid",
          delivery_status: "not_collected",
          creation_date: new Date().toISOString(),
          tracking_id: generateTrackingID(),
        };

        console.log("Ready for payment:", parcelData);

        axiosSecure.post("/parcels", parcelData).then((res) => {
          console.log(res.data);
          if (res.data.insertedId) {
            // TODO: redirect to a payment page
            Swal.fire({
              title: "Redirecting...",
              text: "Proceeding to payment gateway.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
          }
        });
      }
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold">Send a Parcel</h2>
          <p className="text-gray-500">
            Door to door — fill in pickup & delivery details
          </p>
        </div>

        {/* Parcel Info */}
        <div className="border p-4 rounded-xl shadow-md space-y-4">
          <h3 className="font-semibold text-xl">Parcel Info</h3>

          {/* Parcel Name */}
          <div>
            <label className="label">Parcel Title</label>
            <input
              {...register("title", { required: "Parcel title is required" })}
              className="input input-bordered w-full"
              placeholder="Describe your parcel"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="label">Type</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="document"
                  {...register("type", { required: "Type is required" })}
                  className="radio"
                />
                Document
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="non-document"
                  {...register("type", { required: "Type is required" })}
                  className="radio"
                />
                Non-Document
              </label>
            </div>
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
          </div>

          {/* Weight (only if non-document) */}
          <div>
            <label className="label">
              Weight (kg)
              {parcelType === "non-document" && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <input
              type="number"
              step="0.1"
              {...register("weight", {
                validate: (v) => {
                  if (parcelType !== "non-document") return true; // not required
                  if (v === undefined || v === null || v === "")
                    return "Weight is required for non-document";
                  const num = Number(v);
                  if (Number.isNaN(num) || num < 0)
                    return "Weight must be a positive number";
                  return true;
                },
              })}
              disabled={parcelType !== "non-document"}
              className={`input input-bordered w-full ${
                parcelType !== "non-document"
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
              placeholder={
                parcelType === "non-document"
                  ? "e.g., 1.5"
                  : "Not required for documents"
              }
            />
            {errors.weight && (
              <p className="text-red-500 text-sm">{errors.weight.message}</p>
            )}
          </div>
        </div>

        {/* Sender & Receiver */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sender Info */}
          <div className="border p-4 rounded-xl shadow-md space-y-4">
            <h3 className="font-semibold text-xl">Sender Info</h3>
            <div className="grid grid-cols-1 gap-4">
              <input
                {...register("sender_name", {
                  required: "Sender name is required",
                })}
                className="input input-bordered w-full"
                placeholder="Name"
                defaultValue={user?.displayName || user?.name || ""}
              />
              {errors.sender_name && (
                <p className="text-red-500 text-sm">
                  {errors.sender_name.message}
                </p>
              )}

              <input
                {...register("sender_contact", {
                  required: "Sender contact is required",
                })}
                className="input input-bordered w-full"
                placeholder="Contact"
              />
              {errors.sender_contact && (
                <p className="text-red-500 text-sm">
                  {errors.sender_contact.message}
                </p>
              )}

              <select
                {...register("sender_region", {
                  required: "Sender region is required",
                })}
                className="select select-bordered w-full"
                defaultValue=""
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
              {errors.sender_region && (
                <p className="text-red-500 text-sm">
                  {errors.sender_region.message}
                </p>
              )}

              <select
                {...register("sender_center", {
                  required: "Sender service center is required",
                })}
                className="select select-bordered w-full"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Service Center
                </option>
                {getDistrictsByRegion(senderRegion).map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.sender_center && (
                <p className="text-red-500 text-sm">
                  {errors.sender_center.message}
                </p>
              )}

              <input
                {...register("sender_address", {
                  required: "Sender address is required",
                })}
                className="input input-bordered w-full"
                placeholder="Address"
              />
              {errors.sender_address && (
                <p className="text-red-500 text-sm">
                  {errors.sender_address.message}
                </p>
              )}

              <textarea
                {...register("pickup_instruction", {
                  required: "Pickup instruction is required",
                })}
                className="textarea textarea-bordered w-full"
                placeholder="Pickup Instruction"
              />
              {errors.pickup_instruction && (
                <p className="text-red-500 text-sm">
                  {errors.pickup_instruction.message}
                </p>
              )}
            </div>
          </div>

          {/* Receiver Info */}
          <div className="border p-4 rounded-xl shadow-md space-y-4">
            <h3 className="font-semibold text-xl">Receiver Info</h3>
            <div className="grid grid-cols-1 gap-4">
              <input
                {...register("receiver_name", {
                  required: "Receiver name is required",
                })}
                className="input input-bordered w-full"
                placeholder="Name"
              />
              {errors.receiver_name && (
                <p className="text-red-500 text-sm">
                  {errors.receiver_name.message}
                </p>
              )}

              <input
                {...register("receiver_contact", {
                  required: "Receiver contact is required",
                })}
                className="input input-bordered w-full"
                placeholder="Contact"
              />
              {errors.receiver_contact && (
                <p className="text-red-500 text-sm">
                  {errors.receiver_contact.message}
                </p>
              )}

              <select
                {...register("receiver_region", {
                  required: "Receiver region is required",
                })}
                className="select select-bordered w-full"
                defaultValue=""
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
              {errors.receiver_region && (
                <p className="text-red-500 text-sm">
                  {errors.receiver_region.message}
                </p>
              )}

              <select
                {...register("receiver_center", {
                  required: "Receiver service center is required",
                })}
                className="select select-bordered w-full"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Service Center
                </option>
                {getDistrictsByRegion(receiverRegion).map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.receiver_center && (
                <p className="text-red-500 text-sm">
                  {errors.receiver_center.message}
                </p>
              )}

              <input
                {...register("receiver_address", {
                  required: "Receiver address is required",
                })}
                className="input input-bordered w-full"
                placeholder="Address"
              />
              {errors.receiver_address && (
                <p className="text-red-500 text-sm">
                  {errors.receiver_address.message}
                </p>
              )}

              <textarea
                {...register("delivery_instruction", {
                  required: "Delivery instruction is required",
                })}
                className="textarea textarea-bordered w-full"
                placeholder="Delivery Instruction"
              />
              {errors.delivery_instruction && (
                <p className="text-red-500 text-sm">
                  {errors.delivery_instruction.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            className={`btn btn-primary text-black ${
              isSubmitting ? "loading" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendParcel;
