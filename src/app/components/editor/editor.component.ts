import { Component, OnInit, ViewChild, ElementRef, ViewChildren , QueryList} from '@angular/core';
import { Data } from 'src/app/models/data';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { fabric } from 'fabric';

declare var $: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.sass']
})
export class EditorComponent implements OnInit  {

  @ViewChild('canvasArea') canvasArea: ElementRef;
  @ViewChildren('filters') filters : QueryList<any>;

  canvas: any
  data: any;
  selectedOptions: any;
  selectedImage: string;
  toggle : boolean;

  overLayText: any;

  canvas_Width: number;
  canvas_Height: number;

  private closeResult: string;

  modalOpenedFor: string;
  canvasSizes: any = {small : { width: 500, height : 500 },
                              wide  : { width: 450, height : 900 },
                              tall  : { width: 900, height : 450 },
                              large : { width: 900, height : 900 },
                              };

  color: string = "#000";                            
  


  constructor(private modalService: NgbModal) { }

  ngOnInit() {
    this.selectedImage = 'assets/images/image-1.jpg';
    this.data = new Data();
    this.toggle = false;
    this.overLayText = '';
    this.selectedOptions =  { filter: 'none', fontStyle: 'normal', fontSize: 32 , fontFamily: 'Helvetica' , fontWeight: 'normal' , textAlign: 'center' , fill: '#000', stroke : '', strokeWidth : 0, canvasSize : 'small' , shadow: ''};
    this.canvas_Width = this.canvasSizes.small.width;
    this.canvas_Height= this.canvasSizes.small.height;
    this.modalOpenedFor = '';
    
   //this.drawWithFabricJS(this.selectedImage);    
    this.setUpCanvas(this.selectedImage);
  }  


  setUpCanvas(image) {  
    $('#canvas_area').find('.canvas-container').css({margin: ''});
    this.canvas = new fabric.Canvas('canvas');    
    this.canvas.setHeight(this.canvasWidth);
    this.canvas.setWidth(this.canvas_Height);
    
    fabric.Image.fromURL(image, img => {

      //img.scaleToWidth(this.canvas.getWidth());
      //img.scaleToHeight(this.canvas.getHeight());
     
      img.set({
        scaleX :this.canvas.getWidth() / img.width,   //new update
        scaleY: this.canvas.getHeight() / img.height,   //new update,
        originX: "center", 
        originY: "center",
        selectable: false,
        centeredScaling: true
      });

      this.canvas.centerObject(img);
      img.setCoords();
      
      if ( Math.max(img.width, img.height) > 2048) {
        let fscale = 2048 / Math.max(img.width, img.height);
        img.filters.push(new fabric.Image.filters.Resize({scaleX: fscale, scaleY: fscale}));
        img.applyFilters();
      }

      this.canvas.on('mouse:wheel', (opt) => {
        var delta = opt.e.deltaY;
        var zoom = this.canvas.getZoom();
        zoom = zoom + delta/200;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        this.canvas.setZoom(zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
    
      this.canvas.add(img);

      let text = this.setText();

      this.canvas.on('text:changed', (e) => {
        var obj = this.canvas.getActiveObject();
        
        // Text now empty, show placeholder:
        if(obj.getText() === '')
          {
          obj.setText('Enter text');
          obj.set('opacity', 0.3);
          obj.set('showplaceholder', true); // Set flag on IText object
          obj.setCoords();
          this.canvas.renderAll();
          }
        
        // Placeholder currently active:
        else if(obj.get('showplaceholder') === true)
          {
          // The text in the IText should now be the placeholder plus the character that  was pressed, so text and placeholder should be different, so remove the placeholder (unless the pressed key was backspace in which case do nothing):
          if(e.target.text !== 'Enter text')
            {
            // New char should be at position 0, so remove placeholder from rest of text:
            obj.setText(obj.getText().substr(0,1));
            obj._updateTextarea();
            obj.set('opacity', 1);
            obj.set('showplaceholder', false); // Remove flag on IText object
            obj.setCoords();
            this.canvas.renderAll();	
            }
          }
        });
        
        // Editing mode is entered on the IText
        this.canvas.on('text:editing:entered', (e) => {
        var obj = this.canvas.getActiveObject();
        
        // If the placeholder is active, move the cursor to position 0 so we
        // can trim the string correctly when typing starts:
        if(obj.get('showplaceholder') == true)
          {
          // Move cursor to beginning of line:
          obj.setSelectionStart(0);
          obj.setSelectionEnd(0);
          this.canvas.renderAll();
          }
        });

    // text.on("editing:entered",  (e)  => {
    //   var obj = this.canvas.getActiveObject();
    //   if(obj.text === 'Enter your text here')
    //   {
    //       obj.selectAll();
    //       obj.text = "";
    //       obj.selectable = true;
    //       obj.fill = this.selectedOptions.fill;
    //       obj.hiddenTextarea.value = "";
    //       obj.dirty = true;
    //       obj.setCoords();
    //       this.canvas.renderAll();
    //   }

    //   else{
    //     this.overLayText = obj.text;
    //   }
    // });

    // text.on("editing:exited",  (e)  => {
    //   var obj = this.canvas.getActiveObject();
    //   if(obj.text == '')
    //   {
    //       obj.selectAll();
    //       obj.text = "Enter your text here";
    //       obj.selectable = true;
    //       obj.fill = "#C0C0C0";
    //       obj.dirty = false;
    //       //obj.setCoords();
          
    //       this.canvas.centerObjectH(obj);
    //       this.canvas.setActiveObject(obj);
    //       this.canvas.renderAll();
    //   }
    // });

    this.canvas.add(text);
    this.canvas.centerObject(text);
    this.canvas.setActiveObject(text);
    this.canvas.bringToFront(text);
      
    this.canvas.renderAll();
    
    });
  }

  setText(){
    let text = new fabric.IText(this.overLayText ? this.overLayText : 'Enter text', {
      fontSize: this.selectedOptions.fontSize,
      fontFamily: this.selectedOptions.fontFamily,
      fill: "#C0C0C0",
      textAlign: this.selectedOptions.textAlign,
      stroke: this.selectedOptions.stroke,
      strokeWidth: this.selectedOptions.strokeWidth,
      shadow : this.selectedOptions.shadow
    });
    return text;
  }

  drawWithFabricJS(selectedImage){
    this.canvas = new fabric.Canvas('canvas');
    this.canvas.setDimensions({width:this.canvasWidth, height:this.canvas_Height});
    this.canvas.clear();
    
    fabric.Image.fromURL(selectedImage, (img) => {

      img.scaleToWidth(this.canvas.getWidth());
      img.scaleToHeight(this.canvas.getHeight());
      
      if ( Math.max(img.width, img.height) > 2048) {
        console.log('Greater than 2048.');
        let fscale = 2048 / Math.max(img.width, img.height);
        img.filters.push(new fabric.Image.filters.Resize({scaleX: fscale, scaleY: fscale}));
        img.applyFilters();
      }

      this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas), {
        scaleX: this.canvas.getWidth() / img.width,
        scaleY: this.canvas.getHeight() / img.height
      });


      let text = new fabric.IText(this.overLayText ? this.overLayText : 'Enter your text here', {
        fontSize: this.selectedOptions.fontSize,
        fontFamily: this.selectedOptions.fontFamily,
        fill: "#C0C0C0",
        textAlign: this.selectedOptions.textAlign,
        stroke: this.selectedOptions.stroke,
        strokeWidth: this.selectedOptions.strokeWidth,
      });
      this.canvas.add(text);
      this.canvas.centerObject(text);
      this.canvas.setActiveObject(text);
      this.canvas.bringToFront(text);

      text.on("editing:entered",  (e)  => {
        var obj = this.canvas.getActiveObject();
        if(obj.text === 'Enter your text here')
        {
            obj.selectAll();
            obj.text = "";
            obj.fill = this.selectedOptions.fill;
            obj.hiddenTextarea.value = "";
            obj.dirty = true;
            obj.setCoords();
            this.canvas.renderAll();
        }

        else{
          this.overLayText = obj.text;
        }
    });

      this.canvas.renderAll();
    });
  }

  changeColor(color){
    this.selectedOptions.color = `${color}`;
    this.canvas.getActiveObject().set("fill", `${color}`);
    this.canvas.renderAll();
  }
  
  onAttributeChange(value , attribute){
    switch(attribute){
      case 'canvasSize':
      this.selectedOptions.canvasSize = value;
      this.setCanvasSize(value);
      break;
      case 'imageChange':
      this.selectedImage = value;
      break;
      case 'effect':
        this.selectedOptions.effect = value;
      break;
      case 'fontFamily':
      this.selectedOptions.fontFamily = value;      
      this.canvas.getActiveObject().set("fontFamily", value);
      break;
      case 'fontStyle':
      this.selectedOptions.fontStyle = value;
      break;
      case 'fontSize':
      this.selectedOptions.fontSize =value;
      this.canvas.getActiveObject().set("fontSize", value);
      break;
      case 'fontWeight':
      this.selectedOptions.fontWeight = value;
      this.canvas.getActiveObject().set("fontWeight", value);
      break;
      case 'color':
      this.selectedOptions.fill = value;
      this.canvas.getActiveObject().set("fill", `${value}`);
      break;
      case 'shadow':
      const shadow = `${value}` + ' 3px 3px 3px';
      this.selectedOptions.shadow = shadow;
      this.canvas.getActiveObject().set("shadow", shadow);
      break;
      case 'stroke':
      this.canvas.getActiveObject().set('stroke', value);
      this.canvas.getActiveObject().set('strokeWidth' , 2);
      this.selectedOptions.stroke = value;
      case 'textAlign':
      this.selectedOptions.textAlign = value.toLowerCase();
      this.canvas.getActiveObject().set('textAlign', `${value.toLowerCase()}`);
      default:
      break;
    }

    if(attribute == 'canvasSize' || attribute == 'imageChange'){
      this.canvas.clear();
      this.setUpCanvas(this.selectedImage);
    }
    else
      this.canvas.renderAll();
    
  }

  setCanvasSize(size){
    this.canvas_Width = this.canvasSizes[size].width;
    this.canvas_Height= this.canvasSizes[size].height;
  }

  open(content, option) {
    this.modalOpenedFor = option;
    if(['stroke', 'shadow'].indexOf(this.modalOpenedFor) > -1 && this.selectedOptions[this.modalOpenedFor] != ''){
      this.selectedOptions[this.modalOpenedFor] = '';
      const obj = this.canvas.getActiveObject();
      obj.set(this.modalOpenedFor, '');
      this.canvas.renderAll();
      return;
    }
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  handlePropertyChange(event){
    if(['fontFamily', 'textAlign'].indexOf(this.modalOpenedFor) > -1 && event.target.checked) 
      this.onAttributeChange(event.target.value , this.modalOpenedFor);
    else if(event.color.hex)
       this.onAttributeChange(event.color.hex , this.modalOpenedFor);    
    
  }

  applyFilter(filter){
    this.selectedOptions.filter = filter;
    const obj = this.canvas.item(0);
    if (obj.filters.length > 1) 
      obj.filters.pop();
    
    switch(filter){
      case 'gray':
      obj.filters.push(new fabric.Image.filters.Grayscale());
      break;
      case 'sepia':
      obj.filters.push(new fabric.Image.filters.Sepia());
      break;
      case 'brownie':
      const _filter = new fabric.Image.filters.ColorMatrix({
        matrix: [0.59970, 0.34553, -0.27082, 0, 0.186, -0.03770, 0.86095, 0.15059, 0, -0.1449, 0.24113, -0.07441, 0.44972, 0, -0.02965, 0, 0, 0, 1, 0]
      });
      obj.filters.push(_filter);
      break;
      case 'invert':
      obj.filters.push(new fabric.Image.filters.Invert());
      break;
      
      default:
      break;
    }

    obj.applyFilters();
    this.canvas.renderAll();
  }

  createImageRatioSize(maxW, maxH, imgW, imgH) {
    var ratio = imgH / imgW;
    if (imgW >= maxW && ratio <= 1){
        imgW = maxW;
        imgH = imgW * ratio;
    } else if(imgH >= maxH){
        imgH = maxH;
        imgW = imgH / ratio;
    } else if (ratio !== 1) {
        if (imgW > imgH) {
            imgW = maxW;
            imgH = imgW * ratio;
        } else {
            imgH = maxH;
            imgW = imgH / ratio;
        }
    }

    return {
        w: imgW,
        h: imgH
    };
}
  
  get images(): Array<any> {
    return ['assets/images/image-1.jpg', 'assets/images/image-2.jpg' , 'assets/images/image-3.jpg' , 'assets/images/image-4.jpg' , 'assets/images/image-5.jpg']
  }

  get canvasWidth(){
    const canvasArea = this.canvasArea.nativeElement.offsetWidth;
    return ( this.canvas_Width > canvasArea ) ?  canvasArea - 20 : this.canvas_Width;
  }

  get options() {
    return this.modalOpenedFor ? this.data[this.modalOpenedFor] : [];
  }

  

}