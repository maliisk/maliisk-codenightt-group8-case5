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


    @GetMapping("/chats")
    public List<ChatDto> chats(@RequestParam String userId) {
        List<String> groups = eventRepo.findDistinctGroupIds();

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
                        g,
                        Optional.ofNullable(lastTitle.get(g)).orElse("Grup " + g),
                        g
                ))
                .toList();
    }


    @GetMapping("/messages")
    public List<UiMessageDto> messages(@RequestParam String groupId,
                                       @RequestParam(required = false) String userId) {

        boolean isModerator = false;
        var last = eventRepo.findTopByGroupIdOrderByCreatedAtDesc(groupId).orElse(null);
        if (last != null && userId != null) {
            isModerator = Objects.equals(last.getCreatedBy(), userId);
        }
        final boolean isMod = isModerator;

        return messageRepo.findTop200ByGroupIdOrderByCreatedAtAsc(groupId).stream()
                .filter(m -> isMod || !Boolean.TRUE.equals(m.getModOnly()))
                .map(m -> new UiMessageDto(
                        String.valueOf(m.getId()),
                        m.getUserId(),
                        m.getText(),
                        m.getCreatedAt(),
                        m.isFromMe(),

                        Boolean.TRUE.equals(m.getSystemFlag())
                ))
                .toList();
    }


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
