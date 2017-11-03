/**
 * [module description]
 * @param  {[type]} 'modalDoc' [description]
 * @return {[type]}            [description]
 */
angular.module('modalDoc.services')
    .factory('modalDocSrv', modalDocSrv);

modalDocSrv.$inject = ['$http', '$uibModal', 'AppDataSrv'];

function modalDocSrv($http, $uibModal, AppDataSrv) {

    var modalDocSrv = {
        getDoc: getDoc,
        openModalDoc: openModalDoc
    };

    return modalDocSrv;

    ////////////////////////////////////////////////////////////////////////

    function getDoc(lg, field) {
        field = field || "default";
        var help_file = AppDataSrv.config.locales_path + lg + '/help.json';
        return $http
            .get(help_file)
            .then(function(help) {
                var path = help.data[field] || AppDataSrv.config.locales_path + lg + '/help/' + field + '.md';
                return $http.get(path)
                    .then(function(response) {
                        // Change path for images in documentation
                        markdown = response.data.replace(/\]\(userGuideImages\//ig, '](documentation/userGuide/userGuideImages/');
                        showdown.setFlavor('github');
                        var converter = new showdown.Converter({
                            tables: true
                        });
                        return converter.makeHtml(markdown);
                    });
            });
    }

    function openModalDoc(docField) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: AppDataSrv.config.modal_template.help || 'app/modalDoc.module/partials/modal-doc.html',
            controller: 'ModalDocCtrl as modal',
            size: 'lg',
            resolve: {
                docField: function() {
                    return docField;
                }
            }
        });
    }

}
