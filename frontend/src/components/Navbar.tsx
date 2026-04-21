export default function Navbar() {
  return (
    <header className="navbar">
      <div>
        <p className="eyebrow">Real estate operations</p>
        <h1>EstateFlow CRM</h1>
      </div>
      <div className="navbar-actions">
        <input className="search-input" type="search" placeholder="Search leads, listings, clients..." />
        <button className="primary-button" type="button">
          Add New
        </button>
      </div>
    </header>
  );
}

