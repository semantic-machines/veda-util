# veda-util

Доменные вычисления над моделями `veda-client`: иерархия подразделений и
иерархия классов. Zero-dependency, ESM, Node 18+.

## Использование

```js
import { Model } from 'veda-client';
import { getChief, getChiefDetails, isSubUnitOf, getOrganization } from 'veda-util';

const appointment = new Model('d:org_position_1');

const chief = await getChief(appointment);          // Model | undefined
const details = await getChiefDetails(appointment); // Model[]
const inUnit = await isSubUnitOf(appointment, 'd:org_root');
const org = await getOrganization(appointment);     // Model | undefined
```

Функции принимают `Model` и возвращают те же кэшированные экземпляры, что лежат
в свойствах.

## API

| Функция | Возврат |
|---|---|
| `getChief(model, chiefId?, opts?)` | `Model \| undefined` |
| `getFieldChief(model, opts?)` | `Model \| undefined` |
| `getChiefDetail(model, chiefId?, opts?)` | `Model \| undefined` |
| `getChiefDetails(model, opts?)` | `Model[]` |
| `getDirectChiefs` | алиас `getChiefDetails` |
| `getOrganization(model, opts?)` | `Model \| undefined` |
| `isSubUnitOf(model, unit, opts?)` | `boolean` |
| `getSuperClasses(classModel, opts?)` | `Model[]` |
| `isSubClassOf(classModel, superClass, opts?)` | `boolean` |
| `isInstanceOf(model, classRef, opts?)` | `boolean` |

`opts`:

- `maxDepth` — глубина обхода; по умолчанию 16, у `getChiefDetails` — 10;
- `load` — вызывать ли `model.load()` (по умолчанию `true`). С `{ load: false }`
  функции не делают сетевых вызовов и работают с уже загруженными моделями.

## Устройство

- `src/core` — чистые функции над `NodePort` (`id`, `has`, `links`, `load`);
  ничего не знают про `Model` и не импортируют `veda-client`;
- `src/adapters/model.js` — единственное место, знающее про `Model`;
- другой провайдер подключается реализацией `NodePort`, ядро не меняется.
