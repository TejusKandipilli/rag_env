import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from typing_extensions import List, TypedDict
from langchain.chat_models import init_chat_model
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain import hub
from langchain_core.documents import Document
from langgraph.graph import START, StateGraph

# Load environment variables
load_dotenv()

os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY", "")

if not os.environ.get("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "")

# ----- Define State -----
class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

# ----- Retrieval Function -----
def retrieve(state: State):
    retrieved_docs = vector_store.similarity_search(state["question"])
    return {"context": retrieved_docs}

# ----- Generation Function -----
def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}

# ----- Initialize Components -----
llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
vector_store = Chroma(
    collection_name="example_collection",
    embedding_function=embeddings,
    persist_directory="./chroma_langchain_db",
)
prompt = hub.pull("rlm/rag-prompt")

# Build the RAG graph
graph_builder = StateGraph(State).add_sequence([retrieve, generate])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()

# ----- FastAPI App -----
app = FastAPI()

class QuestionRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_rag(request: QuestionRequest):
    result = graph.invoke({"question": request.question})
    return {"answer": result["answer"]}

# ----- Main Entry Point -----
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))  # Default to 8000 if PORT not set
    uvicorn.run(app, host="0.0.0.0", port=port)
