export class MediaSyncController {
  private mainVideo: HTMLVideoElement;
  private signVideo: HTMLVideoElement | null = null;
  private driftThreshold = 0.25; // 250ms tolerance
  private isSyncing = false;

  constructor(mainVideo: HTMLVideoElement) {
    this.mainVideo = mainVideo;
    this.setupMainListeners();
  }

  setSignVideo(signVideo: HTMLVideoElement | null) {
    this.signVideo = signVideo;
    if (this.signVideo) {
      this.signVideo.muted = true;
      this.signVideo.playbackRate = this.mainVideo.playbackRate;
      this.signVideo.currentTime = this.mainVideo.currentTime;
      this.setupSignListeners();
    }
  }

  private setupMainListeners() {
    this.mainVideo.addEventListener("play", () => {
      if (this.signVideo && this.signVideo.paused) {
        this.signVideo.play().catch(() => {});
      }
    });

    this.mainVideo.addEventListener("pause", () => {
      if (this.signVideo && !this.signVideo.paused) {
        this.signVideo.pause();
      }
    });

    this.mainVideo.addEventListener("seeking", () => {
      if (this.signVideo) {
        this.signVideo.currentTime = this.mainVideo.currentTime;
      }
    });

    this.mainVideo.addEventListener("ratechange", () => {
      if (this.signVideo) {
        this.signVideo.playbackRate = this.mainVideo.playbackRate;
      }
    });

    this.mainVideo.addEventListener("timeupdate", () => {
      this.checkDrift();
    });
  }

  private setupSignListeners() {
    if (!this.signVideo) return;
    this.signVideo.addEventListener("waiting", () => {
      // Sign video is buffering
    });
  }

  private checkDrift() {
    if (!this.signVideo || this.isSyncing) return;
    const diff = Math.abs(this.mainVideo.currentTime - this.signVideo.currentTime);
    if (diff > this.driftThreshold) {
      this.isSyncing = true;
      this.signVideo.currentTime = this.mainVideo.currentTime;
      setTimeout(() => {
        this.isSyncing = false;
      }, 50);
    }
  }

  /**
   * Switches media source (e.g. standard video <-> audio described video)
   * while preserving timestamp, playback rate, and play/pause state.
   */
  async switchSource(newSrc: string): Promise<void> {
    const wasPlaying = !this.mainVideo.paused;
    const currentTime = this.mainVideo.currentTime;
    const playbackRate = this.mainVideo.playbackRate;

    this.mainVideo.src = newSrc;
    this.mainVideo.load();

    return new Promise((resolve) => {
      const onLoaded = async () => {
        this.mainVideo.removeEventListener("loadedmetadata", onLoaded);
        this.mainVideo.currentTime = currentTime;
        this.mainVideo.playbackRate = playbackRate;
        if (wasPlaying) {
          try {
            await this.mainVideo.play();
          } catch {}
        }
        resolve();
      };
      this.mainVideo.addEventListener("loadedmetadata", onLoaded);
    });
  }
}
