# Mushroom Strategy NV 🍄

🇧🇷 [Português](#português) · 🇺🇸 [English](#english)

> **Fork modificado** do [Mushroom Dashboard Strategy](https://github.com/DigiLive/mushroom-strategy) de Ferry Cools (DigiLive, atual mantenedor), criado originalmente por [Aalian Khan](https://github.com/AalianKhan/mushroom-strategy),
> licença BSD 3-Clause. O projeto original e sua documentação completa continuam em
> <https://digilive.github.io/mushroom-strategy/>. Este fork **não é afiliado nem endossado** pelo autor original.
>
> **Modified fork** of [Mushroom Dashboard Strategy](https://github.com/DigiLive/mushroom-strategy) by Ferry Cools (DigiLive, current maintainer), originally created by [Aalian Khan](https://github.com/AalianKhan/mushroom-strategy),
> BSD 3-Clause license. The original project and its full documentation remain at
> <https://digilive.github.io/mushroom-strategy/>. This fork is **not affiliated with or endorsed by** the original author.

---

## Português

### O que muda em relação ao original

| Novidade | O que faz |
|---|---|
| **Editor visual** | Configure a estratégia pela interface do HA (sem YAML), com explicação em cada opção. |
| **`entity_names_only`** | Os cartões mostram só o nome da entidade, sem repetir o nome do dispositivo (HA 2026.11+). |
| **Chips** | Selos no topo da tela inicial: escolha entidade, ícone e cor para cada um dos dois estados. Os templates Jinja são gerados automaticamente, sem escrever nada. |

O resto do comportamento (áreas, domínios, views, cartões) é o do projeto original. Veja a documentação dele para as demais opções.

### Instalação (HACS)

1. HACS → menu ⋮ → **Repositórios personalizados**.
2. Repositório: `https://github.com/messinabr/dashboard` · Tipo: **Dashboard** (plugin Lovelace).
3. Baixe **Mushroom Strategy NV** e recarregue o navegador.
4. Requer os cartões [Mushroom](https://github.com/piitaya/lovelace-mushroom) instalados.

Instalação manual: copie `dist/mushroom-strategy-nv.js` para `/config/www/community/mushroom-strategy-nv/` e adicione o recurso `/local/community/mushroom-strategy-nv/mushroom-strategy-nv.js` (tipo *JavaScript module*).

### Uso

Exemplo (troque a entidade pela sua). Crie um dashboard, edite no modo **Strategy** e escolha **Mushroom Strategy NV**. Ou use YAML:

```yaml
strategy:
  type: custom:mushroom-strategy-nv
  domains:
    _:
      entity_names_only: true
  badges:
    chips:
      - entity: alarm_control_panel.casa
        icon_on: mdi:shield-lock
        icon_off: mdi:shield-off
        color_on: green
        color_off: red
        when: is
        value: armed_away
        tap: more-info
```

### Opções de chip

| Campo | Descrição |
|---|---|
| `entity` | Entidade que o chip acompanha (obrigatório). |
| `label` | Texto opcional. |
| `when` | Quando está no estado 1: `is` (estado igual a `value`), `not` (diferente de `value`, ignorando indisponível), `gt0` (número maior que zero). |
| `value` | Valor comparado em `is` e `not` (padrão `on`). |
| `icon_on` / `icon_off` | Ícone do estado 1 e do estado 2. |
| `color_on` / `color_off` | Cor do estado 1 e do estado 2 (padrão verde e cinza). |
| `show_value` | Mostra o estado da entidade como texto no chip. |
| `tap` | Ao tocar: `none`, `more-info` (padrão) ou `toggle`. |

### Compilar

```bash
npm ci
npm run build   # gera dist/mushroom-strategy-nv.js
```

### Licença e créditos

BSD 3-Clause. Copyright (c) 2025 Ferry Cools; modificações (c) 2026 messinabr. Veja [LICENSE](LICENSE).
Todo o crédito pela base do projeto é de Aalian Khan (criador original), Ferry Cools (DigiLive) e colaboradores.

---

## English

### What is different from the original

| Feature | What it does |
|---|---|
| **Visual editor** | Configure the strategy from the HA UI (no YAML), with an explanation under every option. |
| **`entity_names_only`** | Cards show only the entity name, without repeating the device name (HA 2026.11+). |
| **Chips** | Badges at the top of the home view: pick an entity, an icon and a color for each of the two states. The Jinja templates are generated for you. |

Everything else (areas, domains, views, cards) behaves as in the original project. See its documentation for the remaining options.

### Install (HACS)

1. HACS → ⋮ menu → **Custom repositories**.
2. Repository: `https://github.com/messinabr/dashboard` · Type: **Dashboard** (Lovelace plugin).
3. Download **Mushroom Strategy NV** and reload the browser.
4. Requires the [Mushroom](https://github.com/piitaya/lovelace-mushroom) cards.

Manual install: copy `dist/mushroom-strategy-nv.js` to `/config/www/community/mushroom-strategy-nv/` and add the resource `/local/community/mushroom-strategy-nv/mushroom-strategy-nv.js` (type *JavaScript module*).

### Usage

Create a dashboard, edit it in **Strategy** mode and pick **Mushroom Strategy NV**. Or use YAML (see the example above).

### Chip options

| Field | Description |
|---|---|
| `entity` | Entity the chip follows (required). |
| `label` | Optional text. |
| `when` | When it is in state 1: `is` (state equals `value`), `not` (differs from `value`, ignoring unavailable), `gt0` (number above zero). |
| `value` | Value compared by `is` and `not` (default `on`). |
| `icon_on` / `icon_off` | Icon for state 1 and state 2. |
| `color_on` / `color_off` | Color for state 1 and state 2 (default green and grey). |
| `show_value` | Shows the entity state as text inside the chip. |
| `tap` | On tap: `none`, `more-info` (default) or `toggle`. |

### Build

```bash
npm ci
npm run build   # outputs dist/mushroom-strategy-nv.js
```

### License and credits

BSD 3-Clause. Copyright (c) 2025 Ferry Cools; modifications (c) 2026 messinabr. See [LICENSE](LICENSE).
All credit for the base project goes to Aalian Khan (original creator), Ferry Cools (DigiLive) and contributors.
