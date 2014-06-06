/**
 * This defines an object with a collection of helper methods to use
 * when working with case numbers.
 * The format of all case numbers is: "YYYY-nnnn".
 */
define({
    caseIdPattern: /[0-9]{4}-[0-9]{4}/,

    /**
     * Gets the first 9 characters of a string.
     * (That is supposed to be the case id in case folder names.)
     *
     * @param {string} str
     * @returns {string}
     */
    getCaseIdFromString: function (str) {
        return str.substring(0, 9); 
    },

    /**
     * Strips the case id from a string.
     * (Actually just strips off the first 11 characters.)
     *
     * @param {string} str
     * @returns {string}
     */
    stripCaseIdFromString: function (str) {
        return str.substring(11);
    },

    /**
     * Gets the year part of the case id.
     *
     * @param {string} caseId
     * @returns {string}
     */
    getYearFromCaseId: function (caseId) {
        return caseId.substring(0, 4);
    },

    /**
     * Gets the number part of a case id.
     *
     * @param {string} caseId
     * @returns {string}
     */
    getNumberFromCaseId: function (caseId) {
        return caseId.substring(5, 9);
    },

    /**
     * Checks if a string conforms to the format "YYYY-nnnn".
     *
     * @param {string} str
     * @returns (Boolean}
     */
    validateCaseId: function (str) {
        if (str.length !== 9) {
            return false; 
        }
        return this.caseIdPattern.test(str);
    },

    /**
     * Pads a number with enough zeros to make it 4 charcters long.
     * 
     * @param {string} number
     * @returns {String}
     */
    padToFour: function (number) {
        if (number<=9999) {
            number = ('000' + number).slice(-4);
        }
        return number;
    }
});