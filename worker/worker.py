import os
import time
from datetime import datetime
from bson.objectid import ObjectId
from dotenv import load_dotenv
import redis
from pymongo import MongoClient

# Load environment variables
# Look for the env file in the backend directory assuming typical layout
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', '.env')
load_dotenv(dotenv_path)

# Redis Connection
redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
r = redis.Redis.from_url(redis_url, decode_responses=True)

# MongoDB Connection
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)

# Correctly get the database name from the URI or default to 'test'
try:
    db = client.get_default_database()
except Exception:
    # Fallback for URIs without a path segment
    db = client['test']

tasks_collection = db['tasks']

def process_task(task):
    """Processes the task based on the operation requested."""
    input_text = task.get('input', '')
    operation = task.get('operation', '')

    print(f"Processing Task ID: {task['_id']}, Operation: {operation}")

    try:
        result = None
        if operation == 'uppercase':
            result = input_text.upper()
        elif operation == 'lowercase':
            result = input_text.lower()
        elif operation == 'reverse':
            result = input_text[::-1]
        elif operation == 'word count':
            result = str(len(input_text.split()))
        else:
            raise ValueError(f"Unknown operation: {operation}")
        
        # Simulate some processing time
        time.sleep(2)
        
        # Update MongoDB with Success
        tasks_collection.update_one(
            {'_id': ObjectId(task['_id'])},
            {
                '$set': {
                    'status': 'completed',
                    'result': result
                },
                '$push': {
                    'logs': {
                        'message': 'Task processed successfully',
                        'timestamp': datetime.utcnow()
                    }
                }
            }
        )
        print(f"Task ID {task['_id']} completed successfully.")

    except Exception as e:
        print(f"Task ID {task['_id']} failed. Error: {str(e)}")
        # Update MongoDB with Failure
        tasks_collection.update_one(
            {'_id': ObjectId(task['_id'])},
            {
                '$set': {
                    'status': 'failed',
                },
                '$push': {
                    'logs': {
                        'message': f'Task failed: {str(e)}',
                        'timestamp': datetime.utcnow()
                    }
                }
            }
        )

def main():
    print("Python Worker Started. Waiting for jobs...")
    while True:
        try:
            # BRPOP blocks until a job is available in the 'jobs' queue
            # It returns a tuple: (queue_name, popped_value)
            queue_name, task_id = r.brpop('jobs', timeout=0)
            
            if task_id:
                print(f"\n[{datetime.now()}] Popped job: {task_id}")
                
                # Fetch task from MongoDB
                task = tasks_collection.find_one({'_id': ObjectId(task_id)})
                
                if not task:
                    print(f"Task {task_id} not found in database. Skipping.")
                    continue
                
                process_task(task)
                
        except redis.RedisError as re:
            print(f"Redis Connection Error: {re}. Retrying in 5s...")
            time.sleep(5)
        except Exception as e:
            print(f"Worker Error: {e}")
            time.sleep(1)

if __name__ == '__main__':
    main()
