import { Component } from '@angular/core';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';

@Component({
  selector: 'app-edit-menu',
  templateUrl: './edit-menu.component.html',
  styleUrls: ['./edit-menu.component.css']
})
export class EditMenuComponent {

  constructor(
    public state: DialogueFileService
  ) {
  }
}
