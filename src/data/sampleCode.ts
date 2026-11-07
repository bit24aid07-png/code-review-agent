export interface SampleSnippet {
  id: string;
  name: string;
  language: string;
  description: string;
  code: string;
  expectedMemoryTrigger: string;
}

export const SAMPLE_SNIPPETS: SampleSnippet[] = [
  {
    id: 'sample-fastapi-auth',
    name: 'FastAPI User Authentication (SQL Injection & Missing Types)',
    language: 'Python',
    description: 'Contains raw SQL f-string formatting, missing PEP 484 type hints, and bare except block.',
    expectedMemoryTrigger: 'Triggers PEP 484 Type Hints preference & OWASP SQL Injection team standard',
    code: `import os
from database import db

# Look up user account by ID
def get_user_profile(user_id, include_secrets=False):
    # Unsafe raw f-string concatenation
    query = f"SELECT * FROM users WHERE user_id = '{user_id}'"
    
    try:
        cursor = db.cursor()
        cursor.execute(query)
        record = cursor.fetchone()
        
        if not record:
            return None
            
        if not include_secrets:
            del record['password_hash']
            
        return record
    except:
        # Bare except hides critical system crashes
        print("Error fetching user")
        return None
`,
  },
  {
    id: 'sample-nested-loop',
    name: 'Analytics Data Aggregator (Nested Loops & Resource Leak)',
    language: 'Python',
    description: 'Deep nested loops O(N^3) over records without context manager file handling.',
    expectedMemoryTrigger: 'Triggers Avoid Nested Loops preference & Context Manager resource rule',
    code: `def process_monthly_metrics(filepath, region_filter):
    # Missing 'with' statement context manager
    f = open(filepath, 'r')
    raw_lines = f.readlines()
    
    matched_results = []
    
    # Inefficient nested loops instead of comprehension or dict index
    for line in raw_lines:
        parts = line.strip().split(',')
        if len(parts) >= 4:
            for item in parts:
                if item == region_filter:
                    for sub in parts:
                        if sub.startswith("val_"):
                            matched_results.append(sub)
                            
    f.close()
    return matched_results
`,
  },
  {
    id: 'sample-clean-pythonic',
    name: 'Modern Clean Pythonic Service (Adheres to Standards)',
    language: 'Python',
    description: 'Demonstrates PEP 484 types, parameterized queries, context managers, and comprehensions.',
    expectedMemoryTrigger: 'Full compliance with developer memory and team standards',
    code: `from typing import Optional, Dict, Any, List
from sqlalchemy import text
from sqlalchemy.engine import Connection

class UserService:
    def __init__(self, connection: Connection) -> None:
        self._conn = connection

    def find_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Safely fetch user using parameterized query and PEP 484 annotations."""
        query = text("SELECT id, username, email, is_active FROM users WHERE id = :user_id")
        result = self._conn.execute(query, {"user_id": user_id})
        row = result.mappings().first()
        return dict(row) if row else None

    def filter_active_usernames(self, users: List[Dict[str, Any]]) -> List[str]:
        """Concise list comprehension avoiding nested loops."""
        return [u["username"] for u in users if u.get("is_active")]
`,
  },
];
