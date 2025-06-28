import getpass
import os
from langchain_community.utilities import SQLDatabase
from langchain_core.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model
from langchain_community.tools.sql_database.tool import QuerySQLDatabaseTool
from langgraph.graph import START, StateGraph
from typing import TypedDict,List, Dict, Any, Optional
from typing_extensions import Annotated



os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "your-gemini-api-key")

# Initialize the LLM
llm = init_chat_model("gemini-2.0-flash", model_provider="google_genai")

db_uri = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/mydatabase")
db = SQLDatabase.from_uri(db_uri)
print(db.dialect)
print(db.get_usable_table_names())



class State(TypedDict):
    question: str
    query: str
    result: str
    answer: str

system_message = """
You are an AI assistant for a Splitwise-like expense sharing application.
Given an input question, create a syntactically correct {dialect} query to
run to help find the answer. Unless the user specifies in his question a
specific number of examples they wish to obtain, always limit your query to
at most {top_k} results. 

The database contains information about:
- Users (users table)
- Groups (groups table)
- Group memberships (group_users relationship table)
- Expenses (expenses table)
- Expense splits (expense_splits table)

Users can create groups, add expenses, and split costs among group members.

Never query for all the columns from a specific table, only ask for a the
few relevant columns given the question.

Pay attention to use only the column names that you can see in the schema
description. Be careful to not query for columns that do not exist. Also,
pay attention to which column is in which table.

Only use the following tables:
{table_info}
"""

user_prompt = "Question: {input}"

query_prompt_template = ChatPromptTemplate(
    [("system", system_message), ("user", user_prompt)]
)




class QueryOutput(TypedDict):
    """Generated SQL query."""

    query: Annotated[str, ..., "Syntactically valid SQL query."]


def write_query(state: State):
    """Generate SQL query to fetch information."""
    prompt = query_prompt_template.invoke(
        {
            "dialect": db.dialect,
            "top_k": 10,
            "table_info": db.get_table_info(),
            "input": state["question"],
        }
    )
    structured_llm = llm.with_structured_output(QueryOutput)
    result = structured_llm.invoke(prompt)
    return {"query": result["query"]}



def execute_query(state: State):
    """Execute SQL query."""
    execute_query_tool = QuerySQLDatabaseTool(db=db)
    return {"result": execute_query_tool.invoke(state["query"])}

def generate_answer(state: State):
    """Answer question using retrieved information as context."""
    prompt = (
        "You are an AI assistant for a Splitwise-like expense sharing application. "
        "Given the following user question, corresponding SQL query, "
        "and SQL result, answer the user question in a helpful and conversational way."
        "If the query returns no results, say so politely. "
        "If the query result is complex, explain it clearly.\n\n"
        f'Question: {state["question"]}\n'
        f'SQL Query: {state["query"]}\n'
        f'SQL Result: {state["result"]}'
    )
    response = llm.invoke(prompt)
    return {"answer": response.content}

async def process_chat_question(question: str) -> str:
    """
    Process a user question using the chatbot graph.
    
    Args:
        question: The user's question
        
    Returns:
        The AI's answer
    """
    # Initialize the state with the user's question
    init_state = {"question": question, "query": "", "result": "", "answer": ""}
    graph_builder = StateGraph(State).add_sequence(
    [write_query, execute_query, generate_answer]
    )
    graph_builder.add_edge(START, "write_query")
    graph = graph_builder.compile()
    # Run the graph
    result = graph.invoke(init_state)
    
    # Return the answer
    return result["answer"]