from fastapi import FastAPI, HTTPException 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
import logging
import atexit
import json
import shutil


PROJECTS_ROOT = "projects"
os.makedirs(PROJECTS_ROOT, exist_ok=True)
DEFAULT_PROJECT = "default"
os.makedirs(os.path.join(PROJECTS_ROOT, DEFAULT_PROJECT), exist_ok=True)


# enables logging of important steps   --> every line with logging.* is just for logging purposes
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

# when entering a chat after startup, the chat history is loaded if present.
def load_existing_chats():
    for filename in os.listdir("."):
        if filename.startswith("chat_") and filename.endswith(".json"):
            chat_id = filename[len("chat_"):-len(".json")]
            with open(filename, "r") as f:
                chat_histories[chat_id] = json.load(f)
    logging.info("📦 Existing chats loaded: " + ", ".join(chat_histories.keys()))


# resets after each session, i.e. after shutting down the server
chat_histories = {}
load_existing_chats()

load_dotenv()                   # enables reading API-key from .env file
app = FastAPI()

# Enables Cross-Origin Ressource Sharing --> by default turned off
app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:5173"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    model: str
    prompt: str
    temperature: float = 0.7
    top_p: float = 1.0
    top_k: int = 0
    frequency_penalty: float = 0.0
    chat_id: str
    project_id: str





'''
What the function ENDPOINT 1 does:

It creates an endpoint "/query"
This endpoint is a mediator between the frontend and the OpenRouter API.

It defines a "data" object that it uses to collect and jsonify the data received from the frontend.

For example, it receives the prompted question from the frontend (see <textarea .....> in
the LLMQueryApp.jsx) and stores it in "data.prompt" which is then embedded in a json-body for a 
POST request.

Conversely, the FastAPI backend waits for a response from 
OpenRouter API (res = await client.post("https://openrouter.ai/api/v1/chat/completions"......).
This is then stored in a variable "res" and then parsed. The frontend 
waits for the answer ("const data = await res.json()") and puts it inside the HTML repsonse.'''


### ENDPOINT 1 (POST /query)
@app.post("/query")
async def query_model(data: QueryRequest):
    logging.info("📥 Received request from frontend.")
    logging.info(f"→ Prompt: {data.prompt}")
    logging.info(f"→ Model: {data.model}")
    
    headers = {
        "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
        "Content-Type": "application/json",
    }
    
    
    payload = {
        "model": data.model,
        "messages": [{"role": "user", "content": data.prompt}],
        "temperature": data.temperature,
        "top_p": data.top_p,
        "top_k": data.top_k,
        "frequency_penalty": data.frequency_penalty,
    }
    
    logging.info("📤 Sending request to OpenRouter...")
    logging.info(f"Payload: {payload}")
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
            res.raise_for_status()
            result = res.json()
            
    except Exception as e:
        logging.error("❌ Error during request to OpenRouter.")
        logging.exception(e)
        return {"error": "Failed to get response from OpenRouter"}
    
    logging.info("📥 Response received from OpenRouter.")
    logging.debug(f"Full response: {result}")
    
    reply = result["choices"][0]["message"]["content"]
    logging.info(f"✅ Extracted response: {reply[:100]}...")  # limit log length
    
    
    if data.chat_id not in chat_histories:
        chat_histories[data.chat_id] = []

    chat_histories[data.chat_id].append({
        "prompt": data.prompt,
        "response": reply,
        "model": data.model,
        "temperature": data.temperature,
        "top_p": data.top_p,
        "top_k": data.top_k,
        "frequency_penalty": data.frequency_penalty
    })
    
    ## saves chat history into the chat of the corresponding project folder
    chat_path = os.path.join(PROJECTS_ROOT, data.project_id, f"chat_{data.chat_id}.json")
    with open(chat_path, "w") as f:
        json.dump(chat_histories[data.chat_id], f, indent=2)

    return {"response": reply}



### ENDPOINT 2.1 ( GET /history)
@app.get("/history/{chat_id}")
async def get_chat(chat_id: str):
    return chat_histories.get(chat_id, [])

### ENDPOINT 2.2 ( DELETE /history)
@app.delete("/history/{chat_id}")
async def clear_chat(chat_id: str):
    chat_histories.pop(chat_id, None)
    try:
        os.remove(f"chat_{chat_id}.json")
    except FileNotFoundError:
        pass
    return {"status": f"{chat_id} cleared"}




### ENDPOINT 3 (/projects)
@app.get("/projects")
def list_projects():
    return [
        name for name in os.listdir(PROJECTS_ROOT)
        if os.path.isdir(os.path.join(PROJECTS_ROOT, name))
    ]


### ENDPOINTS 3.1 (/projects/{project_id})   
@app.post("/projects/{project_id}")
def create_project(project_id: str):
    path = os.path.join(PROJECTS_ROOT, project_id)
    if os.path.exists(path):
        raise HTTPException(status_code=400, detail="Project already exists")
    os.makedirs(path)
    return {"status": f"Project '{project_id}' created"}

@app.delete("/projects/{project_id}")
def delete_project(project_id: str):
    path = os.path.join(PROJECTS_ROOT, project_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        shutil.rmtree(path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": f"Project '{project_id}' deleted"}



### ENDPOINTS 3.2 (/projects/{project_id}/chats)
@app.get("/projects/{project_id}/chats")
def list_project_chats(project_id: str):
    path = os.path.join(PROJECTS_ROOT, project_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Project not found")
    return [
        f for f in os.listdir(path)
        if f.startswith("chat_") and f.endswith(".json")
    ]
    
@app.get("/projects/{project_id}/chats")
def load_project_chats(project_id: str):
    path = os.path.join(PROJECTS_ROOT, project_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Project not found")

    chats = {}
    for filename in os.listdir(path):
        if filename.startswith("chat_") and filename.endswith(".json"):
            chat_id = filename[len("chat_"):-len(".json")]
            with open(os.path.join(path, filename), "r") as f:
                chats[chat_id] = json.load(f)
    return chats


### ENDPOINTS 3.3 (/projects/{project_id}/notes)

@app.get("/projects/{project_id}/notes")
def list_notes(project_id: str):
    path = os.path.join(PROJECTS_ROOT, project_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Project not found")

    return [
        f for f in os.listdir(path)
        if f.endswith(".md") or f.endswith(".txt")
    ]
    
@app.get("/projects/{project_id}/notes/{filename}")
def get_note(project_id: str, filename: str):
    note_path = os.path.join(PROJECTS_ROOT, project_id, filename)
    if not os.path.exists(note_path):
        raise HTTPException(status_code=404, detail="Note not found")
    
    with open(note_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    return {"filename": filename, "content": content}

class NoteContent(BaseModel):
    content: str

@app.post("/projects/{project_id}/notes/{filename}")
def save_note(project_id: str, filename: str, data: NoteContent):
    note_path = os.path.join(PROJECTS_ROOT, project_id, filename)
    
    with open(note_path, "w", encoding="utf-8") as f:
        f.write(data.content)
    
    return {"status": "saved", "filename": filename}



@atexit.register
def save_chat_log():
    for chat_id, history in chat_histories.items():
        with open(f"chat_{chat_id}.json", "w") as f:
            json.dump(history, f, indent=2)
    logging.info("🧾 All chats saved on shutdown.")
    
