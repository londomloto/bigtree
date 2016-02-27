# Bigtree

High performance hierarchical data rendering based on nested set model (can also be used for adjacency).

## Working Demo
On progress...

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
1. Options
  * __markup__
  
    HTML markup used for rendering each node. Markup can contains tags (template) supported by __jsRender__

  * __itemSize__
    
    

2. Method
3. Events

## Author
- [londomloto](https://github.com/londomloto)


