package com.codenight.bip.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity @Table(name="expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long expenseId;

    @ManyToOne(fetch = FetchType.LAZY)
    private Event event;

    private String userId;

    @Column(precision = 16, scale = 2)
    private BigDecimal amount;

    private String notes;

    @Column(precision = 16, scale = 2)
    private BigDecimal weight; 
}
