import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://dwzucqiiclqzygmalslb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3enVjcWlpY2xxenlnbWFsc2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMDAwNjIsImV4cCI6MjA1Njc3NjA2Mn0.EKEBejFrejDo0V56AeVS21lREQ5rahFGaInzACI03XA';

export const supabase = createClient(supabaseUrl, supabaseKey);
