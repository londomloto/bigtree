# Bigtree

High performance hierarchical data rendering based on nested set model (can also be used for adjacency).

## Features

  * Virtual scrolling (tested +1 millions nodes)
  * Movable nodes
  * Editable nodes
  * Keyboard navigation

## Working Demo
[Demo](https://plnkr.co/edit/qd1WMs2yVxOqlxe2QJGt?p=preview)

## Example Usages
1. Include library
    
    ```xml
    <script src="jquery.js"></script>
    <script src="jquery.bigtree.js"></script>
    ```
2. Usage
    
    ```javascript
    <div id="tree"></div>
    <script>
        $('#tree').bigtree();
    </script>
    ```
3. Loading data
    
    ```javascript
    var data = [
        {id: 1, text: 'Node 1', level: 0, path: '1'},
        {id: 2, text: 'Node 2', level: 1, path: '1/2'},
        {id: 3, text: 'Node 3', level: 0, path: '3'},
        {id: 4, text: 'Node 4', level: 1, path: '3/4'},
        {id: 5, text: 'Node 5', level: 2, path: '3/4/5'},
        {id: 6, text: 'Node 6', level: 2, path: '3/4/6'}
    ];
    
    $('#tree').bigtree('load', data);
    
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
### Options

* ___markup___
* ___itemSize___
* ___delay___
* ___buffer___

### Method

* ___obj()___
* ___load(data)___
* ___index()___
* ___get(index)___
* ___parent(data)___
* ___children(data)___
* ___descendants(data)___
* ___ancestors(data)___
* ___isparent(data)___
* ___isleaf(data)___
* ___isphantom(data)___
* ___first()___
* ___prev(data)___
* ___next(data)___
* ___last()___
* ___move(data, position)___
* ___swap(data, from, to)___
* ___select(data)___
* ___deselect(data)___
* ___deselectAll()___
* ___expand(data)___
* ___collapse(data)___
* ___toggle(data[, force])___
* ___search(query)___
* ___destroy([remove])___

### Events

* ___init.bt___
* ___beforerender.bt___
* ___render.bt___
* ___edit.bt___
* ___move.bt___

## Authors
- [londomloto](https://github.com/londomloto)


