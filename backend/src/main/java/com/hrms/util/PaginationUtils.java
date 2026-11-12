package com.hrms.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PaginationUtils {

    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 100;

    private PaginationUtils() {}

    public static int boundPage(int page) {
        return Math.max(0, page);
    }

    public static int boundSize(int size) {
        if (size <= 0) return DEFAULT_PAGE_SIZE;
        return Math.min(size, MAX_PAGE_SIZE);
    }

    public static Pageable of(int page, int size) {
        return PageRequest.of(boundPage(page), boundSize(size));
    }

    public static Pageable of(int page, int size, Sort sort) {
        return PageRequest.of(boundPage(page), boundSize(size), sort != null ? sort : Sort.unsorted());
    }

    public static Pageable of(int page, int size, String sortBy, String sortDir) {
        String safeSortBy = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        Sort sort = "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(safeSortBy).ascending()
                : Sort.by(safeSortBy).descending();
        return PageRequest.of(boundPage(page), boundSize(size), sort);
    }
}
