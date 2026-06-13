const url = 'https://uxstrrdgyqdrcrpqtkwq.supabase.co/rest/v1/sales?select=*&limit=5';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4c3RycmRneXFkcmNycHF0a3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2OTEzNzYsImV4cCI6MjA3OTI2NzM3Nn0.154nMKoV_YkZdlYL73O9QJi8Me_326uvzkCuGCba0kA';

fetch(url, {
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data)))
.catch(err => console.error(err));
