<?php
/**
 * Nested Set Model
 *
 * @author PT. Kreasindo Cipta Teknologi
 * @author Roso Sasongko <roso@kct.co.id>
 */

namespace Cores;

use Phalcon\Mvc\Model\Resultset\Simple as Resultset,
    Phalcon\Mvc\Model\Message,
    Cores\Model,
    Cores\Config,
    Interfaces\ITreeModel,
    Libraries\QueryNode;

abstract class TreeModel extends Model implements ITreeModel {
    
    const ACTION_INSERT_APPEND  = 'append';
    const ACTION_INSERT_PREPEND = 'prepend';
    const ACTION_INSERT_BEFORE  = 'before';
    const ACTION_INSERT_AFTER   = 'after';
    
    const ACTION_MOVE_APPEND    = 'moveAppend';
    const ACTION_MOVE_PREPEND   = 'movePrepend';
    const ACTION_MOVE_BEFORE    = 'moveBefore';
    const ACTION_MOVE_AFTER     = 'moveAfer';

    private static $_instance;
    private $_config = null;
    private $_index  = null;
    
    public $root     = null;
    public $parent   = null;
    public $after    = null;
    public $before   = null;
    public $action   = null;

    public $children = array();

    private static function _getInstance() {
        if ( ! self::$_instance) {
            self::$_instance = new static();
        }
        return self::$_instance;
    }
    
    private static function _buildResult($specs = array()) {
        $base  = self::_getInstance();
        $link  = $base->getReadConnection();
        $alias = $base->getAlias();
        
        $sql = $specs['select'];
        $var = isset($specs['params']) ? self::params($specs['params'], NULL, NULL, 'n') : array();

        $var['conditions'] = isset($var['conditions']) 
            ? preg_replace('/([\:]?)(\w+)([\:]+)/', ':$2', $var['conditions']) : '';

        isset($var['columns']) || $var['columns'] = '';
        isset($var['join']) || $var['join'] = '';
        isset($var['group']) || $var['group'] = '';
        isset($var['order']) || $var['order'] = '';
        isset($var['limit']) || $var['limit'] = array();
        isset($var['bind']) || $var['bind'] = array();

        if (isset($specs['where'])) {
            $sql .= " \n".$specs['where'] . ( ! empty($var['conditions']) ? ' AND '.$var['conditions'] : '');
        } else {
            $sql .= ! empty($var['conditions']) ? ' WHERE '.$var['conditions'] : '';
        }

        if (isset($specs['group'])) {
            $sql .= " \n".$specs['group'] . ( ! empty($var['group']) ? ', '.$var['group'] : '');
        } else {
            $sql .= ! empty($var['group']) ? ' GROUP BY '.$var['group'] : '';
        }

        if (isset($specs['order'])) {
            $sql .= ' '.$specs['order'] . ( ! empty($var['order']) ? ', '.$var['order'] : '');
        } else {
            $sql .= ! empty($var['order']) ? ' ORDER BY '.$var['order'] : '';
        }

        if (isset($specs['limit'])) {
            $sql .= " \n".$specs['limit'];
        } else if (isset($var['limit']['offset'], $var['limit']['number'])) {
            $sql .= " \nLIMIT ".$var['limit']['offset'].', '.$var['limit']['number'];
        }

        $outer = 'SELECT SQL_CALC_FOUND_ROWS ';

        if ( ! empty($var['columns'])) {
            $outer .= $var['columns'].", path, depth ";
        } else {
            $outer .= ( ! empty($alias) ? $alias.'.* ' : '* ');
        }

        $outer .= "FROM ($sql) $alias";

        if ( ! empty($var['join'])) {
            $outer .= " \n".$var['join'];
        }

        return new Resultset(null, $base, $link->query($outer, $var['bind']));
    }

    private static function _createQuery($root, $excludeRoot = true) {
        $base  = self::_getInstance();
        $link  = $base->getReadConnection();
        
        $table = $base->getSource();
        $index = $base->getIndex();
        
        $fieldLeft = $base->getParamLeft();
        $fieldRight = $base->getParamRight();
        $fieldRoot = $base->getParamRoot();
        $fieldLevel = $base->getParamLevel();
        $fieldId = $base->getParamId();
        
        $rootValue = $root->$fieldId;

        $query = new \stdClass();

        $query->select = 
            "SELECT 
                n.*, 
                (COUNT(p.$fieldId) - 1) as depth, 
                (GROUP_CONCAT(p.$fieldId ORDER BY p.$fieldLeft SEPARATOR '/')) as path 
            FROM 
                $table n FORCE INDEX ($index), 
                $table p FORCE INDEX ($index)";

        $query->where = 
            "WHERE 
                (n.$fieldLeft BETWEEN p.$fieldLeft AND p.$fieldRight) AND 
                (n.$fieldRoot = $rootValue AND p.$fieldRoot = $rootValue)";

        if ($excludeRoot) {
            $query->where .= " AND (p.$fieldLevel > 0 )";
        }

        $query->group = "GROUP BY n.$fieldId";
        $query->order = "ORDER BY n.$fieldLeft";

        return $query;
    }

    private static function _createParams($params = array()) {
        $result = self::params($params, NULL, NULL, 'n');

        $result['conditions'] = isset($result['conditions']) 
            ? preg_replace('/([\:]?)(\w+)([\:]+)/', ':$2', $result['conditions']) : '';
        
        $result['bind'] = isset($result['bind']) ? $result['bind'] : array();

        return $result;
    }

    private static function _createResult($sql, $params = array()) {
        
        $base  = self::_getInstance();
        $link  = $base->getReadConnection();
        $alias = $base->getAlias();
        
        $vars  = self::params($params, null, null, $alias);

        // wrap sql
        $query = "SELECT SQL_CALC_FOUND_ROWS ";

        if (isset($vars['columns'])) {
            $query .= $vars['columns'];
            $query .= ', path, depth';
        } else {
            $query .= ( ! empty($alias) ? $alias . '.*' : '*');
        }
        
        $query .= PHP_EOL;
        $query .= "FROM ($sql) $alias " . PHP_EOL;

        if (isset($vars['join'])) {
            $query .= $vars['join'] . PHP_EOL;
        }

        if (isset($vars['conditions'])) {
            $conditions = preg_replace('/([\:]?)(\w+)([\:]+)/', ':$2', $vars['conditions']);
            $query .= "WHERE $conditions " . PHP_EOL;
        }

        if (isset($vars['group'])) {
            $query .= "GROUP BY " . $vars['group'] . PHP_EOL;
        }

        if (isset($vars['order'])) {
            $query .= "ORDER BY " . $vars['order'] . PHP_EOL;
        }

        if (isset($vars['limit'])) {
            $query .= sprintf("LIMIT %d, %d ", $vars['limit']['offset'], $vars['limit']['number']);
        }

        $bind = isset($vars['bind']) ? $vars['bind'] : array();

        return new Resultset(null, $base, $link->query($query, $bind));
    }

    /**
     * Simple function of Model::findFirst()
     */
    private static function _findFirst($id, $columns = '*') {
        $base  = self::_getInstance();
        
        $link  = $base->getReadConnection();
        $table = $base->getSource();

        $bind = array();

        if (is_array($columns)) 
            $columns = implode(',', $columns);

        $sql = "SELECT $columns FROM $table WHERE 1 = 1 ";

        if (is_numeric($id)) {
            $bind[$base->getParamId()] = $id;
        } else {
            $bind = $id;
        }

        $where = array();

        foreach($bind as $k => $v) 
            $where[] = "$k = :$k";
            
        if ( ! empty($where)) 
            $sql .= ' AND ('.implode(' AND ', $where).') ';

        $sql .= 'LIMIT 1';
        return $link->fetchOne($sql, \Phalcon\Db::FETCH_ASSOC, $bind);
    }

    private static function _findRoot($node) {
        $fieldId = $node->getParamId();
        $fieldRoot = $node->getParamRoot();
        $fieldLevel = $node->getParamLevel();

        $params = array();

        $params[$fieldLevel] = 0;
        $params[$fieldId] = $node->$fieldRoot;
        
        $root = self::_findFirst($params, $fieldId);

        return (object) $root;
    }

    public function initialize() {
        parent::initialize();

        if ( ! $this->_index) {
            $link  = $this->getReadConnection();
            $table = $this->getSource();
            $index = $table.'_tree';
            $base = self::_getInstance();

            $key = $base->getParamId();
            $root  = $base->getParamRoot();

            $found = $link->fetchOne(
                "SHOW INDEX FROM $table WHERE Key_name = '$index'", 
                \Phalcon\Db::FETCH_ASSOC
            );

            if ( ! $found) {
                $link->query("CREATE INDEX $index ON $table ($root,$key) USING BTREE");
            }

        }
    }

    public function getIndex() {
        return $this->getSource().'_tree';
    }

    public function setupNode(Array $config) {

        // prepare config 'fields'
        if ( ! isset($config['fields'])) {
            $this->exception('Config \'fields\' is required!');
        }

        if ( ! isset($config['fields']['root'])) {
            $this->exception('Config \'fields => root\' is required!');
        }

        if ( ! isset($config['fields']['level'])) {
            $this->exception('Config \'fields => level\' is required!');
        }

        if ( ! isset($config['fields']['left'])) {
            $this->exception('Config \'fields => left\' is required!');
        }

        if ( ! isset($config['fields']['right'])) {
            $this->exception('Config \'fields => right\' is required!');
        }   

        if ( ! isset($config['fields']['parent'])) {
            $config['fields']['parent'] = 'pid';
        }

        // prepare config 'alias'
        if ( ! isset($config['alias'])) {
            $config['alias'] = 'tree';
        }

        $this->_config = new Config($config);
        $this->_bm = $this->getDI()->get('benchmark', true);

    }

    public function getNodeConfig($key = null) {
        $config = $this->_config;
        if ( ! empty($key)) {
            if ($config->offsetExists($key)) {
                return $config->$key;
            }
            return null;
        }
        return $config;
    }

    public function getParamRoot() {
        return $this->_config->fields->root;
    }

    public function getParamLevel() {
        return $this->_config->fields->level;
    }

    public function getParamLeft() {
        return $this->_config->fields->left;
    }

    public function getParamRight() {
        return $this->_config->fields->right;
    }

    public function getParamId() {
        return $this->getModelsMetadata()->getIdentityField($this);
    }

    public function getParamPid() {
        return $this->_config->fields->parent;
    }

    public function getAlias() {
        return $this->_config->alias;
    }

    public function getRootValue() {
        $field = $this->getParamRoot();
        return (int) $this->$field;
    }

    public function getLevelValue() {
        $field = $this->getParamLevel();
        return (int) $this->$field;
    }

    public function getLeftValue() {
        $field = $this->getParamLeft();
        return (int) $this->$field;
    }

    public function getRightValue() {
        $field = $this->getParamRight();
        return (int) $this->$field;
    }

    public function getIdValue() {
        $field = $this->getParamId();
        return $field ? (int) $this->$field : null;
    }

    public function getParentValue() {
        $field = $this->getParamPid();
        $value = $this->$field;

        if (is_null($value)) {
            if ($this->isRoot()) {
                $value = -1;
            } else {
                $path = $this->getPathValue();
                $part = explode('/', $path);
                array_pop($part);
                $value = (int) array_pop($part);    
            }
        } else {
            $value = $this->isRoot() ? -1 : $value;
        }
        return $value;
    }

    public function getPreviousValue() {
        $previous = $this->getPrevious();
        return $previous ? $previous->getIdValue() : null;
    }

    public function getNextValue() {
        $next = $this->getNext();
        return $next ? $next->getIdValue() : null;
    }

    public function getDepthValue() {
        return isset($this->depth) ? (int) $this->depth : 0;
    }

    public function getPathValue($exroot = TRUE) {
        $path = isset($this->path) ? $this->path : '';
        if ($exroot) {
            $part = explode('/', $path);
            $root = $this->getRootValue();

            if (isset($part[0]) && $part[0] == $root)
                array_shift($part);

            return implode('/', $part);
        }
        return $path;
    }

    public function getPathBy($field = '*', $separator = '/', $exroot = TRUE) {
        if (empty($field)) $field = '*';

        $table = $this->getSource();
        $fieldId = $this->getParamId();
        $fieldLeft = $this->getParamLeft();
        $fieldRight = $this->getParamRight();
        $fieldRoot = $this->getParamRoot();
        $fieldLevel = $this->getParamLevel();
        
        $idValue = $this->getIdValue();
        $rootValue = $this->getRootValue();

        $select = "SELECT 
                    p.$field
                FROM 
                    $table n, 
                    $table p";
        $where = "WHERE 
                    (n.$fieldLeft BETWEEN p.$fieldLeft AND p.$fieldRight) 
                    AND n.$fieldRoot = $rootValue 
                    AND p.$fieldRoot = $rootValue 
                    AND n.$fieldId = $idValue ";

        if ($exroot) {
            $where .= "AND p.$fieldLevel > 0 ";
        }

        $order = "ORDER BY n.$fieldLeft";

        $result = $this->_buildResult(array(
            'select' => $select,
            'where' => $where,
            'order' => $order
        ));

        if ($result->count() > 0) {
            if (strpos($field, '*') !== FALSE || strpos($field, ',') !== FALSE) {
                return $result;
            } else {
                $array = array_map(function($item) use ($field) { return trim($item[$field]); }, $result->toArray());
                return implode($separator, $array);
            }
        }

        return false;
    }

    public function isRoot() {
        return $this->getLevelValue() == 0;
    }

    public function isParent() {
        return $this->hasChildren();
    }

    public function isLeaf() {
        return ($this->getRightValue() - $this->getLeftValue()) == 1;
    }

    public function isLeftMost() {

    }

    public function isRightMost() {
        
    }

    public function hasChildren() {
        return ($this->getRightValue() - $this->getLeftValue()) > 1;
    }

    public function hasParent() {
        // $path = $this->getPathValue();
        return ! $this->isRoot();
    }

    public function isPhantom() {
        return $this->getDirtyState() != Model::DIRTY_STATE_PERSISTENT;
    }

    // @Override
    public function toArray($columns = NULL, $excludeRoot = TRUE) {
        $array = parent::toArray($columns);

        if ($excludeRoot) {
            $array['depth'] = isset($this->depth) ? (int) $this->depth - 1 : 0;
        } else {
            $array['depth'] = 
        }

        $array['depth'] = isset($this->depth) ? $this->depth : NULL;
        $array['path'] = isset($this->path) 
            ? ($excludeRoot 
                ? $this->getPathValue(TRUE) 
                : $this->path)
            : NULL;

        $array['pid']   = $this->getParentValue();
        
        return $array;
    }

    // @Override
    public function toScalar($related = true) {
        $scalar = parent::toScalar($related);
        $scalar->depth = isset($this->depth) ? $this->depth : null;
        $scalar->path = isset($this->path) ? $this->path : null;
        $scalar->pid = $this->getParentValue();
        
        return $scalar;
    }

    public function createRoot($data = array()) {
        
        $fieldRoot  = $this->getParamRoot();
        $fieldLevel = $this->getParamLevel();
        $fieldLeft  = $this->getParamLeft();
        $fieldRight = $this->getParamRight();
        $fieldId    = $this->getParamId();
        $fieldPid   = $this->getParamPid();

        if (method_exists($this, 'getDefaultValues')) {
            $defaults = $this->getDefaultValues();
            foreach($defaults as $key => $val) {
                $this->$key = $val;
            }
        }

        if (count($data) > 0) {
            foreach($data as $key => $val) {
                $this->$key = $val;
            }
        }

        if (method_exists($this, 'onBeforeCreateRoot')) {
            $this->onBeforeCreateRoot();
        }

        $this->$fieldPid   = -1;
        $this->$fieldLevel = 0;
        $this->$fieldLeft  = 1;
        $this->$fieldRight = 2;

        if ($this->save()) {

            // update root field
            $this->$fieldRoot = $this->getIdValue();
            $this->save();

            // update with depth and path
            $this->depth = 0;
            $this->path  = (string) $this->getIdValue();

            return true;
        }

        return false;
    }
    
    public function append(Model $node) {
        $node->root   = $this->isRoot() ? $this : $this->getRoot();
        $node->parent = $this;

        if ($node->isPhantom()) {
            $node->action = self::ACTION_INSERT_APPEND;
            return $node->createNode();
        } else {
            $node->action = self::ACTION_MOVE_APPEND;
            return $node->moveNode();
        }

    }

    public function prepend(Model $node) {
        $node->root   = $this->isRoot() ? $this : $this->getRoot();
        $node->parent = $this;

        if ($node->isPhantom()) {
            $node->action = self::ACTION_INSERT_PREPEND;
            return $node->createNode();
        } else {
            $node->action = self::ACTION_MOVE_PREPEND;
            return $node->moveNode();
        }

    }   

    public function appendTo(Model $parent, $data = array()) {
        $this->root   = $parent->isRoot() ? $parent : $parent->getRoot();
        $this->parent = $parent;

        if ($this->isPhantom()) {
            $this->action = self::ACTION_INSERT_APPEND;
            return $this->createNode($data);    
        } else {
            $this->action = self::ACTION_MOVE_APPEND;
            return $this->moveNode();
        }
    }

    public function prependTo(Model $parent, $data = array()) {
        $this->root   = $parent->isRoot() ? $parent : $parent->getRoot();
        $this->parent = $parent;

        if ($this->isPhantom()) {
            $this->action = self::ACTION_INSERT_PREPEND;
            return $this->createNode($data);    
        } else {
            $this->action = self::ACTION_MOVE_PREPEND;
            return $this->moveNode();
        }
        
    }

    public function insertBefore(Model $before) {
        if ( ! $before) {
            $this->addMessage("Target node paramater is required!");
            return false;
        }

        if ($before->isPhantom()) {
            $this->addMessage("Can't create node when target node is new!");
            return false;
        }
        
        $this->root   = $before->getRoot();
        $this->parent = $before->getParent();
        $this->before = $before;

        if ($this->isPhantom()) {
            $this->action = self::ACTION_INSERT_BEFORE;
            return $this->createNode(); 
        } else {
            $this->action = self::ACTION_MOVE_BEFORE;
            return $this->moveNode();
        }

    }

    public function insertAfter(Model $after) {
        if ( ! $after) {
            $this->addMessage("Target node paramater is required!");
            return false;
        }

        if ($after->isPhantom()) {
            $this->addMessage("Can't create node when target node is new!");
            return false;
        }

        $this->root = $after->getRoot();
        $this->parent = $after->getParent();
        $this->after = $after;

        if ($this->isPhantom()) {
            $this->action = self::ACTION_INSERT_AFTER;
            return $this->createNode(); 
        } else {
            $this->action = self::ACTION_MOVE_AFTER;
            return $this->moveNode();
        }
    }

    public function createNode($data = array()) {
        // validate root
        if ( ! $this->root) {
            $this->addMessage('Root node parameter is required!');
            return false;
        }

        if ($this->root->isPhantom()) {
            $this->addMessage("Can't create node when root node is new!");
            return false;
        }

        $root   = $this->root;
        $parent = $this->parent ? $this->parent : $root;
        
        // refresh root & parent (get actual data)
        if ( ! $parent->isRoot()) {
            $root->refreshNode();
            $parent->refreshNode(); 
        } else {
            $parent->refreshNode();
        }

        $action = $this->action;

        // validate parent
        if ($parent->isPhantom()) {
            $this->addMessage("Can't create node when parent node is new!");
            return false;
        }

        // validate action
        if ( ! $action) {
            $action = self::ACTION_INSERT_APPEND;
        }

        $link  = $this->getWriteConnection();
        $table = $this->getSource();

        $fieldLeft   = $this->getParamLeft();
        $fieldRight  = $this->getParamRight();
        $fieldRoot   = $this->getParamRoot();
        $fieldLevel  = $this->getParamLevel();
        $fieldId     = $this->getParamId();
        $fieldPid    = $this->getParamPid();
        
        $rootValue   = $root->getIdValue();
        
        $pidValue    = $parent->getIdValue();

        if ($parent->isRoot()) {
            $pidValue = 0;
        }

        $parentDepth = $parent->getDepthValue();
        $parentPath  = $parent->getPathValue();

        $position = null;
        $level    = null;

        switch($action) {
            case self::ACTION_INSERT_APPEND:
                $position = $parent->getRightValue();
                $level    = $parent->getLevelValue() + 1;
                break;
            case self::ACTION_INSERT_PREPEND:
                $position = $parent->getLeftValue() + 1;
                $level    = $parent->getLevelValue() + 1;
                break;
            case self::ACTION_INSERT_BEFORE:
                $before   = $this->before;
                $before->refreshNode();

                $position = $before->getLeftValue();
                $level    = $before->getLevelValue();
                break;
            case self::ACTION_INSERT_AFTER:
                $after    = $this->after;
                $after->refreshNode();
                $position = $after->getRightValue() + 1;
                $level    = $after->getLevelValue();
                break;
            default:
                $this->addMessage("Action $action is not supported!");
                return false;
        }

        $result = false;
        
        try {
            $link->begin();

            // Create new space for node
            $sql = "UPDATE $table SET $fieldLeft = $fieldLeft + 2 
                    WHERE $fieldLeft >= $position AND $fieldRoot = $rootValue";

            $link->execute($sql);

            $sql = "UPDATE $table SET $fieldRight = $fieldRight + 2 
                    WHERE $fieldRight >= $position AND $fieldRoot = $rootValue";

            $link->execute($sql);

            if (method_exists($this, 'getDefaultValues')) {
                $defaults = $this->getDefaultValues();
                if (is_array($defaults)) {
                    foreach($defaults as $key => $val) {
                        $this->$key = $val;
                    }
                }
            }

            if (is_array($data)) {
                foreach($data as $key => $val) {
                    $this->$key = $val;
                }
            }

            $this->$fieldRoot  = $rootValue;
            $this->$fieldPid   = $pidValue;
            $this->$fieldLeft  = $position;
            $this->$fieldRight = $position + 1; 
            $this->$fieldLevel = $level;

            if ($this->create()) {
                $link->commit();

                $idValue     = $this->getIdValue();
                $this->depth = $parentDepth + 1;
                $this->path  = $parentPath ? ($parentPath . '/' . $idValue) : $idValue;

                $result = true;
            } else {
                $link->rollback();
            }

        } catch(\Exception $e) {
            $result = false;

            $link->rollback();
            $this->addMessage($e->getMessage());
        }

        // invalidate operation
        $this->action = null;
        $this->root   = null;
        $this->parent = null;
        $this->before = null;
        $this->after  = null;

        return $result;
    }

    public function updateNode($data = array()) {
        // restrict update
        $excludes = array_values($this->_config->fields->toArray());
        
        // refresh node
        $this->refreshNode();

        if (is_array($data)) {
            foreach($data as $key => $val) {
                if (in_array($key, $excludes)) continue;
                $this->$key = $val;
            }
        }

        return $this->update();
    }

    /**
     * Delete current node and his children if needed
     *
     * @param  boolean $cascade TRUE to delete children
     *
     * @return boolean
     */
    public function deleteNode($cascade = true) {

        if ($this->isRoot()) {
            $this->addMessage("Can't delete root node!");
            return false;
        }

        // refresh node
        $this->refreshNode();

        $link  = $this->getWriteConnection();
        $table = $this->getSource();

        $fieldLeft  = $this->getParamLeft();
        $fieldRight = $this->getParamRight();
        $fieldRoot  = $this->getParamRoot();
        $fieldLevel = $this->getParamLevel();
        
        $leftValue  = $this->getLeftValue();
        $rightValue = $this->getRightValue();
        $rootValue  = $this->getRootValue();

        $result = false;

        try {
            $link->begin();

            if ($cascade) {
                // delete node and children
                $sql = "DELETE FROM $table 
                        WHERE 
                            ($fieldLeft >= $leftValue AND $fieldRight <= $rightValue) 
                            AND $fieldRoot = $rootValue";

                $link->execute($sql);

                // fix hole after deletion
                $offset = $rightValue + 1;
                $delta  = $leftValue - $rightValue - 1;

                $sql = sprintf(
                    "UPDATE $table SET $fieldLeft = $fieldLeft %+d 
                     WHERE $fieldLeft >= $offset AND $fieldRoot = $rootValue",
                     $delta
                );

                $link->execute($sql);

                $sql = sprintf(
                    "UPDATE $table SET $fieldRight = $fieldRight %+d 
                    WHERE $fieldRight >= $offset AND $fieldRoot = $rootValue",
                    $delta
                );

                $link->execute($sql);

                $link->commit();
                $result = true;

            } else {

                if ($this->delete()) {
                    // move children to existing parent
                    $sql = "UPDATE $table SET 
                                $fieldLeft = $fieldLeft - 1,
                                $fieldRight = $fieldRight - 1,
                                $fieldLevel = $fieldLevel - 1
                            WHERE 
                                ($fieldLeft >= $leftValue AND $fieldRight <= $rightValue)
                                AND $fieldRoot = $rootValue";

                    $link->execute($sql);

                    // fix hole
                    $offset = $rightValue + 1;
                    $delta  = -2;

                    $sql = sprintf(
                        "UPDATE $table SET $fieldLeft = $fieldLeft %+d 
                         WHERE $fieldLeft >= $offset AND $fieldRoot = $rootValue",
                        $delta
                    );

                    $link->execute($sql);

                    $sql = sprintf(
                        "UPDATE $table SET $fieldRight = $fieldRight %+d 
                         WHERE $fieldRight >= $offset AND $fieldRoot = $rootValue", 
                         $delta
                    );
                    
                    $link->execute($sql);
                    $link->commit();

                    $result = true;
                } else {

                    $link->rollback();
                    $result = false;

                }

            }
            
        } catch (\Exception $e) {
            $link->rollback();
            $this->addMessage($e->getMessage());

            $result = false;
        }
        
        return $result;
    }

    public static function move(Model $node, $npos) {
        $result = FALSE;

        $link  = $node->getWriteConnection();
        $table = $node->getSource();

        $lft = $node->getParamLeft();
        $rgt = $node->getParamRight();
        $rdn = $node->getParamRoot();

        // short var for readibilty
        $p = $npos;
        $l = (int) $node->$lft;
        $r = (int) $node->$rgt;
        $n = (int) $node->$rdn;

        try {
            $link->begin();

            $sql = "UPDATE $table
                    SET 
                        $lft = $lft + IF ($p > $r,
                            IF ($r < $lft AND $lft < $p,
                                $l - $r - 1,
                                IF ($l <= $lft AND $lft < $r,
                                    $p - $r - 1,
                                    0
                                )
                            ),
                            IF ($p <= $lft AND $lft < $l,
                                $r - $l + 1,
                                IF ($l <= $lft AND $lft < $r,
                                    $p - $l,
                                    0
                                )
                            )
                        ),
                        $rgt = $rgt + IF ($p > $r,
                            IF ($r < $rgt AND $rgt < $p,
                                $l - $r - 1,
                                IF ($l < $rgt AND $rgt <= $r,
                                    $p - $r - 1,
                                    0
                                )
                            ),
                            IF ($p <= $rgt AND $rgt < $l,
                                $r - $l + 1,
                                IF ($l < $rgt AND $rgt <= $r,
                                    $p - $l,
                                    0
                                )
                            )
                        )
                    WHERE ($r < $p OR $p < $l) AND $rdn = $n";
            
            $link->execute($sql);
            $link->commit();

            $result = TRUE;
        } catch(\Exception $e) {
            $link->rollback();
        }

        return $result;
    }

    public function moveNode() {
        
        if ($this->isRoot()) {
            $this->addMessage("Can't move root node!");
            return false;
        }

        if ( ! $this->root) {
            $this->addMessage("Root node parameter is required!");
            return false;
        }

        if ($this->root->isPhantom()) {
            $this->addMessage("Can't move node when root node is new!");
            return false;
        }

        $link   = $this->getWriteConnection();
        $table  = $this->getSource();

        $root   = $this->root;
        $parent = $this->parent ? $this->parent : $root;

        if ($parent->isPhantom()) {
            $this->addMessage("Can't move node when parent node is new!");
            return false;
        }

        // refresh root & parent (get actual data)
        if ( ! $parent->isRoot()) {
            // $root->refreshNode();
            // $parent->refreshNode();  
        } else {
            // $parent->refreshNode();
        }
        
       // $this->refreshNode();

        $action = $this->action;

        if ( ! $action) {
            $action = self::ACTION_MOVE_APPEND;
        }

        $fieldLeft  = $this->getParamLeft();
        $fieldRight = $this->getParamRight();
        $fieldRoot  = $this->getParamRoot();
        $fieldLevel = $this->getParamLevel();
        $fieldPid   = $this->getParamPid();
        
        $position = null;
        $depth    = null;
        $domain   = null;

        $leftValue  = $this->getLeftValue();
        $rightValue = $this->getRightValue();
        $levelValue = $this->getLevelValue();
        $rootValue  = $this->getRootValue();

        $pidValue   = $parent->getIdValue();

        if ($parent->isRoot()) {
            $pidValue = 0;
        }

        switch($action) {
            case self::ACTION_MOVE_APPEND:
                $position = $parent->getRightValue();
                $depth    = $parent->getLevelValue() - $levelValue + 1;
                $domain   = $parent->getRootValue();
                break;
            case self::ACTION_MOVE_PREPEND:
                $position = $parent->getLeftValue() + 1;
                $depth    = $parent->getLevelValue() - $levelValue + 1;
                $domain   = $parent->getRootValue();
                break;
            case self::ACTION_MOVE_BEFORE:
                $before = $this->before;
                // $before->refreshNode();
                
                $position = $before->getLeftValue();
                $depth    = $before->getLevelValue() - $levelValue + 0;
                $domain   = $before->getRootValue();
                break;
            case self::ACTION_MOVE_AFTER:
                $after = $this->after;
                // $after->refreshNode();

                $position = $after->getRightValue() + 1;
                $depth    = $after->getLevelValue() - $levelValue + 0;
                $domain   = $after->getRootValue();
                break;
            default:
                $this->addMessage("Action $action is not supported!");
                return false;
        }

        $result = false;

        try {
            $link->begin();

            $size = $rightValue - $leftValue + 1;

            $sql = sprintf(
                "UPDATE $table SET $fieldLeft = $fieldLeft %+d 
                 WHERE $fieldLeft >= $position AND $fieldRoot = $domain",
                $size
            );

            $link->execute($sql);

            $sql = sprintf(
                "UPDATE $table SET $fieldRight = $fieldRight %+d 
                WHERE $fieldRight >= $position AND $fieldRoot = $domain",
                $size
            );

            $link->execute($sql);
            
            if ($leftValue >= $position) {
                $leftValue  += $size;
                $rightValue += $size;
            }

            $sql = sprintf(
                "UPDATE $table 
                 SET 
                    $fieldLevel = $fieldLevel %+d,
                    $fieldPid   = $pidValue
                 WHERE 
                    $fieldLeft >= $leftValue AND $fieldRight <= $rightValue 
                    AND $fieldRoot = $domain",
                $depth
            );
            
            $link->execute($sql);

            $sql = sprintf(
                "UPDATE $table SET 
                    $fieldLeft  = $fieldLeft %+d,
                    $fieldRight = $fieldRight %+d
                 WHERE 
                    ($fieldLeft >= $leftValue AND $fieldRight <= $rightValue) 
                    AND $fieldRoot = $domain",
                $position - $leftValue,
                $position - $leftValue 
            );
            
            $link->execute($sql);

            $fixgap = $rightValue + 1;

            $sql = sprintf(
                "UPDATE $table SET $fieldLeft = $fieldLeft %+d 
                 WHERE $fieldLeft >= $fixgap AND $fieldRoot = $domain",
                -$size
            );

            $link->execute($sql);

            $sql = sprintf(
                "UPDATE $table SET $fieldRight = $fieldRight %+d 
                 WHERE $fieldRight >= $fixgap AND $fieldRoot = $domain",
                -$size
            );

            $link->execute($sql);

            $link->commit();

            $result = true;
            
            // refresh current node
            
            $this->refreshNode();
            
            // update phantoms props
            
        } catch (\Exception $e) {
            $link->rollback();
            $this->addMessage($e->getMessage());
            $result = false;
        }

        // invalidate operation
        $this->action = null;
        $this->root   = null;
        $this->parent = null;
        $this->before = null;
        $this->after  = null;

        return $result;
    }

    public function getRoot() {
        $fieldId = $this->getParamId();
        $fieldRoot  = $this->getParamRoot();
        $fieldLevel = $this->getParamLevel();

        $params = array();

        $params[$fieldLevel] = 0;
        $params[$fieldRoot]  = $this->$fieldRoot;

        $fake = new \stdClass();
        $fake->$fieldId = $this->$fieldRoot;
        
        $root = $this->findNode($fake, $params);
        return $root;
    }

    public function getParent() {

        $table = $this->getSource();
        $link = $this->getReadConnection();

        $fieldLeft = $this->getParamLeft();
        $fieldRight = $this->getParamRight();
        $fieldRoot = $this->getParamRoot();
        $fieldId = $this->getParamId();
        
        $idValue = $this->getIdValue();
        $rootValue = $this->getRootValue();

        $sql = "SELECT 
                    p.*
                FROM 
                    $table n,
                    $table p
                WHERE 
                    (n.$fieldLeft BETWEEN p.$fieldLeft AND p.$fieldRight) 
                    AND (n.$fieldId = $idValue)
                    AND (n.$fieldRoot = $rootValue) 
                    AND (p.$fieldRoot = $rootValue) 
                ORDER BY p.$fieldRight - p.$fieldLeft 
                LIMIT 1, 1";

        $result = new Resultset(NULL, $this, $link->query($sql));
        $parent = $result->getFirst();

        if ($parent) {
            $parent->depth = $this->getDepthValue() - 1;

            $parts = explode('/', $this->getPathValue());
            array_pop($parts);
            
            $path = implode('/', $parts);
            $parent->path = $path;
        }

        return $parent;
    }

    public function getAncestors($params = array(), $reverse = false, $excludeRoot = true) {
        
        $table = $this->getSource();

        $fieldLeft  = $this->getParamLeft();
        $fieldRight = $this->getParamRight();
        $fieldId    = $this->getParamId();
        $fieldRoot  = $this->getParamRoot();
        $fieldLevel = $this->getParamLevel();
        
        $idValue    = $this->getIdValue();
        $rootValue  = $this->getRootValue();

        // $reverse = true;

        $sql = "SELECT p.*, ".PHP_EOL;

        if ($reverse) {
            $sql .= "NULL as path, NULL as depth, NULL as pid ".PHP_EOL;
        } else {
            $sql .= "@path := TRIM(
                        LEADING '/' FROM @path := CONCAT_WS('/', @path, p.$fieldId)
                     ) as path, 
                     ROUND(
                        (
                            LENGTH(@path) - 
                            LENGTH(REPLACE(@path, '/', ''))
                        ) / LENGTH('/')
                     ) as depth, 
                     IF(
                         (
                            @pid := SUBSTRING_INDEX(
                                REPLACE(CONCAT('/', @path), CONCAT('/', p.$fieldId), ''),
                                '/',
                                -1
                            )
                         ) = '', 0, @pid
                    ) as pid".PHP_EOL;
        }

        $sql .= "FROM 
                    $table n, 
                    $table p,
                    (SELECT @path := '') x,
                    (SELECT @pid := '') y
                WHERE 
                    n.$fieldLeft BETWEEN p.$fieldLeft AND p.$fieldRight 
                    AND p.$fieldRoot = $rootValue 
                    AND n.$fieldRoot = $rootValue 
                    AND n.$fieldId = $idValue 
                    AND p.$fieldId <> $idValue " . PHP_EOL;

        if ($excludeRoot) {
            $sql .= "AND p.$fieldLevel <> 0 " . PHP_EOL;
        }

        if ($reverse) {
            $sql .= "ORDER BY (p.$fieldRight - p.$fieldLeft)";  
        } else {
            $sql .= "ORDER BY p.$fieldLeft";    
        }

        return $this->_createResult($sql, $params);
    }
    
    public function getDescendants($params = array(), $children = false) {

        $table = $this->getSource();

        $fieldLeft  = $this->getParamLeft();
        $fieldRight = $this->getParamRight();
        $fieldRoot  = $this->getParamRoot();
        $fieldId    = $this->getParamId();
        $fieldLevel = $this->getParamLevel();
        
        $rootValue  = $this->getRootValue();
        $idValue    = $this->getIdValue();
        $levelValue = $this->getLevelValue();

        $sql = "SELECT 
                    n.*,
                    (COUNT(p.$fieldId) - (st.depth + 1)) as depth,
                    (GROUP_CONCAT(p.$fieldId ORDER BY p.$fieldLeft SEPARATOR '/')) as path
                FROM 
                    $table n,
                    $table p,
                    $table sp,
                    (
                        SELECT 
                            xn.*,
                            (COUNT(xp.$fieldId) - 1) AS depth
                        FROM
                            $table xn,
                            $table xp
                        WHERE
                            (xn.$fieldLeft BETWEEN xp.$fieldLeft AND xp.$fieldRight)
                            AND (xp.$fieldRoot = $rootValue)
                            AND (xn.$fieldRoot = $rootValue)
                            AND (xn.$fieldId = $idValue)
                        GROUP BY xn.$fieldId 
                        ORDER BY xn.$fieldLeft
                    ) st 
                WHERE 
                    (n.$fieldLeft BETWEEN p.$fieldLeft AND p.$fieldRight) 
                    AND (n.$fieldLeft BETWEEN sp.$fieldLeft AND sp.$fieldRight) 
                    AND (n.$fieldRoot = $rootValue) 
                    AND (p.$fieldRoot = $rootValue) 
                    AND (n.$fieldLevel > $levelValue)
                    AND (sp.$fieldRoot = $rootValue)
                    AND (sp.$fieldId = st.$fieldId) 
                GROUP BY n.$fieldId ";
                
        if ($children) {
            $sql .= " HAVING depth <= 1 ";
        }

        $sql .= " ORDER BY n.$fieldLeft ";

        return $this->_createResult($sql, $params);
    }

    public function getChildren($params = array()) {
        return $this->getDescendants($params, true);
    }

    public function getSiblings($params = array()) {
        $parent = $this->getParent();
        if ($parent) {
            $params = array();
            $column = $this->getParamId();
            $params[$column] = array('<>', $this->getIdValue());
            return $parent->getChildren($params);
        }
        return false;
    }

    public function getPrevious() {
        $params = array();
        $column = $this->getParamRight();
        $params[$column] = $this->getLeftValue() - 1;
        return $this->findNode(self::_findRoot($this), $params);
    }

    public function getNext() {
        $params = array();
        $column = $this->getParamLeft();
        $params[$column] = $this->getRightValue() + 1;
        return $this->findNode(self::_findRoot($this), $params);
    }

    public function addMessage($message) {
        $this->appendMessage(new Message($message));
    }

    /**
     * Refresh node (re-quering)
     *
     * @return [type] [description]
     */
    public function refreshNode() {
        if ( ! $this->isPhantom()) {

            $fieldId = $this->getParamId();
            $fieldRoot = $this->getParamRoot();

            $root = self::_findRoot($this);

            $params = array();
            $params[$fieldRoot] = $root->$fieldId;
            $params[$fieldId] = $this->$fieldId;
            
            $node = self::findNode($root, $params);
            $meta = $node->getModelsMetadata();

            foreach($node as $key => $val) {
                if ($meta->hasAttribute($node, $key) || in_array($key, array("depth", "path", "pid"))) {
                    $this->$key = $val; 
                }
            }
        }

        return $this;
    }

    public function nodify($excludeRoot = true) {
        if ( ! isset($this->path) || empty($this->path)) {
            
            $fieldId = $this->getParamId();
            $fieldRoot = $this->getParamRoot();

            $root = new \stdClass();
            $root->$fieldId = $this->$fieldRoot;

            $params = array();
            $params[$fieldId] = $this->getIdValue();

            $node = $this->findNode($root, $params);

            foreach($node as $key => $val) {
                $this->$key = $val;
            }
        }
        return $this;
    }

    public function compileTemplate($template) {
        $node = $this;
        $compiled = preg_replace_callback(
            '/\{(\w+)\}/', 
            function($matches) use ($node) {
                $field = $matches[1];
                return $node->$field;
            }, 
            $template
        );
        return $compiled;
    }

    public static function findRoots($params = array(), $autoCreate = true) {
        $base = self::_getInstance();

        $params = empty($params) ? array() : $params;
        $params[$base->getParamLevel()] = 0;

        $roots = self::find(self::params($params));
        $rootss = array();
        foreach($roots as $k => $root) {
            if ($root) {
                $root->depth = 0;
                $root->path = $root->getIdValue();
            } else {
                if ($autoCreate) {
                    $root = new static();    
                    if ( ! $root->createRoot($params)) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            $rootss[] = $root->toArray();
        }
        return $rootss;
    }

    public static function findRoot($params = array(), $autoCreate = true) {
        $base = self::_getInstance();
        $params[$base->getParamLevel()] = 0;
        $root = self::findFirst(self::params($params));
        
        if ($root) {
            $root->depth = 0;
            $root->path = $root->getIdValue();
        } else {
            if ($autoCreate) {
                $root = new static();   
                if ( ! $root->createRoot($params)) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return $root;
    }

    public static function findNodes($root, $params = array(), $excludeRoot = true) {
        $qry = self::_createQuery($root, $excludeRoot);
        $sql = "$qry->select $qry->where $qry->group $qry->order";
        return self::_createResult($sql, $params);
    }

    public static function findNodesIn($ids) {
        $base = self::_getInstance();
        $link = $base->getReadConnection();
        $fieldId = $base->getParamId();
        $fieldRoot = $base->getParamRoot();

        // how to find root? sampling
        $sample = self::_findFirst($ids[0], $fieldRoot);
        
        if ($sample) {
            $root = new \stdClass();
            $root->$fieldId = $sample[$fieldRoot];

            $qry = self::_createQuery($root);

            $sql  = "$qry->select $qry->where ";
            $sql .= " AND n.$fieldId IN (".implode(",", $ids).") ";
            $sql .= "$qry->group $qry->order";

            return new Resultset(NULL, $base, $link->query($sql));
        }

        return new Resultset(null, $base, []);
    }

    public static function findNode($root, $params = array()) {
        $base = self::_getInstance();
        $link = $base->getReadConnection();
        $var  = self::_createParams($params);
        $qry  = self::_createQuery($root, false);

        $sql  = "$qry->select $qry->where ";

        if ( ! empty($var['conditions'])) {
            $sql .= " AND ".$var['conditions']." ";
        }
            
        $sql .= "$qry->group $qry->order LIMIT 0, 1";

        $nodes = new Resultset(NULL, $base, $link->query($sql, $var['bind']));
        return $nodes->getFirst();
    }

    public static function findNodeById($id) {
        $base = self::_getInstance();
        $fieldId = $base->getParamId();
        $fieldRoot = $base->getParamRoot();

        // how to find his root?
        $model = self::_findFirst($id, $fieldRoot);

        if ($model) {
            $root = new \stdClass();
            $root->$fieldId = $model[$fieldRoot];

            $params = array();
            $params[$fieldId] = $id;
            return self::findNode($root, $params);
        }
        return NULL;
    }

    public static function findTree(Model $root) {
        return new QueryNode($root);
    }

    /**
     * Compat 'findTree'
     */
    public static function fetchTree(Model $root) {
        return self::findTree($root);
    }

    public static function findInvalidNodes(Model $root) {
        $base = self::_getInstance();

        $table     = $base->getSource();
        $fieldId   = $base->getParamId();
        $fieldLeft = $base->getParamLeft();
        $fieldRoot = $base->getParamRoot();

        $rootValue = $root->$fieldId;

        $sqlInner = "SELECT MAX($fieldId) AS max_id, $fieldLeft
                     FROM $table
                     WHERE $fieldRoot = $rootValue
                     GROUP BY $fieldLeft";

        $sqlOuter = "SELECT a.* 
                     FROM $table a 
                     LEFT JOIN ($sqlInner) b ON (a.$fieldId = b.max_id AND a.$fieldLeft = b.$fieldLeft) 
                     WHERE a.$fieldRoot = $rootValue AND b.max_id IS NULL";

        return self::_createResult($sqlOuter);
    }

    public static function relocateInvalidNodes(Model $root, $callback = null) {

        $invalid  = self::findInvalidNodes($root);
        $affected = 0;

        if ($invalid->count() > 0) {
            $fieldLeft  = $root->getParamLeft();
            $fieldRight = $root->getParamRight();

            foreach($invalid as $node) {

                $node->delete();

                $raw = $node->toArray();
                unset($raw[$fieldLeft], $raw[$fieldRight]);

                $new = new static();

                foreach($raw as $key => $val) {
                    $new->$key = $val;
                }

                if ($new->prependTo($root)) {
                    $affected++;

                    if (is_callable($callback)) {
                        call_user_func_array($callback, array($new));
                    }
                    
                }

            }

        }

        return $affected;
    }
    
    public static function makeTree(Resultset $nodes) {
        $tree = array();
        $size = 0;

        if ($nodes->count() > 0) {
            
            $stack = array();
            
            foreach($nodes as $node) {
                $item = $node->toArray();
                $item['children'] = array();

                $size = count($stack);

                while($size > 0 AND $stack[$size - 1]['depth'] >= $item['depth']) {
                    array_pop($stack);
                    $size--;
                }

                if ($node->isLeaf()) {
                    unset($item['children']);
                }

                if ($size == 0) {
                    $n = count($tree);
                    $tree[$n] = $item;
                    $stack[] =& $tree[$n];
                } else {
                    $n = count($stack[$size - 1]['children']);
                    $stack[$size - 1]['children'][$n] = $item;
                    $stack[] =& $stack[$size - 1]['children'][$n];
                }

            }

        }
        return $tree;
    }

    public static function plotTree(Resultset $nodes, $template = null) {
        $list = '';

        if (empty($template)) {
            $base = self::_getInstance();
            $template = '<span>Node - {' . $base->getParamId() . '}</span>';
        }

        if ($nodes->count() > 0) {

            $first = $nodes->getFirst();
            $currDepth = $first->getDepthValue();
            $delta = $currDepth - 0;

            $counter = 0;
            $list = '<ul>';

            foreach($nodes as $node) {
                $nodeDepth = $node->depth;

                if ($nodeDepth == $currDepth) {
                    if ($counter > 0) {
                        $list .= '</li>';
                    }
                } else if ($nodeDepth > $currDepth) {
                    $list .= '<ul>';
                    $currDepth = $currDepth + ($nodeDepth - $currDepth);
                } else if ($nodeDepth < $currDepth) {
                    $list .= str_repeat('</li></ul>', $currDepth - $nodeDepth) . '</li>';
                    $currDepth = $currDepth - ($currDepth - $nodeDepth);
                }

                $content = '';

                if (is_callable($template)) {
                    $content = call_user_func_array($template, array($node));
                } else {
                    $content = $node->compileTemplate($template);
                }

                $list .= '<li>' . $content;
                ++$counter;
            }
            $list .= str_repeat('</li></ul>', $nodeDepth - $delta).'</li>';
            $list .= '</ul>';
        }

        return $list;
    }

}

/** Add */
/*
-- moves a subtree before the specified position
-- if the position is the rgt of a node, the subtree will be its last child
-- if the position is the lft of a node, the subtree will be inserted before
-- @param l the lft of the subtree to move
-- @param r the rgt of the subtree to move
-- @param p the position to move the subtree before
update tree
set
    lft = lft + if (:p > :r,
        if (:r < lft and lft < :p,
            :l - :r - 1,
            if (:l <= lft and lft < :r,
                :p - :r - 1,
                0
            )
        ),
        if (:p <= lft and lft < :l,
            :r - :l + 1,
            if (:l <= lft and lft < :r,
                :p - :l,
                0
            )
        )
    ),
    rgt = rgt + if (:p > :r,
        if (:r < rgt and rgt < :p,
            :l - :r - 1,
            if (:l < rgt and rgt <= :r,
                :p - :r - 1,
                0
            )
        ),
        if (:p <= rgt and rgt < :l,
            :r - :l + 1,
            if (:l < rgt and rgt <= :r,
                :p - :l,
                0
            )
        )
    )
where :r < :p or :p < :l;

-- swaps two subtrees, where A is the subtree having the lower lgt/rgt values
-- and B is the subtree having the higher ones
-- @param al the lft of subtree A
-- @param ar the rgt of subtree A, must be lower than bl
-- @param bl the lft of subtree B, must be higher than ar
-- @param br the rgt of subtree B
update tree
set
    lft = lft + @offset := if (lft > :ar and rgt < :bl,
        :br - :bl - :ar + :al,
        if (lft < :bl, :br - :ar, :al - :bl)
    ),
    rgt = rgt + @offset
where lft >= :al and lft <= :br and :ar < :bl;

*/
