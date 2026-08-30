import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ServicesSection } from "@/components/ServicesSection";
import { DeliveryProcess } from "@/components/DeliveryProcess";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { CustomersReview } from "@/components/CustomersReview";
import { RequestShipmentForm } from "@/components/RequestShipmentForm";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#08254a] flex flex-col font-sans selection:bg-[#079447] selection:text-white">
      {/* Upper Navigation Bar */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <HeroSection />
        {/* Our Air-Powered Global Logistics Services */}
        <ServicesSection />
        {/* Delivery Process (01 - 07) */}
        <DeliveryProcess />
        {/* Why Choose Logistic Star BD */}
        <WhyChooseUs />
        {/* Customers Review */}
        <CustomersReview />
        {/* Request Shipment Form */}
        <RequestShipmentForm />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
