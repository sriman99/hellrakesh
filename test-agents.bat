@echo off
echo Installing Python dependencies...
pip install -r scripts/requirements.txt

echo.
echo Running ElevenLabs Agents Test...
python scripts/test-elevenlabs-agents.py

echo.
pause
