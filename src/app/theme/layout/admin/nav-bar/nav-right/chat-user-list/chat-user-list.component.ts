import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { FriendComponent } from '../chat-user-list/friend/friend.component';

@Component({
  selector: 'app-chat-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgScrollbarModule, FriendComponent],
  templateUrl: './chat-user-list.component.html',
  styleUrls: ['./chat-user-list.component.scss']
})
export class ChatUserListComponent {
  @Output() ChatCollapse = new EventEmitter<void>();
  @Output() ChatToggle = new EventEmitter<void>();

  friendsList: any[] = [];
  searchFriends = '';

    constructor() {
          console.log('abriendo navbar-chat-user-list');

    }

  ChatOn(): void {
    this.ChatToggle.emit();
  }

  trackByFn(index: number, friend: any): any {
    return friend?.id ?? index;
  }
}
