import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

interface User {
  id: number;
  username: string;
  email: string;
}

interface GroupCreateModalProps {
  onGroupCreated?: (group: { id: number; name: string; member_count:number }) => void;
}


const GroupCreateModal: React.FC<GroupCreateModalProps> = ({onGroupCreated})=> {
  const [open, setOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all users when modal opens
  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers([])
      return
    }
    
    const filtered = allUsers.filter(user => 
      // Don't show already selected users
      !selectedUsers.some(selected => selected.id === user.id) &&
      // Match by username or email
      (user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredUsers(filtered)
  }, [searchTerm, allUsers, selectedUsers])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/users')
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data)
      } else {
        // Mock data for development
        setAllUsers([
          { id: 1, username: 'John Doe', email: 'john@example.com' },
          { id: 2, username: 'Jane Smith', email: 'jane@example.com' },
          { id: 3, username: 'Alice Johnson', email: 'alice@example.com' },
          { id: 4, username: 'Bob Brown', email: 'bob@example.com' },
          { id: 5, username: 'Chris Evans', email: 'chris@example.com' },
          { id: 6, username: 'Diana Prince', email: 'diana@example.com' },
          { id: 7, username: 'Elon Musk', email: 'elon@example.com' },
          { id: 8, username: 'Fiona Apple', email: 'fiona@example.com' },
        ])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Mock data for development
      setAllUsers([
        { id: 1, username: 'John Doe', email: 'john@example.com' },
        { id: 2, username: 'Jane Smith', email: 'jane@example.com' },
        { id: 3, username: 'Alice Johnson', email: 'alice@example.com' },
        { id: 4, username: 'Bob Brown', email: 'bob@example.com' },
        { id: 5, username: 'Chris Evans', email: 'chris@example.com' },
        { id: 6, username: 'Diana Prince', email: 'diana@example.com' },
        { id: 7, username: 'Elon Musk', email: 'elon@example.com' },
        { id: 8, username: 'Fiona Apple', email: 'fiona@example.com' },
      ])
    }
  }

  const addUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user])
    setSearchTerm('')
  }

  const removeUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId))
  }

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name")
      return
    }
    
    if (selectedUsers.length < 1) {
      alert("Please add at least one user")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('http://localhost:8000/groups/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          user_ids: selectedUsers.map(user => user.id)
        }),
      })
      
      if (response.ok) {
        const newGroup = await response.json();
        
        // Add users to the group object for display
        const groupWithUsers = {
          ...newGroup,
          users: selectedUsers
        };
        
        // Call the callback if provided
        if (onGroupCreated) {
          onGroupCreated(groupWithUsers);
        }
        
        // Reset form state
        setOpen(false);
        setGroupName('');
        setSelectedUsers([]);
      } else {
        alert('Failed to create group')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      alert('Error creating group')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  
  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-cyan-500 px-4 py-2 text-white font-semibold shadow-lg shadow-cyan-500/50 hover:bg-cyan-600"
      >
        Create Group
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-10">
        <DialogBackdrop
          className="fixed inset-0 bg-gray-500/75 transition-opacity"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <DialogPanel
              className="relative w-full max-w-lg transform  rounded-lg bg-white p-6 text-left shadow-xl transition-all max-h-[90vh]"
            >
              <div className="mb-5 ">
                <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 mb-4">
                  Create New Group
                </DialogTitle>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 px-3 py-2 border"
                      placeholder="Trip to Paris"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add Users
                    </label>
                    
                    {/* User search input */}
                    <div className="relative mb-2">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 px-3 py-2 border"
                        placeholder="Search users by name or email"
                      />
                      
                      {/* Dropdown for search results - with scrollable list */}
                      {filteredUsers.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
                          {filteredUsers.map(user => (
                            <div 
                              key={user.id}
                              className="cursor-pointer p-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                              onClick={() => addUser(user)}
                            >
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Selected users */}
                    <div className="mb-2 max-h-40 overflow-y-auto">
                      {selectedUsers.map(user => (
                        <div key={user.id} className="flex justify-between items-center p-2 mb-1 bg-gray-50 rounded-md">
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUser(user.id)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Remove</span>
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {selectedUsers.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No users added yet</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default GroupCreateModal;