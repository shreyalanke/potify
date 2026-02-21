import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from "./pages/SignUpPage";
import RoomPage from "./pages/RoomPage";


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
              <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
