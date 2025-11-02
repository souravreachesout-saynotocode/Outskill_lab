import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [tasks, setTasks] = useState([
    'Finish homework',
    'Call John',
    'Buy groceries'
  ]);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-cyan-200 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-cyan-200 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-12 text-center drop-shadow-lg tracking-tight">
          Your Tasks
        </h1>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <ul className="space-y-4 mb-8">
            {tasks.map((task, index) => (
              <li key={index} className="text-gray-700 text-lg flex items-start">
                <span className="font-semibold mr-3">{index + 1}.</span>
                <span>{task}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label htmlFor="newTask" className="block text-gray-700 text-lg font-semibold mb-2">
                New Task
              </label>
              <input
                type="text"
                id="newTask"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 transition-colors text-gray-700"
                placeholder="Enter a new task"
              />
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 bg-sky-600 text-white rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl hover:bg-sky-700 transition-all duration-200"
            >
              Add Task
            </button>
          </form>
        </div>

        <button
          onClick={handleLogout}
          className="w-full max-w-md mx-auto block px-8 py-4 bg-white text-sky-600 rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl hover:bg-sky-50 transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
