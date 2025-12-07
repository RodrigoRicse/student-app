import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { useState } from "react";

export function MainLayout() {
  const [open, setOpen] = useState(true);

  return (
    <div className="layout">
      <Sidebar open={open} />

      <div className="layout__content">
        <Navbar onToggleSidebar={() => setOpen(!open)} />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
