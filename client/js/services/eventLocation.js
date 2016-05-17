myApp.factory('eventLocation', function() {
    
    this.eventData = { address:    null,
                       latitude:   null,
                       longitude:  null
                    };
                    
    this.isUndefined = function() {
        return (this.eventData.address === null);
    };
    
    this.setData = function(address, lat, lng) {
        this.eventData.address   = address;
        this.eventData.latitude  = lat;
        this.eventData.longitude = lng;
    };
    
    this.getData = function() {
        return this.eventData;
    };
    
    return this;
                       
});

