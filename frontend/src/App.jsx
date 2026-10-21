import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";

import Landing from "./components/Landing";
import Login from "./components/Login";
import Register from "./components/Register";
import Portal from "./components/Portal";
import PortalSkeleton from "./components/PortalSkeleton";
import ReportFormat from "./components/ReportFormat";
import { SmoothScrollProvider } from "./context/SmoothScroll";

import "./App.css";

// In desktop file:// mode, HashRouter ensures instant route resolution without blank screens
const isDesktop = typeof window !== "undefined" && (window.location.protocol === "file:" || Boolean(window.electronAPI?.isDesktop));
const Router = isDesktop ? HashRouter : BrowserRouter;

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
