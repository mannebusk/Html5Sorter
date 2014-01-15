Html5Sorter
===========

Standalone drag and drop sorting using HTML5.

Works recursivley on child elements.

Usage
----------
    var sorter = new Html5Sorter({
      container: '.myContainer',
      selector: 'li',
      onDrop: function(elem, completeTree) {
        // Do some stuff ...
      }
    });

Event Callbacks
----------
- onDragStart
- onDragEnd
- onDragOver
- onDragLeave
- onDrop

Styling
----------
Classes for styling drag and drag-over states:
- dragging
- drag-over
