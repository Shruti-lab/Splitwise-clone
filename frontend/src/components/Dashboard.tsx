import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Balance {
  from_user_id: number;
  from_username: string;
  to_user_id: number;
  to_username: string;
  amount: number;
}

interface UserBalance {
  user_id: number;
  username: string;
  balances_by_group: Record<string, Balance[]>;
  total_balance: number;
}

const Dashboard: React.FC = () => {
  const [userBalances, setUserBalances] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hard-coded user for this example (in a real app, this would come from auth)
  const currentUser = {
    id: 1, // Shruti's ID is 1
    username: 'Shruti',
    email: 'shrutibpatil45@gmail.com'
  };

  useEffect(() => {
    const fetchUserBalances = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/users/${currentUser.id}/balances`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user balances: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Fetched balances:', data);
        setUserBalances(data);
      } catch (error) {
        console.error('Error fetching balances:', error);
        setError('Failed to load balance data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBalances();
  }, [currentUser.id]);

  const calculateAmounts = () => {
    if (!userBalances) return { totalOwed: 0, totalOwing: 0 };
    
    let totalOwed = 0; // Money others owe you
    let totalOwing = 0; // Money you owe others

    // Go through all balances in all groups
    Object.values(userBalances.balances_by_group).forEach(groupBalances => {
      groupBalances.forEach(balance => {
        if (balance.from_user_id === currentUser.id) {
          // Someone owes Shruti
          totalOwed += balance.amount;
        } else if (balance.to_user_id === currentUser.id) {
          // Shruti owes someone
          totalOwing += balance.amount;
        }
      });
    });

    return { totalOwed, totalOwing };
  };

  // Get flat list of people who owe the current user
  const getPeopleWhoOwe = () => {
    if (!userBalances) return [];
    
    const peopleWhoOwe: {username: string, amount: number, group: string}[] = [];
    
    Object.entries(userBalances.balances_by_group).forEach(([groupName, balances]) => {
      balances.forEach(balance => {
        if (balance.from_user_id === currentUser.id) {
          peopleWhoOwe.push({
            username: balance.to_username,
            amount: balance.amount,
            group: groupName
          });
        }
      });
    });
    
    return peopleWhoOwe;
  };

  // Get flat list of people the current user owes
  const getPeopleYouOwe = () => {
    if (!userBalances) return [];
    
    const peopleYouOwe: {username: string, amount: number, group: string}[] = [];
    
    Object.entries(userBalances.balances_by_group).forEach(([groupName, balances]) => {
      balances.forEach(balance => {
        if (balance.to_user_id === currentUser.id) {
          peopleYouOwe.push({
            username: balance.from_username,
            amount: balance.amount,
            group: groupName
          });
        }
      });
    });
    
    return peopleYouOwe;
  };

  const { totalOwed, totalOwing } = calculateAmounts();
  const peopleWhoOwe = getPeopleWhoOwe();
  const peopleYouOwe = getPeopleYouOwe();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Loading balances...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-cyan-500 hover:underline">
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  if (!userBalances) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          No balance data available for this user.
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-cyan-500 hover:underline">
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{currentUser.username}'s Dashboard</h1>
        <p className="text-gray-500">{currentUser.email}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* You are owed */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-green-500 px-6 py-4">
            <h2 className="text-white text-xl font-semibold">You are owed</h2>
          </div>
          <div className="p-6">
            <p className="text-3xl font-bold text-green-600">${totalOwed.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">from {peopleWhoOwe.length} {peopleWhoOwe.length === 1 ? 'person' : 'people'}</p>
          </div>
        </div>
        
        {/* You owe */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-400 to-red-500 px-6 py-4">
            <h2 className="text-white text-xl font-semibold">You owe</h2>
          </div>
          <div className="p-6">
            <p className="text-3xl font-bold text-red-600">${totalOwing.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">to {peopleYouOwe.length} {peopleYouOwe.length === 1 ? 'person' : 'people'}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Balance Details</h2>
        
        {peopleWhoOwe.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-green-600">People who owe you</h3>
            <div className="space-y-2">
              {peopleWhoOwe.map((person, index) => (
                <div key={index} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{person.username}</p>
                    <p className="text-sm text-gray-500">Group: {person.group}</p>
                  </div>
                  <div className="text-green-600 font-semibold">${person.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {peopleYouOwe.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-red-600">People you owe</h3>
            <div className="space-y-2">
              {peopleYouOwe.map((person, index) => (
                <div key={index} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{person.username}</p>
                    <p className="text-sm text-gray-500">Group: {person.group}</p>
                  </div>
                  <div className="text-red-600 font-semibold">${person.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-500">
          Your total balance: 
          <span className={`font-semibold ml-1 ${userBalances.total_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${userBalances.total_balance.toFixed(2)}
          </span>
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {totalOwed >= totalOwing
            ? 'Overall, you are owed money.'
            : 'Overall, you owe money.'}
        </p>
      </div>
      
      <div className="mt-8 text-center">
        <Link to="/" className="text-cyan-500 hover:underline">
          Back to Groups
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;