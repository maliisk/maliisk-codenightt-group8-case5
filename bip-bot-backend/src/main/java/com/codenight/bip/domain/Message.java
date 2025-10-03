package com.codenight.bip.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

// com.codenight.bip.domain.Message  (sende hangi sınıfsa oraya ekle)
@Entity
@Table(name="messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String groupId;
    private String userId;        // "BOT" ise bot mesajı
    private String text;
    private Instant createdAt;
    private Boolean system;

    @Builder.Default
    @Column(nullable = false)
    private Boolean modOnly = false;   // <<< YENİ: true ise sadece moderatör görebilir
}
