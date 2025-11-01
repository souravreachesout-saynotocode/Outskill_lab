function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-cyan-200 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-16 drop-shadow-lg tracking-tight">
          Welcome to My Task Manager
        </h1>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button className="w-full sm:w-48 px-8 py-4 bg-white text-sky-600 rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 hover:bg-sky-50">
            Login
          </button>

          <button className="w-full sm:w-48 px-8 py-4 bg-white text-sky-600 rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 hover:bg-sky-50">
            Signup
          </button>

          <button className="w-full sm:w-48 px-8 py-4 bg-white text-sky-600 rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 hover:bg-sky-50">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
