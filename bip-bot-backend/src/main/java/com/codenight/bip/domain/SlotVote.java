package com.codenight.bip.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="slot_votes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id","slot_id","userId"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SlotVote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="event_id")
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="slot_id")
    private Slot slot;

    private String userId;

    @Enumerated(EnumType.STRING)
    private Choice choice; // YES|NO
}
