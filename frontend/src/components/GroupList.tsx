import React, { useEffect, useState } from 'react';
import Group from './Group';

interface GroupData {
  id: number;
  name: string;
  member_count: number;
}

// Accept groups from parent as prop
interface GroupListProps {
  externalGroups?: GroupData[];
  onGroupsChange?: (groups: GroupData[]) => void;
}

const GroupList: React.FC<GroupListProps> = ({ externalGroups, onGroupsChange }) => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // If external groups are provided, use them
  useEffect(() => {
    if (externalGroups) {
      setGroups(externalGroups);
      setLoading(false);
    }
  }, [externalGroups]);

  // Otherwise, fetch groups from API
  useEffect(() => {
    if (!externalGroups) {
      fetchGroups();
    }
  }, [externalGroups]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/groups/allGroups');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched groups:', data);
      setGroups(data);
      if (onGroupsChange) {
        onGroupsChange(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading groups...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (groups.length === 0) {
    return <div className="text-gray-500">No groups yet. Create one!</div>;
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <Group 
          key={group.id} 
          id={group.id}
          name={group.name} 
          member_count={group.member_count || 0} 
        />
      ))}
    </div>
  );
};

export default GroupList;