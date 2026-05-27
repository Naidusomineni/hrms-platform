package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "departments")
@SQLDelete(sql = "UPDATE departments SET deleted = true, updated_at = NOW() WHERE id = ?")
@Where(clause = "deleted = false")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Department extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 10, unique = true)
    private String code;

    @Column(length = 500)
    private String description;

    @Column(length = 100)
    private String location;

    private Double budget;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Builder.Default
    private Boolean deleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Employee> employees = new ArrayList<>();
}
