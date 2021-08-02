alter table de_cha_monthly_service_report
add column meta_last_edit_user varchar(100) 
after meta_fabricated;

-- added 7/29/2021
alter table de_cha_monthly_service_report
add column valid tinyint(1) default 1;

alter table de_cha_monthly_service_report
add column dhis_header_cha_id varchar(100)
after cha_id;

alter table de_cha_monthly_service_report
add column dhis_header_chss_id varchar(100)
after chss_id;

alter table de_cha_monthly_service_report
add column dhis_header_district varchar(100)
after district;

alter table de_cha_monthly_service_report
add column dhis_header_health_facility varchar(100)
after health_facility;

alter table de_cha_monthly_service_report
add column dhis_header_month_reported varchar(100)
after month_reported;

alter table de_cha_monthly_service_report
add column dhis_header_year_reported varchar(100)
after year_reported;

-- 8/2/21
alter table de_cha_monthly_service_report
add column meta_update_date_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
after meta_insert_date_time;

update de_cha_monthly_service_report
set meta_update_date_time = null
where meta_data_source != 'dhis2';
