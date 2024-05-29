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
