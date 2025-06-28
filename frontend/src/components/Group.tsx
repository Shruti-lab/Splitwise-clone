import React from 'react';
import { Link } from 'react-router-dom';


/*
* @component displaying individual contact
*/

interface groupProps {
    id: number;
    name: string;
    member_count: number;
}

const Group: React.FC<groupProps> = ({id, name, member_count}) => {
    return(
        <Link to={`/groups/${id}`}>
        <div className="p-4 flex-column items-center space-x-4 mb-4 shadow-md rounded-2xl">
                <h3 className="text-xl font-bold mb-4">{name}</h3>
                <p className="mb-2">{member_count} members</p>
        </div>
        </Link>
    )
};

export default Group;