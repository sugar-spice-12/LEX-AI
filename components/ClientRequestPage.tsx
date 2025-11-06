import React, { useState, useContext, useMemo } from 'react';
import { ClientRequestContext } from '../contexts/ClientRequestContext';
import { ClientRequest, RequestStatus } from '../types';
import { ClientRequestCard } from './ClientRequestCard';
import { AddEditRequestModal } from './AddEditRequestModal';
import { NewSummaryIcon } from './icons';

const RequestColumn: React.FC<{
  title: RequestStatus;
  requests: ClientRequest[];
  onDrop: (status: RequestStatus) => void;
  onEdit: (request: ClientRequest) => void;
}> = ({ title, requests, onDrop, onEdit }) => {
  const { deleteRequest } = useContext(ClientRequestContext);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={() => onDrop(title)}
      onDragOver={handleDragOver}
      className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 w-full md:w-1/3 flex-shrink-0"
    >
      <h3 className="text-lg font-semibold text-white mb-4 text-center">{title} ({requests.length})</h3>
      <div className="space-y-4 min-h-[50vh] overflow-y-auto pr-2 -mr-2">
        {requests.map(req => (
          <ClientRequestCard key={req.id} request={req} onEdit={onEdit} onDelete={() => deleteRequest(req.id)} />
        ))}
      </div>
    </div>
  );
};

export const ClientRequestPage: React.FC = () => {
  const { requests, updateRequestStatus } = useContext(ClientRequestContext);
  const [draggedRequestId, setDraggedRequestId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<ClientRequest | null>(null);

  const handleEdit = (request: ClientRequest) => {
    setRequestToEdit(request);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
      setRequestToEdit(null);
      setIsModalOpen(true);
  }

  const columns = useMemo(() => {
    const pending = requests.filter(r => r.status === 'Pending').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const inProgress = requests.filter(r => r.status === 'In Progress').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const completed = requests.filter(r => r.status === 'Completed').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { 'Pending': pending, 'In Progress': inProgress, 'Completed': completed };
  }, [requests]);

  const handleDrop = (newStatus: RequestStatus) => {
    if (draggedRequestId) {
      updateRequestStatus(draggedRequestId, newStatus);
      setDraggedRequestId(null);
    }
  };
  
  // Set the dragged item's ID in a global state that onDrop can access
  // This is a workaround for the fact that dataTransfer is sometimes restricted.
  const handleDragStart = (id: string) => {
      setDraggedRequestId(id);
  }

  return (
    <>
      <div className="container mx-auto p-4 md:p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Client Requests</h2>
            <p className="mt-2 text-lg text-slate-400">Manage your client tasks and workflow.</p>
          </div>
          <button onClick={handleAddNew} className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-slate-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-slate-900 transition-colors">
            <NewSummaryIcon /> New Request
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6" onDragStart={(e) => handleDragStart((e.target as HTMLElement).id)}>
          <RequestColumn title="Pending" requests={columns['Pending']} onDrop={handleDrop} onEdit={handleEdit} />
          <RequestColumn title="In Progress" requests={columns['In Progress']} onDrop={handleDrop} onEdit={handleEdit} />
          <RequestColumn title="Completed" requests={columns['Completed']} onDrop={handleDrop} onEdit={handleEdit} />
        </div>
      </div>
      
      <AddEditRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestToEdit={requestToEdit}
      />
    </>
  );
};