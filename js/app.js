(function() {
    "use strict";
    /*
     * An array of US state abbreviations -> names. This should ideally
     * be data in an external resource like a DB or something, but for simplicity
     * hard coding here.
     */
    const usStates = {
        AL: "ALABAMA",AK: "ALASKA",AS: "AMERICAN SAMOA",AZ: "ARIZONA",AR: "ARKANSAS",CA: "CALIFORNIA",CO: "COLORADO",
        CT: "CONNECTICUT",DE: "DELAWARE",DC: "DISTRICT OF COLUMBIA",FM: "FEDERATED STATES OF MICRONESIA",FL: "FLORIDA",
        GA: "GEORGIA",GU: "GUAM",HI: "HAWAII",ID: "IDAHO",IL: "ILLINOIS",IN: "INDIANA",IA: "IOWA",KS: "KANSAS",KY: "KENTUCKY",
        LA: "LOUISIANA",ME: "MAINE",MH: "MARSHALL ISLANDS",MD: "MARYLAND",MA: "MASSACHUSETTS",MI: "MICHIGAN",MN: "MINNESOTA",
        MS: "MISSISSIPPI",MO: "MISSOURI",MT: "MONTANA",NE: "NEBRASKA",NV: "NEVADA",NH: "NEW HAMPSHIRE",NJ: "NEW JERSEY",
        NM: "NEW MEXICO",NY: "NEW YORK",NC: "NORTH CAROLINA",ND: "NORTH DAKOTA",MP: "NORTHERN MARIANA ISLANDS",OH: "OHIO",
        OK: "OKLAHOMA",OR: "OREGON",PW: "PALAU",PA: "PENNSYLVANIA",PR: "PUERTO RICO",RI: "RHODE ISLAND",SC: "SOUTH CAROLINA",
        SD: "SOUTH DAKOTA",TN: "TENNESSEE",TX: "TEXAS",UT: "UTAH",VT: "VERMONT",VI: "VIRGIN ISLANDS",VA: "VIRGINIA",
        WA: "WASHINGTON",WV: "WEST VIRGINIA",WI: "WISCONSIN",WY: "WYOMING"
    };

    angular.module('contactApp', ['ngRoute', 'LocalStorageModule', 'ngMap'])
        .config(function($routeProvider, $locationProvider) {

            $routeProvider.when('/', {
                templateUrl: 'views/contactList.html',
                controller: 'contactListController'
            }).when('/contact', {
                templateUrl: 'views/contact.html',
                controller: 'contactController'
            }).when('/contact/:id', {
                templateUrl: 'views/contact.html',
                controller: 'contactController'
            });
            $locationProvider.html5Mode(false);
            $locationProvider.hashPrefix('!');
        })
        .directive('cswFileInput', function() {
            return {
                restrict: 'A',
                scope: {
                    data: '=fileData'
                },
                link: function(scope, element) {
                    element.on('change', function(domEvent) {
                        let reader = new FileReader();
                        reader.onload = function (fileReaderEvent) {
                            scope.$apply(function(scope) {
                                scope.data = fileReaderEvent.target.result;
                            });
                            angular.element(domEvent.target).val('');
                        };
                        reader.readAsDataURL(event.target.files[0]);
                    });
                }
            };
        })
        .config(function (localStorageServiceProvider) {
            localStorageServiceProvider
                .setPrefix('08724.hw5');
        })
        /* Reference : to handle possibly unhandled rejection console error.
         https://github.com/angular-ui/ui-router/issues/2889
         */
        .config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
        }])

        /*
        contactList Controller
         */
        .controller('contactListController', function($scope, localStorageService, $location) {
            $scope.submittedAddresses = [];

            /*
            Upon pressing Add Contact, append /contact to the URL
            and navigate to the contact page.
             */
            $scope.addContact = function () {
                $location.path("/contact");
            };

            /*
            Upon clicking the name, get the appropriate key index from
            the key set array and append it to the /contact/ URL to navigate
            to the corresponding contact's page.
             */
            $scope.change = function (index) {
                $location.path("/contact/" + localStorageService.keys()[index]);
            };

            /*
            Get data from localStorageService for each key index in the
            KeySet and populate the Contact List table via the submittedAddresses
            object.
             */
            for( var i = 0; i < localStorageService.keys().length; i++) {

                $scope.submittedAddresses.push(localStorageService.get(localStorageService.keys()[i]));
            }

            /*
             * Add a behavior to handle when the remove X is clicked
             */

            $scope.removeAddress = function(index) {
                localStorageService.remove(localStorageService.keys()[index]);
                $scope.submittedAddresses.splice(index, 1);
            };
        })


        /*
        contact Controller.
         */
        .controller('contactController', function($scope, localStorageService, $routeParams, $location) {
            $scope.stateOptions = usStates; //Available via closure
          /*
          If id in routeParams is not defined, then initialize address object to empty.
           */
            if(typeof $routeParams.id === 'undefined') {
                $scope.address = {};
            } else {
                /*
                if id exists, then retrieve the corresponding data from the localStorageService
                using the id as the key.
                 */
                $scope.address = localStorageService.get($routeParams.id);

            }

            /*
             * Add a behavior to handle when Submit is clicked.
             */
            $scope.submit = function() {
                /*
                 * If the same id is getting edited, then remove the old key and
                 * replace it with the new key in the localStorage.
                 */
                localStorageService.remove($routeParams.id);

                /*
                 * Using the first name and last name as the key, and the contents
                 * address object as the value in the localStorage.
                 */
                localStorageService.set($scope.address.firstName.toString() + $scope.address.lastName.toString(), ($scope.address));

                $location.path("");
            };
        });

})();