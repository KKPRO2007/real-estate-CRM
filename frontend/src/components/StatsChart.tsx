type StatsChartProps = {
  title: string;
  data: Array<{ label: string; value: number }>;
};

export default function StatsChart({ title, data }: StatsChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <section className="panel">
      <div className="card-row">
        <h3>{title}</h3>
        <span className="muted">Last 6 months</span>
      </div>
      <div className="chart">
        {data.map((item) => (
          <div key={item.label} className="chart-bar-group">
            <div className="chart-track">
              <div className="chart-bar" style={{ height: `${(item.value / maxValue) * 100}%` }} />
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

