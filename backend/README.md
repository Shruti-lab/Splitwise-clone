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

## 📁 File Structure

