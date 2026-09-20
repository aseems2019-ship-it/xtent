"use client";

import { useState } from "react";

const categories = [
  "All",
  "AI",
  "Technology",
  "Design",
  "Data Science",
  "Programming",
];

const posts = [
  {
    id: 1,
    title: "Building with AI",
    description:
      "Explore how AI can be used to create useful applications, automate tasks, and solve real-world problems.",
    category: "AI",
    author: "XtenT Community",
    likes: 124,
  },
  {
    id: 2,
    title: "Modern Web Development",
    description:
      "Discover ideas, tools, and techniques for building modern web applications with Next.js and React.",
    category: "Technology",
    author: "XtenT Developers",
    likes: 98,
  },
  {
    id: 3,
    title: "Data Science Projects",
    description:
      "Share projects, datasets, visualizations, and machine-learning ideas with the XtenT community.",
    category: "Data Science",
    author: "Data Community",
    likes: 86,
  },
  {
    id: 4,
    title: "Creative Design",
    description:
      "Explore creative ideas for interfaces, graphics, products, and digital experiences.",
    category: "Design",
    author: "XtenT Creators",
    likes: 73,
  },
  {
    id: 5,
    title: "Learn Python",
    description:
      "Beginner-friendly programming ideas, Python projects, and useful development resources.",
    category: "Programming",
    author: "Python Community",
    likes: 112,
  },
  {
    id: 6,
    title: "The Future of AI",
    description:
      "Discuss emerging AI technologies and how they may change the way we work and create.",
    category: "AI",
    author: "XtenT AI",
    likes: 156,
  },
];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" ||
      post.category === selectedCategory;

    const searchText = search.toLowerCase();

    const matchesSearch =
      post.title.toLowerCase().includes(searchText) ||
      post.description.toLowerCase().includes(searchText) ||
      post.category.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-full bg-black px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-cyan-400">
            Discover XtenT
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Explore
          </h1>

          <p className="mt-2 max-w-2xl text-gray-400">
            Discover ideas, projects, creators, technology, and
            AI-powered content from the XtenT community.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search Explore..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-[#10131d] px-5 py-4 text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400"
          />
        </div>

        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-cyan-400 text-black"
                  : "border border-gray-800 bg-[#10131d] text-gray-300 hover:border-cyan-400 hover:text-cyan-400"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured section */}
        <section className="mb-10 rounded-2xl border border-gray-800 bg-gradient-to-r from-[#101827] to-[#11121c] p-7">
          <div className="max-w-3xl">
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
              FEATURED
            </span>

            <h2 className="mt-4 text-2xl font-bold">
              Your AI. Your Space.
            </h2>

            <p className="mt-2 text-gray-400">
              XtenT brings AI, creativity, productivity, and
              community into one workspace.
            </p>

            <button
              onClick={() => setSelectedCategory("AI")}
              className="mt-5 rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-black transition hover:bg-cyan-300"
            >
              Explore AI
            </button>
          </div>
        </section>

        {/* Results */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Discover
          </h2>

          <span className="text-sm text-gray-500">
            {filteredPosts.length} results
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-[#10131d] p-12 text-center">
            <h3 className="text-lg font-semibold">
              No results found
            </h3>

            <p className="mt-2 text-gray-500">
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group rounded-2xl border border-gray-800 bg-[#10131d] p-6 transition hover:-translate-y-1 hover:border-cyan-400/50"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-400">
                    {post.category}
                  </span>

                  <span className="text-sm text-gray-500">
                    ♥ {post.likes}
                  </span>
                </div>

                <h3 className="text-xl font-semibold">
                  {post.title}
                </h3>

                <p className="mt-3 min-h-[72px] text-sm leading-6 text-gray-400">
                  {post.description}
                </p>

                <div className="mt-6 border-t border-gray-800 pt-4">
                  <p className="text-sm text-gray-500">
                    By{" "}
                    <span className="text-gray-300">
                      {post.author}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}