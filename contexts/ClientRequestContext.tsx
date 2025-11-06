import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { ClientRequest, RequestStatus } from '../types';
import { AuthContext } from './AuthContext';

interface ClientRequestContextType {
    requests: ClientRequest[];
    addRequest: (requestData: Omit<ClientRequest, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
    updateRequest: (request: ClientRequest) => void;
    updateRequestStatus: (requestId: string, newStatus: RequestStatus) => void;
    deleteRequest: (requestId: string) => void;
}

export const ClientRequestContext = createContext<ClientRequestContextType>({
    requests: [],
    addRequest: () => {},
    updateRequest: () => {},
    updateRequestStatus: () => {},
    deleteRequest: () => {},
});

export const ClientRequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useContext(AuthContext);
    const [requests, setRequests] = useState<ClientRequest[]>([]);

    useEffect(() => {
        if (currentUser) {
            const storedRequests = localStorage.getItem(`lex-ai-requests-${currentUser.id}`);
            if (storedRequests) {
                try {
                    setRequests(JSON.parse(storedRequests));
                } catch (error) {
                    console.error("Failed to parse client requests from localStorage", error);
                    setRequests([]);
                }
            } else {
                setRequests([]);
            }
        } else {
            setRequests([]);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser && requests) {
            localStorage.setItem(`lex-ai-requests-${currentUser.id}`, JSON.stringify(requests));
        }
    }, [requests, currentUser]);

    const addRequest = (requestData: Omit<ClientRequest, 'id' | 'userId' | 'createdAt' | 'status'>) => {
        if (!currentUser) return;
        const newRequest: ClientRequest = {
            id: `req-${Date.now()}`,
            userId: currentUser.id,
            ...requestData,
            status: 'Pending',
            createdAt: new Date().toISOString(),
        };
        setRequests(prev => [newRequest, ...prev]);
    };
    
    const updateRequest = (updatedRequest: ClientRequest) => {
        setRequests(prev => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
    }

    const updateRequestStatus = (requestId: string, newStatus: RequestStatus) => {
        setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
    };

    const deleteRequest = (requestId: string) => {
        setRequests(prev => prev.filter(req => req.id !== requestId));
    };

    return (
        <ClientRequestContext.Provider value={{ requests, addRequest, updateRequest, updateRequestStatus, deleteRequest }}>
            {children}
        </ClientRequestContext.Provider>
    );
};