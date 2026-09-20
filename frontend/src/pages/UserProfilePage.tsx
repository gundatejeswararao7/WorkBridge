import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, Star, Briefcase, User as UserIcon } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { SkillBadge } from '../components/SkillBadge';
import type { Profile, Review } from '../types';

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [profileData, reviewsData] = await Promise.all([
          api.get<Profile>(`/users/${id}`),
          api.get<Review[]>(`/reviews/user/${id}`).catch(() => [])
        ]);
        setProfile(profileData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to fetch user profile', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Loading user profile...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center">User not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={-1 as any} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <Card className="p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600"></div>
        
        <div className="relative pt-12 flex flex-col md:flex-row gap-6 items-start">
          <Avatar 
            url={profile.profile_photo_url} 
            name={profile.full_name} 
            className="w-32 h-32 border-4 border-white shadow-md text-3xl" 
          />
          
          <div className="flex-1 w-full pt-4 md:pt-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                <p className="text-lg text-gray-600 font-medium">{profile.profession}</p>
              </div>
              
              <div className="flex gap-2">
                <Link to={`/give-work?assignTo=${profile.id}`}>
                  <Button variant="primary">Give Work to {profile.full_name.split(' ')[0]}</Button>
                </Link>
                <Link to={`/browse-work?creator=${profile.id}`}>
                  <Button variant="outline">View Their Posts</Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{profile.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="capitalize">{profile.availability}</span>
              </div>
              <Badge variant={profile.category === 'tech' ? 'tech' : profile.category === 'non-tech' ? 'non-tech' : 'default'}>
                {profile.category === 'both' ? 'Tech & Non-Tech' : profile.category}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-600" /> About
            </h2>
            <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap">
              {profile.about || <span className="text-gray-400 italic">No description provided.</span>}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" /> Experience
            </h2>
            <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap">
              {profile.experience || <span className="text-gray-400 italic">No experience details provided.</span>}
            </div>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Work They Can Provide</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {profile.work_can_provide || <span className="text-gray-400 italic">Not specified</span>}
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Work They're Interested In</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {profile.work_interested_in || <span className="text-gray-400 italic">Not specified</span>}
              </p>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Skills</h2>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <SkillBadge key={skill.id} skill={skill} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No skills listed</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> Reviews ({reviews.length})
            </h2>
            
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-sm">{review.reviewer?.full_name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{review.work?.title}</p>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No reviews yet</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
