import { useState, useRef, useCallback } from "react";
import { Conversation } from "@elevenlabs/client";

export function useElevenLabsAgent(audioAnalysis?: { setupAudioAnalysis: (audio: HTMLAudioElement) => AnalyserNode | null, startAnalysis: () => void, stopAnalysis: () => void }) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [elevenLabsAudioUrl, setElevenLabsAudioUrl] = useState<string | null>(null);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  const agentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Refactored startAgentSession
  const startAgentSession = useCallback(async (interviewId: string) => {
    try {
      console.log("🚀 Starting ElevenLabs agent session...");

      const response = await fetch(`/api/interviews/${interviewId}/signed-url`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Failed to fetch signed URL:", errorText);
        throw new Error(`Failed to fetch signed URL: ${response.status} - ${errorText}`);
      }

      const { signedUrl } = await response.json();
      console.log("✅ Signed URL received:", signedUrl?.substring(0, 50) + "...");

      // Start a new conversation session using ElevenLabs SDK
      const newConversation = await Conversation.startSession({ signedUrl });
      setConversation(newConversation);
      console.log("✅ Agent session started successfully");
    } catch (error) {
      console.error("❌ Error starting agent session:", error);
    }
  }, []);

  // Refactored sendAudio logic
  const sendAudioToAgent = useCallback(async (audioBlob: Blob) => {
    if (!conversation) {
      console.error("❌ Conversation not started");
      return;
    }

    try {
      console.log("📤 Sending audio to agent...");
      const response = await conversation.sendAudio(audioBlob);
      console.log("📥 Agent response:", response);

      if (response.audioUrl) {
        handleAgentResponse(response.audioUrl);
      }
    } catch (error) {
      console.error("❌ Error communicating with agent:", error);
    }
  }, [conversation]);

  const handleAgentResponse = useCallback(async (responseAudioUrl: string) => {
    try {
      console.log("🔊 Received agent response audio:", responseAudioUrl.substring(0, 50) + "...");

      // Set the audio URL for VoiceReactiveVisual component (it will handle playback and animation)
      setElevenLabsAudioUrl(responseAudioUrl);
      setIsAgentSpeaking(true);

      console.log("✅ Agent audio URL set for VoiceReactiveVisual");
    } catch (error) {
      console.error("Error handling agent response:", error);
      setIsAgentSpeaking(false);
    }
  }, []);

  const endAgentSession = useCallback(async (interviewId: string) => {
    if (conversation) {
      try {
        console.log("Ending agent session...");

        // End the conversation session
        await conversation.endSession();
        console.log("✅ Agent session ended", conversation);

        // Optionally save the conversation ID
        const conversationId = conversation.connection.conversationId;
        if (conversationId) {
          const response = await fetch(`/api/interviews/${interviewId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId }),
          });
          console.log("Conversation ID saved response:", response.status);
          if (response.ok) {
            const result = await response.json();
            console.log("Conversation save result:", result);
          }
        } else {
          console.warn("No conversationId found to save");
        }
      } catch (error) {
        console.error("Error ending agent session:", error);
      } finally {
        setConversation(null);
      }
    }
  }, [conversation]);

  const handleAgentAudioEnd = useCallback(() => {
    console.log("🔊 Agent audio ended, resetting state");
    setIsAgentSpeaking(false);
    setElevenLabsAudioUrl(null);
  }, []);

  return {
    conversation,
    elevenLabsAudioUrl,
    isAgentSpeaking,
    startAgentSession,
    sendAudioToAgent,
    endAgentSession,
    handleAgentResponse,
    handleAgentAudioEnd,
  };
}