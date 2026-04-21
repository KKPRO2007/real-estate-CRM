type PropertyCardProps = {
  title: string;
  location: string;
  price: string;
  status: string;
};

export default function PropertyCard({ title, location, price, status }: PropertyCardProps) {
  return (
    <article className="property-card">
      <div className="property-image" />
      <div className="card-row">
        <h3>{title}</h3>
        <span className="pill">{status}</span>
      </div>
      <p>{location}</p>
      <strong>{price}</strong>
    </article>
  );
}

