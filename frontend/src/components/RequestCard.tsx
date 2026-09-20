import React from 'react';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import type { WorkRequest } from '../types';

interface RequestCardProps {
  request: WorkRequest;
  type: 'incoming' | 'outgoing';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ 
  request, 
  type, 
  onAccept, 
  onReject, 
  onCancel 
}) => {
  const profile = type === 'incoming' ? request.requester : request.work?.creator;
  
  const statusColors = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error',
    cancelled: 'default',
  } as const;

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 line-clamp-1">{request.work?.title || 'Work Details'}</h4>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(request.created_at).toLocaleDateString()}
          </p>
        </div>
        <Badge variant={statusColors[request.status]}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
        <Avatar url={profile?.profile_photo_url} name={profile?.full_name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {profile?.full_name || 'Unknown User'}
          </p>
          <p className="text-xs text-gray-500">
            {type === 'incoming' ? 'Requester' : 'Work Creator'}
          </p>
        </div>
      </div>

      {request.message && (
        <div className="mb-4 text-sm text-gray-700 italic border-l-2 border-indigo-200 pl-3 py-1">
          "{request.message}"
        </div>
      )}

      {request.status === 'pending' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {type === 'incoming' ? (
            <>
              <Button 
                variant="primary" 
                size="sm" 
                className="flex-1"
                onClick={() => onAccept && onAccept(request.id)}
              >
                Accept
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onReject && onReject(request.id)}
              >
                Reject
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onCancel && onCancel(request.id)}
            >
              Cancel Request
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
