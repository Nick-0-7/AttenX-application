import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./components/Landing";
import Login from "./components/Login";
import Register from "./components/Register";
import Portal from "./components/Portal";
import PortalSkeleton from "./components/PortalSkeleton";
import ReportFormat from "./components/ReportFormat";
import { SmoothScrollProvider } from "./context/SmoothScroll";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <SmoothScrollProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/portal-skeleton" element={<PortalSkeleton />} />
          <Route path="/reportformat" element={<ReportFormat />} />
        </Routes>
      </SmoothScrollProvider>
    </BrowserRouter>
  );
}

export default App;