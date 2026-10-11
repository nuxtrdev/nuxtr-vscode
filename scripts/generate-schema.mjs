/** Generate a portable Nuxt 4 completion schema from the package's public schema API. */
import { writeFile } from 'node:fs/promises';
import { NuxtConfigSchema } from '@nuxt/schema';
import { resolveSchema } from 'untyped';

/** Remove evaluated defaults, which can contain machine paths, credentials or environment-dependent values. */
function portableSchema (schema) {
    return JSON.stringify(schema, (key, value) => key === 'default' ? undefined : value, 2) + '\n';
}
const schema = await resolveSchema(NuxtConfigSchema);
schema.$comment = 'Generated from @nuxt/schema 4.6.1 by pnpm schema:generate. Nuxt 3 uses its retained 3.21.11 snapshot.';
await writeFile(new URL('../src/content/nuxt4.schema.json', import.meta.url), portableSchema(schema));
