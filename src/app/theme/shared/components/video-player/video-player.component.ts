import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import videojs from 'video.js'

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnDestroy {
  private _src: string = ''
  player: any

  @Input()
  set src (value: string) {
    this._src = value
    console.log('URL recibida:', this._src)
    this.intentarInicializar()
  }

  get src (): string {
    return this._src
  }

  private videoElement!: ElementRef
  @ViewChild('target', { static: false })
  set target (content: ElementRef) {
    if (content) {
      this.videoElement = content
      console.log('El elemento de video ya existe en el DOM')
      this.intentarInicializar()
    }
  }

  getFileType (url: string): 'video/mp4' | 'video/mov' | 'video/avi' | 'video/mkv' | 'desconocido' {
    if (!url) return 'desconocido'

    const cleanUrl = url.split(/[#?]/)[0]
    const extension = cleanUrl.split('.').pop()?.toLowerCase() || ''
    console.log('formato video', extension);

    if (extension == 'mp4') return 'video/mp4'
    else if (extension == 'mov') return 'video/mov'
    else if (extension == 'avi') return 'video/avi'
    return 'video/mp4'
  }

  intentarInicializar () {
    if (!this._src || this._src === 'undefined' || !this.videoElement) {
      return
    }
    if (this.player) {
      this.player.dispose()
      this.player = null
    }

    const formato = this.getFileType(this._src)
    console.log('formato video', formato);

    const options = {
      fluid: true,
      aspectRatio: '16:9',
      controls: true,
      autoplay: false,
      inactivityTimeout: 0,
      sources: [{ src: this._src, type: formato }]
    }
    this.player = videojs(this.videoElement.nativeElement, options, () => {
      console.log('REPRODUCTOR INICIALIZADO CON ÉXITO')
    })
  }

  ngOnDestroy () {
    if (this.player) {
      this.player.dispose()
    }
  }
}
