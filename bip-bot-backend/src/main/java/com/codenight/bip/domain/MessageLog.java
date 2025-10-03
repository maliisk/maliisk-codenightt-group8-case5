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

    /** ÖNEMLİ: columnDefinition kullanmadan @Lob -> MySQL'de LONGTEXT */
    @Lob
    @Column(name = "text", nullable = false)
    private String text;

    @Column(name = "from_me", nullable = false)
    private boolean fromMe;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    // --- YENİ ALANLAR ---
    /** Sadece moderatörün görmesi gereken bot mesajları için işaret */
    @Column(name = "mod_only")
    private Boolean modOnly;     // null/false: herkes görür, true: sadece moderatör

    /** Sistem/bot mesajı işareti (reserved 'system' yerine güvenli kolon adı) */
    @Column(name = "system_flag")
    private Boolean systemFlag;  // null/false: normal, true: sistem/bot
}
