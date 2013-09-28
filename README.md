Html5Sorter
===========

Standalone drag and drop sorting using HTML5.

Usage
----------
    var sorter = new Html5Sorter({
      selector: '.myContainer',
      onDrop: function(event) {
        // Do some stuff ...
      }
    });
The default behaviour is to insert element at drop position, 
but you can also swap position with the elment dropped on by setting the option <b>swap</b> to <b>true</b>.
    

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
