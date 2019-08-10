/**
 * @name JSON Editor
 * @description JSON Schema Based Editor
 * This library is the continuation of jdorn's great work (see also https://github.com/jdorn/json-editor/issues/800)
 * @version {{ VERSION }}
 * @author Jeremy Dorn
 * @see https://github.com/jdorn/json-editor/
 * @see https://github.com/json-editor/json-editor
 * @license MIT
 * @example see README.md and docs/ for requirements, examples and usage info
 */

;(function (global, factory) {
	"use strict";
	var JSONEditor = factory(global);
	if (typeof module === "object" && module != null && module.exports) {
		module.exports = JSONEditor;
	} else if (typeof define === "function" && define.amd) {
		define(function () { return JSONEditor; });
	} else {
		global.JSONEditor = JSONEditor;
	}
})(typeof window !== "undefined" ? window : this, function (global, undefined) {

/*jshint loopfunc: true */
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
var Class;
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){window.postMessage("xyz");}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function extend(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = extend;
   
    return Class;
  };
  
  return Class;
})();

// CustomEvent constructor polyfill
// From MDN
(function () {
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || 
                                      window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// Array.isArray polyfill
// From MDN
(function() {
	if(!Array.isArray) {
	  Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	  };
	}
}());
/**
 * Taken from jQuery 2.1.3
 *
 * @param obj
 * @returns {boolean}
 */
var $isplainobject = function( obj ) {
  // Not plain objects:
  // - Any object or value whose internal [[Class]] property is not "[object Object]"
  // - DOM nodes
  // - window
  if (typeof obj !== "object" || obj.nodeType || (obj !== null && obj === obj.window)) {
    return false;
  }

  if (obj.constructor && !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
    return false;
  }

  // If the function hasn't returned already, we're confident that
  // |obj| is a plain object, created by {} or constructed with new Object
  return true;
};

var $extend = function(destination) {
  var source, i,property;
  for(i=1; i<arguments.length; i++) {
    source = arguments[i];
    for (property in source) {
      if(!source.hasOwnProperty(property)) continue;
      if(source[property] && $isplainobject(source[property])) {
        if(!destination.hasOwnProperty(property)) destination[property] = {};
        $extend(destination[property], source[property]);
      }
      else {
        destination[property] = source[property];
      }
    }
  }
  return destination;
};

var $each = function(obj,callback) {
  if(!obj || typeof obj !== "object") return;
  var i;
  if(Array.isArray(obj) || (typeof obj.length === 'number' && obj.length > 0 && (obj.length - 1) in obj)) {
    for(i=0; i<obj.length; i++) {
      if(callback(i,obj[i])===false) return;
    }
  }
  else {
    if (Object.keys) {
      var keys = Object.keys(obj);
      for(i=0; i<keys.length; i++) {
        if(callback(keys[i],obj[keys[i]])===false) return;
      }
    }
    else {
      for(i in obj) {
        if(!obj.hasOwnProperty(i)) continue;
        if(callback(i,obj[i])===false) return;
      }
    }
  }
};

var $trigger = function(el,event) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(event, true, true);
  el.dispatchEvent(e);
};
var $triggerc = function(el,event) {
  var e = new CustomEvent(event,{
    bubbles: true,
    cancelable: true
  });

  el.dispatchEvent(e);
};

var JSONEditor = function(element,options) {
  if (!(element instanceof Element)) {
    throw new Error('element should be an instance of Element');
  }
  options = $extend({},JSONEditor.defaults.options,options||{});
  this.element = element;
  this.options = options;
  this.init();
};
JSONEditor.prototype = {
  // necessary since we remove the ctor property by doing a literal assignment. Without this
  // the $isplainobject function will think that this is a plain object.
  constructor: JSONEditor,
  init: function() {
    var self = this;

    this.ready = false;
    this.copyClipboard = null;
    // full references info
    this.refs_with_info = {};
    this.refs_prefix = "#/counter/";
    this.refs_counter = 1;

    var theme_name = this.options.theme || JSONEditor.defaults.theme;
    var theme_class = JSONEditor.defaults.themes[theme_name];
    if(!theme_class) throw "Unknown theme " + theme_name;

    this.schema = this.options.schema;
    this.theme = new theme_class();

    this.element.setAttribute('data-theme', theme_name);
    if (!this.theme.options.disable_theme_rules) this.addNewStyleRules(theme_name, this.theme.rules);

    this.template = this.options.template;
    this.refs = this.options.refs || {};
    this.uuid = 0;
    this.__data = {};
    
    var icon_class = JSONEditor.defaults.iconlibs[this.options.iconlib || JSONEditor.defaults.iconlib];
    if(icon_class) this.iconlib = new icon_class();

    this.root_container = this.theme.getContainer();

    this.element.appendChild(this.root_container);
    
    this.translate = this.options.translate || JSONEditor.defaults.translate;

    // Fetch all external refs via ajax
    var fetchUrl = document.location.toString();
    var fileBase = this._getFileBase();
    this._loadExternalRefs(this.schema, function() {
      self._getDefinitions(self.schema, fetchUrl + '#/definitions/');
      
      // Validator options
      var validator_options = {};
      if(self.options.custom_validators) {
        validator_options.custom_validators = self.options.custom_validators;
      }
      self.validator = new JSONEditor.Validator(self,null,validator_options);
      
      // Create the root editor
      var schema = self.expandRefs(self.schema);
      var editor_class = self.getEditorClass(schema);
      self.root = self.createEditor(editor_class, {
        jsoneditor: self,
        schema: schema,
        required: true,
        container: self.root_container
      });
      
      self.root.preBuild();
      self.root.build();
      self.root.postBuild();

      // Starting data
      if(self.options.hasOwnProperty('startval')) self.root.setValue(self.options.startval);

      self.validation_results = self.validator.validate(self.root.getValue());
      self.root.showValidationErrors(self.validation_results);
      self.ready = true;

      // Fire ready event asynchronously
      window.requestAnimationFrame(function() {
        if(!self.ready) return;
        self.validation_results = self.validator.validate(self.root.getValue());
        self.root.showValidationErrors(self.validation_results);
        self.trigger('ready');
        self.trigger('change');
      });
    }, fetchUrl, fileBase);
  },
  getValue: function() {
    if(!this.ready) throw "JSON Editor not ready yet.  Listen for 'ready' event before getting the value";

    return this.root.getValue();
  },
  setValue: function(value) {
    if(!this.ready) throw "JSON Editor not ready yet.  Listen for 'ready' event before setting the value";

    this.root.setValue(value);
    return this;
  },
  validate: function(value) {
    if(!this.ready) throw "JSON Editor not ready yet.  Listen for 'ready' event before validating";
    
    // Custom value
    if(arguments.length === 1) {
      return this.validator.validate(value);
    }
    // Current value (use cached result)
    else {
      return this.validation_results;
    }
  },
  destroy: function() {
    if(this.destroyed) return;
    if(!this.ready) return;
    
    this.schema = null;
    this.options = null;
    this.root.destroy();
    this.root = null;
    this.root_container = null;
    this.validator = null;
    this.validation_results = null;
    this.theme = null;
    this.iconlib = null;
    this.template = null;
    this.__data = null;
    this.ready = false;
    this.element.innerHTML = '';
    this.element.removeAttribute('data-theme');
        
    this.destroyed = true;
  },
  on: function(event, callback) {
    this.callbacks = this.callbacks || {};
    this.callbacks[event] = this.callbacks[event] || [];
    this.callbacks[event].push(callback);
    
    return this;
  },
  off: function(event, callback) {
    // Specific callback
    if(event && callback) {
      this.callbacks = this.callbacks || {};
      this.callbacks[event] = this.callbacks[event] || [];
      var newcallbacks = [];
      for(var i=0; i<this.callbacks[event].length; i++) {
        if(this.callbacks[event][i]===callback) continue;
        newcallbacks.push(this.callbacks[event][i]);
      }
      this.callbacks[event] = newcallbacks;
    }
    // All callbacks for a specific event
    else if(event) {
      this.callbacks = this.callbacks || {};
      this.callbacks[event] = [];
    }
    // All callbacks for all events
    else {
      this.callbacks = {};
    }
    
    return this;
  },
  trigger: function(event, editor) {
    if(this.callbacks && this.callbacks[event] && this.callbacks[event].length) {
      for(var i=0; i<this.callbacks[event].length; i++) {
        this.callbacks[event][i].apply(this, [editor]);
      }
    }
    
    return this;
  },
  setOption: function(option, value) {
    if(option === "show_errors") {
      this.options.show_errors = value;
      this.onChange();
    }
    // Only the `show_errors` option is supported for now
    else {
      throw "Option "+option+" must be set during instantiation and cannot be changed later";
    }
    
    return this;
  },
  getEditorClass: function(schema) {
    var classname;

    schema = this.expandSchema(schema);

    $each(JSONEditor.defaults.resolvers,function(i,resolver) {
      var tmp = resolver(schema);
      if(tmp) {
        if(JSONEditor.defaults.editors[tmp]) {
          classname = tmp;
          return false;
        }
      }
    });

    if(!classname) throw "Unknown editor for schema "+JSON.stringify(schema);
    if(!JSONEditor.defaults.editors[classname]) throw "Unknown editor "+classname;

    return JSONEditor.defaults.editors[classname];
  },
  createEditor: function(editor_class, options) {
    options = $extend({},editor_class.options||{},options);
    return new editor_class(options);
  },
  onChange: function() {
    if(!this.ready) return;
    
    if(this.firing_change) return;
    this.firing_change = true;
    
    var self = this;
    
    window.requestAnimationFrame(function() {
      self.firing_change = false;
      if(!self.ready) return;

      // Validate and cache results
      self.validation_results = self.validator.validate(self.root.getValue());
      
      if(self.options.show_errors !== "never") {
        self.root.showValidationErrors(self.validation_results);
      }
      else {
        self.root.showValidationErrors([]);
      }
      
      // Fire change event
      self.trigger('change');
    });
    
    return this;
  },
  compileTemplate: function(template, name) {
    name = name || JSONEditor.defaults.template;

    var engine;

    // Specifying a preset engine
    if(typeof name === 'string') {
      if(!JSONEditor.defaults.templates[name]) throw "Unknown template engine "+name;
      engine = JSONEditor.defaults.templates[name]();

      if(!engine) throw "Template engine "+name+" missing required library.";
    }
    // Specifying a custom engine
    else {
      engine = name;
    }

    if(!engine) throw "No template engine set";
    if(!engine.compile) throw "Invalid template engine set";

    return engine.compile(template);
  },
  _data: function(el,key,value) {
    // Setting data
    if(arguments.length === 3) {
      var uuid;
      if(el.hasAttribute('data-jsoneditor-'+key)) {
        uuid = el.getAttribute('data-jsoneditor-'+key);
      }
      else {
        uuid = this.uuid++;
        el.setAttribute('data-jsoneditor-'+key,uuid);
      }

      this.__data[uuid] = value;
    }
    // Getting data
    else {
      // No data stored
      if(!el.hasAttribute('data-jsoneditor-'+key)) return null;
      
      return this.__data[el.getAttribute('data-jsoneditor-'+key)];
    }
  },
  registerEditor: function(editor) {
    this.editors = this.editors || {};
    this.editors[editor.path] = editor;
    return this;
  },
  unregisterEditor: function(editor) {
    this.editors = this.editors || {};
    this.editors[editor.path] = null;
    return this;
  },
  getEditor: function(path) {
    if(!this.editors) return;
    return this.editors[path];
  },
  watch: function(path,callback) {
    this.watchlist = this.watchlist || {};
    this.watchlist[path] = this.watchlist[path] || [];
    this.watchlist[path].push(callback);
    
    return this;
  },
  unwatch: function(path,callback) {
    if(!this.watchlist || !this.watchlist[path]) return this;
    // If removing all callbacks for a path
    if(!callback) {
      this.watchlist[path] = null;
      return this;
    }
    
    var newlist = [];
    for(var i=0; i<this.watchlist[path].length; i++) {
      if(this.watchlist[path][i] === callback) continue;
      else newlist.push(this.watchlist[path][i]);
    }
    this.watchlist[path] = newlist.length? newlist : null;
    return this;
  },
  notifyWatchers: function(path) {
    if(!this.watchlist || !this.watchlist[path]) return this;
    for(var i=0; i<this.watchlist[path].length; i++) {
      this.watchlist[path][i]();
    }
  },
  isEnabled: function() {
    return !this.root || this.root.isEnabled();
  },
  enable: function() {
    this.root.enable();
  },
  disable: function() {
    this.root.disable();
  },
  _getDefinitions: function(schema,path) {
    if(schema.definitions) {
      for(var i in schema.definitions) {
        if(!schema.definitions.hasOwnProperty(i)) continue;
        this.refs[path+i] = schema.definitions[i];
        if(schema.definitions[i].definitions) {
          this._getDefinitions(schema.definitions[i],path+i+'/definitions/');
        }
      }
    }
  },
  _getExternalRefs: function(schema, fetchUrl) {
    var refs = {};
    var merge_refs = function(newrefs) {
      for(var i in newrefs) {
        if(newrefs.hasOwnProperty(i)) {
          refs[i] = true;
        }
      }
    };
    
    if(schema.$ref && typeof schema.$ref !== "object") {
      var ref_counter = this.refs_prefix + this.refs_counter++;
      if(schema.$ref.substr(0,1) !== "#" && !this.refs[schema.$ref]) {
        refs[schema.$ref] = true;
      }
      this.refs_with_info[ref_counter] = { fetchUrl: fetchUrl, "$ref": schema.$ref };
      schema.$ref = ref_counter;
    }
    
    for(var i in schema) {
      if(!schema.hasOwnProperty(i)) continue;
      if (!schema[i] || typeof schema[i] !== "object") continue;
      if(Array.isArray(schema[i])) {
        for(var j=0; j<schema[i].length; j++) {
          if(schema[i][j] && typeof schema[i][j]==="object") {
            merge_refs(this._getExternalRefs(schema[i][j], fetchUrl));
          }
        }
      }
      else {
        merge_refs(this._getExternalRefs(schema[i], fetchUrl));
      }
    }
    return refs;
  },
  _getFileBase: function() {
    var fileBase = this.options.ajaxBase;
    if (typeof fileBase === 'undefined') {
      fileBase = this._getFileBaseFromFileLocation(document.location.toString());
    }
    return fileBase;
  },
  _getFileBaseFromFileLocation: function(fileLocationString) {
    var pathItems = fileLocationString.split("/");
    pathItems.pop();
    return pathItems.join("/")+"/";
  },
  _loadExternalRefs: function(schema, callback, fetchUrl, fileBase) {
    var self = this;
    var refs = this._getExternalRefs(schema, fetchUrl);
    var done = 0, waiting = 0, callback_fired = false;

    $each(refs,function(url) {
      if(self.refs[url]) return;
      if(!self.options.ajax) throw "Must set ajax option to true to load external ref "+url;
      self.refs[url] = 'loading';
      waiting++;

      var fetchUrl=url;
      if( fileBase!=url.substr(0,fileBase.length) && "http"!=url.substr(0,4) && "/"!=url.substr(0,1)) fetchUrl=fileBase+url;

      var r = new XMLHttpRequest();
      r.overrideMimeType('application/json');
      r.open("GET", fetchUrl, true);
      if(self.options.ajaxCredentials) r.withCredentials=self.options.ajaxCredentials;
      r.onreadystatechange = function () {
        if (r.readyState != 4) return;
        // Request succeeded
        if(r.status === 200) {
          var response;
          try {
            response = JSON.parse(r.responseText);
          }
          catch(e) {
            window.console.log(e);
            throw "Failed to parse external ref "+fetchUrl;
          }
          if (!(typeof response === "boolean" || typeof response === "object") || response === null || Array.isArray(response)) throw "External ref does not contain a valid schema - "+fetchUrl;  

          self.refs[url] = response;
          var fileBase = self._getFileBaseFromFileLocation(fetchUrl);
          self._getDefinitions(response, fetchUrl + "#/definitions/");
          self._loadExternalRefs(response,function() {
            done++;
            if(done >= waiting && !callback_fired) {
              callback_fired = true;
              callback();
            }
          }, fetchUrl, fileBase);
        }
        // Request failed
        else {
          window.console.log(r);
          throw "Failed to fetch ref via ajax- "+url;
        }
      };
      r.send();
    });
    
    if(!waiting) {
      callback();
    }
  },
  expandRefs: function(schema, recurseAllOf) {
    schema = $extend({},schema);
    
    while (schema.$ref) {
      var refObj = this.refs_with_info[schema.$ref];
      delete schema.$ref;
      var fetchUrl = "";
      if (refObj.$ref.startsWith("#")) {
        fetchUrl = refObj.fetchUrl;
      }
      var ref = fetchUrl + refObj.$ref;
      if(!this.refs[ref]) ref = fetchUrl + decodeURIComponent(refObj.$ref);
      if( recurseAllOf )
      {
        if( this.refs[ref].hasOwnProperty("allOf"))
        {
          var allOf = this.refs[ref].allOf;
          for(var i = 0; i<allOf.length; i++)
          {
            allOf[i]=this.expandRefs(allOf[i], true);
          }
        }
      }
      schema = this.extendSchemas(schema, $extend({},this.refs[ref]));
    }
    return schema;
  },
  expandSchema: function(schema, fileBase) {
    var self = this;
    var extended = $extend({},schema);
    var i;

    // Version 3 `type`
    if(typeof schema.type === 'object') {
      // Array of types
      if(Array.isArray(schema.type)) {
        $each(schema.type, function(key,value) {
          // Schema
          if(typeof value === 'object') {
            schema.type[key] = self.expandSchema(value);
          }
        });
      }
      // Schema
      else {
        schema.type = self.expandSchema(schema.type);
      }
    }
    // Version 3 `disallow`
    if(typeof schema.disallow === 'object') {
      // Array of types
      if(Array.isArray(schema.disallow)) {
        $each(schema.disallow, function(key,value) {
          // Schema
          if(typeof value === 'object') {
            schema.disallow[key] = self.expandSchema(value);
          }
        });
      }
      // Schema
      else {
        schema.disallow = self.expandSchema(schema.disallow);
      }
    }
    // Version 4 `anyOf`
    if(schema.anyOf) {
      $each(schema.anyOf, function(key,value) {
        schema.anyOf[key] = self.expandSchema(value);
      });
    }
    // Version 4 `dependencies` (schema dependencies)
    if(schema.dependencies) {
      $each(schema.dependencies,function(key,value) {
        if(typeof value === "object" && !(Array.isArray(value))) {
          schema.dependencies[key] = self.expandSchema(value);
        }
      });
    }
    // Version 4 `not`
    if(schema.not) {
      schema.not = this.expandSchema(schema.not);
    }
    
    // allOf schemas should be merged into the parent
    if(schema.allOf) {
      for(i=0; i<schema.allOf.length; i++) {
        schema.allOf[i] = this.expandRefs(schema.allOf[i], true);
        extended = this.extendSchemas(extended,this.expandSchema(schema.allOf[i]));
      }
      delete extended.allOf;
    }
    // extends schemas should be merged into parent
    if(schema["extends"]) {
      // If extends is a schema
      if(!(Array.isArray(schema["extends"]))) {
        extended = this.extendSchemas(extended,this.expandSchema(schema["extends"]));
      }
      // If extends is an array of schemas
      else {
        for(i=0; i<schema["extends"].length; i++) {
          extended = this.extendSchemas(extended,this.expandSchema(schema["extends"][i]));
        }
      }
      delete extended["extends"];
    }
    // parent should be merged into oneOf schemas
    if(schema.oneOf) {
      var tmp = $extend({},extended);
      delete tmp.oneOf;
      for(i=0; i<schema.oneOf.length; i++) {
        extended.oneOf[i] = this.extendSchemas(this.expandSchema(schema.oneOf[i]),tmp);
      }
    }
    
    return this.expandRefs(extended);
  },
  extendSchemas: function(obj1, obj2) {
    obj1 = $extend({},obj1);
    obj2 = $extend({},obj2);

    var self = this;
    var extended = {};
    $each(obj1, function(prop,val) {
      // If this key is also defined in obj2, merge them
      if(typeof obj2[prop] !== "undefined") {
        // Required and defaultProperties arrays should be unioned together
        if((prop === 'required'||prop === 'defaultProperties') && typeof val === "object" && Array.isArray(val)) {
          // Union arrays and unique
          extended[prop] = val.concat(obj2[prop]).reduce(function(p, c) {
            if (p.indexOf(c) < 0) p.push(c);
            return p;
          }, []);
        }
        // Type should be intersected and is either an array or string
        else if(prop === 'type' && (typeof val === "string" || Array.isArray(val))) {
          // Make sure we're dealing with arrays
          if(typeof val === "string") val = [val];
          if(typeof obj2.type === "string") obj2.type = [obj2.type];

          // If type is only defined in the first schema, keep it
          if(!obj2.type || !obj2.type.length) {
            extended.type = val;
          }
          // If type is defined in both schemas, do an intersect
          else {
            extended.type = val.filter(function(n) {
              return obj2.type.indexOf(n) !== -1;
            });
          }

          // If there's only 1 type and it's a primitive, use a string instead of array
          if(extended.type.length === 1 && typeof extended.type[0] === "string") {
            extended.type = extended.type[0];
          }
          // Remove the type property if it's empty
          else if(extended.type.length === 0) {
            delete extended.type;
          }
        }
        // All other arrays should be intersected (enum, etc.)
        else if(typeof val === "object" && Array.isArray(val)){
          extended[prop] = val.filter(function(n) {
            return obj2[prop].indexOf(n) !== -1;
          });
        }
        // Objects should be recursively merged
        else if(typeof val === "object" && val !== null) {
          extended[prop] = self.extendSchemas(val,obj2[prop]);
        }
        // Otherwise, use the first value
        else {
          extended[prop] = val;
        }
      }
      // Otherwise, just use the one in obj1
      else {
        extended[prop] = val;
      }
    });
    // Properties in obj2 that aren't in obj1
    $each(obj2, function(prop,val) {
      if(typeof obj1[prop] === "undefined") {
        extended[prop] = val;
      }
    });

    return extended;
  },
  setCopyClipboardContents: function(value) {
    this.copyClipboard = value;
  },
  getCopyClipboardContents: function() {
    return this.copyClipboard;
  },
  addNewStyleRules: function(themeName, rules) {
    var styleTag = document.querySelector('#theme-' + themeName);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.setAttribute('id', 'theme-' + themeName);
      styleTag.appendChild(document.createTextNode(''));
      document.head.appendChild(styleTag);
    }

    var sheet = styleTag.sheet ? styleTag.sheet : styleTag.styleSheet;
    var qualifier = this.element.nodeName.toLowerCase();

    for (var selector in rules) {
      if (!rules.hasOwnProperty(selector)) continue;
      var sel = qualifier + '[data-theme="' + themeName + '"] ' + selector;
      // all browsers, except IE before version 9
      if (sheet.insertRule) sheet.insertRule(sel + ' {' + rules[selector] + '}', 0);
      // Internet Explorer before version 9
      else if (sheet.addRule) sheet.addRule(sel, rules[selector], 0);
    }
  }
};

JSONEditor.defaults = {
  themes: {},
  templates: {},
  iconlibs: {},
  editors: {},
  languages: {},
  resolvers: [],
  custom_validators: []
};

// Implements ipv4 and ipv6 format validations as perhttps://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-7.3.4
var ipValidator = {
    validate:function(schema, value, path) {
       var errors = [];
       if(schema.format==="ipv4") 
       {
         try
         {
           var parts=value.split('.');
           if( parts.length !==4)
           {
             throw(Error());
           }
           parts.forEach(function(part){
             if( isNaN(+part) || +part < 0 || +part>255)
             {
               throw(Error());
             }
           });
         }
         catch(err)
         {
           errors.push({
             path: path,
             property: 'format',
             message: 'ipv4 addresses must be in the form of 4 numbers between 0 and 255, separated by dots'
           });
         }
       }
       else if(schema.format==="ipv6")
       {
         if( !(/^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}/).test(value))
         {
          errors.push({
            path: path,
            property: 'format',
            message: 'ipv6 addresses must be in the form of 4 numbers between 0 and 255, separated by dots'
          });  
         }
       }
  
       return errors;
     }
   };
   
   // Export ipValidator to allow it to be 'required()' by unit tests
   if( typeof(exports) !== 'undefined')
   {
    /* jshint undef: false */   
     exports.ipValidator = ipValidator;
   }
   
   
  
JSONEditor.Validator = Class.extend({
  init: function(jsoneditor,schema,options) {
    this.jsoneditor = jsoneditor;
    this.schema = schema || this.jsoneditor.schema;
    this.options = options || {};
    this.translate = this.jsoneditor.translate || JSONEditor.defaults.translate;
  },
  fitTest: function(value) {
    var matchedProperties = 0;
    var extraProperties = 0;
    if (typeof value === "object" && value !== null) {
      // Work on a copy of the schema
      var schema = $extend({},this.jsoneditor.expandRefs(this.schema));
      for (var i in schema.properties) {
        if (!schema.properties.hasOwnProperty(i)) {
          extraProperties++;
          continue;
        }
        if (typeof value[i] !== "undefined") {
          matchedProperties++;
        }
      }
    }
    return {match: matchedProperties, extra: extraProperties};
  },
  validate: function(value) {
    return this._validateSchema(this.schema, value);
  },
  _validateSchema: function(schema,value,path) {
    var self = this;
    var errors = [];
    var valid, i, j;
    var stringified = JSON.stringify(value);

    path = path || 'root';

    // Work on a copy of the schema
    schema = $extend({},this.jsoneditor.expandRefs(schema));

    /*
     * Type Agnostic Validation
     */

    // Version 3 `required` and `required_by_default`
    if(typeof value === "undefined") {
      if((typeof schema.required !== "undefined" && schema.required === true) || (typeof schema.required === "undefined" && this.jsoneditor.options.required_by_default === true)) {
        errors.push({
          path: path,
          property: 'required',
          message: this.translate("error_notset")
        });
      }

      return errors;
    }

    // `enum`
    if(schema["enum"]) {
      valid = false;
      for(i=0; i<schema["enum"].length; i++) {
        if(stringified === JSON.stringify(schema["enum"][i])) valid = true;
      }
      if(!valid) {
        errors.push({
          path: path,
          property: 'enum',
          message: this.translate("error_enum")
        });
      }
    }

    // `extends` (version 3)
    if(schema["extends"]) {
      for(i=0; i<schema["extends"].length; i++) {
        errors = errors.concat(this._validateSchema(schema["extends"][i],value,path));
      }
    }

    // `allOf`
    if(schema.allOf) {
      for(i=0; i<schema.allOf.length; i++) {
        errors = errors.concat(this._validateSchema(schema.allOf[i],value,path));
      }
    }

    // `anyOf`
    if(schema.anyOf) {
      valid = false;
      for(i=0; i<schema.anyOf.length; i++) {
        if(!this._validateSchema(schema.anyOf[i],value,path).length) {
          valid = true;
          break;
        }
      }
      if(!valid) {
        errors.push({
          path: path,
          property: 'anyOf',
          message: this.translate('error_anyOf')
        });
      }
    }

    // `oneOf`
    if(schema.oneOf) {
      valid = 0;
      var oneof_errors = [];
      for(i=0; i<schema.oneOf.length; i++) {
        // Set the error paths to be path.oneOf[i].rest.of.path
        var tmp = this._validateSchema(schema.oneOf[i],value,path);
        if(!tmp.length) {
          valid++;
        }

        for(j=0; j<tmp.length; j++) {
          tmp[j].path = path+'.oneOf['+i+']'+tmp[j].path.substr(path.length);
        }
        oneof_errors = oneof_errors.concat(tmp);

      }
      if(valid !== 1) {
        errors.push({
          path: path,
          property: 'oneOf',
          message: this.translate('error_oneOf', [valid])
        });
        errors = errors.concat(oneof_errors);
      }
    }

    // `not`
    if(schema.not) {
      if(!this._validateSchema(schema.not,value,path).length) {
        errors.push({
          path: path,
          property: 'not',
          message: this.translate('error_not')
        });
      }
    }

    // `type` (both Version 3 and Version 4 support)
    if(schema.type) {
      // Union type
      if(Array.isArray(schema.type)) {
        valid = false;
        for(i=0;i<schema.type.length;i++) {
          if(this._checkType(schema.type[i], value)) {
            valid = true;
            break;
          }
        }
        if(!valid) {
          errors.push({
            path: path,
            property: 'type',
            message: this.translate('error_type_union')
          });
        }
      }
      // Simple type
      else {
        if(['date', 'time', 'datetime-local'].indexOf(schema.format) != -1 && schema.type == 'integer') {
          // Hack to get validator to validate as string even if value is integer
          // As validation of 'date', 'time', 'datetime-local' is done in separate validator
          if(!this._checkType('string', ""+value)) {
            errors.push({
              path: path,
              property: 'type',
              message: this.translate('error_type', [schema.format])
            });
          }
        }
        else if(!this._checkType(schema.type, value)) {
          errors.push({
            path: path,
            property: 'type',
            message: this.translate('error_type', [schema.type])
          });
        }
      }
    }


    // `disallow` (version 3)
    if(schema.disallow) {
      // Union type
      if(Array.isArray(schema.disallow)) {
        valid = true;
        for(i=0;i<schema.disallow.length;i++) {
          if(this._checkType(schema.disallow[i], value)) {
            valid = false;
            break;
          }
        }
        if(!valid) {
          errors.push({
            path: path,
            property: 'disallow',
            message: this.translate('error_disallow_union')
          });
        }
      }
      // Simple type
      else {
        if(this._checkType(schema.disallow, value)) {
          errors.push({
            path: path,
            property: 'disallow',
            message: this.translate('error_disallow', [schema.disallow])
          });
        }
      }
    }

    /*
     * Type Specific Validation
     */

    // Number Specific Validation
    if(typeof value === "number") {
      // `multipleOf` and `divisibleBy`
      if(schema.multipleOf || schema.divisibleBy) {
        var divisor = schema.multipleOf || schema.divisibleBy;
        // Vanilla JS, prone to floating point rounding errors (e.g. 1.14 / .01 == 113.99999)
        valid = (value/divisor === Math.floor(value/divisor));

        // Use math.js is available
        if(window.math) {
          valid = window.math.mod(window.math.bignumber(value), window.math.bignumber(divisor)).equals(0);
        }
        // Use decimal.js is available
        else if(window.Decimal) {
          valid = (new window.Decimal(value)).mod(new window.Decimal(divisor)).equals(0);
        }

        if(!valid) {
          errors.push({
            path: path,
            property: schema.multipleOf? 'multipleOf' : 'divisibleBy',
            message: this.translate('error_multipleOf', [divisor])
          });
        }
      }

      // `maximum`
      if(schema.hasOwnProperty('maximum')) {
        // Vanilla JS, prone to floating point rounding errors (e.g. .999999999999999 == 1)
        valid = schema.exclusiveMaximum? (value < schema.maximum) : (value <= schema.maximum);

        // Use math.js is available
        if(window.math) {
          valid = window.math[schema.exclusiveMaximum?'smaller':'smallerEq'](
            window.math.bignumber(value),
            window.math.bignumber(schema.maximum)
          );
        }
        // Use Decimal.js if available
        else if(window.Decimal) {
          valid = (new window.Decimal(value))[schema.exclusiveMaximum?'lt':'lte'](new window.Decimal(schema.maximum));
        }

        if(!valid) {
          errors.push({
            path: path,
            property: 'maximum',
            message: this.translate(
              (schema.exclusiveMaximum?'error_maximum_excl':'error_maximum_incl'),
              [schema.maximum]
            )
          });
        }
      }

      // `minimum`
      if(schema.hasOwnProperty('minimum')) {
        // Vanilla JS, prone to floating point rounding errors (e.g. .999999999999999 == 1)
        valid = schema.exclusiveMinimum? (value > schema.minimum) : (value >= schema.minimum);

        // Use math.js is available
        if(window.math) {
          valid = window.math[schema.exclusiveMinimum?'larger':'largerEq'](
            window.math.bignumber(value),
            window.math.bignumber(schema.minimum)
          );
        }
        // Use Decimal.js if available
        else if(window.Decimal) {
          valid = (new window.Decimal(value))[schema.exclusiveMinimum?'gt':'gte'](new window.Decimal(schema.minimum));
        }

        if(!valid) {
          errors.push({
            path: path,
            property: 'minimum',
            message: this.translate(
              (schema.exclusiveMinimum?'error_minimum_excl':'error_minimum_incl'),
              [schema.minimum]
            )
          });
        }
      }
    }
    // String specific validation
    else if(typeof value === "string") {
      // `maxLength`
      if(schema.maxLength) {
        if((value+"").length > schema.maxLength) {
          errors.push({
            path: path,
            property: 'maxLength',
            message: this.translate('error_maxLength', [schema.maxLength])
          });
        }
      }

      // `minLength`
      if(schema.minLength) {
        if((value+"").length < schema.minLength) {
          errors.push({
            path: path,
            property: 'minLength',
            message: this.translate((schema.minLength===1?'error_notempty':'error_minLength'), [schema.minLength])
          });
        }
      }

      // `pattern`
      if(schema.pattern) {
        if(!(new RegExp(schema.pattern)).test(value)) {
          errors.push({
            path: path,
            property: 'pattern',
            message: (schema.options && schema.options.patternmessage) ? schema.options.patternmessage : this.translate('error_pattern', [schema.pattern])
          });
        }
      }
    }
    // Array specific validation
    else if(typeof value === "object" && value !== null && Array.isArray(value)) {
      // `items` and `additionalItems`
      if(schema.items) {
        // `items` is an array
        if(Array.isArray(schema.items)) {
          for(i=0; i<value.length; i++) {
            // If this item has a specific schema tied to it
            // Validate against it
            if(schema.items[i]) {
              errors = errors.concat(this._validateSchema(schema.items[i],value[i],path+'.'+i));
            }
            // If all additional items are allowed
            else if(schema.additionalItems === true) {
              break;
            }
            // If additional items is a schema
            // TODO: Incompatibility between version 3 and 4 of the spec
            else if(schema.additionalItems) {
              errors = errors.concat(this._validateSchema(schema.additionalItems,value[i],path+'.'+i));
            }
            // If no additional items are allowed
            else if(schema.additionalItems === false) {
              errors.push({
                path: path,
                property: 'additionalItems',
                message: this.translate('error_additionalItems')
              });
              break;
            }
            // Default for `additionalItems` is an empty schema
            else {
              break;
            }
          }
        }
        // `items` is a schema
        else {
          // Each item in the array must validate against the schema
          for(i=0; i<value.length; i++) {
            errors = errors.concat(this._validateSchema(schema.items,value[i],path+'.'+i));
          }
        }
      }

      // `maxItems`
      if(schema.maxItems) {
        if(value.length > schema.maxItems) {
          errors.push({
            path: path,
            property: 'maxItems',
            message: this.translate('error_maxItems', [schema.maxItems])
          });
        }
      }

      // `minItems`
      if(schema.minItems) {
        if(value.length < schema.minItems) {
          errors.push({
            path: path,
            property: 'minItems',
            message: this.translate('error_minItems', [schema.minItems])
          });
        }
      }

      // `uniqueItems`
      if(schema.uniqueItems) {
        var seen = {};
        for(i=0; i<value.length; i++) {
          valid = JSON.stringify(value[i]);
          if(seen[valid]) {
            errors.push({
              path: path,
              property: 'uniqueItems',
              message: this.translate('error_uniqueItems')
            });
            break;
          }
          seen[valid] = true;
        }
      }
    }
    // Object specific validation
    else if(typeof value === "object" && value !== null) {
      // `maxProperties`
      if(schema.maxProperties) {
        valid = 0;
        for(i in value) {
          if(!value.hasOwnProperty(i)) continue;
          valid++;
        }
        if(valid > schema.maxProperties) {
          errors.push({
            path: path,
            property: 'maxProperties',
            message: this.translate('error_maxProperties', [schema.maxProperties])
          });
        }
      }

      // `minProperties`
      if(schema.minProperties) {
        valid = 0;
        for(i in value) {
          if(!value.hasOwnProperty(i)) continue;
          valid++;
        }
        if(valid < schema.minProperties) {
          errors.push({
            path: path,
            property: 'minProperties',
            message: this.translate('error_minProperties', [schema.minProperties])
          });
        }
      }

      // Version 4 `required`
      if(typeof schema.required !== "undefined" && Array.isArray(schema.required)) {
        for(i=0; i<schema.required.length; i++) {
          if(typeof value[schema.required[i]] === "undefined") {
            var editor = this.jsoneditor.getEditor(path + '.' + schema.required[i]);
            // Ignore required error if editor is of type "button" or "info"
            if (editor && ['botton', 'info'].indexOf(editor.format) === -1) continue;
            errors.push({
              path: path,
              property: 'required',
              message: this.translate('error_required', [schema.required[i]])
            });
          }
        }
      }

      // `properties`
      var validated_properties = {};
      for(i in schema.properties) {
        if(!schema.properties.hasOwnProperty(i)) continue;
        validated_properties[i] = true;
        errors = errors.concat(this._validateSchema(schema.properties[i],value[i],path+'.'+i));
      }

      // `patternProperties`
      if(schema.patternProperties) {
        for(i in schema.patternProperties) {
          if(!schema.patternProperties.hasOwnProperty(i)) continue;
          var regex = new RegExp(i);

          // Check which properties match
          for(j in value) {
            if(!value.hasOwnProperty(j)) continue;
            if(regex.test(j)) {
              validated_properties[j] = true;
              errors = errors.concat(this._validateSchema(schema.patternProperties[i],value[j],path+'.'+j));
            }
          }
        }
      }

      // The no_additional_properties option currently doesn't work with extended schemas that use oneOf or anyOf
      if(typeof schema.additionalProperties === "undefined" && this.jsoneditor.options.no_additional_properties && !schema.oneOf && !schema.anyOf) {
        schema.additionalProperties = false;
      }

      // `additionalProperties`
      if(typeof schema.additionalProperties !== "undefined") {
        for(i in value) {
          if(!value.hasOwnProperty(i)) continue;
          if(!validated_properties[i]) {
            // No extra properties allowed
            if(!schema.additionalProperties) {
              errors.push({
                path: path,
                property: 'additionalProperties',
                message: this.translate('error_additional_properties', [i])
              });
              break;
            }
            // Allowed
            else if(schema.additionalProperties === true) {
              break;
            }
            // Must match schema
            // TODO: incompatibility between version 3 and 4 of the spec
            else {
              errors = errors.concat(this._validateSchema(schema.additionalProperties,value[i],path+'.'+i));
            }
          }
        }
      }

      // `dependencies`
      if(schema.dependencies) {
        for(i in schema.dependencies) {
          if(!schema.dependencies.hasOwnProperty(i)) continue;

          // Doesn't need to meet the dependency
          if(typeof value[i] === "undefined") continue;

          // Property dependency
          if(Array.isArray(schema.dependencies[i])) {
            for(j=0; j<schema.dependencies[i].length; j++) {
              if(typeof value[schema.dependencies[i][j]] === "undefined") {
                errors.push({
                  path: path,
                  property: 'dependencies',
                  message: this.translate('error_dependency', [schema.dependencies[i][j]])
                });
              }
            }
          }
          // Schema dependency
          else {
            errors = errors.concat(this._validateSchema(schema.dependencies[i],value,path));
          }
        }
      }
    }

    if (schema.links) {
      for (var m = 0; m < schema.links.length; m++) {
        if (schema.links[m].rel && schema.links[m].rel.toLowerCase() === "describedby") {
          var href = schema.links[m].href;
          var data = this.jsoneditor.root.getValue();
          //var template = new UriTemplate(href); //preprocessURI(href));
          //var ref = template.fillFromObject(data);
          var template = this.jsoneditor.compileTemplate(href, this.jsoneditor.template);
          var ref = template(data);

          schema.links.splice(m, 1);

          schema = $extend({}, schema, this.jsoneditor.refs[ref]);

          errors = errors.concat(this._validateSchema(schema, value, path));
        }
      }
    }

    // date, time and datetime-local validation
    if(['date', 'time', 'datetime-local'].indexOf(schema.format) != -1) {

      var validatorRx = {
        'date': /^(\d{4}\D\d{2}\D\d{2})?$/,
        'time': /^(\d{2}:\d{2}(?::\d{2})?)?$/,
        'datetime-local': /^(\d{4}\D\d{2}\D\d{2}[ T]\d{2}:\d{2}(?::\d{2})?)?$/
      };
      var format = {
        'date': '"YYYY-MM-DD"',
        'time': '"HH:MM"',
        'datetime-local': '"YYYY-MM-DD HH:MM"'
      };

      var ed = this.jsoneditor.getEditor(path);
      var dateFormat = (ed && ed.flatpickr) ? ed.flatpickr.config.dateFormat : format[schema.format];

      if (schema.type == 'integer') {
        // The value is a timestamp
        if (value * 1 < 1) {
          // If value is less than 1, then it's an invalid epoch date before 00:00:00 UTC Thursday, 1 January 1970
          errors.push({
            path: path,
            property: 'format',
            message: this.translate('error_invalid_epoch')
          });
        }
        else if (value != Math.abs(parseInt(value))) {
          // not much to check for, so we assume value is ok if it's a positive number
          errors.push({
            path: path,
            property: 'format',
            message: this.translate('error_' + schema.format.replace(/-/g, "_"), [dateFormat])
          });
        }
      }
      else if (!ed || !ed.flatpickr) {
        // Standard string input, without flatpickr
        if(!validatorRx[schema.format].test(value)) {
          errors.push({
            path: path,
            property: 'format',
            message: this.translate('error_' + schema.format.replace(/-/g, "_"), [dateFormat])
          });
        }
      }
      else if (ed) {
        // Flatpickr validation
        if (value !== '') {

          var compareValue;
          if(ed.flatpickr.config.mode != 'single') {
            var seperator = ed.flatpickr.config.mode == 'range' ? ed.flatpickr.l10n.rangeSeparator : ', ';
            var selectedDates = ed.flatpickr.selectedDates.map(function(val) {
                return ed.flatpickr.formatDate(val, ed.flatpickr.config.dateFormat);
            });
            compareValue = selectedDates.join(seperator);
          }

          try {
            if (compareValue) {
              // Not the best validation method, but range and multiple mode are special
              // Optimal solution would be if it is possible to change the return format from string/integer to array
              if (compareValue != value) throw ed.flatpickr.config.mode + ' mismatch';
            }
            else if (ed.flatpickr.formatDate(ed.flatpickr.parseDate(value, ed.flatpickr.config.dateFormat), ed.flatpickr.config.dateFormat) != value) throw 'mismatch';
          }
          catch(err) {
            var errorDateFormat = ed.flatpickr.config.errorDateFormat !== undefined ? ed.flatpickr.config.errorDateFormat : ed.flatpickr.config.dateFormat;
            errors.push({
              path: path,
              property: 'format',
              message: this.translate('error_' + ed.format.replace(/-/g, "_"), [errorDateFormat])
            });
          }
        }
      }
    }

    // Internal validators using the custom validator format
    errors = errors.concat(ipValidator.validate.call(self,schema,value,path));

    // Custom type validation (global)
    $each(JSONEditor.defaults.custom_validators,function(i,validator) {
      errors = errors.concat(validator.call(self,schema,value,path));
    });
    // Custom type validation (instance specific)
    if(this.options.custom_validators) {
      $each(this.options.custom_validators,function(i,validator) {
        errors = errors.concat(validator.call(self,schema,value,path));
      });
    }

    return errors;
  },
  _checkType: function(type, value) {
    // Simple types
    if(typeof type === "string") {
      if(type==="string") return typeof value === "string";
      else if(type==="number") return typeof value === "number";
      else if(type==="integer") return typeof value === "number" && value === Math.floor(value);
      else if(type==="boolean") return typeof value === "boolean";
      else if(type==="array") return Array.isArray(value);
      else if(type === "object") return value !== null && !(Array.isArray(value)) && typeof value === "object";
      else if(type === "null") return value === null;
      else return true;
    }
    // Schema
    else {
      return !this._validateSchema(type,value).length;
    }
  }
});

/**
 * All editors should extend from this class
 */
JSONEditor.AbstractEditor = Class.extend({
  onChildEditorChange: function(editor) {
    this.onChange(true);
  },
  notify: function() {
    if(this.path) this.jsoneditor.notifyWatchers(this.path);
  },
  change: function() {
    if(this.parent) this.parent.onChildEditorChange(this);
    else if(this.jsoneditor) this.jsoneditor.onChange();
  },
  onChange: function(bubble) {
    this.notify();
    if(this.watch_listener) this.watch_listener();
    if(bubble) this.change();
  },
  register: function() {
    this.jsoneditor.registerEditor(this);
    this.onChange();
  },
  unregister: function() {
    if(!this.jsoneditor) return;
    this.jsoneditor.unregisterEditor(this);
  },
  getNumColumns: function() {
    return 12;
  },
  isActive: function() {
    return this.active;
  },
  activate: function() {
    this.active = true;
    this.optInCheckbox.checked = true;
    this.enable();
    this.change();
  },
  deactivate: function() {
    // only non required properties can be deactivated.
    if (!this.isRequired()) {
      this.active = false;
      this.optInCheckbox.checked = false;
      this.disable();
      this.change();
    }
  },
  init: function(options) {
    this.jsoneditor = options.jsoneditor;

    this.theme = this.jsoneditor.theme;
    this.template_engine = this.jsoneditor.template;
    this.iconlib = this.jsoneditor.iconlib;

    this.translate = this.jsoneditor.translate || JSONEditor.defaults.translate;

    this.original_schema = options.schema;
    this.schema = this.jsoneditor.expandSchema(this.original_schema);

    this.active = true;

    this.options = $extend({}, (this.options || {}), (this.schema.options || {}), (options.schema.options || {}), options);

    if(!options.path && !this.schema.id) this.schema.id = 'root';
    this.path = options.path || 'root';
    this.formname = options.formname || this.path.replace(/\.([^.]+)/g,'[$1]');
    if(this.jsoneditor.options.form_name_root) this.formname = this.formname.replace(/^root\[/,this.jsoneditor.options.form_name_root+'[');
    this.parent = options.parent;
    this.key = this.parent !== undefined ? this.path.split('.').slice(this.parent.path.split('.').length).join('.') : this.path;

    this.link_watchers = [];

    if(options.container) this.setContainer(options.container);
    this.registerDependencies();
  },
  registerDependencies: function() {
    this.dependenciesFulfilled = true;
    var deps = this.options.dependencies;
    if (!deps) {
      return;
    }

    var self = this;
    Object.keys(deps).forEach(function(dependency) {
      var path = self.path.split('.');
      path[path.length - 1] = dependency;
      path = path.join('.');
      var choices = deps[dependency];
      self.jsoneditor.watch(path, function() {
        self.checkDependency(path, choices);
      });
    });
  },
  checkDependency: function(path, choices) {
    var wrapper = this.container || this.control;
    if (this.path === path || !wrapper || this.jsoneditor === null) {
      return;
    }

    var self = this;
    var editor = this.jsoneditor.getEditor(path);
    var value = editor ? editor.getValue() : undefined;
    var previousStatus = this.dependenciesFulfilled;
    this.dependenciesFulfilled = false;

    if (!editor || !editor.dependenciesFulfilled) {
      this.dependenciesFulfilled = false;
    } else if (Array.isArray(choices)) {
      choices.some(function(choice) {
        if (value === choice) {
          self.dependenciesFulfilled = true;
          return true;
        }
      });
    } else if (typeof choices === 'object') {
      if (typeof value !== 'object') {
        this.dependenciesFulfilled = choices === value;
      } else {
        Object.keys(choices).some(function(key) {
          if (!choices.hasOwnProperty(key)) {
            return false;
          }
          if (!value.hasOwnProperty(key) || choices[key] !== value[key]) {
            self.dependenciesFulfilled = false;
            return true;
          }
          self.dependenciesFulfilled = true;
        });
      }
    } else if (typeof choices === 'string' || typeof choices === 'number') {
      this.dependenciesFulfilled = value === choices;
    } else if (typeof choices === 'boolean') {
      if (choices) {
        this.dependenciesFulfilled = value || value.length > 0;
      } else {
        this.dependenciesFulfilled = !value || value.length === 0;
      }
    }

    if (this.dependenciesFulfilled !== previousStatus) {
      this.notify();
    }

    if (this.dependenciesFulfilled) {
      wrapper.style.display = 'block';
    } else {
      wrapper.style.display = 'none';
    }
  },
  setContainer: function(container) {
    this.container = container;
    if(this.schema.id) this.container.setAttribute('data-schemaid',this.schema.id);
    if(this.schema.type && typeof this.schema.type === "string") this.container.setAttribute('data-schematype',this.schema.type);
    this.container.setAttribute('data-schemapath',this.path);
  },
  setOptInCheckbox: function(header) {
    // the active/deactive checbox control.
    var self = this;
    this.optInCheckbox = document.createElement('input');
    this.optInCheckbox.setAttribute('type', 'checkbox');
    this.optInCheckbox.setAttribute('style', 'margin: 0 10px 0 0;');
    this.optInCheckbox.classList.add('json-editor-opt-in');

    this.optInCheckbox.addEventListener('click', function () {
      if (self.isActive()) {
        self.deactivate();
      } else {
        self.activate();
      }
    });

    // append active/deactive checkbox if show_opt_in is true
    if (this.jsoneditor.options.show_opt_in || this.options.show_opt_in) {
      // and control to type object editors if they are not required
      if (this.parent && this.parent.schema.type === 'object' && !this.isRequired() && this.header) {
        this.header.appendChild(this.optInCheckbox);
        this.header.insertBefore(this.optInCheckbox, this.header.firstChild);
      }
    }

  },
  preBuild: function() {

  },
  build: function() {

  },
  postBuild: function() {       
    this.setupWatchListeners();
    this.addLinks();
    this.setValue(this.getDefault(), true);
    this.updateHeaderText();
    this.register();
    this.onWatchedFieldChange();
  },
  setupWatchListeners: function() {
    var self = this;

    // Watched fields
    this.watched = {};
    if(this.schema.vars) this.schema.watch = this.schema.vars;
    this.watched_values = {};
    this.watch_listener = function() {
      if(self.refreshWatchedFieldValues()) {
        self.onWatchedFieldChange();
      }
    };

    if(this.schema.hasOwnProperty('watch')) {
      var path,path_parts,first,root,adjusted_path;

      for(var name in this.schema.watch) {
        if(!this.schema.watch.hasOwnProperty(name)) continue;
        path = this.schema.watch[name];

        if(Array.isArray(path)) {
          if(path.length<2) continue;
          path_parts = [path[0]].concat(path[1].split('.'));
        }
        else {
          path_parts = path.split('.');
          if(!self.theme.closest(self.container,'[data-schemaid="'+path_parts[0]+'"]')) path_parts.unshift('#');
        }
        first = path_parts.shift();

        if(first === '#') first = self.jsoneditor.schema.id || 'root';

        // Find the root node for this template variable
        root = self.theme.closest(self.container,'[data-schemaid="'+first+'"]');
        if(!root) throw "Could not find ancestor node with id "+first;

        // Keep track of the root node and path for use when rendering the template
        adjusted_path = root.getAttribute('data-schemapath') + '.' + path_parts.join('.');

        self.jsoneditor.watch(adjusted_path,self.watch_listener);

        self.watched[name] = adjusted_path;
      }
    }

    // Dynamic header
    if(this.schema.headerTemplate) {
      this.header_template = this.jsoneditor.compileTemplate(this.schema.headerTemplate, this.template_engine);
    }
  },

  addLinks: function() {
    // Add links
    if(!this.no_link_holder) {
      this.link_holder = this.theme.getLinksHolder();
      this.container.appendChild(this.link_holder);
      if(this.schema.links) {
        for(var i=0; i<this.schema.links.length; i++) {
          this.addLink(this.getLink(this.schema.links[i]));
        }
      }
    }
  },
  onMove: function() {},
  getButton: function(text, icon, title) {
    var btnClass = 'json-editor-btn-'+icon;
    if(!this.iconlib) icon = null;
    else icon = this.iconlib.getIcon(icon);

    if(!icon && title) {
      text = title;
      title = null;
    }

    var btn = this.theme.getButton(text, icon, title);
    btn.classList.add(btnClass);
    return btn;
  },
  setButtonText: function(button, text, icon, title) {
    if(!this.iconlib) icon = null;
    else icon = this.iconlib.getIcon(icon);

    if(!icon && title) {
      text = title;
      title = null;
    }

    return this.theme.setButtonText(button, text, icon, title);
  },
  addLink: function(link) {
    if(this.link_holder) this.link_holder.appendChild(link);
  },
  getLink: function(data) {
    var holder, link;

    // Get mime type of the link
    var mime = data.mediaType || 'application/javascript';
    var type = mime.split('/')[0];

    // Template to generate the link href
    var href = this.jsoneditor.compileTemplate(data.href,this.template_engine);
    var relTemplate = this.jsoneditor.compileTemplate(data.rel ? data.rel : data.href,this.template_engine);

    // Template to generate the link's download attribute
    var download = null;
    if(data.download) download = data.download;

    if(download && download !== true) {
      download = this.jsoneditor.compileTemplate(download, this.template_engine);
    }

    // Image links
    if(type === 'image') {
      holder = this.theme.getBlockLinkHolder();
      link = document.createElement('a');
      link.setAttribute('target','_blank');
      var image = document.createElement('img');

      this.theme.createImageLink(holder,link,image);

      // When a watched field changes, update the url
      this.link_watchers.push(function(vars) {
        var url = href(vars);
        var rel = relTemplate(vars);
        link.setAttribute('href',url);
        link.setAttribute('title',rel || url);
        image.setAttribute('src',url);
      });
    }
    // Audio/Video links
    else if(['audio','video'].indexOf(type) >=0) {
      holder = this.theme.getBlockLinkHolder();

      link = this.theme.getBlockLink();
      link.setAttribute('target','_blank');

      var media = document.createElement(type);
      media.setAttribute('controls','controls');

      this.theme.createMediaLink(holder,link,media);

      // When a watched field changes, update the url
      this.link_watchers.push(function(vars) {
        var url = href(vars);
        var rel = relTemplate(vars);
        link.setAttribute('href',url);
        link.textContent = rel || url;
        media.setAttribute('src',url);
      });
    }
    // Text links
    else {
      link = holder = this.theme.getBlockLink();
      holder.setAttribute('target','_blank');
      holder.textContent = data.rel;

      // When a watched field changes, update the url
      this.link_watchers.push(function(vars) {
        var url = href(vars);
        var rel = relTemplate(vars);
        holder.setAttribute('href',url);
        holder.textContent = rel || url;
      });
    }

    if(download && link) {
      if(download === true) {
        link.setAttribute('download','');
      }
      else {
        this.link_watchers.push(function(vars) {
          link.setAttribute('download',download(vars));
        });
      }
    }

    if(data.class) link.classList.add(data.class);

    return holder;
  },
  refreshWatchedFieldValues: function() {
    if(!this.watched_values) return;
    var watched = {};
    var changed = false;
    var self = this;

    if(this.watched) {
      var val,editor;
      for(var name in this.watched) {
        if(!this.watched.hasOwnProperty(name)) continue;
        editor = self.jsoneditor.getEditor(this.watched[name]);
        val = editor? editor.getValue() : null;
        if(self.watched_values[name] !== val) changed = true;
        watched[name] = val;
      }
    }

    watched.self = this.getValue();
    if(this.watched_values.self !== watched.self) changed = true;

    this.watched_values = watched;

    return changed;
  },
  getWatchedFieldValues: function() {
    return this.watched_values;
  },
  updateHeaderText: function() {
    if(this.header) {
      var header_text = this.getHeaderText();
      // If the header has children, only update the text node's value
      if(this.header.children.length) {
        for(var i=0; i<this.header.childNodes.length; i++) {
          if(this.header.childNodes[i].nodeType===3) {
            this.header.childNodes[i].nodeValue = this.cleanText(header_text);
            break;
          }
        }
      }
      // Otherwise, just update the entire node
      else {
        if (window.DOMPurify) this.header.innerHTML = window.DOMPurify.sanitize(header_text);
        else this.header.textContent = this.cleanText(header_text);
      }
    }
  },
  getHeaderText: function(title_only) {
    if(this.header_text) return this.header_text;
    else if(title_only) return this.schema.title;
    else return this.getTitle();
  },
  cleanText: function(txt) {
    // Clean out HTML tags from txt
    var tmp = document.createElement('div');
    tmp.innerHTML = txt;
    return (tmp.textContent || tmp.innerText);
  },
  onWatchedFieldChange: function() {
    var vars;
    if(this.header_template) {
      vars = $extend(this.getWatchedFieldValues(),{
        key: this.key,
        i: this.key,
        i0: (this.key*1),
        i1: (this.key*1+1),
        title: this.getTitle()
      });
      var header_text = this.header_template(vars);

      if(header_text !== this.header_text) {
        this.header_text = header_text;
        this.updateHeaderText();
        this.notify();
        //this.fireChangeHeaderEvent();
      }
    }
    if(this.link_watchers.length) {
      vars = this.getWatchedFieldValues();
      for(var i=0; i<this.link_watchers.length; i++) {
        this.link_watchers[i](vars);
      }
    }
  },
  setValue: function(value) {
    this.value = value;
  },
  getValue: function() {
    if (!this.dependenciesFulfilled) {
      return undefined;
    }
    return this.value;
  },
  refreshValue: function() {

  },
  getChildEditors: function() {
    return false;
  },
  destroy: function() {
    var self = this;
    this.unregister(this);
    $each(this.watched,function(name,adjusted_path) {
      self.jsoneditor.unwatch(adjusted_path,self.watch_listener);
    });

    this.watched = null;
    this.watched_values = null;
    this.watch_listener = null;
    this.header_text = null;
    this.header_template = null;
    this.value = null;
    if(this.container && this.container.parentNode) this.container.parentNode.removeChild(this.container);
    this.container = null;
    this.jsoneditor = null;
    this.schema = null;
    this.path = null;
    this.key = null;
    this.parent = null;
  },
  getDefault: function() {
    if (typeof this.schema["default"] !== 'undefined') {
      return this.schema["default"];
    }

    if (typeof this.schema["enum"] !== 'undefined') {
      return this.schema["enum"][0];
    }

    var type = this.schema.type || this.schema.oneOf;
    if(type && Array.isArray(type)) type = type[0];
    if(type && typeof type === "object") type = type.type;
    if(type && Array.isArray(type)) type = type[0];

    if(typeof type === "string") {
      if(type === "number") return 0.0;
      if(type === "boolean") return false;
      if(type === "integer") return 0;
      if(type === "string") return "";
      if(type === "object") return {};
      if(type === "array") return [];
    }

    return null;
  },
  getTitle: function() {
    return this.schema.title || this.key;
  },
  enable: function() {
    this.disabled = false;
  },
  disable: function() {
    this.disabled = true;
  },
  isEnabled: function() {
    return !this.disabled;
  },
  isRequired: function() {
    if(typeof this.schema.required === "boolean") return this.schema.required;
    else if(this.parent && this.parent.schema && Array.isArray(this.parent.schema.required)) return this.parent.schema.required.indexOf(this.key) > -1;
    else if(this.jsoneditor.options.required_by_default) return true;
    else return false;
  },
  getDisplayText: function(arr) {
    var disp = [];
    var used = {};

    // Determine how many times each attribute name is used.
    // This helps us pick the most distinct display text for the schemas.
    $each(arr,function(i,el) {
      if(el.title) {
        used[el.title] = used[el.title] || 0;
        used[el.title]++;
      }
      if(el.description) {
        used[el.description] = used[el.description] || 0;
        used[el.description]++;
      }
      if(el.format) {
        used[el.format] = used[el.format] || 0;
        used[el.format]++;
      }
      if(el.type) {
        used[el.type] = used[el.type] || 0;
        used[el.type]++;
      }
    });

    // Determine display text for each element of the array
    $each(arr,function(i,el)  {
      var name;

      // If it's a simple string
      if(typeof el === "string") name = el;
      // Object
      else if(el.title && used[el.title]<=1) name = el.title;
      else if(el.format && used[el.format]<=1) name = el.format;
      else if(el.type && used[el.type]<=1) name = el.type;
      else if(el.description && used[el.description]<=1) name = el.descripton;
      else if(el.title) name = el.title;
      else if(el.format) name = el.format;
      else if(el.type) name = el.type;
      else if(el.description) name = el.description;
      else if(JSON.stringify(el).length < 500) name = JSON.stringify(el);
      else name = "type";

      disp.push(name);
    });

    // Replace identical display text with "text 1", "text 2", etc.
    var inc = {};
    $each(disp,function(i,name) {
      inc[name] = inc[name] || 0;
      inc[name]++;

      if(used[name] > 1) disp[i] = name + " " + inc[name];
    });

    return disp;
  },

  // Replace space(s) with "-" to create valid id value
  getValidId: function(id) {
    id = id === undefined ? "" : id.toString();
    return id.replace(/\s+/g, "-");
  },
  setInputAttributes: function(inputAttribute) {
    if (this.schema.options && this.schema.options.inputAttributes) {
      var inputAttributes = this.schema.options.inputAttributes;
      var protectedAttributes = ['name', 'type'].concat(inputAttribute);
      for (var key in inputAttributes) {
        if (inputAttributes.hasOwnProperty(key) && protectedAttributes.indexOf(key.toLowerCase()) == -1) {
          this.input.setAttribute(key, inputAttributes[key]);
        }
      }
    }
  },
  expandCallbacks: function(scope, options) {
    for (var i in options) {
      if (options.hasOwnProperty(i) && typeof options[i] === 'string' && typeof JSONEditor.defaults.callbacks[scope] === 'object' && typeof JSONEditor.defaults.callbacks[scope][options[i]] === 'function') {
        options[i] = JSONEditor.defaults.callbacks[scope][options[i]].bind(null, this);//.bind(this);
      }
    }
    return options;
  },
  getOption: function(key) {
    try {
      throw "getOption is deprecated";
    }
    catch(e) {
      window.console.error(e);
    }

    return this.options[key];
  },
  showValidationErrors: function(errors) {

  }
});

JSONEditor.defaults.editors["null"] = JSONEditor.AbstractEditor.extend({
  getValue: function() {
    if (!this.dependenciesFulfilled) {
      return undefined;
    }
    return null;
  },
  setValue: function() {
    this.onChange();
  },
  getNumColumns: function() {
    return 2;
  }
});

JSONEditor.defaults.editors.string = JSONEditor.AbstractEditor.extend({
  register: function() {
    this._super();
    if(!this.input) return;
    this.input.setAttribute('name',this.formname);
  },
  unregister: function() {
    this._super();
    if(!this.input) return;
    this.input.removeAttribute('name');
  },
  setValue: function(value,initial,from_template) {
    var self = this;
    
    if(this.template && !from_template) {
      return;
    }
    
    if(value === null || typeof value === 'undefined') value = "";
    else if(typeof value === "object") value = JSON.stringify(value);
    else if(typeof value !== "string") value = ""+value;
    
    if(value === this.serialized) return;

    // Sanitize value before setting it
    var sanitized = this.sanitize(value);

    if(this.input.value === sanitized) {
      return;
    }

    this.input.value = sanitized;
    
    var changed = from_template || this.getValue() !== value;
    
    this.refreshValue();
    
    if(initial) this.is_dirty = false;
    else if(this.jsoneditor.options.show_errors === "change") this.is_dirty = true;

    if(this.adjust_height) this.adjust_height(this.input);

    // Bubble this setValue to parents if the value changed
    this.onChange(changed);

    // Return object with changed state and sanitized value for use in editors that extend this
    return {changed: changed, value: sanitized};
  },
  getNumColumns: function() {
    var min = Math.ceil(Math.max(this.getTitle().length,this.schema.maxLength||0,this.schema.minLength||0)/5);
    var num;
    
    if(this.input_type === 'textarea') num = 6;
    else if(['text','email'].indexOf(this.input_type) >= 0) num = 4;
    else num = 2;
    
    return Math.min(12,Math.max(min,num));
  },
  build: function() {
    var self = this, i;
    if(!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());
    if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);
    if(this.options.infoText) this.infoButton = this.theme.getInfoButton(this.options.infoText);

    this.format = this.schema.format;
    if(!this.format && this.schema.media && this.schema.media.type) {
      this.format = this.schema.media.type.replace(/(^(application|text)\/(x-)?(script\.)?)|(-source$)/g,'');
    }
    if(!this.format && this.options.default_format) {
      this.format = this.options.default_format;
    }
    if(this.options.format) {
      this.format = this.options.format;
    }

    // Specific format
    if(this.format) {
      // Text Area
      if(this.format === 'textarea') {
        this.input_type = 'textarea';
        this.input = this.theme.getTextareaInput();
      }
      // Range Input
      else if(this.format === 'range') {
        this.input_type = 'range';
        var min = this.schema.minimum || 0;
        var max = this.schema.maximum || Math.max(100,min+1);
        var step = 1;
        if(this.schema.multipleOf) {
          if(min%this.schema.multipleOf) min = Math.ceil(min/this.schema.multipleOf)*this.schema.multipleOf;
          if(max%this.schema.multipleOf) max = Math.floor(max/this.schema.multipleOf)*this.schema.multipleOf;
          step = this.schema.multipleOf;
        }

        this.input = this.theme.getRangeInput(min,max,step);
      }
      // HTML5 Input type
      else {
        this.input_type = 'text';
        if (['button', 'checkbox', 'color', 'date', 'datetime-local', 'email', 'file', 'hidden', 'image', 'month', 'number', 'password', 'radio', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week'].indexOf(this.format) > -1) {
          this.input_type = this.format;
        }
        this.input = this.theme.getFormInputField(this.input_type);
      }
    }
    // Normal text input
    else {
      this.input_type = 'text';
      this.input = this.theme.getFormInputField(this.input_type);
    }
    
    // minLength, maxLength, and pattern
    if(typeof this.schema.maxLength !== "undefined") this.input.setAttribute('maxlength',this.schema.maxLength);
    if(typeof this.schema.pattern !== "undefined") this.input.setAttribute('pattern',this.schema.pattern);
    else if(typeof this.schema.minLength !== "undefined") this.input.setAttribute('pattern','.{'+this.schema.minLength+',}');

    if(this.options.compact) {
      this.container.classList.add('compact');
    }
    else {
      if(this.options.input_width) this.input.style.width = this.options.input_width;
    }

    if(this.schema.readOnly || this.schema.readonly || this.schema.template) {
      this.always_disabled = true;
      this.input.setAttribute('readonly', 'true');
    }

    // Set custom attributes on input element. Parameter is array of protected keys. Empty array if none.
    this.setInputAttributes(['maxlength', 'pattern', 'readonly', 'min', 'max', 'step']);

    this.input
      .addEventListener('change',function(e) {        
        e.preventDefault();
        e.stopPropagation();
        
        // Don't allow changing if this field is a template
        if(self.schema.template) {
          this.value = self.value;
          return;
        }

        var val = this.value;
        
        // sanitize value
        var sanitized = self.sanitize(val);
        if(val !== sanitized) {
          this.value = sanitized;
        }
        
        self.is_dirty = true;

        self.refreshValue();
        self.onChange(true);
      });
      
    if(this.options.input_height) this.input.style.height = this.options.input_height;
    if(this.options.expand_height) {
      this.adjust_height = function(el) {
        if(!el) return;
        var i, ch=el.offsetHeight;
        // Input too short
        if(el.offsetHeight < el.scrollHeight) {
          i=0;
          while(el.offsetHeight < el.scrollHeight+3) {
            if(i>100) break;
            i++;
            ch++;
            el.style.height = ch+'px';
          }
        }
        else {
          i=0;
          while(el.offsetHeight >= el.scrollHeight+3) {
            if(i>100) break;
            i++;
            ch--;
            el.style.height = ch+'px';
          }
          el.style.height = (ch+1)+'px';
        }
      };
      
      this.input.addEventListener('keyup',function(e) {
        self.adjust_height(this);
      });
      this.input.addEventListener('change',function(e) {
        self.adjust_height(this);
      });
      this.adjust_height();
    }

    if(this.format) this.input.setAttribute('data-schemaformat',this.format);

    var input = this.input;
    if(this.format === 'range') {
      input = this.theme.getRangeControl(this.input, this.theme.getRangeOutput(this.input, this.schema.default || Math.max(this.schema.minimum || 0, 0)));
    }

    this.control = this.theme.getFormControl(this.label, input, this.description, this.infoButton);
    this.container.appendChild(this.control);

    // Any special formatting that needs to happen after the input is added to the dom
    window.requestAnimationFrame(function() {
      // Skip in case the input is only a temporary editor,
      // otherwise, in the case of an ace_editor creation,
      // it will generate an error trying to append it to the missing parentNode
      if(self.input.parentNode) self.afterInputReady();
      if(self.adjust_height) self.adjust_height(self.input);
    });

    // Compile and store the template
    if(this.schema.template) {
      this.template = this.jsoneditor.compileTemplate(this.schema.template, this.template_engine);
      this.refreshValue();
    }
    else {
      this.refreshValue();
    }
  },
  setupCleave: function(el) {
    // Enable cleave.js support if library is loaded and config is available
    var options = this.expandCallbacks('cleave', $extend({}, JSONEditor.defaults.options.cleave || {}, this.options.cleave || {}));
    if (Array.Keys(options).length > 0) {
      this.cleave_instance = new window.Cleave(el, options);
    }
  },
  enable: function() {
    if(!this.always_disabled) {
      this.input.disabled = false;
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    this.input.disabled = true;
    this._super();
  },
  afterInputReady: function() {
    var self = this;
    self.theme.afterInputReady(self.input);
    if (window.Cleave && !self.cleave_instance) self.setupCleave(self.input);
  },
  refreshValue: function() {
    this.value = this.input.value;
    if(typeof this.value !== "string") this.value = '';
    this.serialized = this.value;
  },
  destroy: function() {
    if (this.cleave_instance) {
      this.cleave_instance.destroy();
    }

    this.template = null;
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    if(this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);

    this._super();
  },
  /**
   * This is overridden in derivative editors
   */
  sanitize: function(value) {
    return value;
  },
  /**
   * Re-calculates the value if needed
   */
  onWatchedFieldChange: function() {    
    var self = this, vars, j;
    
    // If this editor needs to be rendered by a macro template
    if(this.template) {
      vars = this.getWatchedFieldValues();
      this.setValue(this.template(vars),false,true);
    }
    
    this._super();
  },
  showValidationErrors: function(errors) {
    var self = this;

    if(this.jsoneditor.options.show_errors === "always") {}
    else if(!this.is_dirty && this.previous_error_setting===this.jsoneditor.options.show_errors) return;
    
    this.previous_error_setting = this.jsoneditor.options.show_errors;

    var messages = [];
    $each(errors,function(i,error) {
      if(error.path === self.path) {
        messages.push(error.message);
      }
    });

    if(messages.length) {
      this.theme.addInputError(this.input, messages.join('. ')+'.');
    }
    else {
      this.theme.removeInputError(this.input);
    }
  }
});

/**
 * Created by Mehmet Baker on 12.04.2017
 */
JSONEditor.defaults.editors.hidden = JSONEditor.AbstractEditor.extend({
  register: function () {
    this._super();
    if (!this.input) return;
    this.input.setAttribute('name', this.formname);
  },
  unregister: function () {
    this._super();
    if (!this.input) return;
    this.input.removeAttribute('name');
  },
  setValue: function (value, initial, from_template) {
    var self = this;

    if(this.template && !from_template) {
      return;
    }

    if(value === null || typeof value === 'undefined') value = "";
    else if(typeof value === "object") value = JSON.stringify(value);
    else if(typeof value !== "string") value = ""+value;

    if(value === this.serialized) return;

    // Sanitize value before setting it
    var sanitized = this.sanitize(value);

    if(this.input.value === sanitized) {
      return;
    }

    this.input.value = sanitized;

    var changed = from_template || this.getValue() !== value;

    this.refreshValue();

    if(initial) this.is_dirty = false;
    else if(this.jsoneditor.options.show_errors === "change") this.is_dirty = true;

    if(this.adjust_height) this.adjust_height(this.input);

    // Bubble this setValue to parents if the value changed
    this.onChange(changed);
  },
  getNumColumns: function () {
    return 2;
  },
  enable: function () {
    this._super();
  },
  disable: function () {
    this._super();
  },
  refreshValue: function () {
    this.value = this.input.value;
    if (typeof this.value !== "string") this.value = '';
    this.serialized = this.value;
  },
  destroy: function () {
    this.template = null;
    if (this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    if (this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if (this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);

    this._super();
  },
  /**
   * This is overridden in derivative editors
   */
  sanitize: function (value) {
    return value;
  },
  /**
   * Re-calculates the value if needed
   */
  onWatchedFieldChange: function () {
    var self = this, vars, j;

    // If this editor needs to be rendered by a macro template
    if (this.template) {
      vars = this.getWatchedFieldValues();
      this.setValue(this.template(vars), false, true);
    }

    this._super();
  },
  build: function () {
    var self = this;

    this.format = this.schema.format;
    if (!this.format && this.options.default_format) {
      this.format = this.options.default_format;
    }
    if (this.options.format) {
      this.format = this.options.format;
    }

    this.input_type = 'hidden';
    this.input = this.theme.getFormInputField(this.input_type);

    if (this.format) this.input.setAttribute('data-schemaformat', this.format);

    this.container.appendChild(this.input);

    // Compile and store the template
    if (this.schema.template) {
      this.template = this.jsoneditor.compileTemplate(this.schema.template, this.template_engine);
      this.refreshValue();
    }
    else {
      this.refreshValue();
    }
  }
});
JSONEditor.defaults.editors.number = JSONEditor.defaults.editors.string.extend({
  build: function() {
    this._super();

    if (typeof this.schema.minimum !== "undefined") {
      var minimum = this.schema.minimum;

      if (typeof this.schema.exclusiveMinimum !== "undefined") {
        minimum += 1;
      }

      this.input.setAttribute("min", minimum);
    }

    if (typeof this.schema.maximum !== "undefined") {
      var maximum = this.schema.maximum;

      if (typeof this.schema.exclusiveMaximum !== "undefined") {
        maximum -= 1;
      }

      this.input.setAttribute("max", maximum);
    }

    if (typeof this.schema.step !== "undefined") {
      var step = this.schema.step || 1;
      this.input.setAttribute("step", step);
    }

    // Set custom attributes on input element. Parameter is array of protected keys. Empty array if none.
    this.setInputAttributes(['maxlength', 'pattern', 'readonly', 'min', 'max', 'step']);

  },
  sanitize: function(value) {
    return (value+"").replace(/[^0-9\.\-eE]/g,'');
  },
  getNumColumns: function() {
    return 2;
  },
  getValue: function() {
    if (!this.dependenciesFulfilled) {
      return undefined;
    }
    return this.value===''?undefined:this.value*1;
  }
});

JSONEditor.defaults.editors.integer = JSONEditor.defaults.editors.number.extend({
  sanitize: function(value) {
    value = value + "";
    return value.replace(/[^0-9\-]/g,'');
  },
  getNumColumns: function() {
    return 2;
  }
});

JSONEditor.defaults.editors.object = JSONEditor.AbstractEditor.extend({
  getDefault: function() {
    return $extend({},this.schema["default"] || {});
  },
  getChildEditors: function() {
    return this.editors;
  },
  register: function() {
    this._super();
    if(this.editors) {
      for(var i in this.editors) {
        if(!this.editors.hasOwnProperty(i)) continue;
        this.editors[i].register();
      }
    }
  },
  unregister: function() {
    this._super();
    if(this.editors) {
      for(var i in this.editors) {
        if(!this.editors.hasOwnProperty(i)) continue;
        this.editors[i].unregister();
      }
    }
  },
  getNumColumns: function() {
    return Math.max(Math.min(12,this.maxwidth),3);
  },
  enable: function() {
    if(!this.always_disabled) {
      if(this.editjson_button) this.editjson_button.disabled = false;
      if(this.addproperty_button) this.addproperty_button.disabled = false;

      this._super();
      if(this.editors) {
        for(var i in this.editors) {
          if(!this.editors.hasOwnProperty(i)) continue;
          this.editors[i].enable();
          this.editors[i].optInCheckbox.disabled = false;
        }
      }
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    if(this.editjson_button) this.editjson_button.disabled = true;
    if(this.addproperty_button) this.addproperty_button.disabled = true;
    this.hideEditJSON();

    this._super();
    if(this.editors) {
      for(var i in this.editors) {
        if(!this.editors.hasOwnProperty(i)) continue;
        this.editors[i].disable(always_disabled);
        this.editors[i].optInCheckbox.disabled = true;
      }
    }
  },
  layoutEditors: function() {
    var self = this, i, j;

    if(!this.row_container) return;

    // Sort editors by propertyOrder
    this.property_order = Object.keys(this.editors);
    this.property_order = this.property_order.sort(function(a,b) {
      var ordera = self.editors[a].schema.propertyOrder;
      var orderb = self.editors[b].schema.propertyOrder;
      if(typeof ordera !== "number") ordera = 1000;
      if(typeof orderb !== "number") orderb = 1000;

      return ordera - orderb;
    });

    var container;
    var isCategoriesFormat = (this.format === 'categories');
    var rows = [];
    var key = null;
    var editor = null;
    var row;

    if(this.format === 'grid-strict') {
      var rowIndex = 0;
      row = [];

      $each(this.property_order, function(j,key) {
        var editor = self.editors[key];
        if (editor.property_removed) {
          return;
        }
        var width = editor.options.hidden ? 0 : (editor.options.grid_columns || editor.getNumColumns());
        var offset = editor.options.hidden ? 0 : (editor.options.grid_offset || 0);
        var gridBreak = editor.options.hidden ? false : (editor.options.grid_break || false);
        var height = editor.options.hidden ? 0 : editor.container.offsetHeight;

        var column = {
          key: key,
          width: width,
          offset: offset,
          height: height
        };

        row.push(column);

        rows[rowIndex] = row;

        if (gridBreak) {
          rowIndex++;
          row = [];
        }
      });

      // layout hasn't changed
      if (this.layout === JSON.stringify(rows)) return false;
      this.layout = JSON.stringify(rows);

      // Layout the form
      container = document.createElement('div');
      for (i = 0; i < rows.length; i++) {
        row = this.theme.getGridRow();
        container.appendChild(row);
        for (j = 0; j < rows[i].length; j++) {
          key = rows[i][j].key;
          editor = this.editors[key];
          if (editor.options.hidden) {
            editor.container.style.display = 'none';
          } else {
            this.theme.setGridColumnSize(editor.container, rows[i][j].width, rows[i][j].offset);
          }
          row.appendChild(editor.container);
        }
      }
    } else if(this.format === 'grid') {
      $each(this.property_order, function(j,key) {
        var editor = self.editors[key];
        if(editor.property_removed) return;
        var found = false;
        var width = editor.options.hidden? 0 : (editor.options.grid_columns || editor.getNumColumns());
        var height = editor.options.hidden? 0 : editor.container.offsetHeight;
        // See if the editor will fit in any of the existing rows first
        for(var i=0; i<rows.length; i++) {
          // If the editor will fit in the row horizontally
          if(rows[i].width + width <= 12) {
            // If the editor is close to the other elements in height
            // i.e. Don't put a really tall editor in an otherwise short row or vice versa
            if(!height || (rows[i].minh*0.5 < height && rows[i].maxh*2 > height)) {
              found = i;
            }
          }
        }

        // If there isn't a spot in any of the existing rows, start a new row
        if(found === false) {
          rows.push({
            width: 0,
            minh: 999999,
            maxh: 0,
            editors: []
          });
          found = rows.length-1;
        }

        rows[found].editors.push({
          key: key,
          //editor: editor,
          width: width,
          height: height
        });
        rows[found].width += width;
        rows[found].minh = Math.min(rows[found].minh,height);
        rows[found].maxh = Math.max(rows[found].maxh,height);
      });

      // Make almost full rows width 12
      // Do this by increasing all editors' sizes proprotionately
      // Any left over space goes to the biggest editor
      // Don't touch rows with a width of 6 or less
      for(i=0; i<rows.length; i++) {
        if(rows[i].width < 12) {
          var biggest = false;
          var new_width = 0;
          for(j=0; j<rows[i].editors.length; j++) {
            if(biggest === false) biggest = j;
            else if(rows[i].editors[j].width > rows[i].editors[biggest].width) biggest = j;
            rows[i].editors[j].width *= 12/rows[i].width;
            rows[i].editors[j].width = Math.floor(rows[i].editors[j].width);
            new_width += rows[i].editors[j].width;
          }
          if(new_width < 12) rows[i].editors[biggest].width += 12-new_width;
          rows[i].width = 12;
        }
      }

      // layout hasn't changed
      if(this.layout === JSON.stringify(rows)) return false;
      this.layout = JSON.stringify(rows);

      // Layout the form
      container = document.createElement('div');
      for(i=0; i<rows.length; i++) {
        row = this.theme.getGridRow();
        container.appendChild(row);
        for(j=0; j<rows[i].editors.length; j++) {
          key = rows[i].editors[j].key;
          editor = this.editors[key];

          if(editor.options.hidden) editor.container.style.display = 'none';
          else this.theme.setGridColumnSize(editor.container,rows[i].editors[j].width);
          row.appendChild(editor.container);
        }
      }
    }
    // Normal layout
    else {
      container = document.createElement('div');

      if(isCategoriesFormat) {
        //A container for properties not object nor arrays
        var containerSimple = document.createElement('div');
        //This will be the place to (re)build tabs and panes
        //tabs_holder has 2 childs, [0]: ul.nav.nav-tabs and [1]: div.tab-content
        var newTabs_holder = this.theme.getTopTabHolder(this.schema.title);
        //child [1] of previous, stores panes
        var newTabPanesContainer = this.theme.getTopTabContentHolder(newTabs_holder);

        $each(this.property_order, function(i,key){
          var editor = self.editors[key];
          if(editor.property_removed) return;
          var aPane = self.theme.getTabContent();
          var isObjOrArray = editor.schema && (editor.schema.type === "object" || editor.schema.type === "array");
          //mark the pane
          aPane.isObjOrArray = isObjOrArray;
          var gridRow = self.theme.getGridRow();

          //this happens with added properties, they don't have a tab
          if(!editor.tab){
            //Pass the pane which holds the editor
            if(typeof self.basicPane === 'undefined'){
              //There is no basicPane yet, so aPane will be it
              self.addRow(editor,newTabs_holder, aPane);
            }
            else {
              self.addRow(editor,newTabs_holder, self.basicPane);
            }
          }

          aPane.id = self.getValidId(editor.tab_text.textContent);

          //For simple properties, add them on the same panel (Basic)
          if(!isObjOrArray){
            containerSimple.appendChild(gridRow);
            //There are already some panes
            if(newTabPanesContainer.childElementCount > 0){
              //If first pane is object or array, insert before a simple pane
              if(newTabPanesContainer.firstChild.isObjOrArray){
                //Append pane for simple properties
                aPane.appendChild(containerSimple);
                newTabPanesContainer.insertBefore(aPane,newTabPanesContainer.firstChild);
                //Add "Basic" tab
                self.theme.insertBasicTopTab(editor.tab,newTabs_holder);
                //newTabs_holder.firstChild.insertBefore(editor.tab,newTabs_holder.firstChild.firstChild);
                //Update the basicPane
                editor.basicPane = aPane;
              }
              else {
                //We already have a first "Basic" pane, just add the new property to it, so
                //do nothing;
              }
            }
            //There is no pane, so add the first (simple) pane
            else {
              //Append pane for simple properties
              aPane.appendChild(containerSimple);
              newTabPanesContainer.appendChild(aPane);
              //Add "Basic" tab
              //newTabs_holder.firstChild.appendChild(editor.tab);
              self.theme.addTopTab(newTabs_holder,editor.tab);
              //Update the basicPane
              editor.basicPane = aPane;
            }
          }
          //Objects and arrays earn it's own panes
          else {
            aPane.appendChild(gridRow);
            newTabPanesContainer.appendChild(aPane);
            //newTabs_holder.firstChild.appendChild(editor.tab);
            self.theme.addTopTab(newTabs_holder,editor.tab);
          }

          if(editor.options.hidden) editor.container.style.display = 'none';
          else self.theme.setGridColumnSize(editor.container,12);
          //Now, add the property editor to the row
          gridRow.appendChild(editor.container);
          //Update the rowPane (same as self.rows[x].rowPane)
          editor.rowPane = aPane;

        });

        //Erase old panes
        while (this.tabPanesContainer.firstChild) {
          this.tabPanesContainer.removeChild(this.tabPanesContainer.firstChild);
        }

        //Erase old tabs and set the new ones
        var parentTabs_holder = this.tabs_holder.parentNode;
        parentTabs_holder.removeChild(parentTabs_holder.firstChild);
        parentTabs_holder.appendChild(newTabs_holder);

        this.tabPanesContainer = newTabPanesContainer;
        this.tabs_holder = newTabs_holder;

        //Activate the first tab
        var firstTab = this.theme.getFirstTab(this.tabs_holder);
        if(firstTab){
          $trigger(firstTab,'click');
        }
        return;
      }
      //Normal layout
      else {
        $each(this.property_order, function(i,key) {
          var editor = self.editors[key];
          if(editor.property_removed) return;
          row = self.theme.getGridRow();
          container.appendChild(row);

          if(editor.options.hidden) editor.container.style.display = 'none';
          else self.theme.setGridColumnSize(editor.container,12);
          row.appendChild(editor.container);
        });
      }
    }
    //for grid and normal layout
    while (this.row_container.firstChild) {
      this.row_container.removeChild(this.row_container.firstChild);
    }
    this.row_container.appendChild(container);
  },
  getPropertySchema: function(key) {
    // Schema declared directly in properties
    var schema = this.schema.properties[key] || {};
    schema = $extend({},schema);
    var matched = this.schema.properties[key]? true : false;

    // Any matching patternProperties should be merged in
    if(this.schema.patternProperties) {
      for(var i in this.schema.patternProperties) {
        if(!this.schema.patternProperties.hasOwnProperty(i)) continue;
        var regex = new RegExp(i);
        if(regex.test(key)) {
          schema.allOf = schema.allOf || [];
          schema.allOf.push(this.schema.patternProperties[i]);
          matched = true;
        }
      }
    }

    // Hasn't matched other rules, use additionalProperties schema
    if(!matched && this.schema.additionalProperties && typeof this.schema.additionalProperties === "object") {
      schema = $extend({},this.schema.additionalProperties);
    }

    return schema;
  },
  preBuild: function() {
    this._super();

    this.editors = {};
    this.cached_editors = {};
    var self = this;

    this.format = this.options.layout || this.options.object_layout || this.schema.format || this.jsoneditor.options.object_layout || 'normal';

    this.schema.properties = this.schema.properties || {};

    this.minwidth = 0;
    this.maxwidth = 0;

    // If the object should be rendered as a table row
    if(this.options.table_row) {
      $each(this.schema.properties, function(key,schema) {
        var editor = self.jsoneditor.getEditorClass(schema);
        self.editors[key] = self.jsoneditor.createEditor(editor,{
          jsoneditor: self.jsoneditor,
          schema: schema,
          path: self.path+'.'+key,
          parent: self,
          compact: true,
          required: true
        });
        self.editors[key].preBuild();

        var width = self.editors[key].options.hidden? 0 : (self.editors[key].options.grid_columns || self.editors[key].getNumColumns());

        self.minwidth += width;
        self.maxwidth += width;
      });
      this.no_link_holder = true;
    }
    // If the object should be rendered as a table
    else if(this.options.table) {
      // TODO: table display format
      throw "Not supported yet";
    }
    // If the object should be rendered as a div
    else {
      if(!this.schema.defaultProperties) {
        if(this.jsoneditor.options.display_required_only || this.options.display_required_only) {
          this.schema.defaultProperties = [];
          $each(this.schema.properties, function(k,s) {
            if(self.isRequired({key: k, schema: s})) {
              self.schema.defaultProperties.push(k);
            }
          });
        }
        else {
          self.schema.defaultProperties = Object.keys(self.schema.properties);
        }
      }

      // Increase the grid width to account for padding
      self.maxwidth += 1;

      $each(this.schema.defaultProperties, function(i,key) {
        self.addObjectProperty(key, true);

        if(self.editors[key]) {
          self.minwidth = Math.max(self.minwidth,(self.editors[key].options.grid_columns || self.editors[key].getNumColumns()));
          self.maxwidth += (self.editors[key].options.grid_columns || self.editors[key].getNumColumns());
        }
      });
    }

    // Sort editors by propertyOrder
    this.property_order = Object.keys(this.editors);
    this.property_order = this.property_order.sort(function(a,b) {
      var ordera = self.editors[a].schema.propertyOrder;
      var orderb = self.editors[b].schema.propertyOrder;
      if(typeof ordera !== "number") ordera = 1000;
      if(typeof orderb !== "number") orderb = 1000;

      return ordera - orderb;
    });
  },
  //"Borrow" from arrays code
  addTab: function(idx){
      var self = this;
      var isObjOrArray = self.rows[idx].schema && (self.rows[idx].schema.type === "object" || self.rows[idx].schema.type === "array");
      if(self.tabs_holder) {
        self.rows[idx].tab_text = document.createElement('span');

        if(!isObjOrArray){
          self.rows[idx].tab_text.textContent = (typeof self.schema.basicCategoryTitle === 'undefined') ? "Basic" : self.schema.basicCategoryTitle;
        } else {
          self.rows[idx].tab_text.textContent = self.rows[idx].getHeaderText();
        }
        self.rows[idx].tab = self.theme.getTopTab(self.rows[idx].tab_text,this.getValidId(self.rows[idx].tab_text.textContent));
        self.rows[idx].tab.addEventListener('click', function(e) {
          self.active_tab = self.rows[idx].tab;
          self.refreshTabs();
          e.preventDefault();
          e.stopPropagation();
        });

      }

    },
  addRow: function(editor, tabHolder, aPane) {
    var self = this;
    var rowsLen = this.rows.length;
    var isObjOrArray = editor.schema.type === "object" || editor.schema.type === "array";

    //Add a row
    self.rows[rowsLen] = editor;
    //rowPane stores the editor corresponding pane to set the display style when refreshing Tabs
    self.rows[rowsLen].rowPane = aPane;

    if(!isObjOrArray){

      //This is the first simple property to be added,
      //add a ("Basic") tab for it and save it's row number
      if(typeof self.basicTab === "undefined"){
        self.addTab(rowsLen);
        //Store the index row of the first simple property added
        self.basicTab = rowsLen;
        self.basicPane = aPane;
        self.theme.addTopTab(tabHolder, self.rows[rowsLen].tab);
      }

      else {
        //Any other simple property gets the same tab (and the same pane) as the first one,
        //so, when 'click' event is fired from a row, it gets the correct ("Basic") tab
        self.rows[rowsLen].tab = self.rows[self.basicTab].tab;
        self.rows[rowsLen].tab_text = self.rows[self.basicTab].tab_text;
        self.rows[rowsLen].rowPane = self.rows[self.basicTab].rowPane;
      }
    }
    else {
      self.addTab(rowsLen);
      self.theme.addTopTab(tabHolder, self.rows[rowsLen].tab);
    }
  },
  //Mark the active tab and make visible the corresponding pane, hide others
  refreshTabs: function(refresh_headers) {
    var self = this;
    var basicTabPresent = typeof self.basicTab !== 'undefined';
    var basicTabRefreshed = false;

    $each(this.rows, function(i,row) {
      //If it's an orphan row (some property which has been deleted), return
      if(!row.tab || !row.rowPane || !row.rowPane.parentNode) return;

      if(basicTabPresent && row.tab == self.rows[self.basicTab].tab && basicTabRefreshed) return;

      if(refresh_headers) {
        row.tab_text.textContent = row.getHeaderText();
      }
      else {
        //All rows of simple properties point to the same tab, so refresh just once
        if(basicTabPresent && row.tab == self.rows[self.basicTab].tab) basicTabRefreshed = true;

        if(row.tab === self.active_tab) {
          self.theme.markTabActive(row);
        }
        else {
          self.theme.markTabInactive(row);
        }
      }
    });
  },
  build: function() {
    var self = this;

    var isCategoriesFormat = (this.format === 'categories');
    this.rows=[];
    this.active_tab = null;

    // If the object should be rendered as a table row
    if(this.options.table_row) {
      this.editor_holder = this.container;
      $each(this.editors, function(key,editor) {
        var holder = self.theme.getTableCell();
        self.editor_holder.appendChild(holder);

        editor.setContainer(holder);
        editor.build();
        editor.postBuild();
        editor.setOptInCheckbox(editor.header);

        if(self.editors[key].options.hidden) {
          holder.style.display = 'none';
        }
        if(self.editors[key].options.input_width) {
          holder.style.width = self.editors[key].options.input_width;
        }
      });
    }
    // If the object should be rendered as a table
    else if(this.options.table) {
      // TODO: table display format
      throw "Not supported yet";
    }
    // If the object should be rendered as a div
    else {
      this.header = '';
      if(!this.options.compact) {
        this.header = document.createElement('label');
        this.header.textContent = this.getTitle();
      }
      this.title = this.theme.getHeader(this.header);
      this.container.appendChild(this.title);
      this.container.style.position = 'relative';

      // Edit JSON modal
      this.editjson_holder = this.theme.getModal();
      this.editjson_textarea = this.theme.getTextareaInput();
      this.editjson_textarea.style.height = '170px';
      this.editjson_textarea.style.width = '300px';
      this.editjson_textarea.style.display = 'block';
      this.editjson_save = this.getButton('Save','save','Save');
      this.editjson_save.classList.add('json-editor-btntype-save');
      this.editjson_save.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.saveJSON();
      });
      this.editjson_copy = this.getButton('Copy','copy','Copy');
      this.editjson_copy.classList.add('json-editor-btntype-copy');
      this.editjson_copy.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.copyJSON();
      });
      this.editjson_cancel = this.getButton('Cancel','cancel','Cancel');
      this.editjson_cancel.classList.add('json-editor-btntype-cancel');
      this.editjson_cancel.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.hideEditJSON();
      });
      this.editjson_holder.appendChild(this.editjson_textarea);
      this.editjson_holder.appendChild(this.editjson_save);
      this.editjson_holder.appendChild(this.editjson_copy);
      this.editjson_holder.appendChild(this.editjson_cancel);

      // Manage Properties modal
      this.addproperty_holder = this.theme.getModal();
      this.addproperty_list = document.createElement('div');
      this.addproperty_list.style.width = '295px';
      this.addproperty_list.style.maxHeight = '160px';
      this.addproperty_list.style.padding = '5px 0';
      this.addproperty_list.style.overflowY = 'auto';
      this.addproperty_list.style.overflowX = 'hidden';
      this.addproperty_list.style.paddingLeft = '5px';
      this.addproperty_list.setAttribute('class', 'property-selector');
      this.addproperty_add = this.getButton('add','add','add');
      this.addproperty_add.classList.add('json-editor-btntype-add');
      this.addproperty_input = this.theme.getFormInputField('text');
      this.addproperty_input.setAttribute('placeholder','Property name...');
      this.addproperty_input.style.width = '220px';
      this.addproperty_input.style.marginBottom = '0';
      this.addproperty_input.style.display = 'inline-block';
      this.addproperty_add.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();
        if(self.addproperty_input.value) {
          if(self.editors[self.addproperty_input.value]) {
            window.alert('there is already a property with that name');
            return;
          }

          self.addObjectProperty(self.addproperty_input.value);
          if(self.editors[self.addproperty_input.value]) {
            self.editors[self.addproperty_input.value].disable();
          }
          self.onChange(true);
        }
      });
      this.addproperty_holder.appendChild(this.addproperty_list);
      this.addproperty_holder.appendChild(this.addproperty_input);
      this.addproperty_holder.appendChild(this.addproperty_add);
      var spacer = document.createElement('div');
      spacer.style.clear = 'both';
      this.addproperty_holder.appendChild(spacer);

      // Close properties modal if clicked outside modal
      document.addEventListener('click', function(e) {
          if (!this.addproperty_holder.contains(e.target) && this.adding_property) {
            e.preventDefault();
            e.stopPropagation();
            this.toggleAddProperty();
          }
      }.bind(this));

      // Description
      if(this.schema.description) {
        this.description = this.theme.getDescription(this.schema.description);
        this.container.appendChild(this.description);
      }

      // Validation error placeholder area
      this.error_holder = document.createElement('div');
      this.container.appendChild(this.error_holder);

      // Container for child editor area
      this.editor_holder = this.theme.getIndentedPanel();
      this.container.appendChild(this.editor_holder);

      // Container for rows of child editors
      this.row_container = this.theme.getGridContainer();

      if(isCategoriesFormat) {
        this.tabs_holder = this.theme.getTopTabHolder(this.getValidId(this.schema.title));
        this.tabPanesContainer = this.theme.getTopTabContentHolder(this.tabs_holder);
        this.editor_holder.appendChild(this.tabs_holder);
      }
      else {
        this.tabs_holder = this.theme.getTabHolder(this.getValidId(this.schema.title));
        this.tabPanesContainer = this.theme.getTabContentHolder(this.tabs_holder);
        this.editor_holder.appendChild(this.row_container);
      }

      $each(this.editors, function(key,editor) {
        var aPane = self.theme.getTabContent();
        var holder = self.theme.getGridColumn();
        var isObjOrArray = (editor.schema && (editor.schema.type === 'object' || editor.schema.type === 'array')) ? true : false;
        aPane.isObjOrArray = isObjOrArray;

        if(isCategoriesFormat){
          if(isObjOrArray) {
            var single_row_container = self.theme.getGridContainer();
            single_row_container.appendChild(holder);
            aPane.appendChild(single_row_container);
            self.tabPanesContainer.appendChild(aPane);
            self.row_container = single_row_container;
          }
          else {
            if(typeof self.row_container_basic === 'undefined'){
              self.row_container_basic = self.theme.getGridContainer();
              aPane.appendChild(self.row_container_basic);
              if(self.tabPanesContainer.childElementCount == 0){
                self.tabPanesContainer.appendChild(aPane);
              }
              else {
                self.tabPanesContainer.insertBefore(aPane,self.tabPanesContainer.childNodes[1]);
              }
            }
            self.row_container_basic.appendChild(holder);
          }

          self.addRow(editor,self.tabs_holder,aPane);

          aPane.id = self.getValidId(editor.schema.title); //editor.schema.path//tab_text.textContent

        }
        else {
          self.row_container.appendChild(holder);
        }

        editor.setContainer(holder);
        editor.build();
        editor.postBuild();
        editor.setOptInCheckbox(editor.header);
      });

      if(this.rows[0]){
        $trigger(this.rows[0].tab,'click');
      }

      // Control buttons
      this.title_controls = this.theme.getHeaderButtonHolder();
      this.editjson_controls = this.theme.getHeaderButtonHolder();
      this.addproperty_controls = this.theme.getHeaderButtonHolder();
      this.title.appendChild(this.title_controls);
      this.title.appendChild(this.editjson_controls);
      this.title.appendChild(this.addproperty_controls);

      // Show/Hide button
      this.collapsed = false;
      this.toggle_button = this.getButton('', 'collapse', this.translate('button_collapse'));
      this.toggle_button.classList.add('json-editor-btntype-toggle');
      this.title_controls.appendChild(this.toggle_button);
      this.toggle_button.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();
        if(self.collapsed) {
          self.editor_holder.style.display = '';
          self.collapsed = false;
          self.setButtonText(self.toggle_button,'','collapse',self.translate('button_collapse'));
        }
        else {
          self.editor_holder.style.display = 'none';
          self.collapsed = true;
          self.setButtonText(self.toggle_button,'','expand',self.translate('button_expand'));
        }
      });

      // If it should start collapsed
      if(this.options.collapsed) {
        $trigger(this.toggle_button,'click');
      }

      // Collapse button disabled
      if(this.schema.options && typeof this.schema.options.disable_collapse !== "undefined") {
        if(this.schema.options.disable_collapse) this.title_controls.style.display = 'none';
      }
      else if(this.jsoneditor.options.disable_collapse) {
        this.title_controls.style.display = 'none';
      }

      // Edit JSON Button
      this.editjson_button = this.getButton('JSON','edit','Edit JSON');
      this.editjson_button.classList.add('json-editor-btntype-editjson');
      this.editjson_button.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.toggleEditJSON();
      });
      this.editjson_controls.appendChild(this.editjson_button);
      this.editjson_controls.appendChild(this.editjson_holder);

      // Edit JSON Buttton disabled
      if(this.schema.options && typeof this.schema.options.disable_edit_json !== "undefined") {
        if(this.schema.options.disable_edit_json) this.editjson_controls.style.display = 'none';
      }
      else if(this.jsoneditor.options.disable_edit_json) {
        this.editjson_controls.style.display = 'none';
      }

      // Object Properties Button
      this.addproperty_button = this.getButton('Properties','edit', self.translate('button_object_properties'));
      this.addproperty_button.classList.add('json-editor-btntype-properties');
      this.addproperty_button.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.toggleAddProperty();
      });
      this.addproperty_controls.appendChild(this.addproperty_button);
      this.addproperty_controls.appendChild(this.addproperty_holder);
      this.refreshAddProperties();

      // non required properties start deactivated
      this.deactivateNonRequiredProperties();

    }

    // Fix table cell ordering
    if(this.options.table_row) {
      this.editor_holder = this.container;
      $each(this.property_order,function(i,key) {
        self.editor_holder.appendChild(self.editors[key].container);
      });
    }
    // Layout object editors in grid if needed
    else {
      // Initial layout
      this.layoutEditors();
      // Do it again now that we know the approximate heights of elements
      this.layoutEditors();
    }
  },
  deactivateNonRequiredProperties: function () {
    var self = this;
    // the show_opt_in editor option is for backward compatibility
    if (this.jsoneditor.options.show_opt_in || this.options.show_opt_in) {
      $each(this.editors, function(key, editor) {
        if (!self.isRequired(editor)) {
          self.editors[key].deactivate();
        }
      });
    }
  },
  showEditJSON: function() {
    if(!this.editjson_holder) return;
    this.hideAddProperty();

    // Position the form directly beneath the button
    // TODO: edge detection
    this.editjson_holder.style.left = this.editjson_button.offsetLeft+"px";
    this.editjson_holder.style.top = this.editjson_button.offsetTop + this.editjson_button.offsetHeight+"px";

    // Start the textarea with the current value
    this.editjson_textarea.value = JSON.stringify(this.getValue(),null,2);

    // Disable the rest of the form while editing JSON
    this.disable();

    this.editjson_holder.style.display = '';
    this.editjson_button.disabled = false;
    this.editing_json = true;
  },
  hideEditJSON: function() {
    if(!this.editjson_holder) return;
    if(!this.editing_json) return;

    this.editjson_holder.style.display = 'none';
    this.enable();
    this.editing_json = false;
  },
  copyJSON: function() {
    if(!this.editjson_holder) return;
    var ta = document.createElement('textarea');
    ta.value = this.editjson_textarea.value;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  },
  saveJSON: function() {
    if(!this.editjson_holder) return;

    try {
      var json = JSON.parse(this.editjson_textarea.value);
      this.setValue(json);
      this.hideEditJSON();
      this.onChange(true);
    }
    catch(e) {
      window.alert('invalid JSON');
      throw e;
    }
  },
  toggleEditJSON: function() {
    if(this.editing_json) this.hideEditJSON();
    else this.showEditJSON();
  },
  insertPropertyControlUsingPropertyOrder: function (property, control, container) {
    var propertyOrder;
    if (this.schema.properties[property])
      propertyOrder = this.schema.properties[property].propertyOrder;
    if (typeof propertyOrder !== "number") propertyOrder = 1000;
    control.propertyOrder = propertyOrder;

    for (var i = 0; i < container.childNodes.length; i++) {
      var child = container.childNodes[i];
      if (control.propertyOrder < child.propertyOrder) {
        this.addproperty_list.insertBefore(control, child);
        control = null;
        break;
      }
    }
    if (control) {
      this.addproperty_list.appendChild(control);
    }
  },
  addPropertyCheckbox: function(key) {
    var self = this;
    var checkbox, label, labelText, control;

    checkbox = self.theme.getCheckbox();
    checkbox.style.width = 'auto';

    if (this.schema.properties[key] && this.schema.properties[key].title)
      labelText = this.schema.properties[key].title;
    else
      labelText = key;

    label = self.theme.getCheckboxLabel(labelText);

    control = self.theme.getFormControl(label,checkbox);
    control.style.paddingBottom = control.style.marginBottom = control.style.paddingTop = control.style.marginTop = 0;
    control.style.height = 'auto';
    //control.style.overflowY = 'hidden';

    this.insertPropertyControlUsingPropertyOrder(key, control, this.addproperty_list);

    checkbox.checked = key in this.editors;
    checkbox.addEventListener('change',function() {
      if(checkbox.checked) {
        self.addObjectProperty(key);
      }
      else {
        self.removeObjectProperty(key);
      }
      self.onChange(true);
    });
    self.addproperty_checkboxes[key] = checkbox;

    return checkbox;
  },
  showAddProperty: function() {
    if(!this.addproperty_holder) return;
    this.hideEditJSON();

    // Position the form directly beneath the button
    // TODO: edge detection
    this.addproperty_holder.style.left = this.addproperty_button.offsetLeft+"px";
    this.addproperty_holder.style.top = this.addproperty_button.offsetTop + this.addproperty_button.offsetHeight+"px";

    // Disable the rest of the form while editing JSON
    this.disable();

    this.adding_property = true;
    this.addproperty_button.disabled = false;
    this.addproperty_holder.style.display = '';
    this.refreshAddProperties();
  },
  hideAddProperty: function() {
    if(!this.addproperty_holder) return;
    if(!this.adding_property) return;

    this.addproperty_holder.style.display = 'none';
    this.enable();

    this.adding_property = false;
  },
  toggleAddProperty: function() {
    if(this.adding_property) this.hideAddProperty();
    else this.showAddProperty();
  },
  removeObjectProperty: function(property) {
    if(this.editors[property]) {
        this.editors[property].unregister();
        delete this.editors[property];

      this.refreshValue();
      this.layoutEditors();
    }
  },
  addObjectProperty: function(name, prebuild_only) {
    var self = this;

    // Property is already added
    if(this.editors[name]) return;

    // Property was added before and is cached
    if(this.cached_editors[name]) {
      this.editors[name] = this.cached_editors[name];
      if(prebuild_only) return;
      this.editors[name].register();
    }
    // New property
    else {
      if(!this.canHaveAdditionalProperties() && (!this.schema.properties || !this.schema.properties[name])) {
        return;
      }

      var schema = self.getPropertySchema(name);
      if(typeof schema.propertyOrder !== 'number'){
        // if the propertyOrder undefined, then set a smart default value.
        schema.propertyOrder = Object.keys(self.editors).length + 1000;
      }


      // Add the property
      var editor = self.jsoneditor.getEditorClass(schema);

      self.editors[name] = self.jsoneditor.createEditor(editor,{
        jsoneditor: self.jsoneditor,
        schema: schema,
        path: self.path+'.'+name,
        parent: self
      });
      self.editors[name].preBuild();

      if(!prebuild_only) {
        var holder = self.theme.getChildEditorHolder();
        self.editor_holder.appendChild(holder);
        self.editors[name].setContainer(holder);
        self.editors[name].build();
        self.editors[name].postBuild();
        self.editors[name].setOptInCheckbox(editor.header);
        self.editors[name].activate();
      }

      self.cached_editors[name] = self.editors[name];
    }

    // If we're only prebuilding the editors, don't refresh values
    if(!prebuild_only) {
      self.refreshValue();
      self.layoutEditors();
    }
  },
  onChildEditorChange: function(editor) {
    this.refreshValue();
    this._super(editor);
  },
  canHaveAdditionalProperties: function() {
    if (typeof this.schema.additionalProperties === "boolean") {
      return this.schema.additionalProperties;
    }
    return !this.jsoneditor.options.no_additional_properties;
  },
  destroy: function() {
    $each(this.cached_editors, function(i,el) {
      el.destroy();
    });
    if(this.editor_holder) this.editor_holder.innerHTML = '';
    if(this.title && this.title.parentNode) this.title.parentNode.removeChild(this.title);
    if(this.error_holder && this.error_holder.parentNode) this.error_holder.parentNode.removeChild(this.error_holder);

    this.editors = null;
    this.cached_editors = null;
    if(this.editor_holder && this.editor_holder.parentNode) this.editor_holder.parentNode.removeChild(this.editor_holder);
    this.editor_holder = null;

    this._super();
  },
  getValue: function() {
    if (!this.dependenciesFulfilled) {
      return undefined;
    }
    var result = this._super();
    if(this.jsoneditor.options.remove_empty_properties || this.options.remove_empty_properties) {
      for (var i in result) {
        if (result.hasOwnProperty(i)) {
          if (typeof result[i] === 'undefined' || result[i] === '' || result[i] === Object(result[i]) && Object.keys(result[i]).length == 0 && result[i].constructor == Object) {
            delete result[i];
          }
        }
      }
    }

    return result;
  },
  refreshValue: function() {
    this.value = {};
    var self = this;

    for(var i in this.editors) {
      if(!this.editors.hasOwnProperty(i)) continue;
      if (this.editors[i].isActive()) {
        this.value[i] = this.editors[i].getValue();
      }
    }

    if(this.adding_property) this.refreshAddProperties();
  },
  refreshAddProperties: function() {
    if(this.options.disable_properties || (this.options.disable_properties !== false && this.jsoneditor.options.disable_properties)) {
      this.addproperty_controls.style.display = 'none';
      return;
    }

    var can_add = false, can_remove = false, num_props = 0, i, show_modal = false;

    // Get number of editors
    for(i in this.editors) {
      if(!this.editors.hasOwnProperty(i)) continue;
      num_props++;
    }

    // Determine if we can add back removed properties
    can_add = this.canHaveAdditionalProperties() && !(typeof this.schema.maxProperties !== "undefined" && num_props >= this.schema.maxProperties);

    if(this.addproperty_checkboxes) {
      this.addproperty_list.innerHTML = '';
    }
    this.addproperty_checkboxes = {};

    // Check for which editors can't be removed or added back
    for(i in this.cached_editors) {
      if(!this.cached_editors.hasOwnProperty(i)) continue;

      this.addPropertyCheckbox(i);

      if(this.isRequired(this.cached_editors[i]) && i in this.editors) {
        this.addproperty_checkboxes[i].disabled = true;
      }

      if(typeof this.schema.minProperties !== "undefined" && num_props <= this.schema.minProperties) {
        this.addproperty_checkboxes[i].disabled = this.addproperty_checkboxes[i].checked;
        if(!this.addproperty_checkboxes[i].checked) show_modal = true;
      }
      else if(!(i in this.editors)) {
        if(!can_add  && !this.schema.properties.hasOwnProperty(i)) {
          this.addproperty_checkboxes[i].disabled = true;
        }
        else {
          this.addproperty_checkboxes[i].disabled = false;
          show_modal = true;
        }
      }
      else {
        show_modal = true;
        can_remove = true;
      }
    }

    if(this.canHaveAdditionalProperties()) {
      show_modal = true;
    }

    // Additional addproperty checkboxes not tied to a current editor
    for(i in this.schema.properties) {
      if(!this.schema.properties.hasOwnProperty(i)) continue;
      if(this.cached_editors[i]) continue;
      show_modal = true;
      this.addPropertyCheckbox(i);
    }

    // If no editors can be added or removed, hide the modal button
    if(!show_modal) {
      this.hideAddProperty();
      this.addproperty_controls.style.display = 'none';
    }
    // If additional properties are disabled
    else if(!this.canHaveAdditionalProperties()) {
      this.addproperty_add.style.display = 'none';
      this.addproperty_input.style.display = 'none';
    }
    // If no new properties can be added
    else if(!can_add) {
      this.addproperty_add.disabled = true;
    }
    // If new properties can be added
    else {
      this.addproperty_add.disabled = false;
    }
  },
  isRequired: function(editor) {
    if (!editor) {
      return;
    }
    if(typeof editor.schema.required === "boolean") return editor.schema.required;
    else if(Array.isArray(this.schema.required)) return this.schema.required.indexOf(editor.key) > -1;
    else if(this.jsoneditor.options.required_by_default) return true;
    else return false;
  },
  setValue: function(value, initial) {
    var self = this;
    value = value || {};

    if(typeof value !== "object" || Array.isArray(value)) value = {};

    // First, set the values for all of the defined properties
    $each(this.cached_editors, function(i,editor) {
      // Value explicitly set
      if(typeof value[i] !== "undefined") {
        self.addObjectProperty(i);
        editor.setValue(value[i],initial);
      }
      // Otherwise, remove value unless this is the initial set or it's required
      else if(!initial && !self.isRequired(editor)) {
        self.removeObjectProperty(i);
      }
      // Otherwise, set the value to the default
      else {
        editor.setValue(editor.getDefault(),initial);
      }
    });

    $each(value, function(i,val) {
      if(!self.cached_editors[i]) {
        self.addObjectProperty(i);
        if(self.editors[i]) self.editors[i].setValue(val,initial);
      }
    });

    this.refreshValue();
    this.layoutEditors();
    this.onChange();
  },
  showValidationErrors: function(errors) {
    var self = this;

    // Get all the errors that pertain to this editor
    var my_errors = [];
    var other_errors = [];
    $each(errors, function(i,error) {
      if(error.path === self.path) {
        my_errors.push(error);
      }
      else {
        other_errors.push(error);
      }
    });

    // Show errors for this editor
    if(this.error_holder) {
      if(my_errors.length) {
        var message = [];
        this.error_holder.innerHTML = '';
        this.error_holder.style.display = '';
        $each(my_errors, function(i,error) {
          self.error_holder.appendChild(self.theme.getErrorMessage(error.message));
        });
      }
      // Hide error area
      else {
        this.error_holder.style.display = 'none';
      }
    }

    // Show error for the table row if this is inside a table
    if(this.options.table_row) {
      if(my_errors.length) {
        this.theme.addTableRowError(this.container);
      }
      else {
        this.theme.removeTableRowError(this.container);
      }
    }

    // Show errors for child editors
    $each(this.editors, function(i,editor) {
      editor.showValidationErrors(other_errors);
    });
  }
});

JSONEditor.defaults.editors.array = JSONEditor.AbstractEditor.extend({
  askConfirmation: function() {
    if (this.jsoneditor.options.prompt_before_delete === true) {
      if (confirm("Are you sure you want to remove this node?") === false) {
        return false;
      }
    }
    return true;
  },
  getDefault: function() {
    return this.schema["default"] || [];
  },
  register: function() {
    this._super();
    if(this.rows) {
      for(var i=0; i<this.rows.length; i++) {
        this.rows[i].register();
      }
    }
  },
  unregister: function() {
    this._super();
    if(this.rows) {
      for(var i=0; i<this.rows.length; i++) {
        this.rows[i].unregister();
      }
    }
  },
  getNumColumns: function() {
    var info = this.getItemInfo(0);
    // Tabs require extra horizontal space
    if(this.tabs_holder && this.schema.format !== 'tabs-top') {
      return Math.max(Math.min(12,info.width+2),4);
    }
    else {
      return info.width;
    }
  },
  enable: function() {
    if(!this.always_disabled) {
      if(this.add_row_button) this.add_row_button.disabled = false;
      if(this.remove_all_rows_button) this.remove_all_rows_button.disabled = false;
      if(this.delete_last_row_button) this.delete_last_row_button.disabled = false;
      if(this.copy_button) this.copy_button.disabled = false;
      //if(this.toggle_button) this.toggle_button.disabled = false;
      if(this.delete_button) this.delete_button.disabled = false;
      if(this.moveup_button) this.moveup_button.disabled = false;
      if(this.movedown_button) this.movedown_button.disabled = false;

      if(this.rows) {
        for(var i=0; i<this.rows.length; i++) {
          this.rows[i].enable();

          if(this.rows[i].add_row_button) this.rows[i].add_row_button.disabled = false;
          if(this.rows[i].remove_all_rows_button) this.rows[i].remove_all_rows_button.disabled = false;
          if(this.rows[i].delete_last_row_button) this.rows[i].delete_last_row_button.disabled = false;
          if(this.rows[i].copy_button) this.rows[i].copy_button.disabled = false;
          //if(this.rows[i].toggle_button) this.rows[i].toggle_button.disabled = false;
          if(this.rows[i].delete_button) this.rows[i].delete_button.disabled = false;
          if(this.rows[i].moveup_button) this.rows[i].moveup_button.disabled = false;
          if(this.rows[i].movedown_button) this.rows[i].movedown_button.disabled = false;
        }
      }
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    if(this.add_row_button) this.add_row_button.disabled = true;
    if(this.remove_all_rows_button) this.remove_all_rows_button.disabled = true;
    if(this.delete_last_row_button) this.delete_last_row_button.disabled = true;
    if(this.copy_button) this.copy_button.disabled = true;
    //if(this.toggle_button) this.toggle_button.disabled = true;
    if(this.delete_button) this.delete_button.disabled = true;
    if(this.moveup_button) this.moveup_button.disabled = true;
    if(this.movedown_button) this.movedown_button.disabled = true;


    if(this.rows) {
      for(var i=0; i<this.rows.length; i++) {
        this.rows[i].disable(always_disabled);

        if(this.rows[i].add_row_button) this.rows[i].add_row_button.disabled = true;
        if(this.rows[i].remove_all_rows_button) this.rows[i].remove_all_rows_button.disabled = true;
        if(this.rows[i].delete_last_row_button) this.rows[i].delete_last_row_button.disabled = true;
        if(this.rows[i].copy_button) this.rows[i].copy_button.disabled = true;
        //if(this.rows[i].toggle_button) this.rows[i].toggle_button.disabled = true;
        if(this.rows[i].delete_button) this.rows[i].delete_button.disabled = true;
        if(this.rows[i].moveup_button) this.rows[i].moveup_button.disabled = true;
       if(this.rows[i].movedown_button) this.rows[i].movedown_button.disabled = true;

      }
    }
    this._super();
  },
  preBuild: function() {
    this._super();

    this.rows = [];
    this.row_cache = [];

    this.hide_delete_buttons = this.options.disable_array_delete || this.jsoneditor.options.disable_array_delete;
    this.hide_delete_all_rows_buttons = this.hide_delete_buttons || this.options.disable_array_delete_all_rows || this.jsoneditor.options.disable_array_delete_all_rows;
    this.hide_delete_last_row_buttons = this.hide_delete_buttons || this.options.disable_array_delete_last_row || this.jsoneditor.options.disable_array_delete_last_row;
    this.hide_move_buttons = this.options.disable_array_reorder || this.jsoneditor.options.disable_array_reorder;
    this.hide_add_button = this.options.disable_array_add || this.jsoneditor.options.disable_array_add;
    this.show_copy_button = this.options.enable_array_copy || this.jsoneditor.options.enable_array_copy;
    this.array_controls_top = this.options.array_controls_top || this.jsoneditor.options.array_controls_top;
  },
  build: function() {
    var self = this;

    if(!this.options.compact) {
      this.header = document.createElement('label');
      this.header.textContent = this.getTitle();
      this.title = this.theme.getHeader(this.header);
      this.container.appendChild(this.title);
      this.title_controls = this.theme.getHeaderButtonHolder();
      this.title.appendChild(this.title_controls);
      if(this.schema.description) {
        this.description = this.theme.getDescription(this.schema.description);
        this.container.appendChild(this.description);
      }
      this.error_holder = document.createElement('div');
      this.container.appendChild(this.error_holder);

      if(this.schema.format === 'tabs-top') {
        this.controls = this.theme.getHeaderButtonHolder();
        this.title.appendChild(this.controls);
        this.tabs_holder = this.theme.getTopTabHolder(this.getValidId(this.getItemTitle()));
        this.container.appendChild(this.tabs_holder);
        this.row_holder = this.theme.getTopTabContentHolder(this.tabs_holder);

        this.active_tab = null;
      }
      else if(this.schema.format === 'tabs') {
        this.controls = this.theme.getHeaderButtonHolder();
        this.title.appendChild(this.controls);
        this.tabs_holder = this.theme.getTabHolder(this.getValidId(this.getItemTitle()));
        this.container.appendChild(this.tabs_holder);
        this.row_holder = this.theme.getTabContentHolder(this.tabs_holder);

        this.active_tab = null;
      }
      else {
        this.panel = this.theme.getIndentedPanel();
        this.container.appendChild(this.panel);
        this.row_holder = document.createElement('div');
        this.panel.appendChild(this.row_holder);
        this.controls = this.theme.getButtonHolder();
        if (this.array_controls_top) {
          this.title.appendChild(this.controls);
        }
        else {
          this.panel.appendChild(this.controls);
        }
      }
    }
    else {
        this.panel = this.theme.getIndentedPanel();
        this.container.appendChild(this.panel);
        this.title_controls = this.theme.getHeaderButtonHolder();
        this.panel.appendChild(this.title_controls);
        this.controls = this.theme.getButtonHolder();
        this.panel.appendChild(this.controls);
        this.row_holder = document.createElement('div');
        this.panel.appendChild(this.row_holder);
    }

    // Add controls
    this.addControls();
  },
  onChildEditorChange: function(editor) {
    this.refreshValue();
    this.refreshTabs(true);
    this._super(editor);
  },
  getItemTitle: function() {
    if(!this.item_title) {
      if(this.schema.items && !Array.isArray(this.schema.items)) {
        var tmp = this.jsoneditor.expandRefs(this.schema.items);
        this.item_title = tmp.title || 'item';
      }
      else {
        this.item_title = 'item';
      }
    }
    return this.cleanText(this.item_title);
  },
  getItemSchema: function(i) {
    if(Array.isArray(this.schema.items)) {
      if(i >= this.schema.items.length) {
        if(this.schema.additionalItems===true) {
          return {};
        }
        else if(this.schema.additionalItems) {
          return $extend({},this.schema.additionalItems);
        }
      }
      else {
        return $extend({},this.schema.items[i]);
      }
    }
    else if(this.schema.items) {
      return $extend({},this.schema.items);
    }
    else {
      return {};
    }
  },
  getItemInfo: function(i) {
    var schema = this.getItemSchema(i);

    // Check if it's cached
    this.item_info = this.item_info || {};
    var stringified = JSON.stringify(schema);
    if(typeof this.item_info[stringified] !== "undefined") return this.item_info[stringified];

    // Get the schema for this item
    schema = this.jsoneditor.expandRefs(schema);

    this.item_info[stringified] = {
      title: schema.title || "item",
      'default': schema["default"],
      width: 12,
      child_editors: schema.properties || schema.items
    };

    return this.item_info[stringified];
  },
  getElementEditor: function(i) {
    var item_info = this.getItemInfo(i);
    var schema = this.getItemSchema(i);
    schema = this.jsoneditor.expandRefs(schema);
    schema.title = item_info.title+' '+(i+1);

    var editor = this.jsoneditor.getEditorClass(schema);

    var holder;
    if(this.tabs_holder) {
      if(this.schema.format === 'tabs-top') {
        holder = this.theme.getTopTabContent();
      }
      else {
        holder = this.theme.getTabContent();
      }
      holder.id = this.path+'.'+i;
    }
    else if(item_info.child_editors) {
      holder = this.theme.getChildEditorHolder();
    }
    else {
      holder = this.theme.getIndentedPanel();
    }

    this.row_holder.appendChild(holder);

    var ret = this.jsoneditor.createEditor(editor,{
      jsoneditor: this.jsoneditor,
      schema: schema,
      container: holder,
      path: this.path+'.'+i,
      parent: this,
      required: true
    });
    ret.preBuild();
    ret.build();
    ret.postBuild();

    if(!ret.title_controls) {
      ret.array_controls = this.theme.getButtonHolder();
      holder.appendChild(ret.array_controls);
    }

    return ret;
  },
  destroy: function() {
    this.empty(true);
    if(this.title && this.title.parentNode) this.title.parentNode.removeChild(this.title);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    if(this.row_holder && this.row_holder.parentNode) this.row_holder.parentNode.removeChild(this.row_holder);
    if(this.controls && this.controls.parentNode) this.controls.parentNode.removeChild(this.controls);
    if(this.panel && this.panel.parentNode) this.panel.parentNode.removeChild(this.panel);

    this.rows = this.row_cache = this.title = this.description = this.row_holder = this.panel = this.controls = null;

    this._super();
  },
  empty: function(hard) {
    if(!this.rows) return;
    var self = this;
    $each(this.rows,function(i,row) {
      if(hard) {
        if(row.tab && row.tab.parentNode) row.tab.parentNode.removeChild(row.tab);
        self.destroyRow(row,true);
        self.row_cache[i] = null;
      }
      self.rows[i] = null;
    });
    self.rows = [];
    if(hard) self.row_cache = [];
  },
  destroyRow: function(row,hard) {
    var holder = row.container;
    if(hard) {
      row.destroy();
      if(holder.parentNode) holder.parentNode.removeChild(holder);
      if(row.tab && row.tab.parentNode) row.tab.parentNode.removeChild(row.tab);
    }
    else {
      if(row.tab) row.tab.style.display = 'none';
      holder.style.display = 'none';
      row.unregister();
    }
  },
  getMax: function() {
    if((Array.isArray(this.schema.items)) && this.schema.additionalItems === false) {
      return Math.min(this.schema.items.length,this.schema.maxItems || Infinity);
    }
    else {
      return this.schema.maxItems || Infinity;
    }
  },
  refreshTabs: function(refresh_headers) {
    var self = this;
    $each(this.rows, function(i,row) {
      if(!row.tab) return;

      if(refresh_headers) {
        row.tab_text.textContent = row.getHeaderText();
      }
      else {
        if(row.tab === self.active_tab) {
          self.theme.markTabActive(row);
        }
        else {
          self.theme.markTabInactive(row);
        }
      }
    });
  },
  setValue: function(value, initial) {
    // Update the array's value, adding/removing rows when necessary
    value = value || [];

    if(!(Array.isArray(value))) value = [value];

    var serialized = JSON.stringify(value);
    if(serialized === this.serialized) return;

    // Make sure value has between minItems and maxItems items in it
    if(this.schema.minItems) {
      while(value.length < this.schema.minItems) {
        value.push(this.getItemInfo(value.length)["default"]);
      }
    }
    if(this.getMax() && value.length > this.getMax()) {
      value = value.slice(0,this.getMax());
    }

    var self = this;
    $each(value,function(i,val) {
      if(self.rows[i]) {
        // TODO: don't set the row's value if it hasn't changed
        self.rows[i].setValue(val,initial);
      }
      else if(self.row_cache[i]) {
        self.rows[i] = self.row_cache[i];
        self.rows[i].setValue(val,initial);
        self.rows[i].container.style.display = '';
        if(self.rows[i].tab) self.rows[i].tab.style.display = '';
        self.rows[i].register();
        self.jsoneditor.trigger('addRow', self.rows[i]);
      }
      else {
        var editor = self.addRow(val,initial);
        self.jsoneditor.trigger('addRow', editor);
      }
    });

    for(var j=value.length; j<self.rows.length; j++) {
      self.destroyRow(self.rows[j]);
      self.rows[j] = null;
    }
    self.rows = self.rows.slice(0,value.length);

    // Set the active tab
    var new_active_tab = null;
    $each(self.rows, function(i,row) {
      if(row.tab === self.active_tab) {
        new_active_tab = row.tab;
        return false;
      }
    });
    if(!new_active_tab && self.rows.length) new_active_tab = self.rows[0].tab;

    self.active_tab = new_active_tab;

    self.refreshValue(initial);
    self.refreshTabs(true);
    self.refreshTabs();

    self.onChange();

    // TODO: sortable
  },
  refreshValue: function(force) {
    var self = this;
    var oldi = this.value? this.value.length : 0;
    this.value = [];

    $each(this.rows,function(i,editor) {
      // Get the value for this editor
      self.value[i] = editor.getValue();
    });

    if(oldi !== this.value.length || force) {
      // If we currently have minItems items in the array
      var minItems = this.schema.minItems && this.schema.minItems >= this.rows.length;

      $each(this.rows,function(i,editor) {
        // Hide the move down button for the last row
        if(editor.movedown_button) {
          if(i === self.rows.length - 1) {
            editor.movedown_button.style.display = 'none';
          }
          else {
            editor.movedown_button.style.display = '';
          }
        }

        // Hide the delete button if we have minItems items
        if(editor.delete_button) {
          if(minItems) {
            editor.delete_button.style.display = 'none';
          }
          else {
            editor.delete_button.style.display = '';
          }
        }

        // Get the value for this editor
        self.value[i] = editor.getValue();
      });

      var controls_needed = false;

      if(!this.value.length) {
        this.delete_last_row_button.style.display = 'none';
        this.remove_all_rows_button.style.display = 'none';
      }
      else if(this.value.length === 1) {
        this.remove_all_rows_button.style.display = 'none';

        // If there are minItems items in the array, or configured to hide the delete_last_row button, hide the delete button beneath the rows
        if(minItems || this.hide_delete_last_row_buttons) {
          this.delete_last_row_button.style.display = 'none';
        }
        else {
          this.delete_last_row_button.style.display = '';
          controls_needed = true;
        }
      }
      else {
        if(minItems || this.hide_delete_last_row_buttons) {
          this.delete_last_row_button.style.display = 'none';
        }
        else {
          this.delete_last_row_button.style.display = '';
          controls_needed = true;
        }

        if(minItems || this.hide_delete_all_rows_buttons) {
          this.remove_all_rows_button.style.display = 'none';
        }
        else {
          this.remove_all_rows_button.style.display = '';
          controls_needed = true;
        }
      }

      // If there are maxItems in the array, hide the add button beneath the rows
      if((this.getMax() && this.getMax() <= this.rows.length) || this.hide_add_button){
        this.add_row_button.style.display = 'none';
      }
      else {
        this.add_row_button.style.display = '';
        controls_needed = true;
      }

      if(!this.collapsed && controls_needed) {
        this.controls.style.display = 'inline-block';
      }
      else {
        this.controls.style.display = 'none';
      }
    }
  },
  addRow: function(value, initial) {
    var self = this;
    var i = this.rows.length;

    self.rows[i] = this.getElementEditor(i);
    self.row_cache[i] = self.rows[i];

    if(self.tabs_holder) {
      self.rows[i].tab_text = document.createElement('span');
      self.rows[i].tab_text.textContent = self.rows[i].getHeaderText();
      if(self.schema.format === 'tabs-top'){
        self.rows[i].tab = self.theme.getTopTab(self.rows[i].tab_text,this.getValidId(self.rows[i].path));
        self.theme.addTopTab(self.tabs_holder, self.rows[i].tab);
      }
      else {
        self.rows[i].tab = self.theme.getTab(self.rows[i].tab_text,this.getValidId(self.rows[i].path));
        self.theme.addTab(self.tabs_holder, self.rows[i].tab);
      }
      self.rows[i].tab.addEventListener('click', function(e) {
        self.active_tab = self.rows[i].tab;
        self.refreshTabs();
        e.preventDefault();
        e.stopPropagation();
      });

    }

    var controls_holder = self.rows[i].title_controls || self.rows[i].array_controls;

    // Buttons to delete row, move row up, and move row down
    if(!self.hide_delete_buttons) {
      self.rows[i].delete_button = this.getButton(self.getItemTitle(),'delete',this.translate('button_delete_row_title',[self.getItemTitle()]));
      self.rows[i].delete_button.classList.add('delete', 'json-editor-btntype-delete');
      self.rows[i].delete_button.setAttribute('data-i',i);
      self.rows[i].delete_button.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!self.askConfirmation()) {
          return false;
        }

        var i = this.getAttribute('data-i')*1;
        var value = self.getValue();
        var newval = [];
        var new_active_tab = null;

        $each(value,function(j,row) {
          if(j !== i) {
            newval.push(row);
          }
        });

        var editor = self.rows[i];

        self.setValue(newval);

        if (self.rows[i]) {
          new_active_tab = self.rows[i].tab;
        } else if (self.rows[i-1]) {
          new_active_tab = self.rows[i-1].tab;
        }

        if(new_active_tab) {
          self.active_tab = new_active_tab;
          self.refreshTabs();
        }

        self.onChange(true);
        self.jsoneditor.trigger('deleteRow', editor);
      });

      if(controls_holder) {
        controls_holder.appendChild(self.rows[i].delete_button);
      }
    }

	  //Button to copy an array element and add it as last element
    if(self.show_copy_button){
      self.rows[i].copy_button = this.getButton(self.getItemTitle(),'copy','Copy '+self.getItemTitle());
      self.rows[i].copy_button.classList.add('copy', 'json-editor-btntype-copy');
      self.rows[i].copy_button.setAttribute('data-i',i);
      self.rows[i].copy_button.addEventListener('click',function(e) {
          var value = self.getValue();
          e.preventDefault();
          e.stopPropagation();
          var i = this.getAttribute('data-i')*1;

          $each(value,function(j,row) {
            if(j===i) {
              value.push(row);
            }
          });

          self.setValue(value);
          self.refreshValue(true);
          self.onChange(true);
      });

      controls_holder.appendChild(self.rows[i].copy_button);
    }


    if(i && !self.hide_move_buttons) {
      self.rows[i].moveup_button = this.getButton('','moveup',this.translate('button_move_up_title'));
      self.rows[i].moveup_button.classList.add('moveup', 'json-editor-btntype-move');
      self.rows[i].moveup_button.setAttribute('data-i',i);
      self.rows[i].moveup_button.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();
        var i = this.getAttribute('data-i')*1;

        if(i<=0) return;
        var rows = self.getValue();
        var tmp = rows[i-1];
        rows[i-1] = rows[i];
        rows[i] = tmp;

        self.setValue(rows);
        self.active_tab = self.rows[i-1].tab;
        self.refreshTabs();

        self.onChange(true);

        self.jsoneditor.trigger('moveRow', self.rows[i-1]);
      });

      if(controls_holder) {
        controls_holder.appendChild(self.rows[i].moveup_button);
      }
    }

    if(!self.hide_move_buttons) {
      self.rows[i].movedown_button = this.getButton('','movedown',this.translate('button_move_down_title'));
      self.rows[i].movedown_button.classList.add('movedown', 'json-editor-btntype-move');
      self.rows[i].movedown_button.setAttribute('data-i',i);
      self.rows[i].movedown_button.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();
        var i = this.getAttribute('data-i')*1;

        var rows = self.getValue();
        if(i>=rows.length-1) return;
        var tmp = rows[i+1];
        rows[i+1] = rows[i];
        rows[i] = tmp;

        self.setValue(rows);
        self.active_tab = self.rows[i+1].tab;
        self.refreshTabs();
        self.onChange(true);

        self.jsoneditor.trigger('moveRow', self.rows[i+1]);
      });

      if(controls_holder) {
        controls_holder.appendChild(self.rows[i].movedown_button);
      }
    }

    if(value) self.rows[i].setValue(value, initial);
    self.refreshTabs();

    return self.rows[i];
  },
  addControls: function() {
    var self = this;

    this.collapsed = false;
    this.toggle_button = this.getButton('','collapse',this.translate('button_collapse'));
    this.toggle_button.classList.add('json-editor-btntype-toggle');
    this.title_controls.appendChild(this.toggle_button);
    var row_holder_display = self.row_holder.style.display;
    var controls_display = self.controls.style.display;
    this.toggle_button.addEventListener('click',function(e) {
      e.preventDefault();
      e.stopPropagation();
      if(self.collapsed) {
        self.collapsed = false;
        if(self.panel) self.panel.style.display = '';
        self.row_holder.style.display = row_holder_display;
        if(self.tabs_holder) self.tabs_holder.style.display = '';
        self.controls.style.display = controls_display;
        self.setButtonText(this,'','collapse',self.translate('button_collapse'));
      }
      else {
        self.collapsed = true;
        self.row_holder.style.display = 'none';
        if(self.tabs_holder) self.tabs_holder.style.display = 'none';
        self.controls.style.display = 'none';
        if(self.panel) self.panel.style.display = 'none';
        self.setButtonText(this,'','expand',self.translate('button_expand'));
      }
    });

    // If it should start collapsed
    if(this.options.collapsed) {
      $trigger(this.toggle_button,'click');
    }

    // Collapse button disabled
    if(this.schema.options && typeof this.schema.options.disable_collapse !== "undefined") {
      if(this.schema.options.disable_collapse) this.toggle_button.style.display = 'none';
    }
    else if(this.jsoneditor.options.disable_collapse) {
      this.toggle_button.style.display = 'none';
    }

    // Add "new row" and "delete last" buttons below editor
    this.add_row_button = this.getButton(this.getItemTitle(),'add',this.translate('button_add_row_title',[this.getItemTitle()]));
    this.add_row_button.classList.add('json-editor-btntype-add');
    this.add_row_button.addEventListener('click',function(e) {
      e.preventDefault();
      e.stopPropagation();
      var i = self.rows.length;
      var editor;
      if(self.row_cache[i]) {
        editor = self.rows[i] = self.row_cache[i];
        self.rows[i].setValue(self.rows[i].getDefault(), true);
        self.rows[i].container.style.display = '';
        if(self.rows[i].tab) self.rows[i].tab.style.display = '';
        self.rows[i].register();
      }
      else {
        editor = self.addRow();
      }
      self.active_tab = self.rows[i].tab;
      self.refreshTabs();
      self.refreshValue();
      self.onChange(true);
      self.jsoneditor.trigger('addRow', editor);
    });
    self.controls.appendChild(this.add_row_button);

    this.delete_last_row_button = this.getButton(this.translate('button_delete_last',[this.getItemTitle()]),'delete',this.translate('button_delete_last_title',[this.getItemTitle()]));
    this.delete_last_row_button.classList.add('json-editor-btntype-deletelast');
    this.delete_last_row_button.addEventListener('click',function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (!self.askConfirmation()) {
        return false;
      }

      var rows = self.getValue();
      var new_active_tab = null;

      var editor = rows.pop();

      self.setValue(rows);

      if (self.rows[self.rows.length-1]) {
        new_active_tab = self.rows[self.rows.length-1].tab;
      }

      if(new_active_tab) {
        self.active_tab = new_active_tab;
        self.refreshTabs();
      }

      self.onChange(true);
      self.jsoneditor.trigger('deleteRow', editor);
    });
    self.controls.appendChild(this.delete_last_row_button);

    this.remove_all_rows_button = this.getButton(this.translate('button_delete_all'),'delete',this.translate('button_delete_all_title'));
    this.remove_all_rows_button.classList.add('json-editor-btntype-deleteall');
    this.remove_all_rows_button.addEventListener('click',function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (!self.askConfirmation()) {
        return false;
      }

      self.empty(true);
      self.setValue([]);
      self.onChange(true);
      self.jsoneditor.trigger('deleteAllRows');
    });
    self.controls.appendChild(this.remove_all_rows_button);

    if(self.tabs) {
      this.add_row_button.style.width = '100%';
      this.add_row_button.style.textAlign = 'left';
      this.add_row_button.style.marginBottom = '3px';

      this.delete_last_row_button.style.width = '100%';
      this.delete_last_row_button.style.textAlign = 'left';
      this.delete_last_row_button.style.marginBottom = '3px';

      this.remove_all_rows_button.style.width = '100%';
      this.remove_all_rows_button.style.textAlign = 'left';
      this.remove_all_rows_button.style.marginBottom = '3px';
    }
  },
  showValidationErrors: function(errors) {
    var self = this;

    // Get all the errors that pertain to this editor
    var my_errors = [];
    var other_errors = [];
    $each(errors, function(i,error) {
      if(error.path === self.path) {
        my_errors.push(error);
      }
      else {
        other_errors.push(error);
      }
    });

    // Show errors for this editor
    if(this.error_holder) {
      if(my_errors.length) {
        var message = [];
        this.error_holder.innerHTML = '';
        this.error_holder.style.display = '';
        $each(my_errors, function(i,error) {
          self.error_holder.appendChild(self.theme.getErrorMessage(error.message));
        });
      }
      // Hide error area
      else {
        this.error_holder.style.display = 'none';
      }
    }

    // Show errors for child editors
    $each(this.rows, function(i,row) {
      row.showValidationErrors(other_errors);
    });
  }
});

JSONEditor.defaults.editors.table = JSONEditor.defaults.editors.array.extend({
  register: function() {
    this._super();
    if(this.rows) {
      for(var i=0; i<this.rows.length; i++) {
        this.rows[i].register();
      }
    }
  },
  unregister: function() {
    this._super();
    if(this.rows) {
      for(var i=0; i<this.rows.length; i++) {
        this.rows[i].unregister();
      }
    }
  },
  getNumColumns: function() {
    return Math.max(Math.min(12,this.width),3);
  },
  preBuild: function() {
    var item_schema = this.jsoneditor.expandRefs(this.schema.items || {});

    this.item_title = item_schema.title || 'row';
    this.item_default = item_schema["default"] || null;
    this.item_has_child_editors = item_schema.properties || item_schema.items;
    this.width = 12;
    this._super();
  },
  build: function() {
    var self = this;
    this.table = this.theme.getTable();
    this.container.appendChild(this.table);
    this.thead = this.theme.getTableHead();
    this.table.appendChild(this.thead);
    this.header_row = this.theme.getTableRow();
    this.thead.appendChild(this.header_row);
    this.row_holder = this.theme.getTableBody();
    this.table.appendChild(this.row_holder);

    // Determine the default value of array element
    var tmp = this.getElementEditor(0,true);
    this.item_default = tmp.getDefault();
    this.width = tmp.getNumColumns() + 2;

    if(!this.options.compact) {
      this.header = document.createElement('label');
      this.header.textContent = this.getTitle();
      this.title = this.theme.getHeader(this.header);
      this.container.appendChild(this.title);
      this.title_controls = this.theme.getHeaderButtonHolder();
      this.title.appendChild(this.title_controls);
      if(this.schema.description) {
        this.description = this.theme.getDescription(this.schema.description);
        this.container.appendChild(this.description);
      }
      this.panel = this.theme.getIndentedPanel();
      this.container.appendChild(this.panel);
      this.error_holder = document.createElement('div');
      this.panel.appendChild(this.error_holder);
    }
    else {
      this.panel = document.createElement('div');
      this.container.appendChild(this.panel);
    }

    this.panel.appendChild(this.table);
    this.controls = this.theme.getButtonHolder();
    this.panel.appendChild(this.controls);

    if(this.item_has_child_editors) {
      var ce = tmp.getChildEditors();
      var order = tmp.property_order || Object.keys(ce);
      for(var i=0; i<order.length; i++) {
        var th = self.theme.getTableHeaderCell(ce[order[i]].getTitle());
        if(ce[order[i]].options.hidden) th.style.display = 'none';
        self.header_row.appendChild(th);
      }
    }
    else {
      self.header_row.appendChild(self.theme.getTableHeaderCell(this.item_title));
    }

    tmp.destroy();
    this.row_holder.innerHTML = '';

    // Row Controls column
    this.controls_header_cell = self.theme.getTableHeaderCell(" ");
    self.header_row.appendChild(this.controls_header_cell);

    // Add controls
    this.addControls();
  },
  onChildEditorChange: function(editor) {
    this.refreshValue();
    this._super();
  },
  getItemDefault: function() {
    return $extend({},{"default":this.item_default})["default"];
  },
  getItemTitle: function() {
    return this.item_title;
  },
  getElementEditor: function(i,ignore) {
    var schema_copy = $extend({},this.schema.items);
    var editor = this.jsoneditor.getEditorClass(schema_copy, this.jsoneditor);
    var row = this.row_holder.appendChild(this.theme.getTableRow());
    var holder = row;
    if(!this.item_has_child_editors) {
      holder = this.theme.getTableCell();
      row.appendChild(holder);
    }

    var ret = this.jsoneditor.createEditor(editor,{
      jsoneditor: this.jsoneditor,
      schema: schema_copy,
      container: holder,
      path: this.path+'.'+i,
      parent: this,
      compact: true,
      table_row: true
    });

    ret.preBuild();
    if(!ignore) {
      ret.build();
      ret.postBuild();

      ret.controls_cell = row.appendChild(this.theme.getTableCell());
      ret.row = row;
      ret.table_controls = this.theme.getButtonHolder();
      ret.controls_cell.appendChild(ret.table_controls);
      ret.table_controls.style.margin = 0;
      ret.table_controls.style.padding = 0;
    }

    return ret;
  },
  destroy: function() {
    this.innerHTML = '';
    if(this.title && this.title.parentNode) this.title.parentNode.removeChild(this.title);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    if(this.row_holder && this.row_holder.parentNode) this.row_holder.parentNode.removeChild(this.row_holder);
    if(this.table && this.table.parentNode) this.table.parentNode.removeChild(this.table);
    if(this.panel && this.panel.parentNode) this.panel.parentNode.removeChild(this.panel);

    this.rows = this.title = this.description = this.row_holder = this.table = this.panel = null;

    this._super();
  },
  setValue: function(value, initial) {
    // Update the array's value, adding/removing rows when necessary
    value = value || [];

    // Make sure value has between minItems and maxItems items in it
    if(this.schema.minItems) {
      while(value.length < this.schema.minItems) {
        value.push(this.getItemDefault());
      }
    }
    if(this.schema.maxItems && value.length > this.schema.maxItems) {
      value = value.slice(0,this.schema.maxItems);
    }

    var serialized = JSON.stringify(value);
    if(serialized === this.serialized) return;

    var numrows_changed = false;

    var self = this;
    $each(value,function(i,val) {
      if(self.rows[i]) {
        // TODO: don't set the row's value if it hasn't changed
        self.rows[i].setValue(val);
      }
      else {
        self.addRow(val);
        numrows_changed = true;
      }
    });

    for(var j=value.length; j<self.rows.length; j++) {
      var holder = self.rows[j].container;
      if(!self.item_has_child_editors) {
        self.rows[j].row.parentNode.removeChild(self.rows[j].row);
      }
      self.rows[j].destroy();
      if(holder.parentNode) holder.parentNode.removeChild(holder);
      self.rows[j] = null;
      numrows_changed = true;
    }
    self.rows = self.rows.slice(0,value.length);

    self.refreshValue();
    if(numrows_changed || initial) self.refreshRowButtons();

    self.onChange();

    // TODO: sortable
  },
  refreshRowButtons: function() {
    var self = this;

    // If we currently have minItems items in the array
    var minItems = this.schema.minItems && this.schema.minItems >= this.rows.length;

    var need_row_buttons = false;
    $each(this.rows,function(i,editor) {
      // Hide the move down button for the last row
      if(editor.movedown_button) {
        if(i === self.rows.length - 1) {
          editor.movedown_button.style.display = 'none';
        }
        else {
          need_row_buttons = true;
          editor.movedown_button.style.display = '';
        }
      }

      // Hide the delete button if we have minItems items
      if(editor.delete_button) {
        if(minItems) {
          editor.delete_button.style.display = 'none';
        }
        else {
          need_row_buttons = true;
          editor.delete_button.style.display = '';
        }
      }

      if(editor.moveup_button) {
        need_row_buttons = true;
      }
    });

    // Show/hide controls column in table
    $each(this.rows,function(i,editor) {
      if(need_row_buttons) {
        editor.controls_cell.style.display = '';
      }
      else {
        editor.controls_cell.style.display = 'none';
      }
    });
    if(need_row_buttons) {
      this.controls_header_cell.style.display = '';
    }
    else {
      this.controls_header_cell.style.display = 'none';
    }

    var controls_needed = false;

    if(!this.value.length) {
      this.delete_last_row_button.style.display = 'none';
      this.remove_all_rows_button.style.display = 'none';
      this.table.style.display = 'none';
    }
    else if(this.value.length === 1) {
      this.table.style.display = '';
      this.remove_all_rows_button.style.display = 'none';

      // If there are minItems items in the array, or configured to hide the delete_last_row button, hide the delete button beneath the rows
      if(minItems || this.hide_delete_last_row_buttons) {
        this.delete_last_row_button.style.display = 'none';
      }
      else {
        this.delete_last_row_button.style.display = '';
        controls_needed = true;
      }
    }
    else {
      this.table.style.display = '';

      if(minItems || this.hide_delete_last_row_buttons) {
        this.delete_last_row_button.style.display = 'none';
      }
      else {
        this.delete_last_row_button.style.display = '';
        controls_needed = true;
      }

      if(minItems || this.hide_delete_all_rows_buttons) {
        this.remove_all_rows_button.style.display = 'none';
      }
      else {
        this.remove_all_rows_button.style.display = '';
        controls_needed = true;
      }
    }

    // If there are maxItems in the array, hide the add button beneath the rows
    if((this.schema.maxItems && this.schema.maxItems <= this.rows.length) || this.hide_add_button) {
      this.add_row_button.style.display = 'none';
    }
    else {
      this.add_row_button.style.display = '';
      controls_needed = true;
    }

    if(!controls_needed) {
      this.controls.style.display = 'none';
    }
    else {
      this.controls.style.display = '';
    }
  },
  refreshValue: function() {
    var self = this;
    this.value = [];

    $each(this.rows,function(i,editor) {
      // Get the value for this editor
      self.value[i] = editor.getValue();
    });
    this.serialized = JSON.stringify(this.value);
  },
  addRow: function(value) {
    var self = this;
    var i = this.rows.length;

    self.rows[i] = this.getElementEditor(i);

    var controls_holder = self.rows[i].table_controls;

    // Buttons to delete row, move row up, and move row down
    if(!this.hide_delete_buttons) {
      self.rows[i].delete_button = this.getButton('','delete',this.translate('button_delete_row_title_short'));
      self.rows[i].delete_button.classList.add('delete','json-editor-btntype-delete');
      self.rows[i].delete_button.setAttribute('data-i',i);
      self.rows[i].delete_button.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!self.askConfirmation()) {
          return false;
        }

        var i = this.getAttribute('data-i')*1;

        var value = self.getValue();

        var newval = [];
        $each(value,function(j,row) {
          if(j===i) return; // If this is the one we're deleting
          newval.push(row);
        });
        self.setValue(newval);
        self.onChange(true);
      });
      controls_holder.appendChild(self.rows[i].delete_button);
    }


    if(i && !this.hide_move_buttons) {
      self.rows[i].moveup_button = this.getButton('','moveup',this.translate('button_move_up_title'));
      self.rows[i].moveup_button.classList.add('moveup','json-editor-btntype-move');
      self.rows[i].moveup_button.setAttribute('data-i',i);
      self.rows[i].moveup_button.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();
        var i = this.getAttribute('data-i')*1;

        if(i<=0) return;
        var rows = self.getValue();
        var tmp = rows[i-1];
        rows[i-1] = rows[i];
        rows[i] = tmp;

        self.setValue(rows);
        self.onChange(true);
      });
      controls_holder.appendChild(self.rows[i].moveup_button);
    }

    if(!this.hide_move_buttons) {
      self.rows[i].movedown_button = this.getButton('','movedown',this.translate('button_move_down_title'));
      self.rows[i].movedown_button.classList.add('movedown','json-editor-btntype-move');
      self.rows[i].movedown_button.setAttribute('data-i',i);
      self.rows[i].movedown_button.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();
        var i = this.getAttribute('data-i')*1;
        var rows = self.getValue();
        if(i>=rows.length-1) return;
        var tmp = rows[i+1];
        rows[i+1] = rows[i];
        rows[i] = tmp;

        self.setValue(rows);
        self.onChange(true);
      });
      controls_holder.appendChild(self.rows[i].movedown_button);
    }

    if(value) self.rows[i].setValue(value);
  },
  addControls: function() {
    var self = this;

    this.collapsed = false;
    this.toggle_button = this.getButton('','collapse',this.translate('button_collapse'));
    this.toggle_button.classList.add('json-editor-btntype-toggle');
    if(this.title_controls) {
      this.title_controls.appendChild(this.toggle_button);
      this.toggle_button.addEventListener('click',function(e) {
        e.preventDefault();
        e.stopPropagation();

        if(self.collapsed) {
          self.collapsed = false;
          self.panel.style.display = '';
          self.setButtonText(this,'','collapse',self.translate('button_collapse'));
        }
        else {
          self.collapsed = true;
          self.panel.style.display = 'none';
          self.setButtonText(this,'','expand',self.translate('button_expand'));
        }
      });

      // If it should start collapsed
      if(this.options.collapsed) {
        $trigger(this.toggle_button,'click');
      }

      // Collapse button disabled
      if(this.schema.options && typeof this.schema.options.disable_collapse !== "undefined") {
        if(this.schema.options.disable_collapse) this.toggle_button.style.display = 'none';
      }
      else if(this.jsoneditor.options.disable_collapse) {
        this.toggle_button.style.display = 'none';
      }
    }

    // Add "new row" and "delete last" buttons below editor
    this.add_row_button = this.getButton(this.getItemTitle(),'add',this.translate('button_add_row_title',[this.getItemTitle()]));
    this.add_row_button.classList.add('json-editor-btntype-add');
    this.add_row_button.addEventListener('click',function(e) {
      e.preventDefault();
      e.stopPropagation();

      self.addRow();
      self.refreshValue();
      self.refreshRowButtons();
      self.onChange(true);
    });
    self.controls.appendChild(this.add_row_button);

    this.delete_last_row_button = this.getButton(this.translate('button_delete_last',[this.getItemTitle()]),'delete',this.translate('button_delete_last_title',[this.getItemTitle()]));
    this.delete_last_row_button.classList.add('json-editor-btntype-deletelast');
    this.delete_last_row_button.addEventListener('click',function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (!self.askConfirmation()) {
        return false;
      }

      var rows = self.getValue();
      rows.pop();
      self.setValue(rows);
      self.onChange(true);
    });
    self.controls.appendChild(this.delete_last_row_button);

    this.remove_all_rows_button = this.getButton(this.translate('button_delete_all'),'delete',this.translate('button_delete_all_title'));
    this.remove_all_rows_button.classList.add('json-editor-btntype-deleteall');
    this.remove_all_rows_button.addEventListener('click',function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (!self.askConfirmation()) {
        return false;
      }

      self.setValue([]);
      self.onChange(true);
    });
    self.controls.appendChild(this.remove_all_rows_button);
  }
});

// Multiple Editor (for when `type` is an array, also when `oneOf` is present)
JSONEditor.defaults.editors.multiple = JSONEditor.AbstractEditor.extend({
  register: function() {
    if(this.editors) {
      for(var i=0; i<this.editors.length; i++) {
        if(!this.editors[i]) continue;
        this.editors[i].unregister();
      }
      if(this.editors[this.type]) this.editors[this.type].register();
    }
    this._super();
  },
  unregister: function() {
    this._super();
    if(this.editors) {
      for(var i=0; i<this.editors.length; i++) {
        if(!this.editors[i]) continue;
        this.editors[i].unregister();
      }
    }
  },
  getNumColumns: function() {
    if(!this.editors[this.type]) return 4;
    return Math.max(this.editors[this.type].getNumColumns(),4);
  },
  enable: function() {
    if(!this.always_disabled) {
      if(this.editors) {
        for(var i=0; i<this.editors.length; i++) {
          if(!this.editors[i]) continue;
          this.editors[i].enable();
        }
      }
      this.switcher.disabled = false;
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    if(this.editors) {
      for(var i=0; i<this.editors.length; i++) {
        if(!this.editors[i]) continue;
        this.editors[i].disable(always_disabled);
      }
    }
    this.switcher.disabled = true;
    this._super();
  },
  switchEditor: function(i) {
    var self = this;

    if(!this.editors[i]) {
      this.buildChildEditor(i);
    }
    
    var current_value = self.getValue();

    self.type = i;

    self.register();

    $each(self.editors,function(type,editor) {
      if(!editor) return;
      if(self.type === type) {
        if(self.keep_values) editor.setValue(current_value,true);
        editor.container.style.display = '';
      }
      else editor.container.style.display = 'none';
    });
    self.refreshValue();
    self.refreshHeaderText();
  },
  buildChildEditor: function(i) {
    var self = this;
    var type = this.types[i];
    var holder = self.theme.getChildEditorHolder();
    self.editor_holder.appendChild(holder);

    var schema;

    if(typeof type === "string") {
      schema = $extend({},self.schema);
      schema.type = type;
    }
    else {
      schema = $extend({},self.schema,type);
      schema = self.jsoneditor.expandRefs(schema);

      // If we need to merge `required` arrays
      if(type && type.required && Array.isArray(type.required) && self.schema.required && Array.isArray(self.schema.required)) {
        schema.required = self.schema.required.concat(type.required);
      }
    }

    var editor = self.jsoneditor.getEditorClass(schema);

    self.editors[i] = self.jsoneditor.createEditor(editor,{
      jsoneditor: self.jsoneditor,
      schema: schema,
      container: holder,
      path: self.path,
      parent: self,
      required: true
    });
    self.editors[i].preBuild();
    self.editors[i].build();
    self.editors[i].postBuild();

    if(self.editors[i].header) self.editors[i].header.style.display = 'none';

    self.editors[i].option = self.switcher_options[i];

    holder.addEventListener('change_header_text',function() {
      self.refreshHeaderText();
    });

    if(i !== self.type) holder.style.display = 'none';
  },
  preBuild: function() {
    var self = this;

    this.types = [];
    this.type = 0;
    this.editors = [];
    this.validators = [];

    this.keep_values = true;
    if(typeof this.jsoneditor.options.keep_oneof_values !== "undefined") this.keep_values = this.jsoneditor.options.keep_oneof_values;
    if(typeof this.options.keep_oneof_values !== "undefined") this.keep_values = this.options.keep_oneof_values;

    if(this.schema.oneOf) {
      this.oneOf = true;
      this.types = this.schema.oneOf;
      delete this.schema.oneOf;
    }
    else if(this.schema.anyOf) {
      this.anyOf = true;
      this.types = this.schema.anyOf;
      delete this.schema.anyOf;
    }
    else {
      if(!this.schema.type || this.schema.type === "any") {
        this.types = ['string','number','integer','boolean','object','array','null'];

        // If any of these primitive types are disallowed
        if(this.schema.disallow) {
          var disallow = this.schema.disallow;
          if(typeof disallow !== 'object' || !(Array.isArray(disallow))) {
            disallow = [disallow];
          }
          var allowed_types = [];
          $each(this.types,function(i,type) {
            if(disallow.indexOf(type) === -1) allowed_types.push(type);
          });
          this.types = allowed_types;
        }
      }
      else if(Array.isArray(this.schema.type)) {
        this.types = this.schema.type;
      }
      else {
        this.types = [this.schema.type];
      }
      delete this.schema.type;
    }

    this.display_text = this.getDisplayText(this.types);
  },
  build: function() {
    var self = this;
    var container = this.container;

    this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());
    this.container.appendChild(this.header);

    this.switcher = this.theme.getSwitcher(this.display_text);
    container.appendChild(this.switcher);
    this.switcher.addEventListener('change',function(e) {
      e.preventDefault();
      e.stopPropagation();

      self.switchEditor(self.display_text.indexOf(this.value));
      self.onChange(true);
    });

    this.editor_holder = document.createElement('div');
    container.appendChild(this.editor_holder);
    
      
    var validator_options = {};
    if(self.jsoneditor.options.custom_validators) {
      validator_options.custom_validators = self.jsoneditor.options.custom_validators;
    }

    this.switcher_options = this.theme.getSwitcherOptions(this.switcher);
    $each(this.types,function(i,type) {
      self.editors[i] = false;

      var schema;

      if(typeof type === "string") {
        schema = $extend({},self.schema);
        schema.type = type;
      }
      else {
        schema = $extend({},self.schema,type);

        // If we need to merge `required` arrays
        if(type.required && Array.isArray(type.required) && self.schema.required && Array.isArray(self.schema.required)) {
          schema.required = self.schema.required.concat(type.required);
        }
      }

      self.validators[i] = new JSONEditor.Validator(self.jsoneditor,schema,validator_options);
    });

    this.switchEditor(0);
  },
  onChildEditorChange: function(editor) {
    if(this.editors[this.type]) {
      this.refreshValue();
      this.refreshHeaderText();
    }

    this._super();
  },
  refreshHeaderText: function() {
    var display_text = this.getDisplayText(this.types);
    $each(this.switcher_options, function(i,option) {
      option.textContent = display_text[i];
    });
  },
  refreshValue: function() {
    this.value = this.editors[this.type].getValue();
  },
  setValue: function(val,initial) {
    // Determine type by getting the first one that validates
    var self = this;
    var prev_type = this.type;
    // find the best match one
    var fitTestVal = {
      match: 0,
      extra: 0,
      i: 0
    };
    $each(this.validators, function(i,validator) {
      if (!validator.validate(val).length) {
        if (typeof self.anyOf !== "undefined" && self.anyOf) {
          var fitTestResult = validator.fitTest(val);
          if (fitTestVal.match < fitTestResult.match) {
            fitTestVal = fitTestResult;
            fitTestVal.i = i;
          } else if (fitTestVal.match === fitTestResult.match) {
            if (fitTestVal.extra > fitTestResult.extra) {
              fitTestVal = fitTestResult;
              fitTestVal.i = i;
            }
          }
        } else {
          self.type = i;
          self.switcher.value = self.display_text[i];
          return false;
        }
      }
    });
    if (typeof self.anyOf !== "undefined" && self.anyOf) {
      self.type = fitTestVal.i;
      self.switcher.value = self.display_text[fitTestVal.i];
    }

    var type_changed = this.type != prev_type;
    if (type_changed) {
      this.switchEditor(this.type);
    }

    this.editors[this.type].setValue(val,initial);

    this.refreshValue();
    self.onChange(type_changed);
  },
  destroy: function() {
    $each(this.editors, function(type,editor) {
      if(editor) editor.destroy();
    });
    if(this.editor_holder && this.editor_holder.parentNode) this.editor_holder.parentNode.removeChild(this.editor_holder);
    if(this.switcher && this.switcher.parentNode) this.switcher.parentNode.removeChild(this.switcher);
    this._super();
  },
  showValidationErrors: function(errors) {
    var self = this;

    // oneOf and anyOf error paths need to remove the oneOf[i] part before passing to child editors
    if(this.oneOf || this.anyOf) {
      var check_part = this.oneOf? 'oneOf' : 'anyOf';
      $each(this.editors,function(i,editor) {
        if(!editor) return;
        var check = self.path+'.'+check_part+'['+i+']';
        var new_errors = [];
        $each(errors, function(j,error) {
          if(error.path.substr(0,check.length)===check) {
            var new_error = $extend({},error);
            new_error.path = self.path+new_error.path.substr(check.length);
            new_errors.push(new_error);
          }
        });

        editor.showValidationErrors(new_errors);
      });
    }
    else {
      $each(this.editors,function(type,editor) {
        if(!editor) return;
        editor.showValidationErrors(errors);
      });
    }
  }
});

// Enum Editor (used for objects and arrays with enumerated values)
JSONEditor.defaults.editors["enum"] = JSONEditor.AbstractEditor.extend({
  getNumColumns: function() {
    return 4;
  },
  build: function() {
    var container = this.container;
    this.title = this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());
    this.container.appendChild(this.title);

    this.options.enum_titles = this.options.enum_titles || [];

    this["enum"] = this.schema["enum"];
    this.selected = 0;
    this.select_options = [];
    this.html_values = [];

    var self = this;
    for(var i=0; i<this["enum"].length; i++) {
      this.select_options[i] = this.options.enum_titles[i] || "Value "+(i+1);
      this.html_values[i] = this.getHTML(this["enum"][i]);
    }

    // Switcher
    this.switcher = this.theme.getSwitcher(this.select_options);
    this.container.appendChild(this.switcher);

    // Display area
    this.display_area = this.theme.getIndentedPanel();
    this.container.appendChild(this.display_area);

    if(this.options.hide_display) this.display_area.style.display = "none";

    this.switcher.addEventListener('change',function() {
      self.selected = self.select_options.indexOf(this.value);
      self.value = self["enum"][self.selected];
      self.refreshValue();
      self.onChange(true);
    });
    this.value = this["enum"][0];
    this.refreshValue();

    if(this["enum"].length === 1) this.switcher.style.display = 'none';
  },
  refreshValue: function() {
    var self = this;
    self.selected = -1;
    var stringified = JSON.stringify(this.value);
    $each(this["enum"], function(i, el) {
      if(stringified === JSON.stringify(el)) {
        self.selected = i;
        return false;
      }
    });

    if(self.selected<0) {
      self.setValue(self["enum"][0]);
      return;
    }

    this.switcher.value = this.select_options[this.selected];
    this.display_area.innerHTML = this.html_values[this.selected];
  },
  enable: function() {
    if(!this.always_disabled) {
      this.switcher.disabled = false;
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    this.switcher.disabled = true;
    this._super();
  },
  getHTML: function(el) {
    var self = this;

    if(el === null) {
      return '<em>null</em>';
    }
    // Array or Object
    else if(typeof el === "object") {
      // TODO: use theme
      var ret = '';

      $each(el,function(i,child) {
        var html = self.getHTML(child);

        // Add the keys to object children
        if(!(Array.isArray(el))) {
          // TODO: use theme
          html = '<div><em>'+i+'</em>: '+html+'</div>';
        }

        // TODO: use theme
        ret += '<li>'+html+'</li>';
      });

      if(Array.isArray(el)) ret = '<ol>'+ret+'</ol>';
      else ret = "<ul style='margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;'>"+ret+'</ul>';

      return ret;
    }
    // Boolean
    else if(typeof el === "boolean") {
      return el? 'true' : 'false';
    }
    // String
    else if(typeof el === "string") {
      return el.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
    // Number
    else {
      return el;
    }
  },
  setValue: function(val) {
    if(this.value !== val) {
      this.value = val;
      this.refreshValue();
      this.onChange();
    }
  },
  destroy: function() {
    if(this.display_area && this.display_area.parentNode) this.display_area.parentNode.removeChild(this.display_area);
    if(this.title && this.title.parentNode) this.title.parentNode.removeChild(this.title);
    if(this.switcher && this.switcher.parentNode) this.switcher.parentNode.removeChild(this.switcher);

    this._super();
  }
});

JSONEditor.defaults.editors.select = JSONEditor.AbstractEditor.extend({
  setValue: function(value,initial) {

    // Sanitize value before setting it
    var sanitized = this.typecast(value || '');

    if(this.enum_values.indexOf(sanitized) < 0) sanitized = this.enum_values[0];

    if(this.value === sanitized) return;

    if(initial) this.is_dirty = false;
    else if(this.jsoneditor.options.show_errors === "change") this.is_dirty = true;

    this.input.value = this.enum_options[this.enum_values.indexOf(sanitized)];

    this.value = sanitized;
    this.onChange();
    this.change();
  },
  register: function() {
    this._super();
    if(!this.input) return;
    this.input.setAttribute('name',this.formname);
  },
  unregister: function() {
    this._super();
    if(!this.input) return;
    this.input.removeAttribute('name');
  },
  getNumColumns: function() {
    if(!this.enum_options) return 3;
    var longest_text = this.getTitle().length;
    for(var i=0; i<this.enum_options.length; i++) {
      longest_text = Math.max(longest_text,this.enum_options[i].length+4);
    }
    return Math.min(12,Math.max(longest_text/7,2));
  },
  typecast: function(value) {
    if (this.schema.type === "boolean") return !!value;
    else if (this.schema.type === "number") return 1*value || 0;
    else if (this.schema.type === "integer") return Math.floor(value*1 || 0);
    else return ""+value;
  },
  getValue: function() {
    if (!this.dependenciesFulfilled) {
      return undefined;
    }
    return this.typecast(this.value);
  },
  preBuild: function() {
    var self = this;
    this.input_type = 'select';
    this.enum_options = [];
    this.enum_values = [];
    this.enum_display = [];
    var i;

    // Enum options enumerated
    if(this.schema["enum"]) {
      var display = this.schema.options && this.schema.options.enum_titles || [];

      $each(this.schema["enum"],function(i,option) {
        self.enum_options[i] = ""+option;
        self.enum_display[i] = ""+(display[i] || option);
        self.enum_values[i] = self.typecast(option);
      });

      if(!this.isRequired()){
        self.enum_display.unshift(' ');
        self.enum_options.unshift('undefined');
        self.enum_values.unshift(undefined);
      }

    }
    // Boolean
    else if(this.schema.type === "boolean") {
      self.enum_display = this.schema.options && this.schema.options.enum_titles || ['true','false'];
      self.enum_options = ['1',''];
      self.enum_values = [true,false];

      if(!this.isRequired()){
        self.enum_display.unshift(' ');
        self.enum_options.unshift('undefined');
        self.enum_values.unshift(undefined);
      }

    }
    // Dynamic Enum
    else if(this.schema.enumSource) {
      this.enumSource = [];
      this.enum_display = [];
      this.enum_options = [];
      this.enum_values = [];

      // Shortcut declaration for using a single array
      if(!(Array.isArray(this.schema.enumSource))) {
        if(this.schema.enumValue) {
          this.enumSource = [
            {
              source: this.schema.enumSource,
              value: this.schema.enumValue
            }
          ];
        }
        else {
          this.enumSource = [
            {
              source: this.schema.enumSource
            }
          ];
        }
      }
      else {
        for(i=0; i<this.schema.enumSource.length; i++) {
          // Shorthand for watched variable
          if(typeof this.schema.enumSource[i] === "string") {
            this.enumSource[i] = {
              source: this.schema.enumSource[i]
            };
          }
          // Make a copy of the schema
          else if(!(Array.isArray(this.schema.enumSource[i]))) {
            this.enumSource[i] = $extend({},this.schema.enumSource[i]);
          }
          else {
            this.enumSource[i] = this.schema.enumSource[i];
          }
        }
      }

      // Now, enumSource is an array of sources
      // Walk through this array and fix up the values
      for(i=0; i<this.enumSource.length; i++) {
        if(this.enumSource[i].value) {
          this.enumSource[i].value = this.jsoneditor.compileTemplate(this.enumSource[i].value, this.template_engine);
        }
        if(this.enumSource[i].title) {
          this.enumSource[i].title = this.jsoneditor.compileTemplate(this.enumSource[i].title, this.template_engine);
        }
        if(this.enumSource[i].filter) {
          this.enumSource[i].filter = this.jsoneditor.compileTemplate(this.enumSource[i].filter, this.template_engine);
        }
      }
    }
    // Other, not supported
    else {
      throw "'select' editor requires the enum property to be set.";
    }

  },
  build: function() {
    var self = this;
    if(!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());
    if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);
    if(this.options.infoText) this.infoButton = this.theme.getInfoButton(this.options.infoText);
    if(this.options.compact) this.container.classList.add('compact');

    this.input = this.theme.getSelectInput(this.enum_options, false);
    this.theme.setSelectOptions(this.input,this.enum_options,this.enum_display);

    if(this.schema.readOnly || this.schema.readonly) {
      this.always_disabled = true;
      this.input.disabled = true;
    }

    // Set custom attributes on input element. Parameter is array of protected keys. Empty array if none.
    this.setInputAttributes([]);

    this.input.addEventListener('change',function(e) {
      e.preventDefault();
      e.stopPropagation();
      self.onInputChange();
    });

    this.control = this.theme.getFormControl(this.label, this.input, this.description, this.infoButton);
    this.container.appendChild(this.control);

    this.value = this.enum_values[0];

    // Any special formatting that needs to happen after the input is added to the dom
    window.requestAnimationFrame(function() {
      if(self.input.parentNode) self.afterInputReady();
    });
  },
  afterInputReady: function() {
    var self = this;
    self.theme.afterInputReady(self.input);
  },
  onInputChange: function() {
    var val = this.typecast(this.input.value);

    var new_val;
    // Invalid option, use first option instead
    if(this.enum_values.indexOf(val) === -1) {
      new_val = this.enum_values[0];
    }
    else {
      new_val = this.enum_values[this.enum_values.indexOf(val)];
    }

    // If valid hasn't changed
    if(new_val === this.value) return;

    this.is_dirty = true;

    // Store new value and propogate change event
    this.value = new_val;
    this.onChange(true);
  },
  onWatchedFieldChange: function() {
    var self = this, vars, j, update = false;
    var select_options = [], select_titles = [];

    // If this editor uses a dynamic select box
    if(this.enumSource) {
      vars = this.getWatchedFieldValues();

      for(var i=0; i<this.enumSource.length; i++) {
        // Constant values
        if(Array.isArray(this.enumSource[i])) {
          select_options = select_options.concat(this.enumSource[i]);
          select_titles = select_titles.concat(this.enumSource[i]);
        }
        else {
          var items = [];
          // Static list of items
          if(Array.isArray(this.enumSource[i].source)) {
            items = this.enumSource[i].source;
          // A watched field
          } else {
            items = vars[this.enumSource[i].source];
          }

          if(items) {
            // Only use a predefined part of the array
            if(this.enumSource[i].slice) {
              items = Array.prototype.slice.apply(items,this.enumSource[i].slice);
            }
            // Filter the items
            if(this.enumSource[i].filter) {
              var new_items = [];
              for(j=0; j<items.length; j++) {
                if(this.enumSource[i].filter({i:j,item:items[j],watched:vars})) new_items.push(items[j]);
              }
              items = new_items;
            }

            var item_titles = [];
            var item_values = [];
            for(j=0; j<items.length; j++) {
              var item = items[j];

              // Rendered value
              if(this.enumSource[i].value) {
                item_values[j] = this.typecast(this.enumSource[i].value({
                  i: j,
                  item: item
                }));
              }
              // Use value directly
              else {
                item_values[j] = items[j];
              }

              // Rendered title
              if(this.enumSource[i].title) {
                item_titles[j] = this.enumSource[i].title({
                  i: j,
                  item: item
                });
              }
              // Use value as the title also
              else {
                item_titles[j] = item_values[j];
              }
            }

            // TODO: sort

            select_options = select_options.concat(item_values);
            select_titles = select_titles.concat(item_titles);
          }
        }
      }

      var prev_value = this.value;

      this.theme.setSelectOptions(this.input, select_options, select_titles);
      this.enum_options = select_options;
      this.enum_display = select_titles;
      this.enum_values = select_options;

      // If the previous value is still in the new select options, stick with it
      if(select_options.indexOf(prev_value) !== -1) {
        this.input.value = prev_value;
        this.value = prev_value;
      }
      // Otherwise, set the value to the first select option
      else {
        this.input.value = select_options[0];
        this.value = this.typecast(select_options[0] || "");
        if(this.parent) this.parent.onChildEditorChange(this);
        else this.jsoneditor.onChange();
        this.jsoneditor.notifyWatchers(this.path);
      }

      update = true;
    }

    this._super();
  },
  enable: function() {
    if(!this.always_disabled) {
      this.input.disabled = false;
    }
    this._super();
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    this.input.disabled = true;
    this._super(always_disabled);
  },
  destroy: function() {
    if(this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);

    this._super();
  },
  showValidationErrors: function (errors) {
    var self = this;

    this.previous_error_setting = this.jsoneditor.options.show_errors;

    var messages = [];
    $each(errors, function (i, error) {
      if (error.path === self.path) {
        messages.push(error.message);
      }
    });

    if (messages.length) {
      this.theme.addInputError(this.input, messages.join('. ') + '.');
    }
    else {
      this.theme.removeInputError(this.input);
    }
  }
});
JSONEditor.defaults.editors.choices = JSONEditor.defaults.editors.select.extend({
  setValue: function(value,initial) {

    if (this.choices_instance) {

      // Sanitize value before setting it
      var sanitized = this.typecast(value || '');

      if(this.enum_values.indexOf(sanitized) < 0) sanitized = this.enum_values[0];

      if(this.value === sanitized) return;

      if(initial) this.is_dirty = false;
      else if(this.jsoneditor.options.show_errors === "change") this.is_dirty = true;

      this.input.value = this.enum_options[this.enum_values.indexOf(sanitized)];

      this.choices_instance.setChoiceByValue(this.input.value);

      this.value = sanitized;
      this.onChange();
    }
    else this._super(value,initial);
  },
  afterInputReady: function() {
    if (window.Choices && !this.choices_instance) {
      var options, self = this;
      // Get options, either global options from "JSONEditor.defaults.options.choices" or
      // single property options from schema "options.choices"
      options = this.expandCallbacks('choices', $extend({}, JSONEditor.defaults.options.choices || {}, this.options.choices || {}));

      this.choices_instance = new window.Choices(this.input, options);

    }
    this._super();
  },
  onWatchedFieldChange: function() {
    this._super();
    if (this.choices_instance) {
      var self = this, choices_list = this.enum_options.map(function(v, i) { return {value: v, label: self.enum_display[i]}; });
      this.choices_instance.setChoices(choices_list, 'value', 'label', true);
      this.choices_instance.setChoiceByValue(this.value + '');    // Set new selection
    }
  },
  enable: function() {
    if (!this.always_disabled && this.choices_instance) this.choices_instance.enable();
    this._super();
  },
  disable: function(always_disabled) {
    if(this.choices_instance) this.choices_instance.disable();
    this._super(always_disabled);
  },
  destroy: function() {
    if(this.choices_instance) {
        this.choices_instance.destroy();
        this.choices_instance = null;
    }
    this._super();
  }
});
JSONEditor.defaults.editors.selectize = JSONEditor.defaults.editors.select.extend({
  setValue: function(value, initial) {
    if (this.selectize_instance) {

      if(initial) this.is_dirty = false;
      else if(this.jsoneditor.options.show_errors === "change") this.is_dirty = true;

      var sanitized = this.updateValue(value); // Sets this.value to sanitized value

      this.input.value = sanitized;

      this.selectize_instance.clear(true);
      this.selectize_instance.setValue(sanitized);

      this.onChange(true);
    }
    else this._super(value, initial);

  },
  afterInputReady: function() {

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.selectize && !this.selectize_instance) {

      // Get options, either global options from "JSONEditor.defaults.options.selectize" or
      // single property options from schema "options.selectize"
      var self = this, options = this.expandCallbacks('selectize', $extend({}, JSONEditor.defaults.options.selectize || {}, this.options.selectize || {}));

      // New items are allowed if option "create" is true and type is "string"
      this.newEnumAllowed = options.create = !!options.create && this.schema.type == 'string';

      this.selectize_instance = (window.jQuery(this.input).selectize(options))[0].selectize;

      // Remove change handler set in parent class (src/multiselect.js)
      this.control.removeEventListener('change', this.multiselectChangeHandler);

      // Create a new change handler
      this.multiselectChangeHandler = function(value) {
        //var value = self.selectize_instance.getValue(true);
        //self.value = value;
        self.updateValue(value);
        self.onChange(true);
      };

      // Add new event handler.
      //Note: Must use the "on()" method and not addEventListener()
      this.selectize_instance.on('change', this.multiselectChangeHandler);

    }
    this._super();

  },
  updateValue: function(value) {
    var sanitized = this.enum_values[0];
    value = this.typecast(value || '');
    if (this.enum_values.indexOf(value) === -1) {
      if (this.newEnumAllowed) {
        sanitized = this.addNewOption(value) ? value : sanitized;
      }
    }
    else sanitized = value;
    this.value = sanitized;
    return sanitized;
  },
  addNewOption: function(value) {
    var sanitized = this.typecast(value), res = false;

    if (this.enum_values.indexOf(sanitized) < 0 && sanitized !== '') {
      // Add to list of valid enum values
      this.enum_options.push('' + sanitized);
      this.enum_display.push('' + sanitized);
      this.enum_values.push(sanitized);
      // Update Schema enum to prevent triggering error
      // "Value must be one of the enumerated values"
      this.schema.enum.push(sanitized);

      // Add selectize item
      this.selectize_instance.addItem(sanitized);
      this.selectize_instance.refreshOptions(false);

      res = true;
    }
    return res;
  },
  onWatchedFieldChange: function() {
    this._super();
    if (this.selectize_instance) {
      var self = this;
      this.selectize_instance.clear(true); // Clear selection
      this.selectize_instance.clearOptions(true); // Remove all options
      this.enum_options.forEach(function(value,i) {
        self.selectize_instance.addOption({value: value, text: self.enum_display[i]});
      });
      this.selectize_instance.addItem(this.value + '', true); // Set new selection
    }
  },
  enable: function() {
    if (!this.always_disabled && this.selectize_instance) this.selectize_instance.unlock();
    this._super();
  },
  disable: function(always_disabled) {
    if(this.selectize_instance) this.selectize_instance.lock();
    this._super(always_disabled);
  },
  destroy: function() {
    if(this.selectize_instance) {
      this.selectize_instance.destroy();
      this.selectize_instance = null;
    }
    this._super();
  }
});
JSONEditor.defaults.editors.multiselect = JSONEditor.AbstractEditor.extend({
  onInputChange: function() {
    this.value = this.input.value;
    this.onChange(true);
  },
  register: function() {
    this._super();
    if (!this.input) return;
    this.input.setAttribute('name',this.formname);
  },
  unregister: function() {
    this._super();
    if (!this.input) return;
    this.input.removeAttribute('name');
  },
  getNumColumns: function() {
    var longest_text = this.getTitle().length;
    for(var i in this.select_values) {
      if (!this.select_values.hasOwnProperty(i)) continue;
      longest_text = Math.max(longest_text,(this.select_values[i]+'').length+4);
    }

    return Math.min(12,Math.max(longest_text/7,2));
  },
  preBuild: function() {
    this._super();

    this.select_options = {};
    this.select_values = {};
    this.option_keys = [];
    this.option_titles = [];

    var i, self = this,
        items_schema = this.jsoneditor.expandRefs(this.schema.items || {}),
        e = items_schema['enum'] || [],
        t = items_schema.options ? items_schema.options.enum_titles || [] : [];

    for(i=0; i<e.length; i++) {
      // If the sanitized value is different from the enum value, don't include it
      if (this.sanitize(e[i]) !== e[i]) continue;

      this.option_keys.push(e[i] + '');
      this.option_titles.push((t[i] || e[i]) + '');
      this.select_values[e[i] + ''] = e[i];
    }

  },
  build: function() {
    var self = this, i;
    if (!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());
    if (this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);
    if (this.options.infoText) this.infoButton = this.theme.getInfoButton(this.options.infoText);
    if (this.options.compact) this.container.classList.add('compact');

    if ((!this.schema.format && this.option_keys.length < 8) || this.schema.format === 'checkbox') {
      this.input_type = 'checkboxes';

      this.inputs = {};
      this.controls = {};
      for(i=0; i<this.option_keys.length; i++) {
        this.inputs[this.option_keys[i]] = this.theme.getCheckbox();
        this.select_options[this.option_keys[i]] = this.inputs[this.option_keys[i]];
        var label = this.theme.getCheckboxLabel(this.option_titles[i]);
        this.controls[this.option_keys[i]] = this.theme.getFormControl(label, this.inputs[this.option_keys[i]]);
      }

      this.control = this.theme.getMultiCheckboxHolder(this.controls,this.label,this.description, this.infoButton);
      this.inputs.controlgroup = this.inputs.controls = this.control; // Enable error messages for checkboxes
    }
    else {
      this.input_type = 'select';
      this.input = this.theme.getSelectInput(this.option_keys, true);
      this.theme.setSelectOptions(this.input,this.option_keys,this.option_titles);
      //this.input.multiple = true;
      this.input.setAttribute('multiple', 'multiple');
      this.input.size = Math.min(10,this.option_keys.length);
      for(i=0; i<this.option_keys.length; i++) {
        this.select_options[this.option_keys[i]] = this.input.children[i];
      }

      this.control = this.theme.getFormControl(this.label, this.input, this.description, this.infoButton);
    }

    if (this.schema.readOnly || this.schema.readonly) this.disable(true);

    this.container.appendChild(this.control);

    this.multiselectChangeHandler = function(e) {

      var new_value = [];
      for(i = 0; i<self.option_keys.length; i++) {
        if (self.select_options[self.option_keys[i]] && (self.select_options[self.option_keys[i]].selected || self.select_options[self.option_keys[i]].checked)) new_value.push(self.select_values[self.option_keys[i]]);
      }
      self.updateValue(new_value);
      self.onChange(true);
    };

    this.control.addEventListener('change', this.multiselectChangeHandler, false);

    // Any special formatting that needs to happen after the input is added to the dom
    window.requestAnimationFrame(function() {
      self.afterInputReady();
    });
  },
  postBuild: function() {
      this._super();
      //this.theme.afterInputReady(this.input || this.inputs);
  },
  afterInputReady: function() {
    var self = this;
    this.theme.afterInputReady(self.input || self.inputs);
  },
  setValue: function(value, initial) {
    var i, changed;
    value = value || [];
    if (!(Array.isArray(value))) value = [value];

    // Make sure we are dealing with an array of strings so we can check for strict equality
    value = value.map(function(e) {return e + '';});

    // Update selected status of options
    for(i in this.select_options) {
      if (!this.select_options.hasOwnProperty(i)) continue;
      this.select_options[i][this.input_type === 'select'? 'selected' : 'checked'] = (value.indexOf(i) !== -1);
    }

    changed = this.updateValue(value);        
    this.onChange(true);

  },
  removeValue: function(value) {
    // Remove from existing value(s)
    value = [].concat(value);
    this.setValue(this.getValue().filter(function(item) { return value.indexOf(item) == -1; }));
  },
  addValue: function(value) {
    // Add to existing value(s)
    this.setValue(this.getValue().concat(value));
  },
  updateValue: function(value) {
    var changed = false;
    var new_value = [];
    for(var i=0; i<value.length; i++) {
      if (!this.select_options[value[i]+'']) {
        changed = true;
        continue;
      }
      var sanitized = this.sanitize(this.select_values[value[i]]);
      new_value.push(sanitized);
      if (sanitized !== value[i]) changed = true;
    }
    this.value = new_value;

    return changed;
  },
  sanitize: function(value) {
    if (this.schema.items.type === 'boolean') return !!value;
    else if (this.schema.items.type === 'number') return 1*value || 0;
    else if (this.schema.items.type === 'integer') return Math.floor(value*1 || 0);
    else return ''+value;
  },
  enable: function() {
    if (!this.always_disabled) {
      if (this.input) {
        this.input.disabled = false;
      }
      else if (this.inputs) {
        for(var i in this.inputs) {
          if (!this.inputs.hasOwnProperty(i)) continue;
          this.inputs[i].disabled = false;
        }
      }
      this._super();
    }
  },
  disable: function(always_disabled) {
    if (always_disabled) this.always_disabled = true;
    if (this.input) {
      this.input.disabled = true;
    }
    else if (this.inputs) {
      for(var i in this.inputs) {
        if (!this.inputs.hasOwnProperty(i)) continue;
        this.inputs[i].disabled = true;
      }
    }
    this._super();
  },
  destroy: function() {
    this._super();
  },
  escapeRegExp: function(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },
  showValidationErrors: function(errors) {
    var regexPath = new RegExp('^' + this.escapeRegExp(this.path) + '(\\.\\d+)?$'),
        messages = [];

    $each(errors, function(i,error) {
      if (error.path.match(regexPath)) {
        messages.push(error.message);
      }
    });

    if (messages.length) {
      this.theme.addInputError(this.input || this.inputs, messages.join('. ') + '.');
    }
    else {
      this.theme.removeInputError(this.input || this.inputs);
    }
  }
});

JSONEditor.defaults.editors.base64 = JSONEditor.AbstractEditor.extend({
  getNumColumns: function() {
    return 4;
  },
  setFileReaderListener: function (fr_multiple) {
    var self = this;
    fr_multiple.addEventListener("load", function(event) {
      if (self.count == self.current_item_index) {
        // Overwrite existing file by default, leave other properties unchanged
        self.value[self.count][self.key] = event.target.result;
      } else {
        var temp_object = {};
        // Create empty object
        for (var key in self.parent.schema.properties) {
          temp_object[key] = "";
        }
        // Set object media file
        temp_object[self.key] = event.target.result;
        self.value.splice(self.count, 0, temp_object); // insert new file object
      }

      // Increment using the listener and not the 'for' loop as the listener will be processed asynchronously
      self.count += 1;
      // When all files have been processed, update the value of the editor
      if (self.count == (self.total+self.current_item_index)) {
        self.arrayEditor.setValue(self.value);
      }
    });
  },
  build: function() {
    var self = this;
    this.title = this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());
    if(this.options.infoText) this.infoButton = this.theme.getInfoButton(this.options.infoText);

    // Input that holds the base64 string
    this.input = this.theme.getFormInputField('hidden');
    this.container.appendChild(this.input);

    // Don't show uploader if this is readonly
    if(!this.schema.readOnly && !this.schema.readonly) {
      if(!window.FileReader) throw "FileReader required for base64 editor";

      // File uploader
      this.uploader = this.theme.getFormInputField('file');

      // Set attribute of file input field to 'multiple' if:
      // 'multiple' key has been set to 'true' in the schema
      // and the parent object is of type 'object'
      // and the parent of the parent type has been set to 'array'
      if (self.schema.options && self.schema.options.multiple && self.schema.options.multiple == true && self.parent && self.parent.schema.type == 'object' && self.parent.parent && self.parent.parent.schema.type == 'array') {
        this.uploader.setAttribute('multiple', '');
      }

      this.uploader.addEventListener('change',function(e) {
        e.preventDefault();
        e.stopPropagation();

        if(this.files && this.files.length) {

          // Check the amount of files uploaded.
          // If 1, use the regular upload, otherwise use the multiple upload method
          if (this.files.length>1 && self.schema.options && self.schema.options.multiple && self.schema.options.multiple == true && self.parent && self.parent.schema.type == 'object' && self.parent.parent && self.parent.parent.schema.type == 'array') {

            // Load editor of parent.parent to get the array
            self.arrayEditor = self.jsoneditor.getEditor(self.parent.parent.path);
            // Check the current value of this editor
            self.value = self.arrayEditor.getValue();
            // Set variables for amount of files, index of current array item and
            // count value containing current status of processed files
            self.total = this.files.length;
            self.current_item_index = parseInt(self.parent.key);
            self.count = self.current_item_index;

            for (var i = 0; i < self.total; i++) {
              var fr_multiple = new FileReader();
              self.setFileReaderListener(fr_multiple);
              fr_multiple.readAsDataURL(this.files[i]);
            }
          } else {
            var fr = new FileReader();
            fr.onload = function(evt) {
              self.value = evt.target.result;
              self.refreshPreview();
              self.onChange(true);
              fr = null;
            };
            fr.readAsDataURL(this.files[0]);
          }
        }
      });
    }

    this.preview = this.theme.getFormInputDescription(this.schema.description);
    this.container.appendChild(this.preview);

    this.control = this.theme.getFormControl(this.label, this.uploader||this.input, this.preview, this.infoButton);
    this.container.appendChild(this.control);
  },
  refreshPreview: function() {
    if(this.last_preview === this.value) return;
    this.last_preview = this.value;

    this.preview.innerHTML = '';

    if(!this.value) return;

    var mime = this.value.match(/^data:([^;,]+)[;,]/);
    if(mime) mime = mime[1];

    if(!mime) {
      this.preview.innerHTML = '<em>Invalid data URI</em>';
    }
    else {
      this.preview.innerHTML = '<strong>Type:</strong> '+mime+', <strong>Size:</strong> '+Math.floor((this.value.length-this.value.split(',')[0].length-1)/1.33333)+' bytes';
      if(mime.substr(0,5)==="image") {
        this.preview.innerHTML += '<br>';
        var img = document.createElement('img');
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100px';
        img.src = this.value;
        this.preview.appendChild(img);
      }
    }
  },
  enable: function() {
    if(!this.always_disabled) {
      if(this.uploader) this.uploader.disabled = false;
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    if(this.uploader) this.uploader.disabled = true;
    this._super();
  },
  setValue: function(val) {
    if(this.value !== val) {
      this.value = val;
      this.input.value = this.value;
      this.refreshPreview();
      this.onChange();
    }
  },
  destroy: function() {
    if(this.preview && this.preview.parentNode) this.preview.parentNode.removeChild(this.preview);
    if(this.title && this.title.parentNode) this.title.parentNode.removeChild(this.title);
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    if(this.uploader && this.uploader.parentNode) this.uploader.parentNode.removeChild(this.uploader);

    this._super();
  }
});

JSONEditor.defaults.editors.upload = JSONEditor.AbstractEditor.extend({
  getNumColumns: function() {
    return 4;
  },
  build: function() {    
    var self = this;
    this.title = this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());

    // Input that holds the base64 string
    this.input = this.theme.getFormInputField('hidden');
    this.container.appendChild(this.input);
    
    // Don't show uploader if this is readonly
    if(!this.schema.readOnly && !this.schema.readonly) {

      if(!this.jsoneditor.options.upload) throw "Upload handler required for upload editor";

      // File uploader
      this.uploader = this.theme.getFormInputField('file');
      
      this.uploader.addEventListener('change',function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if(this.files && this.files.length) {
          var fr = new FileReader();
          fr.onload = function(evt) {
            self.preview_value = evt.target.result;
            self.refreshPreview();
            self.onChange(true);
            fr = null;
          };
          fr.readAsDataURL(this.files[0]);
        }
      });
    }

    var description = this.schema.description;
    if (!description) description = '';

    this.preview = this.theme.getFormInputDescription(description);
    this.container.appendChild(this.preview);

    this.control = this.theme.getFormControl(this.label, this.uploader||this.input, this.preview);
    this.container.appendChild(this.control);

    window.requestAnimationFrame(function() {
      if (self.value) {
        var img = document.createElement('img');
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100px';
        img.onload = function (event) {
          self.preview.appendChild(img);
        };
        img.onerror = function(error) {
          console.error('upload error', error);
        };
        img.src = self.container.querySelector('a').href;
      }
    });

  },
  refreshPreview: function() {
    if(this.last_preview === this.preview_value) return;
    this.last_preview = this.preview_value;

    this.preview.innerHTML = '';
    
    if(!this.preview_value) return;

    var self = this;

    var mime = this.preview_value.match(/^data:([^;,]+)[;,]/);
    if(mime) mime = mime[1];
    if(!mime) mime = 'unknown';

    var file = this.uploader.files[0];

    this.preview.innerHTML = '<strong>Type:</strong> '+mime+', <strong>Size:</strong> '+file.size+' bytes';
    if(mime.substr(0,5)==="image") {
      this.preview.innerHTML += '<br>';
      var img = document.createElement('img');
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100px';
      img.src = this.preview_value;
      this.preview.appendChild(img);
    }

    this.preview.innerHTML += '<br>';
    var uploadButton = this.getButton('Upload', 'upload', 'Upload');
    this.preview.appendChild(uploadButton);
    uploadButton.addEventListener('click',function(event) {
      event.preventDefault();

      uploadButton.setAttribute("disabled", "disabled");
      self.theme.removeInputError(self.uploader);

      if (self.theme.getProgressBar) {
        self.progressBar = self.theme.getProgressBar();
        self.preview.appendChild(self.progressBar);
      }

      self.jsoneditor.options.upload(self.path, file, {
        success: function(url) {
          self.setValue(url);

          if(self.parent) self.parent.onChildEditorChange(self);
          else self.jsoneditor.onChange();

          if (self.progressBar) self.preview.removeChild(self.progressBar);
          uploadButton.removeAttribute("disabled");
        },
        failure: function(error) {
          self.theme.addInputError(self.uploader, error);
          if (self.progressBar) self.preview.removeChild(self.progressBar);
          uploadButton.removeAttribute("disabled");
        },
        updateProgress: function(progress) {
          if (self.progressBar) {
            if (progress) self.theme.updateProgressBar(self.progressBar, progress);
            else self.theme.updateProgressBarUnknown(self.progressBar);
          }
        }
      });
    });

    if(this.jsoneditor.options.auto_upload || this.schema.options.auto_upload) {
      uploadButton.dispatchEvent(new MouseEvent('click'));
      this.preview.removeChild(uploadButton);
    }
  },
  enable: function() {
    if(!this.always_disabled) {
      if(this.uploader) this.uploader.disabled = false;
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    if(this.uploader) this.uploader.disabled = true;
    this._super();
  },
  setValue: function(val) {
    if(this.value !== val) {
      this.value = val;
      this.input.value = this.value;
      this.onChange();
    }
  },
  destroy: function() {
    if(this.preview && this.preview.parentNode) this.preview.parentNode.removeChild(this.preview);
    if(this.title && this.title.parentNode) this.title.parentNode.removeChild(this.title);
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    if(this.uploader && this.uploader.parentNode) this.uploader.parentNode.removeChild(this.uploader);

    this._super();
  }
});

JSONEditor.defaults.editors.checkbox = JSONEditor.AbstractEditor.extend({
  setValue: function(value,initial) {
    value = !!value;
    var changed = this.getValue() !== value;
    this.value = value;
    this.input.checked = this.value;
    this.onChange(changed);
  },
  register: function() {
    this._super();
    if(!this.input) return;
    this.input.setAttribute('name',this.formname);
  },
  unregister: function() {
    this._super();
    if(!this.input) return;
    this.input.removeAttribute('name');
  },
  getNumColumns: function() {
    return Math.min(12,Math.max(this.getTitle().length/7,2));
  },
  build: function() {
    var self = this;
    this.label = this.header = this.theme.getCheckboxLabel(this.getTitle(), this.isRequired());
    if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);
    if(this.options.infoText && !this.options.compact) this.infoButton = this.theme.getInfoButton(this.options.infoText);
    if(this.options.compact) this.container.classList.add('compact');

    this.input = this.theme.getCheckbox();
    this.control = this.theme.getFormControl(this.label, this.input, this.description, this.infoButton);

    if(this.schema.readOnly || this.schema.readonly) {
      this.always_disabled = true;
      this.input.disabled = true;
    }

    this.input.addEventListener('change',function(e) {
      e.preventDefault();
      e.stopPropagation();
      self.value = this.checked;
      self.onChange(true);
    });

    this.container.appendChild(this.control);
  },
  enable: function() {
    if(!this.always_disabled) {
      this.input.disabled = false;
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    this.input.disabled = true;
    this._super();
  },
  destroy: function() {
    if(this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    this._super();
  },
  showValidationErrors: function (errors) {
    var self = this;

    if (this.jsoneditor.options.show_errors === "always") {}

    else if (!this.is_dirty && this.previous_error_setting === this.jsoneditor.options.show_errors) {
      return;
    }

    this.previous_error_setting = this.jsoneditor.options.show_errors;

    var messages = [];
    $each(errors, function (i, error) {
      if (error.path === self.path) {
        messages.push(error.message);
      }
    });

    this.input.controlgroup = this.control;

    if (messages.length) {
      this.theme.addInputError(this.input, messages.join('. ') + '.');
    }
    else {
      this.theme.removeInputError(this.input);
    }
  }
});

JSONEditor.defaults.editors.arrayChoices = JSONEditor.defaults.editors.multiselect.extend({
  setValue: function(value, initial) {
    if (this.choices_instance) {

      // Make sure we are dealing with an array of strings so we can check for strict equality
      value = [].concat(value).map(function(e) {return e + '';});

      this.updateValue(value); // Sets this.value to sanitized value

      this.choices_instance.removeActiveItems(); // Remove existing selection
      this.choices_instance.setChoiceByValue(this.value); // Set new selection

      this.onChange(true);
    }
    else this._super(value, initial);

  },
  afterInputReady: function() {

    if (window.Choices && !this.choices_instance) {
      var options, self = this;
      // Get options, either global options from "JSONEditor.defaults.options.choices" or
      // single property options from schema "options.choices"
      options = this.expandCallbacks('choices', $extend({}, {
        removeItems: true,
        removeItemButton: true
      }, JSONEditor.defaults.options.choices || {}, this.options.choices || {}, {
        addItems: true,
        editItems: false,
        duplicateItemsAllowed: false
      }));

      // New items are allowed if option "addItems" is true and items type is "string"
      //this.newEnumAllowed = options.addItems = !!options.addItems && this.schema.items && this.schema.items.type == 'string';

      // Choices doesn't support adding new items to select type input
      this.newEnumAllowed = false;

      this.choices_instance = new window.Choices(this.input, options);

      // Remove change handler set in parent class (src/multiselect.js)
      this.control.removeEventListener('change', this.multiselectChangeHandler);

      // Create a new change handler
      this.multiselectChangeHandler = function(e) {
        var value = self.choices_instance.getValue(true);
        self.updateValue(value);
        self.onChange(true);
      };
      this.control.addEventListener('change', this.multiselectChangeHandler, false);

    }
    this._super();
  },
  updateValue: function(value) {
    value = [].concat(value);
    var changed = false, new_value = [];
    for(var i=0; i<value.length; i++) {
      if (!this.select_values[value[i]+'']) {
        changed = true;
        if (this.newEnumAllowed) {
          if (!this.addNewOption(value[i])) continue;
        }
        else continue;
      }
      var sanitized = this.sanitize(this.select_values[value[i]]);
      new_value.push(sanitized);
      if (sanitized !== value[i]) changed = true;
    }
    this.value = new_value;

    return changed;
  },
  addNewOption: function(value) {
    // Add new value and label
    this.option_keys.push(value + '');
    this.option_titles.push(value + '');
    this.select_values[value + ''] = value;
    // Update Schema enum to prevent triggering "Value must be one of the enumerated values"
    this.schema.items.enum.push(value);
    // Add new value and label to choices
    this.choices_instance.setChoices([{value: value + '', label: value + ''}], 'value', 'label', false);

    return true;
  },
  enable: function() {
    if (!this.always_disabled && this.choices_instance) this.choices_instance.enable();
    this._super();
  },
  disable: function(always_disabled) {
    if(this.choices_instance) this.choices_instance.disable();
    this._super(always_disabled);
  },
  destroy: function() {
    if(this.choices_instance) {
        this.choices_instance.destroy();
        this.choices_instance = null;
    }
    this._super();
  }
});
JSONEditor.defaults.editors.arraySelect2 = JSONEditor.defaults.editors.multiselect.extend({
  setValue: function(value, initial) {
    if (this.select2_instance) {

      // Make sure we are dealing with an array of strings so we can check for strict equality
      value = [].concat(value).map(function(e) {return e + '';});

      this.updateValue(value); // Sets this.value to sanitized value

      if (this.select2v4) this.select2_instance.val(this.value).change();
      else this.select2_instance.select2('val', this.value);

      this.onChange(true);
    }
    else this._super(value, initial);

  },
  afterInputReady: function() {

    var options, self = this, select2Handler;

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.select2 && !this.select2_instance) {

      // Get options, either global options from "JSONEditor.defaults.options.select2" or
      // single property options from schema "options.select2"
      options = this.expandCallbacks('select2', $extend({}, {
        tags: true,
        width: '100%'
      }, JSONEditor.defaults.options.select2 || {}, this.options.select2 || {}));

      // New items are allowed if option "tags" is true and items type is "string"
      this.newEnumAllowed = options.tags = !!options.tags && this.schema.items && this.schema.items.type == 'string';

      this.select2_instance = window.jQuery(this.input).select2(options);
      this.select2v4 = this.select2_instance.select2.hasOwnProperty("amd");

      this.selectChangeHandler = function() {
        var value = self.select2v4 ? self.select2_instance.val(): self.select2_instance.select2('val');
        self.updateValue(value);
        self.onChange(true);
      };

      // Add event handler.
      // Note: Must use the "on()" method and not addEventListener()
      this.select2_instance.on('select2-blur', this.selectChangeHandler);
      this.select2_instance.on('change', this.selectChangeHandler);
    }
    this._super();
  },
  updateValue: function(value) {
    value = [].concat(value);
    var changed = false, new_value = [];
    for(var i=0; i<value.length; i++) {
//      if (!this.select_options[value[i]+'']) {
      if (!this.select_values[value[i]+'']) {
        changed = true;
        if (this.newEnumAllowed) {
          if (!this.addNewOption(value[i])) continue;
        }
        else continue;
      }
      var sanitized = this.sanitize(this.select_values[value[i]]);
      new_value.push(sanitized);
      if (sanitized !== value[i]) changed = true;
    }
    this.value = new_value;

    return changed;
  },
  addNewOption: function(value) {
    // Add new value and label
    this.option_keys.push(value + '');
    this.option_titles.push(value + '');
    this.select_values[value + ''] = value;
    // Update Schema enum to prevent triggering "Value must be one of the enumerated values"
    this.schema.items.enum.push(value);

    var option_tag = this.input.querySelector('option[value="' + value + '"]');
    // Remove data attribute to make option tag permanent. (user input)
    if (option_tag) option_tag.removeAttribute('data-select2-tag');
    // Create new option tag (setValue)
    else this.input.appendChild(new Option(value, value, false, false)).trigger('change');

    return true;
  },
  enable: function() {
    if(!this.always_disabled && this.select2_instance) {
      if(this.select2v4) this.select2_instance.prop("disabled",false);
      else this.select2_instance.select2("enable",true);
    }
    this._super();
  },
  disable: function(always_disabled) {
    if(this.select2_instance) {
      if(this.select2v4) this.select2_instance.prop("disabled",true);
      else this.select2_instance.select2("enable",false);
    }
    this._super();
  },
  destroy: function() {
    if(this.select2_instance) {
        this.select2_instance.select2('destroy');
        this.select2_instance = null;
    }
    this._super();
  }
});
JSONEditor.defaults.editors.arraySelectize = JSONEditor.defaults.editors.multiselect.extend({
  setValue: function(value, initial) {
    if (this.selectize_instance) {

      // Make sure we are dealing with an array of strings so we can check for strict equality
      value = [].concat(value).map(function(e) {return e + '';});

      this.updateValue(value); // Sets this.value to sanitized value

      this.selectize_instance.setValue(this.value);

      this.onChange(true);
    }
    else this._super(value, initial);

  },
  afterInputReady: function() {
    var options, self = this;

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.selectize && !this.selectize_instance) {
      // Get options, either global options from "JSONEditor.defaults.options.selectize" or
      // single property options from schema "options.selectize"
      options = this.expandCallbacks('selectize', $extend({}, {
        plugins: ["remove_button"],
        delimiter: false,
        createOnBlur: true,
        create: true
      },JSONEditor.defaults.options.selectize || {}, this.options.selectize || {}));

      // New items are allowed if option "create" is true and items type is "string"
      this.newEnumAllowed = options.create = !!options.create && this.schema.items && this.schema.items.type == 'string';

      this.selectize_instance = (window.jQuery(this.input).selectize(options))[0].selectize;

      // Remove change handler set in parent class (src/multiselect.js)
      this.control.removeEventListener('change', this.multiselectChangeHandler);

      // Create a new change handler
      this.multiselectChangeHandler = function(e) {
        var value = self.selectize_instance.getValue();
        self.updateValue(value);
        self.onChange(true);
      };

      // Add new event handler.
      //Note: Must use the "on()" method and not addEventListener()
      this.selectize_instance.on('change', this.multiselectChangeHandler);
    }
    this._super();
  },
  updateValue: function(value) {
    value = [].concat(value);
    var changed = false, new_value = [];
    for(var i=0; i<value.length; i++) {
//      if (!this.select_options[value[i]+'']) {
      if (!this.select_values[value[i]+'']) {
        changed = true;
        if (this.newEnumAllowed) {
          if (!this.addNewOption(value[i])) continue;
        }
        else continue;
      }
      var sanitized = this.sanitize(this.select_values[value[i]]);
      new_value.push(sanitized);
      if (sanitized !== value[i]) changed = true;
    }
    this.value = new_value;

    return changed;
  },
  addNewOption: function(value) {
    // Add new value and label
    this.option_keys.push(value + '');
    this.option_titles.push(value + '');
    this.select_values[value + ''] = value;
    // Update Schema enum to prevent triggering "Value must be one of the enumerated values"
    this.schema.items.enum.push(value);
    // Add new value and label to selectize
    this.selectize_instance.addOption({text: value, value: value});

    return true;
  },
  enable: function() {
    if (!this.always_disabled && this.selectize_instance) this.selectize_instance.unlock();
    this._super();
  },
  disable: function(always_disabled) {
    if(this.selectize_instance) this.selectize_instance.lock();
    this._super(always_disabled);
  },
  destroy: function() {
    if(this.selectize_instance) {
      this.selectize_instance.destroy();
      this.selectize_instance = null;
    }
    this._super();
  }
});
JSONEditor.defaults.editors.starrating = JSONEditor.defaults.editors.string.extend({
  build: function () {
    var self = this;

    if(!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());
    if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);
    if(this.options.infoText) this.infoButton = this.theme.getInfoButton(this.options.infoText);
    if(this.options.compact) this.container.classList.add('compact');

    this.ratingContainer = document.createElement('div');
    this.ratingContainer.classList.add('starrating');

    // Emulate the old "rating" editor parameters
    if (this.schema.enum == undefined) {
      var max = this.schema.maximum ? this.schema.maximum : 5;
      if (this.schema.exclusiveMaximum) max--;
      this.enum_values = [];
      for (var k=0;k<max;k++) this.enum_values.push(k+1);
    }
    else this.enum_values = this.schema.enum;

    this.radioGroup = [];

    var radioInputEventhandler = function(e) {
      e.preventDefault();
      e.stopPropagation();
      self.setValue(this.value);
      self.onChange(true);
    };

    for(var i = this.enum_values.length-1; i>-1; i--) {

      var id = this.formname + (i+1);

      // form radio elements
      var radioInput = this.theme.getFormInputField('radio');
      radioInput.name = this.formname + '[starrating]';
      radioInput.value = this.enum_values[i];
      radioInput.id = id;
      radioInput.addEventListener('change', radioInputEventhandler, false);
      this.radioGroup.push(radioInput);

      // form-label for radio elements
      var radioLabel = document.createElement('label');
      radioLabel.htmlFor = id;
      radioLabel.title = this.enum_values[i];
      if(this.options.displayValue) {
        radioLabel.classList.add('starrating-display-enabled');
      }

      this.ratingContainer.appendChild(radioInput);
      this.ratingContainer.appendChild(radioLabel);

    }

    if(this.options.displayValue) {
      this.displayRating = document.createElement('div');
      this.displayRating.classList.add('starrating-display');
      this.displayRating.innerText = this.enum_values[0];
      this.ratingContainer.appendChild(this.displayRating);
    }

    if(this.schema.readOnly || this.schema.readonly) {
      this.always_disabled = true;
      for (var j = 0; j<this.radioGroup.length; j++) {
        this.radioGroup[j].disabled = true;
      }
      this.ratingContainer.classList.add('readonly');
    }

    var ratingsContainerWrapper = this.theme.getContainer();
    ratingsContainerWrapper.appendChild(this.ratingContainer);

    this.input = ratingsContainerWrapper;

    this.control = this.theme.getFormControl(this.label, ratingsContainerWrapper, this.description, this.infoButton);
    this.container.appendChild(this.control);

    this.refreshValue();

  },
  enable: function() {
    if(!this.always_disabled) {
      for (var i = 0; i<this.radioGroup.length; i++) {
        this.radioGroup[i].disabled = false;
      }
      this.ratingContainer.classList.remove('readonly');
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    for (var i = 0; i<this.radioGroup.length; i++) {
      this.radioGroup[i].disabled = true;
    }
    this.ratingContainer.classList.add('readonly');
    this._super();
  },
  destroy: function() {
    if(this.ratingContainer.parentNode && this.ratingContainer.parentNode.parentNode) this.ratingContainer.parentNode.parentNode.removeChild(this.ratingContainer.parentNode);
    if(this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    this._super();
  },
  getNumColumns: function() {
    return 2;
  },
  getValue: function() {
    if (!this.dependenciesFulfilled) {
      return undefined;
    }
    if (this.schema.type == 'integer') {
      return this.value===''?undefined:this.value*1;
    }
    return this.value;
  },
  setValue: function (val) {
    for(var i = 0; i < this.radioGroup.length; i++) {

      if(this.radioGroup[i].value == val) {
        this.radioGroup[i].checked = true;
        this.value = val;
        if(this.options.displayValue) {
          this.displayRating.innerHTML = this.value;
        }
        this.onChange(true);
        break;
      }
    }
  }
});

/*

Edtended handling of date, time and datetime-local type fields.

Works with both string and integer data types. (default only support string type)

Has optional support for using flatpickr datepicker.
All flatpickr options is supported with a few minor differences.
- "enableTime" and "noCalendar" are set automatically, based on the data type.
- Extra config option "errorDateFormat". If this is set, it will replace the format displayed in error messages.
- It is not possible to use "inline" and "wrap" options together.
- When using the "wrap" option, "toggle" and "clear" buttons are automatically added to markup. 2 extra boolean options ("showToggleButton" and "showClearButton") are available to control which buttons to display. Note: not all frameworks supports this. (Works in: Bootstrap and Foundation)
- When using the "inline" option, an extra boolean option ("inlineHideInput") is available to hide the original input field.
- If "mode" is set to either "multiple" or "range", only string data type is supported. Also the result from these is returned as a string not an array.

ToDo:
 - Improve Handling of flatpicker "multiple" and "range" modes. (Currently the values are just added as string values, but the optimal scenario would be to save those as array if possible)

*/
JSONEditor.defaults.editors.datetime = JSONEditor.defaults.editors.string.extend({
  build: function () {
    this._super();
    if(!this.input) return;

    if(window.flatpickr && typeof this.options.flatpickr == 'object') {

      // Make sure that flatpickr settings matches the input type
      this.options.flatpickr.enableTime = this.schema.format == 'date' ? false : true;
      this.options.flatpickr.noCalendar = this.schema.format == 'time' ? true : false;

      // Curently only string can contain range or multiple values
      if (this.schema.type == 'integer') this.options.flatpickr.mode = 'single';

      // Attribute for flatpicker
      this.input.setAttribute('data-input','');

      var input = this.input;

      if (this.options.flatpickr.wrap === true) {

        // Create buttons for input group
        var buttons = [];
        if (this.options.flatpickr.showToggleButton !== false) {
          var toggleButton = this.getButton('',this.schema.format == 'time' ? 'time' :'calendar', this.translate('flatpickr_toggle_button'));
          // Attribute for flatpicker
          toggleButton.setAttribute('data-toggle','');
          buttons.push(toggleButton);
        }
        if (this.options.flatpickr.showClearButton !== false) {
          var clearButton = this.getButton('','clear', this.translate('flatpickr_clear_button'));
          // Attribute for flatpicker
          clearButton.setAttribute('data-clear','');
          buttons.push(clearButton);
        }

        // Save position of input field
        var parentNode = this.input.parentNode, nextSibling = this.input.nextSibling;

        var buttonContainer = this.theme.getInputGroup(this.input, buttons);
        if (buttonContainer !== undefined) {
          // Make sure "inline" option is turned off
          this.options.flatpickr.inline = false;

          // Insert container at same position as input field
          parentNode.insertBefore(buttonContainer, nextSibling);

          input = buttonContainer;
        }
        else {
          this.options.flatpickr.wrap = false;
        }

      }

      this.flatpickr = window.flatpickr(input, this.options.flatpickr);

      if (this.options.flatpickr.inline === true && this.options.flatpickr.inlineHideInput === true) {
          this.input.setAttribute('type','hidden');
      }
    }
  },
  getValue: function() {
    if (!this.dependenciesFulfilled) {
      return undefined;
    }
    if (this.schema.type == 'string') {
      return this.value;
    }
    if (this.value === '' || this.value === undefined) {
      return undefined;
    }

    var value =  this.schema.format == 'time' ? '1970-01-01 ' + this.value : this.value;
    return parseInt(new Date(value).getTime() / 1000);
  },
  setValue: function(value, initial, from_template) {
    if (this.schema.type == 'string') {
      this._super(value, initial, from_template);
      if (this.flatpickr) this.flatpickr.setDate(value);
    }
    else if (value > 0) {
      var dateObj = new Date(value * 1000),
          year = dateObj.getFullYear(),
          month = this.zeroPad(dateObj.getMonth() + 1),
          day = this.zeroPad(dateObj.getDate()),
          hour = this.zeroPad(dateObj.getHours()),
          min = this.zeroPad(dateObj.getMinutes()),
          sec = this.zeroPad(dateObj.getSeconds()),
          date = [year, month, day].join('-'),
          time = [hour, min, sec].join(':'),
          dateValue = date + 'T' + time;

      if (this.schema.format == 'date') dateValue = date;
      else if (this.schema.format == 'time') dateValue = time;

      this.input.value = dateValue;
      this.refreshValue();
      if (this.flatpickr) this.flatpickr.setDate(dateValue);
    }
  },
  destroy: function() {
    if (this.flatpickr) this.flatpickr.destroy();
    this.flatpickr = null;
    this._super();
  },
  // helper function
  zeroPad: function(value) {
    return ('0' + value).slice(-2);
  }
});

JSONEditor.defaults.editors.signature = JSONEditor.defaults.editors.string.extend({

  // This editor is using the signature pad editor from https://github.com/szimek/signature_pad
  // Credits for the pad itself go to https://github.com/szimek

  build: function() {
    var self = this, i;

    if(!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());
    if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);
    var formname = this.formname.replace(/\W/g, '');

    if (typeof SignaturePad == 'function') {
      // Dynamically add the required CSS the first time this editor is used
      var styleId = 'json-editor-style-signature';
      var styles = document.getElementById(styleId);
      this.input = this.theme.getFormInputField('hidden');
      this.container.appendChild(this.input);

      // Required to keep height
      var signatureContainer = document.createElement('div');
      signatureContainer.classList.add('signature-container');

      // Create canvas for signature pad
      var canvas = document.createElement('canvas');
      canvas.setAttribute('name', formname);
      canvas.classList.add('signature');
      signatureContainer.appendChild(canvas);


      self.signaturePad = new window.SignaturePad(canvas, {
        onEnd: function() {

          // check if the signature is not empty before setting a value
          if (!self.signaturePad.isEmpty()) {
            self.input.value = self.signaturePad.toDataURL();
          } else {
            self.input.value = '';
          }

          self.is_dirty = true;
          self.refreshValue();
          self.watch_listener();
          self.jsoneditor.notifyWatchers(self.path);
          if(self.parent) self.parent.onChildEditorChange(self);
          else self.jsoneditor.onChange();

        }
      });

      // create button containers and add clear signature button
      var buttons = document.createElement('div');
      var clearButton = document.createElement('button');
      clearButton.classList.add('tiny', 'button');
      clearButton.innerHTML='Clear signature';
      buttons.appendChild(clearButton);
      signatureContainer.appendChild(buttons);

      if(this.options.compact) this.container.setAttribute('class',this.container.getAttribute('class')+' compact');

      if(this.schema.readOnly || this.schema.readonly) {
        this.always_disabled = true;
        $each(this.inputs,function(i,input) {
          canvas.setAttribute("readOnly", "readOnly");
          input.disabled = true;
        });
      }
      // add listener to the clear button. when clicked, trigger a canvas change after emptying the canvas
      clearButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.signaturePad.clear();
        // trigger stroke end to let signaturePad update the dataURL
        self.signaturePad.strokeEnd();
      });

      this.control = this.theme.getFormControl(this.label, signatureContainer, this.description);
      this.container.appendChild(this.control);
      this.refreshValue();

      // signature canvas will stretch to signatureContainer width
      canvas.width = signatureContainer.offsetWidth;
      if (self.options && self.options.canvas_height) {
        canvas.height = self.options.canvas_height;
      } else {
        canvas.height = "300"; // Set to default height of 300px;
      }
    } else {
      var message = document.createElement('p');
      message.innerHTML='Signature pad is not available, please include SignaturePad from https://github.com/szimek/signature_pad';
      this.container.appendChild(message);
    }

  },
  setValue: function(val) {
    var self = this, i;
    if (typeof SignaturePad == 'function') {
      var formname = this.formname.replace(/\W/g, '');
      var sanitized = this.sanitize(val);
      if(this.value === sanitized) {
        return;
      }
      self.value = sanitized;
      self.input.value = self.value;
      self.signaturePad.clear();
      // only set contents if value != ''
      if (val && val != '') {
        self.signaturePad.fromDataURL(val);
      }
      self.watch_listener();
      self.jsoneditor.notifyWatchers(self.path);
      return false;
    }
  },
  destroy: function() {
    var self = this, i;
    var formname = this.formname.replace(/\W/g, '');
    self.signaturePad.off();
    delete self.signaturePad;
  }
});

JSONEditor.defaults.editors.radio = JSONEditor.defaults.editors.select.extend({
  preBuild: function() {
    this.schema.required = true; // force editor into required mode to prevent creation of empty radio button
    this._super();
  },
  build: function () {
    var self = this;
    this.label = '';
    if(!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired());
    if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);
    if(this.options.infoText) this.infoButton = this.theme.getInfoButton(this.options.infoText);
    if(this.options.compact) this.container.classList.add('compact');

    this.radioContainer = document.createElement('div');

    this.radioGroup = [];

    var radioInputEventhandler = function(e) {
      self.setValue(this.value);
      self.onChange(true);
    };

    for(var i = 0; i < this.enum_values.length; i++) {

      // form radio elements
      this.input = this.theme.getFormRadio({
        name: this.formname,
        id: this.formname + '[' + i + ']',
        value: this.enum_values[i]
      });

      // Set custom attributes on input element. Parameter is array of protected keys. Empty array if none.
      this.setInputAttributes(['id', 'value', 'name']);

      this.input.addEventListener('change', radioInputEventhandler, false);
      this.radioGroup.push(this.input);

      // form-label for radio elements
      var radioLabel = this.theme.getFormRadioLabel(this.enum_display[i]);
      radioLabel.htmlFor = this.input.id;

      var control = this.theme.getFormRadioControl(radioLabel, this.input, !!(this.options.layout == 'horizontal' || this.options.compact));

      this.radioContainer.appendChild(control);

    }

    if(this.schema.readOnly || this.schema.readonly) {
      this.always_disabled = true;
      for (var j = 0; j < this.radioGroup.length; j++) {
        this.radioGroup[j].disabled = true;
      }
      this.radioContainer.classList.add('readonly');
    }

    var radioContainerWrapper = this.theme.getContainer();
    radioContainerWrapper.appendChild(this.radioContainer);

    this.input = radioContainerWrapper;

    this.control = this.theme.getFormControl(this.label, radioContainerWrapper, this.description, this.infoButton);
    this.container.appendChild(this.control);
  },
  enable: function() {
    if(!this.always_disabled) {
      for (var i = 0; i<this.radioGroup.length; i++) {
        this.radioGroup[i].disabled = false;
      }
      this.radioContainer.classList.remove('readonly');
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    for (var i = 0; i<this.radioGroup.length; i++) {
      this.radioGroup[i].disabled = true;
    }
    this.radioContainer.classList.add('readonly');
    this._super();
  },
  destroy: function() {
    if(this.radioContainer.parentNode && this.radioContainer.parentNode.parentNode) this.radioContainer.parentNode.parentNode.removeChild(this.radioContainer.parentNode);
    if(this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    this._super();
  },
  getNumColumns: function() {
    return 2;
  },
  setValue: function (val) {
    for(var i = 0; i < this.radioGroup.length; i++) {
      if(this.radioGroup[i].value == val) {
        this.radioGroup[i].checked = true;
        this.value = val;
        this.onChange();
        break;
      }
    }
  }
});

// hyper-link describeBy Editor

JSONEditor.defaults.editors.describedBy = JSONEditor.AbstractEditor.extend({
  register: function() {
    if (this.editors) {
      for (var i = 0; i < this.editors.length; i++) {
        if (!this.editors[i]) continue;
        this.editors[i].unregister();
      }

      if (this.editors[this.currentEditor]) this.editors[this.currentEditor].register();
    }

    this._super();
  },
  unregister: function() {
    this._super();

    if (this.editors) {
      for (var i = 0; i < this.editors.length; i++) {
        if (!this.editors[i]) continue;
        this.editors[i].unregister();
      }
    }
  },
  getNumColumns: function() {
    if (!this.editors[this.currentEditor]) return 4;
    return Math.max(this.editors[this.currentEditor].getNumColumns(), 4);
  },
  enable: function() {
    if (this.editors) {
      for (var i = 0; i < this.editors.length; i++) {
        if (!this.editors[i]) continue;
        this.editors[i].enable();
      }
    }

    this._super();
  },
  disable: function() {
    if (this.editors) {
      for (var i = 0; i < this.editors.length; i++) {
        if (!this.editors[i]) continue;
        this.editors[i].disable();
      }
    }

    this._super();
  },
  switchEditor: function() {
    var self = this;
    var vars = this.getWatchedFieldValues();

    if (!vars) return;

    //var ref = this.template.fillFromObject(vars);
    //var ref = this.template(vars);
    var ref = document.location.toString() + this.template(vars);

    if (!this.editors[this.refs[ref]]) {
      this.buildChildEditor(ref);
    }

    this.currentEditor = this.refs[ref];

    this.register();

    $each(this.editors, function(ref, editor) {
      if (!editor) return;
      if (self.currentEditor === ref) {
        editor.container.style.display = '';
      } else {
        editor.container.style.display = 'none';
      }
    });

    this.refreshValue();
    this.onChange(true);
  },
  buildChildEditor: function(ref) {
    this.refs[ref] = this.editors.length;

    var holder = this.theme.getChildEditorHolder();
    this.editor_holder.appendChild(holder);

    var schema = $extend({}, this.schema, this.jsoneditor.refs[ref]);

    var editor_class = this.jsoneditor.getEditorClass(schema, this.jsoneditor);

    var editor = this.jsoneditor.createEditor(editor_class, {
        jsoneditor: this.jsoneditor,
        schema: schema,
        container: holder,
        path: this.path,
        parent: this,
        required: true
      }
    );

    this.editors.push(editor);

    editor.preBuild();
    editor.build();
    editor.postBuild();
  },
  preBuild: function() {
    var self = this;

    this.refs = {};
    this.editors = [];
    this.currentEditor = '';

    for (var i = 0; i < this.schema.links.length; i++) {
      if (this.schema.links[i].rel.toLowerCase() === 'describedby') {
        //this.template = new UriTemplate(this.schema.links[i].href);
        this.template = this.jsoneditor.compileTemplate(this.schema.links[i].href, this.template_engine);
        break;
      }
    }

    /*this.template.fill(function(varName) {
      self.schema.watch = self.schema.watch || {};
      self.schema.watch[varName] = varName;
      return '';
    });*/

    this.schema.links.splice(0, 1);
    if (this.schema.links.length === 0) delete this.schema.links;

    this.baseSchema = $extend({}, this.schema);
  },
  build: function() {
    this.editor_holder = document.createElement('div');
    this.container.appendChild(this.editor_holder);
    this.switchEditor();
  },
  onWatchedFieldChange: function() {
    this.switchEditor();
  },
  onChildEditorChange: function(editor) {
    if (this.editors[this.currentEditor]) {
      this.refreshValue();
    }

    this._super(editor);
  },
  refreshValue: function() {
    if (this.editors[this.currentEditor]) {
      this.value = this.editors[this.currentEditor].getValue();
    }
  },
  setValue: function(val, initial) {
    if (this.editors[this.currentEditor]) {
      this.editors[this.currentEditor].setValue(val, initial);
      this.refreshValue();
      this.onChange();
    }
  },
  destroy: function() {
    $each(this.editors, function(i, editor) {
      if (editor) editor.destroy();
    });

    if (this.editor_holder && this.editor_holder.parentNode) {
      this.editor_holder.parentNode.removeChild(this.editor_holder);
    }

    this._super();
  },
  showValidationErrors: function(errors) {
    $each(this.editors, function(i, editor) {
      if (!editor) return;
      editor.showValidationErrors(errors);
    });
  }
});

// Add custom editor code
JSONEditor.defaults.editors.uuid = JSONEditor.defaults.editors.string.extend({
  preBuild: function() {
    this._super();

    // Use Schema "default" for setting autogenerated uuid
    this.schema["default"] = this.uuid = this.getUuid();

    // Force pattern validation
    this.jsoneditor.validator.schema.properties[this.key].pattern = this.schema.pattern = '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$';

    // Set cleave options if no existing options is present
    if (!this.schema.options) this.schema.options = {};
    if (!this.schema.options.cleave) this.schema.options.cleave = {
        delimiters: ['-'],
        blocks: [8, 4, 4, 4, 12]
      };

    // Set field to readonly and hide field, label and description
    //this.schema.readonly = this.options.compact = this.options.hidden = true;
  },
  sanitize: function(value) {
    if (!this.testUuid(value)) value = this.uuid;
    return value;
  },
  setValue: function(value,initial,from_template) {
    if (!this.testUuid(value)) value = this.uuid;
    this.uuid = value;
    this._super(value,initial,from_template);
  },
  getUuid: function() {
    // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },
  testUuid: function(value) {
    return (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
  }
});

JSONEditor.defaults.editors.jodit = JSONEditor.defaults.editors.string.extend({
  setValue: function(value,initial,from_template) {
    var res = this._super(value,initial,from_template);
    if (res !== undefined && res.changed && this.jodit_instance) this.jodit_instance.setEditorValue(res.value);
  },
  build: function() {
    this.options.format = 'textarea'; // Force format into "textarea"
    this._super();
    this.input_type = this.schema.format; // Restore original format
    this.input.setAttribute('data-schemaformat', this.input_type);
  },
  afterInputReady: function() {
    var self = this, options;

    if (window.Jodit) {
      // Get options, either global options from "JSONEditor.defaults.options.jodit" or
      // single property options from schema "options.jodit"
      options = this.expandCallbacks('jodit', $extend({}, {
        height: 300
      }, JSONEditor.defaults.options.jodit || {}, this.options.jodit || {}));

      this.jodit_instance = new window.Jodit(this.input, options);

      if(this.schema.readOnly || this.schema.readonly || this.schema.template) {
        this.jodit_instance.setReadOnly(true);
      }

      this.jodit_instance.events.on("change",function() {
        self.value = self.jodit_instance.getEditorValue();
        self.is_dirty = true;
        self.onChange(true);
      });

      this.theme.afterInputReady(self.input);
    }
    else this._super();  // Library not loaded, so just treat this as a string
  },
  getNumColumns: function() {
    return 6;
  },
  enable: function() {
    if (!this.always_disabled && this.jodit_instance) this.jodit_instance.setReadOnly(false);
    this._super();
  },
  disable: function(always_disabled) {
    if (this.jodit_instance) this.jodit_instance.setReadOnly(true);
    this._super(always_disabled);
  },
  destroy: function() {
    if (this.jodit_instance) {
      this.jodit_instance.destruct();
      this.jodit_instance = null;
    }
    this._super();
  }
});
JSONEditor.defaults.editors.ace = JSONEditor.defaults.editors.string.extend({
  setValue: function(value,initial,from_template) {
    var res = this._super(value,initial,from_template);
    if (res !== undefined && res.changed && this.ace_editor_instance) {
      this.ace_editor_instance.setValue(res.value);
      this.ace_editor_instance.session.getSelection().clearSelection();
      this.ace_editor_instance.resize();
    }
  },
  build: function() {
    this.options.format = 'textarea'; // Force format into "textarea"
    this._super();
    this.input_type = this.schema.format; // Restore original format
    this.input.setAttribute('data-schemaformat', this.input_type);
  },
  afterInputReady: function() {
    var self = this, options;

    if (window.ace) {

      var mode = this.input_type;
        // aliases for c/cpp
      if(mode === 'cpp' || mode === 'c++' || mode === 'c') mode = 'c_cpp';

      // Get options, either global options from "JSONEditor.defaults.options.ace" or
      // single property options from schema "options.ace"
      options = this.expandCallbacks('ace', $extend({}, {
        selectionStyle: 'text',
        minLines: 30,
        maxLines: 30
      }, JSONEditor.defaults.options.ace || {}, this.options.ace || {}, {
        mode: 'ace/mode/' + mode
      }));

      this.ace_container = document.createElement('div');
      this.ace_container.style.width = '100%';
      this.ace_container.style.position = 'relative';
      //this.ace_container.style.height = '400px';
      this.input.parentNode.insertBefore(this.ace_container,this.input);
      this.input.style.display = 'none';

      this.ace_editor_instance = window.ace.edit(this.ace_container, options);

      this.ace_editor_instance.setValue(this.getValue());
      this.ace_editor_instance.session.getSelection().clearSelection();
      this.ace_editor_instance.resize();

      if(this.schema.readOnly || this.schema.readonly || this.schema.template) {
        this.ace_editor_instance.setReadOnly(true);
      }

      // Listen for changes
      this.ace_editor_instance.on('change',function() {
        self.input.value = self.ace_editor_instance.getValue();
        self.refreshValue();
        self.is_dirty = true;
        self.onChange(true);
      });

      this.theme.afterInputReady(self.input);
    }
    else this._super();  // Library not loaded, so just treat this as a string
  },
  getNumColumns: function() {
    return 6;
  },
  enable: function() {
    if (!this.always_disabled && this.ace_editor_instance) this.ace_editor_instance.setReadOnly(false);
    this._super();
  },
  disable: function(always_disabled) {
    if (this.ace_editor_instance) this.ace_editor_instance.setReadOnly(true);
    this._super(always_disabled);
  },
  destroy: function() {
    if (this.ace_editor_instance) {
      this.ace_editor_instance.destroy();
      this.ace_editor_instance = null;
    }
    this._super();
  }
});
JSONEditor.defaults.editors.simplemde = JSONEditor.defaults.editors.string.extend({
  setValue: function(value,initial,from_template) {
    var res = this._super(value,initial,from_template);
    if (res !== undefined && res.changed && this.simplemde_instance) this.simplemde_instance.value(res.value);
  },
  build: function() {
    this.options.format = 'textarea'; // Force format into "textarea"
    this._super();
    this.input_type = this.schema.format; // Restore original format
    this.input.setAttribute('data-schemaformat', this.input_type);
  },
  afterInputReady: function() {
    var self = this, options;

    if (window.SimpleMDE) {
      // Get options, either global options from "JSONEditor.defaults.options.simplemde" or
      // single property options from schema "options.simplemde"
      options = this.expandCallbacks('simplemde', $extend({}, {
        height: 300
      }, JSONEditor.defaults.options.simplemde || {}, this.options.simplemde || {}, {
        element: this.input
      }));

      this.simplemde_instance = new window.SimpleMDE(options);

      if(this.schema.readOnly || this.schema.readonly || this.schema.template) {
        this.simplemde_instance.codemirror.options.readOnly = true;
      }

      // Listen for changes
      this.simplemde_instance.codemirror.on("change",function() {
        self.value = self.simplemde_instance.value();
        self.is_dirty = true;
        self.onChange(true);
      });

      this.theme.afterInputReady(self.input);
    }
    else this._super();  // Library not loaded, so just treat this as a string
  },
  getNumColumns: function() {
    return 6;
  },
  enable: function() {
    if (!this.always_disabled && this.simplemde_instance) this.simplemde_instance.codemirror.options.readOnly = false;
    this._super();
  },
  disable: function(always_disabled) {
    if (this.simplemde_instance) this.simplemde_instance.codemirror.options.readOnly = true;
    this._super(always_disabled);
  },
  destroy: function() {
    if (this.simplemde_instance) {
      this.simplemde_instance.toTextArea();
      this.simplemde_instance = null;
    }
    this._super();
  }
});
JSONEditor.defaults.editors.autocomplete = JSONEditor.defaults.editors.string.extend({
  postBuild: function() {
    if (window.Autocomplete) {
      // create wrapper container
      this.autocomplete_wrapper = document.createElement('div');

      // insert wrapper after this.input in the DOM tree
      this.input.parentNode.insertBefore(this.autocomplete_wrapper, this.input.nextSibling);

      // move this.input into wrapper
      this.autocomplete_wrapper.appendChild(this.input);

      // create dropdown container
      this.autocomplete_dropdown = document.createElement('ul');

      // insert dropdown after this.input in the DOM tree
      this.input.parentNode.insertBefore(this.autocomplete_dropdown, this.input.nextSibling);
    }
    this._super();
  },
  afterInputReady: function() {
    var options;

    if (window.Autocomplete && !this.autocomplete_instance) {
      // Get options, either global options from "JSONEditor.defaults.options.autocomplete" or
      // single property options from schema "options.autocomplete"
      options = this.expandCallbacks('autocomplete', $extend({}, {
        'search': function(jseditor, input) {
          console.log('No "search" callback defined for autocomplete in property "' + jseditor.key + '"');
return [];
        }.bind(null, this),
        'baseClass': 'autocomplete'
      }, JSONEditor.defaults.options.autocomplete || {}, this.options.autocomplete || {}));

      this.autocomplete_wrapper.classList.add(options.baseClass);
      this.autocomplete_dropdown.classList.add(options.baseClass + '-result-list');
        //this.input.classList.add(options.baseClass + '-input');

      this.autocomplete_instance = new window.Autocomplete(this.autocomplete_wrapper, options);
    }
    this._super();
  },
  destroy: function() {
    if (this.autocomplete_instance) {
      if (this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
      if (this.autocomplete_dropdown && this.autocomplete_dropdown.parentNode) this.autocomplete_dropdown.parentNode.removeChild(this.autocomplete_dropdown);
      if (this.autocomplete_wrapper && this.autocomplete_wrapper.parentNode) this.autocomplete_wrapper.parentNode.removeChild(this.autocomplete_wrapper);
      this.autocomplete_instance = null;
    }
    this._super();
  }

});

// Non-Active editor for displaying buttons in form
JSONEditor.defaults.editors.button = JSONEditor.AbstractEditor.extend({
  init: function(options) {
    this._super(options);
    this.active = false;

    // Set field to required in schema otherwise it will not be displayed
    if(this.parent && this.parent.schema) {
      if (Array.isArray(this.parent.schema.required)) {
        if(this.parent.schema.required.indexOf(this.key) === -1) {
          this.parent.schema.required.push(this.key);
        }
      }
      else {
        this.parent.schema.required = [this.key];
      }
    }
  },
  build: function() {

    this.options.compact = true;

      // Get options, either global options from "JSONEditor.defaults.options.button" or
      // single property options from schema "options.button"
    var title = this.schema.title || this.key,
        options = this.expandCallbacks('button', $extend({}, {
      'icon': '',
      'validated': false,
      'align': 'left',
      'action': function(jseditor, e) {
        alert('No button action defined for "' + jseditor.path + '"');
      }.bind(null, this)
    }, JSONEditor.defaults.options.button || {}, this.options.button || {}));


    this.input = this.theme.getFormButton(title, options.icon, title);
    this.input.addEventListener('click', options.action, false);

    if(this.schema.readOnly || this.schema.readonly || this.schema.template) {
      this.always_disabled = true;
      this.input.setAttribute('readonly', 'true');
    }

    // Set custom attributes on input element. Parameter is array of protected keys. Empty array if none.
    this.setInputAttributes(['readonly']);

    this.control = this.theme.getFormButtonHolder(options.align);
    this.control.appendChild(this.input);

    this.container.appendChild(this.control);

    var self = this;
    this.changeHandler = function() {
      if (self.jsoneditor.validate(self.jsoneditor.getValue()).length > 0) self.disable();
      else self.enable();
    };

    // Enable/disable the button depending on form validation
    if (options.validated) this.jsoneditor.on('change', this.changeHandler);

  },
  enable: function() {
    if(!this.always_disabled) {
      this.input.disabled = false;
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    this.input.disabled = true;
    this._super();
  },
  getNumColumns: function() {
    return 2;
  },
  activate: function() {
    this.active = false;
    this.enable();
   },
  deactivate: function() {
    // only non required properties can be deactivated.
    if (!this.isRequired()) {
      this.active = false;
      this.disable();
    }
  },
  destroy: function() {
    this.jsoneditor.off('change', this.changeHandler);
    this.changeHandler = null;
    this._super();
  }
});

JSONEditor.defaults.editors.sceditor = JSONEditor.defaults.editors.string.extend({
  setValue: function(value,initial,from_template) {
    var res = this._super(value,initial,from_template);
    if (res !== undefined && res.changed && this.sceditor_instance) this.sceditor_instance.val(res.value);
  },
  build: function() {
    this.options.format = 'textarea'; // Force format into "textarea"
    this._super();
    this.input_type = this.schema.format; // Restore original format
    this.input.setAttribute('data-schemaformat', this.input_type);
  },
  afterInputReady: function() {
    var self = this, options;

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.sceditor) {
      // Get options, either global options from "JSONEditor.defaults.options.sceditor" or
      // single property options from schema "options.sceditor"
      options = this.expandCallbacks('sceditor', $extend({}, {
        plugins: self.input_type,
        emoticonsEnabled: false,
        width: '100%',
        height: 300
      }, JSONEditor.defaults.options.sceditor || {}, this.options.sceditor || {}, {
        element: this.input
      }));

      window.jQuery(self.input).sceditor(options);
      this.sceditor_instance = window.jQuery(self.input).sceditor('instance');

      if(this.schema.readOnly || this.schema.readonly || this.schema.template) {
        this.sceditor_instance.readOnly(true);
      }

      // Listen for changes
      self.sceditor_instance.blur(function() {
        // Get editor's value
        var val = window.jQuery("<div>"+self.sceditor_instance.val()+"</div>");
        // Remove sceditor spans/divs
        window.jQuery('#sceditor-start-marker,#sceditor-end-marker,.sceditor-nlf',val).remove();
        // Set the value and update
        self.input.value = val.html();
        self.value = self.input.value;
        self.is_dirty = true;
        self.onChange(true);
      });

      this.theme.afterInputReady(self.input);
    }
    else this._super();  // Library not loaded, so just treat this as a string
  },
  getNumColumns: function() {
    return 6;
  },
  enable: function() {
    if (!this.always_disabled && this.sceditor_instance) this.sceditor_instance.readOnly(false);
    this._super();
  },
  disable: function(always_disabled) {
    if (this.sceditor_instance) this.sceditor_instance.readOnly(true);
    this._super(always_disabled);
  },
  destroy: function() {
    if (this.sceditor_instance) {
      this.sceditor_instance.destroy();
      this.sceditor_instance = null;
    }
    this._super();
  }
});
JSONEditor.defaults.editors.select2 = JSONEditor.defaults.editors.select.extend({
  setValue: function(value, initial) {
    if (this.select2_instance) {

      if(initial) this.is_dirty = false;
      else if(this.jsoneditor.options.show_errors === "change") this.is_dirty = true;

      var sanitized = this.updateValue(value); // Sets this.value to sanitized value

      this.input.value = sanitized;

      if(this.select2v4) this.select2_instance.val(sanitized).trigger("change");
      else this.select2_instance.select2('val',sanitized);

      this.onChange(true);
    }
    else this._super(value, initial);

  },
  afterInputReady: function() {

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.select2 && !this.select2_instance) {

      // Get options, either global options from "JSONEditor.defaults.options.select2" or
      // single property options from schema "options.select2"
      var self = this, options = this.expandCallbacks('select2', $extend({}, JSONEditor.defaults.options.select2 || {}, this.options.select2 || {}));

      // New items are allowed if option "tags" is true and type is "string"
      this.newEnumAllowed = options.tags = !!options.tags && this.schema.type == 'string';

      this.select2_instance = window.jQuery(this.input).select2(options);
      this.select2v4 = this.select2_instance.select2.hasOwnProperty("amd");

      // Create change handler
      this.selectChangeHandler = function() {
        var value = self.select2v4 ? self.select2_instance.val(): self.select2_instance.select2('val');
        self.updateValue(value);
        self.onChange(true);
      };

      // Add event handler.
      // Note: Must use the "on()" method and not addEventListener()
      this.select2_instance.on('change', this.selectChangeHandler);
      this.select2_instance.on('select2-blur',this.selectChangeHandler);
    }
    this._super();
  },
  updateValue: function(value) {
    var sanitized = this.enum_values[0];
    value = this.typecast(value || '');
    if (this.enum_values.indexOf(value) === -1) {
      if (this.newEnumAllowed) {
        sanitized = this.addNewOption(value) ? value : sanitized;
      }
    }
    else sanitized = value;
    this.value = sanitized;
    return sanitized;
  },
  addNewOption: function(value) {
    var sanitized = this.typecast(value), res = false, option_tag;

    if (this.enum_values.indexOf(sanitized) < 0 && sanitized !== '') {
      // Add to list of valid enum values
      this.enum_options.push('' + sanitized);
      this.enum_display.push('' + sanitized);
      this.enum_values.push(sanitized);
      // Update Schema enum to prevent triggering error
      // "Value must be one of the enumerated values"
      this.schema.enum.push(sanitized);

      option_tag = this.input.querySelector('option[value="' + sanitized + '"]');
      if (option_tag) {
        // Remove data attribute to make option tag permanent.
        option_tag.removeAttribute('data-select2-tag');
      }
      else {
        this.input.appendChild(new Option(sanitized, sanitized, false, false)).trigger('change');
      }

      res = true;
    }
    return res;
  },
  enable: function() {
    if (!this.always_disabled) {
      if(this.select2_instance) {
        if(this.select2v4) this.select2_instance.prop("disabled",false);
        else this.select2_instance.select2("enable",true);
      }
    }
    this._super();
  },
  disable: function(always_disabled) {
    if (this.select2_instance) {
      if (this.select2v4) this.select2_instance.prop("disabled",true);
      else this.select2_instance.select2("enable",false);
    }
    this._super(always_disabled);
  },
  destroy: function() {
    if(this.select2_instance) {
      this.select2_instance.select2('destroy');
      this.select2_instance = null;
    }
    this._super();
  }
});
JSONEditor.defaults.editors.ip = JSONEditor.defaults.editors.string.extend({
  preBuild: function() {
    this._super();
    var pattern, patternmessage;

    if (this.schema.format == 'hostname') {
      // https://www.regextester.com/103452
      pattern = '(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$)';
      patternmessage = this.options.patternmessage || this.translate('error_hostname');
    }
    else if (this.schema.format == 'ipv6') {
      pattern = '^(?:(?:(?:[a-fA-F0-9]{1,4}:){6}|(?=(?:[a-fA-F0-9]{0,4}:){2,6}(?:[0-9]{1,3}\.){3}[0-9]{1,3}$)(([0-9a-fA-F]{1,4}:){1,5}|:)((:[0-9a-fA-F]{1,4}){1,5}:|:)|::(?:[a-fA-F0-9]{1,4}:){5})(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])|(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|(?=(?:[a-fA-F0-9]{0,4}:){0,7}[a-fA-F0-9]{0,4}$)(([0-9a-fA-F]{1,4}:){1,7}|:)((:[0-9a-fA-F]{1,4}){1,7}|:)|(?:[a-fA-F0-9]{1,4}:){7}:|:(:[a-fA-F0-9]{1,4}){7})$';
      patternmessage = this.options.patternmessage || this.translate('error_ipv6');
      // Set cleave options if no existing options is present
      if (this.schema.options && !this.schema.options.cleave) this.schema.options.cleave = {
          delimiters: [':'],
          blocks: [4, 4, 4, 4, 4, 4, 4, 4],
          uppercase: true
        };
    }
    else {
      pattern = '^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$';
      patternmessage = this.options.patternmessage || this.translate('error_ipv4');
      // Set cleave options if no existing options is present
      if (this.schema.options && !this.schema.options.cleave) this.schema.options.cleave = {
          delimiters: ['.'],
          blocks: [3, 3, 3, 3],
          numericOnly: true
        };
    }

    // Set custom pattern error validation message
    if (!this.jsoneditor.validator.schema.properties[this.key].options) this.jsoneditor.validator.schema.properties[this.key].options = {};
    this.options.patternmessage = this.jsoneditor.validator.schema.properties[this.key].options.patternmessage = patternmessage;

    // Force pattern validation
    this.jsoneditor.validator.schema.properties[this.key].pattern = this.schema.pattern = pattern;

  }
});

// Non-Active editor for displaying text blocks in form
JSONEditor.defaults.editors.info = JSONEditor.defaults.editors.button.extend({
  build: function() {
    this.options.compact = false;
    this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
    this.description = this.theme.getDescription(this.schema.description || '');
    this.control = this.theme.getFormControl(this.label, this.description, null);
    this.container.appendChild(this.control);
  },
  getTitle: function() {
    return this.schema.title;
  },
  getNumColumns: function() {
    return 12;
  }
});

var matchKey = (function () {
  var elem = document.documentElement;

  if (elem.matches) return 'matches';
  else if (elem.webkitMatchesSelector) return 'webkitMatchesSelector';
  else if (elem.mozMatchesSelector) return 'mozMatchesSelector';
  else if (elem.msMatchesSelector) return 'msMatchesSelector';
  else if (elem.oMatchesSelector) return 'oMatchesSelector';
})();

JSONEditor.AbstractTheme = Class.extend({
  /* Theme config options that allows changing various aspects of the output */
  options: {
    'disable_theme_rules': false
  },
  /* Custom stylesheet rules. format: "selector" : "CSS rules" */
  rules: {},
  getContainer: function() {
    return document.createElement('div');
  },
  getFloatRightLinkHolder: function() {
    var el = document.createElement('div');
    el.style = el.style || {};
    el.style.cssFloat = 'right';
    el.style.marginLeft = '10px';
    return el;
  },
  getModal: function() {
    var el = document.createElement('div');
    el.style.backgroundColor = 'white';
    el.style.border = '1px solid black';
    el.style.boxShadow = '3px 3px black';
    el.style.position = 'absolute';
    el.style.zIndex = '10';
    el.style.display = 'none';
    return el;
  },
  getGridContainer: function() {
    var el = document.createElement('div');
    return el;
  },
  getGridRow: function() {
    var el = document.createElement('div');
    el.classList.add('row');
    return el;
  },
  getGridColumn: function() {
    var el = document.createElement('div');
    return el;
  },
  setGridColumnSize: function(el,size) {

  },
  getLink: function(text) {
    var el = document.createElement('a');
    el.setAttribute('href','#');
    el.appendChild(document.createTextNode(text));
    return el;
  },
  disableHeader: function(header) {
    header.style.color = '#ccc';
  },
  disableLabel: function(label) {
    label.style.color = '#ccc';
  },
  enableHeader: function(header) {
    header.style.color = '';
  },
  enableLabel: function(label) {
    label.style.color = '';
  },
  getInfoButton: function(text) {
    var icon = document.createElement('span');
    icon.innerText = "ⓘ";
    icon.style.fontSize = "16px";
    icon.style.fontWeight = "bold";
    icon.style.padding = ".25rem";
    icon.style.position = "relative";
    icon.style.display = "inline-block";

    var tooltip = document.createElement('span');
    tooltip.style.fontSize = "12px";
    icon.style.fontWeight = "normal";
    tooltip.style["font-family"] = "sans-serif";
    tooltip.style.visibility = "hidden";
    tooltip.style["background-color"] = "rgba(50, 50, 50, .75)";
    tooltip.style.margin = "0 .25rem";
    tooltip.style.color = "#FAFAFA";
    tooltip.style.padding = ".5rem 1rem";
    tooltip.style["border-radius"] = ".25rem";
    tooltip.style.width = "20rem";
    tooltip.style.position = "absolute";
    tooltip.innerText = text;
    icon.onmouseover = function() {
      tooltip.style.visibility = "visible";
    };
    icon.onmouseleave = function() {
      tooltip.style.visibility = "hidden";
    };

    icon.appendChild(tooltip);

    return icon;
  },
  getFormInputLabel: function(text, req) {
    var el = document.createElement('label');
    el.appendChild(document.createTextNode(text));
    if (req) el.classList.add('required');
    return el;
  },
  getHeader: function(text) {
    var el = document.createElement('h3');
    if(typeof text === "string") {
      el.textContent = text;
    }
    else {
      el.appendChild(text);
    }

    return el;
  },
  getCheckbox: function() {
    var el = this.getFormInputField('checkbox');
    el.style.display = 'inline-block';
    el.style.width = 'auto';
    return el;
  },
  getCheckboxLabel: function(text, req) {
    var el = document.createElement('label');
    el.appendChild(document.createTextNode('\u00A0' + text));
    if (req) el.classList.add('required');
    return el;
  },
  getMultiCheckboxHolder: function(controls,label,description, infoText) {
    var el = document.createElement('div');
    el.classList.add('control-group');

    if(label) {
      label.style.display = 'block';
      el.appendChild(label);
      if(infoText) label.appendChild(infoText);
    }

    for(var i in controls) {
      if(!controls.hasOwnProperty(i)) continue;
      controls[i].style.display = 'inline-block';
      controls[i].style.marginRight = '20px';
      el.appendChild(controls[i]);
    }

    if(description) el.appendChild(description);

    return el;
  },
  getFormCheckboxControl: function(label, input, compact) {
    var el = document.createElement('div');
    el.appendChild(label);
    input.style.width = 'auto';
    label.insertBefore(input, label.firstChild);
    if (compact) this.applyStyles(el,{
      display: 'inline-block',
      marginRight: '1rem'
    });

    return el;
  },

  getFormRadio: function(attributes) {
    var el = this.getFormInputField('radio');
    for(var key in attributes){
      el.setAttribute(key, attributes[key]);
    }
    el.style.display = 'inline-block';
    el.style.width = 'auto';
    return el;
  },
  getFormRadioLabel: function(text, req) {
    var el = document.createElement('label');
    el.appendChild(document.createTextNode('\u00A0' + text));
    if (req) el.classList.add('required');
    return el;
  },
  getFormRadioControl: function(label, input, compact) {
    var el = document.createElement('div');
    el.appendChild(label);
    input.style.width = 'auto';
    label.insertBefore(input, label.firstChild);
    if (compact) this.applyStyles(el,{
      display: 'inline-block',
      marginRight: '1rem'
    });

    return el;
  },
  getSelectInput: function(options, multiple) {
    var select = document.createElement('select');
    if(options) this.setSelectOptions(select, options);
    return select;
  },
  getSwitcher: function(options) {
    var switcher = this.getSelectInput(options, false);
    switcher.style.backgroundColor = 'transparent';
    switcher.style.display = 'inline-block';
    switcher.style.fontStyle = 'italic';
    switcher.style.fontWeight = 'normal';
    switcher.style.height = 'auto';
    switcher.style.marginBottom = 0;
    switcher.style.marginLeft = '5px';
    switcher.style.padding = '0 0 0 3px';
    switcher.style.width = 'auto';
    return switcher;
  },
  getSwitcherOptions: function(switcher) {
    return switcher.getElementsByTagName('option');
  },
  setSwitcherOptions: function(switcher, options, titles) {
    this.setSelectOptions(switcher, options, titles);
  },
  setSelectOptions: function(select, options, titles) {
    titles = titles || [];
    select.innerHTML = '';
    for(var i=0; i<options.length; i++) {
      var option = document.createElement('option');
      option.setAttribute('value',options[i]);
      option.textContent = titles[i] || options[i];
      select.appendChild(option);
    }
  },
  getTextareaInput: function() {
    var el = document.createElement('textarea');
    el.style = el.style || {};
    el.style.width = '100%';
    el.style.height = '300px';
    el.style.boxSizing = 'border-box';
    return el;
  },
  getRangeInput: function(min,max,step) {
    var el = this.getFormInputField('range');
    el.setAttribute('min',min);
    el.setAttribute('max',max);
    el.setAttribute('step',step);
    return el;
  },
  getRangeOutput: function(input, startvalue) {
    var output = document.createElement('output');
    output.value = startvalue || 0;

    var updateOutput = function() {output.value = this.value;};
    input.addEventListener('change', updateOutput, false);
    input.addEventListener('input', updateOutput, false);
    return output;
  },
  getRangeControl: function(input, output) {
    var el = document.createElement('div');
    el.style.textAlign = 'center';
    if (output) el.appendChild(output);
    el.appendChild(input);
    return el;
  },
  getFormInputField: function(type) {
    var el = document.createElement('input');
    el.setAttribute('type',type);
    return el;
  },
  afterInputReady: function(input) {

  },
  getFormControl: function(label, input, description, infoText) {
    var el = document.createElement('div');
    el.classList.add('form-control');
    if(label) el.appendChild(label);
    if((input.type === 'checkbox' || input.type === 'radio') && label) {
      input.style.width = 'auto';
      label.insertBefore(input,label.firstChild);
      if(infoText) label.appendChild(infoText);
    }
    else {
      if(infoText) label.appendChild(infoText);
      el.appendChild(input);
    }

    if(description) el.appendChild(description);
    return el;
  },
  getIndentedPanel: function() {
    var el = document.createElement('div');
    el.style = el.style || {};
    el.style.paddingLeft = '10px';
    el.style.marginLeft = '10px';
    el.style.borderLeft = '1px solid #ccc';
    return el;
  },
  getTopIndentedPanel: function() {
    var el = document.createElement('div');
    el.style = el.style || {};
    el.style.paddingLeft = '10px';
    el.style.marginLeft = '10px';
    return el;
  },
  getChildEditorHolder: function() {
    return document.createElement('div');
  },
  getDescription: function(text) {
    var el = document.createElement('p');
    if (window.DOMPurify) el.innerHTML = window.DOMPurify.sanitize(text);
    else el.textContent = this.cleanText(text);
    return el;
  },
  getCheckboxDescription: function(text) {
    return this.getDescription(text);
  },
  getFormInputDescription: function(text) {
    return this.getDescription(text);
  },
  getButtonHolder: function() {
    return document.createElement('div');
  },
  getHeaderButtonHolder: function() {
    return this.getButtonHolder();
  },
  getFormButtonHolder: function(button_align) {
    return this.getButtonHolder();
  },
  getButton: function(text, icon, title) {
    var el = document.createElement('button');
    el.type = 'button';
    this.setButtonText(el,text,icon,title);
    return el;
  },
  getFormButton: function(text, icon, title) {
    return this.getButton(text, icon, title);
  },
  setButtonText: function(button, text, icon, title) {
    // Clear previous contents. https://jsperf.com/innerhtml-vs-removechild/37
    while (button.firstChild) {
      button.removeChild(button.firstChild);
    }
    if(icon) {
      button.appendChild(icon);
      text = ' ' + text;
    }
    var spanEl = document.createElement('span');
    spanEl.appendChild(document.createTextNode(text));
    button.appendChild(spanEl);
    if(title) button.setAttribute('title',title);
  },

  // Table functions
  getTable: function() {
    return document.createElement('table');
  },
  getTableRow: function() {
    return document.createElement('tr');
  },
  getTableHead: function() {
    return document.createElement('thead');
  },
  getTableBody: function() {
    return document.createElement('tbody');
  },
  getTableHeaderCell: function(text) {
    var el = document.createElement('th');
    el.textContent = text;
    return el;
  },
  getTableCell: function() {
    var el = document.createElement('td');
    return el;
  },
  getErrorMessage: function(text) {
    var el = document.createElement('p');
    el.style = el.style || {};
    el.style.color = 'red';
    el.appendChild(document.createTextNode(text));
    return el;
  },
  addInputError: function(input, text) {
  },
  removeInputError: function(input) {
  },
  addTableRowError: function(row) {
  },
  removeTableRowError: function(row) {
  },
  getTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.innerHTML = "<div style='float: left; width: 130px;' class='tabs'></div><div class='content' style='margin-left: 120px;' id='" + pName + "'></div><div style='clear:both;'></div>";
    return el;
  },
  getTopTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.innerHTML = "<div class='tabs' style='margin-left: 10px;'></div><div style='clear:both;'></div><div class='content' id='" + pName + "'></div>";
    return el;
  },
  applyStyles: function(el,styles) {
    for(var i in styles) {
      if(!styles.hasOwnProperty(i)) continue;
      el.style[i] = styles[i];
    }
  },
  closest: function(elem, selector) {
    while (elem && elem !== document) {
      if (elem[matchKey]) {
        if (elem[matchKey](selector)) {
          return elem;
        } else {
          elem = elem.parentNode;
        }
      }
      else {
        return false;
      }
    }
    return false;
  },
  insertBasicTopTab: function(tab, newTabs_holder ) {
    newTabs_holder.firstChild.insertBefore(tab,newTabs_holder.firstChild.firstChild);
  },
  getTab: function(span, tabId) {
    var el = document.createElement('div');
    el.appendChild(span);
    el.id = tabId;
    el.style = el.style || {};
    this.applyStyles(el,{
      border: '1px solid #ccc',
      borderWidth: '1px 0 1px 1px',
      textAlign: 'center',
      lineHeight: '30px',
      borderRadius: '5px',
      borderBottomRightRadius: 0,
      borderTopRightRadius: 0,
      fontWeight: 'bold',
      cursor: 'pointer'
    });
    return el;
  },
  getTopTab: function(span, tabId) {
    var el = document.createElement('div');
    el.id = tabId;
    el.appendChild(span);
    el.style = el.style || {};
    this.applyStyles(el,{
      float: 'left',
      border: '1px solid #ccc',
      borderWidth: '1px 1px 0px 1px',
      textAlign: 'center',
      lineHeight: '30px',
      borderRadius: '5px',
      paddingLeft:'5px',
      paddingRight:'5px',
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
      fontWeight: 'bold',
      cursor: 'pointer'
    });
    return el;
  },
  getTabContentHolder: function(tab_holder) {
    return tab_holder.children[1];
  },
  getTopTabContentHolder: function(tab_holder) {
    return tab_holder.children[1];
  },
  getTabContent: function() {
    return this.getIndentedPanel();
  },
  getTopTabContent: function() {
    return this.getTopIndentedPanel();
  },
  markTabActive: function(row) {
    this.applyStyles(row.tab,{
      opacity: 1,
      background: 'white'
    });
    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.style.display = '';
    }
    else {
      row.container.style.display = '';
    }
  },
  markTabInactive: function(row) {
    this.applyStyles(row.tab,{
      opacity:0.5,
      background: ''
    });
    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.style.display = 'none';
    }
    else {
      row.container.style.display = 'none';
    }
  },
  addTab: function(holder, tab) {
    holder.children[0].appendChild(tab);
  },
  addTopTab: function(holder, tab) {
    holder.children[0].appendChild(tab);
  },
  getBlockLink: function() {
    var link = document.createElement('a');
    link.style.display = 'block';
    return link;
  },
  getBlockLinkHolder: function() {
    var el = document.createElement('div');
    return el;
  },
  getLinksHolder: function() {
    var el = document.createElement('div');
    return el;
  },
  createMediaLink: function(holder,link,media) {
    holder.appendChild(link);
    media.style.width='100%';
    holder.appendChild(media);
  },
  createImageLink: function(holder,link,image) {
    holder.appendChild(link);
    link.appendChild(image);
  },
  getFirstTab: function(holder){
    return holder.firstChild.firstChild;
  },
  getInputGroup: function(input, buttons) {
    return undefined;
  },
  cleanText: function(txt) {
    // Clean out HTML tags from txt
    var tmp = document.createElement('div');
    tmp.innerHTML = txt;
    return (tmp.textContent || tmp.innerText);
  }
});

JSONEditor.defaults.themes.bootstrap2 = JSONEditor.AbstractTheme.extend({
  /* Theme config options that allows changing various aspects of the output */
  options: {
    'disable_theme_rules': false
  },
  /* Custom stylesheet rules. format: "selector" : "CSS rules" */
  rules: {
  'div[data-schemaid="root"]:after': 'position:relative;color:red;margin:10px 0;font-weight:600;display:block;width:100%;text-align:center;content:"This is an old JSON-Editor 1.x Theme and might not display elements correctly when used with the 2.x version"'
  },
  getRangeInput: function(min, max, step) {
    // TODO: use bootstrap slider
    return this._super(min, max, step);
  },
  getGridContainer: function() {
    var el = document.createElement('div');
    el.classList.add('container-fluid');
    return el;
  },
  getGridRow: function() {
    var el = document.createElement('div');
    el.classList.add('row-fluid');
    return el;
  },
  getFormInputLabel: function(text, req) {
    var el = this._super(text, req);
    el.style.display = 'inline-block';
    el.style.fontWeight = 'bold';
    return el;
  },
  setGridColumnSize: function(el,size) {
    el.classList.add('span'+size);
  },
  getSelectInput: function(options, multiple) {
    var input = this._super(options);
    input.style.width = 'auto';
    input.style.maxWidth = '98%';
    return input;
  },
  getFormInputField: function(type) {
    var el = this._super(type);
    el.style.width = '98%';
    return el;
  },
  afterInputReady: function(input) {
    if(input.controlgroup) return;
    input.controlgroup = this.closest(input,'.control-group');
    input.controls = this.closest(input,'.controls');
    if(this.closest(input,'.compact')) {
      input.controlgroup.className = input.controlgroup.className.replace(/control-group/g,'').replace(/[ ]{2,}/g,' ');
      input.controls.className = input.controlgroup.className.replace(/controls/g,'').replace(/[ ]{2,}/g,' ');
      input.style.marginBottom = 0;
    }
    if (this.queuedInputErrorText) {
        var text = this.queuedInputErrorText;
        delete this.queuedInputErrorText;
        this.addInputError(input,text);
    }

    // TODO: use bootstrap slider
  },
  getIndentedPanel: function() {
    var el = document.createElement('div');
    el.classList.add('well','well-small');
    el.style.paddingBottom = 0;
    return el;
  },
  getInfoButton: function(text) {
    var icon = document.createElement('span');
    icon.classList.add('icon-info-sign', 'pull-right');
    icon.style.padding = ".25rem";
    icon.style.position = "relative";
    icon.style.display = "inline-block";

    var tooltip = document.createElement('span');
    tooltip.style["font-family"] = "sans-serif";
    tooltip.style.visibility = "hidden";
    tooltip.style["background-color"] = "rgba(50, 50, 50, .75)";
    tooltip.style.margin = "0 .25rem";
    tooltip.style.color = "#FAFAFA";
    tooltip.style.padding = ".5rem 1rem";
    tooltip.style["border-radius"] = ".25rem";
    tooltip.style.width = "25rem";
    tooltip.style.transform = "translateX(-27rem) translateY(-.5rem)";
    tooltip.style.position = "absolute";
    tooltip.innerText = text;
    icon.onmouseover = function() {
      tooltip.style.visibility = "visible";
    };
    icon.onmouseleave = function() {
      tooltip.style.visibility = "hidden";
    };

    icon.appendChild(tooltip);

    return icon;
  },
  getFormInputDescription: function(text) {
    var el = document.createElement('p');
    el.classList.add('help-inline');
    if (window.DOMPurify) el.innerHTML = window.DOMPurify.sanitize(text);
    else el.textContent = this.cleanText(text);
    return el;
  },
  getFormControl: function(label, input, description, infoText) {
    var ret = document.createElement('div');

    var controls = document.createElement('div');

    if(label && (input.getAttribute('type') === 'checkbox' || input.getAttribute('type') === 'radio')) {
      ret.appendChild(controls);
      controls.classList.add('form-check');
      label.classList.add('form-check-label');
      input.classList.add('form-check-input');
      input.style.margin = '0 4px 4px 0';
      input.style.width = 'auto';
      controls.appendChild(input);
      controls.appendChild(label);
      if(infoText) controls.appendChild(infoText);
      controls.style.height = '30px';
    }
    else {
    ret.classList.add('control-group');
      if(label) {
        label.classList.add('control-label');
        ret.appendChild(label);
      }
      if(infoText) controls.appendChild(infoText);
      controls.appendChild(input);
      ret.appendChild(controls);
    }

    if(description) controls.appendChild(description);

    return ret;
  },
  getHeaderButtonHolder: function() {
    var el = this.getButtonHolder();
    el.style.marginLeft = '10px';
    return el;
  },
  getButtonHolder: function() {
    var el = document.createElement('div');
    el.classList.add('btn-group');
    return el;
  },
  getButton: function(text, icon, title) {
    var el =  this._super(text, icon, title);
    el.classList.add('btn', 'btn-default');
    return el;
  },
  getTable: function() {
    var el = document.createElement('table');
    el.classList.add('table', 'table-bordered');
    el.style.width = 'auto';
    el.style.maxWidth = 'none';
    return el;
  },
  addInputError: function(input,text) {
    if(!input.controlgroup) {
        this.queuedInputErrorText = text;
        return;
    }
    if(!input.controlgroup || !input.controls) return;
    input.controlgroup.classList.add('error');
    if(!input.errmsg) {
      input.errmsg = document.createElement('p');
      input.errmsg.classList.add('help-block', 'errormsg');
      input.controls.appendChild(input.errmsg);
    }
    else {
      input.errmsg.style.display = '';
    }

    input.errmsg.textContent = text;
  },
  removeInputError: function(input) {
    if(!input.controlgroup) {
        delete this.queuedInputErrorText;
    }
    if(!input.errmsg) return;
    input.errmsg.style.display = 'none';
    input.controlgroup.classList.remove('error');
  },
  getTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.classList.add('tabbable', 'tabs-left');
    el.innerHTML = "<ul class='nav nav-tabs'  id='" + pName + "'></ul><div class='tab-content well well-small' id='" + pName + "'></div>";
    return el;
  },
  getTopTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.classList.add('tabbable', 'tabs-over');
    el.innerHTML = "<ul class='nav nav-tabs' id='" + pName + "'></ul><div class='tab-content well well-small'  id='" + pName + "'></div>";
    return el;
  },
  getTab: function(text,tabId) {
    var el = document.createElement('li');
    el.classList.add('nav-item');
    var a = document.createElement('a');
    a.setAttribute('href','#' + tabId);
    a.appendChild(text);
    el.appendChild(a);
    return el;
  },
  getTopTab: function(text,tabId) {
    var el = document.createElement('li');
    el.classList.add('nav-item');
    var a = document.createElement('a');
    a.setAttribute('href','#' + tabId);
    a.appendChild(text);
    el.appendChild(a);
    return el;
  },
  getTabContentHolder: function(tab_holder) {
    return tab_holder.children[1];
  },
  getTopTabContentHolder: function(tab_holder) {
    return tab_holder.children[1];
  },
  getTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('tab-pane');
    return el;
  },
  getTopTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('tab-pane');
    return el;
  },
  markTabActive: function(row) {
    row.tab.classList.add('active');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.classList.add('active');
    }
    else {
      row.container.classList.add('active');
    }
  },
  markTabInactive: function(row) {
    row.tab.classList.remove('active');
    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.classList.remove('active');
    }
    else {
      row.container.classList.remove('active');
    }
  },
  addTab: function(holder, tab) {
    holder.children[0].appendChild(tab);
  },
  addTopTab: function(holder, tab) {
    holder.children[0].appendChild(tab);
  },
  getProgressBar: function() {
    var container = document.createElement('div');
    container.classList.add('progress');

    var bar = document.createElement('div');
    bar.classList.add('bar');
    bar.style.width = '0%';
    container.appendChild(bar);

    return container;
  },
  updateProgressBar: function(progressBar, progress) {
    if (!progressBar) return;

    progressBar.firstChild.style.width = progress + "%";
  },
  updateProgressBarUnknown: function(progressBar) {
    if (!progressBar) return;

    progressBar.classList.add('progress', 'progress-striped', 'active');
    progressBar.firstChild.style.width = '100%';
  },
  getInputGroup: function(input, buttons) {
    if (!input) return;

    var inputGroupContainer = document.createElement('div');
    inputGroupContainer.classList.add('input-append');
    inputGroupContainer.appendChild(input);

    for(var i=0;i<buttons.length;i++) {
      buttons[i].classList.add('btn');
      inputGroupContainer.appendChild(buttons[i]);
    }

    return inputGroupContainer;
  }
});

JSONEditor.defaults.themes.bootstrap3 = JSONEditor.AbstractTheme.extend({
  /* Theme config options that allows changing various aspects of the output */
  options: {
    'disable_theme_rules': false
  },
  /* Custom stylesheet rules. format: "selector" : "CSS rules" */
  rules: {
  'div[data-schemaid="root"]:after': 'position:relative;color:red;margin:10px 0;font-weight:600;display:block;width:100%;text-align:center;content:"This is an old JSON-Editor 1.x Theme and might not display elements correctly when used with the 2.x version"'
  },
  getSelectInput: function(options, multiple) {
    var el = this._super(options);
    el.classList.add('form-control');
    //el.style.width = 'auto';
    return el;
  },
  setGridColumnSize: function(el,size, offset) {
    el.classList.add('col-md-'+size);
    if (offset) {
      el.classList.add('col-md-offset-'+offset);
    }
  },
  afterInputReady: function(input) {
    if(input.controlgroup) return;
    input.controlgroup = this.closest(input,'.form-group');
    if(this.closest(input,'.compact')) {
      input.controlgroup.style.marginBottom = 0;
    }
    if (this.queuedInputErrorText) {
        var text = this.queuedInputErrorText;
        delete this.queuedInputErrorText;
        this.addInputError(input,text);
    }

    // TODO: use bootstrap slider
  },
  getTextareaInput: function() {
    var el = document.createElement('textarea');
    el.classList.add('form-control');
    return el;
  },
  getRangeInput: function(min, max, step) {
    // TODO: use better slider
    return this._super(min, max, step);
  },
  getFormInputField: function(type) {
    var el = this._super(type);
    if (type !== "checkbox" && type !== "radio") {
      el.classList.add("form-control");
    }
    return el;
  },
  getFormControl: function(label, input, description) {
    var group = document.createElement("div");

    if (label && (input.type === "checkbox" || input.type === "radio")) {
      group.classList.add(input.type);
      label.insertBefore(input, label.firstChild);
      group.appendChild(label);
    }
    else {
      group.classList.add("form-group");
      if (label) {
        label.classList.add("control-label");
        group.appendChild(label);
      }
      group.appendChild(input);
    }

    if (description) group.appendChild(description);

    return group;
  },
  getIndentedPanel: function() {
    var el = document.createElement('div');
    el.classList.add('well', 'well-sm');
    el.style.paddingBottom = 0;
    return el;
  },
  getInfoButton: function(text) {
    var icon = document.createElement('span');
    icon.classList.add('glyphicon', 'glyphicon-info-sign', 'pull-right');
    icon.style.padding = ".25rem";
    icon.style.position = "relative";
    icon.style.display = "inline-block";

    var tooltip = document.createElement('span');
    tooltip.style["font-family"] = "sans-serif";
    tooltip.style.visibility = "hidden";
    tooltip.style["background-color"] = "rgba(50, 50, 50, .75)";
    tooltip.style.margin = "0 .25rem";
    tooltip.style.color = "#FAFAFA";
    tooltip.style.padding = ".5rem 1rem";
    tooltip.style["border-radius"] = ".25rem";
    tooltip.style.width = "25rem";
    tooltip.style.transform = "translateX(-27rem) translateY(-.5rem)";
    tooltip.style.position = "absolute";
    tooltip.innerText = text;
    icon.onmouseover = function() {
      tooltip.style.visibility = "visible";
    };
    icon.onmouseleave = function() {
      tooltip.style.visibility = "hidden";
    };

    icon.appendChild(tooltip);

    return icon;
  },
  getFormInputDescription: function(text) {
    var el = document.createElement('p');
    el.classList.add('help-block');
    if (window.DOMPurify) el.innerHTML = window.DOMPurify.sanitize(text);
    else el.textContent = this.cleanText(text);
    return el;
  },
  getHeaderButtonHolder: function() {
    var el = this.getButtonHolder();
    el.style.marginLeft = '10px';
    return el;
  },
  getButtonHolder: function() {
    var el = document.createElement('div');
    el.classList.add('btn-group');
    return el;
  },
  getButton: function(text, icon, title) {
    var el = this._super(text, icon, title);
    el.classList.add('btn', 'btn-default');
    return el;
  },
  getTable: function() {
    var el = document.createElement('table');
    el.classList.add('table', 'table-bordered');
    el.style.width = 'auto';
    el.style.maxWidth = 'none';
    return el;
  },

  addInputError: function(input,text) {
    if(!input.controlgroup) {
        this.queuedInputErrorText = text;
        return;
    }
    input.controlgroup.classList.add('has-error');
    if(!input.errmsg) {
      input.errmsg = document.createElement('p');
      input.errmsg.classList.add('help-block', 'errormsg');
      input.controlgroup.appendChild(input.errmsg);
    }
    else {
      input.errmsg.style.display = '';
    }

    input.errmsg.textContent = text;
  },
  removeInputError: function(input) {
    if(!input.controlgroup) {
        delete this.queuedInputErrorText;
    }
    if(!input.errmsg) return;
    input.errmsg.style.display = 'none';
    input.controlgroup.classList.remove('has-error');
  },
  getTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.innerHTML = "<ul class='col-md-2 nav nav-pills nav-stacked' id='" + pName + "' role='tablist'></ul>" +
      "<div class='col-md-10 tab-content well well-small'  id='" + pName + "'></div>";
    return el;
  },
  getTopTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.innerHTML = "<ul class='nav nav-tabs' id='" + pName + "' role='tablist'></ul>" +
      "<div class='tab-content well well-small'  id='" + pName + "'></div>";
    return el;
  },
  getTab: function(text, tabId) {
    var li = document.createElement('li');
    li.setAttribute('role', 'presentation');
    var a = document.createElement('a');
    a.setAttribute('href','#'+tabId);
    a.appendChild(text);
    a.setAttribute('aria-controls', tabId);
    a.setAttribute('role', 'tab');
    a.setAttribute('data-toggle', 'tab');
    li.appendChild(a);
    return li;
  },
  getTopTab: function(text, tabId) {
    var li = document.createElement('li');
    li.setAttribute('role', 'presentation');
    var a = document.createElement('a');
    a.setAttribute('href','#'+tabId);
    a.appendChild(text);
    a.setAttribute('aria-controls', tabId);
    a.setAttribute('role', 'tab');
    a.setAttribute('data-toggle', 'tab');
    li.appendChild(a);
    return li;
  },
  getTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('tab-pane');
    el.setAttribute('role', 'tabpanel');
    return el;
  },
  getTopTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('tab-pane');
    el.setAttribute('role', 'tabpanel');
    return el;
  },
  markTabActive: function(row) {
    row.tab.classList.add('active');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.classList.add('active');
    }
    else {
      row.container.classList.add('active');
    }
  },
  markTabInactive: function(row) {
    row.tab.classList.remove('active');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.classList.remove('active');
    }
    else {
      row.container.classList.remove('active');
    }
  },
  getProgressBar: function() {
    var min = 0, max = 100, start = 0;

    var container = document.createElement('div');
    container.classList.add('progress');

    var bar = document.createElement('div');
    bar.classList.add('progress-bar');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuenow', start);
    bar.setAttribute('aria-valuemin', min);
    bar.setAttribute('aria-valuenax', max);
    bar.innerHTML = start + "%";
    container.appendChild(bar);

    return container;
  },
  updateProgressBar: function(progressBar, progress) {
    if (!progressBar) return;

    var bar = progressBar.firstChild;
    var percentage = progress + "%";
    bar.setAttribute('aria-valuenow', progress);
    bar.style.width = percentage;
    bar.innerHTML = percentage;
  },
  updateProgressBarUnknown: function(progressBar) {
    if (!progressBar) return;

    var bar = progressBar.firstChild;
    progressBar.classList.add('progress', 'progress-striped', 'active');
    bar.removeAttribute('aria-valuenow');
    bar.style.width = '100%';
    bar.innerHTML = '';
  },
  getInputGroup: function(input, buttons) {
    if (!input) return;

    var inputGroupContainer = document.createElement('div');
    inputGroupContainer.classList.add('input-group');
    inputGroupContainer.appendChild(input);

    var inputGroup = document.createElement('div');
    inputGroup.classList.add('input-group-btn');
    inputGroupContainer.appendChild(inputGroup);

    for(var i=0;i<buttons.length;i++) {
      inputGroup.appendChild(buttons[i]);
    }

    return inputGroupContainer;
  }
});

JSONEditor.defaults.themes.bootstrap4 = JSONEditor.AbstractTheme.extend({
  /* Theme config options that allows changing various aspects of the output */
  options: {
    'disable_theme_rules': false
  },
  /* Custom stylesheet rules. format: "selector" : "CSS rules" */
  rules: {
  'div[data-schemaid="root"]:after': 'position:relative;color:red;margin:10px 0;font-weight:600;display:block;width:100%;text-align:center;content:"This is an old JSON-Editor 1.x Theme and might not display elements correctly when used with the 2.x version"'
  },
  getSelectInput: function(options, multiple) {
    var el = this._super(options);
    el.classList.add("form-control");
    //el.style.width = 'auto';
    return el;
  },
  setGridColumnSize: function(el,size, offset) {
    el.classList.add('col-md-'+size);
    if (offset) {
      el.classList.add('offset-md-'+offset);
    }
  },
  afterInputReady: function(input) {
    if (input.controlgroup) return;
    input.controlgroup = this.closest(input, ".form-group");
    if (this.closest(input, ".compact")) {
      input.controlgroup.style.marginBottom = 0;
    }

    // TODO: use bootstrap slider
  },
  getTextareaInput: function() {
    var el = document.createElement("textarea");
    el.classList.add("form-control");
    return el;
  },
  getRangeInput: function(min, max, step) {
    // TODO: use better slider
    return this._super(min, max, step);
  },
  getFormInputField: function(type) {
    var el = this._super(type);
    if (type !== "checkbox" && type !== "radio") {
      el.classList.add("form-control");
    }
    return el;
  },
  getFormControl: function(label, input, description) {
    var group = document.createElement("div");

    if (label && (input.type === "checkbox" || input.type === "radio")) {
      group.classList.add("form-check");
      label.classList.add("form-check-label");
      input.classList.add("form-check-input");
      //label.appendChild(input);
      label.insertBefore(input, label.firstChild);
      group.appendChild(label);
    }
    else {
      group.classList.add("form-group");
      if (label) {
        label.classList.add("form-control-label");
        group.appendChild(label);
      }
      group.appendChild(input);
    }

    if (description) group.appendChild(description);

    return group;
  },
  getIndentedPanel: function() {
    var el = document.createElement("div");
    el.classList.add('card', 'card-body', 'bg-light');
    return el;
  },
  getFormInputDescription: function(text) {
    var el = document.createElement("p");
    el.classList.add('form-text');
    if (window.DOMPurify) el.innerHTML = window.DOMPurify.sanitize(text);
    else el.textContent = this.cleanText(text);
    return el;
  },
  getHeaderButtonHolder: function() {
    var el = this.getButtonHolder();
    el.style.marginLeft = "10px";
    return el;
  },
  getButtonHolder: function() {
    var el = document.createElement("div");
    el.classList.add("btn-group");
    return el;
  },
  getButton: function(text, icon, title) {
    var el = this._super(text, icon, title);
    el.classList.add("btn", "btn-secondary");
    return el;
  },
  getTable: function() {
    var el = document.createElement("table");
    el.classList.add("table-bordered", "table-sm");
    el.style.width = "auto";
    el.style.maxWidth = "none";
    return el;
  },

  addInputError: function(input, text) {
    if (!input.controlgroup) return;
    input.controlgroup.classList.add('has-danger');
    input.classList.add('is-invalid');
    if (!input.errmsg) {
      input.errmsg = document.createElement("p");
      input.errmsg.classList.add("form-text", "invalid-feedback");
      input.controlgroup.appendChild(input.errmsg);
    } else {
      input.errmsg.style.display = "";
    }

    input.errmsg.textContent = text;
  },
  removeInputError: function(input) {
    if (!input.errmsg) return;
    input.errmsg.style.display = "none";
    input.classList.remove('is-invalid');
    input.controlgroup.classList.remove('has-danger');
  },
  getTabHolder: function(propertyName) {
    var el = document.createElement("div");
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    el.innerHTML = "<div class='col-md-2' id='" + pName + "'><ul class='nav flex-column nav-pills'></ul></div><div class='tab-content col-md-10' id='" + pName + "'></div>";
    el.classList.add("row");
    return el;
  },
  addTab: function(holder, tab) {
    holder.children[0].children[0].appendChild(tab);
  },
  getTopTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.innerHTML = "<ul class='nav nav-tabs' id='" + pName + "'></ul><div class='card-body tab-content' id='" + pName + "'></div>";
    return el;
  },
  getTab: function(text,tabId) {
    var liel = document.createElement('li');
    liel.classList.add('nav-item');
    var ael = document.createElement("a");
    ael.classList.add("nav-link");
    ael.setAttribute("style",'padding:10px;');
    ael.setAttribute("href", "#" + tabId);
    ael.setAttribute('data-toggle', 'tab');
    ael.appendChild(text);
    liel.appendChild(ael);
    return liel;
  },
  getTopTab: function(text, tabId) {
    var el = document.createElement('li');
    el.classList.add('nav-item');
    var a = document.createElement('a');
    a.classList.add('nav-link');
    a.setAttribute('href','#'+tabId);
    a.setAttribute('data-toggle', 'tab');
    a.appendChild(text);
    el.appendChild(a);
    return el;
  },
  getTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('tab-pane');
    el.setAttribute('role', 'tabpanel');
    return el;
  },
  getTopTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('tab-pane');
    el.setAttribute('role', 'tabpanel');
    return el;
  },
  markTabActive: function(row) {
    row.tab.firstChild.classList.add('active');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.classList.add('active');
    }
    else {
      row.container.classList.add('active');
    }
  },
  markTabInactive: function(row) {
    row.tab.firstChild.classList.remove('active');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.classList.remove('active');
    }
    else {
      row.container.classList.remove('active');
    }
  },
  getProgressBar: function() {
    var min = 0,
      max = 100,
      start = 0;

    var container = document.createElement("div");
    container.classList.add("progress");

    var bar = document.createElement("div");
    bar.classList.add("progress-bar");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuenow", start);
    bar.setAttribute("aria-valuemin", min);
    bar.setAttribute("aria-valuenax", max);
    bar.innerHTML = start + "%";
    container.appendChild(bar);

    return container;
  },
  updateProgressBar: function(progressBar, progress) {
    if (!progressBar) return;

    var bar = progressBar.firstChild;
    var percentage = progress + "%";
    bar.setAttribute("aria-valuenow", progress);
    bar.style.width = percentage;
    bar.innerHTML = percentage;
  },
  updateProgressBarUnknown: function(progressBar) {
    if (!progressBar) return;

    var bar = progressBar.firstChild;
    progressBar.classList.add('progress', 'progress-striped', 'active');
    bar.removeAttribute("aria-valuenow");
    bar.style.width = "100%";
    bar.innerHTML = "";
  },
  getInputGroup: function(input, buttons) {
    if (!input) return;

    var inputGroupContainer = document.createElement('div');
    inputGroupContainer.classList.add('input-group');
    inputGroupContainer.appendChild(input);

    var inputGroup = document.createElement('div');
    inputGroup.classList.add('input-group-prepend');
    inputGroupContainer.appendChild(inputGroup);

    for(var i=0;i<buttons.length;i++) {
      inputGroup.appendChild(buttons[i]);
    }

    return inputGroupContainer;
  }
});

// Base Foundation theme
JSONEditor.defaults.themes.foundation = JSONEditor.AbstractTheme.extend({
  /* Theme config options that allows changing various aspects of the output */
  options: {
    'disable_theme_rules': false
  },
  /* Custom stylesheet rules. format: "selector" : "CSS rules" */
  rules: {
  'div[data-schemaid="root"]:after': 'position:relative;color:red;margin:10px 0;font-weight:600;display:block;width:100%;text-align:center;content:"This is an old JSON-Editor 1.x Theme and might not display elements correctly when used with the 2.x version"'
  },
  getChildEditorHolder: function() {
    var el = document.createElement('div');
    el.style.marginBottom = '15px';
    return el;
  },
  getSelectInput: function(options, multiple) {
    var el = this._super(options);
    el.style.minWidth = 'none';
    el.style.padding = '5px';
    el.style.marginTop = '3px';
    return el;
  },
  getSwitcher: function(options) {
    var el = this._super(options);
    el.style.paddingRight = '8px';
    return el;
  },
  afterInputReady: function(input) {
    if(input.group) return;
    if(this.closest(input,'.compact')) {
      input.style.marginBottom = 0;
    }
    input.group = this.closest(input,'.form-control');
    if (this.queuedInputErrorText) {
        var text = this.queuedInputErrorText;
        delete this.queuedInputErrorText;
        this.addInputError(input,text);
    }
  },
  getFormInputLabel: function(text, req) {
    var el = this._super(text, req);
    el.style.display = 'inline-block';
    return el;
  },
  getFormInputField: function(type) {
    var el = this._super(type);
    el.style.width = '100%';
    el.style.marginBottom = (type==='checkbox' || type==='radio')? '0' : '12px';
    return el;
  },
  getFormInputDescription: function(text) {
    var el = document.createElement('p');
    if (window.DOMPurify) el.innerHTML = window.DOMPurify.sanitize(text);
    else el.textContent = this.cleanText(text);
    el.style.marginTop = '-10px';
    el.style.fontStyle = 'italic';
    return el;
  },
  getIndentedPanel: function() {
    var el = document.createElement('div');
    el.classList.add('panel');
    el.style.paddingBottom = 0;
    return el;
  },
  getHeaderButtonHolder: function() {
    var el = this.getButtonHolder();
    el.style.display = 'inline-block';
    el.style.marginLeft = '10px';
    el.style.verticalAlign = 'middle';
    return el;
  },
  getButtonHolder: function() {
    var el = document.createElement('div');
    el.classList.add('button-group');
    return el;
  },
  getButton: function(text, icon, title) {
    var el = this._super(text, icon, title);
    el.classList.add('small', 'button');
    return el;
  },
  addInputError: function(input,text) {
    if(!input.group) {
        this.queuedInputErrorText = text;
        return;
    }
    input.group.classList.add('error');

    if(!input.errmsg) {
      input.insertAdjacentHTML('afterend','<small class="error"></small>');
      input.errmsg = input.parentNode.getElementsByClassName('error')[0];
    }
    else {
      input.errmsg.style.display = '';
    }

    input.errmsg.textContent = text;
  },
  removeInputError: function(input) {
    if(!input.group) {
        delete this.queuedInputErrorText;
    }
    if(!input.errmsg) return;
    input.group.classList.remove('error');
    input.errmsg.style.display = 'none';
  },
  getProgressBar: function() {
    var progressBar = document.createElement('div');
    progressBar.classList.add('progress');

    var meter = document.createElement('span');
    meter.classList.add('meter');
    meter.style.width = '0%';
    progressBar.appendChild(meter);
    return progressBar;
  },
  updateProgressBar: function(progressBar, progress) {
    if (!progressBar) return;
    progressBar.firstChild.style.width = progress + '%';
  },
  updateProgressBarUnknown: function(progressBar) {
    if (!progressBar) return;
    progressBar.firstChild.style.width = '100%';
  },
  getInputGroup: function(input, buttons) {
    if (!input) return undefined;

    var inputGroupContainer = document.createElement('div');
    inputGroupContainer.classList.add('input-group');
    input.classList.add('input-group-field');
    inputGroupContainer.appendChild(input);

    for(var i=0;i<buttons.length;i++) {
      var inputGroup = document.createElement('div');
      inputGroup.classList.add('input-group-button');
      inputGroup.style.verticalAlign = 'top';
      buttons[i].classList.remove('small');
      inputGroup.appendChild(buttons[i]);
      inputGroupContainer.appendChild(inputGroup);
    }

    return inputGroupContainer;
  }
});

// Foundation 3 Specific Theme
JSONEditor.defaults.themes.foundation3 = JSONEditor.defaults.themes.foundation.extend({
  getHeaderButtonHolder: function() {
    var el = this._super();
    el.style.fontSize = '.6em';
    return el;
  },
  getFormInputLabel: function(text, req) {
    var el = this._super(text, req);
    el.style.fontWeight = 'bold';
    return el;
  },
  getTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.classList.add('row');
    el.innerHTML = '<dl class="tabs vertical two columns" id="' + pName + '"></dl><div class="tabs-content ten columns" id="' + pName + '"></div>';
    return el;
  },
  getTopTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.classList.add('row');
    el.innerHTML = '<dl class="tabs horizontal" style="padding-left: 10px; margin-left: 10px;" id="' + pName + '"></dl><div class="tabs-content twelve columns" style="padding: 10px; margin-left: 10px;" id="' + pName + '"></div>';
    return el;
  },
  setGridColumnSize: function(el,size, offset) {
    var sizes = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
    el.classList.add('columns', sizes[size]);
    if (offset && offset < 11) {
      el.classList.add('offset-by-' + sizes[offset]);
    }
  },
  getTab: function(text, tabId) {
    var el = document.createElement('dd');
    var a = document.createElement('a');
    a.setAttribute('href','#'+tabId);
    a.appendChild(text);
    el.appendChild(a);
    return el;
  },
  getTopTab: function(text, tabId) {
    var el = document.createElement('dd');
    var a = document.createElement('a');
    a.setAttribute('href','#'+tabId);
    a.appendChild(text);
    el.appendChild(a);
    return el;
  },
  getTabContentHolder: function(tab_holder) {
    return tab_holder.children[1];
  },
  getTopTabContentHolder: function(tab_holder) {
    return tab_holder.children[1];
  },
  getTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('content', 'active');
    el.style.paddingLeft = '5px';
    return el;
  },
  getTopTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('content', 'active');
    el.style.paddingLeft = '5px';
    return el;
  },
  markTabActive: function(row) {
    row.tab.classList.add('active');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.style.display = '';
    }
    else {
      row.container.style.display = '';
    }
  },
  markTabInactive: function(row) {
    row.tab.classList.remove('active');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.style.display = 'none';
    }
    else {
      row.container.style.display = 'none';
    }
  },
  addTab: function(holder, tab) {
    holder.children[0].appendChild(tab);
  },
  addTopTab: function(holder, tab) {
    holder.children[0].appendChild(tab);
  }
});

// Foundation 4 Specific Theme
JSONEditor.defaults.themes.foundation4 = JSONEditor.defaults.themes.foundation.extend({
  getHeaderButtonHolder: function() {
    var el = this._super();
    el.style.fontSize = '.6em';
    return el;
  },
  setGridColumnSize: function(el, size, offset) {
    el.classList.add('columns', 'large-' + size);
    if (offset) {
      el.classList.add('large-offset-' + offset);
    }

  },
  getFormInputDescription: function(text) {
    var el = this._super(text);
    el.style.fontSize = '.8rem';
    return el;
  },
  getFormInputLabel: function(text, req) {
    var el = this._super(text, req);
    el.style.fontWeight = 'bold';
    return el;
  }
});

// Foundation 5 Specific Theme
JSONEditor.defaults.themes.foundation5 = JSONEditor.defaults.themes.foundation.extend({
  getFormInputDescription: function(text) {
    var el = this._super(text);
    el.style.fontSize = '.8rem';
    return el;
  },
  setGridColumnSize: function(el,size, offset) {
    el.classList.add('columns', 'medium-'+size);
    if (offset) {
      el.classList.add('medium-offset-'+offset);
    }
  },
  getButton: function(text, icon, title) {
    var el = this._super(text,icon,title);
    el.className = el.className.replace(/\s*small/g,'') + ' tiny';
    return el;
  },
  getTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.innerHTML = '<dl class="tabs vertical" id="' + pName + '"></dl><div class="tabs-content vertical" id="' + pName + '"></div>';
    return el;
  },
  getTopTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.classList.add('row');
    el.innerHTML = '<dl class="tabs horizontal" style="padding-left: 10px;" id="' + pName + '"></dl><div class="tabs-content horizontal" style="padding: 10px;" id="' + pName + '"></div>';
    return el;
  },
  getTab: function(text, tabId) {
    var el = document.createElement('dd');
    var a = document.createElement('a');
    a.setAttribute('href','#'+tabId);
    a.appendChild(text);
    el.appendChild(a);
    return el;
  },
  getTopTab: function(text, tabId) {
    var el = document.createElement('dd');
    var a = document.createElement('a');
    a.setAttribute('href','#'+tabId);
    a.appendChild(text);
    el.appendChild(a);
    return el;
  },
  getTabContentHolder: function(tab_holder) {
    return tab_holder.children[1];
  },
  getTopTabContentHolder: function(tab_holder) {
    return tab_holder.children[1];
  },
  getTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('tab-content', 'active');
    el.style.paddingLeft = '5px';
    return el;
  },
  getTopTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('tab-content', 'active');
    el.style.paddingLeft = '5px';
    return el;
  },
  markTabActive: function(row) {
    row.tab.classList.add('active');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.style.display = '';
    }
    else {
      row.container.style.display = '';
    }
  },
  markTabInactive: function(row) {
    row.tab.classList.remove('active');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.style.display = 'none';
    }
    else {
      row.container.style.display = 'none';
    }
  },
  addTab: function(holder, tab) {
    holder.children[0].appendChild(tab);
  },
  addTopTab: function(holder, tab) {
    holder.children[0].appendChild(tab);
  }

});

JSONEditor.defaults.themes.foundation6 = JSONEditor.defaults.themes.foundation5.extend({
  getIndentedPanel: function() {
    var el = document.createElement('div');
    el.classList.add('callout', 'secondary');
    el.style = 'padding-left: 10px; margin-left: 10px;';
    return el;
  },
  getButtonHolder: function() {
    var el = document.createElement('div');
    el.classList.add('button-group', 'tiny');
    el.style.marginBottom = 0;
    return el;
  },
  getFormInputLabel: function(text, req) {
    var el = this._super(text, req);
    el.style.display = 'block';
    return el;
  },
  getFormControl: function(label, input, description, infoText) {
    var el = document.createElement('div');
    el.classList.add('form-control');
    if(label) el.appendChild(label);
    if(input.type === 'checkbox' || input.type === 'radio') {
      input.style.width = 'auto';
      label.insertBefore(input,label.firstChild);
    }
    else if (label) {
      if(infoText) label.appendChild(infoText);
      label.appendChild(input);
    } else {
      if(infoText) el.appendChild(infoText);
      el.appendChild(input);
    }

    if(description) label.appendChild(description);
    return el;
  },
  addInputError: function(input,text) {
    if(!input.group) return;
    input.group.classList.add('error');

    if(!input.errmsg) {
      var errorEl = document.createElement('span');
      errorEl.classList.add('form-error', 'is-visible');
      input.group.getElementsByTagName('label')[0].appendChild(errorEl);

      input.classList.add('is-invalid-input');

      input.errmsg = errorEl;
    }
    else {
      input.errmsg.style.display = '';
      input.className = '';
    }

    input.errmsg.textContent = text;
  },
  removeInputError: function(input) {
    if(!input.errmsg) return;
    input.classList.remove('is-invalid-input');
    if(input.errmsg.parentNode) {
      input.errmsg.parentNode.removeChild(input.errmsg);
    }
  },
  getTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.classList.add('grid-x');
    el.innerHTML = '<div class="medium-2 cell" style="float: left;"><ul class="vertical tabs" data-tabs id="' + pName + '"></ul></div><div class="medium-10 cell" style="float: left;"><div class="tabs-content" data-tabs-content="'+pName+'"></div></div>';
    return el;
  },
  getTopTabHolder: function(propertyName) {
    var pName = (typeof propertyName === 'undefined')? "" : propertyName;
    var el = document.createElement('div');
    el.classList.add('grid-y');
    el.innerHTML = '<div className="cell"><ul class="tabs" data-tabs id="' + pName + '"></ul><div class="tabs-content" data-tabs-content="' + pName + '"></div></div>';
    return el;


  },
  insertBasicTopTab: function(tab, newTabs_holder ) {
    newTabs_holder.firstChild.firstChild.insertBefore(tab,newTabs_holder.firstChild.firstChild.firstChild);
  },
  getTab: function(text, tabId) {
    var el = document.createElement('li');
    el.classList.add('tabs-title');
    var a = document.createElement('a');
    a.setAttribute('href','#'+tabId);
    a.appendChild(text);
    el.appendChild(a);
    return el;
  },
  getTopTab: function(text, tabId) {
    var el = document.createElement('li');
    el.classList.add('tabs-title');
    var a = document.createElement('a');
    a.setAttribute('href','#' + tabId);
    a.appendChild(text);
    el.appendChild(a);
    return el;
  },
  getTabContentHolder: function(tab_holder) {
    return tab_holder.children[1].firstChild;
  },
  getTopTabContentHolder: function(tab_holder) {
    return tab_holder.firstChild.children[1];
  },
  getTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('tabs-panel');
    el.style.paddingLeft = '5px';
    return el;
  },
  getTopTabContent: function() {
    var el = document.createElement('div');
    el.classList.add('tabs-panel');
    el.style.paddingLeft = '5px';
    return el;
  },
  markTabActive: function(row) {
    row.tab.classList.add('is-active');
    row.tab.firstChild.setAttribute('aria-selected', 'true');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.classList.add('is-active');
      row.rowPane.setAttribute('aria-selected', 'true');
    }
    else {
      row.container.classList.add('is-active');
      row.container.setAttribute('aria-selected', 'true');
      }
  },
  markTabInactive: function(row) {
    row.tab.classList.remove('is-active');
    row.tab.firstChild.removeAttribute('aria-selected');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.classList.remove('is-active');
      row.rowPane.removeAttribute('aria-selected');
    }
    else {
      row.container.classList.remove('is-active');
      row.container.removeAttribute('aria-selected');
      }
  },
  addTab: function(holder, tab) {
    holder.children[0].firstChild.appendChild(tab);
  },
  addTopTab: function(holder, tab) {
    holder.firstChild.children[0].appendChild(tab);
  },
  getFirstTab: function(holder){
    return holder.firstChild.firstChild.firstChild;
  }
});

JSONEditor.defaults.themes.html = JSONEditor.AbstractTheme.extend({
  /* Theme config options that allows changing various aspects of the output */
  options: {
    'disable_theme_rules': false
  },
  /* Custom stylesheet rules. format: "selector" : "CSS rules" */
  rules: {
  'div[data-schemaid="root"]:after': 'position:relative;color:red;margin:10px 0;font-weight:600;display:block;width:100%;text-align:center;content:"This is an old JSON-Editor 1.x Theme and might not display elements correctly when used with the 2.x version"'
  },
  getFormInputLabel: function(text, req) {
    var el = this._super(text, req);
    el.style.display = 'block';
    el.style.marginBottom = '3px';
    el.style.fontWeight = 'bold';
    return el;
  },
  getFormInputDescription: function(text) {
    var el = this._super(text);
    el.style.fontSize = '.8em';
    el.style.margin = 0;
    el.style.display = 'inline-block';
    el.style.fontStyle = 'italic';
    return el;
  },
  getIndentedPanel: function() {
    var el = this._super();
    el.style.border = '1px solid #ddd';
    el.style.padding = '5px';
    el.style.margin = '10px';
    el.style.borderRadius = '3px';
    return el;
  },
  getTopIndentedPanel: function() {
    return this.getIndentedPanel();
  },
  getChildEditorHolder: function() {
    var el = this._super();
    el.style.marginBottom = '8px';
    return el;
  },
  getHeaderButtonHolder: function() {
    var el = this.getButtonHolder();
    el.style.display = 'inline-block';
    el.style.marginLeft = '10px';
    el.style.fontSize = '.8em';
    el.style.verticalAlign = 'middle';
    return el;
  },
  getTable: function() {
    var el = this._super();
    el.style.borderBottom = '1px solid #ccc';
    el.style.marginBottom = '5px';
    return el;
  },
  addInputError: function(input, text) {
    input.style.borderColor = 'red';
    
    if(!input.errmsg) {
      var group = this.closest(input,'.form-control');
      input.errmsg = document.createElement('div');
      input.errmsg.setAttribute('class','errmsg');
      input.errmsg.style = input.errmsg.style || {};
      input.errmsg.style.color = 'red';
      group.appendChild(input.errmsg);
    }
    else {
      input.errmsg.style.display = 'block';
    }
    
    input.errmsg.innerHTML = '';
    input.errmsg.appendChild(document.createTextNode(text));
  },
  removeInputError: function(input) {
    input.style.borderColor = '';
    if(input.errmsg) input.errmsg.style.display = 'none';
  },
  getProgressBar: function() {
    var max = 100, start = 0;

    var progressBar = document.createElement('progress');
    progressBar.setAttribute('max', max);
    progressBar.setAttribute('value', start);
    return progressBar;
  },
  updateProgressBar: function(progressBar, progress) {
    if (!progressBar) return;
    progressBar.setAttribute('value', progress);
  },
  updateProgressBarUnknown: function(progressBar) {
    if (!progressBar) return;
    progressBar.removeAttribute('value');
  }
});

JSONEditor.defaults.themes.jqueryui = JSONEditor.AbstractTheme.extend({
  /* Theme config options that allows changing various aspects of the output */
  options: {
    'disable_theme_rules': false
  },
  /* Custom stylesheet rules. format: "selector" : "CSS rules" */
  rules: {
  'div[data-schemaid="root"]:after': 'position:relative;color:red;margin:10px 0;font-weight:600;display:block;width:100%;text-align:center;content:"This is an old JSON-Editor 1.x Theme and might not display elements correctly when used with the 2.x version"'
  },
  getTable: function() {
    var el = this._super();
    el.setAttribute('cellpadding',5);
    el.setAttribute('cellspacing',0);
    return el;
  },
  getTableHeaderCell: function(text) {
    var el = this._super(text);
    el.classList.add('ui-state-active');
    el.style.fontWeight = 'bold';
    return el;
  },
  getTableCell: function() {
    var el = this._super();
    el.classList.add('ui-widget-content');
    return el;
  },
  getHeaderButtonHolder: function() {
    var el = this.getButtonHolder();
    el.style.marginLeft = '10px';
    el.style.fontSize = '.6em';
    el.style.display = 'inline-block';
    return el;
  },
  getFormInputDescription: function(text) {
    var el = this.getDescription(text);
    el.style.marginLeft = '10px';
    el.style.display = 'inline-block';
    return el;
  },
  getFormControl: function(label, input, description, infoText) {
    var el = this._super(label,input,description, infoText);
    if(input.type === 'checkbox') {
      el.style.lineHeight = '25px';

      el.style.padding = '3px 0';
    }
    else {
      el.style.padding = '4px 0 8px 0';
    }
    return el;
  },
  getDescription: function(text) {
    var el = document.createElement('span');
    el.style.fontSize = '.8em';
    el.style.fontStyle = 'italic';
    if (window.DOMPurify) el.innerHTML = window.DOMPurify.sanitize(text);
    else el.textContent = this.cleanText(text);
    return el;
  },
  getButtonHolder: function() {
    var el = document.createElement('div');
    el.classList.add('ui-buttonset');
    el.style.fontSize = '.7em';
    return el;
  },
  getFormInputLabel: function(text, req) {
    var el = document.createElement('label');
    el.style.fontWeight = 'bold';
    el.style.display = 'block';
    el.textContent = text;
    if (req) el.classList.add('required');
    return el;
  },
  getButton: function(text, icon, title) {
    var button = document.createElement("button");
    button.classList.add('ui-button', 'ui-widget', 'ui-state-default', 'ui-corner-all');

    // Icon only
    if(icon && !text) {
      button.classList.add('ui-button-icon-only');
      icon.classList.add('ui-button-icon-primary', 'ui-icon-primary');
      button.appendChild(icon);
    }
    // Icon and Text
    else if(icon) {
      button.classList.add('ui-button-text-icon-primary');
      icon.classList.add('ui-button-icon-primary', 'ui-icon-primary');
      button.appendChild(icon);
    }
    // Text only
    else {
      button.classList.add('ui-button-text-only');
    }

    var el = document.createElement('span');
    el.classList.add('ui-button-text');
    el.textContent = text||title||".";
    button.appendChild(el);

    button.setAttribute('title',title);

    return button;
  },
  setButtonText: function(button,text, icon, title) {
    button.innerHTML = '';
    button.classList.add('ui-button', 'ui-widget', 'ui-state-default', 'ui-corner-all');

    // Icon only
    if(icon && !text) {
      button.classList.add('ui-button-icon-only');
      icon.classList.add('ui-button-icon-primary', 'ui-icon-primary');
      button.appendChild(icon);
    }
    // Icon and Text
    else if(icon) {
      button.classList.add('ui-button-text-icon-primary');
      icon.classList.add('ui-button-icon-primary', 'ui-icon-primary');
      button.appendChild(icon);
    }
    // Text only
    else {
      button.classList.add('ui-button-text-only');
    }

    var el = document.createElement('span');
    el.classList.add('ui-button-text');
    el.textContent = text||title||".";
    button.appendChild(el);

    button.setAttribute('title',title);
  },
  getIndentedPanel: function() {
    var el = document.createElement('div');
    el.classList.add('ui-widget-content', 'ui-corner-all');
    el.style.padding = '1em 1.4em';
    el.style.marginBottom = '20px';
    return el;
  },
  afterInputReady: function(input) {
    if(input.controls) return;
    input.controls = this.closest(input,'.form-control');
    if (this.queuedInputErrorText) {
        var text = this.queuedInputErrorText;
        delete this.queuedInputErrorText;
        this.addInputError(input,text);
    }
  },
  addInputError: function(input,text) {
    if(!input.controls) {
        this.queuedInputErrorText = text;
        return;
    }
    if(!input.errmsg) {
      input.errmsg = document.createElement('div');
      input.errmsg.classList.add('ui-state-error');
      input.controls.appendChild(input.errmsg);
    }
    else {
      input.errmsg.style.display = '';
    }

    input.errmsg.textContent = text;
  },
  removeInputError: function(input) {
    if(!input.controls) {
        delete this.queuedInputErrorText;
    }
    if(!input.errmsg) return;
    input.errmsg.style.display = 'none';
  },
  markTabActive: function(row) {
    row.tab.classList.remove('ui-widget-header');
    row.tab.classList.add('ui-state-active');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.style.display = '';
    }
    else {
      row.container.style.display = '';
    }
  },
  markTabInactive: function(row) {
    row.tab.classList.add('ui-widget-header');
    row.tab.classList.remove('ui-state-active');

    if(typeof row.rowPane !== 'undefined'){
      row.rowPane.style.display = 'none';
    }
    else {
      row.container.style.display = 'none';
    }
  }
});

JSONEditor.defaults.themes.barebones = JSONEditor.AbstractTheme.extend({
  /* Theme config options that allows changing various aspects of the output */
  options: {
    'disable_theme_rules': false
  },
  /* Custom stylesheet rules. format: "selector" : "CSS rules" */
  rules: {
  'div[data-schemaid="root"]:after': 'position:relative;color:red;margin:10px 0;font-weight:600;display:block;width:100%;text-align:center;content:"This is an old JSON-Editor 1.x Theme and might not display elements correctly when used with the 2.x version"'
  },
    getFormInputLabel: function (text, req) {
        var el = this._super(text, req);
        return el;
    },
    getFormInputDescription: function (text) {
        var el = this._super(text);
        return el;
    },
    getIndentedPanel: function () {
        var el = this._super();
        return el;
    },
    getChildEditorHolder: function () {
        var el = this._super();
        return el;
    },
    getHeaderButtonHolder: function () {
        var el = this.getButtonHolder();
        return el;
    },
    getTable: function () {
        var el = this._super();
        return el;
    },
    addInputError: function (input, text) {
        if (!input.errmsg) {
            var group = this.closest(input, '.form-control');
            input.errmsg = document.createElement('div');
            input.errmsg.setAttribute('class', 'errmsg');
            group.appendChild(input.errmsg);
        }
        else {
            input.errmsg.style.display = 'block';
        }

        input.errmsg.innerHTML = '';
        input.errmsg.appendChild(document.createTextNode(text));
    },
    removeInputError: function (input) {
        input.style.borderColor = '';
        if (input.errmsg) input.errmsg.style.display = 'none';
    },
    getProgressBar: function () {
        var max = 100, start = 0;

        var progressBar = document.createElement('progress');
        progressBar.setAttribute('max', max);
        progressBar.setAttribute('value', start);
        return progressBar;
    },
    updateProgressBar: function (progressBar, progress) {
        if (!progressBar) return;
        progressBar.setAttribute('value', progress);
    },
    updateProgressBarUnknown: function (progressBar) {
        if (!progressBar) return;
        progressBar.removeAttribute('value');
    }
});

JSONEditor.defaults.themes.materialize = JSONEditor.AbstractTheme.extend(
  {
  /* Theme config options that allows changing various aspects of the output */
  options: {
    'disable_theme_rules': false
  },
  /* Custom stylesheet rules. format: "selector" : "CSS rules" */
  rules: {
  'div[data-schemaid="root"]:after': 'position:relative;color:red;margin:10px 0;font-weight:600;display:block;width:100%;text-align:center;content:"This is an old JSON-Editor 1.x Theme and might not display elements correctly when used with the 2.x version"'
  },
    /**
   * Applies grid size to specified element.
   *
   * @param {HTMLElement} el The DOM element to have specified size applied.
   * @param {int} size The grid column size.
   * @see http://materializecss.com/grid.html
   */
  setGridColumnSize: function(el, size) {
      el.classList.add('col');
      el.classList.add('s' + size);
    },

    /**
   * Gets a wrapped button element for a header.
   *
   * @returns {HTMLElement} The wrapped button element.
   */
  getHeaderButtonHolder: function() {
      return this.getButtonHolder();
    },

    /**
   * Gets a wrapped button element.
   *
   * @returns {HTMLElement} The wrapped button element.
   */
  getButtonHolder: function() {
      return document.createElement('span');
    },

    /**
   * Gets a single button element.
   *
   * @param {string} text The button text.
   * @param {HTMLElement} icon The icon object.
   * @param {string} title The button title.
   * @returns {HTMLElement} The button object.
   * @see http://materializecss.com/buttons.html
   */
  getButton: function(text, icon, title) {

      // Prepare icon.
      if (text) {
        icon.classList.add('left');
        icon.style.marginRight = '5px';
      }

      // Create and return button.
      var el = this._super(text, icon, title);
      el.classList.add('waves-effect', 'waves-light', 'btn');
      el.style.fontSize = '0.75rem';
      el.style.height = '24px';
      el.style.lineHeight = '24px';
      el.style.marginLeft = '5px';
      el.style.padding = '0 0.5rem';
      return el;

    },

    /**
   * Gets a form control object consisiting of several sub objects.
   *
   * @param {HTMLElement} label The label element.
   * @param {HTMLElement} input The input element.
   * @param {string} description The element description.
   * @param {string} infoText The element information text.
   * @returns {HTMLElement} The assembled DOM element.
   * @see http://materializecss.com/forms.html
   */
  getFormControl: function(label, input, description, infoText) {

      var ctrl,
      type = input.type;

      // Checkboxes get wrapped in p elements.
      if (type && (type === 'checkbox' || type === 'radio')) {

        ctrl = document.createElement('p');
        if (label) {
          var span = document.createElement('span');
          span.innerHTML = label.innerHTML;
          label.innerHTML = '';
          label.setAttribute('for', input.id);
          ctrl.appendChild(label);
          label.appendChild(input);
          label.appendChild(span);
        }
        else {
          ctrl.appendChild(input);
        }

        return ctrl;

      }

      // Anything else gets wrapped in divs.
      ctrl = this._super(label, input, description, infoText);

      // Not .input-field for select wrappers.
      if (!type || !type.startsWith('select'))
        ctrl.classList.add('input-field');

      // Color needs special attention.
      if (type && type === 'color') {
        input.style.height = '3rem';
        input.style.width = '100%';
        input.style.margin = '5px 0 20px 0';
        input.style.padding = '3px';

        if (label) {
          label.style.transform = 'translateY(-14px) scale(0.8)';
          label.style['-webkit-transform'] = 'translateY(-14px) scale(0.8)';
          label.style['-webkit-transform-origin'] = '0 0';
          label.style['transform-origin'] = '0 0';
        }
      }

      return ctrl;

    },

  getDescription: function(text) {
      var el = document.createElement('div');
      el.classList.add('grey-text');
      el.style.marginTop = '-15px';
      if (window.DOMPurify) el.innerHTML = window.DOMPurify.sanitize(text);
      else el.textContent = this.cleanText(text);
      return el;
    },

    /**
   * Gets a header element.
   *
   * @param {string|HTMLElement} text The header text or element.
   * @returns {HTMLElement} The header element.
   */
  getHeader: function(text) {

      var el = document.createElement('h5');

      if (typeof text === 'string') {
        el.textContent = text;
      } else {
        el.appendChild(text);
      }

      return el;

    },

  getChildEditorHolder: function() {

      var el = document.createElement('div');
      el.marginBottom = '10px';
      return el;

    },

  getIndentedPanel: function() {
      var el = document.createElement("div");
      el.classList.add("card-panel");
      return el;
    },

  getTable: function() {

      var el = document.createElement('table');
      el.classList.add('striped', 'bordered');
      el.style.marginBottom = '10px';
      return el;

    },

  getTableRow: function() {
      return document.createElement('tr');
    },

  getTableHead: function() {
      return document.createElement('thead');
    },

  getTableBody: function() {
      return document.createElement('tbody');
    },

  getTableHeaderCell: function(text) {

      var el = document.createElement('th');
      el.textContent = text;
      return el;

    },

  getTableCell: function() {

      var el = document.createElement('td');
      return el;

    },

    /**
   * Gets the tab holder element.
   *
   * @returns {HTMLElement} The tab holder component.
   * @see https://github.com/Dogfalo/materialize/issues/2542#issuecomment-233458602
   */
  getTabHolder: function() {

      var html =[
        '<div class="col s2">',
        '   <ul class="tabs" style="height: auto; margin-top: 0.82rem; -ms-flex-direction: column; -webkit-flex-direction: column; flex-direction: column; display: -webkit-flex; display: flex;">',
        '   </ul>',
        '</div>',
        '<div class="col s10">',
        '<div>'
      ].join("\n");

      var el = document.createElement('div');
      el.classList.add('row', 'card-panel');
      el.innerHTML = html;
      return el;

    },

    /**
   * Add specified tab to specified holder element.
   *
   * @param {HTMLElement} holder The tab holder element.
   * @param {HTMLElement} tab The tab to add.
   */
  addTab: function(holder, tab) {
      holder.children[0].children[0].appendChild(tab);
    },

    /**
   * Gets a single tab element.
   *
   * @param {HTMLElement} span The tab's content.
   * @returns {HTMLElement} The tab element.
   * @see https://github.com/Dogfalo/materialize/issues/2542#issuecomment-233458602
   */
  getTab: function(span) {

      var el = document.createElement('li');
      el.classList.add('tab');
      el.style = el.style || {};
      this.applyStyles(el,
        {
        width: '100%',
        textAlign: 'left',
        lineHeight: '24px',
        height: '24px',
        fontSize: '14px',
        cursor: 'pointer'
        }
      );
      el.appendChild(span);
      return el;
    },

    /**
   * Marks specified tab as active.
   *
   * @returns {HTMLElement} The tab element.
   * @see https://github.com/Dogfalo/materialize/issues/2542#issuecomment-233458602
   */
  markTabActive: function(tab) {

      tab.style = tab.style || {};
      this.applyStyles(tab,
        {
        width: '100%',
        textAlign: 'left',
        lineHeight: '24px',
        height: '24px',
        fontSize: '14px',
        cursor: 'pointer',
        color: 'rgba(238,110,115,1)',
        transition: 'border-color .5s ease',
        borderRight: '3px solid #424242'
        }
      );

    },

    /**
   * Marks specified tab as inactive.
   *
   * @returns {HTMLElement} The tab element.
   * @see https://github.com/Dogfalo/materialize/issues/2542#issuecomment-233458602
   */
  markTabInactive: function(tab) {

      tab.style = tab.style || {};
      this.applyStyles(tab,
        {
        width: '100%',
        textAlign: 'left',
        lineHeight: '24px',
        height: '24px',
        fontSize: '14px',
        cursor: 'pointer',
        color: 'rgba(238,110,115,0.7)'
        }
      );

    },

    /**
   * Returns the element that holds the tab contents.
   *
   * @param {HTMLElement} tabHolder The full tab holder element.
   * @returns {HTMLElement} The content element inside specified tab holder.
   */
  getTabContentHolder: function(tabHolder) {
      return tabHolder.children[1];
    },

    /**
   * Creates and returns a tab content element.
   *
   * @returns {HTMLElement} The new tab content element.
   */
  getTabContent: function() {
      return document.createElement('div');
    },

    /**
   * Adds an error message to the specified input element.
   *
   * @param {HTMLElement} input The input element that caused the error.
   * @param {string} text The error message.
   */
  addInputError: function(input, text) {

      // Get the parent element. Should most likely be a <div class="input-field" ... />.
      var parent = input.parentNode,
      el;

      if (!parent) return;

      // Remove any previous error.
      this.removeInputError(input);

      // Append an error message div.
      el = document.createElement('div');
      el.classList.add('error-text', 'red-text');
      el.textContent = text;
      parent.appendChild(el);

    },

    /**
   * Removes any error message from the specified input element.
   *
   * @param {HTMLElement} input The input element that previously caused the error.
   */
  removeInputError: function(input) {

      // Get the parent element. Should most likely be a <div class="input-field" ... />.
      var parent = input.parentElement,
      els;

      if (!parent) return;

      // Remove all elements having class .error-text.
      els = parent.getElementsByClassName('error-text');
      for (var i = 0; i < els.length; i++)
        parent.removeChild(els[i]);

    },

  addTableRowError: function(row) {
    },

  removeTableRowError: function(row) {
    },

    /**
   * Gets a select DOM element.
   *
   * @param {object} options The option values.
   * @return {HTMLElement} The DOM element.
   * @see http://materializecss.com/forms.html#select
   */
  getSelectInput: function(options, multiple) {

      var select = this._super(options);
      select.classList.add('browser-default');
      return select;

    },

    /**
   * Gets a textarea DOM element.
   *
   * @returns {HTMLElement} The DOM element.
   * @see http://materializecss.com/forms.html#textarea
   */
  getTextareaInput: function() {
      var el = document.createElement('textarea');
      el.style.marginBottom = '5px';
      el.style.fontSize = '1rem';
      el.style.fontFamily = 'monospace';
      return el;
    },

  getCheckbox: function() {

      var el = this.getFormInputField('checkbox');
      el.id = this.createUuid();
      return el;

    },

    /**
   * Gets the modal element for displaying Edit JSON and Properties dialogs.
   *
   * @returns {HTMLElement} The modal DOM element.
   * @see http://materializecss.com/cards.html
   */
  getModal: function() {

      var el = document.createElement('div');
      el.classList.add('card-panel', 'z-depth-3');
      el.style.padding = '5px';
      el.style.position = 'absolute';
      el.style.zIndex = '10';
      el.style.display = 'none';
      return el;

    },

    /**
   * Creates and returns a RFC4122 version 4 compliant unique id.
   *
   * @returns {string} A GUID.
   * @see https://stackoverflow.com/a/2117523
   */
  createUuid: function() {

      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
        {
          var r = Math.random() * 16 | 0, v = c == 'x'? r: (r & 0x3 | 0x8);
          return v.toString(16);
        }
      );

    }

  }
);
// Spectre Theme using Spectre CSS framework. <https://picturepan2.github.io/spectre/index.html>
JSONEditor.defaults.themes.spectre = JSONEditor.AbstractTheme.extend({
  // Config options that allows changing various aspects of the output
  options: {
    disable_theme_rules: false,   // Disable creation of Inline Style Rules
    label_bold: true,             // Element labels bold
    align_bottom: false,          // Align elements to bottom of flex container
    object_indent: false,         // Indent nested object elements
    object_border: false,         // Add border around object elements
    table_border: false,          // Add border to array "table" row and cells
    table_zebrastyle: false,      // Add "zebra style" to array "table" rows
    input_size: 'normal'         // Size of input and select elements. "small", "normal", "large"
  },
  // Custom stylesheet rules. (Does not suppert comma separated selectors)
  //  Will create a stylesheet in document head with the id "theme-spectre" if not exists.
  rules: {
    '.slider:focus': 'box-shadow: none', // Remove slider focus shadow
    'h4>label+.btn-group': 'margin-left:1rem', // Add margin between header and top buttons
    '.json-editor-btntype-properties+div>.property-selector': 'font-size: .7rem;font-weight: normal; max-height:260px!important;width:395px!important', // Fix fontsize in Properties modal and increase size of modal box
    '.json-editor-btntype-properties+div>.property-selector .form-checkbox': 'margin:0', // Remove checkbox margins in Properties modal
    'textarea': 'width:100%;min-height: 2rem;resize:vertical',  // Prevent textarea from being resized horizontally
    'table': 'border-collapse: collapse;', // Remove gap between table element borders
    '.table td': 'padding: .4rem .4rem;', // reduce table padding
    '.mr-5': 'margin-right: 1rem !important;', // margin for checkbox label
    'div[data-schematype]:not([data-schematype="object"])' : 'transition:.5s',  // Hover on input block (Should be removed in final version)
    'div[data-schematype]:not([data-schematype="object"]):hover' : 'background-color: #eee', // Hover on input block (Should be removed in final version)
    '.je-table-border td': 'border: .05rem solid #dadee4 !important', // Option: table_border
    '.btn-info' : 'font-size:.5rem;font-weight:bold;height:.8rem;padding:.15rem 0;line-height:.8;margin:.3rem 0 .3rem .1rem;', // Infobutton
    '.je-label': 'font-weight: 600', // Option: label_bold
    '.btn-action.btn-info': 'width: .8rem;', // Infobutton
    '.je-border': 'border:.05rem solid #dadee4', // Option: object_border
    '.je-panel': 'padding:.2rem;margin:.2rem;background-color: rgba(218,222,228,.1)',
    '.je-panel-top': 'padding:.2rem;margin:.2rem;background-color: rgba(218,222,228,.1)',
    '.required:after': 'content: " *";color: red;font:inherit', // Red * after label if field is required
    '.je-align-bottom': 'margin-top: auto', // option: align_bottom
    '.je-desc': 'font-size: smaller;margin: .2rem 0;', // Description
/*    '.columns': 'border:1px solid rgba(255,0,0,.5);',
    '.columns .columns': 'border:1px solid rgba(0,255,0,.5);',*/
    '.columns .container.je-noindent': 'padding-left:0;padding-right:0;' // Option: object_indent
  },
  // Functions for setting up the grid container, row and columns
  setGridColumnSize: function(el,size, offset) {
    el.classList.add('col-' + size);
    if (offset) el.classList.add('col-mx-auto');
  },
  getGridContainer: function() {
    var el = document.createElement('div');
    el.classList.add('container');
    if (!this.options.object_indent) el.classList.add('je-noindent');
    return el;
  },
  getGridRow: function() {
    var el = document.createElement('div');
    el.classList.add('columns');
    return el;
  },
  getGridColumn: function() {
    var el = document.createElement('div');
    el.classList.add('column');
    if (this.options.align_bottom) el.classList.add('je-align-bottom');
    return el;
  },



  // Used for "type: object" or "type: array" (except if "format: tabs-top")
  getIndentedPanel: function() {
    var el = document.createElement('div');
    el.classList.add('je-panel');
    if (this.options.object_border) el.classList.add('je-border');
    return el;
  },

  // Used for "type: array" with "format: tabs-top"
  getTopIndentedPanel: function() {
    var el = document.createElement('div');
    el.classList.add('je-panel-top');
    if (this.options.object_border) el.classList.add('je-border');
    return el;
  },

  // Button functions
  getHeaderButtonHolder: function() {
    var el = this.getButtonHolder();
    return el;
  },
  // Button holder for the buttons
  getButtonHolder: function() {
    var el = this._super();
    el.classList.add('btn-group');
    return el;
  },
  getFormButtonHolder: function(button_align) {
    var el = this._super();
    el.classList.remove('btn-group');
    if (button_align === 'center') el.classList.add('text-center');
    else if (button_align === 'right') el.classList.add('text-right');
    return el;
  },
  getFormButton: function(text, icon, title) {
    var el = this._super(text, icon, title);
    el.classList.add('btn', 'btn-primary', 'mx-2', 'my-1');
    //el.classList..remove('btn-sm');
    if (this.options.input_size !== 'small') el.classList.remove('btn-sm');
    if (this.options.input_size === 'large') el.classList.add('btn-lg');
    return el;
  },
  getButton: function(text, icon, title) {
    var el = this._super(text, icon, title);
    el.classList.add('btn', 'btn-sm', 'btn-primary', 'mr-2', 'my-1');
    return el;
  },


  getHeader: function(text) {
    var el = document.createElement('h4');
    if(typeof text === "string") {
      el.textContent = text;
    }
    else {
      el.appendChild(text);
    }

    return el;
  },


  getFormInputDescription: function(text) {
    var el = this._super(text);
    el.classList.add('je-desc','hide-sm');
    return el;
  },

  /* Label for all elements except checkbox and radio */
  getFormInputLabel: function(text, req) {
    var el = this._super(text, req);
    if (this.options.label_bold) el.classList.add('je-label');
    return el;
  },

  // Checkbox elements
  // ToDo: Rename function names for consistency
  getCheckbox: function() {
    var el = this.getFormInputField('checkbox');
    return el;
  },
  getCheckboxLabel: function(text, req) {
    var el = this._super(text, req), icon = document.createElement('i');
    icon.classList.add('form-icon');
    el.classList.add('form-checkbox', 'mr-5');
    el.insertBefore(icon, el.firstChild);
    return el;
  },
  getFormCheckboxControl: function(label, input, compact) {
    label.insertBefore(input, label.firstChild); // Move input into label element
    if (compact) label.classList.add('form-inline');
    return label;
  },
  getMultiCheckboxHolder: function(controls,label,description, infoText) {
console.log('mul');
    return this._super(controls,label,description, infoText);
  },
  // Radio elements
  getFormRadio: function(attributes) {
    var el = this.getFormInputField('radio');
    for(var key in attributes){
      el.setAttribute(key, attributes[key]);
    }
    return el;
  },
  getFormRadioLabel: function(text, req) {
    var el = this._super(text, req), icon = document.createElement('i');
    icon.classList.add('form-icon');
    el.classList.add('form-radio');
    el.insertBefore(icon, el.firstChild);
    return el;
  },
  getFormRadioControl: function(label, input, compact) {
    label.insertBefore(input, label.firstChild); // Move input into label element
    if (compact) label.classList.add('form-inline');
    return label;
  },

  // Create input field
  getFormInputField: function(type) {
    var el = this._super(type);
    if (['checkbox', 'radio'].indexOf(type) < 0) {
      el.classList.add('form-input');
    }
    return el;
  },
  // Create input field for type="range"
  getRangeInput: function(min, max, step) {
    var el = this.getFormInputField('range');
    el.classList.add('slider');
    el.classList.remove('form-input');
    el.setAttribute('oninput', 'this.setAttribute("value", this.value)');
    el.setAttribute('min', min);
    el.setAttribute('max', max);
    el.setAttribute('step', step);
    return el;
  },
  getRangeControl: function(input, output) {
    var el = this._super(input, output);
    el.classList.add('text-center');
    return el;
  },


  // Create select box field
  getSelectInput: function(options, multiple) {
    var el = this._super(options);
    el.classList.add('form-select');
    return el;
  },
  // Create textarea field
  getTextareaInput: function() {
    var el = document.createElement('textarea');
    el.classList.add('form-input');
    return el;
  },


  getFormControl: function(label, input, description, infoText) {
    var group = document.createElement('div');
    group.classList.add('form-group');

    if (label) {
      if (input.type === 'checkbox') {
        label = this.getFormCheckboxControl(label, input, false);
      }
      label.classList.add('form-label');
      group.appendChild(label);
      if (infoText) group.insertBefore(infoText, group.firstChild);
    }

    if (this.options.input_size === 'small') input.classList.add('input-sm', 'select-sm');
    else if (this.options.input_size === 'large') input.classList.add('input-lg', 'select-lg');
    if (input.type !== 'checkbox') group.appendChild(input);

    if (description) group.appendChild(description);

    return group;
  },

  // Create input group (input field with buttons)
  getInputGroup: function(input, buttons) {
    if (!input) return;

    var inputGroup = document.createElement('div');
    inputGroup.classList.add('input-group');
    inputGroup.appendChild(input);
    for(var i=0;i<buttons.length;i++) {
      buttons[i].classList.add('input-group-btn');
      inputGroup.appendChild(buttons[i]);
    }

    return inputGroup;
  },

  // Create button for displaying infotext tooltip
  getInfoButton: function(text) {

    var popover = document.createElement('div');
    popover.classList.add('popover', 'popover-left', 'float-right');

    var button = document.createElement('button');
    button.classList.add('btn', 'btn-secondary', 'btn-info', 'btn-action', 's-circle');
    button.setAttribute('tabindex', '-1'); // exclude element from tab order
    popover.appendChild(button);

    var icon = document.createTextNode('I');
    button.appendChild(icon);

    var container = document.createElement('div');
    container.classList.add('popover-container');
    popover.appendChild(container);

    var card = document.createElement('div');
    card.classList.add('card');
    container.appendChild(card);

    var cardbody = document.createElement('div');
    cardbody.classList.add('card-body');
    cardbody.innerHTML = text;
    card.appendChild(cardbody);

    return popover;
  },

  // Functions for rendering array with format: "table"
  getTable: function() {
    var el = this._super();
    el.classList.add('table', 'table-scroll');
    if (this.options.table_border) el.classList.add('je-table-border');
    if (this.options.table_zebrastyle) el.classList.add('table-striped');
    return el;
  },

  // Containers for array with format: "tab"
  getTabHolder: function(propertyName) {
    var pName = typeof propertyName === 'undefined' ? "" : propertyName;
    var el = document.createElement('div');
    el.classList.add('columns');
    el.innerHTML = '<div class="column col-2"></div><div class="column col-10 content" id="' + pName + '"></div>';
    return el;
  },
  // Containers for array with format: "tab-top"
  getTopTabHolder: function(propertyName) {
    var pName = typeof propertyName === 'undefined' ? "" : propertyName;
    var el = document.createElement('div');
    el.innerHTML = '<ul class="tab"></ul><div class="content" id="' + pName + '"></div>';
    return el;
  },
  // Tab button for array with format: "tab"
  getTab: function(span, tabId) {
    var el = document.createElement('a');
    el.classList.add('btn', 'btn-secondary', 'btn-block');
    el.id = tabId;
    el.innerHTML = span.innerHTML;

    return el;
  },
  // Tab button for array with format: "tab-top"
  getTopTab: function(span, tabId) {
    var el = document.createElement('li');
    el.id = tabId;
    el.classList.add('tab-item');

    // Spectre needs an a tag inside the tab item, not a span
    var a = document.createElement('a');
    a.href='#';
    a.innerHTML = span.innerHTML;
    el.appendChild(a);
    return el;
  },
  markTabActive: function(row) {
    row.tab.classList.add('active');
    if (typeof row.rowPane !== 'undefined') row.rowPane.style.display = '';
    else row.container.style.display = '';
  },
  markTabInactive: function(row) {
    row.tab.classList.remove('active');
    if (typeof row.rowPane !== 'undefined') row.rowPane.style.display = 'none';
    else row.container.style.display = 'none';
  },


  // Controls output of errormessages displayed in form
  afterInputReady: function(input) {
    if (input.controlgroup) return;
    input.controlgroup = this.closest(input, '.form-group');
    if (this.closest(input, '.compact')) {
      input.controlgroup.style.marginBottom = 0;
    }
  },
  addInputError: function(input, text) {
    if (!input.controlgroup) return;
    input.controlgroup.classList.add('has-error');
    if (!input.errmsg) {
      input.errmsg = document.createElement('p');
      input.errmsg.classList.add('form-input-hint');
      input.controlgroup.appendChild(input.errmsg);
    }
    input.errmsg.classList.remove('d-hide');
    input.errmsg.textContent = text;
  },
  removeInputError: function(input) {
    if (!input.errmsg) return;
    input.errmsg.classList.add('d-hide');
    input.controlgroup.classList.remove('has-error');
  }

});

JSONEditor.defaults.themes.tailwind = JSONEditor.AbstractTheme.extend({
    getGridRow: function () {
        var el = document.createElement("div");
        el.classList.add("flex", "flex-wrap");
        return el;
    },
    getGridColumn: function () {
        var el = document.createElement("div");
        return el;
    },
    setGridColumnSize: function (el, size, offset) {
        if (size < 12) {
            el.classList.add("w-" + size + "/12", "px-1");
        } else {
            el.classList.add("w-full", "px-1");
        }
        if (offset) {
            el.style.marginLeft = (100 / 12) * offset + "%";
        }
    },
    getTitle: function () {
        return this.schema.title;
    },
    getSelectInput: function (options, multiple) {
        var el = this._super(options);
        el.classList.add(
            "block",
            "w-full",
            "px-1",
            "text-sm",
            "text-black",
            "leading-normal",
            "bg-white",
            "border",
            "border-grey",
            "rounded"
        );
        return el;
    },
    afterInputReady: function (input) {
        if (input.controlgroup) return;
        input.controlgroup = this.closest(input, ".form-group");
        if (this.closest(input, ".compact")) {
            input.controlgroup.style.marginBottom = 0; //
        }

        // TODO: use tailwind slider
    },
    getTextareaInput: function () {
        var el = document.createElement("textarea");
        el.classList.add(
            "block",
            "w-full",
            "py-1",
            "px-1",
            "text-sm",
            "leading-normal",
            "bg-white",
            "text-black",
            "border",
            "border-grey",
            "rounded"
        );
        return el;
    },
    getRangeInput: function (min, max, step) {
        // TODO: use better slider
        return this._super(min, max, step);
    },
    getFormInputField: function (type) {
        var el = this._super(type);
        if (type !== "checkbox" && type !== "radio") {
            el.classList.add(
                "block",
                "w-full",
                "px-1",
                "text-black",
                "text-sm",
                "leading-normal",
                "bg-white",
                "border",
                "border-grey",
                "rounded"
            );
        }
        return el;
    },
    getFormInputDescription: function (text) {
        var el = document.createElement("p");
        el.classList.add("block", "mt-1");
        if (window.DOMPurify) el.innerHTML = window.DOMPurify.sanitize(text);
        else el.textContent = this.cleanText(text);
        return el;
    },
    getFormControl: function (label, input, description) {
        var group = document.createElement("div");

        if (label &&( input.type === "checkbox" || input.type === "radio")) {
            group.classList.add(input.type, "mt-0");
            label.appendChild(input);
            label.classList.add("block", "mt-0", "text-xs");
            group.appendChild(label);
            input.classList.add("relative", "float-left", "mr-1");
        } else {
            group.classList.add("form-group", "mb-2");
            if (label) {
                label.classList.add("block", "text-black", "text-xs", "mb-1");
                group.appendChild(label);
            }
            group.appendChild(input);
        }

        if (description) group.appendChild(description);

        return group;
    },
    getIndentedPanel: function () {
        var el = document.createElement("div");
        el.classList.add(
            "relative",
            "flex",
            "flex-col",
            "min-w-0",
            "rounded",
            "break-words",
            "border",
            "bg-white",
            "border-0",
            "border-blue-400",
            "p-1",
            "shadow-md"
        );
        return el;
    },
    getHeaderButtonHolder: function () {
        var el = this.getButtonHolder();
        el.classList.add("text-sm");
        return el;
    },
    getButtonHolder: function () {
        var el = document.createElement("div");
        el.classList.add("relative", "inline-flex", "align-middle");
        return el;
    },
    getButton: function (text, icon, title) {
        var el = this._super(text, icon, title);
        el.classList.add(
            "inline-block",
            "align-middle",
            "text-center",
            "text-sm",
            "select-none",
            "shadow",
            "border",
            "whitespace-no-wrap",
            "py-1",
            "px-3",
            "m-1",
            "rounded"
        );
        return el;
    },
    getTable: function () {
        var el = document.createElement("table");
        el.classList.add("table", "border", "w-auto", "p-0");
        return el;
    },
    getTableRow: function () {
        return document.createElement("tr");
    },
    getTableHead: function () {
        return document.createElement("thead");
    },
    getTableBody: function () {
        return document.createElement("tbody");
    },
    getTableHeaderCell: function (text) {
        var el = document.createElement("th");
        el.classList.add("text-xs", "border", "w-auto", "p-0");
        el.textContent = text;
        return el;
    },
    getTableCell: function () {
        var el = document.createElement("td");
        el.classList.add("border", "w-auto", "p-0", "m-0");
        return el;
    },
    addInputError: function (input, text) {
        if (!input.controlgroup) return;
        input.controlgroup.classList.add("has-danger");
        input.classList.add("bg-red-600");
        if (!input.errmsg) {
            input.errmsg = document.createElement("p");
            input.errmsg.classList.add("block", "mt-1", "text-xs", "text-red");
            input.controlgroup.appendChild(input.errmsg);
        } else {
            input.errmsg.classList.remove("block");
            input.errmsg.classList.add("hidden");
        }
        input.errmsg.textContent = text;
    },
    removeInputError: function (input) {
        if (!input.errmsg) return;
        input.errmsg.style.display = "hidden";
        input.classList.remove("bg-red-600");
        input.controlgroup.classList.remove("has-danger");
    },
    getTabHolder: function (propertyName) {
        var el = document.createElement("div");
        var pName = typeof propertyName === "undefined" ? "" : propertyName;
        el.innerHTML = "<div class='w-2/12'  id='" + pName + "'><ul class='list-reset pl-0 mb-0'></ul></div><div class='w-10/12' id='" + pName + "'></div>";
        el.classList.add("flex");
        return el;
    },
    addTab: function (holder, tab) {
        holder.children[0].children[0].appendChild(tab);
    },
    getTopTabHolder: function (propertyName) {
        var pName = typeof propertyName === "undefined" ? "" : propertyName;
        var el = document.createElement("div");
        el.innerHTML = "<ul class='nav-tabs flex list-reset pl-0 mb-0 border-b border-grey-light' id='" + pName + "'></ul><div class='p-6 block' id='" + pName + "'></div>";
        return el;
    },
    getTab: function (text, tabId) {
        var liel = document.createElement("li");
        liel.classList.add(
            "nav-item",
            "flex-col",
            "text-center",
            "text-white",
            "bg-blue-500",
            "shadow-md",
            "border",
            "p-2",
            "mb-2",
            "mr-2",
            "hover:bg-blue-400",
            "rounded"
        );
        var ael = document.createElement("a");
        ael.classList.add("nav-link", "text-center");
        ael.setAttribute("href", "#" + tabId);
        ael.setAttribute("data-toggle", "tab");
        ael.appendChild(text);
        liel.appendChild(ael);
        return liel;
    },
    getTopTab: function (text, tabId) {
        var el = document.createElement("li");
        el.classList.add("nav-item", "flex", "border-l", "border-t", "border-r");
        var a = document.createElement("a");
        a.classList.add(
            "nav-link",
            "-mb-px",
            "flex-row",
            "text-center",
            "bg-white",
            "p-2",
            "hover:bg-blue-400",
            "rounded-t"
        );
        a.setAttribute("href", "#" + tabId);
        a.setAttribute("data-toggle", "tab");
        a.appendChild(text);
        el.appendChild(a);
        return el;
    },
    getTabContent: function () {
        var el = document.createElement("div");
        el.setAttribute("role", "tabpanel");
        return el;
    },
    getTopTabContent: function () {
        var el = document.createElement("div");
        el.setAttribute("role", "tabpanel");
        return el;
    },
    markTabActive: function (row) {
        row.tab.firstChild.classList.add("block");
        if (row.tab.firstChild.classList.contains("border-b") == true) {
            row.tab.firstChild.classList.add("border-b-0");
            row.tab.firstChild.classList.remove("border-b");
        } else {
            row.tab.firstChild.classList.add("border-b-0");
        }
        if (row.container.classList.contains("hidden") == true) {
            row.container.classList.remove("hidden");
            row.container.classList.add("block");
        } else {
            row.container.classList.add("block");
        }
    },
    markTabInactive: function (row) {
        if (row.tab.firstChild.classList.contains("border-b-0") == true) {
            row.tab.firstChild.classList.add("border-b");
            row.tab.firstChild.classList.remove("border-b-0");
        } else {
            row.tab.firstChild.classList.add("border-b");
        }
        if (row.container.classList.contains("block") == true) {
            row.container.classList.remove("block");
            row.container.classList.add("hidden");
        }
    },
    getProgressBar: function () {
        var min = 0,
            max = 100,
            start = 0;

        var container = document.createElement("div");
        container.classList.add("progress");

        var bar = document.createElement("div");
        bar.classList.add(
            "bg-blue",
            "leading-none",
            "py-1",
            "text-xs",
            "text-center",
            "text-white"
        );
        bar.setAttribute("role", "progressbar");
        bar.setAttribute("aria-valuenow", start);
        bar.setAttribute("aria-valuemin", min);
        bar.setAttribute("aria-valuenax", max);
        bar.innerHTML = start + "%";
        container.appendChild(bar);

        return container;
    },
    updateProgressBar: function (progressBar, progress) {
        if (!progressBar) return;

        var bar = progressBar.firstChild;
        var percentage = progress + "%";
        bar.setAttribute("aria-valuenow", progress);
        bar.style.width = percentage;
        bar.innerHTML = percentage;
    },
    updateProgressBarUnknown: function (progressBar) {
        if (!progressBar) return;

        var bar = progressBar.firstChild;
        progressBar.classList.add(
            "progress",
            "bg-blue",
            "leading-none",
            "py-1",
            "text-xs",
            "text-center",
            "text-white",
            "block"
        );
        bar.removeAttribute("aria-valuenow");
        bar.classList.add("w-full");
        bar.innerHTML = "";
    },
    getInputGroup: function (input, buttons) {
        if (!input) return;

        var inputGroupContainer = document.createElement("div");
        inputGroupContainer.classList.add("relative", "items-stretch", "w-full");
        inputGroupContainer.appendChild(input);

        var inputGroup = document.createElement("div");
        inputGroup.classList.add("-mr-1");
        inputGroupContainer.appendChild(inputGroup);

        for (var i = 0; i < buttons.length; i++) {
            inputGroup.appendChild(buttons[i]);
        }

        return inputGroupContainer;
    }
});

JSONEditor.AbstractIconLib = Class.extend({
  mapping: {
    collapse: '',
    expand: '',
    "delete": '',
    edit: '',
    add: '',
    cancel: '',
    save: '',
    moveup: '',
    movedown: ''
  },
  icon_prefix: '',
  getIconClass: function(key) {
    if(this.mapping[key]) return this.icon_prefix+this.mapping[key];
    else return null;
  },
  getIcon: function(key) {
    var iconclass = this.getIconClass(key);
    
    if(!iconclass) return null;
    
    var i = document.createElement('i');
    i.classList.add.apply(i.classList, iconclass.split(' '));
    
    return i;
  }
});

JSONEditor.defaults.iconlibs.bootstrap2 = JSONEditor.AbstractIconLib.extend({
  mapping: {
    collapse: 'chevron-down',
    expand: 'chevron-up',
    "delete": 'trash',
    edit: 'pencil',
    add: 'plus',
    cancel: 'ban-circle',
    save: 'ok',
    moveup: 'arrow-up',
    movedown: 'arrow-down',
    clear: 'remove-circle',
    time: 'time',
    calendar: 'calendar'
  },
  icon_prefix: 'icon-'
});

JSONEditor.defaults.iconlibs.bootstrap3 = JSONEditor.AbstractIconLib.extend({
  mapping: {
    collapse: 'chevron-down',
    expand: 'chevron-right',
    "delete": 'remove',
    edit: 'pencil',
    add: 'plus',
    cancel: 'floppy-remove',
    save: 'floppy-saved',
    moveup: 'arrow-up',
    movedown: 'arrow-down',
    clear: 'remove-circle',
    time: 'time',
    calendar: 'calendar'
  },
  icon_prefix: 'glyphicon glyphicon-'
});

JSONEditor.defaults.iconlibs.fontawesome3 = JSONEditor.AbstractIconLib.extend({
  mapping: {
    collapse: 'chevron-down',
    expand: 'chevron-right',
    "delete": 'remove',
    edit: 'pencil',
    add: 'plus',
    cancel: 'ban-circle',
    save: 'save',
    moveup: 'arrow-up',
    movedown: 'arrow-down',
    clear: 'remove-circle',
    time: 'time',
    calendar: 'calendar'
  },
  icon_prefix: 'icon-'
});

JSONEditor.defaults.iconlibs.fontawesome4 = JSONEditor.AbstractIconLib.extend({
  mapping: {
    collapse: 'caret-square-o-down',
    expand: 'caret-square-o-right',
    "delete": 'times',
    edit: 'pencil',
    add: 'plus',
    cancel: 'ban',
    save: 'save',
    moveup: 'arrow-up',
    movedown: 'arrow-down',
    copy: 'files-o',
    clear: 'times-circle-o',
    time: 'clock-o',
    calendar: 'calendar'
  },
  icon_prefix: 'fa fa-'
});

JSONEditor.defaults.iconlibs.fontawesome5 = JSONEditor.AbstractIconLib.extend({
  mapping: {
    collapse: 'caret-down',
    expand: 'caret-right',
    delete: 'times',
    edit: 'pen',
    add: 'plus',
    cancel: 'ban',
    save: 'save',
    moveup: 'arrow-up',
    movedown: 'arrow-down',
    copy: 'copy',
    clear: 'times-circle',
    time: 'clock',
    calendar: 'calendar'
  },
  icon_prefix: 'fas fa-'
});

JSONEditor.defaults.iconlibs.foundation2 = JSONEditor.AbstractIconLib.extend({
  mapping: {
    collapse: 'minus',
    expand: 'plus',
    "delete": 'remove',
    edit: 'edit',
    add: 'add-doc',
    cancel: 'error',
    save: 'checkmark',
    moveup: 'up-arrow',
    movedown: 'down-arrow',
    clear: 'remove',
    time: 'clock',
    calendar: 'calendar'
  },
  icon_prefix: 'foundicon-'
});

JSONEditor.defaults.iconlibs.foundation3 = JSONEditor.AbstractIconLib.extend({
  mapping: {
    collapse: 'minus',
    expand: 'plus',
    "delete": 'x',
    edit: 'pencil',
    add: 'page-add',
    cancel: 'x-circle',
    save: 'save',
    moveup: 'arrow-up',
    movedown: 'arrow-down',
    clear: 'x-circle',
    time: 'clock',
    calendar: 'calendar'
  },
  icon_prefix: 'fi-'
});

JSONEditor.defaults.iconlibs.jqueryui = JSONEditor.AbstractIconLib.extend({
  mapping: {
    collapse: 'triangle-1-s',
    expand: 'triangle-1-e',
    "delete": 'trash',
    edit: 'pencil',
    add: 'plusthick',
    cancel: 'closethick',
    save: 'disk',
    moveup: 'arrowthick-1-n',
    movedown: 'arrowthick-1-s',
    clear: 'circle-close',
    time: 'time',
    calendar: 'calendar'
  },
  icon_prefix: 'ui-icon ui-icon-'
});

JSONEditor.defaults.iconlibs.materialicons = JSONEditor.AbstractIconLib.extend({

    mapping: {
      collapse: 'arrow_drop_up',
      expand: 'arrow_drop_down',
      "delete": 'delete',
      edit: 'edit',
      add: 'add',
      cancel: 'cancel',
      save: 'save',
      moveup: 'arrow_upward',
      movedown: 'arrow_downward',
      copy: 'content_copy',
      clear: 'highlight_off',
      time: 'access_time',
      calendar: 'calendar_today',
      upload: 'cloud_upload',
    },

    icon_class: 'material-icons',
    icon_prefix: '',

    getIconClass: function(key) {

        // This method is unused.

        return this.icon_class;
    },

    getIcon: function(key) {

        // Get the mapping.
        var mapping = this.mapping[key];
        if (!mapping) return null;

        // @see http://materializecss.com/icons.html
        var i = document.createElement('i');
        i.classList.add(this.icon_class);
        var t = document.createTextNode(mapping);
        i.appendChild(t);
        return i;

    }
});

JSONEditor.defaults.iconlibs.spectre = JSONEditor.AbstractIconLib.extend({
  mapping: {
    collapse: 'arrow-down',
    expand: 'arrow-right',
    "delete": 'delete',
    edit: 'edit',
    add: 'plus',
    cancel: 'close',
    save: 'save',
    moveup: 'upward',
    movedown: 'downward',
    copy: 'copy',
    clear: 'close',
    time: 'time',
    calendar: 'bookmark'
  },
  icon_prefix: 'icon icon-'
});

JSONEditor.defaults.templates["default"] = function() {
  return {
    compile: function(template) {
      var matches = template.match(/{{\s*([a-zA-Z0-9\-_ \.]+)\s*}}/g);
      var l = matches && matches.length;

      // Shortcut if the template contains no variables
      if(!l) return function() { return template; };

      // Pre-compute the search/replace functions
      // This drastically speeds up template execution
      var replacements = [];
      var get_replacement = function(i) {
        var p = matches[i].replace(/[{}]+/g,'').trim().split('.');
        var n = p.length;
        var func;
        
        if(n > 1) {
          var cur;
          func = function(vars) {
            cur = vars;
            for(i=0; i<n; i++) {
              cur = cur[p[i]];
              if(!cur) break;
            }
            return cur;
          };
        }
        else {
          p = p[0];
          func = function(vars) {
            return vars[p];
          };
        }
        
        replacements.push({
          s: matches[i],
          r: func
        });
      };
      for(var i=0; i<l; i++) {
        get_replacement(i);
      }

      // The compiled function
      return function(vars) {
        var ret = template+"";
        var r;
        for(i=0; i<l; i++) {
          r = replacements[i];
          ret = ret.replace(r.s, r.r(vars));
        }
        return ret;
      };
    }
  };
};

JSONEditor.defaults.templates.ejs = function() {
  if(!window.EJS) return false;

  return {
    compile: function(template) {
      var compiled = new window.EJS({
        text: template
      });

      return function(context) {
        return compiled.render(context);
      };
    }
  };
};

JSONEditor.defaults.templates.handlebars = function() {
  return window.Handlebars;
};

JSONEditor.defaults.templates.hogan = function() {
  if(!window.Hogan) return false;

  return {
    compile: function(template) {
      var compiled = window.Hogan.compile(template);
      return function(context) {
        return compiled.render(context);
      };
    }
  };
};

JSONEditor.defaults.templates.lodash = function() {
  if(!window._) return false;

  return {
    compile: function(template) {
      return function(context) {
        return window._.template(template)(context);
      };
    }
  };
};

JSONEditor.defaults.templates.markup = function() {
  if(!window.Mark || !window.Mark.up) return false;

  return {
    compile: function(template) {
      return function(context) {
        return window.Mark.up(template,context);
      };
    }
  };
};

JSONEditor.defaults.templates.mustache = function() {
  if(!window.Mustache) return false;

  return {
    compile: function(template) {
      return function(view) {
        return window.Mustache.render(template, view);
      };
    }
  };
};

JSONEditor.defaults.templates.swig = function() {
  return window.swig;
};

JSONEditor.defaults.templates.underscore = function() {
  if(!window._) return false;

  return {
    compile: function(template) {
      return function(context) {
        return window._.template(template)(context);
      };
    }
  };
};

// Set the default theme
JSONEditor.defaults.theme = 'html';

// Set the default template engine
JSONEditor.defaults.template = 'default';

// Default options when initializing JSON Editor
JSONEditor.defaults.options = {};

JSONEditor.defaults.options.prompt_before_delete = true;

JSONEditor.defaults.options.upload = function(type, file, cbs) {
  console.log('Upload handler required for upload editor');
};

// String translate function
JSONEditor.defaults.translate = function(key, variables) {
  var lang = JSONEditor.defaults.languages[JSONEditor.defaults.language];
  if(!lang) throw "Unknown language "+JSONEditor.defaults.language;

  var string = lang[key] || JSONEditor.defaults.languages[JSONEditor.defaults.default_language][key];

  if(typeof string === "undefined") throw "Unknown translate string "+key;

  if(variables) {
    for(var i=0; i<variables.length; i++) {
      string = string.replace(new RegExp('\\{\\{'+i+'}}','g'),variables[i]);
    }
  }

  return string;
};

// Translation strings and default languages
JSONEditor.defaults.default_language = 'en';
JSONEditor.defaults.language = JSONEditor.defaults.default_language;
JSONEditor.defaults.languages.en = {
  /**
   * When a property is not set
   */
  error_notset: "Property must be set",
  /**
   * When a string must not be empty
   */
  error_notempty: "Value required",
  /**
   * When a value is not one of the enumerated values
   */
  error_enum: "Value must be one of the enumerated values",
  /**
   * When a value doesn't validate any schema of a 'anyOf' combination
   */
  error_anyOf: "Value must validate against at least one of the provided schemas",
  /**
   * When a value doesn't validate
   * @variables This key takes one variable: The number of schemas the value does not validate
   */
  error_oneOf: 'Value must validate against exactly one of the provided schemas. It currently validates against {{0}} of the schemas.',
  /**
   * When a value does not validate a 'not' schema
   */
  error_not: "Value must not validate against the provided schema",
  /**
   * When a value does not match any of the provided types
   */
  error_type_union: "Value must be one of the provided types",
  /**
   * When a value does not match the given type
   * @variables This key takes one variable: The type the value should be of
   */
  error_type: "Value must be of type {{0}}",
  /**
   *  When the value validates one of the disallowed types
   */
  error_disallow_union: "Value must not be one of the provided disallowed types",
  /**
   *  When the value validates a disallowed type
   * @variables This key takes one variable: The type the value should not be of
   */
  error_disallow: "Value must not be of type {{0}}",
  /**
   * When a value is not a multiple of or divisible by a given number
   * @variables This key takes one variable: The number mentioned above
   */
  error_multipleOf: "Value must be a multiple of {{0}}",
  /**
   * When a value is greater than it's supposed to be (exclusive)
   * @variables This key takes one variable: The maximum
   */
  error_maximum_excl: "Value must be less than {{0}}",
  /**
   * When a value is greater than it's supposed to be (inclusive
   * @variables This key takes one variable: The maximum
   */
  error_maximum_incl: "Value must be at most {{0}}",
  /**
   * When a value is lesser than it's supposed to be (exclusive)
   * @variables This key takes one variable: The minimum
   */
  error_minimum_excl: "Value must be greater than {{0}}",
  /**
   * When a value is lesser than it's supposed to be (inclusive)
   * @variables This key takes one variable: The minimum
   */
  error_minimum_incl: "Value must be at least {{0}}",
  /**
   * When a value have too many characters
   * @variables This key takes one variable: The maximum character count
   */
  error_maxLength: "Value must be at most {{0}} characters long",
  /**
   * When a value does not have enough characters
   * @variables This key takes one variable: The minimum character count
   */
  error_minLength: "Value must be at least {{0}} characters long",
  /**
   * When a value does not match a given pattern
   */
  error_pattern: "Value must match the pattern {{0}}",
  /**
   * When an array has additional items whereas it is not supposed to
   */
  error_additionalItems: "No additional items allowed in this array",
  /**
   * When there are to many items in an array
   * @variables This key takes one variable: The maximum item count
   */
  error_maxItems: "Value must have at most {{0}} items",
  /**
   * When there are not enough items in an array
   * @variables This key takes one variable: The minimum item count
   */
  error_minItems: "Value must have at least {{0}} items",
  /**
   * When an array is supposed to have unique items but has duplicates
   */
  error_uniqueItems: "Array must have unique items",
  /**
   * When there are too many properties in an object
   * @variables This key takes one variable: The maximum property count
   */
  error_maxProperties: "Object must have at most {{0}} properties",
  /**
   * When there are not enough properties in an object
   * @variables This key takes one variable: The minimum property count
   */
  error_minProperties: "Object must have at least {{0}} properties",
  /**
   * When a required property is not defined
   * @variables This key takes one variable: The name of the missing property
   */
  error_required: "Object is missing the required property '{{0}}'",
  /**
   * When there is an additional property is set whereas there should be none
   * @variables This key takes one variable: The name of the additional property
   */
  error_additional_properties: "No additional properties allowed, but property {{0}} is set",
  /**
   * When a dependency is not resolved
   * @variables This key takes one variable: The name of the missing property for the dependency
   */
  error_dependency: "Must have property {{0}}",
  /**
   * When a date is in incorrect format
   * @variables This key takes one variable: The valid format
   */
  error_date: 'Date must be in the format {{0}}',
  /**
   * When a time is in incorrect format
   * @variables This key takes one variable: The valid format
   */
  error_time: 'Time must be in the format {{0}}',
  /**
   * When a datetime-local is in incorrect format
   * @variables This key takes one variable: The valid format
   */
  error_datetime_local: 'Datetime must be in the format {{0}}',
  /**
   * When a integer date is less than 1 January 1970
   */
  error_invalid_epoch: 'Date must be greater than 1 January 1970',
  /**
   * When an IPv4 is in incorrect format
   */
  error_ipv4: 'Value must be a valid IPv4 address in the form of 4 numbers between 0 and 255, separated by dots',
  /**
   * When an IPv6 is in incorrect format
   */
  error_ipv6: 'Value must be a valid IPv6 address',
  /**
   * When a hostname is in incorrect format
   */
  error_hostname: 'The hostname has the wrong format',
  /**
   * Text on Delete All buttons
   */
  button_delete_all: "All",
  /**
   * Title on Delete All buttons
   */
  button_delete_all_title: "Delete All",
  /**
    * Text on Delete Last buttons
    * @variable This key takes one variable: The title of object to delete
    */
  button_delete_last: "Last {{0}}",
  /**
    * Title on Delete Last buttons
    * @variable This key takes one variable: The title of object to delete
    */
  button_delete_last_title: "Delete Last {{0}}",
  /**
    * Title on Add Row buttons
    * @variable This key takes one variable: The title of object to add
    */
  button_add_row_title: "Add {{0}}",
  /**
    * Title on Move Down buttons
    */
  button_move_down_title: "Move down",
  /**
    * Title on Move Up buttons
    */
  button_move_up_title: "Move up",
  /**
    * Title on Object Properties buttons
    */
  button_object_properties: "Object Properties",
  /**
    * Title on Delete Row buttons
    * @variable This key takes one variable: The title of object to delete
    */
  button_delete_row_title: "Delete {{0}}",
  /**
    * Title on Delete Row buttons, short version (no parameter with the object title)
    */
  button_delete_row_title_short: "Delete",
  /**
    * Title on Collapse buttons
    */
  button_collapse: "Collapse",
  /**
    * Title on Expand buttons
    */
  button_expand: "Expand",
  /**
    * Title on Flatpickr toggle buttons
    */
  flatpickr_toggle_button: "Toggle",
  /**
    * Title on Flatpickr clear buttons
    */
  flatpickr_clear_button: "Clear",
  /**
    * Choices input field placeholder text
    */
  choices_placeholder_text: "Start typing to add value",
};

// Miscellaneous Plugin Settings
// Obsolete - Can be removed. Now replaced with global + schema options
JSONEditor.plugins = {
  ace: {
    theme: ''
  },
  choices: {
  },
  SimpleMDE: {

  },
  sceditor: {

  },
  select2: {

  },
  selectize: {
  }
};

// Global callback list
JSONEditor.defaults.callbacks = {

};

// Default per-editor options
$each(JSONEditor.defaults.editors, function(i,editor) {
  JSONEditor.defaults.editors[i].options = editor.options || {};
});

// Set the default resolvers
// Use "multiple" as a fall back for everything
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(typeof schema.type !== "string") return "multiple";
});
// If the type is not set but properties are defined, we can infer the type is actually object
JSONEditor.defaults.resolvers.unshift(function(schema) {
  // If the schema is a simple type
  if(!schema.type && schema.properties ) return "object";
});
// If the type is set and it's a basic type, use the primitive editor
JSONEditor.defaults.resolvers.unshift(function(schema) {
  // If the schema is a simple type
  if(typeof schema.type === "string") return schema.type;
});
// Use specialized editor for signatures
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === "string" && schema.format === "signature") return "signature";
});
// Use the select editor for all boolean values
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === 'boolean') {
    // If explicitly set to 'checkbox', use that
    if(schema.format === "checkbox" || (schema.options && schema.options.checkbox)) {
      return "checkbox";
    }
    // Otherwise, default to select menu
    if(schema.format === "select2") {
      return "select2";
    }
    if(schema.format === "selectize") {
      return "selectize";
    }
    if(schema.format === "choices") {
      return 'choices';
    }
    return 'select';
  }
});
// Use the multiple editor for schemas where the `type` is set to "any"
JSONEditor.defaults.resolvers.unshift(function(schema) {
  // If the schema can be of any type
  if(schema.type === "any") return "multiple";
});
// Editor for base64 encoded files
JSONEditor.defaults.resolvers.unshift(function(schema) {
  // If the schema can be of any type
  if(schema.type === "string" && schema.media && schema.media.binaryEncoding==="base64") {
    return "base64";
  }
});
// Editor for uploading files
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === "string" && schema.format === "url" && schema.options && schema.options.upload === true) {
    if(window.FileReader) return "upload";
  }
});
// Use the table editor for arrays with the format set to `table`
JSONEditor.defaults.resolvers.unshift(function(schema) {
  // Type `array` with format set to `table`
  if(schema.type === "array" && schema.format === "table") {
    return "table";
  }
});
// Use the `select` editor for dynamic enumSource enums
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.enumSource) {
    if(schema.format === "radio") {
      return "radio";
    }
    if(schema.format === "select2") {
      return "select2";
    }

    if(schema.format === "selectize") {
      return "selectize";
    }
    if(schema.format === "choices") {
      return 'choices';
    }
    return 'select';
  }
});
// Use the `enum` or `select` editors for schemas with enumerated properties
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema["enum"]) {
    if(schema.type === "array" || schema.type === "object") {
      return "enum";
    }
    else if(schema.type === "number" || schema.type === "integer" || schema.type === "string") {

      if(schema.format === "radio") {
        return "radio";
      }

      if(schema.format === "select2") {
        return "select2";
      }

      if(schema.format === "selectize") {
        return "selectize";
      }

      if(schema.format === "choices") {
        return 'choices';
      }
      return 'select';
      //return (JSONEditor.plugins.selectize.enable) ? 'selectize' : 'select';
    }
  }
});
// Specialized editors for arrays of strings
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === "array" && schema.items && !(Array.isArray(schema.items)) && ['string','number','integer'].indexOf(schema.items.type) >= 0) {
    if (schema.format === "choices") {
      return 'arrayChoices';
    }
    if (schema.uniqueItems) {
      // if 'selectize' enabled it is expected to be selectized control
      if (schema.format === "selectize") return 'arraySelectize';
      else if (schema.format === "select2") return 'arraySelect2';
      else return 'multiselect'; // otherwise it is select
    }
  }
});
// Use the multiple editor for schemas with `oneOf` set
JSONEditor.defaults.resolvers.unshift(function(schema) {
  // If this schema uses `oneOf` or `anyOf`
  if(schema.oneOf || schema.anyOf) return "multiple";
});
// Specialized editor for date, time and datetime-local formats
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if (['string', 'integer'].indexOf(schema.type) !== -1 && ['date', 'time', 'datetime-local'].indexOf(schema.format) !== -1) {
    return "datetime";
  }
});
// Use a specialized editor for starratings
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if (['string', 'integer'].indexOf(schema.type) !== -1 && ['starrating', 'rating'].indexOf(schema.format) !== -1) return "starrating";
});

// hyper-link describeBy Resolver
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if (schema.links) {
    for (var i = 0; i < schema.links.length; i++) {
      if (schema.links[i].rel && schema.links[i].rel.toLowerCase() === "describedby") {
        return "describedBy";
      }
    }
  }
});
// Enable custom editor type
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if (schema.format === "button") return "button";
});
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if (schema.format === "info") return "info";
});

JSONEditor.defaults.resolvers.unshift(function(schema) {
  if (schema.type === "string" && schema.format === "uuid") return "uuid";
});

JSONEditor.defaults.resolvers.unshift(function(schema) {
  if (schema.type === "string" && schema.format === "autocomplete") return "autocomplete";
});

JSONEditor.defaults.resolvers.unshift(function(schema) {
  if (schema.type === "string" && schema.format === "jodit") return "jodit";
});

JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === "string" && schema.format === 'markdown') return "simplemde";
});

JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === "string" && ['xhtml', 'bbcode'].indexOf(schema.format) !== -1) return "sceditor";
});

JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === "string" && ['actionscript',
      'batchfile',
      'c',
      'c++',
      'cpp',
      'coffee',
      'csharp',
      'css',
      'dart',
      'django',
      'ejs',
      'erlang',
      'golang',
      'groovy',
      'handlebars',
      'haskell',
      'haxe',
      'html',
      'ini',
      'jade',
      'java',
      'javascript',
      'json',
      'less',
      'lisp',
      'lua',
      'makefile',
      'matlab',
      'mysql',
      'objectivec',
      'pascal',
      'perl',
      'pgsql',
      'php',
      'python',
      'r',
      'ruby',
      'sass',
      'scala',
      'scss',
      'smarty',
      'sql',
      'sqlserver',
      'stylus',
      'svg',
      'twig',
      'vbscript',
      'xml',
      'yaml'
    ].indexOf(schema.format)  !== -1) return "ace";
});
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if (schema.type === "string" && ['ip', 'ipv4', 'ipv6','hostname'].indexOf(schema.format) !== -1 ) return "ip";
});
/**
 * This is a small wrapper for using JSON Editor like a typical jQuery plugin.
 */
(function() {
  if(window.jQuery || window.Zepto) {
    var $ = window.jQuery || window.Zepto;
    $.jsoneditor = JSONEditor.defaults;
    
    $.fn.jsoneditor = function(options) {
      var self = this;
      var editor = this.data('jsoneditor');
      if(options === 'value') {
        if(!editor) throw "Must initialize jsoneditor before getting/setting the value";
        
        // Set value
        if(arguments.length > 1) {
          editor.setValue(arguments[1]);
        }
        // Get value
        else {
          return editor.getValue();
        }
      }
      else if(options === 'validate') {
        if(!editor) throw "Must initialize jsoneditor before validating";
        
        // Validate a specific value
        if(arguments.length > 1) {
          return editor.validate(arguments[1]);
        }
        // Validate current value
        else {
          return editor.validate();
        }
      }
      else if(options === 'destroy') {
        if(editor) {
          editor.destroy();
          this.data('jsoneditor',null);
        }
      }
      else {
        // Destroy first
        if(editor) {
          editor.destroy();
        }
        
        // Create editor
        editor = new JSONEditor(this.get(0),options);
        this.data('jsoneditor',editor);
        
        // Setup event listeners
        editor.on('change',function() {
          self.trigger('change');
        });
        editor.on('ready',function() {
          self.trigger('ready');
        });
      }
      
      return this;
    };
  }
})();

	return JSONEditor;
});

//# sourceMappingURL=jsoneditor.js.map