export type Schema =
  | { type: 'integer'; minimum?: number; maximum?: number }
  | { type: 'string' }
  | { type: 'object'; required: string[]; additionalProperties: false; properties: Record<string, Schema> };

// Only the JSON Schema vocabulary used by our owned transport contracts.
export function matchesSchema(value: unknown, schema: Schema): boolean {
  if (schema.type === 'integer') {
    return typeof value === 'number' && Number.isSafeInteger(value)
      && (schema.minimum === undefined || value >= schema.minimum)
      && (schema.maximum === undefined || value <= schema.maximum);
  }
  if (schema.type === 'string') return typeof value === 'string';
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const object = value as Record<string, unknown>;
  return schema.required.every(key => Object.hasOwn(object, key))
    && Object.keys(object).every(key => {
      const property = schema.properties[key];
      return Object.hasOwn(schema.properties, key) && property !== undefined
        && matchesSchema(object[key], property);
    });
}
