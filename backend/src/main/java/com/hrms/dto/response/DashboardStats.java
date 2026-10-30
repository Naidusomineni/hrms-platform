package com.hrms.dto.response;
import lombok.*;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStats {
    private Long totalEmployees;
    private Long activeEmployees;
    private Long newHiresThisMonth;
    private Long totalDepartments;
    private Long presentToday;
    private Long absentToday;
    private Long onLeaveToday;
    private Long pendingLeaveRequests;
    private Long openJobPostings;
    private Long pendingReviews;
    private Map<String, Long> employeesByDepartment;
    private Map<String, Long> attendanceThisWeek;
    private Map<String, Long> leaveTypeDistribution;
    private Map<String, Long> headcountTrend;
    private List<EmployeeResponse> recentHires;
    private List<Map<String, Object>> upcomingBirthdays;
}
