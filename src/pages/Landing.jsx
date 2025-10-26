import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex flex-col items-center justify-center px-6 py-12">
      {/* Navigation Bar */}
      <nav className="w-full max-w-5xl flex justify-between items-center mb-10 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 shadow-lg">
        <h1 className="text-2xl font-bold tracking-wide">Student Portal</h1>
        <ul className="flex gap-6 text-lg font-medium">
          <li>
            <Link
              to="/students"
              className="hover:text-yellow-300 transition-colors"
            >
              Students
            </Link>
          </li>
          <li>
            <Link
              to="/subjects"
              className="hover:text-yellow-300 transition-colors"
            >
              Subjects
            </Link>
          </li>
          <li>
            <Link
              to="/grades"
              className="hover:text-yellow-300 transition-colors"
            >
              Grades
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-xl max-w-3xl text-center">
        <img
          src="./public/mypic.jpg"
          alt="Your Profile"
          className="w-36 h-36 rounded-full mx-auto mb-6 border-4 border-white shadow-lg"
        />

        <h2 className="text-3xl font-bold mb-4">John Louis J. Sancala</h2>

        <p className="text-lg leading-relaxed text-white/90">
          My IT journey started during my first year in college, where I was
          first introduced to the world of programming. At first, it felt
          challenging, but I gradually grew passionate about solving problems
          through code. Over the years, I learned how to build websites, manage
          data, and understand the importance of user experience. Now, I’m
          continuing to explore React, Tailwind, and other modern technologies
          to create beautiful and functional web applications.
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-white/70 text-sm">
        © {new Date().getFullYear()} JL J. S — All rights reserved.
      </footer>
    </div>
  );
}
