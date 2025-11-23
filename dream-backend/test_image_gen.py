#!/usr/bin/env python3
"""
Test script to manually generate images for existing dreams.
This bypasses the background task system to test image generation directly.
"""
import asyncio
import sys
from database import get_db
import models
import ai

async def generate_image_for_dream(dream_id: int):
    """Manually process a dream to generate interpretation and image"""
    print(f"Processing dream {dream_id}...")
    
    db = next(get_db())
    try:
        dream = db.query(models.Dream).filter(models.Dream.id == dream_id).first()
        if not dream:
            print(f"Dream {dream_id} not found!")
            return
        
        print(f"Dream found: {dream.title}")
        print(f"Text: {dream.raw_text[:100]}...")
        
        # Check if interpretation already exists
        if dream.interpretation:
            print(f"Interpretation already exists. Deleting...")
            db.delete(dream.interpretation)
            db.commit()
        
        try:
            print("\n1. Analyzing dream with AI...")
            analysis = await ai.analyze_dream(dream.raw_text)
            print(f"   ✓ Got analysis: {list(analysis.keys())}")
            
            print("\n2. Generating image...")
            image_url = await ai.generate_dream_image(analysis["image_prompt"])
            print(f"   ✓ Image URL: {image_url[:80]}...")
            
            print("\n3. Saving to database...")
            import json
            # Convert symbols dict to string if it's a dict
            symbols = analysis.get("symbols")
            if isinstance(symbols, dict):
                symbols = json.dumps(symbols)
            elif symbols is None:
                symbols = None
            
            # Convert emotions list to string if it's a list
            emotions = analysis.get("emotions")
            if isinstance(emotions, list):
                emotions = ", ".join(emotions)
            elif emotions is None:
                emotions = None
            
            interp = models.DreamInterpretation(
                poetic_narrative=analysis.get("poetic_narrative"),
                meaning=analysis.get("meaning"),
                symbols=symbols,
                emotions=emotions,
                image_url=image_url,
                dream_id=dream.id,
            )
            db.add(interp)
            db.commit()
            print(f"   ✓ Saved successfully!")
            print(f"\n✅ Dream {dream_id} processed successfully!")
            print(f"   Image URL: {image_url}")
            
        except ValueError as e:
            print(f"\n❌ Configuration Error: {e}")
            print("   Check your OPENAI_API_KEY in .env file")
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_image_gen.py <dream_id>")
        print("Example: python test_image_gen.py 1")
        sys.exit(1)
    
    dream_id = int(sys.argv[1])
    asyncio.run(generate_image_for_dream(dream_id))

