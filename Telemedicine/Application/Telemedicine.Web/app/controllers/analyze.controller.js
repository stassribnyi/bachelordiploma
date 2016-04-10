﻿(function () {
    'use strict';

    angular
        .module('app')
        .controller('AnalyzeController', analyzeController);

    analyzeController.$inject = ['$scope', 'Analyze', 'Doctor', 'Comment'];

    function analyzeController($scope, Analyze, Doctor, Comment) {
        $scope.isDesc = false;

        $scope.chartConfig = {
            options: {
                chart: {
                    zoomType: 'xy'
                },
                xAxis: {
                    title: {
                        text: 'Time'
                    }
                },
                yAxis: {
                    title: {
                        text: 'RR interval'
                    }
                },
                title: {
                    text: 'Electrocardiogram'
                },
                legend: {
                    enabled: false,
                    align: 'right',
                    verticalAlign: 'top',
                    layout: 'vertical',
                    x: 0,
                    y: 100
                },
                loading: false
            }
        };

        $scope.init = function (id) {
            Analyze.getAll({ id: id }, function (data) {

                //var n = angular.copy(data[0]);
                //n.id = 0;
                //n.patient = null;
                //n.ecg.id = 0;
                //n.comments.forEach(function (x) {
                //    x.id = 0;
                //});
                //n.ecg.comments.forEach(function (x) {
                //    x.id = 0;
                //});
                //n.ecg.datas.forEach(function (x) {
                //    x.id = 0;
                //});

                //Analyze.save({ patientId: $scope.analyze.patient.id }, n, function (data) {
                //    console.log(data);
                //});
                $scope.analyzes = sortAnalyzes(data).reverse();
                $scope.analyze = $scope.analyzes[$scope.analyzes.length - 1];
                $scope.chartConfig.subtitle = { text: $scope.analyze.patient.lastName + ' ' + $scope.analyze.patient.firstName + ' ' + $scope.analyze.patient.patronimic + ' from ' + moment($scope.analyze.lastMeasurement).format('MMMM Do YYYY, h:mm:ss a') }
                $scope.chartConfig.series = [{
                    name: 'ECG',
                    data: $scope.analyze.ecg.datas.map(function (element) {
                        return [element.time, element.rr];
                    }),
                }];
            });

            $scope.doctor = Doctor.getCurrent({}, function (data) {

            });
        };

        $scope.addComment = function (array) {
            array.comments.push({
                doctor: $scope.doctor,
                lastModified: new Date(),
                isEditable: true
            }
            );
        };

        $scope.saveComment = function (comment) {
            Analyze.saveComment({ id: $scope.analyze.id }, comment, function (data) {
                comment.id = data.id;
                comment.isEditable = false;
                comment.source = null;
            });
        }

        $scope.saveECGComment = function (comment) {
            Analyze.saveECGComment({ id: $scope.analyze.id }, comment, function (data) {
                comment.id = data.id;
                comment.isEditable = false;
                comment.source = null;
            });
        }

        $scope.updateECGComment = function (comment) {
            if (comment.id) {
                Comment.update({}, comment, function (data) {
                    comment.id = data.id;
                    comment.isEditable = false;
                    comment.source = null;
                });
            }
            else {
                $scope.saveECGComment(comment);
            }
        };

        $scope.editECGComment = function (comment) {
            var comments = $scope.analyze.ecg.comments;
            if (!comment.isEditable) {
                comment.source = angular.copy(comment);
                comment.isEditable = true;
            }
            else {
                if (!comment.id) {
                    removeElement(comments, comment)
                }
                else {
                    replaceById(comments, comment.id, angular.copy(comment.source));
                }
                comment.source = null;
            }
        };

        $scope.updateComment = function (comment) {
            if (comment.id) {
                Comment.update({}, comment, function (data) {
                    comment.id = data.id;
                    comment.isEditable = false;
                    comment.source = null;
                });
            }
            else {
                $scope.saveComment(comment);
            }
        };

        $scope.removeComment = function (id) {
            Comment.remove({ id: id }, function (data) {
                var comments = $scope.analyze.comments;
                removeElement(comments, findById(comments, id));
            });
        };

        $scope.editComment = function (comment) {
            var comments = $scope.analyze.comments;
            if (!comment.isEditable) {
                comment.source = angular.copy(comment);
                comment.isEditable = true;
            }
            else {
                if (!comment.id) {
                    removeElement(comments, comment)
                }
                else {
                    replaceById(comments, comment.id, angular.copy(comment.source));
                }
                comment.source = null;
            }
        };

        $scope.sort = function () {
            $scope.isDesc = !$scope.isDesc;
            $scope.analyzes = $scope.isDesc ? sortAnalyzes($scope.analyzes) : sortAnalyzes($scope.analyzes).reverse();
            $scope.analyze = $scope.analyzes[$scope.analyzes.length - 1];
        };

        $scope.nextAnalyze = function () {
            var index = $scope.analyzes.indexOf($scope.analyze);
            if (index !== -1 && index < $scope.analyzes.length - 1) {
                $scope.analyze = $scope.analyzes[index + 1]
            }
        };

        $scope.prevAnalyze = function () {
            var index = $scope.analyzes.indexOf($scope.analyze);
            if (index > 0) {
                $scope.analyze = $scope.analyzes[index - 1]
            }
        };

        //Helpers

        var findById = function (array, id) {
            return array.filter(function (item) {
                return item.id === id;
            })[0];
        };

        var replaceById = function (array, id, element) {
            var index = array.indexOf(findById(array, id));
            if (index !== -1) {
                array[index] = element;
            }

        };

        var removeElement = function (array, element) {
            var index = array.indexOf(element);
            if (index !== -1) {
                array.splice(index, 1);
            }
        };

        var sortAnalyzes = function (array) {
            return array.sort(function (a, b) {
                return new Date(b.lastMeasurement) - new Date(a.lastMeasurement);
            });
        }
    }
})();
