import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ozgtbqizepstargxfqcm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Z3RicWl6ZXBzdGFyZ3hmcWNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MjgzODExOCwiZXhwIjoxOTk4NDE0MTE4fQ.TZ8sWLB6ru1tULm3s3C96V1xaKJRjbpQii-MscyiOZ0";

export const supabase = createClient(supabaseUrl, supabaseKey);



