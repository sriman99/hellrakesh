import VoiceReactiveVisual from '@/components/VoiceReactiveVisual';
import { useState } from 'react';

export default function TestModularAnimation() {
  const [testMode, setTestMode] = useState<'user' | 'agent'>('user');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  // Mock ElevenLabs URL for testing (you can replace this with a real one)
  const mockElevenLabsUrl = "https://api.elevenlabs.io/v1/text-to-speech/some-voice-id";

  const handleTestAgent = () => {
    setTestMode('agent');
    setIsAgentSpeaking(true);

    // Stop after 5 seconds for testing
    setTimeout(() => {
      setIsAgentSpeaking(false);
    }, 5000);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Testing Modular Animation - CORS Fix</h1>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => { setTestMode('user'); setIsAgentSpeaking(false); }}
          className={`px-4 py-2 rounded ${testMode === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Test User Mic
        </button>
        <button
          onClick={handleTestAgent}
          className={`px-4 py-2 rounded ${testMode === 'agent' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Test ElevenLabs (5s)
        </button>
      </div>

      <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
        <VoiceReactiveVisual
          className="bg-black"
          isUserMicOn={testMode === 'user'}
          isAgentSpeaking={isAgentSpeaking}
          elevenLabsAudio={testMode === 'agent' ? mockElevenLabsUrl : null}
          onAgentAudioEnd={() => {
            console.log("🎵 Agent audio ended in test");
            setIsAgentSpeaking(false);
          }}
        />
      </div>

      <div className="text-sm text-gray-600">
        <p>✅ CORS Fix Implementation:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Enhanced proxy endpoint with better ElevenLabs compatibility</li>
          <li>Forced proxy usage for all external URLs to bypass CORS</li>
          <li>Comprehensive debug logging for audio pipeline verification</li>
          <li>Improved error handling and fallback mechanisms</li>
          <li>Animation data verification with detailed frequency analysis</li>
        </ul>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 font-semibold">🔍 Debugging Tips:</p>
          <ul className="list-disc list-inside ml-4 text-yellow-700">
            <li>Open browser console to see detailed audio pipeline logs</li>
            <li>Look for "ANIMATION CONFIRMED WORKING!" message</li>
            <li>Check proxy logs: "PROXY: Audio fetched successfully"</li>
            <li>Verify frequency data: "ANIMATION DATA: hasData: true"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}