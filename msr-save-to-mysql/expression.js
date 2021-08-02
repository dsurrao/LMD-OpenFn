alterState(state => {
    let DHIS2_CODES = {
        'meta_de_init': 'xoFwJwrWLu2', 'meta_de_date': 'NHzol7Puj50',
        'meta_qa_init': 'MIEXZbeYTUN', 'meta_qa_date': 'Iq4nr2J6WYv',
        'cha_name': 'O2q3dVLwZhY', 'chss_name': 'SXrDkc6uU8n',
        'community': 'YdWbmwaM4ON', 'community_id': 'jImsP4iGvVj',
        'dhis_header_cha_id': 'VZrh9dUAdDp',
        'dhis_header_chss_id': 'MZHUYNYXbH3',
        'dhis_header_health_facility': 'Si6xf0KEc7D',
        'dhis_header_district': 'qEnNoqCDttn',
        'dhis_header_month_reported': 'HRV5VqsMNt3',
        'dhis_header_year_reported': 'N3aptMjmGtP',
        '1_2_a_routine_household_visits': 'Aix5nQuHZZ7',
        '1_2_b_births_community_home': 'zCnimxEoDLw', '1_2_c_births_facility': 'm0hhusfnr83',
        '1_2_d_still_births': 'My6fBAMvQff', '1_2_e_neonatal_deaths': 'uHT4lPmgcWe',
        '1_2_f_post_neonatal_deaths': 'sz7zSbAJ4wG', '1_2_g_child_deaths': 'tWF6mwpTALd',
        '1_2_h_maternal_deaths': 'f3qB4nlmta5', '1_2_i_community_triggers': 'xOpYqFElzQY',
        '1_2_k_adult_deaths': 'Yl4s84l7MCx', '1_2_j_hiv_tb_cm_ntd_mh_suspect_referrals': 'Uiy6RtlBOPq',
        '2_1_a_pregnant_woman_visits': 'gOd9MIp41F3', '2_1_b_referred_delivery': 'Yw46HjApoVA',
        '2_1_c_referred_anc': 'hdu3LtlmXQ7', '2_1_d_post_natal_visits': 'bTU82o9OBw5',
        '2_1_e_referred_danger_sign': 'mfyq1hPB2YE', '2_1_f_hbmnc_48_hours_mother': 'EtRGOUI7Vj4',
        '2_1_g_hbmnc_48_hours_infant': 'xbCBSmM1C4A', '2_2_a_clients_modern_fp': 'HltcJtbxzb6',
        '3_1_A_active_case_finds': 'KCLF2XTjjqi', '3_1_b_muac_red': 'sqvWy3D9b3s',
        '3_1_c_muac_yellow': 'kVag8bnykSQ', '3_1_d_muac_green': 'tbOhRoLIH70',
        '3_1_e_pneumonia_cases': 'GaMNZLJRN0P', '3_1_f_malaria_rdt': 'L98z59znOMn',
        '3_1_g_diarrhea_cases': 'CcCwSEppdO0', '3_1_h_pneumonia_treated_antibiotics': 'MHk1WnpUWmg',
        '3_1_j_malaria_treated_1_5_years': 'kjOHplBJZh1', '3_1_k_malaria_treated_less_24_hours': 'l7TMIuNiZ0g',
        '3_1_l_malaria_treated_more_24_hours': 'w1ST1DmjZvF', '3_1_m_diarrhea_treated_zinc_ORS': 'G2KD4mHCEmo',
        '3_1_n_referred_health_facility': 'iCVNyn9jQMo', '4_1_a_hiv_client_visits': 'kzCGrO8Qq5R',
        '4_1_b_tb_client_visits': 'jDUQ1XIfMrk', '4_1_c_cm_ntd_client_visits': 'RKzRdmFUhnK',
        '4_1_d_mental_health_client_visits': 'Z1E4R98dKC5', '4_1_e_ltfu_hiv_clients_traced': 'OdrSjUAh4ng',
        '4_1_f_ltfu_tb_clients_traced': 'eMAINMpG8oz'
    };

    // reorganize data hierarchically by one or more keys
    function reorganizeData(data, keys) {
        let newData = [];
        let keyName, keyVal;
        if (keys.length > 0) {
            for (var i = 0; i < data.length; i++) {
                keyName = keys[0];
                keyVal = data[i][keyName];
                if (newData.findIndex(e => e[keyName] == keyVal) == -1) {
                    let filteredData = data.filter(e => e[keyName] == keyVal);
                    if (keys.length == 1) {
                        // [keyName] is a computed property name
                        newData.push({ [keyName]: keyVal, data: filteredData });
                    }
                    else {
                        // recursively rearrange hierarchy if there are more keys
                        newData.push({
                            [keyName]: keyVal,
                            data: reorganizeData(filteredData, keys.slice(1))
                        });
                    }
                }
            }
        }

        return newData;
    }

    function dataValueByCode(data, code) {
        let node = data.find(d => d.dataElement == `${code}`);
        let nodeVal = null;
        if (node != null && !node.deleted) nodeVal = node.value;
        return nodeVal;
    }

    function getMostRecent(data, colName) {
        let mostRecent = null;
        if (data.length > 0) {
            mostRecent = [...data].sort(
                (a, b) => {
                    if (b.lastUpdated > a.lastUpdated) {
                        return 1;
                    }
                    else if (b.lastUpdated < a.lastUpdated) {
                        return -1;
                    }

                    return 0;
                }
            )[0][colName];
        }
        return mostRecent;
    }

    function getOrgUnitElem(organisationUnits, orgUnit) {
        return organisationUnits.find(e => e.id == orgUnit);
    }

    function getOrgUnitName(organisationUnits, orgUnit) {
        let el = getOrgUnitElem(organisationUnits, orgUnit);
        return el != undefined ? el.name : null;
    }

    /*
    Returns [chss, facility, district]
    */
    function getCHSSFacilityAndDistrict(organisationUnits, chaOrgUnit) {
        let chss, facility, district;
        let chssEl, facilityEl, districtEl;
        let chaEl = getOrgUnitElem(organisationUnits, chaOrgUnit);
        if (chaEl != undefined && chaEl.parent) {
            chssEl = getOrgUnitElem(organisationUnits, chaEl.parent.id);
            if (chssEl != undefined) {
                chss = chssEl.name;
                if (chssEl.parent) {
                    facilityEl = getOrgUnitElem(organisationUnits, chssEl.parent.id);
                    if (facilityEl != undefined) {
                        facility = facilityEl.name;
                        if (facilityEl.parent) {
                            districtEl = getOrgUnitElem(organisationUnits, facilityEl.parent.id);
                            if (districtEl != undefined) {
                                district = districtEl.name;
                            }
                        }
                    }
                }
            }
        }
        return [chss, facility, district];
    }

    /* form data is valid if at least one field is not empty */
    function validateFormData(periodData, dhis2Codes) {
        let columnNames = Object.keys(dhis2Codes);
        return !columnNames.every(c => dataValueByCode(periodData, dhis2Codes[c]) == null);
    }

    /* Returns an array of the form below that can be passed to upsertMany()
        [
            { meta_uuid: 'kwIzfzpJ82z', cha_name: 'Dominic Surraos', ... },
            { meta_uuid: 'plPz2j9VSIz', cha_name: 'James Test', ... },
            ...
        ]
    */
    function getUpsertData(dhis2DataValues, organisationUnits, dhis2Codes) {
        let reorganizedData = reorganizeData(dhis2DataValues, ['orgUnit', 'period']);
        let insertData = [], insertRow;
        let orgUnit, orgUnitData;
        let period, periodData;
        let columnNames;
        let chss, facility, district;

        // lopp through org units
        for (var i = 0; i < reorganizedData.length; i++) {
            orgUnit = reorganizedData[i]['orgUnit'];
            orgUnitData = reorganizedData[i]['data'];
            [chss, facility, district] = getCHSSFacilityAndDistrict(organisationUnits,
                orgUnit);
            // loop through periods and create a row for each period
            for (var j = 0; j < orgUnitData.length; j++) {
                period = orgUnitData[j]['period'];
                periodData = orgUnitData[j]['data'];
                // mark unique rows by period and cha 
                // added meta_last_edit_user to mysql table
                insertRow = {
                    'meta_uuid': `${orgUnit}-${period}`,
                    'meta_data_source': 'dhis2',
                    'meta_last_edit_user': getMostRecent(periodData, 'storedBy'),
                    'month_reported': period.substring(4, 6),
                    'year_reported': period.substring(0, 4),
                    'cha_id': getOrgUnitName(organisationUnits, orgUnit),
                    'chss_id': chss,
                    'health_facility': facility,
                    'district': district,
                    'valid': validateFormData(periodData, dhis2Codes)
                };
                columnNames = Object.keys(dhis2Codes);
                columnNames.map(c => insertRow[c] = dataValueByCode(periodData,
                    dhis2Codes[c]));
                insertData.push(insertRow);
            }
        }

        return insertData;
    }

    /* Assumes state.organisationUnits exists */
    return {...state, upsertData: getUpsertData(state.data.dataValues, 
        state.organisationUnits, DHIS2_CODES)};
});

upsertMany('de_cha_monthly_service_report', state => state.upsertData);
