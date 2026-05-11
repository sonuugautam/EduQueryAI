import os
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, Session
from app.models.schemas import Base, QueryLog
from datetime import datetime, timedelta

DB_URL = "sqlite:///./analytics.db"

engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def log_query(db: Session, query_text: str, topic: str, confidence: float):
    new_log = QueryLog(
        query_text=query_text,
        topic=topic,
        confidence_score=confidence,
        timestamp=datetime.utcnow()
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

def get_analytics(db: Session):
    total_queries = db.query(QueryLog).count()
    
    avg_conf = db.query(func.avg(QueryLog.confidence_score)).scalar()
    avg_confidence = round(avg_conf, 2) if avg_conf is not None else 0.0

    # Most searched topics
    topics_query = db.query(QueryLog.topic, func.count(QueryLog.id).label('count')).group_by(QueryLog.topic).order_by(func.count(QueryLog.id).desc()).limit(5).all()
    most_searched_topics = [{"name": t[0], "count": t[1]} for t in topics_query]

    # Activity trends (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    # SQLite datetime string slicing to get date 'YYYY-MM-DD'
    activity_query = db.query(func.date(QueryLog.timestamp), func.count(QueryLog.id)).filter(QueryLog.timestamp >= seven_days_ago).group_by(func.date(QueryLog.timestamp)).all()
    
    activity_trends = [{"date": a[0], "count": a[1]} for a in activity_query]

    return {
        "total_queries": total_queries,
        "avg_confidence": avg_confidence,
        "most_searched_topics": most_searched_topics,
        "activity_trends": activity_trends
    }

def get_recent_queries(db: Session, limit: int = 10):
    queries = db.query(QueryLog).order_by(QueryLog.timestamp.desc()).limit(limit).all()
    return [{"query": q.query_text, "topic": q.topic, "time": q.timestamp.strftime("%H:%M"), "confidence": round(q.confidence_score, 2)} for q in queries]
