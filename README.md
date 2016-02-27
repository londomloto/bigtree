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
        {id: 1, text: 'Node 1', path: '1'},
        {id: 2, text: 'Node 2', path: '1/2'},
        {id: 3, text: 'Node 3', path: '3'},
        {id: 4, text: 'Node 4', path: '3/4'}
    ];
    
    $('#tree').bigtree('load', data);
    ```

4. xxx

## Documentation
1. Options
2. Method
3. Events

## Author
- [londomloto](https://github.com/londomloto)


