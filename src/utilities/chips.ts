import { LovelaceBadgeConfig } from '../types/homeassistant/data/lovelace/config/badge';

/**
 * A "chip" is a small badge at the top of the home view that reflects one entity.
 *
 * The user fills simple fields (entity, icon and color for each of the two states, the condition that decides which
 * state is shown). The Jinja templates needed by `custom:mushroom-template-badge` are generated here, so nobody has to
 * write them by hand.
 */
export interface ChipConfig {
  /** Name used only to recognize the chip in the editor. It is not shown on the dashboard. */
  name?: string;
  /** Entity the chip follows. */
  entity: string;
  /** Optional text shown under the icon. */
  label?: string;
  /** When the chip is in state 1 (active): state equals `value`, state differs from `value`, or number above zero. */
  when?: 'is' | 'not' | 'gt0';
  /** Value compared with the entity state for `is` and `not`. Defaults to `on`. */
  value?: string;
  icon_on?: string;
  icon_off?: string;
  color_on?: string;
  color_off?: string;
  /** Shows the entity state as text inside the chip. */
  show_value?: boolean;
  /** What happens when the chip is tapped. */
  tap?: 'none' | 'more-info' | 'toggle';
}

/** Quotes a string as a Jinja string literal. */
const quote = (text: string): string => `'${String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/** Builds the Jinja condition that tells whether the chip is in state 1. */
export const chipCondition = (chip: ChipConfig): string => {
  const entity = quote(chip.entity);

  switch (chip.when) {
    case 'gt0':
      return `states(${entity}) | float(0) > 0`;
    case 'not':
      return `not is_state(${entity}, ${quote(chip.value ?? '')}) and states(${entity}) not in ['unavailable', 'unknown']`;
    default:
      return `is_state(${entity}, ${quote(chip.value ?? 'on')})`;
  }
};

/**
 * Converts a chip into a mushroom template badge configuration.
 *
 * @returns {LovelaceBadgeConfig | undefined} The badge, or undefined when the chip has no entity.
 */
export const chipToBadge = (chip: ChipConfig): LovelaceBadgeConfig | undefined => {
  if (!chip || typeof chip.entity !== 'string' || !chip.entity) return undefined;

  const condition = chipCondition(chip);
  const pick = (on: string | undefined, off: string | undefined): string | undefined => {
    if (!on && !off) return undefined;
    if (!on || !off || on === off) return on || off;

    return `{{ ${quote(on)} if ${condition} else ${quote(off)} }}`;
  };

  const badge: LovelaceBadgeConfig = {
    type: 'custom:mushroom-template-badge',
    entity: chip.entity,
    tap_action: { action: chip.tap ?? 'more-info' },
  };
  const icon = pick(chip.icon_on, chip.icon_off);
  const color = pick(chip.color_on ?? 'green', chip.color_off ?? 'grey');

  if (icon) badge['icon'] = icon;
  if (color) badge['color'] = color;
  if (chip.label) badge['label'] = chip.label;
  if (chip.show_value) badge['content'] = `{{ states(${quote(chip.entity)}) }}`;

  return badge;
};
