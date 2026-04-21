type Column = {
  title: string;
  items: Array<{ name: string; amount: string }>;
};

type DealKanbanProps = {
  columns: Column[];
};

export default function DealKanban({ columns }: DealKanbanProps) {
  return (
    <div className="kanban-grid">
      {columns.map((column) => (
        <section key={column.title} className="kanban-column">
          <div className="card-row">
            <h3>{column.title}</h3>
            <span className="pill">{column.items.length}</span>
          </div>
          {column.items.map((item) => (
            <article key={`${column.title}-${item.name}`} className="data-card">
              <strong>{item.name}</strong>
              <p className="muted">{item.amount}</p>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

