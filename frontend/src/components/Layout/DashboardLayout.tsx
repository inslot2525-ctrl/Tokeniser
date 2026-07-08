import React from "react";
import Navbar from "../Navbar/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-8 py-10">{children}</main>
    </div>
  );
}
