import React from "react";
import { Outlet } from "react-router-dom";
import SuperSideBar from "./SuperSideBar";

function SuperLayout() {
  return (
    <div className="flex h-screen bg-slate-50 font-poppins text-slate-800">
      <SuperSideBar />
      <main className="flex-1 p-8 overflow-y-auto transition-all duration-300 relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-slate-100/50 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default SuperLayout;