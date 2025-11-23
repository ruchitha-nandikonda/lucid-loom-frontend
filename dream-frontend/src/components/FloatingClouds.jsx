// src/components/FloatingClouds.jsx
export default function FloatingClouds() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-[4] overflow-hidden">
      {/* cloud 1 */}
      <div className="absolute top-24 -left-40 w-72 h-32 rounded-full bg-[#ffe5ec]/20 blur-2xl animate-cloud-slow">
        <div className="absolute -top-6 left-10 w-24 h-16 rounded-full bg-[#ffc2d1]/25 blur-xl" />
        <div className="absolute -top-4 right-6 w-20 h-14 rounded-full bg-[#ffb3c6]/22 blur-xl" />
      </div>

      {/* cloud 2 */}
      <div className="absolute top-40 right-[-120px] w-80 h-36 rounded-full bg-[#ffc2d1]/18 blur-2xl animate-cloud-fast">
        <div className="absolute -top-6 left-8 w-28 h-18 rounded-full bg-[#ffb3c6]/22 blur-xl" />
        <div className="absolute -top-3 right-10 w-24 h-16 rounded-full bg-[#ffe5ec]/20 blur-xl" />
      </div>

      {/* cloud 3 */}
      <div className="absolute bottom-20 left-[-100px] w-72 h-32 rounded-full bg-[#ffb3c6]/18 blur-2xl animate-cloud-fast" style={{ animationDelay: "8s" }}>
        <div className="absolute -top-5 left-12 w-24 h-16 rounded-full bg-[#ffe5ec]/22 blur-xl" />
        <div className="absolute -top-4 right-8 w-20 h-14 rounded-full bg-[#ffc2d1]/20 blur-xl" />
      </div>

      {/* cloud 4 (small, center-ish) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-40 h-18 rounded-full bg-[#ffe5ec]/15 blur-xl animate-cloud-slow" style={{ animationDelay: "15s" }} />
    </div>
  );
}

