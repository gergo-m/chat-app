import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ErrorMessage } from '../../shared/util/constant';

@Component({
  selector: 'app-join-chatroom-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    MatIconModule,
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './join-chatroom-dialog.html',
  styleUrl: './join-chatroom-dialog.scss'
})
export class JoinChatroomDialog {
  joinRoomForm: FormGroup;
  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<JoinChatroomDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { roomName: string, roomVisibility: string, roomPassword: string }
  ) {
    this.joinRoomForm = new FormGroup({
      password: new FormControl('', [Validators.minLength(2)])
    });
  }

  submit() {
    const password = this.joinRoomForm.get('password')?.value || '';
    console.log(password, this.data.roomPassword);
    if (this.joinRoomForm.valid && password === this.data.roomPassword) {
      this.dialogRef.close(this.joinRoomForm.value);
      this.joinRoomForm.reset({
        password: ''
      });
    } else {
      this.errorMessage = ErrorMessage.INCORRECT_PASSWORD;
    }
  }

  close() {
    this.dialogRef.close();
  }
}
