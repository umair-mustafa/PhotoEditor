import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Data } from 'src/app/models/data';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit , AfterViewInit {

  @ViewChild('visualization') visualization: ElementRef;
  @ViewChild('img') img: ElementRef;

  private context: CanvasRenderingContext2D;
  private element: HTMLImageElement;

  private currentText = "This is a Dummy Text !!!"

  selectedImage : string;
  imgWidth: number
  imgHeight: number

  private data: any;
  private selectedOptions: any;


  private source : string;
  private overLayText: any;

  constructor() {}

  ngOnInit() {
    this.imgWidth = 760;
    this.imgHeight = 1400;
    this.selectedImage = 'assets/images/image-1.jpg';
    this.data = new Data();
    this.overLayText = '';
    this.selectedOptions =  { effect: '', fonts: '' , font_style: '', font_size: 32 , font_family: '' , font_color: '#fff'};
    
    this.source = '';
  }

  get images(): Array<any> {
    return ['assets/images/image-1.jpg', 'assets/images/image-2.jpg' , 'assets/images/image-3.jpg' , 'assets/images/image-4.jpg' , 'assets/images/image-5.jpg']
  }

  ngAfterViewInit(){   
    this.context = this.visualization.nativeElement.getContext("2d");
    this.element = this.img.nativeElement;
  }

  afterLoading() {
    this.context.clearRect(0, 0, this.imgWidth, this.imgHeight);
    if(this.overLayText)
      this.drawText(this.overLayText);
    else
      this.context.drawImage(this.element, 0, 0, this.imgWidth, this.imgHeight);

  }

  drawText(text){
    this.context.drawImage(this.element, 0, 0, this.imgWidth, this.imgHeight);
    this.overLayText = text;
    this.context.font = 'italic 30px Arial';
    this.context.textAlign = "center";
    this.context.fillStyle = this.selectedOptions.font_color || '#000'; // fill text
    this.context.lineWidth = 2.2;
    this.context.strokeStyle = "rgba(0, 0, 0, 1)"; // stroke border
    this.wrapText(text);

    this.source = this.visualization.nativeElement.toDataURL();
}


wrapText(text) {
  const textX = this.imgWidth/2;
  const textY = this.imgWidth - (this.imgHeight/4)
  const textWrapWidth  = this.imgWidth - (this.imgHeight / 9.00);
  const textWrapHeight = 120;
    var words = text.split(' ');
    var line = '';
    var currentTextY = textY;
    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = this.context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > textWrapWidth && n > 0) {
            this.context.fillText(line, textX, currentTextY); // fill text
            this.context.strokeText(line, textX, currentTextY); // stroke border
            line = words[n] + ' ';
            currentTextY += textWrapHeight;
        }
        else {
            line = testLine;
        }
    }
    this.context.fillText(line, textX, currentTextY); // fill text
    this.context.strokeText(line, textX, currentTextY); // stroke border
  }

  onAttributeChange(event , attribute){
    switch(attribute){
      case 'effect':
        this.selectedOptions.effect = event.target.value;
      break;
      case 'font_family':
      this.selectedOptions.font_family = event.target.value;
      break;
      case 'font_style':
      this.selectedOptions.font_style = event.target.value;
      break;
      case 'font_size':
      this.selectedOptions.font_size = event.target.value;
      break;
      default:
      break;
    }
  }

}