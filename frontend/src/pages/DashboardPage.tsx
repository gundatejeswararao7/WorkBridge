import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WorkCard } from '../components/WorkCard';
import { RequestCard } from '../components/RequestCard';
import type { Work, WorkRequest } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [givingWork, setGivingWork] = useState<Work[]>([]);
  const [takingWork, setTakingWork] = useState<Work[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<WorkRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<WorkRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [giving, taking, incoming, outgoing] = await Promise.all([
          api.get<Work[]>('/works/my/giving').catch(() => []),
          api.get<Work[]>('/works/my/taking').catch(() => []),
          api.get<WorkRequest[]>('/requests/incoming').catch(() => []),
          api.get<WorkRequest[]>('/requests/outgoing').catch(() => [])
        ]);
        
        setGivingWork(giving);
        setTakingWork(taking);
        setIncomingRequests(incoming);
        setOutgoingRequests(outgoing);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.email}!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your work today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/give-work" className="block">
          <Card className="p-6 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors border-0 flex items-center justify-between group">
            <div>
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <PlusCircle className="w-6 h-6" /> Give Work
              </h2>
              <p className="text-indigo-100 text-sm">Create a post and hire someone</p>
            </div>
            <ArrowRight className="w-6 h-6 text-indigo-300 group-hover:text-white transition-colors group-hover:translate-x-1" />
          </Card>
        </Link>
        
        <Link to="/browse-work" className="block">
          <Card className="p-6 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors border-0 flex items-center justify-between group">
            <div>
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Search className="w-6 h-6" /> Take Work
              </h2>
              <p className="text-emerald-100 text-sm">Find and apply for open work</p>
            </div>
            <ArrowRight className="w-6 h-6 text-emerald-300 group-hover:text-white transition-colors group-hover:translate-x-1" />
          </Card>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Work I'm Giving */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Work I'm Giving <span className="bg-indigo-100 text-indigo-800 text-xs py-0.5 px-2 rounded-full">{givingWork.length}</span>
              </h3>
              <Link to="/my-work" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</Link>
            </div>
            {givingWork.length > 0 ? (
              <div className="space-y-4">
                {givingWork.slice(0, 3).map(work => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center bg-gray-50 border-dashed">
                <p className="text-gray-500 mb-4">You aren't giving any work right now.</p>
                <Link to="/give-work"><Button variant="outline" size="sm">Create Work Post</Button></Link>
              </Card>
            )}
          </section>

          {/* Work I'm Taking */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Work I'm Taking <span className="bg-emerald-100 text-emerald-800 text-xs py-0.5 px-2 rounded-full">{takingWork.length}</span>
              </h3>
              <Link to="/my-work" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</Link>
            </div>
            {takingWork.length > 0 ? (
              <div className="space-y-4">
                {takingWork.slice(0, 3).map(work => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center bg-gray-50 border-dashed">
                <p className="text-gray-500 mb-4">You haven't taken any work yet.</p>
                <Link to="/browse-work"><Button variant="outline" size="sm">Browse Available Work</Button></Link>
              </Card>
            )}
          </section>

          {/* Incoming Requests */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Incoming Requests <span className="bg-orange-100 text-orange-800 text-xs py-0.5 px-2 rounded-full">{incomingRequests.length}</span>
              </h3>
              <Link to="/requests" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</Link>
            </div>
            {incomingRequests.length > 0 ? (
              <div className="space-y-4">
                {incomingRequests.slice(0, 3).map(req => (
                  <RequestCard key={req.id} request={req} type="incoming" />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center bg-gray-50 border-dashed">
                <p className="text-gray-500">No incoming requests.</p>
              </Card>
            )}
          </section>

          {/* Outgoing Requests */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Outgoing Requests <span className="bg-blue-100 text-blue-800 text-xs py-0.5 px-2 rounded-full">{outgoingRequests.length}</span>
              </h3>
              <Link to="/requests" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</Link>
            </div>
            {outgoingRequests.length > 0 ? (
              <div className="space-y-4">
                {outgoingRequests.slice(0, 3).map(req => (
                  <RequestCard key={req.id} request={req} type="outgoing" />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center bg-gray-50 border-dashed">
                <p className="text-gray-500">No outgoing requests.</p>
              </Card>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
