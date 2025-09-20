package com.cuet.sphere.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "current_semester")
public class CurrentSemester {
    @Id
    @Column(name = "batch", nullable = false)
    private String batch;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}