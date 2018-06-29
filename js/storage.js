console.log('storage.js: running background')

Storage.prototype.setObj = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObj = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};

var putStorage = function(title, value) {
    window.localStorage.setObj("cs_"+title, value);
};

var getStorage = function(title) {
    return window.localStorage.getObj("cs_"+title);
};

var titles = function() {
    console.log('retrieving all_titles')
    var all_titles = window.localStorage.getObj("cs_titles");
    if (all_titles == null || all_titles == '') {
        all_titles = [];
        
    };
    return all_titles
};

var add_title = function(title) {
    console.log('adding title to all_titles')
    var all_titles = titles();
    all_titles.unshift(title);
    putStorage("titles", all_titles);
};

var remove_title = function(title) {
    console.log('clearing title from all_titles')
    var all_titles = titles();
    var index = all_titles.indexOf(title);
    if (index !== -1) {all_titles.splice(index, 1)}
    putStorage("titles", all_titles)
}

var removeStorage = function(title) {
    console.log('removing object from storage');
    window.localStorage.removeItem("cs_"+title);
};

var update_title = function(title) {
    console.log('title update')
    remove_title(title);
    add_title(title);
}

var callBackStorage = function(e) {
    initHistory();
};

var initHistory = function() {
    console.log('initializing history');
    all_titles = titles()
    for (index in all_titles) {
        var value = getStorage(all_titles[index]);
        item(all_titles[index], value["imgurl"]);
        
    }
};

// 在绘画记录中添加图片
function item(title, imgurl) {
    console.log('generating item')
    var itemHtml = '<div class="item"><img class="img" src = ' + imgurl + ' id="history_' + title + '"/><p>'+title+'</p><a class="delete" href="javascript:void(0);" id="history_del_' + title + '">Delete</a><a href="' + imgurl + '" id="history_download_' + title + '" download="picture.png">Download</a></div>';
    //var itemHtml='<div class="item">imgurl<div>'
    $("#recent-files").after(itemHtml).fadeIn(400);
};

function test(txt) {
	document.getElementById('txt').innerHTML = txt;
};

initHistory();

$('.item a').on("click", function() {
    console.log('detected request: delete #item');
    var id = $(this).attr("id");
    console.log(id)
    if (id.indexOf("del") != '-1') {
        var title = id.substring(12);
        console.log('1'+title)
        removeStorage(title);
        remove_title(title);
        $(this).parent().fadeOut(200, function() {
            $(this).remove();
        });
        //initHistory();
    }
});

//保存图片，base64格式
var save = function(title) {
    console.log('saving title')
    
	//var canor = document.getElementById('c');
    //for (var i = 1; i <= 25; i++) {
		//var data = getStorage(i);
        //var dataUrl = data[1];
        //if (data == null || data == '') {
            //putStorage(i,canor.toDataURL());
            //json = canvas.toJSON(['lockMovementX', 'LockMovementY', 'LockRotation', 'LockScalingX', 'LockScalingY', 'LockUniScaling']);
            json = canvas.toJSON()
            imgurl = canvas.toDataURL();
            title = $('#title').html();
            if (titles().includes(title)) {
                update_title(title);
                $('#history_'+title).attr("src",imgurl);
            } else {
                add_title(title);
                item(title, imgurl);
            }
            var value = {"imgurl":imgurl, "json":json};
            putStorage(title, value);
            //item(canor.toDataURL(),i);
            // initHistorty();
            return;
        };
    
$("#save").on("click", function() {
	console.log('save')
    //document.getElementById('txt').innerHTML = 'save';
    save(title);
});

$(function() {
    if (window.addEventListener) {
        window.addEventListener("storage", callBackStorage, false);
    } else {
        window.attachEvent("onstorage", callBackStorage);
    };

});



$(".item img").on("click",function() {
    console.log('insert image to canvas')
	var new_json = {"background":""};
    var title = $(this).attr("id").substring(8);
    var json = [];
	var canvas_json = canvas.toJSON()["objects"];
	var other_json = getStorage(title)["json"]["objects"];
    var objects = json.concat(canvas_json, other_json);
    new_json["objects"] = objects;

	//console.log(canvas.toJSON())
	//var JSON2 = [getStorage(n)[2]];
	//console.log(JSON2)
	//var json = JSON.stringify(JSON1.concat(JSON2)[0]);
    //console.log(json)
    console.log(new_json);
    _config.canvasState.pop();
    _config.currentStateIndex = _config.currentStateIndex-1;
	canvas.loadFromJSON(new_json,
		canvas.renderAll.bind(canvas), function(o,object) {
		fabric.log(o,object);
	});
});





