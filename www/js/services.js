angular.module('gpaCalc.services', [])

.factory('HomeReference', function(DatabaseAccessor) {
  var key = "Home";
  var initialHome = "gradebooks";
  return {
    setHome: function (home) {
      DatabaseAccessor.setData(key, home);
    },
    getHome: function() {
      var home = DatabaseAccessor.getData(key);
      if(home != undefined){
        return home;
      } else {
        home = initialHome;
        DatabaseAccessor.setData(key, home);
        return home;
      }
    }
  }
})

.factory('DatabaseAccessor', function() {
  return {
    setData: function (key, value) {
      window.localStorage.setItem(key, value);
    },
    getData: function (key) {
      return window.localStorage.getItem(key);
    }
  }
});
