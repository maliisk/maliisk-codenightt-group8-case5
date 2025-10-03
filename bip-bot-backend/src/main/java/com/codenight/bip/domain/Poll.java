package com.codenight.bip.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="polls")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Poll {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pollId;

    @ManyToOne(fetch = FetchType.LAZY)
    private Event event;

    private String question;
    private boolean locked;
}
