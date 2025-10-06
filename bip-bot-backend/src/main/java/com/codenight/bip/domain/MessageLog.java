package com.codenight.bip.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(
        name = "message_log",
        indexes = {
                @Index(name = "idx_msg_group", columnList = "group_id, created_at")
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MessageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false, length = 191)
    private String groupId;

    @Column(name = "user_id", nullable = false, length = 191)
    private String userId;

    @Lob
    @Column(name = "text", nullable = false)
    private String text;

    @Column(name = "from_me", nullable = false)
    private boolean fromMe;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "mod_only")
    private Boolean modOnly;


    @Column(name = "system_flag")
    private Boolean systemFlag;
}
