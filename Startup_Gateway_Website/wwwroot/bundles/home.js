/**
 * demo.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
{
    setTimeout(function () {document.getElementById('hurricane').classList.add('render'), 60});
    const navdemos = Array.from(document.querySelectorAll('nav.demos > .demo'));
    const total = navdemos.length;
    const current = navdemos.findIndex(function (el) {el.classList.contains('demo--current')});
    const navigate = function(linkEl) {
        document.getElementById('hurricane').classList.remove('render');
        document.getElementById('hurricane').addEventListener('transitionend', function () {window.location = linkEl.href});
    };
    navdemos.forEach(function (link) {
        link.addEventListener('click', function(ev) {
            ev.preventDefault();
            navigate(ev.target);
        })
    });
    document.addEventListener('keydown', function(ev) {
        const keyCode = ev.keyCode || ev.which;
        let linkEl;
        if (keyCode === 37) {
            linkEl = current > 0 ? navdemos[current - 1] : navdemos[total - 1];
        }
        else if (keyCode === 39) {
            linkEl = current < total - 1 ? navdemos[current + 1] : navdemos[0];
        }
        else {
            return false;
        }
        navigate(linkEl);
    });
}

var canvas = document.querySelector('#scene');
var width = canvas.offsetWidth,
    height = canvas.offsetHeight;

var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(width, height);
renderer.setClearColor(0xffffff); 

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
camera.position.set(0, 0, 90);

var loader = new THREE.TextureLoader();
loader.crossOrigin = "Anonymous";
var dotTexture = loader.load('/images/dotTexture.png');

var radius = 50;
var sphereGeom = new THREE.IcosahedronGeometry(radius, 5);
var dotsGeom = new THREE.Geometry();
var bufferDotsGeom = new THREE.BufferGeometry();
var positions = new Float32Array(sphereGeom.vertices.length * 3);
for (var i = 0; i < sphereGeom.vertices.length; i++) {
    var vector = sphereGeom.vertices[i];
    animateDot(i, vector);
    dotsGeom.vertices.push(vector);
    vector.toArray(positions, i * 3);
}

function animateDot(index, vector) {
    TweenMax.to(vector, 4, {
        x: 0,
        z: 0,
        ease: Back.easeOut,
        delay: Math.abs(vector.y / radius) * 2,
        repeat: -1,
        yoyo: true,
        yoyoEase: Back.easeOut,
        onUpdate: function () {
            updateDot(index, vector);
        }
    });
}
function updateDot(index, vector) {
    positions[index * 3] = vector.x;
    positions[index * 3 + 2] = vector.z;
}

var attributePositions = new THREE.BufferAttribute(positions, 3);
bufferDotsGeom.addAttribute('position', attributePositions);
var shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        texture: {
            value: dotTexture
        }
    },
    vertexShader: document.getElementById("wrapVertexShader").textContent,
    fragmentShader: document.getElementById("wrapFragmentShader").textContent,
    transparent: true
});
var dots = new THREE.Points(bufferDotsGeom, shaderMaterial);
scene.add(dots);

function render(a) {
    dots.geometry.verticesNeedUpdate = true;
    dots.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}

function onResize() {
    canvas.style.width = '';
    canvas.style.height = '';
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

var mouse = new THREE.Vector2(0.8, 0.5);
function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) - 0.5;
    mouse.y = (e.clientY / window.innerHeight) - 0.5;
    TweenMax.to(dots.rotation, 4, {
        x: (mouse.y * Math.PI * 1.5),
        z: (mouse.x * Math.PI * 0.6),
        ease: Power1.easeOut
    });
}

TweenMax.ticker.addEventListener("tick", render);
window.addEventListener("mousemove", onMouseMove);
var resizeTm;
window.addEventListener("resize", function () {
    resizeTm = clearTimeout(resizeTm);
    resizeTm = setTimeout(onResize, 200);
});
/* @preserve
    _____ __ _     __                _
   / ___// /(_)___/ /___  ____      (_)___
  / (_ // // // _  // -_)/ __/_    / /(_-<
  \___//_//_/ \_,_/ \__//_/  (_)__/ //___/
                              |___/

  Version: 1.7.3
  Author: Nick Piscitelli (pickykneee)
  Website: https://nickpiscitelli.com
  Documentation: http://nickpiscitelli.github.io/Glider.js
  License: MIT License
  Release Date: October 25th, 2018

*/
!function(e){"function"==typeof define&&define.amd?define(e):"object"==typeof exports?module.exports=e():e()}(function(){var a="undefined"!=typeof window?window:this,e=a.Glider=function(e,t){var o=this;if(e._glider)return e._glider;if(o.ele=e,o.ele.classList.add("glider"),(o.ele._glider=o).opt=Object.assign({},{slidesToScroll:1,slidesToShow:1,resizeLock:!0,duration:.5,easing:function(e,t,o,i,r){return i*(t/=r)*t+o}},t),o.animate_id=o.page=o.slide=0,o.arrows={},o._opt=o.opt,o.opt.skipTrack)o.track=o.ele.children[0];else for(o.track=document.createElement("div"),o.ele.appendChild(o.track);1!==o.ele.children.length;)o.track.appendChild(o.ele.children[0]);o.track.classList.add("glider-track"),o.init(),o.resize=o.init.bind(o,!0),o.event(o.ele,"add",{scroll:o.updateControls.bind(o)}),o.event(a,"add",{resize:o.resize})},t=e.prototype;return t.init=function(e,t){var o=this,i=0,r=0;o.slides=o.track.children,[].forEach.call(o.slides,function(e){e.classList.add("glider-slide")}),o.containerWidth=o.ele.clientWidth;var s=o.settingsBreakpoint();if(t=t||s,"auto"===o.opt.slidesToShow||void 0!==o.opt._autoSlide){var l=o.containerWidth/o.opt.itemWidth;o.opt._autoSlide=o.opt.slidesToShow=o.opt.exactWidth?l:Math.floor(l)}"auto"===o.opt.slidesToScroll&&(o.opt.slidesToScroll=Math.floor(o.opt.slidesToShow)),o.itemWidth=o.opt.exactWidth?o.opt.itemWidth:o.containerWidth/o.opt.slidesToShow,[].forEach.call(o.slides,function(e){e.style.height="auto",e.style.width=o.itemWidth+"px",i+=o.itemWidth,r=Math.max(e.offsetHeight,r)}),o.track.style.width=i+"px",o.trackWidth=i,o.isDrag=!1,o.preventClick=!1,o.opt.resizeLock&&o.scrollTo(o.slide*o.itemWidth,0),(s||t)&&(o.bindArrows(),o.buildDots(),o.bindDrag()),o.updateControls(),o.emit(e?"refresh":"loaded")},t.bindDrag=function(){var t=this;t.mouse=t.mouse||t.handleMouse.bind(t);function e(){t.mouseDown=void 0,t.ele.classList.remove("drag"),t.isDrag&&(t.preventClick=!0),t.isDrag=!1}var o={mouseup:e,mouseleave:e,mousedown:function(e){e.preventDefault(),e.stopPropagation(),t.mouseDown=e.clientX,t.ele.classList.add("drag")},mousemove:t.mouse,click:function(e){t.preventClick&&(e.preventDefault(),e.stopPropagation()),t.preventClick=!1}};t.ele.classList.toggle("draggable",!0===t.opt.draggable),t.event(t.ele,"remove",o),t.opt.draggable&&t.event(t.ele,"add",o)},t.buildDots=function(){var e=this;if(e.opt.dots){if("string"==typeof e.opt.dots?e.dots=document.querySelector(e.opt.dots):e.dots=e.opt.dots,e.dots){e.dots.innerHTML="",e.dots.classList.add("glider-dots");for(var t=0;t<Math.ceil(e.slides.length/e.opt.slidesToShow);++t){var o=document.createElement("button");o.dataset.index=t,o.setAttribute("aria-label","Page "+(t+1)),o.className="glider-dot "+(t?"":"active"),e.event(o,"add",{click:e.scrollItem.bind(e,t,!0)}),e.dots.appendChild(o)}}}else e.dots&&(e.dots.innerHTML="")},t.bindArrows=function(){var o=this;o.opt.arrows?["prev","next"].forEach(function(e){var t=o.opt.arrows[e];t&&("string"==typeof t&&(t=document.querySelector(t)),t._func=t._func||o.scrollItem.bind(o,e),o.event(t,"remove",{click:t._func}),o.event(t,"add",{click:t._func}),o.arrows[e]=t)}):Object.keys(o.arrows).forEach(function(e){var t=o.arrows[e];o.event(t,"remove",{click:t._func})})},t.updateControls=function(e){var d=this;e&&!d.opt.scrollPropagate&&e.stopPropagation();var t=d.containerWidth>=d.trackWidth;d.opt.rewind||(d.arrows.prev&&d.arrows.prev.classList.toggle("disabled",d.ele.scrollLeft<=0||t),d.arrows.next&&d.arrows.next.classList.toggle("disabled",Math.ceil(d.ele.scrollLeft+d.containerWidth)>=Math.floor(d.trackWidth)||t)),d.slide=Math.round(d.ele.scrollLeft/d.itemWidth),d.page=Math.round(d.ele.scrollLeft/d.containerWidth);var c=d.slide+Math.floor(Math.floor(d.opt.slidesToShow)/2),h=Math.floor(d.opt.slidesToShow)%2?0:c+1;1===Math.floor(d.opt.slidesToShow)&&(h=0),d.ele.scrollLeft+d.containerWidth>=Math.floor(d.trackWidth)&&(d.page=d.dots?d.dots.children.length-1:0),[].forEach.call(d.slides,function(e,t){var o=e.classList,i=o.contains("visible"),r=d.ele.scrollLeft,s=d.ele.scrollLeft+d.containerWidth,l=d.itemWidth*t,n=l+d.itemWidth;[].forEach.call(o,function(e){/^left|right/.test(e)&&o.remove(e)}),o.toggle("active",d.slide===t),c===t||h&&h===t?o.add("center"):(o.remove("center"),o.add([t<c?"left":"right",Math.abs(t-(t<c?c:h||c))].join("-")));var a=Math.ceil(l)>=r&&Math.floor(n)<=s;o.toggle("visible",a),a!==i&&d.emit("slide-"+(a?"visible":"hidden"),{slide:t})}),d.dots&&[].forEach.call(d.dots.children,function(e,t){e.classList.toggle("active",d.page===t)}),e&&d.opt.scrollLock&&(clearTimeout(d.scrollLock),d.scrollLock=setTimeout(function(){clearTimeout(d.scrollLock),.02<Math.abs(d.ele.scrollLeft/d.itemWidth-d.slide)&&(d.mouseDown||d.scrollItem(d.round(d.ele.scrollLeft/d.itemWidth)))},d.opt.scrollLockDelay||250))},t.scrollItem=function(e,t,o){o&&o.preventDefault();var i=this,r=e;if(++i.animate_id,!0===t)e*=i.containerWidth,e=Math.round(e/i.itemWidth)*i.itemWidth;else{if("string"==typeof e){var s="prev"===e;if(e=i.opt.slidesToScroll%1||i.opt.slidesToShow%1?i.round(i.ele.scrollLeft/i.itemWidth):i.slide,s?e-=i.opt.slidesToScroll:e+=i.opt.slidesToScroll,i.opt.rewind){var l=i.ele.scrollLeft;e=s&&!l?i.slides.length:!s&&l+i.containerWidth>=Math.floor(i.trackWidth)?0:e}}e=Math.max(Math.min(e,i.slides.length),0),i.slide=e,e=i.itemWidth*e}return i.scrollTo(e,i.opt.duration*Math.abs(i.ele.scrollLeft-e),function(){i.updateControls(),i.emit("animated",{value:r,type:"string"==typeof r?"arrow":t?"dot":"slide"})}),!1},t.settingsBreakpoint=function(){var e=this,t=e._opt.responsive;if(t){t.sort(function(e,t){return t.breakpoint-e.breakpoint});for(var o=0;o<t.length;++o){var i=t[o];if(a.innerWidth>=i.breakpoint)return e.breakpoint!==i.breakpoint&&(e.opt=Object.assign({},e._opt,i.settings),e.breakpoint=i.breakpoint,!0)}}var r=0!==e.breakpoint;return e.opt=Object.assign({},e._opt),e.breakpoint=0,r},t.scrollTo=function(t,o,i){var r=this,s=(new Date).getTime(),l=r.animate_id,n=function(){var e=(new Date).getTime()-s;r.ele.scrollLeft=r.ele.scrollLeft+(t-r.ele.scrollLeft)*r.opt.easing(0,e,0,1,o),e<o&&l===r.animate_id?a.requestAnimationFrame(n):(r.ele.scrollLeft=t,i&&i.call(r))};a.requestAnimationFrame(n)},t.removeItem=function(e){var t=this;t.slides.length&&(t.track.removeChild(t.slides[e]),t.refresh(!0),t.emit("remove"))},t.addItem=function(e){this.track.appendChild(e),this.refresh(!0),this.emit("add")},t.handleMouse=function(e){var t=this;t.mouseDown&&(t.isDrag=!0,t.ele.scrollLeft+=(t.mouseDown-e.clientX)*(t.opt.dragVelocity||3.3),t.mouseDown=e.clientX)},t.round=function(e){var t=1/(this.opt.slidesToScroll%1||1);return Math.round(e*t)/t},t.refresh=function(e){this.init(!0,e)},t.setOption=function(t,e){var o=this;o.breakpoint&&!e?o._opt.responsive.forEach(function(e){e.breakpoint===o.breakpoint&&(e.settings=Object.assign({},e.settings,t))}):o._opt=Object.assign({},o._opt,t),o.breakpoint=0,o.settingsBreakpoint()},t.destroy=function(){function e(t){t.removeAttribute("style"),[].forEach.call(t.classList,function(e){/^glider/.test(e)&&t.classList.remove(e)})}var t=this,o=t.ele.cloneNode(!0);o.children[0].outerHTML=o.children[0].innerHTML,e(o),[].forEach.call(o.getElementsByTagName("*"),e),t.ele.parentNode.replaceChild(o,t.ele),t.event(a,"remove",{resize:t.resize}),t.emit("destroy")},t.emit=function(e,t){var o=new a.CustomEvent("glider-"+e,{bubbles:!this.opt.eventPropagate,detail:t});this.ele.dispatchEvent(o)},t.event=function(e,t,o){var i=e[t+"EventListener"].bind(e);Object.keys(o).forEach(function(e){i(e,o[e])})},e});
$(document).ready(setTimeout(function () {
    showPopup();
}, 5000));

function showPopup() {
    if ($('#popup')) {
        var cookie = $("#popup").attr("data-cookie");
        if (Cookies.get(cookie) === undefined) {
            Cookies.set(cookie, 'true', { expires: 30 });
            $('#popup').modal('show');
        }
    }
}