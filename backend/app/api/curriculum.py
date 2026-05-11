from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/curriculum", tags=["curriculum"])

class Subject(BaseModel):
    id: str
    title: str
    icon_type: str
    color: str
    progress: int
    lessons: int
    topics: List[str]
    status: str

class RoadmapStep(BaseModel):
    date: str
    title: str
    type: str
    desc: str

class CurriculumData(BaseModel):
    subjects: List[Subject]
    roadmap: List[RoadmapStep]
    xp: int
    level: int

@router.get("", response_model=CurriculumData)
async def get_curriculum():
    return {
        "xp": 1240,
        "level": 12,
        "subjects": [
            {
                "id": "physics",
                "title": "Physics",
                "icon_type": "Atom",
                "color": "from-blue-500 to-cyan-400",
                "progress": 75,
                "lessons": 12,
                "topics": ["Classical Mechanics", "Thermodynamics", "Quantum Basics"],
                "status": "In Progress"
            },
            {
                "id": "cs",
                "title": "Computer Science",
                "icon_type": "Brain",
                "color": "from-purple-500 to-indigo-400",
                "progress": 40,
                "lessons": 8,
                "topics": ["Data Structures", "Algorithms", "Machine Learning"],
                "status": "Growing"
            },
            {
                "id": "math",
                "title": "Mathematics",
                "icon_type": "Calculator",
                "color": "from-emerald-500 to-teal-400",
                "progress": 90,
                "lessons": 15,
                "topics": ["Calculus", "Linear Algebra", "Statistics"],
                "status": "Mastering"
            }
        ],
        "roadmap": [
            { "date": "May 04", "title": "Calculus Fundamentals", "type": "Mathematics", "desc": "Deep dive into derivatives and integration from your PDF notes." },
            { "date": "May 05", "title": "Data Structures Mastery", "type": "Computer Science", "desc": "Analyzing complexity and binary search tree implementations." },
            { "date": "May 07", "title": "Quantum Mechanics Intro", "type": "Physics", "desc": "Understanding wave-particle duality and state vectors." }
        ]
    }
