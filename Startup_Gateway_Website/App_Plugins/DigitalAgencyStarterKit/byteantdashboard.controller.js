angular.module('umbraco.resources').factory('byteAntDashboardResource',
    function ($q, $http, umbRequestHelper) {
        return {
            isSubmitted: function (userId) {
                return umbRequestHelper.resourcePromise(
                    $http.get("backoffice/ByteAntDashboard/ByteAntDashboardApi/IsStarterKitGuideFormSubmitted", {
                        params: { userId: userId }
                    }),
                    "Failed to get data");
            },
            contactUs: function (model) {
                return umbRequestHelper.resourcePromise(
                    $http.post("backoffice/ByteAntDashboard/ByteAntDashboardApi/ContactUs", model),
                    "Failed to submit the form");
            },
            getStarterKitGuide: function (model) {
                return umbRequestHelper.resourcePromise(
                    $http.post("backoffice/ByteAntDashboard/ByteAntDashboardApi/GetStarterKitGuide", model),
                    "Failed to submit the form");
            }
        };
    }
);
angular.module("umbraco").controller("byteAntDashboardController", function ($scope, $element, $timeout, userService, byteAntDashboardResource) {
    
    $scope.UserName = "Guest";
    $scope.UserEmail = "";
    $scope.UserId = 0;
    $scope.isSubmitted = false;
    $scope.isLoaderShown = true;

    userService.getCurrentUser().then(function (user) {
        $scope.UserName = user.name;
        $scope.UserEmail = user.email;
        $scope.UserId = user.id;

        byteAntDashboardResource.isSubmitted($scope.UserId)
            .then(function (response) {
                console.log('Success!', response);
                $scope.isSubmitted = angular.fromJson(response).isSubmitted; 
            })
            .catch(function (error) {
                console.error('Error', error);
            })
            .finally(function () {
                $scope.isLoaderShown = false;
            });;
    });

    const hostBoxes = $element[0].querySelectorAll('.welcome-dashboard uui-box');

    function tryToGetDesiredElement(hostElement) {
        const shadowRoot = hostElement.shadowRoot;
        const header = shadowRoot.querySelector('#header');
        if (header) {
            header.style.backgroundColor = '#1b264f';
            header.style.setProperty('--uui-border-radius', '3px');
            header.style.borderTopLeftRadius = 'var(--uui-border-radius)';
            header.style.borderTopRightRadius = 'var(--uui-border-radius)';
            header.style.color = '#fff';
        } else {
            $timeout(() => tryToGetDesiredElement(hostElement), 100);
        }
    }

    hostBoxes.forEach(hostBox => {
        tryToGetDesiredElement(hostBox);
    });

    $scope.submitForm = function (event, resourceFunctionName, formData) {
        if (!event) return;

        const form = event.target;
        if (!form.checkValidity()) return;

        const toastNotification = document.createElement('uui-toast-notification');
        const toastNotificationLayout = document.createElement('uui-toast-notification-layout');
        toastNotification.setAttribute('autoClose', '2500');
        toastNotification.appendChild(toastNotificationLayout);

        byteAntDashboardResource[resourceFunctionName](formData)
            .then(function (response) {
                console.log('Success!', response);
                toastNotification.setAttribute('color', 'positive');
                toastNotificationLayout.setAttribute('headline', 'Your message has been successfully sent');
                form.reset();
                if (resourceFunctionName == 'getStarterKitGuide') {
                    $scope.isSubmitted = true;
                }
            })
            .catch(function (error) {
                console.error('Error', error);
                toastNotification.setAttribute('color', 'danger');
                toastNotificationLayout.setAttribute('headline', 'Sorry there was an error sending your message');
            })
            .finally(function () {
                document.querySelector('uui-toast-notification-container').appendChild(toastNotification);
            });
    };

    $scope.submitContactForm = function (event) {
        const formData = new FormData(event.target);
        const contactUsModel = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        $scope.submitForm(event, 'contactUs', contactUsModel);
    };

    $scope.submitStarterKitGuideForm = function (event) {
        const formData = new FormData(event.target);
        const StarterKitGuide = {
            userId: $scope.UserId,
            name: formData.get('name'),
            company: formData.get('company'),
            position: formData.get('position'),
            email: formData.get('email')
        };

        $scope.submitForm(event, 'getStarterKitGuide', StarterKitGuide);
    };

});