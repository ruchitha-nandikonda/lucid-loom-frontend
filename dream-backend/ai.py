import os
import httpx
import base64
from dotenv import load_dotenv

load_dotenv()

# API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")  # For image generation only
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")  # Optional, free tier works without key

# API endpoints
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"  # Fast and free Groq model
OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations"
# Free Stable Diffusion via Hugging Face
HUGGINGFACE_IMAGE_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"


async def analyze_dream(raw_text: str):
    """
    Call Groq to interpret dream.
    Returns poetic_narrative, meaning, symbols, emotions, image_prompt
    """
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        raise ValueError("GROQ_API_KEY not configured. Please set GROQ_API_KEY in .env file.")

    system_prompt = """
You are a friendly, poetic dream interpreter.
Given a dream description, respond in JSON with keys:
- poetic_narrative: a short, beautiful retelling (3-6 sentences)
- meaning: simple explanation of what this dream might mean (5-8 sentences)
- symbols: a comma-separated list of key symbols and what they might represent
- emotions: 3-6 emotion words (e.g. fear, curiosity, hope)
- image_prompt: a detailed description focusing on the main visual elements, symbols, and atmosphere of the dream. Describe the key objects, settings, lighting, colors, and mood. This will be used to create a surreal, dream-like artistic image, so focus on the most evocative and symbolic elements (2-4 sentences).
Reply ONLY with JSON.
"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": raw_text},
        ],
        "temperature": 0.8,
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(GROQ_URL, headers=headers, json=payload, timeout=60)
        
        if resp.status_code != 200:
            error_data = resp.json() if resp.content else {}
            raise Exception(f"Groq API error: {error_data.get('error', {}).get('message', 'Unknown error')}")

    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    
    import json
    result = json.loads(content)
    return {
        "poetic_narrative": result.get("poetic_narrative", ""),
        "meaning": result.get("meaning", ""),
        "symbols": result.get("symbols", ""),
        "emotions": result.get("emotions", ""),
        "image_prompt": result.get("image_prompt", ""),
    }


async def generate_dream_image(image_prompt: str, dream_text: str = "", use_free: bool = False):
    """
    Generate dream image using either:
    - Free: Hugging Face Stable Diffusion (free tier) - currently disabled
    - Paid: OpenAI DALL-E 3 ($0.04 per image)
    Creates surreal, dream-like scenes with cinematic, poetic atmosphere.
    """
    if use_free:
        return await _generate_image_free(image_prompt)
    else:
        return await _generate_image_paid(image_prompt, dream_text)


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


async def _generate_image_paid(image_prompt: str, dream_text: str = ""):
    """Generate image using paid OpenAI DALL-E 3"""
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_api_key_here":
        raise ValueError("OPENAI_API_KEY not configured. Please set OPENAI_API_KEY in .env file.")
    
    # Base artistic direction for dream-like images
    artistic_direction = (
        "Create a surreal, dream-like scene. Focus on the main symbols and emotions. "
        "Use soft, cinematic lighting, gentle fog, and a slightly magical atmosphere. "
        "Make the scene feel poetic, calm, and otherworldly — not scary unless the dream naturally suggests darkness. "
        "Avoid showing real people clearly; use silhouettes or symbolic figures instead. "
        "Keep the image cohesive, visually clean, and emotionally expressive."
    )
    
    # Combine AI prompt with key details from original dream for better accuracy
    if dream_text:
        # Extract key visual elements from dream text (first 300 chars for context)
        dream_snippet = dream_text[:300].strip()
        # Create a more detailed prompt that includes specific dream details
        enhanced_prompt = (
            f"{artistic_direction} "
            f"Scene description: {image_prompt}. "
            f"Include specific dream details: {dream_snippet}. "
            f"High quality, cinematic composition, dreamy atmosphere, surreal aesthetic."
        )
    else:
        enhanced_prompt = (
            f"{artistic_direction} "
            f"Scene description: {image_prompt}. "
            f"High quality, cinematic composition, dreamy atmosphere, surreal aesthetic."
        )
    
    # Limit prompt length (DALL-E 3 has a 4000 character limit, but we'll keep it concise)
    if len(enhanced_prompt) > 1000:
        enhanced_prompt = enhanced_prompt[:1000] + "..."
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            OPENAI_IMAGE_URL,
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "dall-e-3",
                "prompt": enhanced_prompt,
                "size": "1024x1024",
                "quality": "standard",
            },
            timeout=90,
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
    Uses Groq for free text generation.
    Returns the rewritten narrative.
    """
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        raise ValueError("GROQ_API_KEY not configured. Please set GROQ_API_KEY in .env file.")
    
    style_prompts = {
        "horror": "Rewrite this dream as a horror scene. Make it dark, eerie, and suspenseful. Keep the core symbols and emotions but transform them into a terrifying narrative.",
        "sci-fi": "Rewrite this dream as a science fiction story. Add futuristic elements, technology, space, or alternate dimensions. Keep the core symbols but give them a sci-fi twist.",
        "children": "Rewrite this dream as a gentle children's story. Use simple, warm language. Make it magical and age-appropriate. Keep it 4-8 sentences.",
        "fantasy": "Rewrite this dream as a fantasy tale. Add magical elements, mythical creatures, or enchanted settings. Make it feel like a fantasy adventure. Keep it 4-8 sentences.",
        "fairy-tale": "Rewrite this dream as a fairy tale. Use magical elements, enchanted settings, and fairy tale language. Make it whimsical and enchanting.",
        "myth": "Rewrite this dream as a mythological story. Use gods, heroes, ancient settings, and epic language. Make it feel like an ancient legend.",
        "bedtime-story": "Rewrite this dream as a calming bedtime story. Make it gentle, peaceful, and soothing. Use soft language and comforting imagery.",
        "noir": "Rewrite this dream as a film noir story. Use hard-boiled detective style, shadows, mystery, and urban atmosphere. Keep it 4-8 sentences.",
        "poetic": "Rewrite this dream as a beautiful poem in prose form. Use lyrical, flowing language with metaphors and imagery. Keep it 4-8 sentences.",
    }
    
    style_prompt = style_prompts.get(style.lower(), style_prompts.get("fairy-tale", style_prompts["poetic"]))
    
    system_prompt = f"""
You are a creative writer specializing in {style} narratives.
{style_prompt}
Return ONLY the rewritten dream narrative, no explanations or meta-commentary.
Make it 3-5 sentences, vivid and engaging.
"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": raw_text},
        ],
        "temperature": 0.9,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(GROQ_URL, headers=headers, json=payload, timeout=60)
        
        if resp.status_code != 200:
            error_data = resp.json() if resp.content else {}
            raise Exception(f"Groq API error: {error_data.get('error', {}).get('message', 'Unknown error')}")

    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    return content.strip()


async def explain_symbol(symbol: str):
    """
    Provide a detailed explanation of what a dream symbol might mean.
    Uses Groq for free text generation.
    Returns a comprehensive explanation with cultural, psychological, and personal context.
    """
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        raise ValueError("GROQ_API_KEY not configured. Please set GROQ_API_KEY in .env file.")
    
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

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Explain the dream symbol: {symbol}"},
        ],
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(GROQ_URL, headers=headers, json=payload, timeout=60)
        
        if resp.status_code != 200:
            error_data = resp.json() if resp.content else {}
            raise Exception(f"Groq API error: {error_data.get('error', {}).get('message', 'Unknown error')}")

    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    import json
    result = json.loads(content)
    return result


async def analyze_dream_patterns(dreams_data: list):
    """
    Analyze patterns across multiple dreams.
    Uses Groq for free text generation.
    dreams_data should be a list of dicts with: title, raw_text, symbols, emotions, created_at
    Returns comprehensive pattern analysis.
    """
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        raise ValueError("GROQ_API_KEY not configured. Please set GROQ_API_KEY in .env file.")
    
    # Prepare dream summaries for analysis
    dream_summaries = []
    for dream in dreams_data[:10]:  # Last 10 dreams
        summary = f"Dream: {dream.get('title', 'Untitled')}\n"
        summary += f"Text: {dream.get('raw_text', '')[:200]}\n"
        # Check for symbols and emotions directly (from main.py structure)
        if dream.get('symbols'):
            summary += f"Symbols: {dream.get('symbols', '')}\n"
        if dream.get('emotions'):
            summary += f"Emotions: {dream.get('emotions', '')}\n"
        dream_summaries.append(summary)
    
    combined_dreams = "\n\n---\n\n".join(dream_summaries)
    
    system_prompt = """
You are a dream pattern analyst specializing in pattern recognition across multiple dreams.
Analyze the provided collection of dreams and identify:

1. Recurring themes or motifs that appear across multiple dreams
2. Emotional patterns and trends (how emotions evolve over time)
3. Common symbols and their frequency/patterns
4. Temporal patterns (how dreams change over time)
5. Personal insights and growth patterns
6. Recommendations for further exploration

Respond in JSON format with keys:
- recurring_themes: A detailed description of recurring themes or motifs across the dreams (3-5 sentences)
- emotional_patterns: Analysis of emotional patterns and trends (3-5 sentences)
- symbol_patterns: Analysis of common symbols and their patterns (3-5 sentences)
- temporal_insights: Insights about how dreams change over time (3-5 sentences)
- personal_growth: Personal insights and growth patterns observed (3-5 sentences)
- recommendations: Recommendations for further exploration and reflection (2-4 sentences)

Be insightful, supportive, and focus on patterns that could help the dreamer understand themselves better.
"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": combined_dreams},
        ],
        "temperature": 0.7,
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(GROQ_URL, headers=headers, json=payload, timeout=90)
        
        if resp.status_code != 200:
            error_data = resp.json() if resp.content else {}
            raise Exception(f"Groq API error: {error_data.get('error', {}).get('message', 'Unknown error')}")

    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    import json
    try:
        result = json.loads(content)
        # Ensure all required keys exist
        required_keys = ["recurring_themes", "emotional_patterns", "symbol_patterns", "temporal_insights", "personal_growth", "recommendations"]
        for key in required_keys:
            if key not in result:
                result[key] = f"Analysis for {key.replace('_', ' ')} is not available."
        return result
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response as JSON: {str(e)}. Response: {content[:200]}")
