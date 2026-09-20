"use client";

import { useMemo, useState } from "react";

const communities = [
  {
    id: 1,
    name: "AI & Machine Learning",
    description:
      "Discuss artificial intelligence, machine learning, LLMs, and the future of intelligent applications.",
    members: "2.4K",
    category: "AI",
  },
  {
    id: 2,
    name: "Python Developers",
    description:
      "Learn Python, share projects, solve problems, and help other developers improve their skills.",
    members: "1.8K",
    category: "Programming",
  },
  {
    id: 3,
    name: "Data Science",
    description:
      "A community for statistics, data analysis, visualization, machine learning, and data science projects.",
    members: "1.5K",
    category: "Data",
  },
  {
    id: 4,
    name: "Web Development",
    description:
      "Build and discuss modern websites and applications using React, Next.js, JavaScript, and more.",
    members: "1.2K",
    category: "Technology",
  },
  {
    id: 5,
    name: "Creative Minds",
    description:
      "Share design ideas, creative projects, digital art, UI concepts, and inspiration.",
    members: "940",
    category: "Design",
  },
  {
    id: 6,
    name: "Student Hub",
    description:
      "Connect with students, share learning resources, projects, career advice, and study ideas.",
    members: "2.1K",
    category: "Education",
  },
];

const categories = [
  "All",
  "AI",
  "Programming",
  "Data",
  "Technology",
  "Design",
  "Education",
];

export default function CommunitiesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [joined, setJoined] = useState<number[]>([]);

  const filteredCommunities = useMemo(() => {
    return communities.filter((community) => {
      const matchesCategory =
        category === "All" || community.category === category;

      const text = search.toLowerCase();

      const matchesSearch =
        community.name.toLowerCase().includes(text) ||
        community.description.toLowerCase().includes(text) ||
        community.category.toLowerCase().includes(text);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  function toggleJoin(id: number) {
    setJoined((current) =>
      current.includes(id)
        ? current.filter((communityId) => communityId !== id)
        : [...current, id]
    );
  }

  return (
    <main className="min-h-full bg-black px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-cyan-400">
            helpS Community
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Communities
          </h1>

          <p className="mt-2 max-w-2xl text-gray-400">
            Find people with similar interests, join discussions,
            share knowledge, and build together.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-[#10131d] px-5 py-4 text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400"
          />
        </div>

        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                category === item
                  ? "bg-cyan-400 text-black"
                  : "border border-gray-800 bg-[#10131d] text-gray-300 hover:border-cyan-400 hover:text-cyan-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Community Banner */}
        <section className="mb-10 rounded-2xl border border-gray-800 bg-gradient-to-r from-[#101827] to-[#11121c] p-7">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                COMMUNITY
              </span>

              <h2 className="mt-4 text-2xl font-bold">
                Connect. Create. Collaborate.
              </h2>

              <p className="mt-2 max-w-2xl text-gray-400">
                helpS communities are spaces where people can
                learn, discuss ideas, and build projects together.
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-black/20 px-6 py-5 text-center">
              <p className="text-3xl font-bold">
                {communities.length}
              </p>

              <p className="text-sm text-gray-500">
                Communities
              </p>
            </div>
          </div>
        </section>

        {/* Results Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Discover Communities
          </h2>

          <span className="text-sm text-gray-500">
            {filteredCommunities.length} results
          </span>
        </div>

        {/* Empty State */}
        {filteredCommunities.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-[#10131d] p-12 text-center">
            <h3 className="text-lg font-semibold">
              No communities found
            </h3>

            <p className="mt-2 text-gray-500">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCommunities.map((community) => {
              const isJoined = joined.includes(community.id);

              return (
                <article
                  key={community.id}
                  className="rounded-2xl border border-gray-800 bg-[#10131d] p-6 transition hover:-translate-y-1 hover:border-cyan-400/50"
                >
                  {/* Icon */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-xl">
                      {community.category === "AI"
                        ? "🤖"
                        : community.category === "Programming"
                        ? "💻"
                        : community.category === "Data"
                        ? "📊"
                        : community.category === "Technology"
                        ? "⚡"
                        : community.category === "Design"
                        ? "🎨"
                        : "🎓"}
                    </div>

                    <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">
                      {community.category}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-semibold">
                    {community.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-gray-400">
                    {community.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-5">
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        {community.members}
                      </p>

                      <p className="text-xs text-gray-500">
                        Members
                      </p>
                    </div>

                    <button
                      onClick={() => toggleJoin(community.id)}
                      className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                        isJoined
                          ? "border border-cyan-400 bg-transparent text-cyan-400"
                          : "bg-cyan-400 text-black hover:bg-cyan-300"
                      }`}
                    >
                      {isJoined ? "Joined ✓" : "Join"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* My Communities */}
        {joined.length > 0 && (
          <section className="mt-10 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">
            <h2 className="text-lg font-semibold">
              Your Communities
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              You have joined {joined.length}{" "}
              {joined.length === 1
                ? "community"
                : "communities"}
              .
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
