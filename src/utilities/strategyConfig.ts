import deepmerge from 'deepmerge';

/**
 * Returns the strategy options of a dashboard strategy config.
 *
 * Two shapes are supported:
 * - Flat (recommended): the options are placed directly in the strategy config, next to `type`.
 *   Home Assistant only opens the visual editor of a strategy for this shape.
 * - Legacy: the options are placed in the `options` key (config with only `type` and `options`).
 *
 * When both are used, the values of `options` win.
 */
export const getStrategyOptions = (strategy: Record<string, unknown> | undefined): Record<string, unknown> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, options, ...flat } = strategy ?? {};
  const legacy = options && typeof options === 'object' ? (options as Record<string, unknown>) : {};

  return deepmerge(flat, legacy);
};
