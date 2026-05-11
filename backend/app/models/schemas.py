from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# SQLAlchemy Models
class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(String, index=True)
    topic = Column(String, index=True)
    confidence_score = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Pydantic Schemas
class ChatRequest(BaseModel):
    query: str
    deep_rag: Optional[bool] = False
    auto_summarize: Optional[bool] = False

class ChatResponse(BaseModel):
    answer: str
    context_used: List[str]
    confidence: float
    topic: str
    deep_rag_used: bool = False

class AnalyticsSummary(BaseModel):
    total_queries: int
    avg_confidence: float
    most_searched_topics: List[dict] # e.g., [{"topic": "Physics", "count": 5}]
    activity_trends: List[dict] # e.g., [{"date": "2026-05-04", "count": 10}]
