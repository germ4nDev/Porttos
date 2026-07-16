import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-chat-msg',
  standalone: true,
  imports: [CommonModule, FormsModule, NgScrollbarModule],
  templateUrl: './chat-msg.component.html',
  styleUrls: ['./chat-msg.component.scss']
})
export class ChatMsgComponent {
  @Input() friendId!: number;
  @Output() ChatToggle = new EventEmitter();
  @ViewChild('newChat', { read: ElementRef, static: false }) newChat!: ElementRef;

  chatMessage: any; // Placeholder para integrarse con la fuente real
  message!: string;
  message_error = false;
  friendWriting = false;
  newReplay = '';

  constructor(private rend: Renderer2) {
        console.log('abriendo navbar-chat-msg');

  }

  ngOnInit() {
    // Simula datos para pruebas, puede integrarse con servicio real
    if (this.chatMessage) {
      // this.chatMessage = findObjectByKeyValue(friendsList, 'id', this.friendId);
      // this.chatMessage.chat = findObjectByKeyValue(userChat, 'friend_id', this.friendId)?.messages;
    }
  }

  sentMsg(flag: number) {
    if (!this.message || this.message.trim() === '') {
      this.message_error = true;
      return;
    }

    this.message_error = false;

    if (flag === 1) return;

    const temp_replay = this.message;
    const html_send = `
      <div class="media chat-messages">
        <div class="media-body chat-menu-reply">
          <div><p class="chat-cont">${this.message}</p></div>
          <p class="chat-time">now</p>
        </div>
      </div>
    `;

    this.newReplay += html_send;
    this.message = '';
    this.friendWriting = true;

    setTimeout(() => {
      this.friendWriting = false;
      const html_replay = `
        <div class="media chat-messages">
          <a class="media-left photo-table" href="javascript:">
            <img class="media-object img-radius img-radius m-t-5" src="${this.chatMessage?.photo}" alt="${this.chatMessage?.name}" />
          </a>
          <div class="media-body chat-menu-content">
            <div><p class="chat-cont">hello superior personality you write</p><p class="chat-cont">${temp_replay}</p></div>
            <p class="chat-time">now</p>
          </div>
        </div>
      `;
      this.newReplay += html_replay;
    }, 3000);
  }
}
