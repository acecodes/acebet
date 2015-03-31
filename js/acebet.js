(function() {

    'use strict';

    function AceBetController($resource) {
        var _this = this;

        // Syncano's required variables
        var syncano = SyncanoConnector.getInstance();
        var projectId = 6588;
        var collectionId = 19160;

        var currencyPairs = {
            'USD/EUR':'euro',
            'USD/JPY':'jpy',
            'USD/GBP':'gbp'
        };

        this.today = new Date();
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
                console.log(data);
                var date = new Date(data.additional.prediction_date).toDateString();
                var div = '#' + currencyPairs[currencyPair];
                var count = $(div + '-num-bets').text();
                $(div + '-latest-bet').html(data.additional.prediction);
                $(div + '-num-bets').html(Number(count) + 1);
                $(div + '-latest-bet-date').text(date);
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