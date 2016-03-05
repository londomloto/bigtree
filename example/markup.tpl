<div class="bt-node bt-hbox {{if _last}}bt-last{{/if}}" 
    data-id="{{:wtt_id}}" 
    data-level="{{:wtt_depth}}" 
    data-leaf="{{:wtt_is_leaf}}">
    {{for _elbows}}
        <div class="bt-node-elbow {{:type}}">{{:icon}}</div>
    {{/for}}
    <div class="bt-node-body bt-flex bt-hbox">
        <div class="bt-drag"></div>
        <div class="bt-text bt-flex bt-hbox">({{:wtt_left}}, {{:wtt_right}}) {{:wtt_title}} - {{:wtt_id}}</div>
        <div class="bt-plugin bt-hbox"></div>
        <div class="bt-trash"></div>
    </div>
</div>
