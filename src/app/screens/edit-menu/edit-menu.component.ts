import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogueExchangeComponent } from 'src/app/components/dialogue-exchange/dialogue-exchange.component';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';

@Component({
  selector: 'app-edit-menu',
  templateUrl: './edit-menu.component.html',
  styleUrls: ['./edit-menu.component.css'],
  standalone: true,
  imports: [
    DialogueExchangeComponent,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class EditMenuComponent {

  constructor(
    public state: DialogueFileService
  ) {
  }
}
