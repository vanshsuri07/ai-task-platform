import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { Plus, RefreshCw } from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    fetchTasks();
    
    // Poll every 3 seconds for live updates
    const interval = setInterval(() => {
      fetchTasks();
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleTaskCreated = () => {
    fetchTasks();
    setShowForm(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 w-full text-left">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight !m-0 !text-left">Tasks Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and assign AI processing tasks.</p>
          </div>
          
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus size={18} className="mr-1.5" />
              New Task
            </button>
          )}
        </div>

        {showForm ? (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
            <TaskForm 
              onTaskCreated={handleTaskCreated} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        ) : (
          <>
            {isLoading && tasks.length === 0 ? (
               <div className="flex items-center justify-center p-12">
                 <RefreshCw className="animate-spin text-indigo-500" size={32} />
               </div>
            ) : tasks.length === 0 ? (
               <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                  <p className="text-slate-500">No tasks found. Create one to get started!</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {tasks.map(task => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
