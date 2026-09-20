import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Activity } from 'lucide-react';
import { api } from '../lib/api';
import { cities } from '../data/cities';
import { useLocation as useGeoLocation } from '../hooks/useLocation';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { ProfileCard } from '../components/ProfileCard';
import type { Profile } from '../types';

export const SearchPeoplePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [radius, setRadius] = useState('10');
  const [selectedCity, setSelectedCity] = useState('');
  
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const { latitude, longitude, loading: geoLoading, error: geoError, getCurrentLocation } = useGeoLocation();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);
    
    try {
      let lat = '';
      let lng = '';
      
      if (selectedCity && selectedCity !== 'current') {
        const city = cities.find(c => c.name === selectedCity);
        if (city) {
          lat = city.latitude.toString();
          lng = city.longitude.toString();
        }
      } else if (selectedCity === 'current' && latitude && longitude) {
        lat = latitude.toString();
        lng = longitude.toString();
      }

      const queryParams = new URLSearchParams({
        q: query,
        category: category !== 'all' ? category : '',
        availability: availability !== 'all' ? availability : '',
        radius: lat && lng ? radius : '',
        lat,
        lng
      });

      const data = await api.get<Profile[]>(`/users/search?${queryParams.toString()}`);
      setResults(data);
    } catch (error) {
      console.error('Search failed', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCity === 'current' && !latitude && !loading) {
      getCurrentLocation();
    }
  }, [selectedCity, latitude, loading, getCurrentLocation]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-4 z-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-6 h-6 text-indigo-600" /> Search People
        </h1>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Search by name, skills, profession..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
            <Button type="submit" variant="primary" className="px-8" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="flex rounded-md shadow-sm">
                {['all', 'tech', 'non-tech'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium border ${
                      category === cat 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 z-10' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    } ${cat === 'all' ? 'rounded-l-md' : cat === 'non-tech' ? 'rounded-r-md' : '-ml-px'}`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Select
                label="Location"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                options={[
                  { label: 'Anywhere', value: '' },
                  { label: '📍 My Current Location', value: 'current' },
                  ...cities.map(c => ({ label: c.name, value: c.name }))
                ]}
              />
              {geoLoading && selectedCity === 'current' && <span className="text-xs text-indigo-600 mt-1 block">Getting location...</span>}
              {geoError && selectedCity === 'current' && <span className="text-xs text-red-600 mt-1 block">{geoError}</span>}
            </div>

            <div>
              <Select
                label="Radius"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                disabled={!selectedCity}
                options={[
                  { label: '1 km', value: '1' },
                  { label: '5 km', value: '5' },
                  { label: '10 km', value: '10' },
                  { label: '25 km', value: '25' },
                  { label: '50 km', value: '50' },
                ]}
              />
            </div>

            <div>
              <Select
                label="Availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Available', value: 'available' },
                  { label: 'Busy', value: 'busy' },
                ]}
              />
            </div>
          </div>
        </form>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Activity className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : !searched ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Ready to search</h3>
            <p className="text-gray-500 mt-1">Enter your search criteria above to find people.</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-gray-600 font-medium">Found {results.length} people</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No people found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};
