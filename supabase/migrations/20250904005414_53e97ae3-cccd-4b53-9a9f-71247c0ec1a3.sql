-- Reset last_execution_date for Felipe's recurring schedule to allow execution today with correct timezone
UPDATE recurring_message_schedules 
SET last_execution_date = NULL, 
    updated_at = NOW()
WHERE client_name = 'Felipe teste' 
AND id = '3d128d04-b9c8-4b3b-8745-94a1d6da6075';