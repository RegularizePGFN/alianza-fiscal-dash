ALTER TABLE client_registration_automation_files 
DROP CONSTRAINT IF EXISTS client_registration_automation_files_file_type_check;

ALTER TABLE client_registration_automation_files 
ADD CONSTRAINT client_registration_automation_files_file_type_check 
CHECK (file_type IN ('pdf', 'screenshot', 'pgfn_screenshot'));