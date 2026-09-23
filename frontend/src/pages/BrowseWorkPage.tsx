import React, { useState, useEffect } from 'react';
import { Search, Filter, Activity } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { WorkCard } from '../components/WorkCard';
import type { Work } from '../types';

export const BrowseWorkPage: React.FC = () => {
  const { user } = useAuth();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({ status: 'open' });
        if (category !== 'all') queryParams.append('category', category);
        
        const data = await api.get<Work[]>(`/works?${queryParams.toString()}`);
        setWorks(data);
      } catch (error) {
        console.error('Failed to fetch works', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, [category]);

  const filteredWorks = works
    .filter(work => !user?.id || work.creator_id !== user.id)
    .filter(work => 
      work.title.toLowerCase().includes(query.toLowerCase()) || 
      work.description.toLowerCase().includes(query.toLowerCase()) ||
      work.required_skills?.some(s => s.toLowerCase().includes(query.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-emerald-600" /> Take Work
          </h1>
          <p className="text-gray-500 mt-1">Find open work opportunities that match your skills.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-auto flex rounded-md shadow-sm">
          {['all', 'tech', 'non-tech'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium border ${
                category === cat 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 z-10' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              } ${cat === 'all' ? 'rounded-l-md' : cat === 'non-tech' ? 'rounded-r-md' : '-ml-px'}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="w-full md:flex-1">
          <Input
            placeholder="Search by title, description, or skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Activity className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
      ) : filteredWorks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorks.map(work => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No work found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters or check back later.</p>
        </div>
      )}
    </div>
  );
};
