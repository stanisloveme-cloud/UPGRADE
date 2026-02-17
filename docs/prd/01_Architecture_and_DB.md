# **PRD-001: Architecture & Database Schema**

**Version:** 1.0

**Status:** Approved

**Target:** Backend & DevOps Agents

## **1\. Контекст и Архитектура**

Цель: Создать фундамент для системы управления деловой программой конференции ("Business Program Editor").

Тип системы: Монолитное приложение (Monolith).

**Стек технологий:**

* **Backend:** Node.js (рекомендуется **NestJS** для строгой типизации) \+ TypeORM/Prisma.  
* **Database:** PostgreSQL 15+.  
* **Frontend:** React \+ Vite \+ Ant Design Pro v5.  
* **Infra:** Docker Compose (App \+ DB \+ Redis for caching).
* **Security:** JWT Authentication (Stateless), NestJS Guards, React Context.
* **UX:** Explicit error handling (Alerts) for login failures.

## **2\. Модель Данных (Database Schema)**

Ниже представлена структура БД на основе анализа Анализ раздела Редактор деловой программы New Retail Forum 2025.txt.

### **2.1. Основные сущности (ERD Logic)**

erDiagram  
    Event ||--|{ Hall : has  
    Hall ||--|{ Track : contains  
    Track ||--|{ Session : contains  
    Session ||--|{ SessionQuestion : has  
    Session ||--|{ SessionSpeaker : includes  
    Session ||--|{ Briefing : has  
    Speaker ||--|{ SessionSpeaker : participates  
    SessionSpeaker ||--o| Presentation : uploads  
    Speaker ||--o| SpeakerPhoto : has
    User {
        int id PK
        string email
        string password_hash
        string name
        enum role "admin, manager"
    }

    Event {  
        int id PK  
        string name  
        string description  
        date start\_date  
        date end\_date  
        enum status "draft, published, archived"  
    }

    Hall {  
        int id PK  
        int event\_id FK  
        string name  
        int capacity  
        int sort\_order  
    }

    Track {  
        int id PK  
        int hall\_id FK  
        string name "Conference Name"  
        string description  
        date day  
        time start\_time  
        time end\_time  
        int sort\_order  
    }

    Session {  
        int id PK  
        int track\_id FK  
        string name  
        text description  
        time start\_time  
        time end\_time  
        text comments "Internal comments"  
        text clients "Clients info"  
        jsonb metadata "Technical fields"  
    }

    Speaker {  
        int id PK  
        string first\_name  
        string last\_name  
        string position  
        string company  
        string email  
        string phone  
        string telegram  
        boolean is\_sponsor  
        text bio  
        text internal\_comment  
    }

    SessionSpeaker {  
        int id PK  
        int session\_id FK  
        int speaker\_id FK  
        enum role "moderator, speaker"  
        enum status "confirmed, pre\_confirmed, contact, to\_contact, declined, review"  
        date status\_date  
        int sort\_order  
        boolean needs\_zoom  
        boolean has\_presentation  
        text manager\_comment  
        text program\_thesis  
        text newsletter\_quote  
        enum presence\_status "planned, onsite, missing"  
    }

    SessionQuestion {  
        int id PK  
        int session\_id FK  
        int order  
        string title  
        text body  
    }

    Briefing {  
        int id PK  
        int session\_id FK  
        int moderator\_id FK  
        timestamp datetime  
        boolean is\_done  
        string link\_url  
        text comment  
    }

### **2.2. Типы данных (JSON Schema Definition)**

Используй эти определения для создания миграций и DTO.

#### **Entity: Event**

* id: SERIAL PRIMARY KEY  
* name: VARCHAR(255) NOT NULL  
* description: TEXT  
* start\_date: DATE NOT NULL  
* end\_date: DATE NOT NULL  
* created\_at: TIMESTAMP DEFAULT NOW()

#### **Entity: Hall**

* id: SERIAL PRIMARY KEY  
* event\_id: INTEGER NOT NULL (FK \-\> Event.id)  
* name: VARCHAR(100) NOT NULL (e.g., "Трансформер")  
* capacity: INTEGER DEFAULT 0  
* sort\_order: INTEGER DEFAULT 0

#### **Entity: Track (Conference)**

* id: SERIAL PRIMARY KEY  
* hall\_id: INTEGER NOT NULL (FK \-\> Hall.id)  
* name: VARCHAR(255) NOT NULL  
* description: TEXT  
* day: DATE NOT NULL (Must be within Event dates)  
* start\_time: TIME NOT NULL  
* end\_time: TIME NOT NULL  
* sort\_order: INTEGER DEFAULT 0

#### **Entity: Session**

* id: SERIAL PRIMARY KEY  
* track\_id: INTEGER NOT NULL (FK \-\> Track.id)  
* name: VARCHAR(255) NOT NULL  
* description: TEXT  
* start\_time: TIME NOT NULL  
* end\_time: TIME NOT NULL  
* comments: TEXT (Internal notes)  
* clients: TEXT (Related clients)

#### **Entity: Speaker**

* id: SERIAL PRIMARY KEY  
* first\_name: VARCHAR(100) NOT NULL  
* last\_name: VARCHAR(100) NOT NULL  
* company: VARCHAR(255)  
* position: VARCHAR(255)  
* email: VARCHAR(255)  
* phone: VARCHAR(50)  
* telegram: VARCHAR(100)  
* photo\_url: VARCHAR(512)  
* is\_sponsor: BOOLEAN DEFAULT FALSE

#### **Entity: SessionSpeaker (Pivot Table with Payload)**

* id: SERIAL PRIMARY KEY  
* session\_id: INTEGER NOT NULL (FK)  
* speaker\_id: INTEGER NOT NULL (FK)  
* role: ENUM('moderator', 'speaker') DEFAULT 'speaker'  
* status: ENUM('confirmed', 'pre\_confirmed', 'contact', 'to\_contact', 'declined', 'review')  
* status\_date: DATE  
* sort\_order: INTEGER DEFAULT 0  
* needs\_zoom: BOOLEAN DEFAULT FALSE  
* has\_presentation: BOOLEAN DEFAULT FALSE

#### **Entity: SessionQuestion**

* id: SERIAL PRIMARY KEY  
* session\_id: INTEGER NOT NULL (FK)  
* order: INTEGER NOT NULL  
* title: VARCHAR(255) NOT NULL  
* body: TEXT

#### **Entity: Briefing**

* id: SERIAL PRIMARY KEY  
* session\_id: INTEGER NOT NULL (FK)  
* moderator\_id: INTEGER (FK \-\> Speaker.id, nullable)  
* datetime: TIMESTAMP WITH TIME ZONE  
* link: VARCHAR(512)  
* is\_done: BOOLEAN DEFAULT FALSE  
* comment: TEXT

#### **Entity: User (System Access)**

* id: SERIAL PRIMARY KEY
* email: VARCHAR(255) NOT NULL UNIQUE
* password_hash: VARCHAR(255) NOT NULL
* name: VARCHAR(100)
* role: ENUM('admin', 'manager') DEFAULT 'manager'
* created_at: TIMESTAMP DEFAULT NOW()

## **3\. API Контракты (Core Endpoints)**

На данном этапе необходимо реализовать только "скелет" API для проверки схемы БД.

* GET /api/events/:id/full-structure — Возвращает JSON дерево: Event \-\> Halls \-\> Tracks \-\> Sessions (для рендера сетки).  
* POST /api/halls — CRUD для залов.  
* POST /api/tracks — CRUD для треков.  
* POST /api/sessions — CRUD для сессий.  
* POST /api/speakers — CRUD для глобальной базы спикеров.
* POST /auth/login — Получение JWT токена. (Returns 401 Unauthorized for invalid creds).
* GET /auth/profile — Получение информации о текущем пользователе.

## **4\. Инструкции для разработчика (Agent Prompt)**

1. **Setup:** Инициализируй проект (NestJS \+ TypeORM/Prisma \+ Docker Compose).  
2. **Database:** Создай миграции на основе схемы из раздела 2.2.  
3. **Seeding:** Напиши скрипт (seed.ts), который наполняет БД тестовыми данными, идентичными данным из анализа (Event "New Retail Forum 2025", Залы "Трансформер", "Олимпийский" и т.д.).  
4. **Verification:** Убедись, что API GET /api/events/:id/full-structure возвращает корректный JSON, соответствующий вложенности UI.