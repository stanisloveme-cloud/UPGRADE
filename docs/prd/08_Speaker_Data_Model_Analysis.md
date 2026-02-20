# Speaker & Content Data Model Analysis (Refined)

## 1. Executive Summary
This document defines the **Speaker Management System** data model, structured into three distinct levels. This approach separates the speaker's permanent identity from their accumulating history and event-specific context.

**Goal**: Enable a "Lifecycle Management" approach for speakers, allowing managers to not just store contact info, but to track expertise, performance quality, and employment history over time to build better conference programs.

---

## 2. The Three Levels of Speaker Data

### Level 1: Gold ID (Identity)
*The immutable core. Who is this person?*

These fields define the unique person in the system. They rarely change, and when they do, it's an update to the core identity.

| Attribute | Description | Storage |
| :--- | :--- | :--- |
| **First Name** | Name (e.g., Ivan) | `Speaker` |
| **Last Name** | Surname (e.g., Ivanov) | `Speaker` |
| **Phone** | Primary mobile (Unique Identifier) | `Speaker` |
| **Email** | Primary contact email | `Speaker` |
| **Photo** | Default headshot | `Speaker` |
| **Bio** | General biography (default) | `Speaker` |

### Level 2: Strategic Profile (Accumulated History)
*The reputational layer. What is their value to us?*

These fields are **accumulated** over time based on the speaker's participation. They are used for **Search & Discovery** when planning new events.

1.  **Expertise (Tags)**:
    *   *Examples*: "CRM", "Marketing in Retail", "Loyalty Programs".
    *   *Logic*: Assignable tags that persist across events. A speaker can gain new expertise tags over time (e.g., starting with CRM, later adding Loyalty).
2.  **Internal Rating (Performance Grade)**:
    *   *Confidential*: Visible ONLY to internal managers.
    *   *Scale*: 1-5 Stars.
    *   *Context*: Rated per event. "How well did they perform at Upgrade Autumn 2024?"
    *   *Aggregated*: The system shows an average rating or "Last 3 Ratings".
3.  **Employment History**:
    *   A derived list of companies they have represented in the past (e.g., "Ex-TechCorp, currently RetailSolutions").

### Level 3: Tactical Context (Event-Specific)
*The operational layer. What are they doing right now?*

These fields apply **only** to a specific participation (Session/Event). They are **snapshots** that do not overwrite the Gold ID or history.

| Attribute | Description | Storage |
| :--- | :--- | :--- |
| **Company Snapshot** | The company they represent *at this specific event*. | `SessionSpeaker` |
| **Position Snapshot** | Their job title *at this specific event*. | `SessionSpeaker` |
| **Presentation** | The specific deck/file for this session. | `SessionSpeaker` |
| **Event Email** | A specific email used for this event (might differ from personal). | `SessionSpeaker` |
| **Topic/Thesis** | What they are talking about *here and now*. | `SessionSpeaker` |
| **Status** | Confirmed, Visa Needed, On-site, etc. | `SessionSpeaker` |

---

## 3. Speaker Lifecycle & Workflows

### Phase 1: Discovery (Program Planning)
*Goal: Find the best speakers for a topic.*

*   **Action**: Manager creates a "CRM" section for a new conference.
*   **System**: Filters speakers by:
    *   Expertise Tag: "CRM" OR "Marketing".
    *   Rating: > 4.0 stars (High quality speakers).
*   **Result**: A "Long List" of proven experts to contact.

### Phase 2: Engagement (Adding to Session)
*Goal: Lock in the speaker for the current event.*

*   **Action**: Manager selects "Ivan Ivanov" for "Session A".
*   **System Logic**:
    *   Creates a `SessionSpeaker` link.
    *   **Auto-Fill**: Copies `Speaker.Company` (Last Known) -> `SessionSpeaker.CompanySnapshot`.
    *   **User Edit**: Manager updates the snapshot to "RetailSolutions" (since Ivan changed jobs).
    *   **Result**: The specific session shows "Ivan from RetailSolutions", while the history preserves his past "TechCorp" appearances.

### Phase 3: Execution (The Event)
*Goal: Deliver the content.*

*   **Action**: Speaker uploads their presentation.
*   **System**: Stores the file link in `SessionSpeaker`, tied to this specific date/topic.

### Phase 4: Evaluation (Post-Event)
*Goal: Grade performance for future reference.*

*   **Action**: Event ends. Manager reviews the session.
*   **System**: Prompts manager: "Rate Ivan Ivanov for Upgrade Autumn 2025".
    *   *Criteria*: Punctuality, Content Quality, Audience Reaction.
    *   *Input*: 5 Stars. Comment: "Excellent delivery, audience loved the Loyalty case."
*   **Result**: Ivan's Global Rating is updated. The comment is saved in his history.

---

## 4. Technical Implementation Plan

### Schema Updates

#### 1. `Speaker` (Gold ID)
*   Already exists.
*   Add relation to `SpeakerTag` (Expertise).

#### 2. `SessionSpeaker` (Tactical Context)
*   **Current**: `role`, `status`.
*   **Add**:
    *   `companySnapshot` (String)
    *   `positionSnapshot` (String)
    *   `emailSnapshot` (String, optional)
    *   `presentationUrl` (String)
    *   `presentationTitle` (String)

#### 3. `SpeakerRating` (New Model)
*   `id`
*   `speakerId` (Relation)
*   `eventId` (Relation - context of the rating)
*   `score` (Int: 1-5)
*   `comment` (Text)
*   `ratedBy` (UserId)

#### 4. `SpeakerTag` / `Expertise` (New Model)
*   `id`
*   `name` (e.g., "CRM", "Retail")
*   Many-to-Many relation with `Speaker`.

---

## 5. Summary of Benefits
1.  **True History**: We never lose the fact that Ivan worked at "TechCorp" in 2024.
2.  **Quality Control**: We stop inviting low-rated speakers (bad performers).
3.  **Targeted Calling**: We can instantly find "Top-rated CRM experts" for a new event.
