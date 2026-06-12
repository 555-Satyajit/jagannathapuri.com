import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {/* Add padding top to account for the fixed header */}
      <div className="pt-[104px] md:pt-[120px] flex-1">
        {children}
      </div>
      <Footer />
    </>
  );
}
