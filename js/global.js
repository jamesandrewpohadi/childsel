var toggleClassProp = function(class_, prop) {
    document.querySelectorAll(class_).forEach(function(element) {
        classList = element.getAttribute('class').split(' ');
        if (classList.includes(prop)) {
            classList.splice(classList.indexOf(prop), 1)
        } else {
            classList.push(prop)
        }
        element.className = classList.join(' ')
    })
}

var pos_class = function (class_,prop) {
    document.querySelectorAll(class_).forEach(function(element) {
        classList = element.getAttribute('class').split(' ');
        if (!classList.includes(prop)) {
            classList.push(prop);
        }
        element.className = classList.join(' ')
    })
}

var neg_class = function (class_,prop) {
    document.querySelectorAll(class_).forEach(function(element) {
        classList = element.getAttribute('class').split(' ');
        if (classList.includes(prop)) {
            classList.splice(classList.indexOf(prop), 1)
        }
        element.className = classList.join(' ')
    })
}