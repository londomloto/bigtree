<div class="bt-node bt-hbox {{:~last(last)}}" 
    data-id="{{:id}}" 
    data-level="{{:level}}" 
    data-leaf="{{:leaf}}">
    {{for ~elbow(#data)}}
        <div class="bt-node-elbow {{:type}}">{{:expander}}</div>
    {{/for}}
    <div class="bt-node-body bt-flex bt-hbox">
        <div class="bt-drag"></div>
        <div class="bt-text bt-flex bt-hbox">{{:text}}</div>
    </div>
</div>
