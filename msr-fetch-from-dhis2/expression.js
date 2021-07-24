alterState(state => {
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
            periods.push(`${dateISO.substr(0,4)}${dateISO.substr(5,2)}`)
            if (i < numPeriods - 1) {
                date.setMonth(date.getMonth() - 1);
            }
        }
        return periods;
    }

    return {...state, data: { mostRecentPeriods: getMostRecentPeriods(2).toString() }};
});

getDataValues({
    orgUnit: 'kwIzfzpJ82z,plPz2j9VSIz', // CHAs BB01-02, BB01-01
    period: dataValue('mostRecentPeriods'),
    dataSet: 'IBhezUyCB5Q', // CHA Monthly Service Report
    includeDeleted: true
});

alterState(state => {
    console.log(state.data);
    return state;
})


// getMetadata(['dataElements', 'indicators'], {
//     filters: ['name:like:ANC'],
// });

// todo: dynamically fetch last two months DONE
// expand to all CHAs (org units)
// test performance
// can orgUnit be a parent in the hierarchy?
// another job to map cha org units to position ids
