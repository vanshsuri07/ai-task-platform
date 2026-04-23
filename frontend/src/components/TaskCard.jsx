import React from 'react';
import { FileText, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const TaskCard = ({ task }) => {
  if (!task) return null;

  return (
    <Link to={`/tasks/${task._id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 overflow-hidden group h-full flex flex-col cursor-pointer">
        {/* Header element with subtle gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-slate-800 line-clamp-1 flex-1 pr-4" title={task.title}>
              {task.title}
            </h3>
            <div className="flex-shrink-0">
              <StatusBadge status={task.status} />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-2">
              <Settings size={14} className="text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Operation: {task.operation}
              </span>
            </div>
            <div className="relative">
              <div className="absolute top-1 left-0">
                <FileText size={14} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 pl-5 italic line-clamp-2 border-l-2 border-indigo-200 ml-1">
                "{task.input}"
              </p>
            </div>
          </div>

          <div className="flex items-center pt-4 border-t border-slate-100 mt-4 justify-between h-6">
             <div className="text-xs text-slate-400">
               {new Date(task.createdAt).toLocaleString()}
             </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-sm font-medium text-indigo-600">
              Details <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TaskCard;
