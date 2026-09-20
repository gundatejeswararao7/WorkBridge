import React, { useState, useEffect } from 'react';
import { Send, Inbox } from 'lucide-react';
import { api } from '../lib/api';
import { RequestCard } from '../components/RequestCard';
import { Card } from '../components/ui/Card';
import type { WorkRequest } from '../types';

export const RequestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [incomingRequests, setIncomingRequests] = useState<WorkRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<WorkRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (activeTab === 'incoming') {
        const data = await api.get<WorkRequest[]>('/requests/incoming');
        setIncomingRequests(data);
      } else {
        const data = await api.get<WorkRequest[]>('/requests/outgoing');
        setOutgoingRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const handleAccept = async (id: string) => {
    try {
      await api.put(`/requests/${id}/accept`, {});
      fetchRequests();
    } catch (error) {
      console.error('Failed to accept request', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/requests/${id}/reject`, {});
      fetchRequests();
    } catch (error) {
      console.error('Failed to reject request', error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.put(`/requests/${id}/cancel`, {});
      fetchRequests();
    } catch (error) {
      console.error('Failed to cancel request', error);
    }
  };

  const renderRequests = (requests: WorkRequest[], type: 'incoming' | 'outgoing') => {
    if (loading) {
      return <div className="text-center py-12">Loading...</div>;
    }

    if (requests.length === 0) {
      return (
        <Card className="p-12 text-center bg-gray-50 border-dashed">
          {type === 'incoming' ? (
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          ) : (
            <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          )}
          <p className="text-gray-500">No {type} requests found.</p>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map(req => (
          <RequestCard
            key={req.id}
            request={req}
            type={type}
            onAccept={handleAccept}
            onReject={handleReject}
            onCancel={handleCancel}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Work Requests</h1>
        <p className="text-gray-500 mt-1">Manage requests to take your work or requests you've sent to others.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'incoming'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Incoming Requests
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'outgoing'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Outgoing Requests
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {renderRequests(activeTab === 'incoming' ? incomingRequests : outgoingRequests, activeTab)}
      </div>
    </div>
  );
};
