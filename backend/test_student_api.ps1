$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMSwiZW1haWwiOiJhZGl0aEBnbWFpbC5jb20iLCJyb2xlIjoic3R1ZGVudCIsInN0dWRlbnRfaWQiOjUsImlhdCI6MTc2Mzk1OTU0OSwiZXhwIjoxNzY0MDQ1OTQ5fQ.CUHlW_K7xQdtOAPBSU6V-tavEjyeThMjTY1qKvBJ6qA"

Write-Host "=== Testing /api/meetings/student/me ==="
try {
    $meetings = Invoke-RestMethod -Uri "http://localhost:5000/api/meetings/student/me" -Method Get -Headers @{'Authorization'="Bearer $token"}
    Write-Host "✓ Status 200 - Got $($meetings.Count) meeting(s)"
    $meetings | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)"
}

Write-Host "`n=== Testing /api/goals/student/me ==="
try {
    $goals = Invoke-RestMethod -Uri "http://localhost:5000/api/goals/student/me" -Method Get -Headers @{'Authorization'="Bearer $token"}
    Write-Host "✓ Status 200 - Got $($goals.Count) goal(s)"
    $goals | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)"
}
