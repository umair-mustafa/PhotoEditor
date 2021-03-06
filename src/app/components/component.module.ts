import { NgModule } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { ColorSketchModule } from 'ngx-color/sketch';

import { HomeComponent } from './home/home.component';
import { TestComponent } from './test/test.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { EditorComponent } from './editor/editor.component';

@NgModule({
    declarations: [NavbarComponent, HomeComponent , TestComponent, EditorComponent
    ],
    imports: [
      BrowserModule,
      AngularDraggableModule,
      NgbModule,
      FormsModule,
      ColorPickerModule,
      ColorSketchModule
    ],
    exports: [ NavbarComponent , HomeComponent , TestComponent ], 
    providers: [],
    bootstrap: []
  })

export class ComponentsModule { }