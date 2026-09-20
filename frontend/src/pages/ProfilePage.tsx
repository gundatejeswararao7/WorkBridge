import React, { useState, useEffect } from 'react';
import { User, MapPin, Briefcase, Info, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { cities } from '../data/cities';
import { useLocation as useGeoLocation } from '../hooks/useLocation';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import type { Profile, Skill } from '../types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [selectedCity, setSelectedCity] = useState('');
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { latitude, longitude, loading: geoLoading, getCurrentLocation } = useGeoLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, skillsData] = await Promise.all([
          api.get<Profile>('/profiles/me'),
          api.get<Skill[]>('/skills')
        ]);
        
        setProfile(profileData);
        if (profileData.location) {
          const isCity = cities.some(c => c.name === profileData.location);
          if (isCity) setSelectedCity(profileData.location);
          else if (profileData.latitude) setSelectedCity('current');
        }
        
        if (profileData.skills) {
          setSelectedSkills(profileData.skills.map(s => s.id));
        }
        
        setAllSkills(skillsData);
      } catch (error) {
        console.error('Failed to fetch profile data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCity === 'current' && !latitude && !geoLoading) {
      getCurrentLocation();
    }
  }, [selectedCity, latitude, geoLoading, getCurrentLocation]);

  const handleInputChange = (field: keyof Profile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await api.post('/profiles/me/photo', { photo_data: base64 });
        setProfile(prev => ({ ...prev, profile_photo_url: base64 }));
        setMessage({ type: 'success', text: 'Photo updated successfully!' });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload photo', error);
      setMessage({ type: 'error', text: 'Failed to upload photo' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let lat = profile.latitude;
      let lng = profile.longitude;
      let locName = profile.location;

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

      const updateData = {
        ...profile,
        location: locName,
        latitude: lat,
        longitude: lng,
      };

      await api.put('/profiles/me', updateData);
      
      // Update skills
      await api.put('/profiles/me/skills', { skill_ids: selectedSkills });
      
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" /> Edit Profile
        </h1>
        <p className="text-gray-500 mt-1">Update your information to help people find you for work.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Basic Information</h2>
          
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar url={profile.profile_photo_url} name={profile.full_name} size="lg" className="w-32 h-32 text-4xl" />
              <div>
                <input 
                  type="file" 
                  id="photo-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                />
                <label 
                  htmlFor="photo-upload" 
                  className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload Photo
                </label>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <Input
                label="Full Name"
                required
                value={profile.full_name || ''}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <Input
                label="Profession / Title"
                placeholder="e.g. Software Engineer, Plumber, Designer..."
                value={profile.profession || ''}
                onChange={(e) => handleInputChange('profession', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
              <textarea
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                rows={4}
                placeholder="Write a brief introduction about yourself..."
                value={profile.about || ''}
                onChange={(e) => handleInputChange('about', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <textarea
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                rows={3}
                placeholder="Highlight your past experience..."
                value={profile.experience || ''}
                onChange={(e) => handleInputChange('experience', e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Preferences & Availability</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">My Work Category</label>
              <div className="flex rounded-md shadow-sm">
                {['tech', 'non-tech', 'both'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleInputChange('category', cat)}
                    className={`flex-1 px-3 py-2 text-sm font-medium border ${
                      profile.category === cat
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 z-10'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    } ${cat === 'tech' ? 'rounded-l-md' : cat === 'both' ? 'rounded-r-md' : '-ml-px'}`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <Select
              label="Availability"
              value={profile.availability || 'available'}
              onChange={(e) => handleInputChange('availability', e.target.value)}
              options={[
                { label: 'Available for work', value: 'available' },
                { label: 'Currently busy', value: 'busy' },
                { label: 'Unavailable', value: 'unavailable' },
              ]}
            />
            
            <Select
              label="Location"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              options={[
                { label: 'Not specified', value: '' },
                { label: '📍 Use My Location', value: 'current' },
                ...cities.map(c => ({ label: c.name, value: c.name }))
              ]}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work I Can Provide</label>
              <textarea
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                rows={3}
                placeholder="What services do you offer?"
                value={profile.work_can_provide || ''}
                onChange={(e) => handleInputChange('work_can_provide', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work I'm Interested In</label>
              <textarea
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                rows={3}
                placeholder="What kind of work do you want to hire for?"
                value={profile.work_interested_in || ''}
                onChange={(e) => handleInputChange('work_interested_in', e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">My Skills</h2>
          <p className="text-sm text-gray-500 mb-4">Select the skills you possess to help people find you.</p>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-emerald-800 mb-2">Tech Skills</h3>
            <div className="flex flex-wrap gap-2 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
              {allSkills.filter(s => s.category === 'tech').map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => handleSkillToggle(skill.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    selectedSkills.includes(skill.id)
                      ? 'bg-emerald-200 text-emerald-900 border-emerald-300'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-amber-800 mb-2">Non-Tech Skills</h3>
            <div className="flex flex-wrap gap-2 p-4 bg-amber-50/50 rounded-lg border border-amber-100">
              {allSkills.filter(s => s.category === 'non-tech').map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => handleSkillToggle(skill.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    selectedSkills.includes(skill.id)
                      ? 'bg-amber-200 text-amber-900 border-amber-300'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4 pb-12">
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            disabled={saving}
            className="px-8"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};
