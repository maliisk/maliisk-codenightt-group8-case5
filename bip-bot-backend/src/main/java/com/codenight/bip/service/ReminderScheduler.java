package com.codenight.bip.service;

import com.codenight.bip.repo.EventRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final EventRepo eventRepo;
    private final EventService eventService;

    // her dakikada bir kontrol et
    @Scheduled(cron = "0 * * * * *")
    public void tick() {
        for (var e: eventRepo.findAll()) {
            var s = eventService.summary(e.getEventId());
            if (s.getWinnerSlot()==null) continue;

            Instant start = s.getWinnerSlot().getStartTime();
            long min = Duration.between(Instant.now(), start).toMinutes();

            // T-24h
            if ((e.getReminded24()==null || !e.getReminded24()) && min <= 24*60 && min >= 24*60-1) {
                System.out.println("[REMIND-24h] event#" + e.getEventId() + " -> " + s.toShortText());
                e.setReminded24(true);
                eventRepo.save(e);
            }
            // T-1h
            if ((e.getReminded1()==null || !e.getReminded1()) && min <= 60 && min >= 59) {
                System.out.println("[REMIND-1h] event#" + e.getEventId() + " -> " + s.toShortText());
                e.setReminded1(true);
                eventRepo.save(e);
            }
        }
    }
}
