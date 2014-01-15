/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2013 Emanuel Busk
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author Emanuel Busk
 */ 
var Html5Sorter = function(settings) {
    that = this;
    that.swapMode = false; // Swap mode instead of insert

    // Constants for compareDocumentPosition()
    var POSITION_SAME           = 0;
    var POSITION_BEFORE         = 2;
    var POSITION_AFTER          = 4;
    var POSITION_PARENT         = 8;
    var POSITION_PARENT_BEFORE  = 10;
    var POSITION_PARENT_AFTER   = 12;
    var POSITION_CHILD          = 16;
    var POSITION_CHILD_BEFORE   = 18;
    var POSITION_CHILD_AFTER    = 20;
    var POSITION_NONE           = 32;

    // Html Classes 
    that.classes = {
        dragging: 'dragging',
        dragover: 'drag-over',
    };

    /**
     * Init the sortable list
     */
    that.init = function() {
        if (typeof settings.selector !== 'string') {
           return; 
        }
        if (settings.hasOwnProperty('swap')) {
            that.swapMode = settings.swap;
        }

        that.registerCallbacks();
        that.elementSelector = settings.element;
        that.wrapper = document.querySelector(settings.element);
        that.register(that.wrapper.querySelectorAll(settings.selector));
    }

    /**
     * Register events
     */
    that.register = function(elements) {
        each(elements, function(element) {
            // Make elements draggable
            element.setAttribute('draggable', 'true');

            // Register all events
            element.addEventListener('dragstart', that.dragStart, false);
            element.addEventListener('dragend', that.dragEnd, false);
            element.addEventListener('drag', that.dragging, false);
            element.addEventListener('dragover', that.dragOver, false);
            element.addEventListener('dragleave', that.dragLeave, false);
            element.addEventListener('drop', that.drop, false);
            if (element.children.length) {
                that.register(element.children);
            }
        });
    }

    /**
     * Validate and register callbacks from settings
     */
    that.registerCallbacks = function() {
        that.callbacks = {};

        if (typeof settings.onDrop === 'function') {
            that.callbacks.drop = settings.onDrop;
        }
        if (typeof settings.onDragStart === 'function') {
            that.callbacks.dragStart = settings.onDragStart;
        }
        if (typeof settings.onDragEnd === 'function') {
            that.callbacks.dragEnd = settings.onDragEnd;
        }
        if (typeof settings.onDragOver === 'function') {
            that.callbacks.dragOver = settings.onDragOver;
        }
        if (typeof settings.onDragLeave === 'function') {
            that.callbacks.dragLeave = settings.onDragLeave;
        }
    }

    /**
     * Handler for when starting to drag element
     */
    that.dragStart = function(event) {
        that.startIndex = indexOfNodeCollection(that.wrapper.children, event.target);
        that.dragElement = event.target;
        addClass(event.target, that.classes.dragging);
        that.callback('dragStart', event.target);
    }

    /**
     * Handler for stopping drag on element
     */
    that.dragEnd = function(event) {
        removeClass(event.target, that.classes.dragging);
        that.callback('dragEnd', event.target);
    }

    /**
     * Handler for dragging over 
     */
    that.dragOver = function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        addClass(event.target, that.classes.dragover);
        that.callback('dragOver', event.target);
    }

    /**
     * Handler for leaving drag over 
     */
    that.dragLeave = function(event) {
        removeClass(event.target, that.classes.dragover);
        that.callback('dragLeave', event.target);
    }

    /**
     * Handler for drop
     */
    that.drop = function(event) {
        removeClass(event.target, that.classes.dragover);
        if (that.swapMode) {
            that.swap(event.target);
        } else {
            that.insert(event.target);
        }
        var rootElement = document.querySelector(that.elementSelector);
        var wholeTreeNode = elementToObject(rootElement);

        that.callback('drop', event.target, [wholeTreeNode]);
    }

    /**
     * Handler for dragging
     */
    that.dragging = function(event) {
        that.callback('dragging', event.target);
    }

    /**
     * Insert dragged element at drop before/after drop element
     *
     */
    that.insert = function(element) {
        var startElem = that.dragElement; 
        var compare = startElem.compareDocumentPosition(element);

        switch(compare) {
            case POSITION_BEFORE:
            case POSITION_PARENT:
            case POSITION_PARENT_BEFORE:
                element.parentNode.insertBefore(startElem, element);
                break;
            case POSITION_AFTER:
            case POSITION_PARENT_AFTER:
                element.parentNode.insertBefore(startElem, element.nextSibling);
                break;
            case POSITION_CHILD:
            case POSITION_CHILD_BEFORE:
            case POSITION_CHILD_AFTER:
                // This is when drop element is inside start element node. If
                // should be implemented all children inside of the node needs
                // to be inserted at parent node.
            default:
                break;
        }
        that.dragElem = undefined;
    }

    /**
     * Swap image positions
     */
    that.swap = function(element) {
        var dropIndex = indexOfNodeCollection(that.wrapper.children, element);
        var startElem = that.wrapper.children[that.startIndex];
        var swapPosition = that.startIndex;

        if (that.startIndex > dropIndex) {
            swapPosition++;
        } 

        purge(startElem);
        that.wrapper.removeChild(startElem);
        that.wrapper.insertBefore(startElem, that.wrapper.children[dropIndex]);

        purge(element);
        that.wrapper.removeChild(element);
        that.wrapper.insertBefore(element, that.wrapper.children[swapPosition]);
    }

    /**
     * Call callback
     */
    that.callback = function(name, event, params) {
        if (that.hasOwnProperty('callbacks')) {
            if (that.callbacks.hasOwnProperty(name)) {
                var fn = that.callbacks[name];
                if (typeof params === 'object') {
                    params.unshift(event);
                    fn.apply(fn, params);
                }
                fn(event);
            }
        }
    }

    /**
     * Helper funcitons below this!
     *
     * TODO: break out helpers to own object
     */

    /**
     * Loop through and execute things
     */
    function each(list, todo) {
        for (var i=0; i < list.length; i++) {
            todo(list[i]);
        }
    }

    /**
     * Check if element has a specific class
     *
     */
    function hasClass(element, name) {
        var cls = element.getAttribute('class')
        if (!cls) {
            return false;
        }

        cls = cls.split(' ');
        if (cls.indexOf(name) > -1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Add class to element if not already exists
     */
    function addClass(element, name) {
        var cls = element.getAttribute('class');

        if (cls) {
            cls = cls.split(' ');
            if (cls.indexOf(name) === -1) {
                cls.push(name);
            }
            element.setAttribute('class', cls.join(' '));
        } else {
            element.setAttribute('class', name);
        }
    }

    /**
     * Remove class from element if exists
     */
    function removeClass(element, name) {
        var cls = element.getAttribute('class');
        if (!cls) {
            return;
        }

        cls = cls.split(' ');

        var idx = cls.indexOf(name);
        if (idx > -1) {
            cls.splice(idx, 1);
            element.setAttribute('class', cls)
        }
    }

    /**
     * Get index of dom node
     */
    function indexOfNodeCollection(collection, target) {
        var nodeList = Array.prototype.slice.call(collection);
        return nodeList.indexOf(target);
    }

    /**
     * Remove all references before calling removeChild
     * This is for fixing menory leaking in IE
     */
    function purge(d) {
        var a = d.attributes, i, l, n;
        if (a) {
            for (i = a.length - 1; i >= 0; i -= 1) {
                n = a[i].name;
                if (typeof d[n] === 'function') {
                    d[n] = null;
                }
            }
        }
        a = d.childNodes;
        if (a) {
            l = a.length;
            for (i = 0; i < l; i += 1) {
                purge(d.childNodes[i]);
            }
        }
    }

    /**
     * Get DOM element as object for conversion to JSON
     */
    function elementToObject(element, o) {
        var el = element;
        var o = {
            tagName: el.tagName
        };
        var i = 0;
        for (i ; i < el.attributes.length; i++) {
            o[el.attributes[i].name] = el.attributes[i].value;
        }

        var children = el.children;
        if (children.length) {
            o.children = [];
            i = 0;
            for (i ; i < children.length; i++) {
                child = children[i];
                o.children[i] = elementToObject(child, o.children) ;
            }
        }
        return o;
    }

    that.init(); // Trigger init
}
