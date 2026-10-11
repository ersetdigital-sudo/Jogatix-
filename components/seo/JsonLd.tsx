/** Renders a schema.org JSON-LD block. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be a raw script body; the payload is generated server-side from trusted config.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
