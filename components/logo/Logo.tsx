export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 shadow-lg">
        <span className="text-lg font-bold text-white">X</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          XtenT
        </h1>

        <p className="text-sm text-gray-400">
          Your AI. Your Space.
        </p>
      </div>
    </div>
  );
}