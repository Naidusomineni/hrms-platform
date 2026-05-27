package com.hrms.service.impl;

import com.hrms.dto.request.AttendanceRequest;
import com.hrms.dto.response.AttendanceResponse;
import com.hrms.entity.*;
import com.hrms.exception.*;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.List;
import java.util.stream.Collectors;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceResponse mark(AttendanceRequest req) {
        if (attendanceRepository.existsByEmployeeIdAndDate(req.getEmployeeId(), req.getDate()))
            throw new DuplicateResourceException("Attendance already recorded for this employee on " + req.getDate());
        if (req.getDate().isAfter(LocalDate.now()))
            throw new BadRequestException("Cannot mark attendance for a future date");

        Employee emp = employeeRepository.findById(req.getEmployeeId())
            .orElseThrow(() -> new ResourceNotFoundException("Employee","id",req.getEmployeeId()));

        Double hours = null;
        if (req.getCheckInTime() != null && req.getCheckOutTime() != null) {
            if (req.getCheckOutTime().isBefore(req.getCheckInTime()))
                throw new BadRequestException("Check-out time cannot be before check-in time");
            hours = Duration.between(req.getCheckInTime(), req.getCheckOutTime()).toMinutes() / 60.0;
        }

        Attendance attendance = Attendance.builder()
            .employee(emp).date(req.getDate())
            .checkInTime(req.getCheckInTime()).checkOutTime(req.getCheckOutTime())
            .workingHours(hours).status(req.getStatus())
            .remarks(req.getRemarks()).lateArrivalReason(req.getLateArrivalReason())
            .build();
        return toResponse(attendanceRepository.save(attendance));
    }

    public AttendanceResponse update(Long id, AttendanceRequest req) {
        Attendance a = attendanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attendance","id",id));
        a.setCheckInTime(req.getCheckInTime()); a.setCheckOutTime(req.getCheckOutTime());
        a.setStatus(req.getStatus()); a.setRemarks(req.getRemarks());
        if (req.getCheckInTime() != null && req.getCheckOutTime() != null)
            a.setWorkingHours(Duration.between(req.getCheckInTime(), req.getCheckOutTime()).toMinutes() / 60.0);
        return toResponse(attendanceRepository.save(a));
    }

    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getForEmployee(Long empId, Pageable pageable) {
        return attendanceRepository.findByEmployeeIdOrderByDateDesc(empId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getMonthly(Long empId, int year, int month) {
        return attendanceRepository.findMonthly(empId, year, month)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getByDate(LocalDate date) {
        return attendanceRepository.findByDateOrderByEmployee_FirstNameAsc(date)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
            .id(a.getId()).employeeId(a.getEmployee().getId())
            .employeeName(a.getEmployee().getFullName())
            .employeeNumber(a.getEmployee().getEmployeeNumber())
            .date(a.getDate()).checkInTime(a.getCheckInTime())
            .checkOutTime(a.getCheckOutTime()).workingHours(a.getWorkingHours())
            .overtimeHours(a.getOvertimeHours()).status(a.getStatus())
            .remarks(a.getRemarks()).build();
    }
}
