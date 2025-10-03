package com.codenight.bip.api;

import com.codenight.bip.domain.MessageLog;
import com.codenight.bip.dto.ui.ChatDto;
import com.codenight.bip.dto.ui.UiMessageDto;
import com.codenight.bip.repo.EventRepo;
import com.codenight.bip.repo.MessageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ui")
public class UiController {

    private final EventRepo eventRepo;
    private final MessageRepo messageRepo;

    /* -------------------------- CHATS -------------------------- */

    /** Kullanıcının göreceği sohbet listesi (basit sürüm: tüm gruplar) */
    @GetMapping("/chats")
    public List<ChatDto> chats(@RequestParam String userId) {
        // events'ten distinct groupId’leri al
        List<String> groups = eventRepo.findDistinctGroupIds();

        // Her grup için son event başlığını title olarak kullan
        Map<String, String> lastTitle = eventRepo.findAll().stream()
                .collect(Collectors.groupingBy(
                        e -> e.getGroupId(),
                        Collectors.collectingAndThen(
                                Collectors.maxBy(Comparator.comparing(e -> e.getCreatedAt())),
                                opt -> opt.map(e -> e.getTitle()).orElse(null)
                        )
                ));

        return groups.stream()
                .map(g -> new ChatDto(
                        g,                                  // id
                        Optional.ofNullable(lastTitle.get(g)).orElse("Grup " + g), // title
                        g                                   // groupId
                ))
                .toList();
    }

    /* ------------------------ MESSAGES ------------------------- */

    /**
     * Mesajları döner. Moderatör değilse {@code modOnly=true} bot mesajları filtrelenir.
     * Frontend mutlaka {@code userId} göndermelidir.
     */
    @GetMapping("/messages")
    public List<UiMessageDto> messages(@RequestParam String groupId,
                                       @RequestParam(required = false) String userId) {

        // Bu gruptaki son etkinliğin moderatörünü bul
        boolean isModerator = false;
        var last = eventRepo.findTopByGroupIdOrderByCreatedAtDesc(groupId).orElse(null);
        if (last != null && userId != null) {
            isModerator = Objects.equals(last.getCreatedBy(), userId);
        }
        final boolean isMod = isModerator; // lambda için effectively-final

        return messageRepo.findTop200ByGroupIdOrderByCreatedAtAsc(groupId).stream()
                // modOnly mesajları moderatör değilse gizle
                .filter(m -> isMod || !Boolean.TRUE.equals(m.getModOnly()))
                .map(m -> new UiMessageDto(
                        String.valueOf(m.getId()),
                        m.getUserId(),
                        m.getText(),
                        m.getCreatedAt(),
                        m.isFromMe(),
                        // system bayrağı artık systemFlag kolonundan geliyor
                        Boolean.TRUE.equals(m.getSystemFlag())
                ))
                .toList();
    }

    /**
     * (Opsiyonel) Frontend offline loglamak isterse tek bir mesaj ekleyebilir.
     * Not: Bot mesajları ve görünürlük (modOnly) için komut akışını kullanın.
     */
    @PostMapping("/messages")
    public UiMessageDto append(@RequestParam String groupId,
                               @RequestParam String userId,
                               @RequestParam String text,
                               @RequestParam(defaultValue = "false") boolean fromMe) {

        MessageLog saved = messageRepo.save(
                MessageLog.builder()
                        .groupId(groupId)
                        .userId(userId)
                        .text(text)
                        .fromMe(fromMe)
                        .createdAt(Instant.now())
                        .build()
        );

        return new UiMessageDto(
                String.valueOf(saved.getId()),
                userId,
                text,
                saved.getCreatedAt(),
                saved.isFromMe(),
                Boolean.TRUE.equals(saved.getSystemFlag())
        );
    }

    /** Sohbeti temizle (⋮ menüsünden). */
    @DeleteMapping("/messages")
    public Map<String, Object> clear(@RequestParam String groupId) {
        int total = 0;
        List<MessageLog> chunk = messageRepo.findTop200ByGroupIdOrderByCreatedAtAsc(groupId);
        while (!chunk.isEmpty()) {
            messageRepo.deleteAll(chunk);
            total += chunk.size();
            chunk = messageRepo.findTop200ByGroupIdOrderByCreatedAtAsc(groupId);
        }
        return Map.of("ok", true, "cleared", total);
    }

    /* ----------------------- EVENT META ------------------------ */

    /**
     * Frontend’in kartları göstermesi için gerekli meta:
     * { eventId, published, createdBy }
     */
    @GetMapping("/event-meta")
    public Map<String, Object> eventMeta(@RequestParam String groupId) {
        var e = eventRepo.findTopByGroupIdOrderByCreatedAtDesc(groupId).orElse(null);
        if (e == null) {
            return Map.of("eventId", null, "published", false, "createdBy", null);
        }
        return Map.of(
                "eventId", e.getEventId(),
                "published", e.isPublished(),
                "createdBy", e.getCreatedBy()
        );
    }
}
