type LeadCardProps = {
  name: string;
  stage: string;
  value: string;
  source: string;
};

export default function LeadCard({ name, stage, value, source }: LeadCardProps) {
  return (
    <article className="data-card">
      <div className="card-row">
        <h3>{name}</h3>
        <span className="pill">{stage}</span>
      </div>
      <p className="muted">Expected value {value}</p>
      <p className="muted">Source: {source}</p>
    </article>
  );
}

