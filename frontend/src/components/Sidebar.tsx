import { NavLink } from "react-router-dom";

type SidebarProps = {
  links: Array<{ to: string; label: string }>;
};

export default function Sidebar({ links }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div>
        <div className="brand-mark">EF</div>
        <h2>EstateFlow</h2>
        <p className="sidebar-copy">Close faster, track every property, and keep every client conversation in one place.</p>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-user">
        <strong>Anika Sharma</strong>
        <span>Senior Broker</span>
      </div>
    </aside>
  );
}

