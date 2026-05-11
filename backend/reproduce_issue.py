import json
import urllib.request

def test_chat(query):
    url = "http://localhost:8001/api/chat"
    payload = {
        "query": query,
        "deep_rag": False,
        "auto_summarize": False
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data)
    req.add_header('Content-Type', 'application/json')
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            print(f"Query: {query}")
            print(f"Answer: {res_data['answer'][:100]}...")
            print(f"Topic: {res_data['topic']}")
            print(f"Confidence: {res_data['confidence']}")
            print("-" * 50)
    except Exception as e:
        print(f"Error for {query}: {e}")

if __name__ == "__main__":
    queries = [
        "Continue my learning path for Physics",
        "Continue my learning path for Computer Science",
        "Continue my learning path for Mathematics"
    ]
    for q in queries:
        test_chat(q)
