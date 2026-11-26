import { css } from "lit";

// Gestaltung nach dem GUI-Konzept HW18 (Version 1) und wie das Panel
// „Bewässerung“: nur Farben aus dem Theme (Papier/Schiefer), Farbe nur für
// Bedeutung (Farbgruppen), Rahmen 2 px, Radius 8, Kopfzeile wie die Seite.
// Feste Werte stehen nur als Rückfall, falls ein Theme eine Variable nicht
// kennt.
export const styles = css`
  :host {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background: var(--primary-background-color, #fafafa);
    color: var(--primary-text-color, #212121);
    font-family: var(--paper-font-body1_-_font-family, Roboto, "Noto Sans", sans-serif);
    --accent: var(--accent-color, var(--primary-color, #e3a23a));
    --card: var(--card-background-color, #fff);
    --line: var(--divider-color, rgba(0, 0, 0, 0.12));
    --muted: var(--secondary-text-color, #727272);
    --bad: var(--error-color, #db4437);
    --ok: var(--success-color, #43a047);
    --radius: 8px;
    --border: var(--ha-card-border-color, var(--divider-color));
    /* Rollen der Zonen nach Farbgruppen (GUI-Konzept, Abschnitt 2):
       Schlafen = purple, Präsenz/Haus = teal/cyan, Schlösser/Türen = green,
       Wärme/Küche (Ofen) = orange, Hund = amber, ignoriert = inaktiv. */
    --rz-bett: var(--purple-color, #926bc7);
    --rz-bereich: var(--teal-color, #009688);
    --rz-durchgang: var(--cyan-color, #00bcd4);
    --rz-tuer: var(--green-color, #4caf50);
    --rz-stelle: var(--orange-color, #ff9800);
    --rz-hund: var(--amber-color, #ffc107);
    --rz-ignorieren: var(--state-inactive-color, #b3aa9c);
    /* Figuren: Mensch in der Haus-Farbe, vermutlich Hund amber */
    --rz-person: var(--teal-color, #009688);
    --rz-tier: var(--amber-color, #ffc107);
    --rz-heat: var(--rgb-deep-orange-color, 255, 87, 34);
  }
  * {
    box-sizing: border-box;
  }
  ha-icon {
    --mdc-icon-size: 20px;
  }

  /* Kopfzeile */
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--header-height, 56px);
    padding: 0 12px;
    background: var(--primary-background-color);
    color: var(--primary-text-color);
    border-bottom: 2px solid var(--divider-color);
    flex-shrink: 0;
  }
  header .title {
    font-size: 20px;
    font-weight: 400;
    margin-left: 4px;
    white-space: nowrap;
  }
  header .menu {
    display: none;
  }
  :host([narrow]) header .menu {
    display: inline-flex;
  }
  :host([narrow]) header .title {
    display: none;
  }
  header .spacer {
    flex: 1;
  }
  header button.icon,
  header button.text {
    color: inherit;
  }
  header button:disabled {
    opacity: 0.45;
  }
  header button.primary {
    background: color-mix(in srgb, currentColor 10%, transparent);
    color: inherit;
  }
  header button.primary:not(:disabled) {
    /* einzige gefüllte Hauptaktion: Tinte als Fläche */
    background: var(--primary-text-color);
    color: var(--card-background-color, #fff);
  }
  .pages {
    display: flex;
    gap: 2px;
    margin-left: 16px;
    background: color-mix(in srgb, currentColor 8%, transparent);
    border-radius: 999px;
    padding: 3px;
    overflow-x: auto;
    scrollbar-width: none;
    min-width: 0;
  }
  .pages button {
    color: inherit;
    padding: 5px 14px;
    font-size: 14px;
    gap: 6px;
    white-space: nowrap;
  }
  .pages button.active {
    background: var(--card);
    color: var(--accent);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }
  :host([narrow]) .pages {
    margin-left: 4px;
  }
  .live-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 13px;
    background: color-mix(in srgb, currentColor 8%, transparent);
    white-space: nowrap;
  }
  .live-chip .led {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bad);
  }
  .live-chip.down {
    /* nicht erreichbar: gestrichelt, nie leer oder „aus“ (GUI-Konzept 7) */
    outline: 2px dashed var(--state-inactive-color, #b3aa9c);
    outline-offset: -2px;
    color: var(--secondary-text-color);
  }
  .live-chip.ok .led {
    background: var(--ok);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ok) 25%, transparent);
  }
  :host([narrow]) .live-chip .text,
  :host([narrow]) header .label {
    display: none;
  }

  /* Knöpfe */
  button {
    font: inherit;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    background: none;
    color: var(--accent);
    transition: background 0.15s;
  }
  button:disabled {
    cursor: default;
    opacity: 0.5;
  }
  button.icon {
    width: 40px;
    height: 40px;
    justify-content: center;
    color: var(--primary-text-color);
  }
  button.icon:hover:not(:disabled),
  button.text:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 10%, transparent);
  }
  button.text {
    padding: 7px 12px;
    font-weight: 500;
    font-size: 14px;
  }
  button.text.small {
    padding: 4px 10px;
    font-size: 13px;
  }
  button.text.danger {
    color: var(--bad);
  }
  button.primary {
    padding: 8px 16px;
    font-weight: 500;
    background: var(--primary-text-color);
    color: var(--card);
  }

  /* Aufteilung */
  .layout {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
  .stage {
    position: relative;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    background: var(--secondary-background-color, #e5e5e5);
    touch-action: none;
  }
  .side {
    width: 360px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border-left: 1px solid var(--line);
    min-height: 0;
  }
  :host([narrow]) .layout {
    flex-direction: column;
  }
  :host([narrow]) .stage {
    flex: none;
    height: 58vh;
  }
  :host([narrow]) .side {
    width: auto;
    flex: 1;
    border-left: none;
    border-top: 1px solid var(--line);
  }
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--line);
  }
  .tabs button {
    flex: 1;
    justify-content: center;
    border-radius: 0;
    padding: 14px 8px 12px;
    color: var(--muted);
    border-bottom: 2px solid transparent;
    font-weight: 500;
  }
  .tabs button.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }
  .side-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px 24px;
  }
  h3 {
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    margin: 20px 4px 8px;
  }
  .hint {
    color: var(--muted);
    line-height: 1.45;
    margin: 12px 4px;
    font-size: 14px;
  }
  .hint.small {
    font-size: 12.5px;
    margin: 6px 0;
  }
  .note {
    font-size: 13px;
    line-height: 1.45;
    padding: 8px 12px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    margin: 8px 0;
  }
  .note.warn {
    background: color-mix(in srgb, var(--bad) 12%, transparent);
  }

  /* Liste der Zonen */
  .list {
    list-style: none;
    padding: 0;
    margin: 4px 0;
  }
  .item {
    border-radius: 10px;
    margin: 2px 0;
    transition: background 0.15s;
  }
  .item.open {
    background: color-mix(in srgb, var(--zone, var(--accent)) 9%, transparent);
    box-shadow: inset 3px 0 0 var(--zone, var(--accent));
  }
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 8px;
    cursor: pointer;
    border-radius: 10px;
  }
  .row:hover {
    background: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--zone);
    flex-shrink: 0;
  }
  .row ha-icon {
    color: var(--muted);
  }
  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }
  .name small {
    display: block;
    color: var(--muted);
    font-weight: 400;
    font-size: 12px;
    white-space: normal;
  }
  .badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
  .badge.on {
    background: color-mix(in srgb, var(--zone, var(--accent)) 18%, transparent);
    color: var(--primary-text-color);
    box-shadow: inset 0 0 0 2px var(--zone, var(--accent));
  }
  .badge.off {
    background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    color: var(--muted);
  }
  .badge.unreachable {
    outline: 2px dashed var(--state-inactive-color, #b3aa9c);
    outline-offset: -2px;
  }
  .badge.new {
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--accent);
  }
  .inspector {
    padding: 0 12px 12px 30px;
  }
  .field {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    color: var(--muted);
    gap: 3px;
    position: relative;
    flex: 1;
    min-width: 0;
    margin: 8px 0;
  }
  .field .unit {
    position: absolute;
    right: 10px;
    bottom: 9px;
    font-size: 13px;
  }
  .fields {
    display: flex;
    gap: 8px;
  }
  .fields .field {
    margin: 4px 0;
  }
  input,
  select {
    font: inherit;
    font-size: 14px;
    color: var(--primary-text-color);
    background: var(--input-fill-color, color-mix(in srgb, var(--primary-text-color) 5%, transparent));
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 8px 10px;
    width: 100%;
    min-width: 0;
  }
  input:focus,
  select:focus {
    outline: 2px solid var(--accent);
    outline-offset: -1px;
  }
  .field input {
    padding-right: 30px;
  }
  .label-text {
    font-size: 12px;
    color: var(--muted);
    margin: 10px 0 4px;
  }
  .levels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .levels button {
    padding: 5px 10px;
    font-size: 12.5px;
    border: 1px solid var(--line);
    color: var(--primary-text-color);
  }
  .levels button ha-icon {
    --mdc-icon-size: 16px;
  }
  .levels button.active {
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    border-color: var(--accent);
    color: var(--primary-text-color);
  }
  /* Auswertung: Zeitleisten */
  .ausw .item {
    padding-bottom: 8px;
  }
  .row.static {
    cursor: default;
  }
  .row.static:hover {
    background: none;
  }
  .dauer {
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    font-size: 13px;
    white-space: nowrap;
  }
  svg.leiste {
    display: block;
    width: calc(100% - 38px);
    height: 10px;
    margin: 0 8px 0 30px;
  }
  .leiste-grund {
    fill: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
  }
  .achse {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--muted);
    margin: 0 8px 8px 30px;
  }
  image.heat {
    pointer-events: none;
  }
  .summary {
    font-size: 13px;
    line-height: 1.45;
    margin: 10px 0 4px;
  }
  .check {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 8px 0;
    font-size: 14px;
    cursor: pointer;
  }
  .check input {
    width: 18px;
    height: 18px;
    flex: none;
    margin: 1px 0 0;
    accent-color: var(--accent);
  }
  .check small {
    display: block;
    color: var(--muted);
    font-size: 12px;
  }
  details.fine {
    margin: 8px 0 0;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 6px 10px;
  }
  details.fine summary {
    cursor: pointer;
    color: var(--accent);
    font-weight: 500;
    font-size: 14px;
    padding: 2px 0;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
  }
  .actions .spacer {
    flex: 1;
  }
  .marker-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--rz-bereich) 15%, transparent);
    border-radius: 50%;
  }
  .marker-icon ha-icon {
    --mdc-icon-size: 16px;
    color: var(--rz-bereich);
  }
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 12px;
    margin: 4px 0 8px;
    font-size: 13.5px;
  }
  dt {
    color: var(--muted);
  }
  dd {
    margin: 0;
  }

  /* Plan */
  svg.plan {
    display: block;
    width: 100%;
    height: 100%;
    user-select: none;
    -webkit-user-select: none;
  }
  svg.plan.drawing {
    cursor: crosshair;
  }
  svg.plan.painting {
    cursor: cell;
  }
  .grid {
    stroke: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    stroke-width: 1;
  }
  .grid.major {
    stroke: color-mix(in srgb, var(--primary-text-color) 15%, transparent);
  }
  .floor {
    fill: color-mix(in srgb, var(--card) 75%, transparent);
  }
  .floor.belegt {
    fill: color-mix(in srgb, var(--rz-bereich) 22%, var(--card));
  }
  /* Raum hinzufügen */
  .neu-raum {
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 12px 12px;
    margin: 8px 0 12px;
  }
  .melder-liste {
    list-style: none;
    margin: 4px 0;
    padding: 0;
    max-height: 260px;
    overflow: auto;
  }
  .melder-liste .check {
    margin: 4px 0;
  }
  .melder-liste small {
    color: var(--muted);
    display: block;
  }
  .wall {
    fill: none;
    stroke: var(--secondary-text-color, #665e54);
    stroke-width: 6;
    stroke-linejoin: round;
  }
  .coverage {
    fill: color-mix(in srgb, var(--accent) 9%, transparent);
    stroke: color-mix(in srgb, var(--accent) 55%, transparent);
    stroke-width: 1.5;
    stroke-dasharray: 6 5;
    pointer-events: none;
  }
  .zone-shape {
    stroke-width: 2;
    stroke-linejoin: round;
    cursor: pointer;
  }
  .zone-shape.selected {
    stroke-width: 3;
  }
  .label {
    text-anchor: middle;
    fill: var(--primary-text-color);
    stroke: var(--card);
    stroke-width: 3px;
    paint-order: stroke;
    stroke-linejoin: round;
    font-weight: 600;
    font-size: 13px;
    pointer-events: none;
  }
  .label .sub {
    font-weight: 400;
    font-size: 12px;
  }
  .handle {
    fill: var(--card);
    stroke: var(--accent);
    stroke-width: 2.5;
    cursor: move;
  }
  .handle.angle {
    fill: var(--accent);
    stroke: var(--primary-text-color);
    cursor: grab;
  }
  .sensor-body {
    fill: var(--primary-text-color);
    stroke: var(--card);
    stroke-width: 2;
    cursor: move;
  }
  .sensor-wave {
    fill: none;
    stroke: var(--card);
    stroke-width: 1.6;
    stroke-linecap: round;
    pointer-events: none;
  }
  .sensor-line {
    stroke: var(--secondary-text-color);
    stroke-width: 1.5;
    stroke-dasharray: 3 3;
  }
  .figure {
    stroke: var(--card);
    stroke-width: 2.5;
  }
  .figure.held {
    fill: none;
    stroke-dasharray: 4 3;
    stroke-width: 2;
  }
  .trail {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.45;
  }
  .target {
    stroke: var(--muted);
    stroke-width: 1.5;
  }
  .draft {
    fill: color-mix(in srgb, var(--rz-bereich) 15%, transparent);
    stroke: var(--primary-text-color);
    stroke-width: 1.5;
    stroke-dasharray: 5 4;
  }
  .draft-dot {
    fill: var(--primary-text-color);
  }
  .close-ring {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2.5;
  }

  /* Werkzeuge am Plan */
  .tools {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }
  .tools button.icon {
    border-radius: 0;
  }
  .tools button.on {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
  .tools .sep {
    height: 1px;
    background: var(--line);
    margin: 2px 6px;
  }
  :host([narrow]) .tools {
    flex-direction: row;
    top: 8px;
    left: 8px;
    max-width: calc(100% - 16px);
    overflow-x: auto;
  }
  :host([narrow]) .tools button.icon {
    width: 36px;
    height: 36px;
    flex: none;
  }
  :host([narrow]) .tools .sep {
    width: 1px;
    height: auto;
    margin: 6px 2px;
  }
  :host([narrow]) .layers {
    top: 52px;
    left: 8px;
  }
  .layers {
    position: absolute;
    top: 12px;
    left: 64px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.22);
    padding: 8px 12px;
    min-width: 240px;
    z-index: 3;
  }
  .layers .check {
    margin: 4px 0;
  }
  .scalebar {
    position: absolute;
    left: 12px;
    bottom: 12px;
    font-size: 12px;
    background: color-mix(in srgb, var(--card) 85%, transparent);
    padding: 4px 8px;
    border-radius: 6px;
    pointer-events: none;
  }
  .scalebar div {
    height: 6px;
    border: 2px solid var(--primary-text-color);
    border-top: none;
    margin-bottom: 2px;
  }
  .bubble {
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 10px 10px 10px 16px;
    background: var(--card);
    border-radius: var(--radius);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    line-height: 1.4;
    width: max-content;
    max-width: min(92%, 640px);
  }
  .bubble ha-icon {
    --mdc-icon-size: 26px;
    color: var(--accent);
    flex: none;
  }
  .bubble .grow {
    flex: 1;
  }
  :host([narrow]) .bubble {
    font-size: 13px;
    bottom: 12px;
  }
  .toast {
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    background: var(--primary-text-color);
    color: var(--card-background-color, #fff);
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.35);
    font-size: 14px;
    z-index: 10;
    max-width: 90vw;
  }
  .empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    text-align: center;
    padding: 24px;
    line-height: 1.5;
  }
  .empty ha-icon {
    --mdc-icon-size: 48px;
  }
  .empty p {
    max-width: 520px;
  }

  /* Hausplan */
  .wall.guess {
    stroke-dasharray: 6 5;
    stroke-width: 2;
  }
  .wall.selected {
    stroke: var(--accent);
  }
  .label.room {
    font-size: 15px;
    font-weight: 600;
  }
  .link {
    stroke: var(--rz-tuer);
    stroke-width: 3;
    stroke-dasharray: 2 6;
    stroke-linecap: round;
  }
  .link-dot {
    fill: var(--rz-tuer);
    stroke: var(--card);
    stroke-width: 2;
  }
  .pages button ha-icon {
    --mdc-icon-size: 18px;
    margin-right: 4px;
  }
  ul.doors {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li.door {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  li.door .field {
    flex: 1;
  }

  /* Öffnungen in Wänden, Punkte einfügen */
  .wall-gap {
    stroke: var(--card);
    stroke-width: 9;
  }
  .opening .door-leaf {
    stroke: var(--secondary-text-color, #665e54);
    stroke-width: 2.5;
  }
  .opening .door-arc,
  .opening .opening-line {
    fill: none;
    stroke: var(--secondary-text-color, #665e54);
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
  }
  .opening.selected .door-leaf,
  .opening.selected .door-arc,
  .opening.selected .opening-line {
    stroke: var(--accent);
  }
  .plus circle {
    fill: var(--card);
    stroke: var(--accent);
    stroke-width: 1.5;
    cursor: copy;
  }
  .plus path {
    stroke: var(--accent);
    stroke-width: 1.5;
    pointer-events: none;
  }
  .handle.on {
    fill: var(--accent);
  }

  /* Trefferflächen für Finger (GUI-Konzept 3): Handy 44 px, Wand-Tablet 56 px */
  @media (pointer: coarse) {
    button,
    .levels button,
    select,
    input {
      min-height: 44px;
    }
    .tools button.icon {
      min-width: 44px;
    }
  }
  @media (pointer: coarse) and (min-width: 1000px) {
    button,
    .levels button {
      min-height: 56px;
    }
  }
`;
