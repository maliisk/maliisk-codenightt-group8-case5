package com.codenight.bip.web;

import com.codenight.bip.domain.Event;
import com.codenight.bip.repo.EventRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ui/event")
@RequiredArgsConstructor
public class UiEventController {

    private final EventRepo eventRepo;

    @GetMapping("/latest")
    public Map<String, Object> latest(@RequestParam String groupId) {
        Event e = eventRepo.findTopByGroupIdOrderByCreatedAtDesc(groupId).orElse(null);
        if (e == null) {
            return Map.of(
                    "eventId", null,
                    "published", false,
                    "createdBy", null
            );
        }
        return Map.of(
                "eventId", e.getEventId(),
                "published", e.isPublished(),
                "createdBy", e.getCreatedBy()
        );
    }
}
