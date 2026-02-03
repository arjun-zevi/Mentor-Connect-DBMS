@echo off
REM Start MySQL service (requires admin)
echo Starting MySQL Service...
net start MySQL80

echo.
echo Running schema.sql...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < schema.sql

echo.
echo Running QUERIES.sql...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < QUERIES.sql

echo.
echo Database setup complete!
pause
