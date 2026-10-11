
import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/xtent-logo.png"
        alt="xtent logo"
        width={44}
        height={44}
        priority
        className="h-11 w-11 rounded-xl object-contain"
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          xtent
        </h1>

        <p className="text-sm text-gray-400">
          Your AI. Your Space.
        </p>
      </div>
    </div>
  );
}
