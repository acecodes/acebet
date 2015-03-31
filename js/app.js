var Main = (function() {

    'use strict';

    function AceBetController($resource) {
        var _this = this;

        var currencyPairs = {
            'USD/EUR': 'euro',
            'USD/JPY': 'jpy',
            'USD/GBP': 'gbp'
        };

        // Day for comparing date inputs - anything less will not submit
        this.today = new Date();

        // Syncano's required variables
        var syncano = SyncanoConnector.getInstance();
        var projectId = 6588;
        var collectionId = 19160;

        var authData = {
            // Get your own auth data!
        };

        syncano.connect(authData, function(auth) {
            console.log("Connected");
        });

        var params = {
            include_children: true,
        };

        function predictionCounter(folder, div) {
            var optional_params = {
                folders: folder
            };
            syncano.Data.count(projectId, collectionId, optional_params, function(data) {
                $('#' + div).text(data);
            });
        }

        function predictionGetter(folder, div) {
            syncano.Data.get(projectId, collectionId, params, function(data) {
                data.forEach(function(d) {
                    if (d.folder === folder) {
                        var date = new Date(d.additional.prediction_date).toDateString();
                        $('#' + div).text(d.additional.prediction);
                        $('#' + div + '-date').text(date);
                    }
                });
            });
        }


        // Pull latest predictions and prediction counts from Syncano backend
        predictionGetter('USD/EUR', 'euro-latest-bet');
        predictionGetter('USD/JPY', 'jpy-latest-bet');
        predictionGetter('USD/GBP', 'gbp-latest-bet');

        predictionCounter('USD/EUR', 'euro-num-bets');
        predictionCounter('USD/JPY', 'jpy-num-bets');
        predictionCounter('USD/GBP', 'gbp-num-bets');


        syncano.on('syncano:authorized', function() {
            syncano.Subscription.subscribeProject(projectId, function(result) {});
            console.log('Subscribed');
        });

        // Listen for changes and update as needed
        syncano.on('syncano:newdata:project-' + projectId, function(data) {
            console.log("Received Data:");
            var dataPoint = data[0];
            var dataFolder = dataPoint.folder;
            var prediction = dataPoint.additional.prediction;
            var predictionDate = new Date(dataPoint.additional.prediction_date).toDateString();
            if (predictionDate !== ';drop table;') {
                console.log(data[0]);
                if (dataFolder === 'USD/EUR') {
                    $("#euro-latest-bet").text(prediction);
                    $("#euro-latest-bet-date").text(predictionDate);
                    predictionCounter('USD/EUR', 'euro-num-bets');
                } else if (dataFolder === 'USD/JPY') {
                    $("#jpy-latest-bet").text(prediction);
                    $("#jpy-latest-bet-date").text(predictionDate);
                    predictionCounter('USD/JPY', 'jpy-num-bets');
                } else if (dataFolder === 'USD/GBP') {
                    $("#gbp-latest-bet").text(prediction);
                    $("#gbp-latest-bet-date").text(predictionDate);
                    predictionCounter('USD/GBP', 'gbp-num-bets');
                }
            }

        });

        // Syncano functions
        this.createBet = function createBet(title, currencyPair, prediction, predictionDate) {

            var params = {
                title: title,
                state: 'Moderated',
                folder: currencyPair,
                additional: {
                    prediction: prediction,
                    prediction_date: predictionDate
                }
            };

            syncano.Data.new(projectId, collectionId, params, function(data) {
                if (data.additional.prediction_date !== ';drop table;') {
                    console.log(data);
                    var date = new Date(data.additional.prediction_date).toDateString();
                    var div = '#' + currencyPairs[currencyPair];
                    var count = $(div + '-num-bets').text();
                    $(div + '-latest-bet').html(data.additional.prediction);
                    $(div + '-num-bets').html(Number(count) + 1);
                    $(div + '-latest-bet-date').text(date);
                }
            });
        };

        this.getBets = function getBets(currencyPair) {
            var params = {
                include_children: true,
                folders: currencyPair
            };

            syncano.Data.get(projectId, collectionId, params, function(data) {
                console.log('Received', data.length, 'objects');
                data.forEach(function(d) {
                    console.log(d);
                });
            });
        };


        // Angular section
        this.EUR = 'Price unavailable';
        this.JPY = 'Price unavailable';
        this.GBP = 'Price unavailable';

        var Currency = $resource('https://openexchangerates.org/api/latest.json?app_id=3c350b71f4e249f1a01c7573fb3b9998', {});
        var currencies = Currency.get(function() {
            _this.EUR = currencies.rates.EUR;
            _this.JPY = currencies.rates.JPY;
            _this.GBP = currencies.rates.GBP;

            // Fill forms with default values for ease of use
            $("#formEURPrice").val(_this.EUR);
            $("#formJPYPrice").val(_this.JPY);
            $("#formGBPPrice").val(_this.GBP);
        });

    }

    AceBetController.$inject = ['$resource'];

    angular
        .module('app', ['ngResource'])
        .directive('acebet', function() {
            return {
                bindToController: true,
                controller: AceBetController,
                controllerAs: 'app',
            };
        });

})();