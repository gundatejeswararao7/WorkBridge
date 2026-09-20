import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, IndianRupee } from 'lucide-react';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import type { Work } from '../types';

interface WorkCardProps {
  work: Work;
}

export const WorkCard: React.FC<WorkCardProps> = ({ work }) => {
  const statusColors = {
    open: 'success',
    assigned: 'warning',
    in_progress: 'warning',
    completed: 'default',
    cancelled: 'error',
  } as const;

  return (
    <Card className="flex flex-col h-full p-5 hover:border-indigo-200 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1 pr-2">
          {work.title}
        </h3>
        <Badge variant={work.category === 'tech' ? 'tech' : 'non-tech'} className="flex-shrink-0">
          {work.category}
        </Badge>
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
        {work.description}
      </p>

      <div className="flex flex-col gap-2 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span>{work.location || 'Remote / Unspecified'}</span>
        </div>
        
        {work.budget && (
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5" />
            <span className="font-medium text-gray-700">{work.budget}</span>
          </div>
        )}
        
        {work.deadline && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Deadline: {new Date(work.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {work.required_skills && work.required_skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {work.required_skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {skill}
            </span>
          ))}
          {work.required_skills.length > 3 && (
            <span className="text-xs text-gray-500 flex items-center px-1">
              +{work.required_skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {work.creator && (
            <>
              <Avatar url={work.creator.profile_photo_url} name={work.creator.full_name} size="sm" />
              <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">
                {work.creator.full_name}
              </span>
            </>
          )}
        </div>
        <Link to={`/work/${work.id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
      </div>
    </Card>
  );
};
