;(function ( $, window, document, undefined ) {

    "use strict";

        var pluginName = "MultitouchManipulation",
                defaults = {
                propertyName: "value"
        };

        function Plugin ( element, options ) {
                this.element = element;

                this.settings = $.extend( {}, defaults, options );
                this._defaults = defaults;
                this._name = pluginName;
                this.init();
        }

        $.extend(Plugin.prototype, {
                init: function () {
                        this.square = $(this.element);
                        this.oldRotation = 0;
                        this.oldScale = 0;
                        this.posX = 0;
                        this.posY = 0;
                        this.square.on("touchstart", this.touchstart.bind(this));
                        this.square.on("touchmove", this.touchmove.bind(this));
                },
                getScalingDistance: function(touches0, touches1){

                    var dx = touches0.pageX - touches1.pageX,
                        dy = touches0.pageY - touches1.pageY;
                    return Math.sqrt(dx*dx + dy*dy) / 100;

                },
                getRotationAngle: function(touches0, touches1){
                    var dx = touches0.pageX - touches1.pageX,
                        dy = touches0.pageY - touches1.pageY;
                    return Math.atan2(dy, dx) * 180 / Math.PI;  
                },
                touchstart: function(e){

                    this.posX = parseFloat(this.square.css('left')) - e.originalEvent.touches[0].pageX;
                    this.posY = parseFloat(this.square.css('top')) - e.originalEvent.touches[0].pageY;

                    if(e.originalEvent.touches.length < 2) return;

                    this.oldScale = this.square.getScaleDegrees() - this.getScalingDistance(e.originalEvent.touches[0], e.originalEvent.touches[1]);
                    this.oldRotation = this.square.getRotation() - this.getRotationAngle(e.originalEvent.touches[0], e.originalEvent.touches[1]);
                },
                touchmove: function(e){
                    if(e.originalEvent.touches.length === 2) {
                        var transforms = 'rotate(' + ( this.oldRotation + this.getRotationAngle(e.originalEvent.touches[0], e.originalEvent.touches[1]) ) + 'deg)';
                        transforms += ' scale(' + ( this.oldScale + (this.getScalingDistance(e.originalEvent.touches[0], e.originalEvent.touches[1])) ) + ')';
                    }
                    this.square.css({
                        top: this.posY + e.originalEvent.touches[0].pageY,
                        left: this.posX + e.originalEvent.touches[0].pageX,
                        transform: transforms
                    });
                    
                    e.originalEvent.preventDefault();
                }
        });

        $.fn[ pluginName ] = function ( options ) {
                return this.each(function() {
                        if ( !$.data( this, "plugin_" + pluginName ) ) {
                                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
                        }
                });
        };

})( jQuery, window, document );

$.fn.getMatrix = function(i){
    var array = this.css('transform').split('(')[1].split(')')[0].split(',');
    return array[i] || array;
};

$.fn.getRotation = function(){
    return Math.round(Math.atan2(this.getMatrix(1), this.getMatrix(0)) * (180/Math.PI))
};

$.fn.getScaleDegrees = function() {

        var a = this.getMatrix(0),
            b = this.getMatrix(1),
            d = 10;

    return Math.round( Math.sqrt( a*a + b*b ) * d ) / d || 0;
};