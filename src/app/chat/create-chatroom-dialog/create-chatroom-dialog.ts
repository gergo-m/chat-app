import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-chatroom-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButton,
    MatIconModule,
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './create-chatroom-dialog.html',
  styleUrl: './create-chatroom-dialog.scss'
})
export class CreateChatroomDialog {
  addRoomForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateChatroomDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { users: any[], currentUserId: string }
  ) {
    this.addRoomForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.minLength(1)]),
        type: new FormControl('group', [Validators.required]),
        participants: new FormControl(data.currentUserId ? [data.currentUserId] : [], [Validators.required])
      });
  }

  submit() {
    if (this.addRoomForm.valid) {
      this.dialogRef.close(this.addRoomForm.value);
      this.addRoomForm.reset({
        name: '',
        type: 'group',
        participants: [this.data.currentUserId]
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
