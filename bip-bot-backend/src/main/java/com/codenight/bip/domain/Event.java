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
    private String createdBy;   // userId
    private String groupId;     // BiP grup id
    private Instant createdAt;

    // Hatırlatıcı işaretleri (null/false -> henüz gönderilmedi)
    private Boolean reminded24;
    private Boolean reminded1;

    // Moderatörün zorunlu slot seçimi (eşitlik veya manuel seçim)
    private Long forcedSlotId;

    // /yayınla sonrası katılımcılara anketi açmak için
    @Builder.Default
    @Column(nullable = false)
    private boolean published = false;
}
