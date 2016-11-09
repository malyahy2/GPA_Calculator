angular.module('gpaCalc.services', [])

.factory('HomeReference', function(DatabaseAccessor) {
  var key = "Home";
  var initialHome = { state: "gradebooks", stateParams: null};
  return {
    setHome: function (home) {
      DatabaseAccessor.setDataObject(key, home);
    },
    getHome: function() {
      var home = DatabaseAccessor.getDataObject(key);
      if(home != undefined){
        return home;
      } else {
        home = initialHome;
        DatabaseAccessor.setDataObject(key, home);
        return home;
      }
    },
    deleteHome: function() {
      DatabaseAccessor.deleteData(key);
    }
  }
})

.factory('SettingsReference', function(DatabaseAccessor, HomeReference, AppManager, GradingScaleManager, IDGenerator) {
  var key = "settings";

  var settings = DatabaseAccessor.getDataObject(key);
  if(settings == undefined){
    settings = { defaultNames: true};
    DatabaseAccessor.setDataObject(key, settings);
  }

  return {
    useDefaultNames: function () {
      return settings.defaultNames;
    },
    setDefaultNamesUsage: function (setting) {
      settings.defaultNames = setting;
      DatabaseAccessor.setDataObject(key, settings);
    },
    deleteEverything: function() {
      DatabaseAccessor.deleteData(key);
      HomeReference.deleteHome();
      AppManager.resetLocalStorage();
      GradingScaleManager.resetLocalStorage();
      IDGenerator.resetLocalStorage();
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
    //var objectIndex = listObject.list.indexOf(updatedObject.id);
    //listObject.list[objectIndex] = updatedObject;
    updateDataList(listObject);
  }

  var deleteObject = function(objectID) {
    var listObject = getListObject(objectID);
    // console.log("listobject: "+listObject.key +"for ID: "+objectID);
    var objectIndex = listObject.list.findIndex(function(object) {
        return object.id == objectID;
    });
    // console.log("objectIndex: "+objectIndex);
    // console.log("listObject.list length: "+listObject.list.length);
    // console.log("deleteing: "+listObject.list[objectIndex].id);
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
    getGradebooks: getGradebooks,
    resetLocalStorage: resetLocalStorage
  }
})

.factory('GradebookManager', function(AppManager, IDGenerator, GradingScaleManager, AppCalculator, TermManager, CourseManager) {
  var updateName = function (gradebookID, newName) {
    var currentGradebook = AppManager.getObject(gradebookID);
    currentGradebook.name = newName;
    AppManager.updateObject(currentGradebook);
  }

  var getGradebook = function (gradebookID) {
    var gottenGradebook = AppManager.getObject(gradebookID);
    //console.log("gotten gradebook: "+gottenGradebook.id)
    return gottenGradebook;
  }

  var createTerm = function (gradebookID, termName) {
  //console.log("createTerm Service name: "+termName);
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
      newTerm.name = termName;

    var currentGradebook = AppManager.getObject(gradebookID);
      //console.log("createTerm gradebook: "+currentGradebook.id);
      //console.log("createTerm term: "+newTerm.id);
    currentGradebook.terms.push(newTerm.id);
    //console.log("createTerm termsList: "+currentGradebook.terms);
    AppManager.updateObject(currentGradebook);
    return newTerm;
  }

  var getTerms = function (gradebookID) {
    var currentGradebook = AppManager.getObject(gradebookID);
      //console.log("getTerms gradebook: "+currentGradebook.id);
        //console.log("getTerms gradebook terms: "+currentGradebook.terms);
    var termsObjects = [];
    for(var i=0; i<currentGradebook.terms.length; i++){
      //console.log("getting term from gradebook: "+currentGradebook.id)
      var gottenTerm = AppManager.getObject(currentGradebook.terms[i]);
      termsObjects.push(gottenTerm);
      //console.log("gotten term: "+gottenTerm.id)
    }
    return termsObjects;
  }

  var deleteGradebook = function (gradebookID) {
    var currentGradebook = AppManager.getObject(gradebookID);
    for(var i=0; i<currentGradebook.terms.length; i++){
      TermManager.deleteTerm(currentGradebook.terms[i]);
    }
    GradingScaleManager.deleteAssociation(gradebookID);
    AppManager.deleteObject(gradebookID);
  }

  var copyTerm = function (termID, gradebookID) {
    var copiedTerm = AppManager.getObject(termID);
    var copiedToGradebook;
    if(gradebookID == undefined)
      copiedToGradebook =  AppManager.getParentObject(termID);
    else
      copiedToGradebook =  AppManager.getObject(gradebookID);
    var newTerm = createTerm(copiedToGradebook.id, copiedTerm.name+" - COPY");
    for(var i=0; i<copiedTerm.courses.length; i++) {
      CourseManager.copyCourse(copiedTerm.courses[i], newTerm.id);
    }
    return newTerm;
  }

  var copyGradebook = function (gradebookID) {
    var copiedGradebook = AppManager.getObject(gradebookID);
    var newGradebook = AppManager.createGradebook(copiedGradebook.name+" - COPY");
    for(var i=0; i<copiedGradebook.terms.length; i++) {
      copyTerm(copiedGradebook.terms[i], newGradebook.id);
    }
    return newGradebook;
  }

  var setInitialData = function(gradebookID, initialGPA, initialHours) {
    var currentGradebook = AppManager.getObject(gradebookID);
    currentGradebook.initialGPA = initialGPA;
    currentGradebook.initialHours = initialHours;
    AppCalculator.calculateCumulativeData(gradebookID);
  }

  return {
    updateName: updateName,
    getGradebook: getGradebook,
    createTerm: createTerm,
    getTerms: getTerms,
    deleteGradebook: deleteGradebook,
    copyTerm: copyTerm,
    copyGradebook: copyGradebook,
    setInitialData: setInitialData
  }
})

.factory('TermManager', function(AppManager, IDGenerator, AppCalculator) {
  var updateName =  function (termID, newName) {
    var currentTerm = AppManager.getObject(termID);
    currentTerm.name = newName;
    AppManager.updateObject(currentTerm);
  }

  var getTerm = function (termID) {
    var gottenTerm = AppManager.getObject(termID);
    //console.log("gotten term: "+gottenTerm.id)
    return gottenTerm;
  }

  var createCourse = function (termID, courseName) {
    var newID = IDGenerator.getNewID("course");
    var newCourse = { id: "",
                      name:"",
                      grade: null,
                      hours:null};
    newCourse.id = newID;
    AppManager.addObject(newCourse);

    if(courseName != undefined)
      newCourse.name = courseName;

    var currentTerm = AppManager.getObject(termID);
    currentTerm.courses.push(newCourse.id);
    AppManager.updateObject(currentTerm);
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

  var deleteTerm = function (termID) {
    var parentGradebook = AppManager.getParentObject(termID);
    var termIndex = parentGradebook.terms.indexOf(termID);
    parentGradebook.terms.splice(termIndex, 1);
    AppManager.updateObject(parentGradebook);

    var currentTerm = AppManager.getObject(termID);
    for(var i=0; i<currentTerm.courses.length; i++){
      AppManager.deleteObject(currentTerm.courses[i]);
    }

    AppManager.deleteObject(termID);
  }

  var moveTerm = function (termID, newGradebookID) {
    var oldGradebook = AppManager.getParentObject(termID);
    var termIndex = oldGradebook.terms.indexOf(termID);
    oldGradebook.terms.splice(termIndex, 1);
    AppManager.updateObject(oldGradebook);

    var newGradebook = AppManager.getObject(newGradebookID);
    newGradebook.terms.push(termID);
    AppManager.updateObject(newGradebook);

    AppCalculator.calculateCumulativeData(oldGradebook.id);
    AppCalculator.calculateCumulativeData(newGradebookID);
  }

  var getGradebook = function(temID) {
    return AppManager.getParentObject(temID);
  }

  return {
    updateName: updateName,
    getTerm: getTerm,
    createCourse: createCourse,
    getCourses: getCourses,
    deleteTerm: deleteTerm,
    moveTerm: moveTerm,
    getGradebook: getGradebook
  }
})

.factory('CourseManager', function(AppManager, AppCalculator, TermManager) {
  var updateGrade = function (courseID, newGrade) {
    var currentCourse = AppManager.getObject(courseID);
    currentCourse.grade = newGrade;
    AppManager.updateObject(currentCourse);
    if(currentCourse.grade != 0 && currentCourse.hours != 0 && currentCourse.grade != null && currentCourse.hours != null){
      AppCalculator.calculateTermData(AppManager.getParentObject(courseID).id);
      AppCalculator.calculateCumulativeData(AppManager.getParentObject(AppManager.getParentObject(courseID).id).id);
    }
  }

  var updateHours = function (courseID, newHours) {
    var currentCourse = AppManager.getObject(courseID);
    currentCourse.hours = newHours;
    AppManager.updateObject(currentCourse);
    if(currentCourse.grade != 0 && currentCourse.hours != 0 && currentCourse.grade != null && currentCourse.hours != null){
      AppCalculator.calculateTermData(AppManager.getParentObject(courseID).id);
      AppCalculator.calculateCumulativeData(AppManager.getParentObject(AppManager.getParentObject(courseID).id).id);
    }
  }

  return {
    updateName: function (courseID, newName) {
      var currentCourse = AppManager.getObject(courseID);
      currentCourse.name = newName;
      AppManager.updateObject(currentCourse);
    },
    updateGrade:updateGrade,
    updateHours:updateHours,
    deleteCourse: function (courseID) {
      var parentTerm = AppManager.getParentObject(courseID);
      var courseIndex = parentTerm.courses.indexOf(courseID);
      parentTerm.courses.splice(courseIndex, 1);
      AppManager.updateObject(parentTerm);

      AppCalculator.calculateTermData(parentTerm.id);
      AppCalculator.calculateCumulativeData(AppManager.getParentObject(parentTerm.id).id);
      AppManager.deleteObject(courseID);
    },
    moveCourse: function (courseID, newTermID) {
      var oldTerm = AppManager.getParentObject(courseID);
      var courseIndex = oldTerm.courses.indexOf(courseID);
      oldTerm.courses.splice(courseIndex, 1);
      AppManager.updateObject(oldTerm);

      var newTerm = AppManager.getObject(newTermID);
      newTerm.courses.push(courseID);
      AppManager.updateObject(newTerm);

      AppCalculator.calculateTermData(oldTerm.id);
      AppCalculator.calculateTermData(newTermID);
    },
    copyCourse: function (courseID, termID) {
      var copiedCourse = AppManager.getObject(courseID);
      var copiedToTerm;
      if(termID == undefined)
        copiedToTerm =  AppManager.getParentObject(courseID);
      else
        copiedToTerm =  AppManager.getObject(termID);
      var newCourse = TermManager.createCourse(copiedToTerm.id, copiedCourse.name+" - COPY");
      updateGrade(newCourse.id, copiedCourse.grade);
      updateHours(newCourse.id, copiedCourse.hours);
      return newCourse;
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
          //console.log("looking for default scale: "+object.name);
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
        return object.gradebookID == gradebookID;
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
      // console.log("looking for: "+gradebookID+" and found: "+object.gradebookID+" which is associated with: "+object.gradingScaleID);
        return object.gradebookID == gradebookID;
    });
    // console.log("deleting index: "+gradingScaleIndex+" for: "+gradingScalesRefrence.list[gradingScaleIndex].gradebookID+" which is associated with: "+gradingScalesRefrence.list[gradingScaleIndex].gradingScaleID);
    gradingScalesRefrence.list.splice(gradingScaleIndex, 1);
    updateDataList(gradingScalesRefrence);
  }

  var updateAssociation = function(gradebookID, gradingScaleID) {
    var gradingScaleIndex =  gradingScalesRefrence.list.findIndex(function(object) {
        return object.gradebookID == gradebookID;
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
    //console.log("new scale id: "+newGradingScale.id + "new scale name: "+newGradingScale.name);
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
    updateDataList(gradingScales);
    //console.log("grade pushed to: "+currentGradingScale.id);

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
    createGrade: createGrade,
    resetLocalStorage: resetLocalStorage
  }
})

//create grading scale
//add watch to grade so that it watches the grading scale to update its grade


.factory('AppCalculator', function(AppManager) {
  var calculateTermData = function (termID) {
    var currentTerm = AppManager.getObject(termID);
    //var termCourses = TermManager.getCourses(termID);

    var termCourses = [];
    for(var i=0; i<currentTerm.courses.length; i++){
      termCourses.push(AppManager.getObject(currentTerm.courses[i]));
    }

    var termPoints = 0;
    var termHours = 0;
    for(var i=0; i<termCourses.length; i++){
      var currentCourse = termCourses[i];
      termPoints += (parseFloat(currentCourse.grade) * parseFloat(currentCourse.hours));
      termHours += parseFloat(currentCourse.hours);
    }
    currentTerm.hours = termHours;
    currentTerm.points = termPoints.toFixed(2);
    currentTerm.GPA = (termPoints / termHours).toFixed(2);
    AppManager.updateObject(currentTerm);
    return currentTerm;
  }

  return {
    calculateCumulativeData: function (gradebookID) {
      var currentGradebook = AppManager.getObject(gradebookID);
      //var gradebookTerms = GradebookManager.getTerms(gradebookID);

      var gradebookTerms = [];
      for(var i=0; i<currentGradebook.terms.length; i++){
        gradebookTerms.push(AppManager.getObject(currentGradebook.terms[i]));
      }

      var cumulativePoints = (parseFloat(currentGradebook.initialGPA) * parseFloat(currentGradebook.initialHours));
      var cumulativeHours = parseFloat(currentGradebook.initialHours);
      for(var i=0; i<gradebookTerms.length; i++){
        cumulativePoints += parseFloat(gradebookTerms[i].points);
        cumulativeHours += parseFloat(gradebookTerms[i].hours);
      }
      currentGradebook.hours = cumulativeHours;
      currentGradebook.GPA = (cumulativePoints / cumulativeHours).toFixed(2);
      AppManager.updateObject(currentGradebook);
      return currentGradebook;
    },
    updateCumulativeData: function (termID) {
      var currentTerm = AppManager.getObject(termID);
      var oldTermPoints = parseFloat(currentTerm.points);
      var oldTermHours = parseFloat(currentTerm.hours);
      console.log("termID= "+termID);
      console.log("oldTermPoints= "+oldTermPoints);
      console.log("oldTermHours= "+oldTermHours);

      var parentGradebook = AppManager.getParentObject(termID);
      var oldCumulativeHours = parseFloat(parentGradebook.hours);
      var oldCumulativePoints = parseFloat(parentGradebook.GPA) * oldCumulativeHours;
      console.log("parentGradebook= "+parentGradebook.id);
      console.log("oldCumulativeHours= "+oldCumulativeHours);
      console.log("oldCumulativePoints= "+oldCumulativePoints);

      currentTerm = calculateTermData(termID);

      parentGradebook.hours = (oldCumulativeHours - oldTermHours + parseFloat(currentTerm.hours));
      parentGradebook.GPA = ((oldCumulativePoints - oldTermPoints + parseFloat(currentTerm.points)) / parseFloat(parentGradebook.hours)).toFixed(2);
      console.log("parentGradebook.hours= "+parentGradebook.hours);
      console.log("parentGradebook.GPA= "+parentGradebook.GPA);
      AppManager.updateObject(parentGradebook);
      return parentGradebook;
    },
    calculateTermData: calculateTermData
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
      //console.log("gotten ID number: " + currentID + " for key: " +key);
      if(IDData == undefined){
        currentID = 0;
      }
      var nextID = currentID + 1;
      DatabaseAccessor.setData(key, "" + nextID);
      //console.log("current ID number: " + idType + currentID);
      //console.log("next ID number: " + idType + nextID);
      return idType +"_" + currentID;
    },
    resetLocalStorage: resetLocalStorage
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
      console.log(window.localStorage.getItem(key));
      return JSON.parse( window.localStorage.getItem(key));
    },
    deleteData: function (key) {
      localStorage.removeItem(key);
    }
  }
});
