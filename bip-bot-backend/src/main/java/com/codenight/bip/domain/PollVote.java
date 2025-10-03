package com.codenight.bip.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="poll_votes", uniqueConstraints = @UniqueConstraint(columnNames = {"poll_id","userId"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PollVote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="poll_id")
    private Poll poll;

    @ManyToOne(fetch = FetchType.LAZY)
    private PollChoice choice;

    private String userId;
}
