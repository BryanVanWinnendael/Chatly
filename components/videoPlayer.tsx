import React, { useEffect, useRef } from "react"
import { ICameraVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng"

type Props = {
  videoTrack: IRemoteVideoTrack | ICameraVideoTrack
  style: object
}

const VideoPlayer: React.FC<Props> = ({ videoTrack, style }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const playerRef = ref.current
    if (!videoTrack) return
    if (!playerRef) return

    videoTrack.play(playerRef)
    const child: HTMLDivElement = playerRef.firstChild as HTMLDivElement
    child.style.borderRadius = "10px"

    return () => {
      videoTrack.stop()
    }
  }, [videoTrack])

  return <div ref={ref} style={style}></div>
}

export default VideoPlayer
