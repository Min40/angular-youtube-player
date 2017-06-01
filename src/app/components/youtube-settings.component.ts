import { Component, OnInit } from '@angular/core';
import { FormControl, FormArray, FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'yt-settings',
  templateUrl: 'youtube-settings.component.html'
})

export class SettingsComponent {

    menuOpened: boolean = false;

    settingsForm: FormGroup;
    // This is temporary, soon will be from JSON
    playerAttr = {
        settings: [
            { name: 'Toggle debugging info',  selected: true },
            { name: 'Toggle search thumbnails',  selected: false },
        ]
    }

    constructor(private fb: FormBuilder) {     
        this.settingsForm = this.fb.group({
            settings: this.mapSettings()
        });
    }

    ngOnInit() {
        this.settingsForm.valueChanges.subscribe((data) => {
            this.showSettings(data);
        });
    }

    get getSettings(): FormArray {
        return this.settingsForm.get('settings') as FormArray;
    };

    mapSettings() {
        const arr = this.playerAttr.settings.map(s => {
            return this.fb.control(s.selected);
        })
        return this.fb.array(arr);
    }

    toggleMenu() {
        this.menuOpened = !this.menuOpened;
    }

    showSettings(data: any) {
        console.log(data);
    }

}