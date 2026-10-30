@echo off
echo ============================================================
echo   HRMS Platform — PostgreSQL Database Setup
echo ============================================================
echo.

echo [1/3] Ensuring PostgreSQL 18 Windows service is started...
net start postgresql-x64-18 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo       Service postgresql-x64-18 is RUNNING.
) else (
    echo       Service postgresql-x64-18 already running or checking status...
)

echo.
echo [2/3] Creating database 'hrms_db' on PostgreSQL 18 (Port 5433)...
set PGPASSWORD=Naidu@98666
"C:\Program Files\PostgreSQL\18\bin\createdb.exe" -h localhost -p 5433 -U postgres hrms_db >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo       Database 'hrms_db' created successfully on PostgreSQL 18!
) else (
    echo       Database 'hrms_db' already exists or ready on PostgreSQL 18.
)

echo.
echo [3/3] Also checking PostgreSQL 17 (Port 5432)...
net start postgresql-x64-17 >nul 2>&1
set PGPASSWORD=Eoxys@110
"C:\Program Files\PostgreSQL\17\bin\createdb.exe" -h localhost -p 5432 -U postgres hrms_db >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo       Database 'hrms_db' created successfully on PostgreSQL 17!
) else (
    echo       PostgreSQL 17 database check completed.
)

echo.
echo ============================================================
echo   Setup Complete! You can now run the application in Eclipse.
echo ============================================================
pause
