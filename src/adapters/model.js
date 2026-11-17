import { isNodePort } from '../ports.js';

function readValues(model, prop) {
  const raw = model[prop];
  if (raw === undefined || raw === null) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function isLink(value) {
  return Boolean(value) && typeof value === 'object' && typeof value.id === 'string';
}

/**
 * Wrap a veda-client Model into a NodePort.
 *
 * This is the only module that knows the client's data layout:
 *   - values live directly on the model (model['v-s:parentUnit']);
 *   - a property can be a single value or an array;
 *   - links are Model instances (objects with an id), literals are primitives.
 *
 * Unit of work here is the veda-client API: id, load(), hasValue(), props.
 *
 * @param {*} value
 * @returns {import('../ports.js').NodePort}
 */
export function fromModel(value) {
  if (isNodePort(value)) return value;
  if (!value || typeof value !== 'object'
    || typeof value.id !== 'string'
    || typeof value.load !== 'function') {
    throw new TypeError('fromModel expects a veda-client Model (id, load, hasValue)');
  }
  return {
    id: value.id,
    ref: value,
    has: (prop) => (typeof value.hasValue === 'function'
      ? value.hasValue(prop)
      : readValues(value, prop).length > 0),
    links: (prop) => readValues(value, prop).filter(isLink).map(fromModel),
    load: async () => { await value.load(); },
  };
}

export { fromModel as toNode };
