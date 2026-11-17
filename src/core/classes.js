import { MAX_DEPTH, toId } from '../ports.js';

async function ensureLoaded(node, options) {
  if (options.load !== false) await node.load();
}

/**
 * Transitive superclasses via rdfs:subClassOf (breadth-first, no cycles).
 * @param {import('../ports.js').NodePort} classNode
 * @param {{maxDepth?: number, load?: boolean}} [options]
 * @returns {Promise<import('../ports.js').NodePort[]>}
 */
export async function getSuperClasses(classNode, options = {}) {
  const maxDepth = options.maxDepth ?? MAX_DEPTH;
  const result = [];
  const seen = new Set([classNode.id]);
  let frontier = [classNode];
  let depth = 0;
  while (frontier.length && depth <= maxDepth) {
    const next = [];
    for (const node of frontier) {
      await ensureLoaded(node, options);
      for (const superClass of node.links('rdfs:subClassOf')) {
        if (seen.has(superClass.id)) continue;
        seen.add(superClass.id);
        result.push(superClass);
        next.push(superClass);
      }
    }
    frontier = next;
    depth += 1;
  }
  return result;
}

/**
 * True when `classNode` is a (transitive) subclass of `superClass`.
 * @param {import('../ports.js').NodePort} classNode
 * @param {string|{id: string}} superClass
 * @param {{maxDepth?: number, load?: boolean}} [options]
 * @returns {Promise<boolean>}
 */
export async function isSubClassOf(classNode, superClass, options = {}) {
  const superId = toId(superClass);
  const superClasses = await getSuperClasses(classNode, options);
  return superClasses.some((item) => item.id === superId);
}

/**
 * True when `node` is an instance of `classRef` (rdf:type + subclass walk).
 * Counterpart of the legacy IndividualModel#is().
 * @param {import('../ports.js').NodePort} node
 * @param {string|{id: string}} classRef
 * @param {{maxDepth?: number, load?: boolean}} [options]
 * @returns {Promise<boolean>}
 */
export async function isInstanceOf(node, classRef, options = {}) {
  const classId = toId(classRef);
  await ensureLoaded(node, options);
  const types = node.links('rdf:type');
  if (types.some((type) => type.id === classId)) return true;
  for (const type of types) {
    if (await isSubClassOf(type, classId, options)) return true;
  }
  return false;
}
