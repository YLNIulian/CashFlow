// NotFoundPage.jsx - pagina de eroare 404
// Apare pentru orice ruta care nu exista in aplicatie

import { AlertIcon } from '../shared/icons.jsx';
import { EmptyState } from '../shared/components.jsx';

export default function NotFoundPage() {
  return (
    <div className="content-shell">
      <section className="wide-panel" style={{ marginTop: 40 }}>
        <EmptyState
          icon={AlertIcon}
          title="Page not found"
          description="This page does not exist."
        />
      </section>
    </div>
  );
}
