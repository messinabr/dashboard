/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Visual configuration editor for the strategy.
 *
 * Home Assistant shows this element in the dashboard settings (⋮ → Edit dashboard) because the strategy class
 * exposes it via `static getConfigElement()`.
 *
 * Rules:
 * - Only the options that have a field here are touched. Everything else in the options (extra_badges, card_options,
 *   area features, etc.) is preserved as is.
 * - A value equal to the default is removed from the options instead of being written, to keep the YAML tidy.
 */

import type { ChipConfig } from '../utilities/chips';

type Obj = Record<string, any>;
type L = { pt: string; en: string };
type Kind = 'bool' | 'number' | 'select' | 'entity' | 'ratio';

interface Field {
  id: string;
  path: string[];
  kind: Kind;
  /** Default of the stored (raw) value. */
  def: any;
  /** The field shows the opposite of the stored boolean (for `hidden` options). */
  invert?: boolean;
  label: L;
  helper?: L;
  options?: { value: string; label: L }[];
  min?: number;
  max?: number;
}

interface Section {
  title: L;
  intro?: L;
  open?: boolean;
  /** Marks the chips section, which has its own list editor instead of plain fields. */
  chips?: boolean;
  fields: (hass: any) => Field[];
  /** Sub-categories: collapsible panels shown inside this section, after its own fields. */
  sub?: Section[];
}

const l = (pt: string, en: string): L => ({ pt, en });

const hiddenToggle = (id: string, path: string[], def: boolean, label: L, helper?: L): Field => ({
  id,
  path,
  kind: 'bool',
  def,
  invert: true,
  label,
  helper,
});

const DOMAINS: [string, L, L][] = [
  ['lock', l('Fechaduras', 'Locks'), l('Fechaduras e trincos.', 'Locks.')],
  ['binary_sensor', l('Sensores binários', 'Binary sensors'), l('Portas, janelas, presença e movimento (sensores liga/desliga).', 'Doors, windows, presence and motion (on/off sensors).')],
  ['camera', l('Câmeras', 'Cameras'), l('Câmeras de vigilância.', 'Cameras.')],
  ['light', l('Luzes', 'Lights'), l('Lâmpadas, fitas de LED e spots.', 'Lamps, LED strips and spots.')],
  ['scene', l('Cenas', 'Scenes'), l('Cenas salvas no Home Assistant.', 'Saved scenes.')],
  ['climate', l('Climatização', 'Climate'), l('Ar-condicionado e termostatos.', 'Air conditioners and thermostats.')],
  ['fan', l('Ventiladores', 'Fans'), l('Ventiladores e exaustores.', 'Fans.')],
  ['cover', l('Persianas e cortinas', 'Covers'), l('Cortinas, persianas e outros itens que abrem e fecham.', 'Curtains, blinds and other open/close devices.')],
  ['media_player', l('Players de mídia', 'Media players'), l('TVs, caixas de som e projetor.', 'TVs, speakers and projector.')],
  ['switch', l('Interruptores e tomadas', 'Switches'), l('Interruptores e tomadas inteligentes.', 'Smart switches and plugs.')],
  ['vacuum', l('Aspiradores', 'Vacuums'), l('Robôs aspiradores.', 'Robot vacuums.')],
  ['valve', l('Válvulas', 'Valves'), l('Válvulas (água, irrigação, gás).', 'Valves.')],
  ['select', l('Seleções', 'Selects'), l('Listas de opções que os dispositivos oferecem.', 'Option lists offered by devices.')],
  ['input_select', l('Seleções (auxiliares)', 'Input selects'), l('Listas de opções criadas por você como auxiliares.', 'Option lists you created as helpers.')],
  ['number', l('Números', 'Numbers'), l('Valores numéricos ajustáveis dos dispositivos.', 'Adjustable numeric values.')],
  ['sensor', l('Sensores', 'Sensors'), l('Medidores: temperatura, umidade, energia etc.', 'Meters: temperature, humidity, energy etc.')],
  ['default', l('Outros', 'Other'), l('Tudo que não se encaixa nos tipos acima.', 'Everything that does not fit the types above.')],
];

const VIEWS: [string, L, L][] = [
  ['home', l('Início', 'Home'), l('Tela inicial (pessoas, selos e cômodos). Se esconder, você perde a página principal.', 'Home screen. If hidden, the main page is gone.')],
  ['light', l('Luzes', 'Lights'), l('Todas as luzes da casa, agrupadas por cômodo.', 'All lights, grouped by area.')],
  ['fan', l('Ventiladores', 'Fans'), l('Todos os ventiladores, agrupados por cômodo.', 'All fans, grouped by area.')],
  ['cover', l('Persianas e cortinas', 'Covers'), l('Todas as persianas e cortinas, agrupadas por cômodo.', 'All covers, grouped by area.')],
  ['switch', l('Interruptores e tomadas', 'Switches'), l('Todos os interruptores e tomadas, agrupados por cômodo.', 'All switches, grouped by area.')],
  ['climate', l('Climatização', 'Climate'), l('Todo o ar-condicionado e termostatos, agrupados por cômodo.', 'All climate devices, grouped by area.')],
  ['camera', l('Câmeras', 'Cameras'), l('Todas as câmeras, agrupadas por cômodo.', 'All cameras, grouped by area.')],
  ['vacuum', l('Aspiradores', 'Vacuums'), l('Todos os aspiradores.', 'All vacuums.')],
  ['scene', l('Cenas', 'Scenes'), l('Todas as cenas.', 'All scenes.')],
  ['lock', l('Fechaduras', 'Locks'), l('Todas as fechaduras.', 'All locks.')],
  ['valve', l('Válvulas', 'Valves'), l('Todas as válvulas.', 'All valves.')],
];

const SECTIONS: Section[] = [
  {
    title: l('Geral', 'General'),
    open: true,
    intro: l(
      'As mudanças só valem depois de Salvar. Opções no valor padrão não ficam gravadas no YAML.',
      'Changes apply after Save. Options at their default are not written to the YAML.'
    ),
    fields: () => [
      {
        id: 'names',
        path: ['domains', '_', 'entity_names_only'],
        kind: 'bool',
        def: false,
        label: l('Mostrar só o nome da entidade', 'Show entity name only'),
        helper: l(
          'Tira o nome do cômodo/dispositivo da frente do nome do card. Ex.: "PORTA" em vez de "BANHEIRO PORTA CONTATO". Se a entidade não tem nome próprio, mantém o nome do dispositivo.',
          'Removes the area/device name from the front of the card name. If the entity has no name of its own, the device name is kept.'
        ),
      },
      {
        id: 'unavail',
        path: ['domains', '_', 'hide_unavailable_entities'],
        kind: 'bool',
        def: false,
        label: l('Esconder entidades indisponíveis', 'Hide unavailable entities'),
        helper: l(
          'Esconde o card enquanto a entidade estiver "indisponível" (ex.: lâmpada sem energia ou Wi-Fi caído). Ele volta sozinho quando a entidade volta. Desligado = o card aparece sempre.',
          'Hides the card while the entity is unavailable and shows it again when it comes back. Off = always shown.'
        ),
      },
      {
        id: 'cfg',
        path: ['domains', '_', 'hide_config_entities'],
        kind: 'bool',
        def: true,
        label: l('Esconder entidades de configuração', 'Hide config entities'),
        helper: l(
          'Esconde as entidades que o Home Assistant marca como "configuração" (ajustes internos do aparelho). Recomendado ligado, para o painel ficar limpo.',
          'Hides entities Home Assistant flags as "config" (internal device settings). Recommended on.'
        ),
      },
      {
        id: 'diag',
        path: ['domains', '_', 'hide_diagnostic_entities'],
        kind: 'bool',
        def: true,
        label: l('Esconder entidades de diagnóstico', 'Hide diagnostic entities'),
        helper: l(
          'Esconde as entidades marcadas como "diagnóstico" (qualidade do sinal, tempo ligado, botões de reiniciar...). Recomendado ligado.',
          'Hides entities flagged as "diagnostic" (signal quality, uptime, restart buttons...). Recommended on.'
        ),
      },
      {
        id: 'pos',
        path: ['show_positions'],
        kind: 'bool',
        def: false,
        label: l('Mostrar a posição (ordem) de cômodos, telas e domínios', 'Show positions (order)'),
        helper: l(
          'Modo de ajuste: escreve o número de ordem junto de cada cômodo, aba e tipo de dispositivo. Serve para saber qual valor "order" usar no YAML para reordenar. Deixe desligado no uso normal.',
          'Tuning mode: prints the order number next to each area, view and device type, to help reorder via YAML. Keep off normally.'
        ),
      },
      {
        id: 'stack',
        path: ['domains', '_', 'stack_count'],
        kind: 'number',
        def: 1,
        min: 1,
        max: 6,
        label: l('Cards por linha nas telas de domínio', 'Cards per row in domain views'),
        helper: l(
          'Quantos cards ficam lado a lado nas telas de cada tipo de dispositivo (luzes, ventiladores...). 1 = lista em coluna; 2 ou mais = grade. Sensores binários têm padrão próprio (2).',
          'How many cards sit side by side in device-type views. 1 = single column. Binary sensors have their own default (2).'
        ),
      },
    ],
    sub: [
    {
      title: l('Tipos de dispositivo', 'Device types'),
      intro: l(
        'Cada tipo de dispositivo tem uma seção dentro das telas dos cômodos. Desligue para esconder o tipo todo do dashboard (nada é apagado do Home Assistant).',
        'Each device type has a section inside the areas. Turn off to hide the whole type from the dashboard.'
      ),
      fields: () =>
        DOMAINS.map(([id, label, help]) =>
          hiddenToggle(`d_${id}`, ['domains', id, 'hidden'], false, { pt: `Mostrar: ${label.pt}`, en: `Show: ${label.en}` }, help)
        ),
    },
    ],
  },
  {
    title: l('Menu superior (abas)', 'Top menu (tabs)'),
    intro: l('As telas são as abas do menu no topo do dashboard. Desligue para tirar a aba do menu.', 'Views are the tabs in the top menu. Turn off to remove a tab.'),
    fields: () =>
      VIEWS.map(([id, label, help]) =>
        hiddenToggle(`v_${id}`, ['views', id, 'hidden'], false, { pt: `Mostrar: ${label.pt}`, en: `Show: ${label.en}` }, help)
      ),
  },
  {
    title: l('Selos (contadores no topo)', 'Badges'),
    intro: l('Selos são os contadores pequenos no topo da tela inicial. Escolha quais aparecem.', 'Badges are the small counters at the top of the home view.'),
    fields: () => [
      { id: 'b_light', path: ['badges', 'light_count'], kind: 'bool', def: true, label: l('Luzes acesas', 'Lights on'), helper: l('Selo com a quantidade de luzes acesas agora.', 'Badge with the number of lights currently on.') },
      { id: 'b_fan', path: ['badges', 'fan_count'], kind: 'bool', def: true, label: l('Ventiladores ligados', 'Fans on'), helper: l('Selo com a quantidade de ventiladores ligados.', 'Badge with the number of fans on.') },
      { id: 'b_cover', path: ['badges', 'cover_count'], kind: 'bool', def: true, label: l('Persianas abertas', 'Covers open'), helper: l('Selo com a quantidade de persianas e cortinas abertas.', 'Badge with the number of open covers.') },
      { id: 'b_switch', path: ['badges', 'switch_count'], kind: 'bool', def: true, label: l('Interruptores ligados', 'Switches on'), helper: l('Selo com a quantidade de interruptores e tomadas ligados.', 'Badge with the number of switches on.') },
      { id: 'b_climate', path: ['badges', 'climate_count'], kind: 'bool', def: true, label: l('Climatização ligada', 'Climate on'), helper: l('Selo com a quantidade de ar-condicionados e termostatos ligados.', 'Badge with the number of climate devices on.') },
      {
        id: 'b_weather',
        path: ['badges', 'weather_entity'],
        kind: 'entity',
        def: 'auto',
        label: l('Entidade do clima', 'Weather entity'),
        helper: l(
          'Entidade de clima usada nos selos de tempo e temperatura. Vazio = automática (usa a primeira entidade de clima encontrada).',
          'Weather entity used by the weather badges. Empty = automatic (first weather entity found).'
        ),
      },
    ],
  },
  {
    title: l('Chips (atalhos coloridos no topo)', 'Chips'),
    chips: true,
    intro: l(
      'Chips são os atalhos pequenos ao lado dos selos (ex.: pessoas em casa, alarme, cerca virtual, lixo). Cada um acompanha uma entidade e muda de ícone e cor conforme o estado dela. Os templates são gerados sozinhos.',
      'Chips are small shortcuts next to the badges. Each follows an entity and changes icon and color with its state.'
    ),
    fields: () => [],
  },
  {
    title: l('Tela inicial', 'Home view'),
    intro: l('Escolha o que aparece na tela inicial (a primeira aba do dashboard).', 'Choose what shows on the home view.'),
    fields: () => [
      hiddenToggle(
        'h_greeting',
        ['home_view', 'hidden', 'greeting'],
        true,
        l('Mostrar saudação', 'Show greeting'),
        l(
          'Mostra "Bom dia / Boa tarde / Boa noite" no topo. Faz parte da seção de pessoas: se "Mostrar pessoas" estiver desligado, a saudação some junto.',
          'Shows the greeting at the top. Part of the persons section: hidden along with it.'
        )
      ),
      hiddenToggle(
        'h_persons',
        ['home_view', 'hidden', 'persons'],
        false,
        l('Mostrar pessoas', 'Show persons'),
        l('Mostra os cards das pessoas (quem está em casa ou fora) no topo da tela inicial.', 'Shows the person cards at the top of the home view.')
      ),
      hiddenToggle(
        'h_badges',
        ['home_view', 'hidden', 'badges'],
        false,
        l('Mostrar selos', 'Show badges'),
        l('Mostra a faixa de selos (contadores e clima) no topo. Quais selos aparecem é escolhido na seção "Selos".', 'Shows the badge strip at the top. Which badges appear is set in the "Badges" section.')
      ),
      hiddenToggle(
        'h_areas_title',
        ['home_view', 'hidden', 'areas_title'],
        false,
        l('Mostrar título "Cômodos"', 'Show areas title'),
        l('Mostra o título "Cômodos" acima da lista de cômodos.', 'Shows the "Areas" heading above the area list.')
      ),
      hiddenToggle(
        'h_areas',
        ['home_view', 'hidden', 'areas'],
        false,
        l('Mostrar a lista de cômodos', 'Show areas list'),
        l('Mostra a grade de cômodos na tela inicial. Desligado = a lista não aparece na tela inicial.', 'Shows the area grid on the home view. Off = the list is not shown.')
      ),
      {
        id: 'h_stack',
        path: ['home_view', 'stack_count', '_'],
        kind: 'number',
        def: 2,
        min: 1,
        max: 6,
        label: l('Cards por linha na tela inicial', 'Cards per row in home view'),
        helper: l(
          'Quantos cards ficam lado a lado na tela inicial (pessoas, cômodos...). O padrão é 2; 1 deixa tudo em coluna.',
          'How many cards sit side by side on the home view. Default 2; 1 = single column.'
        ),
      },
    ],
    sub: [
    {
      title: l('Cômodos', 'Areas'),
      intro: l('A lista de cômodos vem do seu Home Assistant. Esconder aqui não apaga o cômodo, só tira do dashboard.', 'The list comes from your Home Assistant. Hiding here does not delete the area.'),
      fields: (hass) => {
        const fields: Field[] = [
          {
            id: 'a_type',
            path: ['areas', '_', 'type'],
            kind: 'select',
            def: 'AreaCard',
            label: l('Estilo do card de cômodo', 'Area card style'),
            helper: l(
              'Aparência dos cards de cômodo na tela inicial. "Mushroom" = ícone e nome (compacto). "Home Assistant" = card com a foto do cômodo. Vale para todos os cômodos.',
              'Look of the area cards on the home view. Applies to all areas.'
            ),
            options: [
              { value: 'AreaCard', label: l('Mushroom (ícone e texto)', 'Mushroom (icon and text)') },
              { value: 'HaAreaCard', label: l('Home Assistant (com imagem do cômodo)', 'Home Assistant (with picture)') },
            ],
          },
          {
            id: 'h_areas_by_floor',
            path: ['home_view', 'areas_by_floor'],
            kind: 'bool',
            def: false,
            label: l('Separar cômodos por andar', 'Group areas by floor'),
            helper: l(
              'Mostra um título por andar (Térreo, Primeiro Andar...) com os cômodos dele embaixo, no lugar do título "Cômodos". Usa os andares cadastrados no Home Assistant, em ordem de nível; andares com o mesmo nível seguem a ordem de criação. Desligado = uma lista só.',
              'Shows one title per floor (Ground, First floor...) with its areas below, instead of the "Areas" title. Uses the floors set up in Home Assistant, ordered by level; floors with the same level follow creation order. Off = a single list.'
            ),
          },
          {
            id: 'a_ratio',
            path: ['areas', '_', 'aspect_ratio'],
            kind: 'ratio',
            def: '',
            label: l('Altura da foto do cômodo (%)', 'Area picture height (%)'),
            helper: l(
              'Só vale para o estilo "Home Assistant". É a altura da foto em porcentagem da largura: quanto menor, mais fino o card (a foto é cortada em cima e embaixo). Padrão do HA = 56 (proporção 16:9). Ex.: 39 deixa o card bem mais fino. Também aceita proporção, como 16:9. Vazio = padrão.',
              'Only for the "Home Assistant" style. The picture height as a percentage of its width: the smaller, the thinner the card (the picture is cropped top and bottom). HA default = 56 (16:9). E.g. 39 makes the card much thinner. Also accepts a ratio like 16:9. Empty = default.'
            ),
          },
          hiddenToggle(
            'area_undisclosed',
            ['areas', 'undisclosed', 'hidden'],
            false,
            l('Mostrar: Entidades sem cômodo', 'Show: Entities without area'),
            l('Grupo das entidades que não têm cômodo definido no Home Assistant.', 'Group of entities that have no area set in Home Assistant.')
          ),
        ];
        const areas: Obj = hass?.areas ?? {};
        const list = Object.keys(areas)
          .map((id) => ({ id, name: String(areas[id]?.name ?? id) }))
          .sort((a, b) => a.name.localeCompare(b.name));

        for (const area of list) {
          fields.push(
            hiddenToggle(
              `area_${area.id}`,
              ['areas', area.id, 'hidden'],
              false,
              { pt: `Mostrar: ${area.name}`, en: `Show: ${area.name}` },
              l('Desligado = este cômodo não aparece no dashboard.', 'Off = this area is not shown in the dashboard.')
            )
          );
        }

        return fields;
      },
    },
    ],
  },
];

const CHIP_TXT = {
  title: l('Novo chip', 'New chip'),
  add: l('+ Adicionar chip', '+ Add chip'),
  up: l('Subir', 'Up'),
  down: l('Descer', 'Down'),
  del: l('Remover', 'Remove'),
  empty: l('Nenhum chip criado ainda.', 'No chips yet.'),
  whenOptions: [
    { value: 'is', label: l('o estado for igual a um valor', 'state equals a value') },
    { value: 'not', label: l('o estado for diferente de um valor', 'state differs from a value') },
    { value: 'gt0', label: l('o valor for um número maior que 0', 'value is a number above 0') },
  ],
  tapOptions: [
    { value: 'more-info', label: l('Abrir detalhes', 'Open details') },
    { value: 'toggle', label: l('Alternar (liga/desliga)', 'Toggle') },
    { value: 'none', label: l('Nada', 'Nothing') },
  ],
  fields: {
    name: [l('Nome do chip (só para você)', 'Chip name (for you only)'), l('Nome para identificar este chip aqui no editor, ex.: "Alarme" ou "Cerca virtual". Não aparece no dashboard. Em branco = usa o nome da entidade no Home Assistant.', 'A name to recognize this chip in the editor, e.g. "Alarm". It does not show on the dashboard. Empty = uses the entity name from Home Assistant.')],
    entity: [l('Entidade', 'Entity'), l('A entidade que o chip acompanha. O estado dela decide qual aparência o chip mostra.', 'The entity the chip follows. Its state decides the look.')],
    label: [l('Texto (opcional)', 'Text (optional)'), l('Texto pequeno mostrado no chip, ao lado do ícone.', 'Small text shown in the chip.')],
    when: [l('Chip ativo quando...', 'Chip is active when...'), l('Regra que define o estado 1 (ativo). Fora da regra, o chip fica no estado 2 (inativo).', 'Rule for state 1 (active). Otherwise the chip is in state 2.')],
    value: [l('Valor', 'Value'), l('Valor do estado a comparar, exatamente como aparece no HA (ex.: on, home, disarmed). Em branco = on.', 'State value to compare, as shown in HA. Empty = on.')],
    icon_on: [l('Ícone: estado 1 (ativo)', 'Icon: state 1 (active)'), l('Ícone mostrado quando o chip está ativo. Deixe igual ao do estado 2 para o ícone não mudar.', 'Icon when active. Keep equal to state 2 for a fixed icon.')],
    icon_off: [l('Ícone: estado 2 (inativo)', 'Icon: state 2 (inactive)'), l('Ícone mostrado quando o chip está inativo.', 'Icon when inactive.')],
    color_on: [l('Cor: estado 1 (ativo)', 'Color: state 1 (active)'), l('Cor do chip quando ativo. Padrão: verde.', 'Chip color when active. Default green.')],
    color_off: [l('Cor: estado 2 (inativo)', 'Color: state 2 (inactive)'), l('Cor do chip quando inativo. Padrão: cinza.', 'Chip color when inactive. Default grey.')],
    show_value: [l('Mostrar o valor no chip', 'Show the value in the chip'), l('Escreve o estado da entidade (ex.: um número) dentro do chip. Útil para contadores.', 'Prints the entity state inside the chip. Useful for counters.')],
    tap: [l('Ao tocar', 'On tap'), l('O que acontece ao tocar no chip. Cuidado com "Alternar" em itens sensíveis (alarme, cerca).', 'What tapping does. Be careful with Toggle on sensitive items.')],
  } as Record<string, [L, L]>,
};

const CHIP_DEFAULT: ChipConfig = {
  entity: '',
  when: 'is',
  value: 'on',
  icon_on: 'mdi:check-circle',
  icon_off: 'mdi:circle-outline',
  color_on: 'green',
  color_off: 'grey',
  tap: 'more-info',
};

const NO_CHIPS: ChipConfig[] = [];

const NOTE: L = l(
  'Selos extras, opções por cômodo (features, ícones, ordem) e card_options continuam no YAML e são preservados ao salvar por aqui.',
  'Extra badges, per-area options and card_options stay in YAML and are preserved when saving here.'
);

/**
 * Returns the options of a strategy config, whatever shape it has (flat, or inside `options`).
 * Values inside `options` win over flat ones.
 */
const optionsOf = (config: Obj | undefined): Obj => {
  const { type: _type, options, ...flat } = config ?? {};
  const merged: Obj = JSON.parse(JSON.stringify(flat));
  const legacy: Obj = options && typeof options === 'object' ? JSON.parse(JSON.stringify(options)) : {};
  const mergeInto = (target: Obj, source: Obj): void => {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        mergeInto(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  };

  mergeInto(merged, legacy);

  return merged;
};

/** Reads a value by path. */
const getPath = (obj: Obj | undefined, path: string[]): any => {
  let cur: any = obj;

  for (const key of path) {
    if (cur === undefined || cur === null || typeof cur !== 'object') return undefined;
    cur = cur[key];
  }

  return cur;
};

/** Writes a value by path, or removes it (pruning empty parents) when it equals the default. */
const setPath = (obj: Obj, path: string[], value: any, def: any): void => {
  if (value === def) {
    const parents: Obj[] = [obj];
    let cur: any = obj;

    for (const key of path.slice(0, -1)) {
      cur = cur?.[key];
      if (!cur || typeof cur !== 'object') return;
      parents.push(cur);
    }

    delete cur[path[path.length - 1] as string];

    for (let i = parents.length - 1; i > 0; i--) {
      if (Object.keys(parents[i] as Obj).length > 0) break;
      delete (parents[i - 1] as Obj)[path[i - 1] as string];
    }

    return;
  }

  let cur: Obj = obj;

  for (const key of path.slice(0, -1)) {
    if (!cur[key] || typeof cur[key] !== 'object') cur[key] = {};
    cur = cur[key];
  }

  cur[path[path.length - 1] as string] = value;
};

const STYLE = `
  mushroom-strategy-nv-editor { display: block; font-size: 13px; }
  mushroom-strategy-nv-editor ha-expansion-panel {
    display: block; margin-bottom: 6px;
    --expansion-panel-summary-padding: 0 12px;
    --expansion-panel-content-padding: 0;
  }
  mushroom-strategy-nv-editor ha-expansion-panel.nv-sub { margin: 6px 8px 8px; }
  mushroom-strategy-nv-editor .nv-head { font-size: 13px; font-weight: 500; }
  mushroom-strategy-nv-editor .nv-intro {
    font-size: 11px; line-height: 1.35; margin: 0; padding: 2px 12px 6px;
    color: var(--secondary-text-color);
  }
  mushroom-strategy-nv-editor .nv-row {
    display: flex; align-items: center; gap: 10px; padding: 5px 12px;
    border-top: 1px solid var(--divider-color, rgba(127,127,127,.25));
  }
  mushroom-strategy-nv-editor .nv-row.nv-col { flex-direction: column; align-items: stretch; gap: 4px; }
  mushroom-strategy-nv-editor .nv-txt { flex: 1; min-width: 0; }
  mushroom-strategy-nv-editor .nv-lbl { font-size: 13px; line-height: 1.25; color: var(--primary-text-color); }
  mushroom-strategy-nv-editor .nv-help { font-size: 11px; line-height: 1.3; margin-top: 1px; color: var(--secondary-text-color); }
  mushroom-strategy-nv-editor .nv-ctl { flex: none; display: flex; justify-content: flex-end; align-items: center; }
  mushroom-strategy-nv-editor .nv-sw { width: 40px; }
  mushroom-strategy-nv-editor .nv-sw ha-switch { transform: scale(.8); transform-origin: right center; }
  mushroom-strategy-nv-editor input.nv-in, mushroom-strategy-nv-editor select.nv-in {
    font: inherit; font-size: 13px; color: var(--primary-text-color);
    background: var(--secondary-background-color, rgba(127,127,127,.12));
    border: 1px solid var(--divider-color, rgba(127,127,127,.35)); border-radius: 6px; padding: 3px 6px;
  }
  mushroom-strategy-nv-editor input.nv-in { width: 52px; text-align: center; }
  mushroom-strategy-nv-editor select.nv-in { max-width: 190px; }
  mushroom-strategy-nv-editor .nv-form { zoom: .85; }
  mushroom-strategy-nv-editor .nv-chiphead { display: flex; align-items: center; gap: 6px; width: 100%; }
  mushroom-strategy-nv-editor .nv-chiptitle { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  mushroom-strategy-nv-editor .nv-btn {
    font: inherit; font-size: 12px; cursor: pointer; padding: 2px 8px; border-radius: 6px;
    color: var(--primary-text-color); background: transparent;
    border: 1px solid var(--divider-color, rgba(127,127,127,.4));
  }
  mushroom-strategy-nv-editor .nv-danger { color: var(--error-color, #db4437); }
  mushroom-strategy-nv-editor .nv-note { font-size: 11px; opacity: .7; margin: 6px 4px; }
`;

class MushroomStrategyEditor extends HTMLElement {
  private _hass: any;
  private _config: Obj | undefined;
  private _forms: any[] = [];
  private _built = false;
  private _open = new Set<string>();

  set hass(hass: any) {
    const first = !this._hass;

    this._hass = hass;
    this._forms.forEach((form) => (form.hass = hass));

    if (first) this._render();
  }

  setConfig(config: Obj): void {
    const next = JSON.parse(JSON.stringify(config ?? {}));

    // Our own config-changed echoes back here: nothing to rebuild when the content is the same.
    if (this._built && this._config && JSON.stringify(next) === JSON.stringify(this._config)) return;

    this._config = next;
    this._render();
  }

  private get _lang(): 'pt' | 'en' {
    const lang = String(this._hass?.locale?.language ?? this._hass?.language ?? 'en');

    return lang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  }

  private _value(field: Field): any {
    const raw = getPath(optionsOf(this._config), field.path);
    const value = raw === undefined ? field.def : raw;

    return field.invert ? !value : value;
  }

  private _row(field: Field, lang: 'pt' | 'en', control: HTMLElement | undefined, column = false): HTMLElement {
    const row = document.createElement('div');
    const txt = document.createElement('div');
    const lbl = document.createElement('div');

    row.className = column ? 'nv-row nv-col' : 'nv-row';
    txt.className = 'nv-txt';
    lbl.className = 'nv-lbl';
    lbl.textContent = field.label[lang];
    txt.appendChild(lbl);

    if (field.helper) {
      const help = document.createElement('div');

      help.className = 'nv-help';
      help.textContent = field.helper[lang];
      txt.appendChild(help);
    }

    row.appendChild(txt);
    if (control) row.appendChild(control);

    return row;
  }

  private _control(field: Field, lang: 'pt' | 'en'): { row: HTMLElement; form?: any } {
    const value = this._value(field);

    if (field.kind === 'bool') {
      const wrap = document.createElement('div');
      const sw: any = document.createElement('ha-switch');

      wrap.className = 'nv-ctl nv-sw';
      sw.checked = Boolean(value);
      sw.addEventListener('change', () => this._commit(field, Boolean(sw.checked)));
      wrap.appendChild(sw);

      return { row: this._row(field, lang, wrap) };
    }

    if (field.kind === 'number') {
      const wrap = document.createElement('div');
      const input = document.createElement('input');

      wrap.className = 'nv-ctl';
      input.className = 'nv-in';
      input.type = 'number';
      input.min = String(field.min ?? 0);
      input.max = String(field.max ?? 99);
      input.step = '1';
      input.value = String(value);
      input.addEventListener('change', () => {
        const n = Math.min(field.max ?? 99, Math.max(field.min ?? 0, Math.round(Number(input.value))));

        if (input.value === '' || Number.isNaN(n)) {
          input.value = String(this._value(field));

          return;
        }

        input.value = String(n);
        this._commit(field, n);
      });
      wrap.appendChild(input);

      return { row: this._row(field, lang, wrap) };
    }

    if (field.kind === 'ratio') {
      const wrap = document.createElement('div');
      const input = document.createElement('input');
      const shownValue = (v: unknown): string => String(v ?? '').replace(/%$/, '');

      wrap.className = 'nv-ctl';
      input.className = 'nv-in';
      input.type = 'text';
      input.inputMode = 'decimal';
      input.placeholder = '56';
      input.value = shownValue(value);
      input.addEventListener('change', () => {
        const text = input.value.trim().replace(',', '.');

        if (text === '') {
          this._commit(field, '');

          return;
        }

        // Plain number or "N%" = percentage; "A:B" or "AxB" = ratio. Anything else is rejected.
        const percent = /^(\d+(?:\.\d+)?)\s*%?$/.exec(text);
        const ratio = /^(\d+(?:\.\d+)?)\s*[:xX]\s*(\d+(?:\.\d+)?)$/.exec(text);

        if (percent && Number(percent[1]) > 0) {
          this._commit(field, `${percent[1]}%`);
        } else if (ratio && Number(ratio[1]) > 0 && Number(ratio[2]) > 0) {
          this._commit(field, `${ratio[1]}:${ratio[2]}`);
        } else {
          input.value = shownValue(this._value(field));
        }
      });
      wrap.appendChild(input);

      return { row: this._row(field, lang, wrap) };
    }

    if (field.kind === 'select') {
      const wrap = document.createElement('div');
      const select = document.createElement('select');

      wrap.className = 'nv-ctl';
      select.className = 'nv-in';
      (field.options ?? []).forEach((o) => {
        const opt = document.createElement('option');

        opt.value = o.value;
        opt.textContent = o.label[lang];
        select.appendChild(opt);
      });
      select.value = String(value);
      select.addEventListener('change', () => this._commit(field, select.value));
      wrap.appendChild(select);

      return { row: this._row(field, lang, wrap) };
    }

    // Entity picker: reuse ha-form with one entity selector (it loads the picker for us).
    const form: any = document.createElement('ha-form');

    form.className = 'nv-form';
    form.hass = this._hass;
    form.data = { [field.id]: value === field.def ? '' : value };
    form.schema = [{ name: field.id, required: false, selector: { entity: { domain: 'weather' } } }];
    form.computeLabel = () => '';
    form.addEventListener('value-changed', (ev: CustomEvent) => {
      ev.stopPropagation();
      this._commit(field, ev.detail?.value?.[field.id] ?? '');
    });

    return { row: this._row(field, lang, form, true), form };
  }

  /** Builds one collapsible panel for a section, including its sub-categories (nested panels). */
  private _panel(section: Section, lang: 'pt' | 'en'): HTMLElement {
    const fields = section.fields(this._hass);
    const panel: any = document.createElement('ha-expansion-panel');
    const head = document.createElement('div');

    head.slot = 'header';
    head.className = 'nv-head';
    head.textContent = section.title[lang];
    panel.appendChild(head);
    panel.outlined = true;
    panel.header = section.title[lang];
    panel.expanded = this._open.has(section.title.en) || (section.open === true && !this._open.has('__init'));
    panel.addEventListener('expanded-changed', (ev: CustomEvent) => {
      // Ignore events bubbling up from nested panels.
      if (ev.target !== panel) return;

      this._open.add('__init');

      if (ev.detail?.expanded) this._open.add(section.title.en);
      else this._open.delete(section.title.en);
    });

    if (section.intro) {
      const intro = document.createElement('p');

      intro.className = 'nv-intro';
      intro.textContent = section.intro[lang];
      panel.appendChild(intro);
    }

    if (section.chips) this._chipsBlocks(lang).forEach((block) => panel.appendChild(block));

    for (const field of fields) {
      const { row, form } = this._control(field, lang);

      panel.appendChild(row);
      if (form) this._forms.push(form);
    }

    for (const sub of section.sub ?? []) {
      const child = this._panel(sub, lang);

      child.classList.add('nv-sub');
      panel.appendChild(child);
    }

    return panel;
  }

  private _render(): void {
    if (!this._hass || !this._config) return;

    const lang = this._lang;

    this._built = true;
    this.innerHTML = '';
    this._forms = [];

    const style = document.createElement('style');

    style.textContent = STYLE;
    this.appendChild(style);

    for (const section of SECTIONS) this.appendChild(this._panel(section, lang));

    const note = document.createElement('p');

    note.className = 'nv-note';
    note.textContent = NOTE[lang];
    this.appendChild(note);
  }

  /** Applies one changed field to the config and notifies Home Assistant. */
  private _commit(field: Field, shown: any): void {
    if (!this._config) return;

    if (field.kind === 'entity' && !shown) shown = field.def;
    if (field.kind === 'number' && (shown === undefined || shown === null || Number.isNaN(Number(shown)))) return;
    if (shown === this._value(field)) return;

    const raw = field.invert ? !shown : field.kind === 'number' ? Number(shown) : shown;

    this._write(field.path, raw, field.def);
  }

  /** Writes (or removes, when equal to the default) one value and notifies Home Assistant. */
  private _write(path: string[], value: any, def: any): void {
    if (!this._config) return;

    // Work on a copy of the options, whatever shape the stored config has.
    const working = optionsOf(this._config);

    setPath(working, path, value, def);

    // Always store the flat shape: options directly next to `type` (no `options` key).
    const config: Obj = { type: this._config['type'], ...working };

    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }

  private _getChips(): ChipConfig[] {
    const value = getPath(optionsOf(this._config), ['badges', 'chips']);

    return Array.isArray(value) ? JSON.parse(JSON.stringify(value)) : [];
  }

  private _saveChips(chips: ChipConfig[]): void {
    this._write(['badges', 'chips'], chips.length ? chips : NO_CHIPS, NO_CHIPS);
  }

  private _chipSchema(chip: ChipConfig, lang: 'pt' | 'en'): any[] {
    const select = (options: { value: string; label: L }[]) => ({
      select: { mode: 'dropdown', options: options.map((o) => ({ value: o.value, label: o.label[lang] })) },
    });

    return [
      { name: 'name', required: false, selector: { text: {} } },
      { name: 'entity', required: true, selector: { entity: {} } },
      { name: 'label', required: false, selector: { text: {} } },
      { name: 'when', selector: select(CHIP_TXT.whenOptions) },
      ...(chip.when === 'gt0' ? [] : [{ name: 'value', required: false, selector: { text: {} } }]),
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'icon_on', required: false, selector: { icon: {} } },
          { name: 'icon_off', required: false, selector: { icon: {} } },
        ],
      },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'color_on', required: false, selector: { ui_color: { include_state: false, include_none: false } } },
          { name: 'color_off', required: false, selector: { ui_color: { include_state: false, include_none: false } } },
        ],
      },
      { name: 'show_value', selector: { boolean: {} } },
      { name: 'tap', selector: select(CHIP_TXT.tapOptions) },
    ];
  }

  private _button(text: string, onClick: () => void, danger = false): HTMLElement {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = danger ? 'nv-btn nv-danger' : 'nv-btn';
    button.textContent = text;
    button.addEventListener('click', (ev) => {
      ev.stopPropagation();
      onClick();
    });

    return button;
  }

  /** Title of a chip in the list: own name, then its text, then the entity's name in Home Assistant, then the entity id. */
  private _chipTitle(chip: ChipConfig, lang: 'pt' | 'en'): string {
    const friendly = chip.entity ? this._hass?.states?.[chip.entity]?.attributes?.friendly_name : undefined;

    return chip.name || chip.label || (typeof friendly === 'string' ? friendly : '') || chip.entity || CHIP_TXT.title[lang];
  }

  /** Builds the chips list editor (one collapsible block per chip, plus add/remove/reorder). */
  private _chipsBlocks(lang: 'pt' | 'en'): HTMLElement[] {
    const chips = this._getChips();
    const blocks: HTMLElement[] = [];

    if (!chips.length) {
      const empty = document.createElement('p');

      empty.className = 'nv-intro';
      empty.textContent = CHIP_TXT.empty[lang];
      blocks.push(empty);
    }

    chips.forEach((chip, index) => {
      const panel: any = document.createElement('ha-expansion-panel');
      const head = document.createElement('div');
      const title = document.createElement('span');
      const key = `chip${index}`;

      head.slot = 'header';
      head.className = 'nv-head nv-chiphead';
      title.className = 'nv-chiptitle';
      title.textContent = this._chipTitle(chip, lang);
      title.title = chip.entity ?? '';
      head.appendChild(title);

      if (index > 0) {
        head.appendChild(
          this._button('↑', () => {
            const list = this._getChips();

            [list[index - 1], list[index]] = [list[index] as ChipConfig, list[index - 1] as ChipConfig];
            this._saveChips(list);
            this._render();
          })
        );
      }

      if (index < chips.length - 1) {
        head.appendChild(
          this._button('↓', () => {
            const list = this._getChips();

            [list[index + 1], list[index]] = [list[index] as ChipConfig, list[index + 1] as ChipConfig];
            this._saveChips(list);
            this._render();
          })
        );
      }

      head.appendChild(
        this._button(
          CHIP_TXT.del[lang],
          () => {
            const list = this._getChips();

            list.splice(index, 1);
            this._saveChips(list);
            this._render();
          },
          true
        )
      );

      panel.appendChild(head);
      panel.outlined = true;
      panel.header = title.textContent;
      panel.expanded = this._open.has(key);
      panel.addEventListener('expanded-changed', (ev: CustomEvent) => {
        if (ev.detail?.expanded) this._open.add(key);
        else this._open.delete(key);
      });

      const form: any = document.createElement('ha-form');
      const current: ChipConfig = { ...CHIP_DEFAULT, ...chip };

      form.className = 'nv-form';
      form.hass = this._hass;
      form.data = current;
      form.schema = this._chipSchema(current, lang);
      form.computeLabel = (schema: { name: string }) => CHIP_TXT.fields[schema.name]?.[0][lang] ?? schema.name;
      form.computeHelper = (schema: { name: string }) => CHIP_TXT.fields[schema.name]?.[1][lang] ?? '';
      form.addEventListener('value-changed', (ev: CustomEvent) => {
        ev.stopPropagation();

        const next: ChipConfig = { ...(ev.detail?.value ?? {}) };
        const list = this._getChips();

        for (const k of Object.keys(next) as (keyof ChipConfig)[]) {
          if (next[k] === '' || next[k] === undefined || next[k] === null) delete next[k];
        }

        list[index] = next;
        this._saveChips(list);

        // The value field only exists for rules that compare with a value.
        if ((next.when === 'gt0') !== (current.when === 'gt0')) {
          current.when = next.when;
          form.schema = this._chipSchema(next, lang);
        }

        current.when = next.when;
        title.textContent = this._chipTitle(next, lang);
        title.title = next.entity ?? '';
      });

      const box = document.createElement('div');

      box.style.padding = '0 12px 8px';
      box.appendChild(form);
      panel.appendChild(box);
      blocks.push(panel);
      this._forms.push(form);
    });

    const addRow = document.createElement('div');

    addRow.className = 'nv-row';
    addRow.appendChild(
      this._button(CHIP_TXT.add[lang], () => {
        const list = this._getChips();

        list.push({ ...CHIP_DEFAULT });
        this._open.add(`chip${list.length - 1}`);
        this._saveChips(list);
        this._render();
      })
    );
    blocks.push(addRow);

    return blocks;
  }
}

if (!customElements.get('mushroom-strategy-nv-editor')) {
  customElements.define('mushroom-strategy-nv-editor', MushroomStrategyEditor);
}

export default MushroomStrategyEditor;
