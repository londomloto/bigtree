# Bigtree

High performance hierarchical data rendering based on nested set model (pre-order tree).

## Features
* Large dataset
* Virtual scrolling
* Movable (dragdrop) nodes
* Editable nodes
* Keyboard navigation
* User plugins

## Dependencies

__Bigtree__ is jQuery plugin that relies on some libraries:
* [jQuery](http://code.jquery.com/jquery-2.2.1.min.js)
* [jQuery UI](http://jqueryui.com/resources/download/jquery-ui-1.11.4.zip)
* [jQuery Throttle & Debounce](http://github.com/cowboy/jquery-throttle-debounce/raw/v1.1/jquery.ba-throttle-debounce.min.js)
* [jsRender](https://www.jsviews.com/download/jsrender.min.js)

## Install
```
npm install jquery-bigtree
```

## Working Demo
http://londomloto.github.io/bigtree/demo/

## Example Usages

1. Loading data
    
    For illustration, we have these hierarchical structure:

    ![tree](tree.jpg?raw=true)
    
    
    ```javascript
    var data = [
        {id: 1, text: 'ROOT', left: 1, right: 10, level: 0, leaf: 0, expand: 1, path: '1'},
        {id: 2, text: 'A',    left: 2, right:  7, level: 1, leaf: 0, expand: 1, path: '1/2'},
        {id: 3, text: 'B',    left: 3, right:  4, level: 2, leaf: 1, expand: 1, path: '1/2/3'},
        {id: 4, text: 'C',    left: 5, right:  6, level: 2, leaf: 1, expand: 1, path: '1/2/4'},
        {id: 5, text: 'D',    left: 8, right:  9, level: 1, leaf: 1, expand: 1, path: '1/5'}    
    ];
    
    $('#tree').bigtree('load', data, true);
    ```

2. Using Events
    
    ```javascript
    // edit event
    $('#tree').on('edit.bt', function(e, oldText, newText){
        console.log(oldText, newText);
    });
    
    // move event
    $('#tree').on('move.bt', function(e, data, position){
        console.log(position);
    });
    ```

## Writing Your Own Plugin

You can create plugin that meet following requirements:
* `template` attribute
* `place` attribute
* `onInit()` method
* `onRender()` method
* `onSuspend()` method
* `update()` method
* `destroy()` method

For example:

```javascript
var MyPlugin = (function(){
    
    var Plugin = function() {
        this.template = '<button>remove</button>';
        this.place = 'tail';
    };
    
    Plugin.prototype = {
        onInit: function(tree, data) {
            this.tree = tree;
            this.data = data;
        },
        /**
         * Triggered everytime add-ons re-rendered
         * Note: element is fresh, so we can register any events here...
         */
        onRender: function() {
            var data = this.data, tree = this.tree;
                
            this.element.on('click', function(){
                // do something, for example:
                tree.remove(data);
            });
        },
        /**
         * Triggered when element is removed,
         * plugin kept exists for data, only element that removed
         */
        onSuspend: function() {
            
        },
        
        // and so on...
    };
    return Plugin;
}());
```
Example usage:
```javascript
$('#tree').bigtree({
    markup: '<div></div>',
    plugins: [
        new MyPlugin({id: 'trash'})
    ]
});
```

## Documentation
On progress...

## Authors
- [londomloto](https://github.com/londomloto)
- [kreasindo cipta teknologi, pt.](http://kct.co.id)


