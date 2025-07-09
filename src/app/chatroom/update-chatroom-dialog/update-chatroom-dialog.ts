import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
  dialogRef = inject(MatDialogRef<UpdateChatroomDialog>);
  data = inject(MAT_DIALOG_DATA) as { users: any[], currentUserId: string, currentName: string, currentParticipants: string[] };

  constructor() {
    this.updateRoomForm = new FormGroup({
        name: new FormControl(this.data.currentName, [Validators.required, Validators.minLength(1)]),
        participants: new FormControl(this.data.currentParticipants ? this.data.currentParticipants : [], [Validators.required])
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
