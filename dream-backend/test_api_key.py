import os
import sys
sys.path.insert(0, os.getcwd())

from dotenv import load_dotenv
load_dotenv()

key = os.getenv('OPENAI_API_KEY', '')
print(f"Key loaded: {'YES' if key and key.startswith('sk-') else 'NO'}")
print(f"Key length: {len(key)}")
print(f"Key starts with sk-: {key.startswith('sk-') if key else False}")
