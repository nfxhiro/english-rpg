export default function Loading() {
  return (
    <main className="route-loading" aria-live="polite" aria-busy="true">
      <div className="route-loading__mark" aria-hidden="true">
        EQ
      </div>
      <p>Loading...</p>
    </main>
  );
}
