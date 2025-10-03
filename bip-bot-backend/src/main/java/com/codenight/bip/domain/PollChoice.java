package com.codenight.bip.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="poll_choices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PollChoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long choiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    private Poll poll;

    private String text;
}
