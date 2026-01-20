import { Link, Outlet, useLocation } from "react-router-dom";
import { Flag, ScrollText, ShoppingCart } from "lucide-react";

const navItems = [
  { path: "/", label: "Feature Flags", icon: Flag },
  { path: "/audit", label: "Audit Log", icon: ScrollText },
  { path: "/checkout", label: "Consumer Preview", icon: ShoppingCart },
];

export function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex gap-6">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 text-sm font-medium ${
                location.pathname === path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
