import React, { useState } from 'react';
import { Save, X, Settings2, FileText, Type } from 'lucide-react';
import api from '../api/axios';

const TaskForm = ({ onTaskCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    input: '',
    operation: 'uppercase',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Create task
      const createResponse = await api.post('/tasks', formData);
      const newTaskId = createResponse.data._id;

      // 2. Queue the task
      await api.post(`/tasks/${newTaskId}/run`);
      
      if (onTaskCreated) onTaskCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating task');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "block w-full rounded-lg border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white transition-all duration-200";
  const labelStyles = "block text-sm font-medium leading-6 text-slate-700 mb-1 flex items-center gap-1.5";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-2xl mx-auto">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Settings2 className="text-indigo-600" />
          Configure AI Task
        </h2>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-500 transition-colors p-1 rounded-full hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {error}
            </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className={labelStyles}>
            <Type size={16} className="text-slate-400" />
            Task Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Format User Descriptions"
            className={inputStyles}
          />
        </div>

        {/* Input Text */}
        <div>
          <label htmlFor="input" className={labelStyles}>
            <FileText size={16} className="text-slate-400" />
            Input Text <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="input"
            id="input"
            required
            rows={4}
            value={formData.input}
            onChange={handleChange}
            placeholder="Enter the text for the worker to process..."
            className={`${inputStyles} font-mono text-sm resize-y`}
          />
          <p className="mt-1.5 text-xs text-slate-500">The string that will be processed by the worker.</p>
        </div>

        {/* Operation */}
        <div>
          <label htmlFor="operation" className={labelStyles}>
            <Settings2 size={16} className="text-slate-400" />
            Operation
          </label>
          <div className="relative">
            <select
              name="operation"
              id="operation"
              value={formData.operation}
              onChange={handleChange}
              className={`${inputStyles} appearance-none cursor-pointer pr-10`}
            >
              <option value="uppercase">Uppercase</option>
              <option value="lowercase">Lowercase</option>
              <option value="reverse">Reverse</option>
              <option value="word count">Word Count</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={16} className="mr-2" />
            {isLoading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
