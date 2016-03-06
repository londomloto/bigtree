# Bigtree

High performance hierarchical data rendering based on nested set model (pre-order tree).

## Features
* Large dataset
* Virtual scrolling
* Movable (dragdrop) nodes
* Editable nodes
* Keyboard navigation
* User plugins

## Working Demo
On progress...

## Example Usages
1. Client Usage
    
    ```xml
    <!DOCTYPE html>
    <html>
    <head>
    	<meta charset="UTF-8">
        <title>Bigtree</title>
        <link type="text/css" rel="stylesheet" href="bigtree.css">
    </head>
    <body>
    	
        <div id="tree"></div>
        
        <!-- dependencies -->
        <script src="{PATH_TO_JQUERY}"></script>
        <script src="{PATH_TO_JQUERY_UI}"></script>
        <script src="{PATH_TO_JQUERY_THROTTLE}"></script>
        <script src="{PATH_TO_JSRENDER}"></script>
        <!-- /dependencies -->

        <!-- core -->
        <script src="bigtree.js"></script>
        <!-- /core -->
        
        <!-- your app -->
        
        <!-- /your app -->
    </body>
    </html>
    ```
    
2. Loading data
    
    ```javascript
    var data = [
        {id: 1, text: 'Node 1', level: 0, path: '1'},
        {id: 2, text: 'Node 2', level: 1, path: '1/2'},
        {id: 3, text: 'Node 3', level: 0, path: '3'},
        {id: 4, text: 'Node 4', level: 1, path: '3/4'},
        {id: 5, text: 'Node 5', level: 2, path: '3/4/5'},
        {id: 6, text: 'Node 6', level: 2, path: '3/4/6'}
    ];
    
    $('#tree').bigtree('load', data, true);
    
    // output:
    - Node 1
      |____ Node 2
    - Node 3
      |____ Node 4
           |_____ Node 5        
           |_____ Node 6
    ```

4. Using Events
    
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

## Documentation
On progress...

## Authors
- [londomloto](https://github.com/londomloto)


