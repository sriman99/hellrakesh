import VoiceReactiveVisual from '@/components/VoiceReactiveVisual';
import { useState, useEffect, useRef } from 'react';

export default function TestModularAnimation() {
  const [testMode, setTestMode] = useState<'user' | 'agent'>('user');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showFullLog, setShowFullLog] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Mock ElevenLabs URL for testing (you can replace this with a real one)
  const mockElevenLabsUrl = "https://api.elevenlabs.io/v1/text-to-speech/some-voice-id";

  // Capture console logs for debugging
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addToDebugLog = (type: string, ...args: any[]) => {
      const timestamp = new Date().toLocaleTimeString();
      const message = `[${timestamp}] ${type}: ${args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`;

      setDebugLog(prev => {
        const newLog = [...prev, message];
        return newLog.slice(-50); // Keep last 50 messages
      });
    };

    console.log = (...args) => {
      originalLog(...args);
      if (args.some(arg => String(arg).includes('🎯') || String(arg).includes('🔬') || String(arg).includes('🎬') || String(arg).includes('🎭'))) {
        addToDebugLog('LOG', ...args);
      }
    };

    console.error = (...args) => {
      originalError(...args);
      addToDebugLog('ERROR', ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addToDebugLog('WARN', ...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Auto-scroll debug log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [debugLog]);

  const handleTestAgent = () => {
    setDebugLog([]); // Clear log for new test
    setTestMode('agent');
    setIsAgentSpeaking(true);
    console.log("🎯 ====== STARTING ELEVENLABS TEST ======");

    // Stop after 10 seconds for testing
    setTimeout(() => {
      setIsAgentSpeaking(false);
      console.log("🎯 ====== ELEVENLABS TEST COMPLETED ======");
    }, 10000);
  };

  const clearLog = () => {
    setDebugLog([]);
  };

  return (
    <div className="flex gap-4 p-4 h-screen">
      {/* Left side - Animation */}
      <div className="flex-1 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">🔧 ElevenLabs Animation Debug Center</h1>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => {
              setTestMode('user');
              setIsAgentSpeaking(false);
              setDebugLog([]);
              console.log("🎯 ====== SWITCHING TO USER MIC TEST ======");
            }}
            className={`px-4 py-2 rounded ${testMode === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            👤 Test User Mic
          </button>
          <button
            onClick={handleTestAgent}
            className={`px-4 py-2 rounded ${testMode === 'agent' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            🤖 Test ElevenLabs (10s)
          </button>
          <button
            onClick={clearLog}
            className="px-4 py-2 rounded bg-red-500 text-white"
          >
            🗑️ Clear Log
          </button>
        </div>

        <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
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
          <p>✅ <strong>Full Debug Logging Enabled:</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li>🎯 Audio Manager Pipeline Tracking</li>
            <li>🔬 Analyser Frequency Data Monitoring</li>
            <li>🎬 Animation Loop Status</li>
            <li>🎭 Real-time Animation Data</li>
          </ul>
        </div>
      </div>

      {/* Right side - Debug Log */}
      <div className="w-1/2 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">🐛 Real-time Debug Log</h2>
          <button
            onClick={() => setShowFullLog(!showFullLog)}
            className="text-sm px-3 py-1 bg-gray-100 rounded"
          >
            {showFullLog ? 'Compact' : 'Full'}
          </button>
        </div>

        <div
          ref={logRef}
          className="flex-1 bg-black text-green-400 text-xs font-mono p-4 rounded overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {debugLog.length === 0 ? (
            <div className="text-gray-500">
              Click "Test ElevenLabs" to start debugging...
              <br />
              Logs will appear here in real-time.
            </div>
          ) : (
            debugLog.map((log, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  log.includes('ERROR') ? 'text-red-400' :
                  log.includes('WARN') ? 'text-yellow-400' :
                  log.includes('✅') ? 'text-green-400' :
                  log.includes('❌') ? 'text-red-400' :
                  'text-gray-300'
                }`}
              >
                {showFullLog ? log : log.substring(0, 100) + (log.length > 100 ? '...' : '')}
              </div>
            ))
          )}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          📊 Log entries: {debugLog.length}/50 (auto-scrolling)
        </div>
      </div>
    </div>
  );
}