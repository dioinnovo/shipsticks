'use client'

import React, { useState, useRef } from 'react'
import { Mic, MicOff, Play, Pause, X, Check, FileText, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Custom Microphone SVG Component
const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M16.7673 6.54284C16.7673 3.91128 14.634 1.77799 12.0024 1.77799C9.37089 1.77799 7.2376 3.91129 7.2376 6.54284L7.2376 13.5647C7.2376 16.1963 9.37089 18.3296 12.0024 18.3296C14.634 18.3296 16.7673 16.1963 16.7673 13.5647L16.7673 6.54284ZM12.0024 3.28268C13.803 3.28268 15.2626 4.7423 15.2626 6.54284L15.2626 13.5647C15.2626 15.3652 13.803 16.8249 12.0024 16.8249C10.2019 16.8249 8.74229 15.3652 8.74229 13.5647L8.74229 6.54284C8.74229 4.7423 10.2019 3.28268 12.0024 3.28268Z"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M20.0274 8.79987C19.6119 8.79987 19.2751 9.1367 19.2751 9.55221V13.5647C19.2751 17.5813 16.019 20.8374 12.0024 20.8374C7.98587 20.8374 4.72979 17.5813 4.72979 13.5647L4.72979 9.55221C4.72979 9.1367 4.39295 8.79987 3.97744 8.79987C3.56193 8.79987 3.2251 9.1367 3.2251 9.55221L3.2251 13.5647C3.2251 18.4123 7.15485 22.3421 12.0024 22.3421C16.85 22.3421 20.7798 18.4123 20.7798 13.5647V9.55221C20.7798 9.1367 20.443 8.79987 20.0274 8.79987Z"/>
  </svg>
)

export interface VoiceNote {
  id: string
  duration: number
  timestamp: Date
  audioBlob?: Blob
  audioUrl?: string
  transcript: string
  isTranscribing: boolean
}

export interface VoiceNotesData {
  notes: VoiceNote[]
  additionalInstructions: string
}

interface VoiceNotesStepProps {
  data: VoiceNotesData
  onChange: (data: VoiceNotesData) => void
  onComplete: () => void
}

export function VoiceNotesStep({ data, onChange, onComplete }: VoiceNotesStepProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)

        const newNote: VoiceNote = {
          id: Date.now().toString(),
          duration: recordingDuration,
          timestamp: new Date(),
          audioBlob,
          audioUrl,
          transcript: '',
          isTranscribing: true
        }

        const updatedNotes = [...data.notes, newNote]
        onChange({ ...data, notes: updatedNotes })

        // Mock transcription
        setTimeout(() => {
          transcribeNote(newNote.id, updatedNotes)
        }, 2000)

        setRecordingDuration(0)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)

      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }

      // Stop all tracks
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop())
    }
  }

  const transcribeNote = (noteId: string, notes: VoiceNote[]) => {
    // Mock transcription responses
    const mockTranscripts = [
      "Please handle these clubs with extra care. They're custom-fitted and very valuable. The Titleist T350 irons are brand new and the TSR3 driver needs temperature-controlled storage during transit.",
      "Deliver directly to the pro shop at Pebble Beach. Contact name is Michael Thompson. His number is on file. Make sure to get signature confirmation.",
      "These are tournament clubs for a professional event this weekend. Absolutely critical they arrive by Friday 2 PM. No delays acceptable.",
      "The putter in particular is extremely fragile - it's a vintage Scotty Cameron worth over $2,000. Please package with extra padding.",
      "I'll need text updates throughout the shipping process. This is my first time using Ship Sticks and want to track every step."
    ]

    const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]

    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, transcript: randomTranscript, isTranscribing: false }
        : note
    )

    onChange({ ...data, notes: updatedNotes })
  }

  const removeNote = (noteId: string) => {
    const updatedNotes = data.notes.filter(n => n.id !== noteId)
    onChange({ ...data, notes: updatedNotes })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const canComplete = true // Voice notes are optional

  return (
    <div className="space-y-6">
      {/* Recording Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Mic className="text-purple-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Voice Instructions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Record special handling instructions (optional)
            </p>
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff size={24} />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <MicrophoneIcon className="w-6 h-6" />
                <span>Start Voice Recording</span>
              </>
            )}
          </button>

          {isRecording && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 px-4 py-4 rounded-xl">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono font-semibold text-lg">{formatDuration(recordingDuration)}</span>
            </div>
          )}
        </div>

        {/* Recording Tips */}
        {!isRecording && data.notes.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              Recording Tips
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Mention any special handling requirements for your equipment</li>
              <li>• Specify delivery preferences (signature required, leave with pro shop, etc.)</li>
              <li>• Note any time-sensitive tournament or tee time deadlines</li>
              <li>• Identify especially valuable or fragile items that need extra care</li>
            </ul>
          </div>
        )}

        {/* Voice Notes List */}
        {data.notes.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Recorded Notes ({data.notes.length})
            </h3>
            {data.notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <MicrophoneIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {note.timestamp.toLocaleTimeString()} • {formatDuration(note.duration)}
                      </div>
                      <button
                        onClick={() => removeNote(note.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Transcription */}
                    {note.isTranscribing ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Sparkles size={14} className="animate-spin" />
                        <span>Transcribing with AI...</span>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-2 mb-2">
                          <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            AI Transcript
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                          "{note.transcript}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Additional Written Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FileText className="text-gray-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Additional Instructions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Any other notes or special requests (optional)</p>
          </div>
        </div>

        <textarea
          value={data.additionalInstructions}
          onChange={(e) => onChange({ ...data, additionalInstructions: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-arthur-blue/30 resize-none"
          placeholder="Example: Please coordinate delivery time with pro shop manager John Smith. My tee time is 9 AM sharp on Saturday..."
        />
      </motion.div>

      {/* Summary */}
      {(data.notes.length > 0 || data.additionalInstructions) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4"
        >
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Check size={18} />
            <span className="font-semibold">
              {data.notes.length} voice note(s) recorded
              {data.additionalInstructions && ' + written instructions added'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Complete Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={onComplete}
        className="w-full py-4 px-6 rounded-xl font-semibold bg-arthur-blue text-white hover:bg-arthur-blue-dark cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <Check size={20} />
        <span>Complete Shipment Setup</span>
      </motion.button>

      {/* Skip Option */}
      {data.notes.length === 0 && !data.additionalInstructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Voice notes are optional. You can skip this step and complete your shipment setup.
          </p>
        </motion.div>
      )}
    </div>
  )
}
