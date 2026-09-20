import React from 'react';
import type { Skill } from '../types';
import { Badge } from './ui/Badge';

interface SkillBadgeProps {
  skill: Skill;
  className?: string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, className = '' }) => {
  return (
    <Badge 
      variant={skill.category === 'tech' ? 'tech' : 'non-tech'} 
      className={className}
    >
      {skill.name}
    </Badge>
  );
};
