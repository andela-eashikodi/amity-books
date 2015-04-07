function validator(message, fun){
    var f = function(){
        return fun.apply(fun, arguments);
    };
    f.message = message;
    return f;
}

function checker(){
    var validators = _.toArray(arguments);
    return function(obj){
        return _.reduce(validators, function(errs, check){
            if(check(obj))
                return errs;
            else
                return _.chain(errs).push(check.message).value();                
        }, []);
    };
}

function isValidResourceItem(){
    var validators = checker(
  validator('obj can not be nul',function(obj){return !_.isNull(obj);}),
  validator('obj must contain title',function(obj){return !_.isNull(obj.title);}),
  validator('obj must contain canonicalVolumeLink',function(obj){return !_.isNull(obj.canonicalVolumeLink);}),
  validator('obj must contain description',function(obj){return !_.isNull(obj.description);})
                           );
        return validators;
}

$(document).ready(function () {
    
    function resultItem(title, link, description) {
        var self = this;
        self.title = ko.observable(title);
        self.link = ko.observable(link);
        self.description = ko.observable(description);
    }

    function viewModel() {
        var self = this;
        self.searchInput = ko.observable("");
        self.items = ko.observableArray();

        self.mapResults = function (data) {
            var chk = isValidResourceItem();
            _.each(data.items, function (item) {
                
                var chkResult = chk(item.volumeInfo);
                if(chkResult.length === 0){                
                    var resultI = new resultItem(item.volumeInfo.title,
                                             item.volumeInfo.canonicalVolumeLink,
                                             item.volumeInfo.description);
                    self.items.push(resultI); // add to our observable array
                }
                else{
                    console.log(chkResult);
                }
            });            
        };
        self.search = function () {
            self.items.removeAll();
            var url = "https://www.googleapis.com/books/v1/volumes?q=" + self.searchInput();
            $.ajax({
                url: url,
                type: "GET",
                success: function (data) {
                    self.mapResults(data);
                }
            });
        };
    }
    ko.applyBindings(new viewModel());
});