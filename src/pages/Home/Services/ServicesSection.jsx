import {
  FaShippingFast,
  FaTruck,
  FaWarehouse,
  FaMoneyBillWave,
  FaBuilding,
  FaExchangeAlt,
} from "react-icons/fa";

const ServicesSection = () => {
  const servicesData = [
    {
      title: "Express & Standard Delivery",
      description:
        "We deliver parcels within 24–72 hours in Dhaka, Chittagong, Sylhet, Khulna, and Rajshahi. Express delivery available in Dhaka within 4–6 hours from pick-up to drop-off.",
      icon: <FaShippingFast className="text-4xl" />,
    },
    {
      title: "Nationwide Delivery",
      description:
        "We deliver parcels nationwide with home delivery in every district, ensuring your products reach customers within 48–72 hours.",
      icon: <FaTruck className="text-4xl" />,
    },
    {
      title: "Fulfillment Solution",
      description:
        "We also offer customized service with inventory management support, online order processing, packaging, and after sales support.",
      icon: <FaWarehouse className="text-4xl" />,
    },
    {
      title: "Cash on Home Delivery",
      description:
        "100% cash on delivery anywhere in Bangladesh with guaranteed safety of your product.",
      icon: <FaMoneyBillWave className="text-4xl" />,
    },
    {
      title: "Corporate Service / Contract In Logistics",
      description:
        "Customized corporate services which includes warehouse and inventory management support.",
      icon: <FaBuilding className="text-4xl" />,
    },
    {
      title: "Parcel Return",
      description:
        "Through our reverse logistics facility we allow end customers to return or exchange their products with online business merchants.",
      icon: <FaExchangeAlt className="text-4xl" />,
    },
  ];

  return (
    <section className="py-16 bg-base-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Our Services</h2>
          <p className="text-lg max-w-2xl mx-auto">
            Enjoy fast, reliable parcel delivery with real-time tracking and
            zero hassle. From personal packages to business shipments — we
            deliver on time, every time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <div
              key={index}
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 h-full"
            >
              <div className="card-body items-center text-center">
                <div className="text-primary mb-4">{service.icon}</div>
                <h3 className="card-title text-xl mb-2">{service.title}</h3>
                <p className="text-base-content/70">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
