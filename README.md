# @veda/domain

Pure domain computations over **veda-client** models. Zero runtime dependencies.

Пакет не импортирует `veda-client`: он работает с его API (`id`, `load()`,
`hasValue()`, свойства-значения) через один тонкий адаптер. Алгоритмы живут в
`core/` и ничего не знают ни про `Model`, ни про глобалы.

## Что внутри

```
src/
  ports.js            NodePort — минимальный read-only контракт
  core/org.js         getChief, getFieldChief, getChiefDetail,
                      getChiefDetails (== getDirectChiefs), getOrganization,
                      isSubUnitOf
  core/classes.js     getSuperClasses, isSubClassOf, isInstanceOf
  adapters/model.js   veda-client Model -> NodePort (единственное место про Model)
  index.js            публичный API: принимает и возвращает модели
```

## Использование

```js
import { Model } from 'veda-client';
import { getChief, getChiefDetails, isSubUnitOf, getOrganization } from '@veda/domain';

const appointment = new Model('d:org_position_1'); // load() вызовется внутри

const chief = await getChief(appointment);          // Model | undefined
const details = await getChiefDetails(appointment); // Model[]
const isMine = await isSubUnitOf(appointment, 'd:org_root');
const org = await getOrganization(appointment);     // Model | undefined
```

Возвращаются те же кэшированные экземпляры `Model`, что лежат в свойствах, —
ничего не оборачивается и не клонируется.

## Чистота

Функции:

- не читают глобалы и не импортируют `veda-client`;
- не мутируют модели и не пишут в БД;
- детерминированы: результат зависит только от данных модели и опций;
- единственный побочный эффект — ленивый `model.load()`.

Если модели уже загружены, I/O можно отключить совсем:

```js
await appointment.load();
const chief = await getChief(appointment, undefined, { load: false });
```

С `{ load: false }` функции не делают ни одного сетевого вызова и работают как
чистые вычисления над снимком данных.

## API

| Функция | Возврат |
|---|---|
| `getChief(model, chiefId?, opts?)` | `Model \| undefined` |
| `getFieldChief(model, opts?)` | `Model \| undefined` |
| `getChiefDetail(model, chiefId?, opts?)` | `Model \| undefined` |
| `getChiefDetails(model, opts?)` | `Model[]` |
| `getDirectChiefs` | алиас `getChiefDetails` (историческое имя) |
| `getOrganization(model, opts?)` | `Model \| undefined` |
| `isSubUnitOf(model, unit, opts?)` | `boolean` |
| `getSuperClasses(classModel, opts?)` | `Model[]` |
| `isSubClassOf(classModel, superClass, opts?)` | `boolean` |
| `isInstanceOf(model, classRef, opts?)` | `boolean` |

`opts`: `{ maxDepth?: number, load?: boolean }`. Для `getChiefDetails` глубина по
умолчанию 10, для остальных — 16.

## Контракт для другого провайдера

Адаптер отдаёт `NodePort`:

```js
const node = {
  id: 'd:dept',
  has: (prop) => true,          // есть ли свойство
  links: (prop) => [/* NodePort */], // только ссылки, литералы отфильтрованы
  load: async () => {},
  ref,                          // что вернуть наружу (опционально)
};
```

Ядро (`src/core`) можно переиспользовать в любом рантайме: ему достаточно
реализовать этот объект.

## Семантика, унаследованная от legacy (для сверки)

| Поведение | Реализация |
|---|---|
| `getChief` пропускает собственный id | `skipId = chiefId ?? node.id` |
| `getFieldChief` не пропускает self | первый `v-s:hasFieldChief` вверх |
| `getChiefDetails` ходит по `v-s:hasChiefDetail` | несмотря на имя `getDirectChiefs` |
| `isSubUnitOf` не считает узел подразделением самого себя | проверяется только родитель |
| на `depth > 16` без значения legacy падал | возвращается `undefined` |
| `getOrganization` проверял id-литерал вместо типа | проверяется `rdf:type` у `v-s:parentOrganization` |
