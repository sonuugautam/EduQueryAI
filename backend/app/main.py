from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.api import auth, curriculum
from app.models.schemas import ChatRequest, ChatResponse, AnalyticsSummary
from app.services import db_service, nlp_service, pdf_service
from app.data.sample_knowledge import SEED_DATA

app = FastAPI(title="EduQuery AI Backend")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(curriculum.router)

@app.on_event("startup")
def on_startup():
    print("Starting up...")
    db_service.init_db()
    nlp_service.init_faiss(SEED_DATA)

@app.get("/")
def read_root():
    return {"message": "Welcome to EduQuery AI API"}

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(db_service.get_db)):
    query = request.query
    print(f"DEBUG: Received chat request - Query: {query}, DeepRAG: {request.deep_rag}, AutoSummarize: {request.auto_summarize}")
    
    # 1. Extract topic
    topic = nlp_service.get_topic_for_query(query)
    
    # 2. Retrieve from FAISS
    context_chunks, confidence = nlp_service.retrieve_context(
        query, 
        deep_rag=request.deep_rag
    )
    
    # 3. Formulate answer
    # Lower threshold to 0.25 for better responsiveness
    THRESHOLD = 0.25
    
    if not context_chunks or confidence < THRESHOLD:
        answer = "I'm sorry, I couldn't find a confident answer in my knowledge base. Please try a more specific academic question."
    else:
        # If Deep RAG is on, we use multiple chunks to form a more comprehensive answer
        if request.deep_rag and len(context_chunks) > 1:
            # Join the top 3 chunks for a 'Deep' answer
            detailed_context = "\n\n".join(context_chunks[:3])
            answer = f"Based on a deep analysis of our knowledge base:\n\n{detailed_context}"
        else:
            answer = f"Based on the knowledge base: {context_chunks[0]}"
        
        # 3.1 Apply Auto-Summarization if requested
        if request.auto_summarize:
            summary = nlp_service.summarize_text(context_chunks)
            answer = f"{summary}\n\n{answer}"
            
        # 3.2 Add a low-confidence disclaimer if needed
        if confidence < 0.40:
            answer = f"*[Note: Low confidence match]*\n{answer}"
    
    # 4. Log to analytics
    db_service.log_query(db, query, topic, confidence)
    
    return ChatResponse(
        answer=answer,
        context_used=context_chunks,
        confidence=confidence,
        topic=topic,
        deep_rag_used=request.deep_rag
    )

@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    contents = await file.read()
    text = pdf_service.extract_text_from_pdf(contents)
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")
    
    chunks = pdf_service.chunk_text(text)
    
    # Add to knowledge base
    # (In a real app, you'd add this incrementally to FAISS, here we just append and re-init for simplicity)
    nlp_service.documents.extend(chunks)
    nlp_service.init_faiss(nlp_service.documents)
    
    return {"message": f"Successfully processed {file.filename} and added {len(chunks)} chunks to knowledge base."}

@app.get("/api/analytics", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(db_service.get_db)):
    return db_service.get_analytics(db)

@app.get("/api/analytics/recent")
def get_recent_activity(db: Session = Depends(db_service.get_db)):
    return db_service.get_recent_queries(db)
