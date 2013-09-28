Html5Sorter
===========

Standalone drag and drop sorting using HTML5.

Usage
----------
  var sorter = new Html5Sorter({
    selector: 'ul.sortable',
    onDrop: function(event) {
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
