angular.module('gpaCalc.services', [])

.service('HomeReference', function(DatabaseAccessor) {
  return {
    getHome: function() {
      return DatabaseAccessor.getHome();
    }
  }
})

.service('DatabaseAccessor', function() {
  return {
    setHome: function (home) {
      window.localStorage.setItem("Home", home);
    },
    getHome: function() {
      var home = window.localStorage.getItem("Home");
      if(home != undefined){
        return home;
      } else {
        home = 'gradebooks';
        this.setHome(home);
        return home;
      }
    }
  }
});
