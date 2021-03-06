import { Component, OnInit } from '@angular/core';
import { FormControl, FormArray, FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppComponent } from '../app.component';
import { CategoryComponent } from './category/category.component';
import { SharedService } from '../services/shared.service';
import { GlobalsService } from '../services/globals.service';
import { NumberVal } from '../services/validators.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-settings',
    templateUrl: 'youtube-settings.component.html',
    providers: [ CategoryComponent, NumberVal ]
})

export class SettingsComponent implements OnInit {

    loading = false;

    internalSettings: FormGroup;
    externalSettings: FormGroup;

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private shared: SharedService,
        private globals: GlobalsService,
        private app: AppComponent,
        private category: CategoryComponent,
    ) {
    }

    ngOnInit() {
        console.log('settings');
        this.getDefaultSettings();
    }

    setForm() {
        this.internalSettings = this.fb.group({
            settings: this.mapSettings()
        });
        this.checkInputs();
    }

    initExternalForm() {
        this.externalSettings = new FormGroup({
            fcApi: new FormControl(this.globals.external_settings[0].value),
            fcRegion: new FormControl(this.globals.external_settings[1].value, Validators.required),
            fcSearchresults: new FormControl(this.globals.external_settings[2].value,
                            [Validators.required,
                            NumberVal.max(50),
                            NumberVal.min(1),
                            NumberVal.isNumber(true)]),
            fcRelatedResults: new FormControl(this.globals.external_settings[3].value,
                            [Validators.required,
                            NumberVal.max(50),
                            NumberVal.min(1),
                            NumberVal.isNumber(true)])
        });
    }

    get initInternalForm(): FormArray {
        return this.internalSettings.get('settings') as FormArray;
    }

    checkInputs() {
        this.internalSettings.valueChanges.subscribe((data) => {
            Object.keys(data.settings).map(i => {
                this.globals.internal_settings[i].value = data.settings[i];
            });
            this.globals.settings.form_settings = this.globals.internal_settings;

            this.shared.updateLocalStorageSettings();
            this.shared.getSettings();

            this.app.checkVolumeRange();
            this.shared.triggerNotify('Changed');
        });
    }

    mapSettings() {
        const arr = this.globals.internal_settings.map(s => {
            return this.fb.control(s.value);
        });
        return this.fb.array(arr);
    }

    getDefaultSettings() {
        this.shared.getSettings().then(() => {
            this.globals.internal_settings = this.globals.settings.form_settings;
            this.globals.external_settings = this.globals.settings.api_settings;
            this.initExternalForm();
            this.loading = true;
            this.setForm();
        });
    }

    externalSave() {
        if (this.externalSettings.valid) {
            this.shared.triggerNotify('Saved');
            this.globals.external_settings[0].value = this.externalSettings.controls.fcApi.value;
            this.globals.external_settings[1].value = this.externalSettings.controls.fcRegion.value;
            this.globals.external_settings[2].value = parseInt(this.externalSettings.controls.fcSearchresults.value, 10);
            this.globals.external_settings[3].value = parseInt(this.externalSettings.controls.fcRelatedResults.value, 10);
            this.globals.settings.api_settings = this.globals.external_settings;
            this.globals.feedVideos = null;

            this.shared.updateLocalStorageSettings();
            this.shared.getSettings();

            this.category.getFeedVideos();

        } else {
            this.shared.triggerNotify('Please check external settings');
        }
    }
}
