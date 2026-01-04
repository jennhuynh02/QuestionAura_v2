"""
Seed script to populate topics in the database.
Run this script to add default topics to the database.
"""
import sys
from app.database import SessionLocal
from app.models.topic import Topic

# Topics to seed based on the screenshot
TOPICS = [
    "Programming",
    "Finance",
    "Books",
    "Criminology",
    "Philosophy",
    "Nature",
    "Psychology",
    "Music",
    "Career",
    "Technology",
    "Art",
    "History",
]


def seed_topics():
    """Seed topics into the database."""
    db = SessionLocal()
    try:
        created_count = 0
        skipped_count = 0
        
        for topic_name in TOPICS:
            # Check if topic already exists
            existing_topic = db.query(Topic).filter(Topic.name == topic_name).first()
            
            if existing_topic:
                print(f"Topic '{topic_name}' already exists, skipping...")
                skipped_count += 1
            else:
                topic = Topic(name=topic_name)
                db.add(topic)
                created_count += 1
                print(f"Created topic: {topic_name}")
        
        db.commit()
        print(f"\n✅ Seeding complete!")
        print(f"   Created: {created_count} topics")
        print(f"   Skipped: {skipped_count} topics (already exist)")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding topics: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_topics()

