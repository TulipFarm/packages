import { appArgument } from "./canonical.js";
import { validateRepository } from "./validation.js";

const app = appArgument();
const packs = await validateRepository(app);
console.log(
  `Validated ${packs.length} Packs: schemas, catalog, dependencies, Tool inputs, examples, read-only authority, and generated parity${app ? "; canonical app compiler and Surface renderer checks passed" : ""}.`
);
