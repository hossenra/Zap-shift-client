import Banner from "../Banner/Banner";
import BeMerchant from "../BeMerchant/BeMerchant";
import Benefits from "../Benefits/Benefits";
import ClientLogoSlider from "../ClientLogoSlider/ClientLogoSlider";
import ServicesSection from "../Services/ServicesSection";

const Home = () => {
  return (
    <div>
      <Banner />
      <ServicesSection />
      <ClientLogoSlider />
      <Benefits />
      <BeMerchant />
    </div>
  );
};

export default Home;
