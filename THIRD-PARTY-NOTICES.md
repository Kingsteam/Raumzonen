# Fremde Bestandteile und Vorbilder

## Im ausgelieferten Code enthalten

| Bestandteil | Wo | Lizenz | Hinweis |
|---|---|---|---|
| [Lit](https://lit.dev) (`lit`, `lit-html`, `lit-element`, `@lit/reactive-element`), Google LLC | gebündelt in `custom_components/raumzonen/frontend/raumzonen-panel.js` | BSD-3-Clause | voller Lizenztext in `custom_components/raumzonen/frontend/LIZENZEN-DRITTE.txt`; die Lizenzvermerke stehen auch im gebündelten Code |

Nur zum Entwickeln und Testen (nicht ausgeliefert): Vite, Vitest,
TypeScript (MIT bzw. Apache-2.0), pytest-homeassistant-custom-component,
ruff und Home Assistant selbst (Apache-2.0).

## Vorbild, kein Code übernommen

| Projekt | Lizenz | Verhältnis zu Raumzonen |
|---|---|---|
| [bobtekkk/aqara-fp400-zone-card](https://github.com/bobtekkk/aqara-fp400-zone-card) | MIT | Dessen Zigbee2MQTT-Konverter liefert die Positionen des FP400, mit denen Raumzonen arbeitet. Raumzonen liest nur die veröffentlichten Daten (Feldnamen und Zonenformat) und enthält keinen Code daraus. Die Oberfläche ist eigenständig gestaltet. |
