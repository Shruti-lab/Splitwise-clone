import React from 'react';


/*
* @component displaying individual contact
*/

interface contactProps {
    id?: number;
    name: string;
    email: string;
}

const Contact: React.FC<contactProps> = ({name, email}) => {
    return(
        <div className="p-4 flex-column items-center space-x-4 mb-4 shadow-md rounded-2xl">
                <h3 className="text-xl font-bold mb-4">{name}</h3>
                <p className="mb-2">{email}</p>
        </div>
    )
};

export default Contact;