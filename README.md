# Splitwise Clone

A fullstack expense sharing application built with FastAPI, React, TypeScript, and PostgreSQL.

## Features

- **Group Management**: Create and manage groups with multiple users
- **Expense Tracking**: Add expenses and split them equally or by percentage
- **Balance Calculation**: See who owes whom in each group
- **Personal Dashboard**: View your expenses and balances across all groups
- **Dockerized Setup**: Easy deployment with Docker
- 
## AI Chat Assistant

The application includes an AI-powered chat assistant that allows users to query their expense data using natural language:

- **Natural Language Queries**: Ask questions about expenses, balances, and groups in plain English
- **SQL Database Integration**: Powered by LangChain to convert questions into database queries
- **LLM Integration**: Uses Gemini model for understanding and generating responses

### Example Queries

- "Who owes the most money in the Goa Trip group?"
- "What expenses did I add last week?"
- "Show me the balance details for the Dinner Club group."

The chat assistant can be accessed through the `/chat/` API endpoint or via the chat interface in the frontend.
Refer here for the implementation details:- [backend README.md](backend)


## Technologies Used

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Containerization**: Docker & Docker Compose

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- Git for cloning the repository

### Quick Start with Docker

1. Clone the repository and navigate to the project directory:

```bash
git clone <repository-url>
cd splitwise-clone
```

2. Create `.env` file in the root directory:

```
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

3. Start the application using Docker Compose:

```bash
docker-compose up --build
```

4. Access the application:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

### Manual Setup (Development)

#### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create and activate a virtual environment:

```bash
python -m venv env
source env/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:

```bash
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=SplitWiseClone
```

5. Run the backend server:

```bash
uvicorn app.main:app --reload
```

#### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
yarn install
```

3. Create `.env` file for API URL:

```
VITE_API_URL=http://localhost:8000
```

4. Start the development server:

```bash
yarn dev
```

## API Endpoints

### Users

- `POST /users/`: Create a new user
- `GET /users/`: Get all users
- `GET /users/{user_id}`: Get user details
- `GET /users/{user_id}/balances`: Get user's balances across all groups

### Groups

- `POST /groups/`: Create a new group
- `GET /groups/`: Get all groups
- `GET /groups/{group_id}`: Get group details

### Expenses

- `POST /groups/{group_id}/expenses`: Add a new expense to a group
- `GET /groups/{group_id}/expenses`: Get all expenses in a group

### Balances

- `GET /groups/{group_id}/balances`: Get balances for a group

## Project Structure

```
splitwise-clone/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI application
│   │   ├── database.py    # Database connection
│   │   ├── models.py      # SQLAlchemy models
│   │   └── schemas.py     # Pydantic schemas
│   ├── api/
│   │   ├── groups.py      # Group endpoints
│   │   ├── expenses.py    # Expense endpoints
│   │   └── balances.py    # Balance endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.tsx        # Main application
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Assumptions

1. **No Authentication**: This demo doesn't include user authentication for simplicity.

2. **Simplified User Model**: Users are identified by username and email without passwords.

3. **Database**: PostgreSQL is used as the database and initialized through Docker.

4. **Demo User**: The default user for the dashboard is "Shruti" with ID 1.

5. **Split Types**: The application supports two split types:
   - Equal: Split equally among all members
   - Percentage: Split based on specified percentages

## Usage Example

1. Create Users:
```bash
curl -X POST http://localhost:8000/users/ -H "Content-Type: application/json" \
  -d '{"username": "Shruti", "email": "shrutibpatil45@gmail.com"}'
```

2. Create a Group:
```bash
curl -X POST http://localhost:8000/groups/ -H "Content-Type: application/json" \
  -d '{"name": "Goa Trip", "user_ids": [1, 2, 3]}'
```

3. Add an Expense:
```bash
curl -X POST http://localhost:8000/groups/1/expenses -H "Content-Type: application/json" \
  -d '{"description": "Hotel", "amount": 6000, "paid_by": 1, "split_type": "equal"}'
```

## License

This project is licensed under the [MIT License](./LICENSE).
