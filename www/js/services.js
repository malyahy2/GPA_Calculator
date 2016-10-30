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

.service('AppManager', function(DatabaseAccessor, IdGenerator, GradebookManager, TermManager) {
  var gradebooks = { key: "gradebooksList", list: [] };
  var terms = { key: "termsList", list: [] };
  var courses = { key: "coursesList", list: [] };

  var getInitialDataList = function(key) {
    var dataList = DatabaseAccessor.getDataObject(key);
    if(dataList == undefined){
      dataList = [];
      DatabaseAccessor.setDataObject(key, dataList);
    }
    return dataList;
  }

  gradebooks.list = this.getInitialDataList(gradebooks.key);
  terms.list = this.getInitialDataList(terms.key);
  courses.list = this.getInitialDataList(courses.key);

  var updateDataList = function(dataList) {
    DatabaseAccessor.setDataObject(dataList.key, dataList.list);
  }

  var getListObject = function(id) {
    if(id.charAt(0) == 'g' || id.charAt(0) == 'G'){
      return this.gradebooks;
    } else if(id.charAt(0) == 't' || id.charAt(0) == 't'){
      return this.terms;
    } else if(id.charAt(0) == 'c' || id.charAt(0) == 'C'){
      return this.courses;
    }
    return undefined;
  }

  return {
    addObject: function(newObject) {
      var listObject = this.getListObject(newObject.id);
      listObject.list.push(newObject);
      this.updateDataList(listObject);
    },
    getObject: function(objectId) {
      var objectList = this.getListObject(objectId).list;
      return objectList.find(function(object) {
          return object.id == objectId;
      });
    },
    updateObject: function(updatedObject) {
      var listObject = this.getListObject(updatedObject.id);
      var objectIndex = listObject.list.indexOf(updatedObject.id);
      listObject.list[objectIndex] = updatedObject;
      this.updateDataList(listObject);
    },
    deleteObject: function(objectId) {
      var listObject = this.getListObject(objectId);
      var objectIndex = listObject.list.indexOf(objectId);
      listObject.list.splice(objectIndex, 1);
      this.updateDataList(listObject);
    },
    getParentObject: function(objectId) {
      if(objectId.charAt(0) == 't' || objectId.charAt(0) == 't'){
        var objectList = this.gradebooks.list;
        return objectList.find(function(object) {
            return object.terms.indexOf(objectId) > -1;
        });
      } else if(objectId.charAt(0) == 'c' || objectId.charAt(0) == 'c'){
        var objectList = this.terms.list;
        return objectList.find(function(object) {
            return object.courses.indexOf(objectId) > -1;
        });
      }
    },
    calculateCumulativeData: function (gradebookId) {
      var currentGradebook = this.getObject(gradebookId);
      var gradebookTerms = GradebookManager.getTerms(gradebookId);
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
      var currentTerm = this.getObject(termID);
      var oldTermPoints = currentTerm.points;
      var oldTermHours = currentTerm.hours;

      var parentGradebook = this.getParentObject(termID);
      var oldCumulativeHours = parentGradebook.hours;
      var oldCumulativePoints = parentGradebook.GPA * oldCumulativeHours;

      currentTerm = this.calculateTermData(termID);

      parentGradebook.hours = (oldCumulativeHours - oldTermHours + currentTerm.hours);
      parentGradebook.GPA = (oldCumulativePoints - oldTermPoints + currentTerm.points) / parentGradebook.hours;
      AppManager.updateObject(parentGradebook);
      return parentGradebook;
    },
    calculateTermData: function (termId) {
      var currentTerm = this.getObject(termId);
      var termCourses = TermManager.getCourses(termId);
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
    },
    createGradebook: function () {
      var newId = IdGenerator.getNewId("gradebook");
      var newGradebook = { id: 0,
                          name:"",
                          GPA: 0.00,
                          hours:0,
                          initialGPA: 4.00,
                          initialHours: 0,
                          terms:[]};
      newGradebook.id = newId;
      this.addObject(newGradebook);
      return newGradebook;
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

      AppManager.calculateTermData(oldTermID);
      AppManager.calculateTermData(newTermID);
    },
  }
})

//create grading scale
//add watch to grade so that it watches the grading scale to update its grade


.factory('IdGenerator', function(DatabaseAccessor) {
  var key = "nextId";
  return {
    getNewId: function (idType) {
      key += "_" + idType.charAt(0);
      var nextId = DatabaseAccessor.getData(key);
      if(nextId == undefined){
        nextId = 0;
      }
      DatabaseAccessor.setData(key, nextId+1);
      return idType.charAt(0) + nextId;
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
