import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, Star, Send, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { WorkCard } from '../components/WorkCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ReviewModal } from '../components/ReviewModal';
import type { Work } from '../types';

export const MyWorkPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'giving' | 'taking'>('giving');
  const [givingWork, setGivingWork] = useState<Work[]>([]);
  const [takingWork, setTakingWork] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    workId: string;
    workerId: string;
    workerName: string;
  } | null>(null);

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
        fetchWork();
      } catch (error) {
        console.error('Failed to complete work', error);
      }
    }
  };

  const handleSubmitWork = async (workId: string, deadline: string | null) => {
    const isLate = deadline && new Date() > new Date(deadline);
    const confirmMessage = isLate
      ? '⚠️ Warning: The deadline for this task has passed. Submitting now will record a +1 Delayed Work count on your reputation profile. Are you ready to submit?'
      : 'Are you sure you want to submit this completed work? On-time completion builds good standing and recovers delayed counts!';

    if (confirm(confirmMessage)) {
      try {
        await api.put(`/works/${workId}`, { status: 'completed' });
        fetchWork();
      } catch (error: any) {
        console.error('Failed to submit work', error);
        alert(error.response?.data?.error || 'Failed to submit work');
      }
    }
  };

  const openReviewModal = (work: Work) => {
    const workerId = work.assigned_to || (work.assignee as any)?.id;
    const workerName = work.assignee?.full_name || 'Worker';
    if (!workerId) {
      alert('No worker assigned to this work.');
      return;
    }
    setReviewTarget({
      workId: work.id,
      workerId,
      workerName,
    });
    setReviewModalOpen(true);
  };

  const renderWorkList = (works: Work[]) => {
    if (loading) {
      return <div className="text-center py-12 text-slate-500 font-medium">Loading your assignments...</div>;
    }

    if (works.length === 0) {
      return (
        <Card className="p-12 text-center bg-gray-50 border-dashed">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No work found in this section.</p>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {works.map((work) => {
          const isOverdue = work.deadline && new Date() > new Date(work.deadline);
          const wasSubmittedLate =
            work.status === 'completed' &&
            work.deadline &&
            new Date(work.updated_at) > new Date(work.deadline);

          return (
            <div key={work.id} className="relative group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <WorkCard work={work} />

              {/* Status Banner */}
              <div className="px-5 pb-2">
                {work.status !== 'completed' && isOverdue && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-800">
                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Deadline Passed (Overdue - In Progress)</span>
                  </div>
                )}
                {work.status === 'completed' && wasSubmittedLate && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span>Submitted past deadline (+1 Delay recorded)</span>
                  </div>
                )}
                {work.status === 'completed' && !wasSubmittedLate && work.deadline && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Submitted on time (Reliable)</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 mt-auto flex flex-col gap-2">
                {/* Giving tab actions */}
                {activeTab === 'giving' && (work.status === 'assigned' || work.status === 'in_progress') && (
                  <Button
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={() => handleMarkComplete(work.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark as Completed
                  </Button>
                )}

                {activeTab === 'giving' && work.status === 'completed' && work.assigned_to && (
                  <Button
                    variant="primary"
                    className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                    onClick={() => openReviewModal(work)}
                  >
                    <Star className="w-4 h-4 mr-2 fill-amber-300 text-amber-300" /> Rate & Review Worker
                  </Button>
                )}

                {/* Taking tab actions (Worker Submission) */}
                {activeTab === 'taking' && (work.status === 'assigned' || work.status === 'in_progress') && (
                  <Button
                    variant="primary"
                    className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                    onClick={() => handleSubmitWork(work.id, work.deadline)}
                  >
                    <Send className="w-4 h-4 mr-2" /> Submit Completed Work
                  </Button>
                )}

                {activeTab === 'taking' && work.status === 'completed' && (
                  <div className="text-center py-1 text-xs font-medium text-emerald-600">
                    ✓ Task submitted and marked complete
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Work</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage tasks you are giving to others or taking on yourself.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('giving')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'giving'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Work I'm Giving
          </button>
          <button
            onClick={() => setActiveTab('taking')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'taking'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
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

      {/* Review Modal for Employer to Rate & Review Worker */}
      {reviewTarget && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setReviewTarget(null);
          }}
          workId={reviewTarget.workId}
          workerId={reviewTarget.workerId}
          workerName={reviewTarget.workerName}
          onReviewSubmitted={() => {
            fetchWork();
          }}
        />
      )}
    </div>
  );
};
