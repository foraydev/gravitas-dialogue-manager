import { Component } from '@angular/core';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {

  constructor(
    public state: DialogueFileService
  ) {}
}
