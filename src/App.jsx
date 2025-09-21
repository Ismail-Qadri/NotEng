import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element= {<Login />} />
        <Route path="/permission" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
