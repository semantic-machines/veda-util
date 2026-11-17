/**
 * veda-util — public API.
 *
 * Algorithms are pure functions over a NodePort; this module binds them to a
 * Model-like object and returns the original provider objects.
 */
import { fromModel } from './adapters/model.js';
import * as org from './core/org.js';
import * as classes from './core/classes.js';


const unwrap = (port) => (port ? (port.ref ?? port) : undefined);
const unwrapAll = (ports) => ports.map(unwrap);

/**
 * @param {*} model
 * @param {string} [chiefId]
 * @param {{maxDepth?: number}} [options]
 */
export async function getChief(model, chiefId, options) {
  return unwrap(await org.getChief(fromModel(model), chiefId, options));
}

/**
 * @param {*} model
 * @param {{maxDepth?: number}} [options]
 */
export async function getFieldChief(model, options) {
  return unwrap(await org.getFieldChief(fromModel(model), options));
}

/**
 * @param {*} model
 * @param {string} [chiefId]
 * @param {{maxDepth?: number}} [options]
 */
export async function getChiefDetail(model, chiefId, options) {
  return unwrap(await org.getChiefDetail(fromModel(model), chiefId, options));
}

/**
 * @param {*} model
 * @param {{maxDepth?: number}} [options]
 */
export async function getChiefDetails(model, options) {
  return unwrapAll(await org.getChiefDetails(fromModel(model), options));
}

/** Legacy name: walks v-s:hasChiefDetail, not v-s:hasChief. */
export const getDirectChiefs = getChiefDetails;

/**
 * @param {*} model
 * @param {{maxDepth?: number}} [options]
 */
export async function getOrganization(model, options) {
  return unwrap(await org.getOrganization(fromModel(model), options));
}

/**
 * @param {*} model
 * @param {string|*} unit
 * @param {{maxDepth?: number}} [options]
 */
export async function isSubUnitOf(model, unit, options) {
  return org.isSubUnitOf(fromModel(model), unit, options);
}

/**
 * @param {*} classModel
 * @param {{maxDepth?: number}} [options]
 */
export async function getSuperClasses(classModel, options) {
  return unwrapAll(await classes.getSuperClasses(fromModel(classModel), options));
}

/**
 * @param {*} classModel
 * @param {string|*} superClass
 * @param {{maxDepth?: number}} [options]
 */
export async function isSubClassOf(classModel, superClass, options) {
  return classes.isSubClassOf(fromModel(classModel), superClass, options);
}

/**
 * @param {*} model
 * @param {string|*} classRef
 * @param {{maxDepth?: number}} [options]
 */
export async function isInstanceOf(model, classRef, options) {
  return classes.isInstanceOf(fromModel(model), classRef, options);
}

export { fromModel };
export * as core from './core/index.js';
export * as adapters from './adapters/index.js';
