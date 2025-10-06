package com.codenight.bip.web;

import com.codenight.bip.domain.MessageLog;
import com.codenight.bip.repo.MessageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ui/messages/v2") //
@RequiredArgsConstructor
public class UiMessagesController {

    private final MessageRepo messageRepo;

    @DeleteMapping
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

    @PostMapping
    public Map<String, Object> append(@RequestParam String groupId,
                                      @RequestParam String userId,
                                      @RequestParam String text) {
        messageRepo.save(MessageLog.builder()
                .groupId(groupId)
                .userId(userId)
                .text(text)
                .fromMe(false)
                .createdAt(Instant.now())
                .build());
        return Map.of("ok", true);
    }
}
