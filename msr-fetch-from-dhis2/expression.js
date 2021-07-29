getMetadata(['organisationUnits'], {});

alterState(state => {
    return {...state, organisationUnits: state.data.organisationUnits};
})

/* get monthly service report data */
getDataValues({
    orgUnitGroup: 'iQHIwRQ8Dqf', // CHA
    period: (state) => {
        /*
        * e.g. getMostRecentPeriods(2) returns [ '202107', '202106' ]
        * if the current date is in July 2021
        */
        function getMostRecentPeriods(numPeriods) {
            let periods = [];
            let dateISO;
            let date = new Date();
            for (var i = 0; i < numPeriods; i++) {
                dateISO = date.toISOString();
                periods.push(`${dateISO.substr(0, 4)}${dateISO.substr(5, 2)}`)
                if (i < numPeriods - 1) {
                    date.setMonth(date.getMonth() - 1);
                }
            }
            return periods;
        }
        return getMostRecentPeriods(3).toString();
    },
    dataSet: 'IBhezUyCB5Q', // CHA Monthly Service Report
    includeDeleted: true
});

alterState(state => {
    console.log(state);
    return state;
})
