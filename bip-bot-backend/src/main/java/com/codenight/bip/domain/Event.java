package com.codenight.bip.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;

    private String title;
    private String createdBy;
    private String groupId;
    private Instant createdAt;

    private Boolean reminded24;
    private Boolean reminded1;

    private Long forcedSlotId;

    @Builder.Default
    @Column(nullable = false)
    private boolean published = false;
}
