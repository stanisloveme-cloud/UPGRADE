# **PRD-005: Business Logic, Files & Integrations**

**Version:** 1.0

**Status:** Ready for Dev

**Dependencies:** PRD-004 (Session Editor ready)

## **1\. Контекст и Цель**

**Цель:** Реализовать "тяжелую" серверную логику, работу с файлами и генерацию документов.

**Стек:** NestJS (Backend), Multer (Uploads), ExcelJS/Puppeteer (Exports).

## **2\. Управление Файлами (File Storage)**

Необходимо реализовать сервис загрузки презентаций и фотографий.

### **2.1. API Endpoints**

* POST /api/uploads/speaker-photo:  
  * **Payload:** multipart/form-data (field: file).  
  * **Validation:** Max 5MB, JPG/PNG only.  
  * **Process:** Сохранить файл, вернуть URL (e.g., /uploads/photos/xyz.jpg).  
* POST /api/uploads/presentation:  
  * **Payload:** multipart/form-data (field: file).  
  * **Validation:** Max 50MB, PPTX/PDF.  
  * **Process:** Сохранить, вернуть URL.

### **2.2. Логика привязки**

* При загрузке презентации в SessionSpeakersList (PRD-004), фронтенд сначала грузит файл через этот API, получает URL, а затем сохраняет URL в поле presentation\_url сущности SessionSpeaker.

## **3\. Генерация Документов (Export Service)**

Реализовать функционал кнопок "Печать табличек" и "Анонс программы".

### **3.1. Анонс Программы (Excel Export)**

* **Trigger:** Кнопка "Скачать Excel" на странице Анонса.  
* **Format:** .xlsx.  
* **Structure:**  
  * Лист 1: Сводная программа (Время | Зал | Сессия | Спикеры).  
  * Лист 2: Контакты спикеров (для координаторов).  
* **Tech:** Библиотека exceljs (Node.js).

### **3.2. Таблички Спикеров (PDF Generation)**

* **Trigger:** Кнопка "Печать табличек" в карточке сессии.  
* **Format:** PDF, A4 Landscape, крупный шрифт.  
* **Content:** ФИО \+ Компания.  
* **Tech:** pdfmake или генерация HTML \+ конвертация через puppeteer.

## **4\. Детекция Конфликтов (Conflict Service)**

Критически важная бизнес-логика для предотвращения накладок.

### **4.1. Правила валидации**

При сохранении Спикера в Сессию (POST/PATCH /api/session-speakers):

1. **Time Overlap:** Проверить, не участвует ли speaker\_id в другой сессии в этот же промежуток времени (start\_time \- end\_time совпадают).  
2. **Double Role:** Спикер может быть модератором в одной сессии и спикером в другой, но не одновременно.

### **4.2. UX Реакция**

* Если конфликт найден: Вернуть 409 Conflict с сообщением: *"Спикер Иван Иванов уже занят в сессии 'E-Com Trends' (11:00-11:30)"*.  
* Фронтенд должен показать Alert или Modal с подтверждением ("Все равно добавить?").

## **5\. Система Уведомлений (Notification Service)**

Логика отправки приглашений (Email).

* **Trigger:** Кнопка "Отправить приглашение" в списке "Оповещение спикеров".  
* **Provider:** Nodemailer (SMTP) или API (SendGrid/Postmark). Для MVP — консольный логгер или Ethereal Email.  
* **Flow:**  
  1. Генерация HTML письма (Приветствие, Дата, Ссылка на ЛК).  
  2. Отправка.  
  3. Запись в БД: NotificationLog (кто, когда, канал).  
  4. Обновление статуса на фронтенде.

## **6\. Инструкции для разработчика (Agent Prompt)**

1. **File Upload:** Настрой Multer в NestJS. Файлы сохраняй в папку /uploads (обслуживай как static assets).  
2. **Conflicts:** Напиши ConflictGuard или сервис, который делает запрос в БД: SELECT \* FROM session\_speakers WHERE speaker\_id \= :id AND session\_time INTERSECTS :new\_time.  
3. **Exports:** Реализуй эндпоинт GET /api/exports/schedule который стримит Excel-файл.  
4. **Email:** Настрой SMTP транспорт. Создай простой HTML шаблон письма.