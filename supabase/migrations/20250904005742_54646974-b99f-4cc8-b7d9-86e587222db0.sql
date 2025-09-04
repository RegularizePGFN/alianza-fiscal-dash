-- Update Felipe's recurring schedule to execute on Wednesday (day 3) and reset last execution
UPDATE recurring_message_schedules 
SET day_of_week = 3, 
    last_execution_date = NULL, 
    updated_at = NOW()
WHERE client_name = 'Felipe teste' 
AND id = '3d128d04-b9c8-4b3b-8745-94a1d6da6075';