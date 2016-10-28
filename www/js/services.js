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

.factory('GradebooksListManager', function(DatabaseAccessor, IdGenerator) {
  var key = "gradebooksList";
  var gradebooksList = DatabaseAccessor.getData(key);
  if(gradebooksList == undefined){
    gradebooksList = [];
    DatabaseAccessor.setData(key, gradebooksList);
  }
  return {
    createGradebook: function () {
      var newId = IdGenerator.getNewGradebookId();
      var newGradebook = { id: 0,
                        name:"",
                        gpa: 0.0,
                        hours:0,
                        terms:[]};
      newGradebook.id = newId;
      gradebooksList.push(newGradebook);
      DatabaseAccessor.setData(key, gradebooksList);
      return newGradebook;
    }
    getGradebook: function(gradebookId) {
      for(var i=0; i<gradebooksList.length; i++){
        var tempGradebook = gradebooksList[i];
        if(tempGradebook.id == gradebookId)
          return tempGradebook;
      }
      return undefined;
    },
    updateGradebook: function(updatedGradebook) {
      for(var i=0; i<gradebooksList.length; i++){
        if(gradebooksList[i].id == updatedGradebook.id)
          gradebooksList[i] = updatedGradebook;
          DatabaseAccessor.setData(key, gradebooksList);
          return true;
      }
      return false;
    }
  }
})

.factory('GradebookManager', function(GradebooksListManager, IdGenerator) {
  return {
    updateName: function (gradebookId, newName) {
      var currentGradebook = GradebooksListManager.getGradebook(gradebookId);
      if(currentGradebook != undefined){
        currentGradebook.name = newName;
        GradebooksListManager.updateGradebook(currentGradebook);
        return true;
      } else return false;
    },
    updateHoursAndGPA: function (gradebookId) {
      var currentGradebook = GradebooksListManager.getGradebook(gradebookId);
      if(currentGradebook != undefined){
        var cumulativePoints = 0;
        var cumulativeHours = 0;
        for(vari=0; i<currentGradebook.terms.length; i++){
          cumulativePoints += currentGradebook.terms[i].points;
          cumulativeHours += currentGradebook.terms[i].hours;
        }
        currentGradebook.hours = cumulativeHours;
        currentGradebook.gpa = cumulativePoints / cumulativeHours;
        GradebooksListManager.updateGradebook(currentGradebook);
        return currentGradebook;
      } else return false;
    },
    createTerm: function (gradebookId) {
      var currentGradebook = GradebooksListManager.getGradebook(gradebookId);
      if(currentGradebook != undefined){
        var newId = IdGenerator.getNewTermId(gradebookId);
        var newTerm = { id: 0,
                        name:"",
                        gpa: 0.00,
                        hours:0,
                        points:0,
                        courses:[]};
        newTerm.id = newId;
        currentGradebook.terms.push(newGradebook);
        GradebooksListManager.updateGradebook(currentGradebook);
        return newTerm;
      } else return false;
    },
    getTerm: function(termId) {
      var gradebookId = termId.slice(0, termId.indexOf("t"));
      var currentGradebook = GradebooksListManager.getGradebook(gradebookId);
      if(currentGradebook != undefined){
        for(var i=0; i<currentGradebook.terms.length; i++){
          var tempTerm = currentGradebook.terms[i];
          if(tempTerm.id == termId)
            return tempTerm;
        }
        return undefined;
      } else return false;
    },
    updateTerm: function(updatedTerm) {
      var gradebookId = updatedTerm.id.slice(0, updatedTerm.id.indexOf("t"));
      var currentGradebook = GradebooksListManager.getGradebook(gradebookId);
      if(currentGradebook != undefined){
        for(var i=0; i<currentGradebook.terms.length; i++){
          if(currentGradebook.terms[i].id == updatedTerm.id)
            currentGradebook.terms[i] = updatedTerm;
            GradebooksListManager.updateGradebook(currentGradebook);
            return true;
        }
        return false;
      } else return false;
    }
  }
})

.factory('TermManager', function(GradebookManager, IdGenerator) {
  return {
    updateName: function (termId, newName) {
      var currentTerm = GradebookManager.getTerm(termId);
      if(currentTerm != undefined){
        currentTerm.name = newName;
        GradebookManager.updateTerm(currentTerm);
        return true;
      } else return false;
    },
    updateHoursPointsAndGPA: function (termId) {
      var currentTerm = GradebookManager.getTerm(termId);
      if(currentTerm != undefined){
        var termPoints = 0;
        var termHours = 0;
        for(vari=0; i<currentTerm.courses.length; i++){
          var currentCourse = currentTerm.courses[i];
          termPoints += (currentCourse.grade * currentCourse.hours);
          termHours += currentCourse.hours;
        }
        currentTerm.hours = termHours;
        currentTerm.points = termPoints;
        currentTerm.gpa = termPoints / termHours;
        GradebookManager.updateTerm(currentTerm);
        return currentTerm;
      } else return false;
    },
    createCourse: function (termId) {
      var currentTerm = GradebookManager.getTerm(termId);
      if(currentTerm != undefined){
        var newId = IdGenerator.getNewCourseId(termId);
        var newCourse = { id: 0,
                          name:"",
                          grade: 0.00,
                          hours:0};
        newCourse.id = newId;
        currentTerm.courses.push(newCourse);
        GradebookManager.updateTerm(currentTerm);
        return newCourse;
      } else return false;
    },
    getCourse: function(CourseId) {
      var termId = CourseId.slice(0, CourseId.indexOf("c"));
      var currentTerm = GradebookManager.getTerm(termId);
      if(currentTerm != undefined){
        for(var i=0; i<currentTerm.courses.length; i++){
          var tempCourse = currentTerm.courses[i];
          if(tempCourse.id == CourseId)
            return tempCourse;
        }
        return undefined;
      } else return false;
    },
    updateCourse: function(updatedCourse) {
      var termId = updatedCourse.id.slice(0, updatedCourse.id.indexOf("t"));
      var currentTerm = GradebookManager.getTerm(termId);
      if(currentTerm != undefined){
        for(var i=0; i<currentTerm.courses.length; i++){
          if(currentTerm.courses[i].id == updatedCourse.id)
            currentTerm.courses[i] = updatedCourse;
            GradebookManager.updateTerm(currentTerm);
            return true;
        }
        return false;
      } else return false;
    }
  }
})

.factory('CourseManager', function(TermManager) {
  return {
    updateName: function (courseId, newName) {
      var currentCourse = TermManager.getCourse(courseId);
      if(currentCourse != undefined){
        currentCourse.name = newName;
        TermManager.updateCourse(currentCourse);
        return true;
      } else return false;
    },
    updateGrade: function (courseId, newGrade) {
      var currentCourse = TermManager.getCourse(courseId);
      if(currentCourse != undefined){
        currentCourse.grade = newGrade;
        TermManager.updateCourse(currentCourse);
        return true;
      } else return false;
    },
    updateHours: function (courseId, newHours) {
      var currentCourse = TermManager.getCourse(courseId);
      if(currentCourse != undefined){
        currentCourse.hours = newHours;
        TermManager.updateCourse(currentCourse);
        return true;
      } else return false;
    }
  }
})

//create grading scale
//add watch to grade so that it watches the grading scale to update its grade

.factory('IdGenerator', function(DatabaseAccessor) {
  var key = "nextId";
  return {
    getNewGradebookId: function () {
      key += "_gradebook"
      var nextId = DatabaseAccessor.getData(key);
      if(nextId == undefined){
        nextId = 0;
      }
      DatabaseAccessor.setData(key, nextId+1);
      return "g"+nextId;
    },
    getNewTermId: function (gradebookId) {
      key += "_term"
      var nextId = DatabaseAccessor.getData(key);
      if(nextId == undefined){
        nextId = 0;
      }
      DatabaseAccessor.setData(key, nextId+1);
      return gradebookId+"t"+nextId;
    },
    getNewCourseId: function (termId) {
      key += "_course"
      var nextId = DatabaseAccessor.getData(key);
      if(nextId == undefined){
        nextId = 0;
      }
      DatabaseAccessor.setData(key, nextId+1);
      return termId+"c"+nextId;
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
