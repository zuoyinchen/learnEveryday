//code sourced from http://mrdoob.com/

var canvas;
// JavaScript Document


/* Based on Alex Arnell's inheritance implementation. */
var Class = {
    create: function() {
      var parent = null, properties = $A(arguments);
      if (Object.isFunction(properties[0]))
        parent = properties.shift();
  
      function klass() {
        this.initialize.apply(this, arguments);
      }
  
      Object.extend(klass, Class.Methods);
      klass.superclass = parent;
      klass.subclasses = [];
  
      if (parent) {
        var subclass = function() { };
        subclass.prototype = parent.prototype;
        klass.prototype = new subclass;
        parent.subclasses.push(klass);
      }
  
      for (var i = 0; i < properties.length; i++)
        klass.addMethods(properties[i]);
  
      if (!klass.prototype.initialize)
        klass.prototype.initialize = this.emptyFunction;
  
      klass.prototype.constructor = klass;
  
      return klass;
    },
    emptyFunction:function () {},
  
  };
  
  Class.Methods = {
    addMethods: function(source) {
      var ancestor   = this.superclass && this.superclass.prototype;
      var properties = Object.keys(source);
  
      if (!Object.keys({ toString: true }).length)
        properties.push("toString", "valueOf");
  
      for (var i = 0, length = properties.length; i < length; i++) {
        var property = properties[i], value = source[property];
        if (ancestor && Object.isFunction(value) &&
            value.argumentNames().first() == "$super") {
          var method = value, value = Object.extend((function(m) {
            return function() { return ancestor[m].apply(this, arguments) };
          })(property).wrap(method), {
            valueOf:  function() { return method },
            toString: function() { return method.toString() }
          });
        }
        this.prototype[property] = value;
      }
  
      return this;
    }
  };
  
  Object.extend = function(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  };
  
  Object.extend(Object, {
    inspect: function(object) {
      try {
        if (Object.isUndefined(object)) return 'undefined';
        if (object === null) return 'null';
        return object.inspect ? object.inspect() : String(object);
      } catch (e) {
        if (e instanceof RangeError) return '...';
        throw e;
      }
    },
  
    toJSON: function(object) {
      var type = typeof object;
      switch (type) {
        case 'undefined':
        case 'function':
        case 'unknown': return;
        case 'boolean': return object.toString();
      }
  
      if (object === null) return 'null';
      if (object.toJSON) return object.toJSON();
      if (Object.isElement(object)) return;
  
      var results = [];
      for (var property in object) {
        var value = Object.toJSON(object[property]);
        if (!Object.isUndefined(value))
          results.push(property.toJSON() + ': ' + value);
      }
  
      return '{' + results.join(', ') + '}';
    },
  
    toQueryString: function(object) {
      return $H(object).toQueryString();
    },
  
    toHTML: function(object) {
      return object && object.toHTML ? object.toHTML() : String.interpret(object);
    },
  
    keys: function(object) {
      var keys = [];
      for (var property in object)
        keys.push(property);
      return keys;
    },
  
    values: function(object) {
      var values = [];
      for (var property in object)
        values.push(object[property]);
      return values;
    },
  
    clone: function(object) {
      return Object.extend({ }, object);
    },
  
    isElement: function(object) {
      return object && object.nodeType == 1;
    },
  
    isArray: function(object) {
      return object != null && typeof object == "object" &&
        'splice' in object && 'join' in object;
    },
  
    isHash: function(object) {
      return object instanceof Hash;
    },
  
    isFunction: function(object) {
      return typeof object == "function";
    },
  
    isString: function(object) {
      return typeof object == "string";
    },
  
    isNumber: function(object) {
      return typeof object == "number";
    },
  
    isUndefined: function(object) {
      return typeof object == "undefined";
    }
  });
  
  function $A(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  }
  
  if (WebKit = navigator.userAgent.indexOf('AppleWebKit/') > -1) {
    $A = function(iterable) {
      if (!iterable) return [];
      if (!(Object.isFunction(iterable) && iterable == '[object NodeList]') &&
          iterable.toArray) return iterable.toArray();
      var length = iterable.length || 0, results = new Array(length);
      while (length--) results[length] = iterable[length];
      return results;
    };
  }
  
var delta = [ 0, 0 ];
var stage = [ window.screenX, window.screenY, window.innerWidth, window.innerHeight ];
getBrowserDimensions();

var themes = [[ "#FFF", "#135487", "#D5D8DD","#5CA2BE", "#2A4353", "#989DA4" ] ];
var theme;

var worldAABB, world, iterations = 1, timeStep = 1 / 20;

var walls = [];
var wall_thickness = 200;
var wallsSetted = false;

var bodies, elements, text;

var createMode = false;
var destroyMode = false;

var main = false;
var mouseJoint;
var mouseX = 0;
var mouseY = 0;
var orientation = { x: 0, y: 1 };

var PI2 = Math.PI * 2;

var timeOfLastTouch = 0;

init();
play();

function init() {

    canvas = document.getElementById( 'canvas' );

    document.onmousedown = onDocumentMouseDown;
    document.onmouseup = onDocumentMouseUp;
    document.onmousemove = onDocumentMouseMove;
    document.ondblclick = onDocumentDoubleClick;

    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );
    document.addEventListener( 'touchend', onDocumentTouchEnd, false );

    window.addEventListener( 'deviceorientation', onWindowDeviceOrientation, false );

    // init box2d

    worldAABB = new b2AABB();
    worldAABB.minVertex.Set( -200, -200 );
    worldAABB.maxVertex.Set( screen.width + 200, screen.height + 200 );

    world = new b2World( worldAABB, new b2Vec2( 0, 0 ), true );

    setWalls();
    reset();
}


function play() {

    setInterval( loop, 1000 / 40 );
}

function reset() {

    var i;

    if ( bodies ) {

        for ( i = 0; i < bodies.length; i++ ) {

            var body = bodies[ i ]
            canvas.removeChild( body.GetUserData().element );
            world.DestroyBody( body );
            body = null;
        }
    }

    // color theme
    theme = themes[ Math.random() * themes.length >> 0 ];
    document.body.style[ 'backgroundColor' ] = theme[ 0 ];

    bodies = [];
    elements = [];


    createInstructions();

//amount of balls
    for( i = 0; i < 8; i++ ) {

        createBall();

    }

}

//

function onDocumentMouseDown() {

    isMouseDown = true;
    return false;
}

function onDocumentMouseUp() {

    isMouseDown = false;
    return false;
}

function onDocumentMouseMove( event ) {

    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onDocumentDoubleClick() {

    reset();
}

function onDocumentTouchStart( event ) {

    if( event.touches.length == 1 ) {

        event.preventDefault();

        // Faking double click for touch devices

        var now = new Date().getTime();

        if ( now - timeOfLastTouch  < 250 ) {

            reset();
            return;
        }

        timeOfLastTouch = now;

        mouseX = event.touches[ 0 ].pageX;
        mouseY = event.touches[ 0 ].pageY;
        isMouseDown = true;
    }
}

function onDocumentTouchMove( event ) {

    if ( event.touches.length == 1 ) {

        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX;
        mouseY = event.touches[ 0 ].pageY;

    }

}

function onDocumentTouchEnd( event ) {

    if ( event.touches.length == 0 ) {

        event.preventDefault();
        isMouseDown = false;

    }

}

function onWindowDeviceOrientation( event ) {

    if ( event.beta ) {

        orientation.x = Math.sin( event.gamma * Math.PI / 180 );
        orientation.y = Math.sin( ( Math.PI / 4 ) + event.beta * Math.PI / 180 );

    }

}

//

function createInstructions() {

    var size = 90;

    var element = document.createElement( 'div' );
    element.width = size;
    element.height = size;  
    element.style.position = 'absolute';
    element.style.left = -200 + 'px';
    element.style.top = -200 + 'px';
    element.style.cursor = "default";

    canvas.appendChild(element);
    elements.push( element );

    var circle = document.createElement( 'canvas' );
    circle.width = size;
    circle.height = size;

    var graphics = circle.getContext( '2d' );

    graphics.fillStyle = theme[ 3 ];
    graphics.beginPath();
    graphics.arc( size * .5, size * .5, size * .5, 0, PI2, true );
    graphics.closePath();
    graphics.fill();

    element.appendChild( circle );

    text = document.createElement( 'div' );
    text.onSelectStart = null;
    
  

    text.style.left = ((250 - text.clientWidth) / 2) +'px';
    text.style.top = ((250 - text.clientHeight) / 2) +'px'; 

    var b2body = new b2BodyDef();

    var circle = new b2CircleDef();
    circle.radius = size / 2;
    circle.density = 1;
    circle.friction = 0.3;
    circle.restitution = 0.3;
    b2body.AddShape(circle);
    b2body.userData = {element: element};

    b2body.position.Set( Math.random() * stage[2], Math.random() * -200 );
    b2body.linearVelocity.Set( Math.random() * 400 - 200, Math.random() * 400 - 200 );
    bodies.push( world.CreateBody(b2body) );    
}

function createBall( x, y ) {

    var x = x || Math.random() * stage[2];
    var y = y || Math.random() * -200;

//sb
    var size = (Math.random() * 75 >> 0) + 20;

    var element = document.createElement("canvas");
    element.width = size;
    element.height = size;
    element.style['position'] = 'absolute';
    element.style['left'] = -200 + 'px';
    element.style['top'] = -200 + 'px';

    var graphics = element.getContext("2d");

    var num_circles = Math.random() * 10 >> 0;

    for (var i = size; i > 0; i-= (size/num_circles)) {

        graphics.fillStyle = theme[ (Math.random() * 4 >> 0) + 1];
        graphics.beginPath();
        graphics.arc(size * .5, size * .5, i * .5, 0, PI2, true); 
        graphics.closePath();
        graphics.fill();
    }

    canvas.appendChild(element);

    elements.push( element );

    var b2body = new b2BodyDef();

    var circle = new b2CircleDef();
    circle.radius = size >> 1;
    circle.density = 1;
    circle.friction = 0.3;
    circle.restitution = 0.3;
    b2body.AddShape(circle);
    b2body.userData = {element: element};

    b2body.position.Set( x, y );
    b2body.linearVelocity.Set( Math.random() * 400 - 200, Math.random() * 400 - 200 );
    bodies.push( world.CreateBody(b2body) );
}

//

function loop() {

    if (getBrowserDimensions()) {

        setWalls();

    }

    delta[0] += (0 - delta[0]) * .5;
    delta[1] += (0 - delta[1]) * .5;

    world.m_gravity.x = orientation.x * 350 + delta[0];
    world.m_gravity.y = orientation.y * 350 + delta[1];

    mouseDrag();
    world.Step(timeStep, iterations);

    for (i = 0; i < bodies.length; i++) {

        var body = bodies[i];
        var element = elements[i];

        element.style.left = (body.m_position0.x - (element.width >> 1)) + 'px';
        element.style.top = (body.m_position0.y - (element.height >> 1)) + 'px';

        if (element.tagName == 'DIV') {

            var rotationStyle = 'rotate(' + (body.m_rotation0 * 57.2957795) + 'deg)';
            text.style.WebkitTransform = rotationStyle;
            text.style.MozTransform = rotationStyle;
            text.style.OTransform = rotationStyle;
            // text.style.MsTransform = rotationStyle;

        }

    }

}


// .. BOX2D UTILS

function createBox(world, x, y, width, height, fixed) {

    if (typeof(fixed) == 'undefined') {

        fixed = true;

    }

    var boxSd = new b2BoxDef();

    if (!fixed) {

        boxSd.density = 1.0;

    }

    boxSd.extents.Set(width, height);

    var boxBd = new b2BodyDef();
    boxBd.AddShape(boxSd);
    boxBd.position.Set(x,y);

    return world.CreateBody(boxBd);

}

function mouseDrag()
{
    // mouse press
    if (createMode) {

        createBall( mouseX, mouseY );

    } else if (isMouseDown && !mouseJoint) {

        var body = getBodyAtMouse();

        if (body) {

            var md = new b2MouseJointDef();
            md.body1 = world.m_groundBody;
            md.body2 = body;
            md.target.Set(mouseX, mouseY);
            md.maxForce = 30000 * body.m_mass;
            md.timeStep = timeStep;
            mouseJoint = world.CreateJoint(md);
            body.WakeUp();

        } else {

            createMode = true;

        }

    }

    // mouse release
    if (!isMouseDown) {

        createMode = false;
        destroyMode = false;

        if (mouseJoint) {

            world.DestroyJoint(mouseJoint);
            mouseJoint = null;

        }

    }

    // mouse move
    if (mouseJoint) {

        var p2 = new b2Vec2(mouseX, mouseY);
        mouseJoint.SetTarget(p2);
    }
}

function getBodyAtMouse() {

    // Make a small box.
    var mousePVec = new b2Vec2();
    mousePVec.Set(mouseX, mouseY);

    var aabb = new b2AABB();
    aabb.minVertex.Set(mouseX - 1, mouseY - 1);
    aabb.maxVertex.Set(mouseX + 1, mouseY + 1);

    // Query the world for overlapping shapes.
    var k_maxCount = 10;
    var shapes = new Array();
    var count = world.Query(aabb, shapes, k_maxCount);
    var body = null;

    for (var i = 0; i < count; ++i) {

        if (shapes[i].m_body.IsStatic() == false) {

            if ( shapes[i].TestPoint(mousePVec) ) {

                body = shapes[i].m_body;
                break;

            }

        }

    }

    return body;

}

function setWalls() {

    if (wallsSetted) {

        world.DestroyBody(walls[0]);
        world.DestroyBody(walls[1]);
        world.DestroyBody(walls[2]);
        world.DestroyBody(walls[3]);

        walls[0] = null; 
        walls[1] = null;
        walls[2] = null;
        walls[3] = null;
    }

    walls[0] = createBox(world, stage[2] / 2, - wall_thickness, stage[2], wall_thickness);
    walls[1] = createBox(world, stage[2] / 2, stage[3] + wall_thickness, stage[2], wall_thickness);
    walls[2] = createBox(world, - wall_thickness, stage[3] / 2, wall_thickness, stage[3]);
    walls[3] = createBox(world, stage[2] + wall_thickness, stage[3] / 2, wall_thickness, stage[3]); 

    wallsSetted = true;

}

// BROWSER DIMENSIONS

function getBrowserDimensions() {

    var changed = false;

    if (stage[0] != window.screenX) {

        delta[0] = (window.screenX - stage[0]) * 50;
        stage[0] = window.screenX;
        changed = true;

    }

    if (stage[1] != window.screenY) {

        delta[1] = (window.screenY - stage[1]) * 50;
        stage[1] = window.screenY;
        changed = true;

    }

    if (stage[2] != window.innerWidth) {

        stage[2] = window.innerWidth;
        changed = true;

    }

    if (stage[3] != window.innerHeight) {

        stage[3] = window.innerHeight;
        changed = true;

    }

    return changed;

}
