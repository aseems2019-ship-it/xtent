export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-800 px-8">
      <h2 className="text-xl font-semibold">
        Dashboard
      </h2>

      <div className="flex items-center gap-6">
        <button className="text-xl">🔍</button>
        <button className="text-xl">🔔</button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold">
          A
        </div>
      </div>
    </header>
  );
}