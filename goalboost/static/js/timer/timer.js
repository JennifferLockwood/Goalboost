
function getScriptParams() {
    var scripts = document.getElementsByTagName('script');
    var lastScript = scripts[scripts.length - 1];
    var scriptName = lastScript;
    return {
        userId: scriptName.getAttribute('data-userId'),
    }
}

var timerApp = angular.module('timerApp', []);

// Save it here while in scope so can  be used by controller.  It was a long road passing one stupid variable
// from the page but we have finally arrived (almost)
var g_userId = getScriptParams().userId;

angular.module('timerApp', ["ngSanitize"]).filter('checkEmpty',function($sce){
        return function(input){
            if(angular.isString(input) && !(angular.equals(input,null) || angular.equals(input,'')))
                return input;
            else
                return $sce.trustAsHtml('&nbsp;');
        };
    });

angular.module('timerApp').filter("formatTime", function() {
    return function (timeInSeconds) {
        // Left-zero padding for minutes, seconds, etc.
        var pad = function(n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        };
        var hours = 0;
        var minutes = 0;
        var seconds= timeInSeconds % 60;
        //var suffix = "seconds";
        var timeStr = pad(seconds, 2, 0);
        if (timeInSeconds >= 60) {
            minutes = Math.floor(timeInSeconds /60) % 60;
            timeStr = pad(minutes, 2, 0) + ":" + timeStr;
            // suffix = "minutes";
        }
        else {
            timeStr = pad("00", 2, 0) + ":" + timeStr;
        }
        if (timeInSeconds >= 3600) {
            hours = Math.floor(timeInSeconds / 3600);
            timeStr = hours + ":" + timeStr;
            //  suffix = "hours";
        }

        return timeStr; // + " " + suffix;
    }
});

angular.module('timerApp').factory("timerListModel", ["$interval", "$http", function($interval, $http) {
    var model = {};
    model.theInterval = undefined;
    model.userId = "561dcd3c8c57cf2c17b7f4f9";
    if(g_userId != '') {
        model.userId = g_userId;
    }
    model.timers = [];
    model.$scope = null;

    model.setScope = function(scope) {
        model.$scope = scope;
    }

    model.startTimer = function() {
        if ( angular.isDefined(model.theInterval) )
            return;
        model.theInterval = $interval(model.onIntervalTick, 1000);
        model.timers[0].running = true;
        model.saveTimerToServer(0);
    }

    model.stopTimer = function() {

        if ( angular.isDefined(model.theInterval) ) {
            $interval.cancel(model.theInterval);
        }
        model.theInterval = undefined;
        if(model.timers.length > 0 && model.timers[0].running == true) {
            model.timers[0].running = false;
            model.saveTimerToServer(0);
        }
    }

    model.totalTimerTime = function(index) {
        return model.timers[index].entries.reduce(function(a, b) { return a.seconds + b.seconds });
    }

    model.onIntervalTick = function() {
        model.timers[0].entries[0].seconds++;
    }

    model.activateTimer = function (index) {
        t = model.timers[index];
        model.timers.splice(index, 1);
        t.lastRestart = new Date().toISOString();
        t.startTime = t.lastRestart;
        model.timers.unshift(t);
        model.saveTimerToServer(0);
    }

    model.deleteTimer = function(index) {
        $http({
            method: 'DELETE',
            url: '/api/timer/' + model.timers[index].id
            //data: model.timers[index]
        }).then(function successCallback(response) {
            //model.timers[index] = response.data;
            console.log("Delete successful.");
            model.timers.splice(index, 1);
        }, function errorCallback(response) {
            console.log(response);
            //alert("Unable to delete timer");
        });
    }

    model.saveTimerToServer = function(index) {
        console.log("saveTimerToServer with index = " + index);
        //console.log("Before save: " + JSON.stringify(model.timers[index], null, 4));
        $http({
            method: 'POST',
            method: 'POST',
            url: '/api/timer',
            data: model.timers[index]
        }).then(function successCallback(response) {
            model.timers[index] = response.data;
          //  console.log("After save: " + JSON.stringify(model.timers[index], null, 4));
        }, function errorCallback(response) {
            console.log(response);
            alert("Unable to save timer");
        });
    }

    model.getMidnightTodayAsString = function () {
        d = new Date();
        d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0,0);
        return d2.toISOString();
    }

    model.getDefaultTimer = function() {
        timer = {"entries": [{
                "dateRecorded": "",
                "seconds": 0}],
            "lastRestart": "",
            "notes": "",
            "running": false,
            "startTime": "",
            "userId": ""
        };
        today = model.getMidnightTodayAsString();
        timer.entries[0].dateRecorded = today;
        timer.lastRestart = today;
        timer.startTime = today;
        timer.userId = model.userId;
        return timer
    }

    model.init = function() {
        console.log("Inside init...");
        $http({
            method: 'GET',
            url: '/api/user/' + model.userId + "/timers"
        }).then(function successCallback(response) {
            model.timers = response.data;
            /*if (model.timers.length == 0) {
                model.createNewTimer();
            }*/

        }, function errorCallback(response) {
            alert("Unable to get timers from server ");
            console.log(response);
        });
    }

    model.createNewTimer = function() {
        model.timers.unshift(model.getDefaultTimer());

    }

    return model;
}]);

angular.module('timerApp').controller('TimerController', ['$scope', 'timerListModel', function($scope, timerListModel) {
    //$scope.someTimerValue = 99;
    //$scope.timeFormatter = new TimeFormatter();
    $scope.timeFormatted = "0:00:00" ; // $scope.timeFormatter.formatSeconds(1);
    $scope.startButtonClass = "success";
    $scope.startButtonText = "Start";
    $scope.timers_json = $scope.timers;
    $scope.startDisplayed = true;
    $scope.timerListModel = timerListModel;
    $scope.timerListModel.setScope($scope);
    $scope.timerClass = " ";

    $scope.startTimer = function()  {
        console.log("$scope.startTimer");
        $scope.startButtonClass = "alert";
        $scope.startButtonText = "Stop";
        $scope.timerListModel.startTimer();
        $scope.startEnabled = false;
        $scope.stopEnabled = true;
        $scope.timerClass = "runningTimer"
    }
    $scope.stopTimer = function()  {
        $scope.timerClass = " ";
        console.log("$scope.stopTimer");
        $scope.startButtonText = "Start";
        $scope.startButtonClass = "success";
        $scope.startEnabled = true;
        $scope.stopEnabled = false;
        $scope.timerListModel.stopTimer();
    }

    $scope.$watch('startDisplayed', function(){
        $scope.startDisplayed ?  $scope.stopTimer() : $scope.startTimer() ;
    });

    $scope.activateTimer = function(index) {
        $scope.stopTimer();
        //$scope.timerListModel.activateTimer(index);
        setTimeout(function() {
            $scope.timerListModel.activateTimer(index);
            $scope.$apply(); //this triggers a $digest
        }, 500);
    }

    // TODO if active LegacyTimer, should stop it first?
    $scope.deleteTimer = function(index) {
        if(confirm("Delete timer, are you sure?")) {
            setTimeout(function () {
                if (index == 0) {
                    $scope.stopTimer();
                }
                $scope.timerListModel.deleteTimer(index);
                $scope.$apply(); //this triggers a $digest
            }, 500);
        }
    }


    $scope.isEmpty = function(input) {
        return (angular.equals(input,null) || angular.equals(input,''));
    }

    $scope.timerListModel.init();

    $scope.createNewTimer = function() {
        $scope.stopTimer();
        setTimeout(function() {
            $scope.timerListModel.timers.unshift($scope.timerListModel.getDefaultTimer());
            $scope.$apply(); //this triggers a $digest
        }, 500);
    }

    $scope.noOp = function() {
        console.log("noOp");
    }

    $scope.getLatestTimerDate = function(timer) {
        var longDate = timer.entries[timer.entries.length - 1 ].dateRecorded;

        //return longDate;

        var mm = longDate.substr(5,2);
        var yyyy = longDate.substr(0, 4);
        var dd = longDate.substr(8,2);

        return mm + "/" + dd + "/" + yyyy;

    }

}]);
