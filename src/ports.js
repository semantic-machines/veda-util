/**
 * Minimal read-only contract required by domain algorithms.
 *
 * Implementations live in ./adapters and are the only place that knows about
 * a concrete provider (veda-client Model, legacy IndividualModel, raw JSON...).
 *
 * @typedef {Object} NodePort
 * @property {string} id
 * @property {(prop: string) => boolean} has
 * @property {(prop: string) => NodePort[]} links
 * @property {() => Promise<void>} load
 * @property {*} [ref] original provider object (Model, record, ...)
 */

export const MAX_DEPTH = 16;

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isNodePort(value) {
  return Boolean(value)
    && typeof value === 'object'
    && typeof value.id === 'string'
    && typeof value.has === 'function'
    && typeof value.links === 'function'
    && typeof value.load === 'function';
}

/**
 * @param {string|{id: string}} value
 * @returns {string}
 */
export function toId(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value.id === 'string') return value.id;
  throw new TypeError('Expected an id string or an object with an id');
}
