# Старый FrontEnd: детальный разбор логики графиков и очистки

## Цель документа
Этот документ фиксирует, как именно в старом фронте (`FrontEnd`) работает состояние графиков:
1. откуда берутся графики;
2. как они добавляются и хранятся;
3. как происходит переключение графиков;
4. что именно делает кнопка `Очистить`.

Документ нужен как спецификация для корректной миграции логики в Next-приложение без регрессий.

## Исходники, которые были проанализированы
- `FrontEnd/src/store/slices/directionSlice.ts:22`
- `FrontEnd/src/store/slices/directionSlice.ts:88`
- `FrontEnd/src/store/slices/directionSlice.ts:189`
- `FrontEnd/src/store/slices/directionSlice.ts:218`
- `FrontEnd/src/store/slices/directionSlice.ts:304`
- `FrontEnd/src/store/slices/directionSlice.ts:340`
- `FrontEnd/src/components/Panel/Panel.tsx:36`
- `FrontEnd/src/components/Panel/Panel.tsx:132`
- `FrontEnd/src/components/MainContent/MainContent.tsx:31`
- `FrontEnd/src/components/MainContent/MainContent.tsx:64`
- `FrontEnd/src/components/PlotlyGraph.tsx:44`
- `FrontEnd/src/components/PlotlyGraph.tsx:101`
- `FrontEnd/src/App.tsx:14`

## 1. Модель состояния в старом фронте

Состояние находится в Redux slice `direction`.

Ключевые поля:
- `activeDirection: string` — текущее направление.
- `activeLab: string | null` — текущая лабораторная (по `lab.full`).
- `directions: DirectionItem[]` — весь набор направлений/лабораторных.

Для каждой лабораторной (`LabDefinition`) важны:
- `graphs: string[]` — список графиков для UI-вкладок.
- `activeGraph: string` — какой график выбран сейчас.
- `graphStorage: Record<string, GraphData[]>` — накопленные серии по каждому графику.
- `graphAxes: Record<string, AxisSettings>` — подписи осей и `logX`.
- `nonlinearities`, `selectedNonlinearity` — для направления `ТАУ Нелин`.

Критично: данные серий лежат именно в `graphStorage`, а не в `graphs`.

## 2. Инициализация и загрузка конфигурации

### 2.1 Загрузка
В `App` при монтировании выполняется запрос:
- `GET {VITE_API_BASE_URL}/directions/` (`FrontEnd/src/App.tsx:14`).
- Ответ передается в `setDirectionsFromAPI`.

### 2.2 Нормализация в `setDirectionsFromAPI`
Reducer делает следующее (`FrontEnd/src/store/slices/directionSlice.ts:218`):

1. Сохраняет старый `graphStorage` по ключу `lab.full` в `existingGraphStorage`.
2. Строит `graphNames` из API (`apiLab.graphs.map(g => g.name)`).
3. Специальный кейс `ЛАФЧХ`:
- если одновременно есть `"ЛАФЧХ (амплитуда)"` и `"ЛАФЧХ (фаза)"`,
- эти два имени убираются из `graphs`,
- в `graphs` добавляется `"ЛАФЧХ"` для UI.
4. Нормализует `activeGraph`:
- если API вернул `"ЛАФЧХ (амплитуда)"` или `"ЛАФЧХ (фаза)"`, active становится `"ЛАФЧХ"`.
5. Создает `graphAxesObj` из `apiLab.graphs`, плюс синтетические оси для `"ЛАФЧХ"`.
6. Выбирает `graphStorage`:
- либо восстановленный из `existingGraphStorage[lab.full]`,
- либо новый пустой `graphStorageObj`.
7. После загрузки выставляет `activeDirection` и `activeLab` на первые элементы.

Вывод: старый фронт пытается сохранять уже построенные серии при повторной загрузке направлений.

## 3. Поток добавления графиков

### 3.1 Кнопка `Добавить график`
`Panel` вызывает:
1. `dispatch(addGraph({ labFull }))` (`FrontEnd/src/components/Panel/Panel.tsx:39`);
2. `dispatch(calculateLab(...))` (`FrontEnd/src/components/Panel/Panel.tsx:45`).

### 3.2 `addGraph`
`addGraph` лишь гарантирует, что для каждого имени из `lab.graphs` есть массив в `graphStorage` (`FrontEnd/src/store/slices/directionSlice.ts:304`).

Важно: это подготовительный шаг, самих точек графика не добавляет.

### 3.3 `calculateLab.fulfilled`
После ответа API данные добавляются в `graphStorage` (`FrontEnd/src/store/slices/directionSlice.ts:340`):

- Для `ТАУ Нелин`:
1. идет обход `lab.graphs`;
2. формируется ключ `${graphName}_${selectedNonlinearity}`;
3. серия пушится в `graphStorage[graphName]`.

- Для остальных направлений:
1. обход всех ключей `data` из API-ответа;
2. если ключа нет в `graphStorage`, он создается динамически;
3. серия добавляется через `.push()`.

Следствие:
- даже если `graphs` содержит `"ЛАФЧХ"`, а API прислал `"ЛАФЧХ (амплитуда)"` и `"ЛАФЧХ (фаза)"`,
- эти ключи все равно появятся в `graphStorage` автоматически и будут заполнены.

## 4. Поток переключения графиков

### 4.1 Переключение вкладки графика
`MainContent` вызывает `setActiveGraphForLab({ labFull, graph })` (`FrontEnd/src/components/MainContent/MainContent.tsx:60`).

Reducer меняет `activeGraph` только если `graph` входит в `lab.graphs` (`FrontEnd/src/store/slices/directionSlice.ts:151`).

### 4.2 Отображаемые графики в UI
`MainContent` строит `displayGraphs` (`FrontEnd/src/components/MainContent/MainContent.tsx:64`):

- если в `graphs` есть и `"ЛАФЧХ (амплитуда)"`, и `"ЛАФЧХ (фаза)"`, UI объединяет их в одну вкладку `"ЛАФЧХ"`;
- иначе показывает `graphs` как есть.

### 4.3 Что передается в рендерер
`MainContent` передает в `PlotlyGraph`:
- `graphName = activeGraph`;
- обычные серии: `graphStorage[activeGraph]`;
- для комбинированного `ЛАФЧХ`:
  - `lafchAmplitude = graphStorage["ЛАФЧХ (амплитуда)"]`,
  - `lafchPhase = graphStorage["ЛАФЧХ (фаза)"]`.

## 5. Логика кнопки `Очистить` в старом фронте

Триггер:
- `DeleteButton` вызывает `onDelete` (`FrontEnd/src/components/Panel/DeleteButton.tsx:9`).
- В `Panel` это `dispatch(clearGraphs({ labFull }))` (`FrontEnd/src/components/Panel/Panel.tsx:132`).

Reducer `clearGraphs` (`FrontEnd/src/store/slices/directionSlice.ts:189`) делает только:
1. ищет целевую лабораторную по `labFull`;
2. берет все ключи `Object.keys(lab.graphStorage)`;
3. для каждого ключа присваивает пустой массив `[]`.

Это означает:
- очищаются все серии текущей лабораторной;
- очищаются и `"ЛАФЧХ (амплитуда)"`, и `"ЛАФЧХ (фаза)"`, если эти ключи есть в storage;
- ключи в `graphStorage` не удаляются, очищается только содержимое массивов;
- `activeGraph` не сбрасывается;
- `graphs`, `graphAxes`, параметры, заметка, выбранная нелинейность не меняются.

### 5.1 Что пользователь видит после очистки
- Активная вкладка графика остается той же.
- `PlotlyGraph` начинает показывать сообщение:
  - для обычного графика: `Нет данных для графика ...` (`FrontEnd/src/components/PlotlyGraph.tsx:44`);
  - для комбинированного ЛАФЧХ: `Нет данных для ЛАФЧХ (амплитуда или фаза)` (`FrontEnd/src/components/PlotlyGraph.tsx:48`).

## 6. Поведение при переключении направления/лабораторной

### 6.1 Переключение направления
`setActiveDirection`:
- меняет `activeDirection`;
- автоматически выставляет `activeLab` на первую лабораторную этого направления (`FrontEnd/src/store/slices/directionSlice.ts:139`).

### 6.2 Переключение лабораторной
`setActiveLab` только меняет `activeLab` (`FrontEnd/src/store/slices/directionSlice.ts:146`).

Итог:
- данные графиков не очищаются при переключениях;
- каждая лабораторная хранит свои серии отдельно в своем `graphStorage`;
- при возврате к лабораторной пользователь видит сохраненные до этого серии (если не нажимал `Очистить`).

## 7. Специфика `ЛАФЧХ` (самый важный кейс для миграции)

Старый фронт использует двойную модель:
- в UI обычно одна вкладка `"ЛАФЧХ"`;
- в данных две серии `"ЛАФЧХ (амплитуда)"` и `"ЛАФЧХ (фаза)"`.

Чтобы это работало, обязательно одновременно соблюдаются 3 условия:
1. `activeGraph` для этого режима должен быть `"ЛАФЧХ"`.
2. В `graphStorage` должны быть массивы для `"ЛАФЧХ (амплитуда)"` и `"ЛАФЧХ (фаза)"`.
3. Рендерер должен получать обе коллекции (`lafchAmplitude`, `lafchPhase`).

Если нарушить любой из пунктов, комбинированный график перестанет отображаться корректно.

## 8. Важные замечания по текущей реализации старого фронта

### 8.1 Наблюдаемая неточность в `calculateLab`
В thunk есть условие:
- `if (nonlinearity && directionId === 2) requestBody.nonlinearity = nonlinearity`
- (`FrontEnd/src/store/slices/directionSlice.ts:101`).

Для `ТАУ Нелин` обычно ожидается другой `directionId`, поэтому это выглядит как потенциальная ошибка.
Это не влияет на саму механику `clearGraphs`, но может влиять на серверный расчет нелинейных серий.

### 8.2 Сохранение старого storage при reload
`existingGraphStorage[lab.full] = { ...lab.graphStorage }` — это поверхностная копия объекта (`FrontEnd/src/store/slices/directionSlice.ts:224`).

Нюанс:
- массивы серий внутри не копируются глубоко;
- при сложных сценариях reload могут переноситься ключи, которых нет в новом `graphs`.

## 9. Требования для корректной интеграции в Next (как спецификация)

### Обязательное поведение
1. Очистка должна выполняться по `Object.keys(graphStorage)` текущей лабораторной.
2. Очистка не должна менять `activeGraph`.
3. Очистка не должна менять `graphs`, `graphAxes`, `parameters`, `note`, `selectedNonlinearity`.
4. Переключение лаб/направлений не должно автоматически очищать `graphStorage`.
5. ЛАФЧХ должен поддерживать UI-вкладку `"ЛАФЧХ"` и хранение данных в `"ЛАФЧХ (амплитуда)"`/`"ЛАФЧХ (фаза)"`.
6. Добавление результатов расчета должно уметь создавать новые ключи в `graphStorage`, если их нет.

### Желательное (для устойчивости)
1. Нормализовать `graphs`/`activeGraph` для ЛАФЧХ при инициализации.
2. Гарантировать наличие ключей `"ЛАФЧХ (амплитуда)"` и `"ЛАФЧХ (фаза)"` в `graphStorage` до рендера.
3. При перезагрузке конфигурации сохранять `graphStorage` по `lab.full`, но с контролем ключей.

## 10. Чек-лист проверки после интеграции

1. Линейная лабораторная:
- добавить график 2 раза;
- убедиться, что в активной вкладке 2 серии;
- нажать `Очистить`;
- убедиться, что сообщение `Нет данных...` появилось и вкладка осталась активной.

2. ЛАФЧХ:
- выбрать вкладку `ЛАФЧХ`;
- добавить расчет;
- убедиться, что видны обе оси (амплитуда слева, фаза справа);
- нажать `Очистить`;
- убедиться, что ЛАФЧХ показывает отсутствие данных.

3. Переключения:
- добавить графики в ЛР-1;
- перейти в ЛР-2 и добавить другие;
- вернуться в ЛР-1 и убедиться, что ее серии сохранились;
- очистить ЛР-1 и убедиться, что ЛР-2 не затронута.

4. Нелинейности:
- выбрать нелинейность A, добавить график;
- переключиться на нелинейность B, добавить график;
- очистить;
- проверить, что очищены все серии текущей лабораторной.

---

Если использовать этот документ как опорную спецификацию, миграция логики графиков (особенно `clearGraphs` и комбинированного `ЛАФЧХ`) будет поведенчески эквивалентна старому фронту.
