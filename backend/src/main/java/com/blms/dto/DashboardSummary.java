package com.blms.dto;

import java.util.Map;

public class DashboardSummary {

    private long totalLeads;
    private Map<String, Long> countsByStatus;

    public DashboardSummary(long totalLeads, Map<String, Long> countsByStatus) {
        this.totalLeads = totalLeads;
        this.countsByStatus = countsByStatus;
    }

    public long getTotalLeads() {
        return totalLeads;
    }

    public Map<String, Long> getCountsByStatus() {
        return countsByStatus;
    }
}
