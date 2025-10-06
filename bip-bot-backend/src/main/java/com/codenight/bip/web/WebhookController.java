package com.codenight.bip.web;

import com.codenight.bip.domain.MessageLog;
import com.codenight.bip.dto.webhook.CommandMsg;
import com.codenight.bip.repo.MessageRepo;
import com.codenight.bip.service.CommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/webhook")
@RequiredArgsConstructor
public class WebhookController {

    private final CommandService commandService;
    private final MessageRepo messageRepo;

    @PostMapping("/bip")
    public Map<String, Object> bip(@RequestBody CommandMsg msg) {
        messageRepo.save(MessageLog.builder()
                .groupId(msg.groupId())
                .userId(msg.userId())
                .text(msg.text())
                .fromMe(true)
                .createdAt(Instant.now())
                .build());

        Map<String, Object> out = commandService.handle(msg);

        String botText = String.valueOf(out.getOrDefault("text", ""));
        messageRepo.save(MessageLog.builder()
                .groupId(msg.groupId())
                .userId("BOT")
                .text(botText)
                .fromMe(false)
                .createdAt(Instant.now())
                .build());

        return out;
    }
}
