import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import type { Profile } from '../types';
import { SkillBadge } from './SkillBadge';

interface ProfileCardProps {
  profile: Profile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <Card className="flex flex-col h-full p-5 hover:border-indigo-200 transition-colors">
      <div className="flex items-start gap-4">
        <Avatar url={profile.profile_photo_url} name={profile.full_name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {profile.full_name}
            </h3>
            <Badge variant={profile.category === 'tech' ? 'tech' : profile.category === 'non-tech' ? 'non-tech' : 'default'}>
              {profile.category === 'both' ? 'Tech & Non-Tech' : profile.category}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 font-medium truncate">{profile.profession || 'Professional'}</p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {profile.location || 'Location not set'}
                {profile.distance_km !== undefined && profile.distance_km !== null && ` (${profile.distance_km.toFixed(1)} km)`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="capitalize">{profile.availability}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1">
        {profile.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 5).map(skill => (
              <SkillBadge key={skill.id} skill={skill} />
            ))}
            {profile.skills.length > 5 && (
              <span className="text-xs text-gray-500 flex items-center px-1">
                +{profile.skills.length - 5} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No skills listed</p>
        )}
      </div>

      <div className="mt-5 flex gap-2 pt-4 border-t border-gray-100">
        <Link to={`/user/${profile.id}`} className="flex-1">
          <Button variant="outline" className="w-full">View Profile</Button>
        </Link>
        <Link to={`/give-work?assignTo=${profile.id}`} className="flex-1">
          <Button variant="primary" className="w-full">Give Work</Button>
        </Link>
      </div>
    </Card>
  );
};
