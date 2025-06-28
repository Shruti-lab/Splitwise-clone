import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Contacts from './components/Contacts';
import GroupDetails from './components/GroupDetails';
import Dashboard from './components/Dashboard';
import './App.css';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Contacts />} />
        <Route path="/groups/:groupId" element={<GroupDetailsWrapper />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

// This wrapper component extracts the group ID from the URL
function GroupDetailsWrapper() {
  const { groupId } = useParams<{ groupId: string }>();
  return <GroupDetails groupId={parseInt(groupId || '0')} />;
}

export default App;