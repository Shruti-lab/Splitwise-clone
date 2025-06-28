import React, { useState, useEffect } from 'react';

interface ExpenseFormProps {
  groupId: number;
  onExpenseAdded: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ groupId, onExpenseAdded }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [users, setUsers] = useState<{ id: number, username: string }[]>([]);
  const [percentages, setPercentages] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch users in the group
    const fetchUsers = async () => {
      try {
        const response = await fetch(`http://localhost:8000/groups/${groupId}`);
        const data = await response.json();
        setUsers(data.users);
        
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, [groupId]);

  // Initialize equal percentages when users are loaded or split type changes
  useEffect(() => {
    if (splitType === 'percentage' && users.length > 0) {
      const equalPercent = Math.floor(100 / users.length);
      const initialPercentages: Record<number, number> = {};
      users.forEach((user, index) => {
        // Distribute 100% as evenly as possible
        initialPercentages[user.id] = index === users.length - 1 
          ? 100 - equalPercent * (users.length - 1) // Last user gets remainder
          : equalPercent;
      });
      setPercentages(initialPercentages);
    }
  }, [users, splitType]);

  const handlePercentChange = (userId: number, value: string) => {
    const newPercentage = parseInt(value) || 0;
    setPercentages({
      ...percentages,
      [userId]: newPercentage
    });
  };

  const getTotalPercentage = () => {
    return Object.values(percentages).reduce((sum, p) => sum + p, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !paidBy) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (splitType === 'percentage' && getTotalPercentage() !== 100) {
      alert('Percentages must sum to 100%');
      return;
    }
    
    setIsSubmitting(true);
    
    const expenseData = {
      description,
      amount: parseFloat(amount),
      paid_by: parseInt(paidBy),
      split_type: splitType,
      splits: splitType === 'percentage' ? percentages : {}
    };

    try {
      // In a real app, replace with actual API call
      const response = await fetch(`http://localhost:8000/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });
      
      // For now, we'll just simulate a successful response
      console.log('Submitting expense:', expenseData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and notify parent
      setDescription('');
      setAmount('');
      setPaidBy('');
      setSplitType('equal');
      onExpenseAdded();
      
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g., Dinner, Movie tickets"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Paid by</label>
        <select
          value={paidBy}
          onChange={e => setPaidBy(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select who paid</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Split type</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="equal"
              checked={splitType === 'equal'}
              onChange={() => setSplitType('equal')}
              className="mr-1"
            />
            Equal
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="percentage"
              checked={splitType === 'percentage'}
              onChange={() => setSplitType('percentage')}
              className="mr-1"
            />
            Percentage
          </label>
        </div>
      </div>
      
      {splitType === 'percentage' && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Percentage split (Total: {getTotalPercentage()}%)
          </label>
          {users.map(user => (
            <div key={user.id} className="flex items-center mb-2">
              <span className="w-1/3">{user.username}</span>
              <input
                type="number"
                value={percentages[user.id] || 0}
                onChange={e => handlePercentChange(user.id, e.target.value)}
                min="0"
                max="100"
                className="w-1/3 p-1 border rounded"
                required
              />
              <span className="ml-1">%</span>
            </div>
          ))}
          {getTotalPercentage() !== 100 && (
            <p className="text-red-500 text-sm">Total must be 100%</p>
          )}
        </div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-cyan-500 text-white p-2 rounded shadow-lg shadow-cyan-500/50 hover:bg-cyan-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;