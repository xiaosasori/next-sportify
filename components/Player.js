import { ReplyIcon, SwitchHorizontalIcon, VolumeOffIcon, VolumeUpIcon } from "@heroicons/react/outline"
import { PauseIcon, PlayIcon, RewindIcon, FastForwardIcon } from "@heroicons/react/solid"
import { debounce } from "lodash-es"
import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import { useRecoilState } from "recoil"
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom"
import useSongInfo from "../hooks/useSongInfo"
import useSpotify from "../hooks/useSpotify"

function Player() {
  const spotifyApi = useSpotify()
  const {data: session} = useSession()
  const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState)
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState)
  const [volume, setVolume] = useState(50)
  const songInfo = useSongInfo()

const fetchCurrentSong = () => {
  if (!songInfo) {
    spotifyApi.getMyCurrentPlayingTrack().then(data => {
      console.log('now playing', data.body?.item)
      setCurrentTrackId(data.body?.item?.id)
      spotifyApi.getMyCurrentPlaybackState().then(data => {
        setIsPlaying(data.body?.is_playing)
      })
    })
  }
}

function handlePlayPause() {
  spotifyApi.getMyCurrentPlaybackState().then(data => {
    if (data.body.is_playing) {
      spotifyApi.pause()
      setIsPlaying(false)
    } else {
      spotifyApi.play()
      setIsPlaying(true)
    }
  })
}

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      // fetch the song info
      fetchCurrentSong()
      setVolume(50)
    }
  }, [currentTrackIdState, spotifyApi, session])

  useEffect(() => {
    if (volume > 0 && volume < 100) {
      debounceAdjustVolume(volume)
    }
  }, [volume])

  const debounceAdjustVolume = useCallback(debounce((volume) => {
    spotifyApi.setVolume(volume).catch(err => {console.log(err)})
  }, 500), [])

  return (
    <div className="grid h-24 grid-cols-3 px-2 text-xs text-white bg-gradient-to-b from-black to-gray-500 md:text-base md:px-8">
      {/* left */}
      <div className="flex items-center space-x-4">
        <img className="hidden w-10 h-10 md:inline" src={songInfo?.album.images?.[0]?.url} alt="" />
        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artist?.[0]?.name}</p>
        </div>
      </div>
      {/* center */}
      <div className="flex items-center justify-evenly">
        <SwitchHorizontalIcon className="button" />
        <RewindIcon className="button" />
        {isPlaying ? (
          <PauseIcon onClick={handlePlayPause} className="w-10 h-10 button" />
        ) : (
          <PlayIcon onClick={handlePlayPause} className="w-10 h-10 button" />
        )}
        <FastForwardIcon className="button" />
        <ReplyIcon className="button" />
      </div>
      {/* right */}
      <div className="flex items-center justify-end pr-5 space-x-3 md:space-x-4">
        <VolumeOffIcon onClick={() => volume > 0 && setVolume(volume - 10)} className="button" />
        <input className="w-14 md:w-28" type="range" value={volume} min={0} max={100} onChange={e => setVolume(Number(e.target.value))} ></input>
        <VolumeUpIcon onClick={() => volume < 100 && setVolume(volume + 10)} className="button" />
      </div>
    </div>
  )
}

export default Player