import Image from "next/image";

export default function Logo() {
  return (
    <div className="relative z-10 flex shrink-0 items-center gap-2.5">
      <Image
        src="/xtent-logo.png"
        alt="xtent logo"
        width={40}
        height={40}
        priority
        unoptimized
        className="xtent-logo-animate block h-10 w-10 shrink-0 object-contain motion-safe:animate-[xtent-logo-zoom_0.8s_cubic-bezier(0.2,0.8,0.2,1)_both]"      />

      <span className="whitespace-nowrap text-2xl font-semibold tracking-tight text-white">
        xtent
      </span>
    </div>
  );
}