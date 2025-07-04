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
  selector: 'app-update-chatroom-dialog',
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
  templateUrl: './update-chatroom-dialog.html',
  styleUrl: './update-chatroom-dialog.scss'
})
export class UpdateChatroomDialog {
  updateRoomForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UpdateChatroomDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { users: any[], currentUserId: string, currentName: string, currentParticipants: any[] }
  ) {
    this.updateRoomForm = new FormGroup({
        name: new FormControl(data.currentName, [Validators.required, Validators.minLength(1)]),
        participants: new FormControl(data.currentParticipants ? data.currentParticipants : [], [Validators.required])
      });
  }

  submit() {
    if (this.updateRoomForm.valid) {
      this.dialogRef.close(this.updateRoomForm.value);
      this.updateRoomForm.reset({
        name: '',
        type: 'group',
        participants: this.data.currentParticipants
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
