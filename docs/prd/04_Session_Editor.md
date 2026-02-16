# **PRD-004: Session Editor & Speaker Management**

**Version:** 1.0

**Status:** Ready for Dev

**Dependencies:** PRD-003 (Grid is ready to trigger this form)

## **1\. Контекст и Цель**

**Цель:** Реализовать детальную форму редактирования сессии. Это основное рабочее место продюсера программы.

**Сложность:** Очень высокая (Вложенные формы, Drag-and-Drop, Динамические списки).

**Референсы:**

* 2026-02-15\_20-39-23.png (Полная форма редактора спикера).  
* 2026-02-15\_19-56-19.png (Дропдаун статусов).

## **2\. Архитектура UI**

### **2.1. Контейнер Формы**

Использовать \<DrawerForm\> (Ant Design Pro) шириной 70-80% экрана.

* **Trigger:** Клик по карточке сессии в Сетке (PRD-003).  
* **Title:** Редактирование сессии: {session.name}.  
* **Footer:** Явные кнопки "Сохранить изменения" и "Отмена".

### **2.2. Структура Формы (Sections)**

Форма разделена на логические блоки (можно использовать ProCard или Collapse для группировки).

#### **Блок A: Основные параметры (Header)**

* **Время:** ProFormTimePicker.RangePicker (Начало \- Конец).  
* **Название:** ProFormText (md={12}).  
* **Описание:** ProFormTextArea (Описание для сайта).  
* **Служебное:**  
  * ProFormTextArea (name="comments", label="Внутренний комментарий").  
  * ProFormTextArea (name="clients", label="Клиенты").

#### **Блок B: Вопросы (Dynamic List)**

Использовать ProFormList с именем questions.

* **Поля элемента:**  
  * Order (Скрытое поле или Index).  
  * Title (Текст вопроса).  
  * Body (Развернутое описание/подпункты).

#### **Блок C: Брифинги (Dynamic List)**

Использовать ProFormList с именем briefings.

* **Поля элемента:**  
  * Datetime: DatePicker (Show Time).  
  * Moderator: Select (Source: список спикеров этой сессии).  
  * Link: Text (URL Zoom).  
  * Is Done: Checkbox ("Состоялся").

#### **Блок D: Спикеры (Complex Interactive List)**

Самая сложная часть. Реализовать как кастомный компонент SessionSpeakersList.

**UI Элемента Спикера (Card/Row):**

См. скриншот 2026-02-15\_20-39-23.png.

* **Header строки:**  
  * Drag Handle (::) для сортировки.  
  * Avatar/Photo.  
  * Name \+ Role (Модератор/Спикер).  
  * Company.  
  * **Status Dropdown:** (См. раздел 3.2).  
* **Expandable Content (Раскрывающаяся часть):**  
  * **Toggle:** Zoom (Удаленно), Презентация (Есть файл).  
  * **Inputs:** Комментарий менеджера, Тезисы, Цитата.  
  * **Contacts:** Phone, Telegram (Read-only из профиля спикера или редактируемые).  
* **Actions:** Кнопка "Удалить из сессии", "Редактировать профиль" (открывает отдельную модалку Спикера).

## **3\. Бизнес-логика и API**

### **3.1. Загрузка данных**

GET /api/sessions/:id должен возвращать агрегат:

{  
  "id": 100,  
  "name": "...",  
  "questions": \[...\],  
  "briefings": \[...\],  
  "session\_speakers": \[  
    {  
      "id": 501,  
      "speaker": { "first\_name": "Влад", "last\_name": "Широбоков", ... },  
      "role": "moderator",  
      "status": "confirmed",  
      "sort\_order": 0  
    }  
  \]  
}

### **3.2. Управление Спикерами**

1. **Добавление:** Кнопка "Добавить спикера".  
   * Открывает Modal с поиском по глобальной базе Speakers.  
   * При выборе \-\> POST /api/session-speakers (создает связь).  
   * Обновляет локальный список.  
2. **Сортировка:**  
   * Используй dnd-kit или react-beautiful-dnd.  
   * При завершении перетаскивания \-\> Обновить sort\_order в локальном стейте.  
3. **Статусы (Dropdown):**  
   * Values: confirmed (Подтвержден \- Зеленый), pre\_confirmed (Предварительно), contact (Контакт), to\_contact (Выйти на связь), declined (Отказ \- Красный).  
   * При изменении \-\> PATCH /api/session-speakers/:id { status: new\_status, status\_date: now() }.

### **3.3. Сохранение формы**

* **Auto-save:** Для полей спикеров (статус, комментарии) можно делать "Debounced Save" (сохранение через 1 сек после ввода).  
* **Manual Save:** Для основных полей сессии (название, время) — отправка формы по кнопке "Сохранить".

## **4\. Инструкции для разработчика (Agent Prompt)**

1. **Drawer Setup:** Создай компонент SessionEditorDrawer. Подключи его к клику на карточку в Сетке.  
2. **Main Form:** Реализуй основные поля и ProFormList для вопросов/брифингов.  
3. **Speakers Component:** Создай изолированный компонент SessionSpeakersList.  
   * Реализуй верстку карточки спикера по скриншоту (зеленая полоска слева для модератора, поля ввода).  
   * Подключи Drag-and-Drop.  
4. **Integration:**  
   * Реализуй методы API: updateSession, addSpeakerToSession, updateSessionSpeaker.  
   * Убедись, что изменение статуса спикера меняет цвет бейджа.

## **5\. Mock Data & UX**

* Если бэкенд не готов, используй мок MOCK\_SESSION\_FULL с 3-4 спикерами.  
* Добавь Spin (лоадер) при сохранении.  
* Реализуй Popconfirm при удалении спикера.