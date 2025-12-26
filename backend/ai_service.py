import os
import logging
from typing import Optional
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

logger = logging.getLogger(__name__)


class AIService:
    """Modular AI service using Google's Gemini API"""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize the AI service with Gemini API key"""
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")

        genai.configure(api_key=self.api_key)

        # Configure the model
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 2048,
            },
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        )

    async def generate_insights(self, prompt: str, session_id: str) -> str:
        """Generate personalized insights for user's browsing activity"""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=1024,
                ),
            )

            if response.text:
                return response.text.strip()
            else:
                logger.warning(f"No text generated for insights, session: {session_id}")
                return (
                    "I couldn't generate insights at this time. Please try again later."
                )

        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            return "I'm having trouble generating insights right now. Please check back later."

    async def generate_profile(self, prompt: str, session_id: str) -> str:
        """Generate personalized user profile based on description"""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,  # Lower temperature for more consistent JSON output
                    max_output_tokens=2048,
                ),
            )

            if response.text:
                return response.text.strip()
            else:
                logger.warning(f"No text generated for profile, session: {session_id}")
                return "{}"

        except Exception as e:
            logger.error(f"Error generating profile: {str(e)}")
            return "{}"

    async def chat_completion(self, messages: list, session_id: str) -> str:
        """Generic chat completion method for future extensibility"""
        try:
            # Convert messages to Gemini format
            gemini_messages = []
            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")

                if role == "system":
                    # Gemini doesn't have system role, prepend to first user message
                    continue
                elif role == "user":
                    gemini_messages.append({"role": "user", "parts": [content]})
                elif role == "assistant":
                    gemini_messages.append({"role": "model", "parts": [content]})

            # Start chat session
            chat = self.model.start_chat(
                history=gemini_messages[:-1] if len(gemini_messages) > 1 else []
            )

            # Send the last message
            last_message = gemini_messages[-1]["parts"][0] if gemini_messages else ""
            response = chat.send_message(last_message)

            if response.text:
                return response.text.strip()
            else:
                logger.warning(
                    f"No text generated for chat completion, session: {session_id}"
                )
                return "I couldn't generate a response at this time."

        except Exception as e:
            logger.error(f"Error in chat completion: {str(e)}")
            return "I'm having trouble responding right now. Please try again later."


# Global instance for backward compatibility
_ai_service_instance = None


def get_ai_service() -> AIService:
    """Get or create the global AI service instance"""
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    return _ai_service_instance
