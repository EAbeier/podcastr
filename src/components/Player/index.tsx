import {useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import {usePlayer } from '../../context/PlayerContext';
import styles from './styles.module.scss';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { convertDurationTimeToString } from '../../utils/convertDurationToTimeString';

export default function Player(){
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);

    const {
        episodesList, 
        currentEpisodeIndex, 
        isPlaying, 
        isLooping, 
        isShuffling, 
        hasNext,
        hasPrevious,
        togglePlay, 
        toggleLoop, 
        toggleShuffle,
        setPlayingState,
        playNext,
        playPrevious,
        clearPlayerState
    } =  usePlayer();

    function setupProgressListener() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime));
        })
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded() {
        if(hasNext) {
            playNext();
        }
        else {
            clearPlayerState();
        }
    }

    useEffect(() => {
        if(!audioRef.current)
        {
            return
        }
        
        if(isPlaying)
        {
            audioRef.current.play();
        }
        else
        {
            audioRef.current.pause();
        }
    }, [isPlaying])

    const episode = episodesList[currentEpisodeIndex];

    return(
        <div className={styles.PlayerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando Agora"/>
                <strong>Tocando Agora</strong>
            </header>

            {episode ? (
                <div className={styles.currentEpisode}>
                    <Image 
                        width={592} 
                        height={592} 
                        src={episode.thumbnail} 
                        objectFit='cover'
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationTimeToString(progress)}</span>
                    <div className={styles.slider}>
                        { episode ? (
                            <Slider
                                max = {episode.duration}
                                value = {progress}
                                onChange = {handleSeek}
                                trackStyle ={{backgroundColor: '#04d361'}}
                                railStyle = {{backgroundColor: '#9f75ff'}}
                                handleStyle = {{borderColor: '#04d361'}}
                            />
                        ) : (
                            <div className={styles.emptySlider}/>
                        )}
                    </div>
                    <span>{convertDurationTimeToString(episode?.duration ?? 0)}</span>
                </div>

                {episode && (
                    <audio
                        src = {episode.url}
                        ref = {audioRef}
                        autoPlay
                        loop={isLooping}
                        onLoadedMetadata = {setupProgressListener}
                        onEnded= {handleEpisodeEnded}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                   />
                )}

                <div className={styles.buttons}>
                    <button 
                        type="button" 
                        disabled={!episode || episodesList.length === 1}
                        onClick={toggleShuffle} 
                        className={isShuffling ? styles.isActive : ''}
                        >
                        <img src="/shuffle.svg" alt="Embaralhar"/>
                    </button>
                    <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Música anterior"/>
                    </button>
                    <button 
                        type="button" 
                        className={styles.playButton} 
                        disabled={!episode} 
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <img src="/pause.svg" alt="Reproduzir"/>
                        ) : (
                            <img src="/play.svg" alt="Reproduzir"/>
                        )}
                    </button>
                    <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Proxima música"/>
                    </button>
                    <button 
                        type="button" 
                        disabled={!episode}
                        onClick={toggleLoop} 
                        className={isLooping ? styles.isActive : ''}
                        >
                        <img src="/repeat.svg" alt="Repetir"/>
                    </button>
                </div>
            </footer>
        </div>
    );
}