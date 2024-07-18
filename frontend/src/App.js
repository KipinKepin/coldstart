import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import Users from './pages/Users';
import Preferences from './pages/Preferences';
import AddUser from './pages/AddUser';
import EditUser from './pages/EditUser';
import AddPreference from './pages/AddPreference';
import EditPreference from './pages/EditPreference';
import Register from './components/Register';
import RecommendationList from './components/RecommendationList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/users" element={<Users />} />
        <Route path="/users/add" element={<AddUser />} />
        <Route path="/users/edit/:id" element={<EditUser />} />

        <Route path='/recommendation' element={<RecommendationList />} />

        <Route path="/preferences" element={<Preferences />} />
        <Route path="/preferences/add" element={<AddPreference />} />
        <Route path="/preferences/edit/:id" element={<EditPreference />} />
      </Routes>
    </Router>
  );
}

export default App;
