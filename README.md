#Bigtree

High performance hierarchical data rendering based on nested set model (pre-order tree).

##Features

* Large dataset
* Virtual scrolling
* Movable (dragdrop) nodes
* Editable nodes
* Keyboard navigation
* User plugins

##Dependencies

__Bigtree__ is jQuery plugin that relies on some libraries:

* [jQuery](http://code.jquery.com/jquery-2.2.1.min.js)
* [jQuery UI](http://jqueryui.com/resources/download/jquery-ui-1.11.4.zip)
* [jQuery Throttle & Debounce](http://github.com/cowboy/jquery-throttle-debounce/raw/v1.1/jquery.ba-throttle-debounce.min.js)
* [jsRender](https://www.jsviews.com/download/jsrender.min.js)

##Install

```
npm install jquery-bigtree
```

##Demo

[Demo](http://londomloto.github.io/bigtree/demo/)

##Usage

```javascript
$('element').bigtree();

// with options
$('element').bigtree({
    markup: '<div></div>'
});
```

Hierarchical structure illustration:

![tree](tree.jpg?raw=true) 

Then, we transform the data into json:

```
var data = [
    {id: 1, text: 'ROOT', left: 1, right: 10, level: 0, leaf: 0, expand: 1, path: '1'},
    {id: 2, text: 'A',    left: 2, right:  7, level: 1, leaf: 0, expand: 1, path: '1/2'},
    {id: 3, text: 'B',    left: 3, right:  4, level: 2, leaf: 1, expand: 1, path: '1/2/3'},
    {id: 4, text: 'C',    left: 5, right:  6, level: 2, leaf: 1, expand: 1, path: '1/2/4'},
    {id: 5, text: 'D',    left: 8, right:  9, level: 1, leaf: 1, expand: 1, path: '1/5'}
];
```

Then, we load into plugin:

```javascript
$('element').bigtree('load', data, true);
```

##Options

####- fields
Type: `Object`
Default: `{}`

Node field mapping to tranform real data field to node field, so plugin can works with user data structure (model).

```javascript
fields: {
    id:     'id',
    text:   'text',
    left:   'left',
    right:  'right',
    level:  'level',
    leaf:   'leaf',
    path:   'path',
    expand: 'expand'
}
```
####- itemSize
Type: `Number`
Default: `32`

Height for each rendered node.

####- stepSize
Type: `Number`
Default: `25`

Padding size for each level.

####- delay
Type: `Number`
Default: `30`

Scrolling delay, used for change scrolling size.

####- buffer
Type: `Number`
Default: `0`

Leading and trailing rendered nodes from edges.

####- markup
Type: `String`
Default: `<div></div>`

HTML markup used to render each node, support jsrender templtating tags.

```xml
<div 
    class="bt-node bt-hbox {{if _last}}bt-last{{/if}}"
    data-id="{{:id}}"
    data-level="{{:level}}"
    data-leaf="{{:leaf}}">
    {{for _elbows}}
    <div class="bt-node-elbow {{:type}}">{{:icon}}</div>
    {{/for}}
    <div class="bt-node-body bt-flex bt-hbox">
        <div class="bt-drag"></div>
        <div class="bt-plugin head"></div>
        <div class="bt-text bt-flex bt-hbox">{{:text}}</div>
        <div class="bt-plugin tail"></div>
    </div>
</div>
```

##Methods

####- __load()__
Arguments: `(Array data[, Boolean render = false])`
Return: `void`

Used for loading data into plugin. 

```javascript
var data = [/* YOUR DATA HERE */];

$('element', data, true);
```

We can also loading data from paginated ajax request, for example:

```javascript
var start = 0, limit = 100;

function load(start, limit) {
    $.ajax({
        url: 'tree.php',
        type: 'post',
        dataType: 'json',
        data: {
            start: start,
            limit: limit
        }
    }).done(function(response){
        // for example, we have following response
        // {data: [], total: 10000}

        $('element').bigtree('load', response.data);
        
        if ( ! $('element').bigtree('scrollable')) {
            $('element').bigtree('render');
        }

        start += limit;

        if ( start < response.total ) {
            // continue load
            load(start, limit);
        }
    });
}

// run first time
load(start, limit);
```

##Events

####- __init.bt__
Arguments: `(Event e)`

Fired after plugin initialized.

```javascript
$('element').on('init.bt', function(e){
    $('element').children().html('Loading...'); 
});
```

####- __beforerender.bt__
Arguments: `(Event e, Array data)`

Fired before nodes rendered.

####- __render.bt__
Arguments: `(Event e, Array data, Array nodes)`

Fired after nodes rendered.

####- __expand.bt__
Arguments: `(Event e, Object data)`

Fired after node expanded.

```javascript
$('element').on('expand.bt', function(e, data){
    $.ajax({
        url: 'update.php',
        data: {
            id: data.id,
            expand: data.expand
        }
    });
});
```

####- __collapse.bt__
Arguments: `(Event e, Object data)`

Fired after node collapsed.

## Plugin

You can write your own plugin for handle specific data (node).

```javascript

var TrashPlugin = (function(){
   
    var Plugin = function() {
        /**
         * Template plugin
         */
        this.template = '<a href="#">' + 
                            '<i class="fa fa-trash-o"></i>{{:this.caption}}' + 
                        '</a>';

        /**
         * Plugin placement
         *
         * value: tail, head
         */
        this.place = 'tail';

        this.init();
    };

    Plugin.prototype = {

        update: function() {
            this.caption = 'Delete';
        },

        onInit: function (tree, data) {
            this.tree = tree;
            this.data = data;
        },

        onRender: function() {
            var tree = this.tree, data = this.data;

            this.element.on('click', function(e){

                if (confirm('Delete selected data?')) {
                    tree.remove(data);
                }

            });
        },

        onSuspend: function() {

        },

        destroy: function() {

        }
    };

    return Plugin;
});

```

Registering plugins:

```javascript

$('element').bigtree({
    markup: '...',
    plugins: [
        new TrashPlugin({id: 'trash'})
    ]
});

```