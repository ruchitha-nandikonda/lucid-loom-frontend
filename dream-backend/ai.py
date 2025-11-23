import os
import httpx
import base64
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")  # Optional, free tier works without key

BASE_URL = "https://api.openai.com/v1/chat/completions"
IMAGE_URL = "https://api.openai.com/v1/images/generations"
# Free Stable Diffusion via Hugging Face
HUGGINGFACE_IMAGE_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"


async def analyze_dream(raw_text: str):
    """
    Returns poetic_narrative, meaning, symbols, emotions, image_prompt
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
        raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.")
    
    system_prompt = """
You are a friendly dream interpreter.
Given a user's dream, you will:

1) Rewrite it as a short poetic narrative (3-6 sentences).
2) Explain its possible meaning in simple language (5-8 sentences).
3) List main symbols and what they might represent.
4) Describe the emotional tone with 3-5 emotion words.

Return JSON with keys:
poetic_narrative, meaning, symbols, emotions, image_prompt.

The image_prompt should describe a realistic, photorealistic scene based on the dream. 
Use natural lighting, real-world settings, and lifelike details. Make it look like a real photograph, not a painting or illustration.
"""

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            BASE_URL,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": raw_text},
                ],
                "response_format": {"type": "json_object"},
            },
            timeout=30,  # Reduced timeout for faster failure detection
        )
        
        if resp.status_code != 200:
            error_data = resp.json() if resp.content else {}
            raise Exception(f"OpenAI API error: {error_data.get('error', {}).get('message', 'Unknown error')}")

    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    import json
    result = json.loads(content)
    return result


async def generate_dream_image(image_prompt: str, use_free: bool = False):
    """
    Generate dream image using either:
    - Free: Hugging Face Stable Diffusion (free tier)
    - Paid: OpenAI DALL-E 3 ($0.04 per image)
    """
    # Enhance prompt to ensure realistic, photorealistic style
    enhanced_prompt = f"Photorealistic, realistic photograph: {image_prompt}. High quality, natural lighting, lifelike details, real-world setting, professional photography style."
    
    if use_free:
        # Use free Hugging Face Stable Diffusion
        return await _generate_image_free(enhanced_prompt)
    else:
        # Use paid OpenAI DALL-E 3
        return await _generate_image_paid(enhanced_prompt)


async def _generate_image_free(image_prompt: str):
    """
    Free image generation - Currently disabled due to reliability issues.
    Free services (Hugging Face, etc.) are often slow, unreliable, or require complex setup.
    
    Recommendation: Skip images to save money, or use paid DALL-E 3 for reliable results.
    """
    raise Exception(
        "Free image generation is currently unavailable due to reliability issues with free services. "
        "To save money, uncheck 'Generate image' when creating dreams. "
        "You'll still get full AI interpretation (narrative, meaning, symbols, emotions) without the image."
    )


async def _generate_image_paid(image_prompt: str):
    """Generate image using paid OpenAI DALL-E 3"""
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
        raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.")
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            IMAGE_URL,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "dall-e-3",
                "prompt": image_prompt,
                "size": "1024x1024",
            },
            timeout=45,
        )
        
        if resp.status_code != 200:
            error_data = resp.json() if resp.content else {}
            raise Exception(f"OpenAI Image API error: {error_data.get('error', {}).get('message', 'Unknown error')}")

    data = resp.json()
    # OpenAI DALL-E 3 returns data.data[0].url
    image_url = data["data"][0]["url"]
    return image_url


async def rewrite_dream(raw_text: str, style: str):
    """
    Rewrite a dream in a specific narrative style.
    Returns the rewritten narrative.
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
        raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.")
    
    style_prompts = {
        "horror": "Rewrite this dream as a chilling horror story. Use dark, atmospheric language. Create suspense and unease. Keep it 4-8 sentences.",
        "sci-fi": "Rewrite this dream as a science fiction narrative. Add futuristic elements, technology, or space themes. Make it feel like a sci-fi story. Keep it 4-8 sentences.",
        "children": "Rewrite this dream as a gentle children's story. Use simple, warm language. Make it magical and age-appropriate. Keep it 4-8 sentences.",
        "fantasy": "Rewrite this dream as a fantasy tale. Add magical elements, mythical creatures, or enchanted settings. Make it feel like a fantasy adventure. Keep it 4-8 sentences.",
        "noir": "Rewrite this dream as a film noir story. Use hard-boiled detective style, shadows, mystery, and urban atmosphere. Keep it 4-8 sentences.",
        "poetic": "Rewrite this dream as a beautiful poem in prose form. Use lyrical, flowing language with metaphors and imagery. Keep it 4-8 sentences.",
    }
    
    style_prompt = style_prompts.get(style.lower(), style_prompts["poetic"])
    
    system_prompt = f"""
You are a creative writer specializing in {style} narratives.
{style_prompt}

Return only the rewritten narrative text, no JSON, no explanations, just the story.
"""

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            BASE_URL,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": raw_text},
                ],
            },
            timeout=60,
        )
        
        if resp.status_code != 200:
            error_data = resp.json() if resp.content else {}
            raise Exception(f"OpenAI API error: {error_data.get('error', {}).get('message', 'Unknown error')}")

    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    return content.strip()


async def explain_symbol(symbol: str):
    """
    Provide a detailed explanation of what a dream symbol might mean.
    Returns a comprehensive explanation with cultural, psychological, and personal context.
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
        raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.")
    
    system_prompt = """
You are a dream interpretation expert with knowledge of psychology, mythology, and cultural symbolism.
When given a dream symbol, provide a comprehensive explanation that includes:

1. General meaning (2-3 sentences)
2. Psychological interpretation (2-3 sentences)
3. Cultural/mythological associations (2-3 sentences)
4. What it might mean in personal context (2-3 sentences)

Return JSON with keys:
general_meaning, psychological, cultural, personal_context.

Be insightful, educational, and respectful of different interpretations.
"""

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            BASE_URL,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Explain the dream symbol: {symbol}"},
                ],
                "response_format": {"type": "json_object"},
            },
            timeout=60,
        )
        
        if resp.status_code != 200:
            error_data = resp.json() if resp.content else {}
            raise Exception(f"OpenAI API error: {error_data.get('error', {}).get('message', 'Unknown error')}")

    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    import json
    result = json.loads(content)
    return result


async def analyze_dream_patterns(dreams_data: list):
    """
    Analyze patterns across multiple dreams.
    dreams_data should be a list of dicts with: title, raw_text, symbols, emotions, created_at
    Returns comprehensive pattern analysis.
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
        raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.")
    
    # Prepare summary of dreams for analysis
    dreams_summary = []
    for dream in dreams_data:
        summary = f"Dream: {dream.get('title', 'Untitled')}\n"
        summary += f"Text: {dream.get('raw_text', '')[:200]}...\n"
        if dream.get('symbols'):
            summary += f"Symbols: {dream.get('symbols')}\n"
        if dream.get('emotions'):
            summary += f"Emotions: {dream.get('emotions')}\n"
        dreams_summary.append(summary)
    
    combined_text = "\n\n---\n\n".join(dreams_summary)
    
    system_prompt = """
You are a dream analysis expert specializing in pattern recognition across multiple dreams.
Analyze the provided collection of dreams and identify:

1. Recurring themes or motifs
2. Emotional patterns and trends
3. Common symbols and their frequency
4. Temporal patterns (how dreams change over time)
5. Personal insights and growth patterns
6. Recommendations for further exploration

Return JSON with keys:
recurring_themes, emotional_patterns, symbol_patterns, temporal_insights, personal_growth, recommendations.

Be insightful, supportive, and focus on patterns that could help the dreamer understand themselves better.
"""

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            BASE_URL,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Analyze these {len(dreams_data)} dreams for patterns:\n\n{combined_text}"},
                ],
                "response_format": {"type": "json_object"},
            },
            timeout=90,
        )
        
        if resp.status_code != 200:
            error_data = resp.json() if resp.content else {}
            raise Exception(f"OpenAI API error: {error_data.get('error', {}).get('message', 'Unknown error')}")

    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    import json
    result = json.loads(content)
    return result

