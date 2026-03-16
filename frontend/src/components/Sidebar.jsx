import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = {
  student: [
    { label: "Skills Market", path: "/home" },
    { label: "Profile", path: "/profile" },
    { label: "Career Quiz", path: "/quiz" },
  ],
  recruiter: [
    { label: "Dashboard", path: "/rechome" },
    { label: "JD Intelligence", path: "/recjd" },
    { label: "Profile", path: "/recprofile" },
  ],
};

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, switchRole } = useAuth();
  const role = user?.role || "student";
  const location = useLocation();
  const items = NAV_ITEMS[role] || NAV_ITEMS.student;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-950 text-slate-100 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          <div className="px-5 pt-6 pb-5 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Simation</p>
                <h2 className="text-lg font-semibold text-white">Simation</h2>
              </div>
              <button
                onClick={toggleSidebar}
                className="text-xs uppercase tracking-[0.25em] text-slate-400 hover:text-white md:hidden"
                aria-label="Close navigation"
              >
                Close
              </button>
            </div>
          </div>

          <div className="px-4 py-5 flex-1">
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400 mb-3">
              Navigation
            </p>
            <nav className="space-y-1">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    isActive(item.path)
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive(item.path) && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="px-4 pb-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400 mb-2">View As</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { switchRole("student"); toggleSidebar(); }}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                    role === "student"
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                      : "border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => { switchRole("recruiter"); toggleSidebar(); }}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                    role === "recruiter"
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                      : "border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  Recruiter
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
