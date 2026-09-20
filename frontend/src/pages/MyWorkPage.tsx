import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { WorkCard } from '../components/WorkCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { Work } from '../types';

export const MyWorkPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'giving' | 'taking'>('giving');
  const [givingWork, setGivingWork] = useState<Work[]>([]);
  const [takingWork, setTakingWork] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWork = async () => {
    setLoading(true);
    try {
      if (activeTab === 'giving') {
        const data = await api.get<Work[]>('/works/my/giving');
        setGivingWork(data);
      } else {
        const data = await api.get<Work[]>('/works/my/taking');
        setTakingWork(data);
      }
    } catch (error) {
      console.error('Failed to fetch work', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWork();
  }, [activeTab]);

  const handleMarkComplete = async (workId: string) => {
    if (confirm('Are you sure you want to mark this work as completed?')) {
      try {
        await api.put(`/works/${workId}`, { status: 'completed' });
        fetchWork(); // Refresh list
      } catch (error) {
        console.error('Failed to complete work', error);
      }
    }
  };

  const renderWorkList = (works: Work[]) => {
    if (loading) {
      return <div className="text-center py-12">Loading...</div>;
    }

    if (works.length === 0) {
      return (
        <Card className="p-12 text-center bg-gray-50 border-dashed">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No work found in this section.</p>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {works.map(work => (
          <div key={work.id} className="relative group flex flex-col">
            <WorkCard work={work} />
            
            {activeTab === 'giving' && (work.status === 'assigned' || work.status === 'in_progress') && (
              <div className="mt-2">
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => handleMarkComplete(work.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Mark as Completed
                </Button>
              </div>
            )}
            
            {(work.status === 'completed') && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => alert('Review functionality coming soon!')}
                >
                  Leave a Review
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Work</h1>
        <p className="text-gray-500 mt-1">Manage the work you are giving and taking.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('giving')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'giving'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Work I'm Giving
          </button>
          <button
            onClick={() => setActiveTab('taking')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'taking'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Work I'm Taking
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {renderWorkList(activeTab === 'giving' ? givingWork : takingWork)}
      </div>
    </div>
  );
};
