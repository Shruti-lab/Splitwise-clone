# 💰 Group Expense Sharing App – Database Schema

This project defines a database schema using SQLAlchemy ORM for a **group-based expense-sharing application** (similar to Splitwise). It manages users, groups, and shared expenses.

---

## 📦 Tables Overview

### 1. **User**
Represents a registered user in the application.

| Column | Type    | Description                  |
|--------|---------|------------------------------|
| id     | Integer | Primary key (unique ID)      |
| name   | String  | User's full name             |
| email  | String  | Unique email address         |

#### Relationships
- `expenses`: One user can pay for multiple expenses.
- `groups`: Users can be members of multiple groups (many-to-many via `group_users` table).

---

### 2. **Expense**
Represents an expense paid by a user, typically shared within a group.

| Column     | Type    | Description                            |
|------------|---------|----------------------------------------|
| id         | Integer | Primary key                            |
| description| String  | Description of the expense             |
| amount     | Integer | Amount paid                            |
| paid_by    | Integer | Foreign key → `users.id`               |
| group_id   | Integer | Foreign key → `groups.id`              |

#### Relationships
- `user`: The user who paid the expense.
- `group`: The group where this expense was shared.

---

### 3. **Group**
Represents a group where users can share expenses.

| Column | Type    | Description            |
|--------|---------|------------------------|
| id     | Integer | Primary key            |
| name   | String  | Name of the group      |

#### Relationships
- `users`: Many-to-many with `User` (via `group_users` table).
- `expenses`: One group can have many expenses.

---

### 4. **group_users** (Association Table)
This is a bridge table for the many-to-many relationship between users and groups.

| Column    | Type    | Foreign Key            |
|-----------|---------|------------------------|
| user_id   | Integer | References `users.id`  |
| group_id  | Integer | References `groups.id` |

---

## 🔗 Entity Relationship Summary

- A **User** can belong to multiple **Groups**.
- A **Group** can contain multiple **Users**.
- A **User** can create multiple **Expenses**.
- An **Expense** belongs to a **Group** and is paid by a **User**.

---

## 🛠️ Tech Stack

- Python
- SQLAlchemy ORM
- PostgreSQL / SQLite (choose your DB engine)
- Alembic (optional, for migrations)


---

## 🤖 AI Chat Assistant

The application includes an AI-powered chat assistant that allows users to query their expense data using natural language. This feature leverages LangChain to connect to the database and answer questions about expenses, balances, and groups.

### Components

- **LangGraph Flow**: Orchestrates the process of converting user questions into SQL queries
- **SQL Database Tool**: Connects to the PostgreSQL database to execute generated queries
- **LLM Integration**: Uses Gemini model for natural language understanding and response generation

### Implementation Details

- Based on the [LangChain SQL QA tutorial](https://python.langchain.com/docs/tutorials/sql_qa/)
- Located in `/backend/chat/chatbot.py`
- Exposes an API endpoint at `/chat/` for frontend integration

### Example Queries

Users can ask questions like:
- "Who owes the most money in the Goa Trip group?"
- "What expenses did I add last week?"
- "Show me the balance details for the Dinner Club group."

### Architecture Flow

1. User sends a natural language question via the chat interface
2. The question is processed by the LangGraph workflow:
   - Converts the question to a syntactically correct SQL query
   - Executes the SQL query against the database
   - Formats the results into a human-readable response
3. The response is returned to the frontend and displayed to the user

The chat assistant understands the database schema and relationships, making it capable of answering complex queries about expense distribution, balances between users, and group activities.

---

## ✨ Further Optimization
-- We can use Agents to leverage the reasoning capabilities of LLMs to make decisions during execution. 
-- Adding query validation and error handling: [link](https://python.langchain.com/docs/how_to/sql_query_checking/)
-- Improving propmts by advanced prompt engineering techniques: [link](https://python.langchain.com/docs/how_to/sql_prompting/)