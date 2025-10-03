package com.codenight.bip.web;

import com.codenight.bip.domain.Event;
import com.codenight.bip.repo.EventRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ui/event") // <-- /ui/event-meta ile çakışmaması için
@RequiredArgsConstructor
public class UiEventController {

    private final EventRepo eventRepo;

    /** Son etkinliğin meta bilgisi: { eventId, published, createdBy } */
    @GetMapping("/latest") // <-- yeni endpoint: GET /ui/event/latest?groupId=...
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
