export default function StatCard({ label, value, accent }) {
  return (
    <article className="stat-card" style={{ borderColor: accent }}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </article>
  );
}
