import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, IndianRupee, Tag, Info } from 'lucide-react';
import { api } from '../lib/api';
import { cities } from '../data/cities';
import { useLocation as useGeoLocation } from '../hooks/useLocation';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import type { Skill } from '../types';

export const GiveWorkPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignTo = searchParams.get('assignTo');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'tech' | 'non-tech'>('tech');
  const [selectedCity, setSelectedCity] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { latitude, longitude, loading: geoLoading, getCurrentLocation } = useGeoLocation();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await api.get<Skill[]>(`/skills?category=${category}`);
        setAvailableSkills(skills);
        setSelectedSkills([]); // Reset skills when category changes
      } catch (err) {
        console.error('Failed to fetch skills', err);
      }
    };
    fetchSkills();
  }, [category]);

  useEffect(() => {
    if (selectedCity === 'current' && !latitude && !geoLoading) {
      getCurrentLocation();
    }
  }, [selectedCity, latitude, geoLoading, getCurrentLocation]);

  const handleSkillToggle = (skillName: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      return setError('Title and description are required');
    }

    if (!deadline) {
      return setError('A completion deadline date is mandatory.');
    }

    const selectedDeadline = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDeadline < today) {
      return setError('Deadline cannot be in the past. Please select a valid future date.');
    }

    if (assignTo && user?.id && assignTo === user.id) {
      return setError('You cannot assign work to yourself.');
    }

    setLoading(true);
    setError('');

    try {
      let lat = null;
      let lng = null;
      let locName = '';

      if (selectedCity === 'current' && latitude && longitude) {
        lat = latitude;
        lng = longitude;
        locName = 'Current Location';
      } else if (selectedCity && selectedCity !== 'current') {
        const city = cities.find(c => c.name === selectedCity);
        if (city) {
          lat = city.latitude;
          lng = city.longitude;
          locName = city.name;
        }
      }

      const payload = {
        title,
        description,
        category,
        location: locName,
        latitude: lat,
        longitude: lng,
        budget,
        deadline: deadline || null,
        required_skills: selectedSkills,
      };

      const newWork = await api.post<any>('/works', payload);
      
      if (assignTo) {
        // Automatically create a request if assignTo is present
        await api.post('/requests', {
          work_id: newWork.id,
          target_user_id: assignTo,
          message: 'I have created this work specifically for you.'
        }).catch(err => console.error('Failed to assign work', err));
        
        navigate('/my-work');
      } else {
        navigate('/my-work');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create work post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-indigo-600" /> Give Work
        </h1>
        <p className="text-gray-500 mt-2">Create a work post to find the right person for your job.</p>
      </div>

      {assignTo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            You are creating this work specifically to assign it to a selected user. Once created, a work request will be automatically sent to them.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Work Title"
            required
            placeholder="e.g., Build a React Dashboard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={4}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
              placeholder="Describe what needs to be done..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setCategory('tech')}
                  className={`flex-1 px-4 py-2 text-sm font-medium border rounded-l-md ${
                    category === 'tech'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 z-10'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tech
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('non-tech')}
                  className={`flex-1 px-4 py-2 text-sm font-medium border rounded-r-md -ml-px ${
                    category === 'non-tech'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 z-10'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Non-Tech
                </button>
              </div>
            </div>

            <Select
              label="Location"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              options={[
                { label: 'Remote / Anywhere', value: '' },
                { label: '📍 Use My Location', value: 'current' },
                ...cities.map(c => ({ label: c.name, value: c.name }))
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Required Skills
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
              {availableSkills.length > 0 ? (
                availableSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleSkillToggle(skill.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      selectedSkills.includes(skill.name)
                        ? category === 'tech' 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {skill.name}
                  </button>
                ))
              ) : (
                <span className="text-sm text-gray-500 italic">No skills available for this category.</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Budget (Optional)"
              placeholder="e.g., ₹5,000 or ₹500/hr"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              icon={<IndianRupee className="w-5 h-5" />}
            />

            <Input
              label="Completion Deadline"
              required
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              icon={<Calendar className="w-5 h-5" />}
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
              className="px-8"
            >
              {loading ? 'Creating...' : 'Post Work'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
