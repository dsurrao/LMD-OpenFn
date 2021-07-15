alterState(state => {
    let DHIS2_CODES = { 'cha_name': 'O2q3dVLwZhY','cha_id': 'VZrh9dUAdDp', 
      'chss_name': 'SXrDkc6uU8n', 'chss_id': 'MZHUYNYXbH3', 'community': 'YdWbmwaM4ON', 
      'community_id': 'jImsP4iGvVj', 'district': 'qEnNoqCDttn', 'health_facility': 'Si6xf0KEc7D',
      'month_reported': 'HRV5VqsMNt3', 'year_reported': 'N3aptMjmGtP', 
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
      '4_1_f_ltfu_tb_clients_traced': 'eMAINMpG8oz'};
  
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
                        newData.push({[keyName]: keyVal, data: filteredData});
                    }
                    else {
                        // recursively rearrange hierarchy if there are more keys
                        newData.push({[keyName]: keyVal, 
                        data: reorganizeData(filteredData, keys.slice(1))});
                    }
                  }
              }
          }
  
          return newData;
      }
  
      function dataValueByCode(data, code) {
          let node = data.find(d => d.dataElement==`${code}`);
          let nodeVal = null;
          if (node != null) nodeVal = node.value;
          return nodeVal;
      }
  
      function getMostRecentUpdatedDate(data) {
          let mostRecentUpdatedDate = null;
          if (data.length > 0) {
              mostRecentUpdatedDate = [...data].sort(
                  (a, b) => {
                      if (b.lastUpdated > a.lastUpdated) {
                          return 1;
                      }
                      else if (b.lastUpdated < a.lastUpdated) {
                          return -1;
                      }
                      
                      return 0;
                  }
              )[0]['lastUpdated'];
          }
          return mostRecentUpdatedDate;
      }
  
      /* Returns an array of the form below that can be passed to upsertMany()
          [
              { meta_uuid: 'kwIzfzpJ82z', cha_name: 'Dominic Surraos', ... },
              { meta_uuid: 'plPz2j9VSIz', cha_name: 'James Test', ... },
              ...
          ]
      */
      function getUpsertData(dhis2DataValues) {
          let reorganizedData = reorganizeData(dhis2DataValues, ['orgUnit', 'period']);
          //console.log(reorganizedData);
          let insertData = [], insertRow;
          let orgUnit, orgUnitData;
          let period, periodData;
          let columnNames;
          let mostRecentUpdatedDate;
      
          // lopp through org units
          for (var i = 0; i < reorganizedData.length; i++) {
              orgUnit = reorganizedData[i]['orgUnit'];
              orgUnitData = reorganizedData[i]['data'];
              // loop through periods and create a row for each period
              for (var j = 0; j < orgUnitData.length; j++) {
                  period = orgUnitData[j]['period'];
                  periodData = orgUnitData[j]['data'];
                  mostRecentUpdatedDate = getMostRecentUpdatedDate(periodData);
                  // mark unique rows by period, cha and last updated date
                  // i.e., maintain change history when updates are made 
                  // for the same cha and period
                  insertRow = { 'meta_uuid': `${orgUnit}-${period}-${mostRecentUpdatedDate}` };
                  columnNames = Object.keys(DHIS2_CODES);
                  columnNames.map(c => insertRow[c] = dataValueByCode(periodData, 
                      DHIS2_CODES[c]));
                  insertData.push(insertRow);
              }
          }
          
          return insertData;
      }
      
      state.data.upsertData = getUpsertData(state.data.dataValues);
      
      console.log(state.data);
      
      return state;
  });
  
  upsertMany('de_cha_monthly_service_report', state => state.data.upsertData);
  
  /*
  sample
  "dataValues": [
            {
                "dataElement": "m0hhusfnr83",
                "period": "202105",
                "orgUnit": "plPz2j9VSIz",
                "categoryOptionCombo": "HllvX50cXC0",
                "attributeOptionCombo": "HllvX50cXC0",
                "value": "3",
                "storedBy": "admin",
                "created": "2021-06-03T19:57:13.095+0000",
                "lastUpdated": "2021-06-03T19:57:16.765+0000",
                "followup": false
            },
            {
                "dataElement": "My6fBAMvQff",
                "period": "202105",
                "orgUnit": "plPz2j9VSIz",
                "categoryOptionCombo": "HllvX50cXC0",
                "attributeOptionCombo": "HllvX50cXC0",
                "value": "4",
                "storedBy": "dominic",
                "created": "2021-06-06T09:29:50.000+0000",
                "lastUpdated": "2021-06-06T09:29:50.000+0000",
                "followup": false
            }
        ]
  */