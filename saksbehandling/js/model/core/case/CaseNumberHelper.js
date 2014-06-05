/**
 * This defines an object with a collection of helper methods to use
 * when working with case numbers.
 * The format of all case numbers is: "YYYY-nnnn".
 */
define({
    caseIdPattern: /[0-9]{4}-[0-9]{4}/,

    /**
     *
     * @param {int} year
     * @return {string} The highest existing case id in the system. (Highest year, highest number.)
     */
    getHighestCaseId: function (year) {
        var caseFolders,
            caseIds = [],
            highestId,
            name,
            id;

        caseFolders = this.getAllOpenCases();
        caseFolders = caseFolders.concat(this.getAllClosedCases());
        for (i = 0; i < caseFolders.length; i++) {
            name = caseFolders[i].getName();
            id = getCaseIdFromString(name);
            if (validateCaseId(id) && getYearFromCaseId(id) === year) {
                caseIds.push(id);
            }
        }
        if (caseIds.length === 0) {
                return null; 
        }
        caseIds.sort();
        highestId = caseIds[caseIds.length - 1];

        return highestId;
    },

    getNextAvailableCaseIdForYear: function (year) {
        var highestExisting = getHighestCaseId(year),
            num = 0;
        if (highestExisting !== null) {
            num = getNumberFromCaseId(highestExisting);
            num = parseInt(num, 10);
        }
        num ++;
        num = padToFour(num);
        return year + '-' + num;
    },

    getAllOpenCases: function () {
        var rootFolder = DocsList.getFolderById(openCasesFolderId);
        var caseFolders = rootFolder.getFolders();
        return caseFolders;
    },

    getAllClosedCases: function () {
        var rootFolder = DocsList.getFolderById(closedCasesFolderId);
        var caseFolders = rootFolder.getFolders();
        return caseFolders;
    },

    getCaseIdFromString: function (str) {
        return str.substring(0, 9); 
    },

    stripCaseIdFromString: function (str) {
        return str.substring(11);
    },

    getYearFromCaseId: function (caseId) {
        return caseId.substring(0, 4); 
    },

    getNumberFromCaseId: function (caseId) {
        return caseId.substring(5, 9);
    },

    validateCaseId: function (str) {
        if (str.length !== 9) {
            return false; 
        }
        return this.caseIdPattern.test(str);
    },

    padToFour: function (number) {
        if (number<=9999) {
            number = ('000' + number).slice(-4);
        }
        return number;
    }
});