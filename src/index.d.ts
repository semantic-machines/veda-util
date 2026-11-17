/**
 * Minimal structural type of a veda-client Model / legacy IndividualModel.
 */
export interface ModelLike {
  readonly id: string;
  load(): Promise<unknown>;
  hasValue?(prop: string): boolean;
  get?(prop: string): unknown[];
  [prop: string]: unknown;
}

export interface DomainOptions {
  /** Maximum traversal depth. Default: 16 (10 for getChiefDetails). */
  maxDepth?: number;
  /**
   * Call model.load() before reading (default: true).
   * Set to false to keep the call free of I/O when models are already loaded.
   */
  load?: boolean;
}

export declare const VERSION: string;

export declare function getChief(
  model: ModelLike,
  chiefId?: string,
  options?: DomainOptions,
): Promise<ModelLike | undefined>;

export declare function getFieldChief(
  model: ModelLike,
  options?: DomainOptions,
): Promise<ModelLike | undefined>;

export declare function getChiefDetail(
  model: ModelLike,
  chiefId?: string,
  options?: DomainOptions,
): Promise<ModelLike | undefined>;

export declare function getChiefDetails(
  model: ModelLike,
  options?: DomainOptions,
): Promise<ModelLike[]>;

/** @deprecated Legacy name; walks v-s:hasChiefDetail. */
export declare const getDirectChiefs: typeof getChiefDetails;

export declare function getOrganization(
  model: ModelLike,
  options?: DomainOptions,
): Promise<ModelLike | undefined>;

export declare function isSubUnitOf(
  model: ModelLike,
  unit: string | ModelLike,
  options?: DomainOptions,
): Promise<boolean>;

export declare function getSuperClasses(
  classModel: ModelLike,
  options?: DomainOptions,
): Promise<ModelLike[]>;

export declare function isSubClassOf(
  classModel: ModelLike,
  superClass: string | ModelLike,
  options?: DomainOptions,
): Promise<boolean>;

export declare function isInstanceOf(
  model: ModelLike,
  classRef: string | ModelLike,
  options?: DomainOptions,
): Promise<boolean>;

export declare function fromModel(value: unknown): unknown;

export * as core from './core/index.js';
export * as adapters from './adapters/index.js';
