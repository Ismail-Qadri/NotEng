import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element= {<Login />} />
        <Route path="/permissions" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
