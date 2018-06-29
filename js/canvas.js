var get = function(id) {
    return document.getElementById(id)
};

var canvas = this.__canvas = new fabric.Canvas('c', {
    isDrawingMode: true,
    width: $(window).width(),
    height: $(window).width() * 0.7,
});

canvas.freeDrawingBrush.width = 5;
canvas.freeDrawingBrush.color = 'rgb(58,51,121)';
fabric.Object.prototype.transparentCorners = false;

var canvas_context = "draw";

var erased = false;

var updateCanvasState = function() {
    if ((_config.undoFinishedStatus == 1 && _config.redoFinishedStatus == 1)) {
        var jsonData = canvas.toJSON();
        var canvasAsJson = JSON.stringify(jsonData);
        _config.canvasState.push(canvasAsJson);
    }
}

var save = function() {
    for (var i = 1; i <= 25; i++) {
        document.getElementById('txt').innerHTML = 'save';
        var dataUrl = getStorage(i);
        if (dataUrl == null || dataUrl == '') {

            json = canvas.toJSON(['lockMovementX', 'LockMovementY', 'LockRotation', 'LockScalingX', 'LockScalingY', 'LockUniScaling']);
            document.getElementById('txt').innerHTML = json;
            putStorage(i, json);
            item(json, i);
            return;
        }
    }
}

var scenes = {
    current: 0,
    state:0,
    states: [],
}

var track = {
    object:-1,
    GAN1:-1,
}

var init_scenes = function(scenes_) {
    for (i in scenes_) {
        scenes.states.push(image[scenes_[i]]);
    }
}

init_scenes(['jungle','riverbank','inside_water','jungle2'])

var _config = {
    canvasState: [],
    canvasBin: [],
    currentStateIndex: -1,
    undoFinishedStatus: 1,
    redoFinishedStatus: 1,
    undoButton: document.getElementsByClassName('button circle undo'),
    redoButton: document.getElementsByClassName('button circle redo'),
};

var undo = function() {
    if (_config.undoFinishedStatus) {
        if (_config.canvasState.length >= 1) {
            _config.undoFinishedStatus = 0;
            if (_config.canvasState.length != 1) {
                canvas.loadFromJSON(_config.canvasState[_config.canvasState.length - 2], function() {
                    //var jsonData = JSON.parse(_config.canvasState[_config.canvasState.length-2]);
                    canvas.renderAll();
                });
            } else if (_config.canvasState.length == 1) {
                canvas.clear();
            }
            json_undo = _config.canvasState.pop();
            _config.canvasBin.push(json_undo);
            _config.undoFinishedStatus = 1;
        }
    }
}

var redo = function() {
    if (_config.redoFinishedStatus) {
        if (_config.canvasBin.length >= 1) {
            _config.redoFinishedStatus = 0;
            var json_redo = _config.canvasBin.pop()
            canvas.loadFromJSON(json_redo, function() {
                var jsonData = JSON.parse(json_redo);
                canvas.renderAll();
            });
            _config.canvasState.push(json_redo)
            _config.redoFinishedStatus = 1;
        }

    }
}

$("#downloadImage_a").on("click", function() {
    downloadImage();
});

var downloadImage = function() {
    $("#downloadImage_a")[0].href = document.getElementById('c').toDataURL();
}

var toImgurl = function(arrayObjects) {
    for (i in arrayObjects) {
        arrayObjects[i].set('strokeWidth',1);
    }
    group = new fabric.Group(arrayObjects);
    imgurl = group.toDataURL({
        format: 'png',
        width: 256,
        height: 256
    });
    left_ = group['left']
    console.log(left_)
    top_ = group['top']
    return [left_, top_, imgurl]
}

var classify = function(arrayObjects) {
    classes = {};
    data = toImgurl(arrayObjects)
    classes[data[0] + '_' + data[1]] = data[2];
    return classes
}

var toGAN1 = function() {
    var objects = canvas.getObjects();
    track.object = objects.length;
    track.GAN1 = 1;
    var layers = {}
    for (idx in objects) {
        if (objects[idx]["stroke"] in layers) {
            layers[objects[idx]["stroke"]].push(objects[idx])
        } else {
            layers[objects[idx]["stroke"]] = [objects[idx]] 
        }
    }

    for (layer in layers) {
        console.log(layers[layer])
        layers[layer] = classify(layers[layer])
    }
    canvas.clear();
    return layers
}

var toGAN2 = function() {
    track.object = 0;
    result2 = scenes.states[scenes.current]
    toCanvas2(result2);
}

var toCanvas1 = function (result) {
    console.log('toCanvas1')

    fabric.util.loadImage(scenes.states[scenes.current], function (img) {
        width = window.innerWidth;
        height=width*0.7;
        var legimg = new fabric.Image(img, {
            left: 0,
            top: 0,
            scaleX: width / img.width,
            scaleY: height / img.height
        });
        canvas.add(legimg);
        canvas.renderAll();
    });
    
    for (layer in result) {
        for (id in result[layer]) {
            data = id.split('_');
            left_ = parseInt(data[0]);
            top_ = parseInt(data[1]);
            imgURL = result[layer][id];
            putPng(imgURL, top_, left_);
        }
    }
}

var toCanvas2 = function(result) {
    console.log('tocanvas2')
    console.log(result);
    /*
    fabric.Image.fromURL(result, function(img) {
        width = window.innerWidth;
        height = width*0.7;
        var img_ = img.set({
            left: 0,
            top: 0
        });
        img_.scaleToHeight(height);
        img_.scaleToWidth(width);
        console.log(height);
        canvas.add(img_);
    });
    */
    fabric.util.loadImage(result, function (img) {
        width = window.innerWidth;
        height=width*0.7;
        var legimg = new fabric.Image(img, {
            left: 0,
            top: 0,
            scaleX: width / img.width,
            scaleY: height / img.height
        });
        canvas.add(legimg);
        canvas.renderAll();
    });

}

var putPng = function(imgURL, top_, left_) {
    fabric.Image.fromURL(imgURL, function(img) {
        var img_ = img.set({
            left: left_,
            top: top_
        });
        canvas.add(img_);
    });
}

var toggleClassProp = function(classes, prop) {
    document.querySelectorAll(classes).forEach(function(element) {
        classList = element.getAttribute('class').split(' ');
        if (classList.includes(prop)) {
            classList.splice(classList.indexOf(prop), 1)
        } else {
            classList.push(prop)
        }
        element.className = classList.join(' ')
    })
}

var getElementPosition = function() {
    return $('#c').offset();
}

var getEventLocation = function(event) {
    var pos = getElementPosition();

    return {
        x: (event.pageX - pos.left),
        y: (event.pageY - pos.top)
    }
}

canvas.on(
    'object:modified',
    function(e) {
        console.log('object modified');
        updateCanvasState();
    }
);

canvas.on(
    'object:selected',
    function(e) {
        var objects = e.target;
        console.log(objects);
        objects.lockScalingX = true;
        objects.lockScalingY = true;
    }
);

canvas.on(
    'object:added',
    function(e) {
        console.log('object added');
        if (track.object ==-1) {
            updateCanvasState();
        } else if (canvas.getObjects().length == track.object+1) {
            result_ = canvas.toDataURL();
            console.log(result_)
            scenes.states[scenes.current] = result_;
            track.object = -1;
            canvas.clear();
            $('.canvas-container').css("background-image","url("+scenes.states[scenes.current]+")");
            $('.canvas-container').css("background-size","100% 100%");
            if (track.GAN1 == 1) {
                toGAN2(result_);
                track.GAN1 = -1;
                _config.canvasBin = [];
                _config.canvasState = [];
                _config.currentStateIndex = -1;
            }
        }       
    }
);

$('.undo').on('click', function() {
    //console.log('undo');
    undo();
})

$('.redo').on('click', function() {
    //console.log(redo);
    redo();
})

$('#title').dblclick(function() {
    $('#title-prompt').show();
});

$('#oklah').click(function() {
    $('#title').html($('#input-title').val());
    $('#title-prompt').hide();
});

$('.eraser').on("click", function() {
    canvas_context = "erase";
    canvas.freeDrawingBrush.color = 'rgba(255,0,0,0.1)';
});

var held_down = false;

canvas.on("mouse:down", function() {
    held_down = true
});
canvas.on("mouse:up", function(e) {
    if (canvas_context == "erase") {
        canvas.remove(e.target);
        _config.canvasState.pop();
        updateCanvasState();
        if (erased == false) {
            _config.canvasState.pop()
            erased = true;
        }
        console.log("finish erase")
    };
    held_down = false;
});

canvas.on('mouse:move', function(e) {
    if (canvas_context == "erase" && held_down == true) {
        console.log("excecute erase");
        var eventLocation = getEventLocation(event);
        var carnor = document.getElementById('c');
        var context = canvas.getContext('2d');
        var pixelData = context.getImageData(eventLocation.x, eventLocation.y, 1, 1).data;
        console.log(pixelData)
        n = pixelData[0] + pixelData[1] + pixelData[2] + pixelData[3];
        console.log(pixelData);
        if (n != 0) {
            canvas.remove(e.target);
            erased = true;
        }
    };
});

/*

var toGAN = 

{
"color1": {
    "id1":imgurl_11,
    "id2":imgurl_12
},
"color2": {
    "id1":imgurl_21,
    "id2":imgurl_22
}
}

var classify_objects = function(layers) {
for (layer in layers) {
    if 
}
}

*/
$('.palette').on('click', function() {
    toggleClassProp('.button', 'active');
});

$('.color1').on('click', function() {
    canvas.freeDrawingBrush.color = $('.color1').css('background-color');
    canvas_context = 'draw';
});

$('.color2').on('click', function() {
    canvas.freeDrawingBrush.color = $('.color2').css('background-color');
    canvas_context = 'draw';
});

$('.color3').on('click', function() {
    canvas.freeDrawingBrush.color = $('.color3').css('background-color');
    canvas_context = 'draw';
});

$('.color4').on('click', function() {
    canvas.freeDrawingBrush.color = $('.color4').css('background-color');
    canvas_context = 'draw';
});

$('.paint, .touch').on('click', function() {
    toggleClassProp('.paint', 'button');
    toggleClassProp('.touch', 'button');
});

$('.paint').on('click', function() {
    canvas.isDrawingMode = false;
    canvas_context = 'edit';
})

$('.touch').on('click', function() {
    canvas.isDrawingMode = true;
    canvas_context = 'draw';
    canvas.freeDrawingBrush.color = 'rgb(58,51,121)';
})

$('.ok').on('click', function() {
    scenes.state += 1;
    result = toGAN1();
    /* back end code goes here */
    toCanvas1(result);
})

window.onbeforeunload = function(e) {
    var dialogText = 'Warning!! You will lost your current work if you reload.';
    e.returnValue = dialogText;
    return dialogText;
  };

  
  $(window).on('resize',function() {
      var canref = document.getElementById('c');
      width_ = window.innerWidth;
      height_ = width_*0.7;
      canvas.setWidth(width_);
      canvas.setHeight(height_);
  });

  $('.canvas-container').css("background-image","url("+scenes.states[scenes.current]+")");
  $('.canvas-container').css("background-size","100% 100%");

  $('.back').on("click", function() {
      scenes.current -= 1;
      if (scenes.current == 0) {
          pos_class('.back','hide');
          neg_class('.next','hide');
      } else {
            neg_class('.back','hide');
            neg_class('.next','hide');
      }
      canvas.clear();
    $('.canvas-container').css("background-image","url("+scenes.states[scenes.current]+")");
    $('.canvas-container').css("background-size","100% 100%");
  })

  $('.next').on("click", function() {
    scenes.current += 1;
    if (scenes.current == scenes.states.length-1) {
        pos_class('.next','finish');
        neg_class('.back','hide');
    } else {
          neg_class('.next','hide');
          neg_class('.back','hide');
    }
    if (scenes.current == scenes.states.length) {
        a = window.location.href.split('/');
        a.pop();
   a.push('finish.html');
   b = a.join('/');
        window.location.href = b;
    }
    canvas.clear();
  $('.canvas-container').css("background-image","url("+scenes.states[scenes.current]+")");
  $('.canvas-container').css("background-size","100% 100%");
})



  /*

  $(window).bind("resize", function(){ 
    console.log('reise ')
    var width_ = $(window).width();
    var height_ = width_*0.7;
    canvas.width = width_;
    canvas.height = height_;
 });

  fabric.Image.fromURL('http://fabricjs.com/assets/pug_small.jpg', function(myImg) {
 //i create an extra var for to change some image properties
 var img1 = myImg.set({ left: 0, top: 0 ,width:150,height:150});
 canvas.add(img1); 
});

var scenes = ['']
*/