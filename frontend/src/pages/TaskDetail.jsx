/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { Settings, FileText, ArrowLeft, Terminal, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import api from '../api/axios';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchTask = useCallback(async () => {
    try {
      const response = await api.get(`/tasks/${id}`);
      setTask(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch task details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const handleRunTask = async () => {
    try {
      setIsLoading(true);
      setActionError(null);
      await api.post(`/tasks/${id}/run`);
      await fetchTask();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to trigger task execution.');
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

    fetchTask();

    // Poll for updates if task is pending or in-progress
    const interval = setInterval(() => {
      fetchTask();
    }, 3000);

    return () => clearInterval(interval);
  }, [id, navigate, fetchTask]);

  if (isLoading && !task) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 w-full text-left">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 w-full text-left">
        <Navbar />
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
           <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
             <AlertCircle size={20} />
             {error || "Task not found."}
           </div>
           <Link to="/" className="text-indigo-600 flex items-center mt-4">
             <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 w-full text-left">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4">
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Link>
          
          {actionError && (
             <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 mb-4 border border-red-200">
               <AlertCircle size={20} className="shrink-0" />
               <span>{actionError}</span>
             </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {task.title}
                </h1>
                <div className="mt-2">
                    <StatusBadge status={task.status} />
                </div>
            </div>
            
            {(task.status === 'pending' || task.status === 'failed' || task.status === 'in-progress') && (
                <button
                    onClick={handleRunTask}
                    disabled={isLoading && task.status === 'in-progress'}
                    className={`inline-flex items-center px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                        task.status === 'in-progress' 
                        ? 'bg-amber-500 hover:bg-amber-600' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    <Play size={18} className="mr-2 fill-current" />
                    {task.status === 'in-progress' ? 'Restart Task' : 'Run Task'}
                </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content Info */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Input Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-3 flex items-center gap-2">
                <FileText size={16} className="text-indigo-500" />
                Input Source
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 font-mono text-sm text-slate-700 whitespace-pre-wrap">
                {task.input}
              </div>
            </div>

            {/* Result Section */}
            {task.status === 'completed' && task.result !== null && (
               <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <CheckCircle2 size={64} className="text-emerald-500" />
                 </div>
                 <h2 className="text-sm font-bold tracking-wider text-emerald-600 uppercase mb-3 flex items-center gap-2 relative z-10">
                   <Terminal size={16} />
                   Worker Result
                 </h2>
                 <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 font-mono text-base text-slate-800 whitespace-pre-wrap relative z-10">
                   {task.result}
                 </div>
               </div>
            )}
            
            {task.status === 'failed' && (
               <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                 <h2 className="text-sm font-bold tracking-wider text-red-600 uppercase mb-3 flex items-center gap-2">
                   <AlertCircle size={16} />
                   Execution Failed
                 </h2>
                 <p className="text-slate-600 text-sm">Please review the logs for more information on the failure.</p>
               </div>
            )}
          </div>

          {/* Sidebar / Metadata / Logs */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-4 flex items-center gap-2">
                <Settings size={16} className="text-indigo-500" />
                Metadata
              </h2>
              <div className="space-y-3">
                 <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Operation</span>
                    <span className="block text-sm font-medium text-slate-800 capitalize bg-slate-100 px-2 py-1 rounded inline-block mt-1">
                      {task.operation}
                    </span>
                 </div>
                 <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Created At</span>
                    <span className="block text-sm text-slate-600">
                      {new Date(task.createdAt).toLocaleString()}
                    </span>
                 </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-4 text-slate-300">
              <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3 flex items-center gap-2">
                <Terminal size={14} />
                Execution Logs
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
                {task.logs?.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-slate-500 shrink-0">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className={log.message.toLowerCase().includes('fail') ? 'text-red-400' : 'text-emerald-400'}>
                      {log.message}
                    </span>
                  </div>
                ))}
                {task.status !== 'completed' && task.status !== 'failed' && (
                   <div className="flex gap-2 text-indigo-400 animate-pulse">
                     <span className="shrink-0 whitespace-nowrap">... waiting for worker ...</span>
                   </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetail;
