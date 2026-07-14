import styles from "./operations-dashboard.module.css";

const workflowAreas = [
  {
    label: "Caregiver intake",
    status: "Ready for webhook buildout",
    tone: "active"
  },
  {
    label: "References",
    status: "Airtable mapping identified",
    tone: "active"
  },
  {
    label: "Tasks",
    status: "Follow-up and review flow planned",
    tone: "active"
  },
  {
    label: "Client intake",
    status: "Queued",
    tone: "queued"
  },
  {
    label: "Matching",
    status: "Queued",
    tone: "queued"
  },
  {
    label: "Placements",
    status: "Queued",
    tone: "queued"
  }
];

export function OperationsDashboard() {
  return (
    <main className={styles.shell}>
      <section className={styles.header} aria-labelledby="dashboard-title">
        <div>
          <p className={styles.kicker}>Cradlesitters operations</p>
          <h1 id="dashboard-title">CradleOS</h1>
          <p className={styles.summary}>
            A working foundation for caregiver intake, reference checks, task
            routing, and future placement workflows.
          </p>
        </div>
        <div className={styles.statusPanel} aria-label="Current build status">
          <span className={styles.statusLabel}>Current phase</span>
          <strong>Repository initialized</strong>
          <span>Next.js, TypeScript, tests, and setup docs are in place.</span>
        </div>
      </section>

      <section className={styles.workflowGrid} aria-label="Workflow areas">
        {workflowAreas.map((area) => (
          <article className={styles.workflowCard} key={area.label}>
            <div className={styles.cardHeader}>
              <h2>{area.label}</h2>
              <span className={styles[area.tone]}>{area.tone}</span>
            </div>
            <p>{area.status}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
