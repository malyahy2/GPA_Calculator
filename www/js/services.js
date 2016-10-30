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

.factory('AppManager', function(DatabaseAccessor, IdGenerator) {
  var gradebooks = { key: "gradebooksList", list: [] };
  var terms = { key: "termsList", list: [] };
  var courses = { key: "coursesList", list: [] };

  var getInitialDataList = function (key) {
    var dataList = DatabaseAccessor.getDataObject(key);
    if(dataList == undefined){
      dataList = [];
      DatabaseAccessor.setDataObject(key, dataList);
    }
    return dataList;
  };

  gradebooks.list = getInitialDataList(gradebooks.key);
  terms.list = getInitialDataList(terms.key);
  courses.list = getInitialDataList(courses.key);

  var updateDataList = function(dataList) {
    DatabaseAccessor.setDataObject(dataList.key, dataList.list);
  }

  var getListObject = function(id) {
    if(id.charAt(0) == 'g' || id.charAt(0) == 'G'){
      return gradebooks;
    } else if(id.charAt(0) == 't' || id.charAt(0) == 't'){
      return terms;
    } else if(id.charAt(0) == 'c' || id.charAt(0) == 'C'){
      return courses;
    }
    return undefined;
  }

  var addObject = function(newObject) {
    var listObject = getListObject(newObject.id);
    listObject.list.push(newObject);
    updateDataList(listObject);
  }

  var getObject = function(objectId) {
    var objectList = getListObject(objectId).list;
    return objectList.find(function(object) {
        return object.id == objectId;
    });
  }

  var updateObject = function(updatedObject) {
    var listObject = getListObject(updatedObject.id);
    var objectIndex = listObject.list.indexOf(updatedObject.id);
    listObject.list[objectIndex] = updatedObject;
    updateDataList(listObject);
  }

  var deleteObject = function(objectId) {
    var listObject = getListObject(objectId);
    var objectIndex = listObject.list.indexOf(objectId);
    listObject.list.splice(objectIndex, 1);
    updateDataList(listObject);
  }

  return {
    addObject: addObject,
    getObject: getObject,
    updateObject: updateObject,
    deleteObject: deleteObject,
    getParentObject: function(objectId) {
      if(objectId.charAt(0) == 't' || objectId.charAt(0) == 't'){
        var objectList = gradebooks.list;
        return objectList.find(function(object) {
            return object.terms.indexOf(objectId) > -1;
        });
      } else if(objectId.charAt(0) == 'c' || objectId.charAt(0) == 'c'){
        var objectList = terms.list;
        return objectList.find(function(object) {
            return object.courses.indexOf(objectId) > -1;
        });
      }
    },
    createGradebook: function (gradeBookName) {
      var newId = IdGenerator.getNewId("gradebook");
      var newGradebook = { id: 0,
                          name:"",
                          GPA: 0.00,
                          hours:0,
                          initialGPA: 4.00,
                          initialHours: 0,
                          terms:[]};
      newGradebook.id = newId;

      if(gradeBookName != undefined)
        newGradebook.name = gradeBookName;

      addObject(newGradebook);
      return newGradebook;
    },
    getGradebooks: function () {
      return gradebooks.list;
    }
  }
})

.factory('GradebookManager', function(AppManager, IdGenerator) {
  return {
    updateName: function (gradebookId, newName) {
      var currentGradebook = AppManager.getObject(gradebookId);
      currentGradebook.name = newName;
      AppManager.updateObject(currentGradebook);
    },
    createTerm: function (gradebookId) {
      var newId = IdGenerator.getNewId("term");
      var newTerm = { id: 0,
                      name:"",
                      GPA: 0.00,
                      hours:0,
                      points:0,
                      courses:[]};
      newTerm.id = newId;
      AppManager.addObject(newTerm);

      var currentGradebook = AppManager.getObject(gradebookId);
      currentGradebook.terms.push(newTerm.id);
      AppManager.updateObject(currentGradebook);
      return newTerm;
    },
    getTerms: function (gradebookId) {
      var currentGradebook = AppManager.getObject(gradebookId);
      var termsObjects = [];
      for(var i=0; i<currentGradebook.terms.length; i++){
        termsObjects.push(AppManager.getObject(currentGradebook.terms[i]));
      }
      return termsObjects;
    },
    deleteGradebook: function (gradebookID) {
      var termsList = GradebookManager.getTerms(gradebookID);
      for(var i=0; i<termsList.length; i++){
        AppManager.deleteObject(termsList[i].id);
      }
      AppManager.deleteObject(gradebookID);
    }
  }
})

.factory('TermManager', function(AppManager, IdGenerator) {
  return {
    updateName: function (termId, newName) {
      var currentTerm = AppManager.getObject(termId);
      currentTerm.name = newName;
      AppManager.updateObject(currentTerm);
    },
    createCourse: function (termId) {
      var newId = IdGenerator.getNewId("course");
      var newCourse = { id: 0,
                        name:"",
                        grade: 0.00,
                        hours:0};
      newCourse.id = newId;
      AppManager.addObject(newTerm);

      var currentTerm = AppManager.getObject(termId);
      currentTerm.courses.push(newCourse.id);
      AppManager.updateObject(currentTerm);
      return newCourse;
    },
    getCourses: function (termId) {
      var currentTerm = AppManager.getObject(termId);
      var CoursesObjects = [];
      for(var i=0; i<currentTerm.courses.length; i++){
        CoursesObjects.push(AppManager.getObject(currentTerm.courses[i]));
      }
      return CoursesObjects;
    },
    deleteTerm: function (termID, gradebookID) {
      var parentGradebook = AppManager.getObject(gradebookID);
      var termIndex = parentGradebook.terms.indexOf(termID);
      parentGradebook.terms.splice(termIndex, 1);
      AppManager.updateObject(parentTerm);

      var courseList = TermManager.getCourses(termID);
      for(var i=0; i<courseList.length; i++){
        AppManager.deleteObject(courseList[i].id);
      }

      AppManager.deleteObject(courseID);
    },
    moveTerm: function (termID, oldGradebookID, newGradebookID) {
      var oldGradebook = AppManager.getObject(oldGradebookID);
      var termIndex = oldGradebook.terms.indexOf(termID);
      oldGradebook.terms.splice(courseIndex, 1);
      AppManager.updateObject(oldGradebook);

      var newGradebook = AppManager.getObject(newGradebookID);
      newGradebook.courses.push(termID);
      AppManager.updateObject(newGradebook);

      AppManager.calculateCumulativeData(oldGradebookID);
      AppManager.calculateCumulativeData(newGradebookID);
    }
  }
})

.factory('CourseManager', function(AppManager) {
  return {
    updateName: function (courseId, newName) {
      var currentCourse = AppManager.getObject(courseId);
      currentCourse.name = newName;
      AppManager.updateObject(currentCourse);
    },
    updateGrade: function (courseId, newGrade) {
      var currentCourse = AppManager.getObject(courseId);
      currentCourse.grade = newGrade;
      AppManager.updateObject(currentCourse);
    },
    updateHours: function (courseId, newHours) {
      var currentCourse = AppManager.getObject(courseId);
      currentCourse.hours = newHours;
      AppManager.updateObject(currentCourse);
    },
    deleteCourse: function (courseID, termID) {
      var parentTerm = AppManager.getObject(termID);
      var courseIndex = parentTerm.courses.indexOf(courseID);
      parentTerm.courses.splice(courseIndex, 1);
      AppManager.updateObject(parentTerm);
      AppManager.deleteObject(courseID);
    },
    moveCourse: function (courseID, oldTermID, newTermID) {
      var oldTerm = AppManager.getObject(oldTermID);
      var courseIndex = oldTerm.courses.indexOf(courseID);
      oldTerm.courses.splice(courseIndex, 1);
      AppManager.updateObject(oldTerm);

      var newTerm = AppManager.getObject(newTermID);
      newTerm.courses.push(courseID);
      AppManager.updateObject(newTerm);

      AppCalculator.calculateTermData(oldTermID);
      AppCalculator.calculateTermData(newTermID);
    },
  }
})

//create grading scale
//add watch to grade so that it watches the grading scale to update its grade


.factory('AppCalculator', function(AppManager, GradebookManager) {
  return {
    calculateCumulativeData: function (gradebookId) {
      var currentGradebook = AppManager.getObject(gradebookId);
      var gradebookTerms = GradebookManager.getTerms(gradebookId);

      // var gradebookTerms = [];
      // for(var i=0; i<currentGradebook.terms.length; i++){
      //   gradebookTerms.push(AppManager.getObject(currentGradebook.terms[i]));
      // }

      var cumulativePoints = (currentGradebook.initialGPA * currentGradebook.initialHours);
      var cumulativeHours = currentGradebook.initialHours;
      for(var i=0; i<gradebookTerms.length; i++){
        cumulativePoints += gradebookTerms[i].points;
        cumulativeHours += gradebookTerms[i].hours;
      }
      currentGradebook.hours = cumulativeHours;
      currentGradebook.GPA = cumulativePoints / cumulativeHours;
      AppManager.updateObject(currentGradebook);
      return currentGradebook;
    },
    updateCumulativeData: function (termID) {
      var currentTerm = AppManager.getObject(termID);
      var oldTermPoints = currentTerm.points;
      var oldTermHours = currentTerm.hours;

      var parentGradebook = AppManager.getParentObject(termID);
      var oldCumulativeHours = parentGradebook.hours;
      var oldCumulativePoints = parentGradebook.GPA * oldCumulativeHours;

      currentTerm = AppManager.calculateTermData(termID);

      parentGradebook.hours = (oldCumulativeHours - oldTermHours + currentTerm.hours);
      parentGradebook.GPA = (oldCumulativePoints - oldTermPoints + currentTerm.points) / parentGradebook.hours;
      AppManager.updateObject(parentGradebook);
      return parentGradebook;
    },
    calculateTermData: function (termId) {
      var currentTerm = AppManager.getObject(termId);
      var termCourses = TermManager.getCourses(termId);

      // var termCourses = [];
      // for(var i=0; i<currentTerm.courses.length; i++){
      //   termCourses.push(AppManager.getObject(currentTerm.courses[i]));
      // }

      var termPoints = 0;
      var termHours = 0;
      for(var i=0; i<termCourses.length; i++){
        var currentCourse = termCourses[i];
        termPoints += (currentCourse.grade * currentCourse.hours);
        termHours += currentCourse.hours;
      }
      currentTerm.hours = termHours;
      currentTerm.points = termPoints;
      currentTerm.GPA = termPoints / termHours;
      AppManager.updateObject(currentTerm);
      return currentTerm;
    }
  }
})

.factory('IdGenerator', function(DatabaseAccessor) {
  var baseKey = "nextId";
  return {
    getNewId: function (idType) {
      key = baseKey + "_" + idType.charAt(0);
      var currentId = parseInt(DatabaseAccessor.getData(key));
      console.log("gotten ID number: " + currentId + " for key: " +key);
      if(currentId == undefined){
        currentId = 0;
      }
      var nextId = currentId + 1;
      DatabaseAccessor.setData(key, "" + nextId);
      console.log("current ID number: " + idType.charAt(0) + currentId);
      console.log("next ID number: " + idType.charAt(0) + nextId);
      return idType.charAt(0) + currentId;
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
    },
    setDataObject: function (key, value) {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    getDataObject: function (key) {
      return JSON.parse( window.localStorage.getItem(key));
    }
  }
});
