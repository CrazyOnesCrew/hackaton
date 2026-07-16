import { Card } from "@/components/ui/card";

export function ContentPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold text-ink">{title}</h1>
      <p className="mb-6 text-sm text-ink-muted">{description}</p>
      <Card>
        <p className="text-sm text-ink-muted">
          Esta sección se completará en un ticket posterior del gestor de contenidos.
        </p>
      </Card>
    </div>
  );
}
