import { Component } from '@angular/core';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';

@Component({
  selector: 'app-mode-menu',
  templateUrl: './mode-menu.component.html',
  styleUrls: ['./mode-menu.component.css']
})
export class ModeMenuComponent {
  constructor(
    public state: DialogueFileService
  ) {}
}
