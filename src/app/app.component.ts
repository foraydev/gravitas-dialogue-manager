import { Component } from '@angular/core';
import { DialogueFileService } from './shared/dialogue-file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gravitas-dialogue-manager-angular';

  constructor(
    public state: DialogueFileService
  ) {}
}
