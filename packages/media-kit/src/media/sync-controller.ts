export type SignStatus = "ready" | "loading" | "error" | "none";

export interface MediaSyncOptions {
  driftThreshold?: number; // default 0.25s
  onSignStatusChange?: (status: SignStatus) => void;
}

export class MediaSyncController {
  private mainVideo: HTMLVideoElement;
  private signVideo: HTMLVideoElement | null = null;
  private driftThreshold: number;
  private isSyncing = false;
  private onSignStatusChange?: (status: SignStatus) => void;

  // Stored listener references for clean teardown
  private mainListeners: { [key: string]: EventListener } = {};
  private signListeners: { [key: string]: EventListener } = {};

  constructor(mainVideo: HTMLVideoElement, options?: MediaSyncOptions) {
    this.mainVideo = mainVideo;
    this.driftThreshold = options?.driftThreshold ?? 0.25;
    this.onSignStatusChange = options?.onSignStatusChange;
    this.setupMainListeners();
  }

  setSignVideo(signVideo: HTMLVideoElement | null) {
    this.cleanupSignListeners();
    this.signVideo = signVideo;

    if (this.signVideo) {
      this.signVideo.muted = true;
      this.signVideo.playsInline = true;
      this.signVideo.playbackRate = this.mainVideo.playbackRate;

      // Align initial time safely
      if (!isNaN(this.mainVideo.currentTime) && this.mainVideo.currentTime > 0) {
        try {
          this.signVideo.currentTime = this.mainVideo.currentTime;
        } catch {
          // ignore pre-metadata assignment
        }
      }

      this.setupSignListeners();
      this.notifyStatus(this.signVideo.readyState >= 2 ? "ready" : "loading");
    } else {
      this.notifyStatus("none");
    }
  }

  private notifyStatus(status: SignStatus) {
    if (this.onSignStatusChange) {
      this.onSignStatusChange(status);
    }
  }

  private setupMainListeners() {
    this.mainListeners["play"] = () => {
      if (this.signVideo && this.signVideo.paused && !this.mainVideo.paused) {
        this.signVideo.play().catch(() => {
          // Gracefully ignore play() rejection on secondary stream
        });
      }
    };

    this.mainListeners["pause"] = () => {
      if (this.signVideo && !this.signVideo.paused) {
        this.signVideo.pause();
      }
    };

    this.mainListeners["seeking"] = () => {
      if (this.signVideo && !isNaN(this.mainVideo.currentTime)) {
        this.signVideo.currentTime = this.mainVideo.currentTime;
      }
    };

    this.mainListeners["seeked"] = () => {
      if (this.signVideo && !isNaN(this.mainVideo.currentTime)) {
        this.signVideo.currentTime = this.mainVideo.currentTime;
        if (this.mainVideo.paused && !this.signVideo.paused) {
          this.signVideo.pause();
        }
      }
    };

    this.mainListeners["ratechange"] = () => {
      if (this.signVideo) {
        this.signVideo.playbackRate = this.mainVideo.playbackRate;
      }
    };

    this.mainListeners["timeupdate"] = () => {
      this.checkDrift();
    };

    this.mainListeners["ended"] = () => {
      if (this.signVideo && !this.signVideo.paused) {
        this.signVideo.pause();
      }
    };

    for (const [event, listener] of Object.entries(this.mainListeners)) {
      this.mainVideo.addEventListener(event, listener);
    }
  }

  private setupSignListeners() {
    if (!this.signVideo) return;

    this.signListeners["waiting"] = () => {
      this.notifyStatus("loading");
    };

    this.signListeners["canplay"] = () => {
      this.notifyStatus("ready");
      // If main video is currently playing, resume sign video
      if (!this.mainVideo.paused && this.signVideo && this.signVideo.paused) {
        this.signVideo.play().catch(() => {});
      }
    };

    this.signListeners["playing"] = () => {
      this.notifyStatus("ready");
      // Double check that main video is not paused
      if (this.mainVideo.paused && this.signVideo && !this.signVideo.paused) {
        this.signVideo.pause();
      }
    };

    this.signListeners["error"] = () => {
      console.warn("Secondary EthSL sign language video stream encountered an error.");
      this.notifyStatus("error");
    };

    for (const [event, listener] of Object.entries(this.signListeners)) {
      this.signVideo.addEventListener(event, listener);
    }
  }

  public checkDrift() {
    if (!this.signVideo || this.isSyncing) return;
    if (this.signVideo.readyState < 2) return; // not ready to seek

    const diff = Math.abs(this.mainVideo.currentTime - this.signVideo.currentTime);
    if (diff > this.driftThreshold) {
      this.isSyncing = true;
      try {
        this.signVideo.currentTime = this.mainVideo.currentTime;
      } catch {
        // ignore
      }
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
    const currentTime = isNaN(this.mainVideo.currentTime) ? 0 : this.mainVideo.currentTime;
    const playbackRate = this.mainVideo.playbackRate || 1;

    this.mainVideo.src = newSrc;
    this.mainVideo.load();

    return new Promise((resolve) => {
      let settled = false;
      const completeSwitch = async () => {
        if (settled) return;
        settled = true;
        this.mainVideo.removeEventListener("loadedmetadata", completeSwitch);
        this.mainVideo.removeEventListener("canplay", completeSwitch);
        this.mainVideo.removeEventListener("error", completeSwitch);
        clearTimeout(safetyTimer);

        try {
          if (!isNaN(currentTime) && currentTime > 0) {
            this.mainVideo.currentTime = currentTime;
          }
          this.mainVideo.playbackRate = playbackRate;
          if (wasPlaying) {
            await this.mainVideo.play().catch(() => {});
          }
          if (this.signVideo) {
            if (!isNaN(currentTime) && currentTime > 0) {
              try { this.signVideo.currentTime = currentTime; } catch {}
            }
            if (wasPlaying) {
              this.signVideo.play().catch(() => {});
            } else {
              this.signVideo.pause();
            }
          }
        } catch {
          // Ignore seek/play errors during source switch
        }
        resolve();
      };

      const safetyTimer = setTimeout(completeSwitch, 600);
      this.mainVideo.addEventListener("loadedmetadata", completeSwitch);
      this.mainVideo.addEventListener("canplay", completeSwitch);
      this.mainVideo.addEventListener("error", completeSwitch);
    });
  }

  private cleanupSignListeners() {
    if (this.signVideo) {
      for (const [event, listener] of Object.entries(this.signListeners)) {
        this.signVideo.removeEventListener(event, listener);
      }
    }
    this.signListeners = {};
  }

  destroy() {
    for (const [event, listener] of Object.entries(this.mainListeners)) {
      this.mainVideo.removeEventListener(event, listener);
    }
    this.mainListeners = {};
    this.cleanupSignListeners();
    this.signVideo = null;
  }
}
