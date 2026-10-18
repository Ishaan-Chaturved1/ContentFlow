import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from typing import List, Tuple, Optional
import httpx
from pydantic import ValidationError

from google import genai
from google.genai import types
from google.genai.errors import APIError, ClientError, ServerError

from app.config import settings
from app.schemas import CampaignCreate, GeneratedPostSchema, GeneratedCalendarSchema

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a luxury marketing director and architectural creative strategist specializing in high-end interior design, bespoke furniture, and architectural lifestyle brands.

Your task is to craft an authentic, elevated social media calendar based strictly on the provided brand brief.
Adhere strictly to these rules:
1. NEVER fabricate client testimonials, awards, statistics, or unverified factual claims.
2. Focus on craftsmanship, materiality, spatial philosophy, architectural light, tactile details, and quiet luxury.
3. Every post must include:
   - day_number: integer (1 to N)
   - scheduled_date: formatted string (e.g. "Day 1 - Mon Oct 20")
   - platform: exactly "Instagram" or "LinkedIn" (distribute across requested platforms appropriately)
   - content_type: e.g. "Carousel - Materiality Study", "Project Showcase", "Thought Leadership Essay", "Behind the Atelier", "Architectural Reel Concept"
   - topic: concise, compelling hook
   - caption: rich, sophisticated copy with clear paragraph breaks and elegant phrasing
   - hashtags: 5-8 relevant, premium hashtags (no hashtag spam)
   - cta: refined call-to-action (e.g. "Reserve a consultation at the link in bio", "Inquire via private message", "Read the monograph at the link above")
   - visual_prompt: highly detailed creative direction for an art director/photographer (framing, lighting, textures, camera angle, color temperature)
   - notes: internal editorial rationale

You must respond ONLY with valid JSON conforming to the requested schema. No markdown formatting backticks, no preamble."""


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_calendar(
        self, brief: CampaignCreate
    ) -> Tuple[List[GeneratedPostSchema], str, bool]:
        """
        Generate content calendar posts.
        Returns: (posts_list, provider_name, is_demo_mode)
        """
        pass


class DemoProvider(BaseLLMProvider):
    """
    Labelled DEMO MODE provider.
    Provides realistic, high-fidelity luxury content tailored to the brand brief
    without requiring external API credentials.
    """

    async def generate_calendar(
        self, brief: CampaignCreate
    ) -> Tuple[List[GeneratedPostSchema], str, bool]:
        logger.info(
            f"Using DEMO MODE provider for brand '{brief.brand_name}' ({brief.number_of_days} days)"
        )
        posts: List[GeneratedPostSchema] = []

        # Curated architectural & luxury lifestyle motifs
        themes = [
            {
                "topic": "The Quiet Power of Tactile Materiality",
                "content_type": "Carousel - Materiality Study",
                "caption": (
                    f"At {brief.brand_name}, luxury is never loud. It lives in the dialogue between honed Roman travertine, "
                    "quarter-sawn white oak, and brushed bronze that patinas with grace.\n\n"
                    "When designing spaces for contemporary living, we prioritize materials that absorb light rather than reflect it, "
                    "creating an acoustic and visual sanctuary away from the digital noise of the world.\n\n"
                    "Swipe through our material palette selection for our latest residential commission in the countryside."
                ),
                "hashtags": f"#{brief.brand_name.replace(' ', '')} #QuietLuxury #ArchitecturalDigest #Materiality #InteriorArchitecture #BespokeLiving",
                "cta": "Explore our private portfolio through the link in bio.",
                "visual_prompt": "Ultra high-resolution flat lay of architectural materials: raw linen swatch, honed travertine slab with natural crevices, oxidized bronze hardware sample, and hand-carved smoked oak timber. Soft diffused morning daylight through sheer linen curtains, casting subtle geometric shadows. Shot on Hasselblad H6D-100c.",
                "notes": "Instagram carousel to establish brand authority on organic materials."
            },
            {
                "topic": "Spatial Hierarchy: Designing for Contemplation",
                "content_type": "Thought Leadership Post",
                "caption": (
                    "In an era obsessed with maximum square footage, we find ourselves advocating for the opposite: deliberate restraint.\n\n"
                    f"True architectural luxury is not about filling space; it is about calibrating the cadence between void and form. "
                    f"In our ongoing dialogue with clients at {brief.brand_name}, our objective ({brief.campaign_objective.lower()}) begins with one question: "
                    "How does this room feel when you are entirely alone in it?\n\n"
                    "When the proportion of natural light to shadow is harmonious, emotional restoration follows naturally."
                ),
                "hashtags": "#ArchitecturalPhilosophy #SpatialDesign #LuxuryInteriors #DesignThinking #HighEndResidential",
                "cta": "Read our full studio essay on spatial harmony on our journal.",
                "visual_prompt": "Minimalist double-height living pavilion with floor-to-ceiling glass pivot doors overlooking a tranquil Japanese courtyard garden. Low-slung linen sofa, sculpted monolithic stone coffee table. Golden hour sunlight slicing across polished concrete floors. Architectural symmetry, zero clutter.",
                "notes": "LinkedIn thought-leadership post addressing high-net-worth homeowners and architects."
            },
            {
                "topic": "Atelier Notes: The Joinery of the Monolith Credenza",
                "content_type": "Project Showcase / Reel Script",
                "caption": (
                    "A study in micro-tolerances.\n\n"
                    f"Every piece in the {brief.brand_name} collection ({brief.products_services}) is engineered with hidden mortise-and-tenon joinery, "
                    "allowing the solid timber to expand and contract naturally across seasonal shifts.\n\n"
                    "No visible fasteners. No veneer compromises. Simply master craftspeople honouring organic timber."
                ),
                "hashtags": f"#{brief.brand_name.replace(' ', '')} #Craftsmanship #BespokeFurniture #Joinery #AtelierProcess #ArtisanMade",
                "cta": "Inquire regarding custom dimensions and timber provenance.",
                "visual_prompt": "Close-up macro cinematography of an artisan's hands smoothing a dovetail wood joint with a Japanese hand plane. Fine wood shavings curling in mid-air. Warm directional workshop lighting, dark workshop background, atmospheric dust motes.",
                "notes": "Instagram short-form showcase showing authenticity and craft."
            },
            {
                "topic": "The Collector's Residence: A Curated Palette",
                "content_type": "Case Study Carousel",
                "caption": (
                    f"Curating an art collector's sanctuary requires an understated backdrop.\n\n"
                    "For this commission, our palette balanced chalky mineral wall washes with patinated brass and deep sage accents. "
                    "The furniture layout deliberately directs focus toward natural apertures and museum-grade lighting nodes.\n\n"
                    "Designed to feel collected over decades, rather than styled for an afternoon."
                ),
                "hashtags": "#CollectorHome #ArtAndDesign #BespokeInteriors #ContemporaryArchitecture #LuxuryResidential",
                "cta": "Schedule a private consultation for upcoming 2026/2027 commissions.",
                "visual_prompt": "Editorial interior photograph of an intimate library salon. Floor-to-ceiling dark walnut shelving, custom bouclé armchair next to an understated arched floor lamp. Monochromatic abstract canvas on a limewashed wall. Moody, warm ambient luminescence.",
                "notes": "Instagram & LinkedIn cross-post demonstrating turnkey execution."
            },
            {
                "topic": "Sustained Longevity over Trend Cycles",
                "content_type": "Founder Monologue / Essay",
                "caption": (
                    "Fast trends have no place in enduring architecture.\n\n"
                    f"When we consult with {brief.target_audience}, we emphasize investment pieces and spatial layouts that outlive decorative fads. "
                    "A dining table carved from solid quartzite or a lounge chair upholstered in undyed Belgian wool does not age out of fashion—it accumulates pedigree.\n\n"
                    f"How does your studio balance contemporary technology with timeless heritage?"
                ),
                "hashtags": "#SustainableLuxury #TimelessDesign #InteriorPhilosophy #ArchitectureFirm #LuxuryLiving",
                "cta": "Join the conversation below or contact our advisory team.",
                "visual_prompt": "Clean studio portrait of architectural drawings, raw stone samples, and charcoal sketches laid out on a massive steel worktable. In the background, blurred silhouette of an architect looking out over an overcast city skyline.",
                "notes": "LinkedIn conversational prompt driving engagement with developers and design peers."
            },
            {
                "topic": "Lighting as Fourth Dimension in Spatial Architecture",
                "content_type": "Design Guide / Carousel",
                "caption": (
                    "Lighting should never be an afterthought ceiling grid.\n\n"
                    "We sculpt light in three distinct layers: architectural graze (illuminating textured masonry), task warmth (2700K shielded lamps), "
                    "and ambient cove glow. The result is a room that transitions seamlessly from energizing daylight to evening warmth.\n\n"
                    "Slide 1: Daylight calibration\nSlide 2: Twilight transitions\nSlide 3: Nighttime intimacy"
                ),
                "hashtags": "#ArchitecturalLighting #LightingDesign #Atmosphere #LuxuryHomes #InteriorDetails",
                "cta": "Download our comprehensive lighting architecture brief via link in bio.",
                "visual_prompt": "Three side-by-side architectural perspectives of the same modern kitchen and dining wing at 8 AM, 5 PM, and 10 PM. Showcasing concealed cove lighting, cove wash over textured fluted plaster, and warm pendant glow over a solid marble island.",
                "notes": "Educational carousel for high-taste clients."
            },
            {
                "topic": "Private Commission Preview: The Cliffside Pavilion",
                "content_type": "Architectural Reveal",
                "caption": (
                    f"Completing a project is never the end of our journey—it is the moment a space begins its authentic life.\n\n"
                    f"As we conclude this week's focus for {brief.brand_name}, we invite prospective patrons to experience how our philosophy of "
                    f"'{brief.brand_voice}' translates into tactile living spaces.\n\n"
                    "Private previews for our newly documented monographs are now open."
                ),
                "hashtags": f"#{brief.brand_name.replace(' ', '')} #ArchitectureReveal #ModernPavilion #LuxuryEstates #InteriorStyling",
                "cta": "Request our private studio monograph via our website.",
                "visual_prompt": "Dusk exterior shot of a cantilevered concrete and glass residential pavilion perched over a dramatic coastal cliff. Warm glow radiating from the open-plan interior. Reflective infinity water basin in the foreground reflecting twilight clouds.",
                "notes": "Culminating campaign call-to-action for high-value client conversion."
            }
        ]

        # Platforms distribution
        available_platforms = brief.platforms if brief.platforms else ["Instagram", "LinkedIn"]
        start_date = datetime.now(timezone.utc) + timedelta(days=1)

        for i in range(brief.number_of_days):
            day_num = i + 1
            post_date = start_date + timedelta(days=i)
            date_str = f"Day {day_num} - {post_date.strftime('%a, %b %d')}"
            platform = available_platforms[i % len(available_platforms)]
            theme = themes[i % len(themes)]

            # Adjust platform-specific nuances
            content_type = theme["content_type"]
            if platform == "LinkedIn" and "Reel" in content_type:
                content_type = "Executive Insight / Project Analysis"

            post = GeneratedPostSchema(
                day_number=day_num,
                scheduled_date=date_str,
                platform=platform,
                content_type=content_type,
                topic=theme["topic"],
                caption=theme["caption"],
                hashtags=theme["hashtags"],
                cta=theme["cta"],
                visual_prompt=theme["visual_prompt"],
                notes=theme["notes"]
            )
            posts.append(post)

        return posts, "demo", True


class GeminiProvider(BaseLLMProvider):
    """
    Official Google Gemini API provider using the `google-genai` Python SDK
    (`from google import genai`).
    Supports structured JSON schema enforcement, rate-limit & quota error handling,
    and timeout protection.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key.strip() if api_key else ""
        self.model_name = model_name.strip() if model_name else "gemini-2.5-flash"
        self._client: Optional[genai.Client] = None

    def _get_client(self) -> genai.Client:
        if not self.api_key:
            raise ValueError(
                "Gemini API key is missing. Set GEMINI_API_KEY in backend/.env "
                "or configure LLM_PROVIDER=demo for labelled demo mode."
            )
        if self._client is None:
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    async def generate_calendar(
        self, brief: CampaignCreate
    ) -> Tuple[List[GeneratedPostSchema], str, bool]:
        if not self.api_key:
            raise ValueError(
                "Gemini API key is not configured. Please add GEMINI_API_KEY to backend/.env "
                "or set LLM_PROVIDER=demo for labelled demo mode."
            )

        client = self._get_client()

        prompt = f"""
Generate an elevated social media content calendar for this brand:
- Brand Name: {brief.brand_name}
- Industry: {brief.industry}
- Target Audience: {brief.target_audience}
- Brand Voice & Tone: {brief.brand_voice}
- Products & Services: {brief.products_services}
- Campaign Objective: {brief.campaign_objective}
- Target Platforms: {', '.join(brief.platforms)}
- Content Preferences: {brief.content_preferences or 'Focus on quiet luxury, organic materials, spatial harmony, and architectural precision.'}
- Number of Days: {brief.number_of_days}

Output format must be a structured JSON object containing a 'posts' list with exactly {brief.number_of_days} post items.
Distribute posts evenly across {', '.join(brief.platforms)}.
Ensure each post has: day_number (1..{brief.number_of_days}), scheduled_date, platform, content_type, topic, caption, hashtags, cta, visual_prompt, notes.
"""

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=GeneratedCalendarSchema,
            temperature=0.7,
        )

        try:
            logger.info(f"Calling Gemini API via google-genai SDK (model: {self.model_name})...")
            response = await client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )

            # Extract output
            raw_text = response.text
            if not raw_text or not raw_text.strip():
                raise RuntimeError("Gemini returned an empty response. Check model safety filters or prompt.")

            # Validate structured output
            try:
                parsed_json = json.loads(raw_text)
                calendar = GeneratedCalendarSchema.model_validate(parsed_json)
            except (json.JSONDecodeError, ValidationError) as parse_err:
                logger.error(f"Failed to parse Gemini structured output: {parse_err}. Raw: {raw_text[:300]}")
                raise RuntimeError(f"Gemini returned invalid structured calendar output: {parse_err}")

            if not calendar.posts:
                raise RuntimeError("Gemini generated 0 posts in the calendar.")

            logger.info(f"Successfully generated {len(calendar.posts)} posts via Gemini ({self.model_name})")
            return calendar.posts, f"gemini ({self.model_name})", False

        except APIError as api_err:
            status_code = getattr(api_err, "code", None)
            err_msg = str(api_err)
            logger.error(f"Gemini APIError ({status_code}): {err_msg}")

            if status_code == 429 or "RESOURCE_EXHAUSTED" in err_msg or "quota" in err_msg.lower():
                raise RuntimeError(
                    "Gemini API rate limit or quota exceeded (429). "
                    "Please wait a moment before retrying or verify your quota in Google AI Studio."
                )
            elif status_code in (400, 401, 403) or "API_KEY_INVALID" in err_msg or "api key" in err_msg.lower():
                raise RuntimeError(
                    f"Gemini API authentication failed ({status_code}): Invalid or unauthorized API key. "
                    "Verify GEMINI_API_KEY in backend/.env or Render dashboard environment settings."
                )
            elif status_code in (500, 503) or "UNAVAILABLE" in err_msg:
                raise RuntimeError(
                    f"Gemini API service temporarily unavailable ({status_code}). Please try again shortly."
                )
            else:
                raise RuntimeError(f"Gemini API request failed ({status_code}): {api_err.message if hasattr(api_err, 'message') else err_msg}")

        except TimeoutError as timeout_err:
            logger.error(f"Gemini request timed out: {timeout_err}")
            raise RuntimeError("Gemini API request timed out. Please try again.")

        except Exception as exc:
            # Preserve existing error detail if already a recognized RuntimeError or ValueError
            if isinstance(exc, (RuntimeError, ValueError)):
                raise exc
            logger.error(f"Unexpected error communicating with Gemini API: {exc}", exc_info=True)
            raise RuntimeError(f"Gemini generation error: {str(exc)}")


class OpenAIProvider(BaseLLMProvider):
    """
    Live LLM provider using OpenAI API.
    """

    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name
        self.endpoint = "https://api.openai.com/v1/chat/completions"

    async def generate_calendar(
        self, brief: CampaignCreate
    ) -> Tuple[List[GeneratedPostSchema], str, bool]:
        if not self.api_key:
            raise ValueError(
                "OpenAI API key is missing. Set OPENAI_API_KEY in backend/.env "
                "or switch to LLM_PROVIDER=demo."
            )

        prompt = f"""
Brand Name: {brief.brand_name}
Industry: {brief.industry}
Target Audience: {brief.target_audience}
Brand Voice: {brief.brand_voice}
Products/Services: {brief.products_services}
Campaign Objective: {brief.campaign_objective}
Target Platforms: {', '.join(brief.platforms)}
Preferences: {brief.content_preferences or 'Refined, quiet luxury, architectural.'}
Number of Days: {brief.number_of_days}

Return JSON with key 'posts' containing a list of {brief.number_of_days} post objects.
Each post must have: day_number, scheduled_date, platform, content_type, topic, caption, hashtags, cta, visual_prompt, notes.
"""
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                self.endpoint,
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
            )
            if resp.status_code != 200:
                logger.error(f"OpenAI API error ({resp.status_code}): {resp.text}")
                raise RuntimeError(f"OpenAI API request failed: {resp.status_code}")

            data = resp.json()
            raw_text = data["choices"][0]["message"]["content"]
            parsed = json.loads(raw_text)
            calendar = GeneratedCalendarSchema.model_validate(parsed)
            return calendar.posts, f"openai ({self.model_name})", False


def get_llm_provider() -> BaseLLMProvider:
    """
    Factory to select the configured provider.
    - If LLM_PROVIDER is 'gemini', returns GeminiProvider with the configured GEMINI_API_KEY.
      (Raises a clear error on generation if key is missing or invalid, adhering to requirement 8).
    - If LLM_PROVIDER is 'openai', returns OpenAIProvider with OPENAI_API_KEY.
    - If LLM_PROVIDER is 'demo' (default), returns DemoProvider.
    """
    from app.config import get_settings
    current_settings = get_settings()
    provider_name = current_settings.active_llm_provider

    if provider_name == "gemini":
        return GeminiProvider(
            api_key=current_settings.GEMINI_API_KEY,
            model_name=current_settings.GEMINI_MODEL
        )

    elif provider_name == "openai":
        return OpenAIProvider(
            api_key=current_settings.OPENAI_API_KEY or "",
            model_name=current_settings.OPENAI_MODEL
        )

    # Default is labelled DEMO MODE
    return DemoProvider()
