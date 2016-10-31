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

.factory('AppManager', function(DatabaseAccessor, IDGenerator, GradingScaleManager) {
  var gradebooks = { key: "gradebooksList", list: [] };
  var terms = { key: "termsList", list: [] };
  var courses = { key: "coursesList", list: [] };

  var resetLocalStorage = function () {
    DatabaseAccessor.deleteData(gradebooks.key);
    DatabaseAccessor.deleteData(terms.key);
    DatabaseAccessor.deleteData(courses.key);
  };

  //resetLocalStorage();

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

  var getObject = function(objectID) {
    var objectList = getListObject(objectID).list;
    return objectList.find(function(object) {
        return object.id == objectID;
    });
  }

  var updateObject = function(updatedObject) {
    var listObject = getListObject(updatedObject.id);
    var objectIndex = listObject.list.indexOf(updatedObject.id);
    listObject.list[objectIndex] = updatedObject;
    updateDataList(listObject);
  }

  var deleteObject = function(objectID) {
    var listObject = getListObject(objectID);
    var objectIndex = listObject.list.indexOf(objectID);
    listObject.list.splice(objectIndex, 1);
    updateDataList(listObject);
  }

  var printList = function(list, location) {
    var idList = location + " ";
    for( var i=0; i<list.length; i++) {
      idList += list[i].id;
      idList += ", ";
    }
    console.log(idList);
  }

  var getParentObject = function(objectID) {
    if(objectID.charAt(0) == 't' || objectID.charAt(0) == 't'){
      var objectList = gradebooks.list;
      return objectList.find(function(object) {
          return object.terms.indexOf(objectID) > -1;
      });
    } else if(objectID.charAt(0) == 'c' || objectID.charAt(0) == 'c'){
      var objectList = terms.list;
      return objectList.find(function(object) {
          return object.courses.indexOf(objectID) > -1;
      });
    } else return undefined;
  }

  var createGradebook = function (gradeBookName) {
    var newID = IDGenerator.getNewID("gradebook");
    var newGradebook = { id: "",
                        name:"",
                        GPA: 0.00,
                        hours:0,
                        initialGPA: 4.00,
                        initialHours: 0,
                        terms:[]};
    newGradebook.id = newID;

    if(gradeBookName != undefined)
      newGradebook.name = gradeBookName;

    addObject(newGradebook);
    GradingScaleManager.addNewAssociation(newGradebook.id, GradingScaleManager.getInitialGradingScaleID());
    return newGradebook;
  }

  var getGradebooks = function () {
    return gradebooks.list;
  }

  return {
    addObject: addObject,
    getObject: getObject,
    updateObject: updateObject,
    deleteObject: deleteObject,
    printList: printList,
    getParentObject: getParentObject,
    createGradebook: createGradebook,
    getGradebooks: getGradebooks
  }
})

.factory('GradebookManager', function(AppManager, IDGenerator, GradingScaleManager) {
  var updateName = function (gradebookID, newName) {
    var currentGradebook = AppManager.getObject(gradebookID);
    currentGradebook.name = newName;
    //AppManager.updateObject(currentGradebook);
  }

  var getGradebook = function (gradebookID) {
    return AppManager.getObject(gradebookID);
  }

  var createTerm = function (gradebookID, termName) {
    var newID = IDGenerator.getNewID("term");
    var newTerm = { id: "",
                    name:"",
                    GPA: 0.00,
                    hours:0,
                    points:0,
                    courses:[]};
    newTerm.id = newID;
    AppManager.addObject(newTerm);

    if(termName != undefined)
      newGradebook.name = termName;

    var currentGradebook = AppManager.getObject(gradebookID);
    currentGradebook.terms.push(newTerm.id);
    //AppManager.updateObject(currentGradebook);
    return newTerm;
  }

  var getTerms = function (gradebookID) {
    var currentGradebook = AppManager.getObject(gradebookID);
    var termsObjects = [];
    for(var i=0; i<currentGradebook.terms.length; i++){
      termsObjects.push(AppManager.getObject(currentGradebook.terms[i]));
    }
    return termsObjects;
  }

  var deleteGradebook = function (gradebookID) {
    var termsList = getTerms(gradebookID);
    for(var i=0; i<termsList.length; i++){
      AppManager.deleteObject(termsList[i].id);
    }
    GradingScaleManager.deleteAssociation(currentGradebook.id);
    AppManager.deleteObject(gradebookID);
  }

  return {
    updateName: updateName,
    getGradebook: getGradebook,
    createTerm: createTerm,
    getTerms: getTerms,
    deleteGradebook: deleteGradebook
  }
})

.factory('TermManager', function(AppManager, IDGenerator) {
  var updateName =  function (termID, newName) {
    var currentTerm = AppManager.getObject(termID);
    currentTerm.name = newName;
    //AppManager.updateObject(currentTerm);
  }

  var createCourse = function (termID, courseName) {
    var newID = IDGenerator.getNewID("course");
    var newCourse = { id: "",
                      name:"",
                      grade: 0.00,
                      hours:0};
    newCourse.id = newID;
    AppManager.addObject(newTerm);

    if(courseName != undefined)
      newGradebook.name = courseName;

    var currentTerm = AppManager.getObject(termID);
    currentTerm.courses.push(newCourse.id);
    //AppManager.updateObject(currentTerm);
    return newCourse;
  }

  var getCourses = function (termID) {
    var currentTerm = AppManager.getObject(termID);
    var CoursesObjects = [];
    for(var i=0; i<currentTerm.courses.length; i++){
      CoursesObjects.push(AppManager.getObject(currentTerm.courses[i]));
    }
    return CoursesObjects;
  }

  var deleteTerm = function (termID, gradebookID) {
    var parentGradebook = AppManager.getObject(gradebookID);
    var termIndex = parentGradebook.terms.indexOf(termID);
    parentGradebook.terms.splice(termIndex, 1);
    //AppManager.updateObject(parentTerm);

    var courseList = getCourses(termID);
    for(var i=0; i<courseList.length; i++){
      AppManager.deleteObject(courseList[i].id);
    }

    AppManager.deleteObject(courseID);
  }

  var moveTerm = function (termID, oldGradebookID, newGradebookID) {
    var oldGradebook = AppManager.getObject(oldGradebookID);
    var termIndex = oldGradebook.terms.indexOf(termID);
    oldGradebook.terms.splice(courseIndex, 1);
    //AppManager.updateObject(oldGradebook);

    var newGradebook = AppManager.getObject(newGradebookID);
    newGradebook.courses.push(termID);
    //AppManager.updateObject(newGradebook);

    AppManager.calculateCumulativeData(oldGradebookID);
    AppManager.calculateCumulativeData(newGradebookID);
  }

  return {
    updateName: updateName,
    createCourse: createCourse,
    getCourses: getCourses,
    deleteTerm: deleteTerm,
    moveTerm: moveTerm
  }
})

.factory('CourseManager', function(AppManager) {
  return {
    updateName: function (courseID, newName) {
      var currentCourse = AppManager.getObject(courseID);
      currentCourse.name = newName;
      //AppManager.updateObject(currentCourse);
    },
    updateGrade: function (courseID, newGrade) {
      var currentCourse = AppManager.getObject(courseID);
      currentCourse.grade = newGrade;
      //AppManager.updateObject(currentCourse);
    },
    updateHours: function (courseID, newHours) {
      var currentCourse = AppManager.getObject(courseID);
      currentCourse.hours = newHours;
      //AppManager.updateObject(currentCourse);
    },
    deleteCourse: function (courseID, termID) {
      var parentTerm = AppManager.getObject(termID);
      var courseIndex = parentTerm.courses.indexOf(courseID);
      parentTerm.courses.splice(courseIndex, 1);
      //AppManager.updateObject(parentTerm);
      AppManager.deleteObject(courseID);
    },
    moveCourse: function (courseID, oldTermID, newTermID) {
      var oldTerm = AppManager.getObject(oldTermID);
      var courseIndex = oldTerm.courses.indexOf(courseID);
      oldTerm.courses.splice(courseIndex, 1);
      //AppManager.updateObject(oldTerm);

      var newTerm = AppManager.getObject(newTermID);
      newTerm.courses.push(courseID);
      //AppManager.updateObject(newTerm);

      AppCalculator.calculateTermData(oldTermID);
      AppCalculator.calculateTermData(newTermID);
    }
  }
})

.factory('GradingScaleManager', function(DatabaseAccessor, IDGenerator) {

  var gradingScalesRefrence = { key: "gradingScalesRefrence", list: [] };
  var gradingScales = { key: "gradingScales", list: [] };

  var initialGradingScale;

  var resetLocalStorage = function () {
    DatabaseAccessor.deleteData(gradingScalesRefrence.key);
    DatabaseAccessor.deleteData(gradingScales.key);
  };

  //resetLocalStorage();

  var printList = function(list, location) {
    var idList = location + " ";
    for( var i=0; i<list.length; i++) {
      idList += list[i].id;
      idList += ", ";
    }
    console.log(idList);
  }


  var getInitialDataList = function (key) {
    var dataList = DatabaseAccessor.getDataObject(key);
    if(dataList == undefined){
      dataList = [];
      DatabaseAccessor.setDataObject(key, dataList);
    }
    return dataList;
  };

  gradingScalesRefrence.list = getInitialDataList(gradingScalesRefrence.key);
  gradingScales.list = getInitialDataList(gradingScales.key);

  var updateDataList = function(dataList) {
    DatabaseAccessor.setDataObject(dataList.key, dataList.list);
  }

  var createInitialGradingScale = function() {
    initialGradingScale = createGradingScale("Default Grading Scale");
    createGrade(initialGradingScale.id, "A+", 4.333);
    createGrade(initialGradingScale.id, "A", 4.00);
    createGrade(initialGradingScale.id, "A-", 3.667);
    createGrade(initialGradingScale.id, "B+", 3.333);
    createGrade(initialGradingScale.id, "B", 3.00);
    createGrade(initialGradingScale.id, "B-", 2.667);
    createGrade(initialGradingScale.id, "C+", 2.333);
    createGrade(initialGradingScale.id, "C", 2.00);
    createGrade(initialGradingScale.id, "C-", 1.667);
    createGrade(initialGradingScale.id, "D+", 1.333);
    createGrade(initialGradingScale.id, "D", 1.00);
    createGrade(initialGradingScale.id, "D-", 0.667);
    createGrade(initialGradingScale.id, "F", 0.0);
  }

  var getInitialGradingScale = function() {
    if(initialGradingScale == undefined) {
        //printList(gradingScales.list + "getInitialGradingScale");
      initialGradingScale =  gradingScales.list.find(function(object) {
          console.log("looking for default scale: "+object.name);
          return object.name == "Default Grading Scale";
      });
      if(initialGradingScale == undefined)
        createInitialGradingScale();
    }
    return initialGradingScale;
  }

  var getInitialGradingScaleID = function() {
    return getInitialGradingScale().id;
  }

  var addGradingScale = function(newObject) {
    var listObject = gradingScales;
    listObject.list.push(newObject);
    updateDataList(listObject);
  }

  var getGradingScale = function(gradingScaleID) {
    var objectList = gradingScales.list;
    return objectList.find(function(object) {
        return object.id == gradingScaleID;
    });
  }

  // var deleteGradingScale = function(objectID) {
  //   var listObject = getListObject(objectID);
  //   var objectIndex = listObject.list.indexOf(objectID);
  //   listObject.list.splice(objectIndex, 1);
  //   updateDataList(listObject);
  // }

  var getAssociatedGradingScale = function(gradebookID) {
    var gradingScaleIndex =  gradingScalesRefrence.list.findIndex(function(object) {
        return object.id == gradebookID;
    });
    return getGradingScale(gradingScalesRefrence.list[gradingScaleIndex].gradingScaleID);
  }

  var addNewAssociation = function(gradebookID, gradingScaleID) {
    var newAssociation = { gradebookID: "",
                            gradingScaleID:""};
    newAssociation.gradebookID = gradebookID;
    newAssociation.gradingScaleID = gradingScaleID;
    gradingScalesRefrence.list.push(newAssociation);
    updateDataList(gradingScalesRefrence);
  }

  var deleteAssociation = function(gradebookID) {
    var gradingScaleIndex =  gradingScalesRefrence.list.findIndex(function(object) {
        return object.id == gradebookID;
    });
    gradingScalesRefrence.list.splice(gradingScaleIndex, 1);
    updateDataList(gradingScalesRefrence);
  }

  var updateAssociation = function(gradebookID, gradingScaleID) {
    var gradingScaleIndex =  gradingScalesRefrence.list.findIndex(function(object) {
        return object.id == gradebookID;
    });
    gradingScalesRefrence.list[gradingScaleIndex].gradingScaleID = gradingScaleID;
    updateDataList(gradingScalesRefrence);
  }

  var createGradingScale = function (gradingScaleName) {
    var newID = IDGenerator.getNewID("scale");
    var newGradingScale = { id: "",
                            name:"",
                            grades:[] };
    newGradingScale.id = newID;

    if(gradingScaleName != undefined)
      newGradingScale.name = gradingScaleName;

    //gradingScales.list.push(newGradingScale);
    addGradingScale(newGradingScale);
    console.log("new scale id: "+newGradingScale.id + "new scale name: "+newGradingScale.name);
    //printList(gradingScales.list + "createGradingScale");
    return newGradingScale;
  }

  var createGrade = function (gradingScaleID, gradeName, gradePoints) {
    var newID = IDGenerator.getNewID("grade");
    var newGrade = {  id: "",
                      name:"",
                      points:0.00};
    newGrade.id = newID;

    if(gradeName != undefined)
      newGrade.name = gradeName;

    if(gradePoints != undefined)
      newGrade.points = gradePoints;

    var currentGradingScale = getGradingScale(gradingScaleID);
    currentGradingScale.grades.push(newGrade);
    console.log("grade pushed to: "+currentGradingScale.id);

    return newGrade;
  }

  return {
    getInitialGradingScale: getInitialGradingScale,
    getInitialGradingScaleID: getInitialGradingScaleID,
    addGradingScale: addGradingScale,
    getGradingScale: getGradingScale,
    getAssociatedGradingScale: getAssociatedGradingScale,
    addNewAssociation: addNewAssociation,
    deleteAssociation: deleteAssociation,
    updateAssociation: updateAssociation,
    createGradingScale: createGradingScale,
    createGrade: createGrade
  }
})

//create grading scale
//add watch to grade so that it watches the grading scale to update its grade


.factory('AppCalculator', function(AppManager, GradebookManager, TermManager) {
  return {
    calculateCumulativeData: function (gradebookID) {
      var currentGradebook = AppManager.getObject(gradebookID);
      var gradebookTerms = GradebookManager.getTerms(gradebookID);

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
    calculateTermData: function (termID) {
      var currentTerm = AppManager.getObject(termID);
      var termCourses = TermManager.getCourses(termID);

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

.factory('IDGenerator', function(DatabaseAccessor) {
  var baseKey = "nextID";

  var resetLocalStorage = function () {
    DatabaseAccessor.deleteData(baseKey+"_gradebook");
    DatabaseAccessor.deleteData(baseKey+"_term");
    DatabaseAccessor.deleteData(baseKey+"_course");
    DatabaseAccessor.deleteData(baseKey+"_scale");
    DatabaseAccessor.deleteData(baseKey+"_grade");
  };

  //resetLocalStorage();

  return {
    getNewID: function (idType) {
      key = baseKey + "_" + idType;
      var IDData = DatabaseAccessor.getData(key);
      var currentID = parseInt(IDData);
      console.log("gotten ID number: " + currentID + " for key: " +key);
      if(IDData == undefined){
        currentID = 0;
      }
      var nextID = currentID + 1;
      DatabaseAccessor.setData(key, "" + nextID);
      console.log("current ID number: " + idType + currentID);
      console.log("next ID number: " + idType + nextID);
      return idType +"_" + currentID;
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
    },
    deleteData: function (key) {
      localStorage.removeItem(key);
    }
  }
});
