package com.codenight.bip.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity @Table(name="slots")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Slot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slotId;

    @ManyToOne(fetch = FetchType.LAZY)
    private Event event;

    private Instant startTime;
    private Instant endTime;
}
