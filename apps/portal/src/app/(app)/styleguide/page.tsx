import { Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import { FormField, Input, InputAffix } from "@/components/ui/form";

// Página demo interna del design system (PAAG-002). Referencia visual para el
// resto de tickets del portal: paleta, tipografía y primitivos base.

const PALETTE = [
  { name: "primary", token: "--color-primary", hex: "#B9A5F5" },
  { name: "primary-soft", token: "--color-primary-soft", hex: "#EDE8FB" },
  { name: "accent", token: "--color-accent", hex: "#F5A623" },
  { name: "accent-soft", token: "--color-accent-soft", hex: "#FDF0DA" },
  { name: "surface", token: "--color-surface", hex: "#F5F6FA" },
  { name: "ink", token: "--color-ink", hex: "#1F2430" },
  { name: "ink-muted", token: "--color-ink-muted", hex: "#6B7280" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="font-heading mb-1 text-2xl font-extrabold text-ink">Guía de estilo</h1>
      <p className="mb-8 text-sm text-ink-muted">
        Tokens y primitivos del design system: paleta pastel lavanda + ámbar, Nunito,
        pills full-rounded y flat design sin sombras.
      </p>

      <Section title="Paleta de colores">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {PALETTE.map((color) => (
            <div key={color.name} className="overflow-hidden rounded-card border" style={{ borderColor: "var(--border)" }}>
              <div className="h-16" style={{ background: `var(${color.token})` }} />
              <div className="px-3 py-2">
                <p className="text-xs font-bold text-ink">{color.name}</p>
                <p className="text-[11px] text-ink-muted">{color.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografía (Nunito)">
        <Card className="space-y-2">
          <p className="text-2xl font-extrabold text-ink">Encabezado H1 — Extrabold 800</p>
          <p className="text-lg font-bold text-ink">Encabezado H2 — Bold 700</p>
          <p className="text-sm font-semibold text-ink">Etiqueta / metadato — Semibold 600</p>
          <p className="text-sm text-ink-muted">
            Cuerpo de texto regular 400 en gris medio, pensado para descripciones largas y
            contenido secundario.
          </p>
        </Card>
      </Section>

      <Section title="Botones (pill)">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Acción principal</Button>
          <Button variant="secondary">Acción secundaria</Button>
          <Button variant="ghost">Acción fantasma</Button>
          <Button variant="primary" disabled>
            Deshabilitado
          </Button>
          <Button variant="primary">
            <Sparkles size={16} /> Con icono
          </Button>
        </div>
      </Section>

      <Section title="Chips">
        <div className="flex flex-wrap items-center gap-3">
          <Chip variant="active">Activo · lavanda</Chip>
          <Chip variant="inactive">Inactivo · gris claro</Chip>
          <Chip variant="highlight">Destacado · dark</Chip>
          <Chip variant="active">
            <Zap size={13} /> Con icono
          </Chip>
        </div>
      </Section>

      <Section title="Cards (radius 24px, sin sombra)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="mb-1 text-base font-bold text-ink">Tarjeta plana</h3>
            <p className="text-sm text-ink-muted">
              Fondo surface gris muy claro que se separa del blanco por contraste, sin
              sombras ni bordes rígidos.
            </p>
          </Card>
          <Card className="bg-primary-soft">
            <h3 className="mb-1 text-base font-bold text-ink">Tarjeta lavanda suave</h3>
            <p className="text-sm text-ink-muted">
              Variante con fondo primario suave para bloques destacados.
            </p>
            <div className="mt-3">
              <Chip variant="highlight">Creado con IA</Chip>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Inputs (pill, fondo gris claro)">
        <Card className="max-w-md space-y-4">
          <FormField label="Nombre" htmlFor="sg-name" hint="Campo de texto estándar.">
            <Input id="sg-name" placeholder="Escribe tu nombre…" />
          </FormField>
          <FormField label="Correo" htmlFor="sg-email" error="Este correo no es válido.">
            <Input id="sg-email" type="email" defaultValue="correo@invalido" invalid />
          </FormField>
          <FormField label="Deshabilitado" htmlFor="sg-disabled">
            <Input id="sg-disabled" placeholder="No editable" disabled />
          </FormField>
          <FormField label="Con sufijo" htmlFor="sg-affix">
            <InputAffix id="sg-affix" affix="pts" inputMode="numeric" placeholder="0" />
          </FormField>
        </Card>
      </Section>
    </div>
  );
}
