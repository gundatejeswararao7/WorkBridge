export interface Profile {
  id: string;
  email: string;
  full_name: string;
  about: string;
  profession: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  experience: string;
  availability: 'available' | 'busy' | 'unavailable';
  category: 'tech' | 'non-tech' | 'both';
  profile_photo_url: string;
  work_can_provide: string;
  work_interested_in: string;
  created_at: string;
  updated_at: string;
  skills?: Skill[];
  distance_km?: number | null;
  work_mode?: 'remote' | 'in-office' | 'hybrid';
  delayed_work_count?: number;
  completed_jobs_count?: number;
  reputation_status?: 'fresher' | 'reliable' | 'delayed';
  average_rating?: number;
  review_count?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: 'tech' | 'non-tech';
}

export interface Work {
  id: string;
  title: string;
  description: string;
  category: 'tech' | 'non-tech';
  required_skills: string[];
  location: string;
  latitude: number | null;
  longitude: number | null;
  budget: string;
  deadline: string | null;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  creator_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  assignee?: Profile;
}

export interface WorkRequest {
  id: string;
  work_id: string;
  requester_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
  work?: Work;
  requester?: Profile;
}

export interface Review {
  id: string;
  work_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: Profile;
  work?: Work;
}
