import React from 'react';
import { ClientRequest } from '../types';

interface ClientRequestCardProps {
  request: ClientRequest;
  onEdit: (request: ClientRequest) => void;
  onDelete: (requestId: string) => void;
}

export const ClientRequestCard: React.FC<ClientRequestCardProps> = ({ request, onEdit, onDelete }) => {
    
    const getPriorityClass = () => {
        switch(request.priority) {
            case 'High': return 'bg-red-500/30 text-red-300';
            case 'Medium': return 'bg-yellow-500/30 text-yellow-300';
            case 'Low': return 'bg-green-500/30 text-green-300';
            default: return 'bg-slate-500/30 text-slate-300';
        }
    }
    
    const isOverdue = new Date(request.dueDate) < new Date() && request.status !== 'Completed';

  return (
    <div
      id={request.id}
      draggable
      className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 cursor-grab active:cursor-grabbing"
    >
        <div className="flex justify-between items-start mb-2">
             <h4 className="font-bold text-slate-200">{request.clientName}</h4>
             <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityClass()}`}>{request.priority}</span>
        </div>
        <p className="text-sm text-slate-300 mb-3">{request.requestDetails}</p>
        <div className="flex justify-between items-center text-xs text-slate-400">
             <p className={`${isOverdue ? 'text-red-400 font-semibold' : ''}`}>Due: {new Date(request.dueDate).toLocaleDateString()}</p>
            <div className="space-x-2">
                <button onClick={() => onEdit(request)} className="hover:text-yellow-400 transition-colors">Edit</button>
                <button onClick={() => onDelete(request.id)} className="hover:text-red-400 transition-colors">Delete</button>
            </div>
        </div>
    </div>
  );
};