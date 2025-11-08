import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  created_at: string;
}

interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [subtasks, setSubtasks] = useState<Record<string, Subtask[]>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string[]>>({});
  const [generatingSubtasks, setGeneratingSubtasks] = useState<Record<string, boolean>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchAllSubtasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: newTask.trim(),
            priority: newPriority,
            status: 'pending',
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTasks([data, ...tasks]);
      setNewTask('');
      setNewPriority('medium');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: 'pending' | 'in-progress' | 'done') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const fetchAllSubtasks = async () => {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const subtasksByTask: Record<string, Subtask[]> = {};
      data?.forEach((subtask: Subtask) => {
        if (!subtasksByTask[subtask.task_id]) {
          subtasksByTask[subtask.task_id] = [];
        }
        subtasksByTask[subtask.task_id].push(subtask);
      });

      setSubtasks(subtasksByTask);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    }
  };

  const handleGenerateSubtasks = async (taskId: string, taskTitle: string) => {
    setGeneratingSubtasks({ ...generatingSubtasks, [taskId]: true });

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-subtasks`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate subtasks');
      }

      const data = await response.json();
      setAiSuggestions({ ...aiSuggestions, [taskId]: data.subtasks });
      setExpandedTasks({ ...expandedTasks, [taskId]: true });
    } catch (error) {
      console.error('Error generating subtasks:', error);
      alert('Failed to generate subtasks. Please try again.');
    } finally {
      setGeneratingSubtasks({ ...generatingSubtasks, [taskId]: false });
    }
  };

  const handleSaveSubtask = async (taskId: string, subtaskTitle: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert([{
          task_id: taskId,
          user_id: user.id,
          title: subtaskTitle,
          completed: false,
        }])
        .select()
        .single();

      if (error) throw error;

      setSubtasks({
        ...subtasks,
        [taskId]: [...(subtasks[taskId] || []), data],
      });

      setAiSuggestions({
        ...aiSuggestions,
        [taskId]: aiSuggestions[taskId].filter(s => s !== subtaskTitle),
      });
    } catch (error) {
      console.error('Error saving subtask:', error);
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .update({ completed: !completed, updated_at: new Date().toISOString() })
        .eq('id', subtaskId);

      if (error) throw error;

      setSubtasks({
        ...subtasks,
        [taskId]: subtasks[taskId].map(st =>
          st.id === subtaskId ? { ...st, completed: !completed } : st
        ),
      });
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;

      setSubtasks({
        ...subtasks,
        [taskId]: subtasks[taskId].filter(st => st.id !== subtaskId),
      });
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading || loadingTasks) {
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
          <form onSubmit={handleAddTask} className="space-y-4 mb-8 pb-8 border-b-2 border-gray-200">
            <div>
              <label htmlFor="newTask" className="block text-gray-700 text-lg font-semibold mb-2">
                Task Title
              </label>
              <input
                type="text"
                id="newTask"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 transition-colors text-gray-700"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-gray-700 text-lg font-semibold mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 transition-colors text-gray-700"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 bg-sky-600 text-white rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl hover:bg-sky-700 transition-all duration-200"
            >
              Add Task
            </button>
          </form>

          {tasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No tasks yet. Create your first task above!
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 flex-1">{task.title}</h3>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 ml-2 px-2"
                      title="Delete task"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(task.status)}`}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'pending')}
                      disabled={task.status === 'pending'}
                      className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'in-progress')}
                      disabled={task.status === 'in-progress'}
                      className="px-3 py-1 text-sm bg-blue-200 hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'done')}
                      disabled={task.status === 'done'}
                      className="px-3 py-1 text-sm bg-green-200 hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      Done
                    </button>
                  </div>

                  <button
                    onClick={() => handleGenerateSubtasks(task.id, task.title)}
                    disabled={generatingSubtasks[task.id]}
                    className="w-full px-4 py-2 bg-sky-100 text-sky-700 rounded-lg font-semibold hover:bg-sky-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                  >
                    {generatingSubtasks[task.id] ? 'Generating...' : 'Generate Subtasks with AI'}
                  </button>

                  {aiSuggestions[task.id] && aiSuggestions[task.id].length > 0 && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Suggestions:</h4>
                      <ul className="space-y-2">
                        {aiSuggestions[task.id].map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="flex-1 text-sm text-gray-700">{suggestion}</span>
                            <button
                              onClick={() => handleSaveSubtask(task.id, suggestion)}
                              className="px-2 py-1 text-xs bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
                            >
                              Save
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {subtasks[task.id] && subtasks[task.id].length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Subtasks:</h4>
                      <ul className="space-y-2">
                        {subtasks[task.id].map((subtask) => (
                          <li key={subtask.id} className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() => handleToggleSubtask(task.id, subtask.id, subtask.completed)}
                              className="mt-1 cursor-pointer"
                            />
                            <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {subtask.title}
                            </span>
                            <button
                              onClick={() => handleDeleteSubtask(task.id, subtask.id)}
                              className="text-red-500 hover:text-red-700 text-xs px-1"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
