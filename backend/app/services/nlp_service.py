import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Initialize the embedding model
MODEL_NAME = 'all-MiniLM-L6-v2'
try:
    print("Loading SentenceTransformer model...")
    model = SentenceTransformer(MODEL_NAME)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# In-memory storage for documents
documents = []
index = None

def init_faiss(docs):
    global documents, index
    if not model or not docs:
        return
    documents = docs
    embeddings = model.encode(docs, convert_to_numpy=True)
    
    # Initialize FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    print(f"FAISS index initialized with {len(docs)} documents.")

def retrieve_context(query: str, top_k: int = 2, deep_rag: bool = False):
    if deep_rag:
        top_k = 10 # significantly more context for "Deep" analysis
    
    if not model or index is None or index.ntotal == 0:
        return [], 0.0
    
    query_embedding = model.encode([query], convert_to_numpy=True)
    distances, indices = index.search(query_embedding, top_k)
    
    results = []
    confidence = 0.0
    
    if len(indices[0]) > 0 and indices[0][0] != -1:
        # Convert L2 distance to a pseudo-confidence score (0 to 1)
        # Smaller distance = higher confidence. 
        best_dist = distances[0][0]
        # Heuristic: all-MiniLM-L6-v2 distances usually 0.5-1.5 for matches
        confidence = max(0.0, min(1.0, 1.2 - (best_dist / 1.5)))
        
        for idx in indices[0]:
            if idx != -1 and idx < len(documents):
                results.append(documents[idx])
                
    return results, confidence

def summarize_text(context_chunks: list[str]) -> str:
    if not context_chunks:
        return ""
    
    # Simple extractive summarization:
    # Take the first sentence of the top 3 chunks
    summary_sentences = []
    for chunk in context_chunks[:3]:
        sentence = chunk.split('.')[0] + '.'
        if sentence not in summary_sentences:
            summary_sentences.append(sentence)
    
    summary = " ".join(summary_sentences)
    
    if len(summary) > 300:
        summary = summary[:297] + "..."
        
    return f"✨ **AI Summary:** {summary}"

def get_topic_for_query(query: str) -> str:
    # A simple keyword-based topic extractor for analytics
    query_lower = query.lower()
    if any(word in query_lower for word in ["physics", "newton", "force", "velocity", "quantum", "relativity"]):
        return "Physics"
    elif any(word in query_lower for word in ["math", "calculus", "algebra", "integral", "derivative"]):
        return "Mathematics"
    elif any(word in query_lower for word in ["computer", "code", "algorithm", "recursion", "python", "data"]):
        return "Computer Science"
    elif any(word in query_lower for word in ["history", "war", "empire"]):
        return "History"
    else:
        return "General"
