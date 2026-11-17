import { MAX_DEPTH, toId } from '../ports.js';

const HAS_CHIEF = 'v-s:hasChief';
const HAS_FIELD_CHIEF = 'v-s:hasFieldChief';
const HAS_CHIEF_DETAIL = 'v-s:hasChiefDetail';
const PARENT_UNIT = 'v-s:parentUnit';
const PARENT_ORGANIZATION = 'v-s:parentOrganization';
const ORGANIZATION = 'v-s:Organization';

/**
 * The only effect in the core: an explicit, opt-out lazy load.
 * With { load: false } the algorithms work on already loaded models only.
 */
async function ensureLoaded(node, options) {
  if (options.load !== false) await node.load();
}

async function findUp(node, prop, skipId, options, depth, visited) {
  const maxDepth = options.maxDepth ?? MAX_DEPTH;
  if (!node || depth > maxDepth || visited.has(node.id)) return undefined;
  visited.add(node.id);
  await ensureLoaded(node, options);
  const value = node.links(prop)[0];
  if (value && value.id !== skipId) return value;
  const parent = node.links(PARENT_UNIT)[0];
  return parent
    ? findUp(parent, prop, skipId, options, depth + 1, visited)
    : undefined;
}

/**
 * Chief of the unit (first v-s:hasChief above, excluding own id by default).
 * @param {import('../ports.js').NodePort} node
 * @param {string} [chiefId]
 * @param {{maxDepth?: number, load?: boolean}} [options]
 * @returns {Promise<import('../ports.js').NodePort|undefined>}
 */
export async function getChief(node, chiefId, options = {}) {
  return findUp(node, HAS_CHIEF, chiefId ?? node.id, options, 0, new Set());
}

/**
 * Detail chief (v-s:hasChiefDetail), same self-skip rule as getChief.
 * @param {import('../ports.js').NodePort} node
 * @param {string} [chiefId]
 * @param {{maxDepth?: number, load?: boolean}} [options]
 * @returns {Promise<import('../ports.js').NodePort|undefined>}
 */
export async function getChiefDetail(node, chiefId, options = {}) {
  return findUp(node, HAS_CHIEF_DETAIL, chiefId ?? node.id, options, 0, new Set());
}

/**
 * Field chief (v-s:hasFieldChief). No self-skip: first value wins.
 * @param {import('../ports.js').NodePort} node
 * @param {{maxDepth?: number, load?: boolean}} [options]
 * @returns {Promise<import('../ports.js').NodePort|undefined>}
 */
export async function getFieldChief(node, options = {}) {
  return findUp(node, HAS_FIELD_CHIEF, undefined, options, 0, new Set());
}

/**
 * All v-s:hasChiefDetail values along the parentUnit chain, deduplicated by id.
 * @param {import('../ports.js').NodePort} node
 * @param {{maxDepth?: number, load?: boolean}} [options]
 * @returns {Promise<import('../ports.js').NodePort[]>}
 */
export async function getChiefDetails(node, options = {}) {
  const maxDepth = options.maxDepth ?? 10;
  const result = [];
  const seen = new Set();
  let current = node;
  let depth = 0;
  while (current && depth <= maxDepth) {
    await ensureLoaded(current, options);
    for (const detail of current.links(HAS_CHIEF_DETAIL)) {
      if (seen.has(detail.id)) continue;
      seen.add(detail.id);
      result.push(detail);
    }
    current = current.links(PARENT_UNIT)[0];
    depth += 1;
  }
  return result;
}

/** Backwards-compatible name used by the legacy ontology. */
export const getDirectChiefs = getChiefDetails;

async function isOrganization(node, options) {
  await ensureLoaded(node, options);
  const types = node.links('rdf:type');
  return types.some((type) => type.id === ORGANIZATION);
}

/**
 * Nearest organization: self, v-s:parentOrganization or the first
 * v-s:parentUnit ancestor that is an instance of v-s:Organization.
 * @param {import('../ports.js').NodePort} node
 * @param {{maxDepth?: number, load?: boolean}} [options]
 * @returns {Promise<import('../ports.js').NodePort|undefined>}
 */
export async function getOrganization(node, options = {}) {
  const maxDepth = options.maxDepth ?? MAX_DEPTH;
  let current = node;
  let depth = 0;
  while (current && depth <= maxDepth) {
    if (await isOrganization(current, options)) return current;
    const parentOrganization = current.links(PARENT_ORGANIZATION)[0];
    if (parentOrganization && await isOrganization(parentOrganization, options)) {
      return parentOrganization;
    }
    current = current.links(PARENT_UNIT)[0];
    depth += 1;
  }
  return undefined;
}

/**
 * True when `unit` is an ancestor of `node` via v-s:parentUnit.
 * Self is not considered a subunit of itself.
 * @param {import('../ports.js').NodePort} node
 * @param {string|{id: string}} unit
 * @param {{maxDepth?: number, load?: boolean}} [options]
 * @returns {Promise<boolean>}
 */
export async function isSubUnitOf(node, unit, options = {}) {
  const unitId = toId(unit);
  const maxDepth = options.maxDepth ?? MAX_DEPTH;
  const visited = new Set();
  let current = node;
  let depth = 0;
  while (current && depth <= maxDepth && !visited.has(current.id)) {
    visited.add(current.id);
    await ensureLoaded(current, options);
    const parent = current.links(PARENT_UNIT)[0];
    if (!parent) return false;
    if (parent.id === unitId) return true;
    current = parent;
    depth += 1;
  }
  return false;
}
