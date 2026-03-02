import React, { useState, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  placeholder?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscription, placeholder = "Press and hold to speak in Hindi" }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current);
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      const response = await fetch('/speech/transcribe', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.transcript) {
        onTranscription(result.transcript);
      } else {
        console.error('Transcription failed:', result);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer) => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 16000, true);
    view.setUint32(28, 32000, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    const samples = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  };

  const handleMouseDown = () => {
    if (!isRecording && !isProcessing) {
      startRecording();
    }
  };

  const handleMouseUp = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={isProcessing}
        className={`p-3 rounded-full transition-all duration-200 ${
          isRecording 
            ? 'bg-red-500 text-white animate-pulse' 
            : isProcessing
            ? 'bg-yellow-500 text-white'
            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
        } ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        title={isRecording ? "Recording... Release to stop" : isProcessing ? "Processing..." : "Hold to speak in Hindi"}
      >
        {isProcessing ? (
          <Volume2 className="w-5 h-5 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      <span className="text-sm text-gray-500">
        {isRecording ? "Recording..." : isProcessing ? "Processing..." : placeholder}
      </span>
    </div>
  );
};

export default VoiceInput;