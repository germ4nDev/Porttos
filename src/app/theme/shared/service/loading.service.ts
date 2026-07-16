import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMessageSubject = new BehaviorSubject<string>('Procesando...');

  public isLoading$ = this.isLoadingSubject.asObservable();
  public loadingMessage$ = this.loadingMessageSubject.asObservable();

  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  showSuccess(message: string, title: string = '¡Logrado!') {
    console.log(`SUCCESS: ${title} - ${message}`);
    this.createNativeModal(title, message, 'success');
  }

  showError(message: string, title: string = 'Error') {
    console.error(`ERROR: ${title} - ${message}`);
    this.createNativeModal(title, message, 'error');
  }

  showWarning(message: string, title: string = 'Atención') {
    this.createNativeModal(title, message, 'warning');
  }

  show(message: string = 'Espere por favor ...') {
    this.loadingMessageSubject.next(message);
    this.isLoadingSubject.next(true);
    this.toggleNativeLoader(true, message);
  }

  hide() {
    this.isLoadingSubject.next(false);
    this.toggleNativeLoader(false);
  }

  private createNativeModal(title: string, message: string, type: string) {
    const modalId = 'custom-alert-modal';
    const existing = document.getElementById(modalId);
    if (existing) {
      this.renderer.removeChild(document.body, existing);
    }

    const overlay = this.renderer.createElement('div');
    overlay.id = modalId;
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100%');
    this.renderer.setStyle(overlay, 'height', '100%');
    this.renderer.setStyle(overlay, 'background', 'rgba(0,0,0,0.5)');
    this.renderer.setStyle(overlay, 'display', 'flex');
    this.renderer.setStyle(overlay, 'align-items', 'center');
    this.renderer.setStyle(overlay, 'justify-content', 'center');
    this.renderer.setStyle(overlay, 'z-index', '9999');
    this.renderer.setStyle(overlay, 'font-family', 'sans-serif');

    const card = this.renderer.createElement('div');
    this.renderer.setStyle(card, 'background', 'white');
    this.renderer.setStyle(card, 'padding', '20px');
    this.renderer.setStyle(card, 'border-radius', '8px');
    this.renderer.setStyle(card, 'max-width', '400px');
    this.renderer.setStyle(card, 'width', '90%');
    this.renderer.setStyle(card, 'text-align', 'center');
    this.renderer.setStyle(card, 'box-shadow', '0 4px 6px rgba(0,0,0,0.1)');

    const color = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b';

    card.innerHTML = `
      <h2 style="color: ${color}; margin-top: 0;">${title}</h2>
      <p style="color: #374151;">${message}</p>
      <button id="close-modal-btn" style="
        background: ${color}; color: white; border: none; padding: 10px 20px;
        border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 10px;
      ">Continuar</button>
    `;

    this.renderer.appendChild(overlay, card);
    this.renderer.appendChild(document.body, overlay);

    const btn = document.getElementById('close-modal-btn');
    if (btn) {
      btn.onclick = () => {
        this.renderer.removeChild(document.body, overlay);
      };
    }
  }

  private toggleNativeLoader(show: boolean, message: string = '') {
    const loaderId = 'custom-loader-overlay';
    const existing = document.getElementById(loaderId);

    if (!show) {
        if (existing) this.renderer.removeChild(document.body, existing);
        return;
    }

    if (existing) return;

    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const bgColor = isDarkMode ? '#1e1e1e' : '#ffffff';
    const textColor = isDarkMode ? '#e0e0e0' : '#1f2937';
    const borderColor = isDarkMode ? '#bd4444' : '#e5e7eb';
    const spinnerTrack = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const overlayBg = isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.3)';

    const overlay = this.renderer.createElement('div');
    overlay.id = loaderId;
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100%');
    this.renderer.setStyle(overlay, 'height', '100%');
    this.renderer.setStyle(overlay, 'background', overlayBg); // Dinámico
    this.renderer.setStyle(overlay, 'display', 'flex');
    this.renderer.setStyle(overlay, 'align-items', 'center');
    this.renderer.setStyle(overlay, 'justify-content', 'center');
    this.renderer.setStyle(overlay, 'z-index', '10000');
    this.renderer.setStyle(overlay, 'backdrop-filter', 'blur(1.5px)');

    const container = this.renderer.createElement('div');
    this.renderer.setStyle(container, 'display', 'flex');
    this.renderer.setStyle(container, 'flex-direction', 'column');
    this.renderer.setStyle(container, 'align-items', 'center');
    this.renderer.setStyle(container, 'justify-content', 'center');
    this.renderer.setStyle(container, 'padding', '2rem 2.5rem');
    this.renderer.setStyle(container, 'border-radius', '16px');
    
    this.renderer.setStyle(container, 'box-shadow', '0 10px 30px rgba(0, 0, 0, 0.3)');
    this.renderer.setStyle(container, 'gap', '1.5rem');
    this.renderer.setStyle(container, 'background-color', bgColor);

    container.innerHTML = `
    <div style="
      border: 6px solid ${spinnerTrack}; 
      border-top: 6px solid #3498db;
      border-radius: 50%; 
      width: 70px; /* Tamaño un poco más elegante */
      height: 70px;
      animation: spin 1s linear infinite;
    "></div>
    <p style="
        margin: 0; 
        color: ${textColor}; 
        font-family: sans-serif; 
        font-weight: 500;
        font-size: 1.1rem;
    ">${message}</p>
    <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>`;

    this.renderer.appendChild(overlay, container);
    this.renderer.appendChild(document.body, overlay);
}
}