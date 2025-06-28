import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ExpenseForm from './ExpenseForm';

interface User {
  id: number;
  username: string;
}

interface Group {
  id: number;
  name: string;
  users: User[];
  total_expenses: number;
  member_count: number;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  paid_by: number;
}

interface Balance {
  from_user_id: number;
  from_username: string;
  to_user_id: number;
  to_username: string;
  amount: number;
}

const GroupDetails: React.FC<{ groupId: number }> = ({ groupId }) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const fetchGroupData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch group details
      const groupResponse = await fetch(`http://localhost:8000/groups/${groupId}`);
      if (!groupResponse.ok) {
        throw new Error(`Failed to fetch group details: ${groupResponse.status}`);
      }
      const groupData = await groupResponse.json();
      setGroup(groupData);

      // Fetch expenses
      const expensesResponse = await fetch(`http://localhost:8000/groups/${groupId}/expenses`);
      if (!expensesResponse.ok) {
        throw new Error(`Failed to fetch expenses: ${expensesResponse.status}`);
      }
      const expensesData = await expensesResponse.json();

      setExpenses(expensesData);

      // Fetch balances
      const balancesResponse = await fetch(`http://localhost:8000/groups/${groupId}/balances`);
      if (!balancesResponse.ok) {
        throw new Error(`Failed to fetch balances: ${balancesResponse.status}`);
      }
      const balancesData = await balancesResponse.json();
      setBalances(balancesData.balances || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Error loading group data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
    
  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const handleExpenseAdded = () => {
    // Refetch data after adding an expense
    fetchGroupData();
    setShowExpenseForm(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="p-8 text-center">
          <div className="animate-pulse text-gray-500">Loading group details...</div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Link to="/" className="text-cyan-500 hover:underline flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error || "Group not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link to="/" className="text-cyan-500 hover:underline flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <h1 className="text-4xl font-bold mb-6">{group.name}</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Members</h2>
        <div className="flex flex-wrap gap-2">
          {group.users.map(user => (
            <div key={user.id} className="bg-gray-100 rounded-full px-3 py-1 text-sm">
              {user.username}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold">Expenses</h2>
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="bg-cyan-500 shadow-lg shadow-cyan-500/50 rounded-md px-3 py-1 text-white"
          >
            {showExpenseForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>
        
        {showExpenseForm && (
          <div className="mb-6 p-4 border rounded-lg">
            <ExpenseForm groupId={groupId} onExpenseAdded={handleExpenseAdded} />
          </div>
        )}
        
        <div className="space-y-2">
          {expenses.length === 0 ? (
            <p className="text-gray-500">No expenses yet. Add your first expense!</p>
          ) : (
            expenses.map(expense => {
              const paidByUser = group.users.find(u => u.id === expense.paid_by);
              return (
                <div key={expense.id} className="p-4 border rounded-lg flex justify-between">
                  <div>
                    <h3 className="font-medium">{expense.description}</h3>
                    <p className="text-sm text-gray-500">
                      Paid by {paidByUser?.username || 'Unknown'}
                    </p>
                  </div>
                  <div className="font-semibold">${expense.amount.toFixed(2)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Balances</h2>
        {balances.length === 0 ? (
          <p className="text-gray-500">All settled up!</p>
        ) : (
          <div className="space-y-2">
            {balances.map((balance, i) => (
              <div key={i} className="p-4 border rounded-lg flex justify-between">
                <div>
                  <span className="font-medium">{balance.to_username}</span>
                  {' owes '}
                  <span className="font-medium">{balance.from_username}</span>
                </div>
                <div className="font-semibold text-green-600">${balance.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {group.total_expenses > 0 && (
        <div className="mt-12 mb-4 text-center">
          <p className="text-gray-500">
            Total group expenses: <span className="font-medium">${group.total_expenses.toFixed(2)}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;