package com.hrms.service.impl;

import com.hrms.dto.response.*;
import com.hrms.enums.AttendanceStatus;
import com.hrms.enums.LeaveStatus;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service @Slf4j @RequiredArgsConstructor @Transactional(readOnly = true)
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRepository;
    private final JobPostingRepository jobPostingRepository;
    private final EmployeeService employeeService;

    public DashboardStats getAdminDashboard() {
        LocalDate today = LocalDate.now();

        long totalEmp = employeeRepository.count();
        long activeEmp = employeeRepository.countActive();
        long totalDepts = departmentRepository.count();

        long presentToday = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT);
        long absentToday  = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.ABSENT);
        long onLeaveToday = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.ON_LEAVE);
        long pendingLeaves = leaveRepository.countByStatus(LeaveStatus.PENDING);
        long openJobs = jobPostingRepository.countByStatus("OPEN");

        // Employees by department map
        Map<String, Long> byDept = new LinkedHashMap<>();
        employeeRepository.countByDepartment().forEach(r -> byDept.put((String)r[0], (Long)r[1]));

        // Headcount trend: last 6 months (simplified — uses joined employees)
        Map<String, Long> trend = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            trend.put(ym.getMonth().name().substring(0, 3), 0L); // placeholder
        }

        // Recent hires
        var recentHires = employeeRepository
            .findAll(PageRequest.of(0, 5, Sort.by("dateOfJoining").descending()))
            .stream().map(employeeService::toResponse).collect(Collectors.toList());

        // Upcoming birthdays (next 7 days)
        LocalDate nextWeek = today.plusDays(7);
        int startDay = today.getDayOfYear();
        int endDay = nextWeek.getDayOfYear();
        List<Map<String, Object>> birthdays = (endDay >= startDay
            ? employeeRepository.findUpcomingBirthdaysBetween(startDay, endDay)
            : employeeRepository.findUpcomingBirthdaysWrap(startDay, endDay))
            .stream()
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", e.getId()); m.put("name", e.getFullName());
                m.put("dateOfBirth", e.getDateOfBirth());
                m.put("department", e.getDepartment() != null ? e.getDepartment().getName() : null);
                return m;
            }).collect(Collectors.toList());

        return DashboardStats.builder()
            .totalEmployees(totalEmp).activeEmployees(activeEmp)
            .totalDepartments(totalDepts)
            .presentToday(presentToday).absentToday(absentToday).onLeaveToday(onLeaveToday)
            .pendingLeaveRequests(pendingLeaves).openJobPostings(openJobs)
            .employeesByDepartment(byDept).headcountTrend(trend)
            .recentHires(recentHires).upcomingBirthdays(birthdays)
            .build();
    }
}
