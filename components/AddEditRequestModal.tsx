import React, { useState, useContext, useEffect } from 'react';
import { ClientRequest, RequestPriority } from '../types';
import { ClientRequestContext } from '../contexts/ClientRequestContext';

interface AddEditRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestToEdit: ClientRequest | null;
}

const today = new Date().toISOString().split('T')[0];

export const AddEditRequestModal: React.FC<AddEditRequestModalProps> = ({ isOpen, onClose, requestToEdit }) => {
    const { addRequest, updateRequest } = useContext(ClientRequestContext);
    
    const [clientName, setClientName] = useState('');
    const [requestDetails, setRequestDetails] = useState('');
    const [priority, setPriority] = useState<RequestPriority>('Medium');
    const [dueDate, setDueDate] = useState(today);

    useEffect(() => {
        if (requestToEdit) {
            setClientName(requestToEdit.clientName);
            setRequestDetails(requestToEdit.requestDetails);
            setPriority(requestToEdit.priority);
            setDueDate(requestToEdit.dueDate);
        } else {
            // Reset form for new request
            setClientName('');
            setRequestDetails('');
            setPriority('Medium');
            setDueDate(today);
        }
    }, [requestToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName.trim() || !requestDetails.trim()) return;

        if (requestToEdit) {
            updateRequest({ ...requestToEdit, clientName, requestDetails, priority, dueDate });
        } else {
            addRequest({ clientName, requestDetails, priority, dueDate });
        }
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <header className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h2 className="text-lg font-semibold text-white">{requestToEdit ? 'Edit Request' : 'Add New Request'}</h2>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </header>
                    <main className="p-6 space-y-4">
                        <div>
                            <label htmlFor="clientName" className="block text-sm font-medium text-slate-300 mb-1">Client Name</label>
                            <input type="text" id="clientName" value={clientName} onChange={e => setClientName(e.target.value)} required className="w-full bg-slate-900/50 border border-slate-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label htmlFor="requestDetails" className="block text-sm font-medium text-slate-300 mb-1">Request Details</label>
                            <textarea id="requestDetails" value={requestDetails} onChange={e => setRequestDetails(e.target.value)} required rows={4} className="w-full bg-slate-900/50 border border-slate-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 px-3 py-2 text-sm" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                                <select id="priority" value={priority} onChange={e => setPriority(e.target.value as RequestPriority)} className="w-full bg-slate-900/50 border border-slate-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 px-3 py-2 text-sm">
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
                                <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} required min={today} className="w-full bg-slate-900/50 border border-slate-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 px-3 py-2 text-sm" />
                            </div>
                        </div>
                    </main>
                    <footer className="p-4 border-t border-slate-700 flex justify-end">
                        <button type="submit" className="px-6 py-2 rounded-md bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors">
                            {requestToEdit ? 'Save Changes' : 'Add Request'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};