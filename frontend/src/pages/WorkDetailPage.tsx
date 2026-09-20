import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, IndianRupee, Clock, User, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import type { Work, WorkRequest } from '../types';

export const WorkDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [work, setWork] = useState<Work | null>(null);
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const data = await api.get<Work>(`/works/${id}`);
        setWork(data);
        
        // If current user is the creator, fetch requests for this work
        if (data.creator_id === user?.id) {
          const reqData = await api.get<WorkRequest[]>(`/requests/work/${id}`);
          setRequests(reqData);
        }
      } catch (error) {
        console.error('Failed to fetch work details', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWork();
  }, [id, user?.id]);

  const handleRequestWork = async () => {
    setSubmittingRequest(true);
    setRequestError('');
    try {
      await api.post('/requests', {
        work_id: id,
        message: requestMessage,
      });
      setIsRequestModalOpen(false);
      // Optionally redirect or show success message
      navigate('/requests');
    } catch (err: any) {
      setRequestError(err.message || 'Failed to send request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleDeleteWork = async () => {
    if (confirm('Are you sure you want to delete this work post?')) {
      try {
        await api.delete(`/works/${id}`);
        navigate('/my-work');
      } catch (error) {
        console.error('Failed to delete work', error);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading work details...</div>;
  }

  if (!work) {
    return <div className="p-8 text-center">Work not found.</div>;
  }

  const isCreator = user?.id === work.creator_id;
  const isOpen = work.status === 'open';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={-1 as any} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={work.category === 'tech' ? 'tech' : 'non-tech'}>
                {work.category}
              </Badge>
              <Badge variant={
                work.status === 'open' ? 'success' : 
                work.status === 'completed' ? 'default' : 
                work.status === 'cancelled' ? 'error' : 'warning'
              }>
                {work.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{work.title}</h1>
            
            <div className="prose prose-indigo max-w-none mb-8">
              <p className="whitespace-pre-wrap text-gray-700">{work.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{work.location || 'Remote / Unspecified'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <IndianRupee className="w-5 h-5 text-gray-400" />
                <span>{work.budget || 'Negotiable'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Deadline: {work.deadline ? new Date(work.deadline).toLocaleDateString() : 'Flexible'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>Posted: {new Date(work.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {work.required_skills && work.required_skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {work.required_skills.map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-80 flex-shrink-0 space-y-6">
            <Card className="p-5 bg-gray-50 border-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Posted By</h3>
              {work.creator && (
                <div className="flex items-center gap-3 mb-4">
                  <Avatar url={work.creator.profile_photo_url} name={work.creator.full_name} size="md" />
                  <div>
                    <p className="font-medium text-gray-900">{work.creator.full_name}</p>
                    <p className="text-xs text-gray-500">{work.creator.profession}</p>
                  </div>
                </div>
              )}
              <Link to={`/user/${work.creator_id}`}>
                <Button variant="outline" className="w-full">View Profile</Button>
              </Link>
            </Card>

            {work.assignee && (
              <Card className="p-5 bg-blue-50 border-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Assigned To</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar url={work.assignee.profile_photo_url} name={work.assignee.full_name} size="md" />
                  <div>
                    <p className="font-medium text-gray-900">{work.assignee.full_name}</p>
                  </div>
                </div>
                <Link to={`/user/${work.assigned_to}`}>
                  <Button variant="outline" className="w-full bg-white">View Profile</Button>
                </Link>
              </Card>
            )}

            {!isCreator && isOpen && (
              <Button 
                variant="primary" 
                className="w-full py-3 text-lg"
                onClick={() => setIsRequestModalOpen(true)}
              >
                <Send className="w-5 h-5 mr-2" /> Request to Take Work
              </Button>
            )}

            {isCreator && (
              <div className="space-y-3">
                <Button 
                  variant="danger" 
                  className="w-full"
                  onClick={handleDeleteWork}
                >
                  Delete Work Post
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {isCreator && requests.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Requests for this Work ({requests.length})</h2>
          <div className="grid gap-4">
            {requests.map(req => (
              <Card key={req.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar url={req.requester?.profile_photo_url} name={req.requester?.full_name} />
                  <div>
                    <p className="font-medium">{req.requester?.full_name}</p>
                    <p className="text-sm text-gray-500">"{req.message}"</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {req.status === 'pending' ? (
                    <Badge variant="warning">Pending</Badge>
                  ) : (
                    <Badge variant={req.status === 'accepted' ? 'success' : 'error'}>
                      {req.status}
                    </Badge>
                  )}
                  <Link to={`/requests`}>
                    <Button variant="outline" size="sm">Manage</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)}
        title="Request to Take Work"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Send a message to the creator explaining why you are a good fit for this work.
          </p>
          
          {requestError && <p className="text-sm text-red-600">{requestError}</p>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
            <textarea
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
              rows={4}
              placeholder="Hi, I'm interested in this work because..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleRequestWork}
              disabled={submittingRequest}
            >
              {submittingRequest ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
