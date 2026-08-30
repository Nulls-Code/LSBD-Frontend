import Image from "next/image";

export function HeroBG() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#08254a]/95 via-[#08254a]/80 to-[#08254a]/60 z-10" />
      {/* Hero Image */}
      <Image
        src="/herobg.png"
        fill
        sizes="100vw"
        alt="Logistic Star BD Air Cargo Background"
        className="object-cover object-center opacity-40 mix-blend-luminosity"
        priority
      />
    </div>
  );
}
