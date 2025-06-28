import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContactList from "./ContactList";
import GroupCreateModal from "./GroupCreateModal";
import GroupList from "./GroupList";

interface GroupData {
  id: number;
  name: string;
  member_count: number;
}

const Contacts: React.FC = () => {
  const [groups, setGroups] = useState<GroupData[]>([]);

  // Function to handle adding a new group
  const handleAddGroup = (newGroup: GroupData) => {
    setGroups(prevGroups => [...prevGroups, newGroup]);
  };

  return(
    <div>
      <div className="m-4 flex justify-between">
        <div className="flex-1 m-4">
          <p className="m-2 mb-4 text-5xl font-serif">Splitwise Clone</p>
        </div>
        <div className="grid grid-cols-2 gap-4 content-center flex-1 m-4 justify-center">
          <GroupCreateModal onGroupCreated={handleAddGroup} />
        </div>
      </div>
      <div id="container" className="flex m-4">
        <div id="user-list" className="flex-column flex-1 p-4 m-4 justify-self-auto">
          <p className="m-2 mb-4 text-4xl">Users</p>
          <ContactList />
        </div>
        <div id="group-list" className="flex-column flex-1 p-4 m-4 justify-self-auto">
          <p className="m-2 mb-4 text-4xl">Groups</p>
          <GroupList 
            externalGroups={groups.length > 0 ? groups : undefined} 
            onGroupsChange={setGroups}
          />
        </div>
      </div>
       <div className='flex justify-center items-center mt-8 mb-12 m-2'>
         <Link 
            to="/dashboard" 
            className="rounded-md bg-indigo-500 px-4 py-2 text-white font-semibold shadow-lg shadow-indigo-500/50 hover:bg-indigo-600 text-center"
          >
            My Dashboard
          </Link>
    </div>
    </div>
  );
};

export default Contacts;