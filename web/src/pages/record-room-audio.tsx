import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

const isRecordingSupported = !!navigator.mediaDevices 
    && typeof navigator.mediaDevices.getUserMedia === "function" 
    && typeof window.MediaRecorder === "function"

type RoomParams = {
    roomId: string
}

export function RecordRoomAudio() {
    const params = useParams<RoomParams>()
    const [isRecording, setIsRecording] = useState(false)
    const recorder = useRef<MediaRecorder | null>(null)
    const intervalRef = useRef<NodeJS.Timeout>(null)


    function stopRecording() {
        setIsRecording(false)

        if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop()

        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
    }

    async function uploadAudio(audio: Blob) {
        const formData = new FormData()

        formData.append("file", audio, "audio.webm")

        const response = await fetch(`http://localhost:3333/rooms/${params.roomId}/audio`, {
            method: "POST",
            body: formData
        })

        const result = await response.json()

        console.log(result)
    }

    function createRecorder(audio: MediaStream) {
        recorder.current = new MediaRecorder(audio, {
            mimeType: "audio/webm",
            audioBitsPerSecond: 64_000
        })

        recorder.current.ondataavailable = event => {
            if (event.data.size > 0) uploadAudio(event.data)
        }

        recorder.current.onstart = () => {
            console.log("Recording started")
        }

        recorder.current.onstop = () => {
            console.log("Recording stopped/ended")
        }

        recorder.current.start()
    }

    async function startRecording() {
        if (!isRecordingSupported) {
            alert("Your browser does not support recording")
            return
        } 

        setIsRecording(true)

        const audio = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44_100
            }
        })

        createRecorder(audio)

        intervalRef.current = setInterval(() => {
            recorder.current?.stop()

            createRecorder(audio)
        }, 5000)
    }

    if (!params.roomId) return <Navigate replace to="/" />

    return (
        <div className="h-screen flex items-center justify-center flex-col gap-3">
            {isRecording ? 
                <Button onClick={stopRecording}>Stop recording</Button>
                :
                <Button onClick={startRecording}>Record audio</Button>
            }
            {isRecording ? <p>Recording...</p> : <p>Stopped</p> }
        </div>
    )
}