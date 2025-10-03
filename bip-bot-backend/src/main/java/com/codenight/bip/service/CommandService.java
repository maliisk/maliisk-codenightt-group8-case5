package com.codenight.bip.service;

import com.codenight.bip.domain.Choice;
import com.codenight.bip.domain.Event;
import com.codenight.bip.domain.Role;
import com.codenight.bip.dto.req.*;
import com.codenight.bip.dto.webhook.CommandMsg;
import com.codenight.bip.repo.EventRepo;
import com.codenight.bip.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CommandService {

    private final EventService eventService;
    private final EventRepo eventRepo;
    private final UserRepo userRepo;

    @Value("${app.rate-limit-ms}")
    long rateLimitMs;

    // userId|groupId -> last ts
    private final Map<String, Long> lastCmd = new ConcurrentHashMap<>();

    public Map<String, Object> handle(CommandMsg m) {
        final String key = m.userId() + "|" + m.groupId();
        long now = System.currentTimeMillis();
        Long last = lastCmd.get(key);
        if (last != null && now - last < rateLimitMs) {
            return Map.of("ok", false, "text", "⚠️ Çok hızlısın, 2 sn bekle.", "modOnly", true);
        }
        lastCmd.put(key, now);

        final String t = Optional.ofNullable(m.text()).orElse("").trim();

        try {
            /* ------------------------ /yeni ------------------------ */
            if (t.startsWith("/yeni")) {
                String title = t.replaceFirst("/yeni", "").trim();
                var e = eventService.create(new CreateEventReq(title, m.userId(), m.groupId()));
                return Map.of(
                        "ok", true,
                        "eventId", e.getEventId(),
                        "text", "🆕 Etkinlik oluşturuldu: #" + e.getEventId() + " " + e.getTitle(),
                        "modOnly", true   // sadece moderatör chatinde görünsün
                );
            }

            /* ------------------------ /slot ------------------------ */
            if (t.startsWith("/slot")) {
                // /slot 2025-10-12 18:00-20:00
                var e = lastEventForGroup(m.groupId());
                var parts = t.split("\\s+");
                if (parts.length < 3) {
                    return Map.of("ok", false, "text", "Kullanım: /slot YYYY-MM-DD HH:mm-HH:mm", "modOnly", true);
                }
                String date = parts[1];
                String range = parts[2]; // 18:00-20:00
                var se = range.split("-");
                Instant start = Instant.parse(date + "T" + se[0] + ":00Z");
                Instant end   = Instant.parse(date + "T" + se[1] + ":00Z");
                var s = eventService.addSlot(e.getEventId(), new AddSlotReq(start.toString(), end.toString()));
                return Map.of("ok", true, "text", "⏱️ Slot eklendi #" + s.getSlotId(), "modOnly", true);
            }

            /* ------------------------ /katıl ----------------------- */
            if (t.startsWith("/katıl")) {
                // /katıl slot=2 yes|no (default yes)
                var e = lastEventForGroup(m.groupId());
                long slotId = Long.parseLong(extract(t, "slot=(\\d+)", "0"));
                if (slotId == 0) {
                    return Map.of("ok", false, "text", "Kullanım: /katıl slot=<id> [yes|no]", "modOnly", true);
                }
                Choice ch = t.toLowerCase().contains("no") ? Choice.NO : Choice.YES;
                eventService.voteSlot(e.getEventId(), new VoteSlotReq(m.userId(), slotId, ch));
                return Map.of("ok", true, "text", "✅ Oy kaydedildi (slot " + slotId + ", " + ch + ")", "modOnly", true);
            }

            /* ------------------------ /mekan ----------------------- */
            if (t.startsWith("/mekan")) {
                // /mekan Ek Bina Kafe  → yoksa poll aç, varsa seçenek ekle
                var e = lastEventForGroup(m.groupId());
                String place = t.replaceFirst("/mekan", "").trim();
                if (place.isBlank()) {
                    return Map.of("ok", false, "text", "Kullanım: /mekan <yer adı>", "modOnly", true);
                }
                eventService.createOrAppendPlaceChoice(e.getEventId(), place);
                return Map.of("ok", true, "text", "📍 Mekân oylaması güncellendi: " + place, "modOnly", true);
            }

            /* ------------------------- /oy ------------------------- */
            if (t.startsWith("/oy")) {
                // /oy choice=3
                var e = lastEventForGroup(m.groupId());
                long choiceId = Long.parseLong(extract(t, "choice=(\\d+)", "0"));
                if (choiceId == 0) return Map.of("ok", false, "text", "Kullanım: /oy choice=<id>", "modOnly", true);
                eventService.votePoll(e.getEventId(), new VotePollReq(m.userId(), choiceId));
                return Map.of("ok", true, "text", "🗳️ Oy verildi (choice " + choiceId + ")", "modOnly", true);
            }

            /* ----------------------- /gider ------------------------ */
            if (t.startsWith("/gider")) {
                // /gider 450 "Pizza" weight=1
                var e = lastEventForGroup(m.groupId());
                BigDecimal amount = new BigDecimal(extract(t, "/gider\\s+(\\d+(?:\\.\\d+)?)", "0"));
                String notes = extractQuoted(t);
                BigDecimal weight = new BigDecimal(extract(t, "weight=(\\d+(?:\\.\\d+)?)", "1"));
                if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                    return Map.of("ok", false, "text", "Kullanım: /gider <tutar> \"Açıklama\" weight=<ağırlık>", "modOnly", true);
                }
                eventService.addExpense(e.getEventId(), new AddExpenseReq(m.userId(), amount, notes, weight));
                return Map.of("ok", true, "text", "💸 Gider eklendi: " + amount + " (" + notes + ")", "modOnly", true);
            }

            /* ------------------------ /mod ------------------------- */
            if (t.startsWith("/mod")) {
                // /mod slot=<id>  (sadece moderatör)
                var e = lastEventForGroup(m.groupId());
                if (!isModerator(m.userId()) && !Objects.equals(e.getCreatedBy(), m.userId())) {
                    return Map.of("ok", false, "text", "Bu komut sadece moderatör için.", "modOnly", true);
                }
                long slotId = Long.parseLong(extract(t, "slot=(\\d+)", "0"));
                if (slotId == 0) return Map.of("ok", false, "text", "Kullanım: /mod slot=<id>", "modOnly", true);
                e.setForcedSlotId(slotId);
                eventRepo.save(e);
                return Map.of("ok", true, "text", "🔒 Moderatör slot #" + slotId + " olarak kilitledi.", "modOnly", true);
            }

            /* ---------------------- /yayınla ----------------------- */
            if (t.startsWith("/yayınla")) {
                // anketi/paneli tüm katılımcılara aç
                var e = lastEventForGroup(m.groupId());
                if (!isModerator(m.userId()) && !Objects.equals(e.getCreatedBy(), m.userId())) {
                    return Map.of("ok", false, "text", "Bu komut sadece moderatör için.", "modOnly", true);
                }
                e.setPublished(true);
                eventRepo.save(e);
                return Map.of("ok", true, "text", "📢 Anket/panel yayınlandı. Katılımcılar oy verebilir.", "modOnly", false);
            }

            /* ------------------------ /ozet ------------------------ */
            if (t.startsWith("/ozet")) {
                var e = lastEventForGroup(m.groupId());
                var s = eventService.summary(e.getEventId());
                return Map.of("ok", true, "text", s.toPrettyText(), "modOnly", true);
            }

            /* --------------------- default/help -------------------- */
            return Map.of(
                    "ok", false,
                    "text", "Komut bulunamadı. /yeni, /slot, /katıl, /mekan, /oy, /gider, /mod, /yayınla, /ozet",
                    "modOnly", true
            );

        } catch (Exception ex) {
            return Map.of("ok", false, "text", "Hata: " + ex.getMessage(), "modOnly", true);
        }
    }

    /* ======================== Helpers ========================== */

    private Event lastEventForGroup(String groupId) {
        return eventRepo.findTopByGroupIdOrderByCreatedAtDesc(groupId)
                .orElseThrow(() -> new IllegalStateException("Bu grupta etkinlik yok."));
    }

    private String extract(String t, String regex, String def) {
        var m = Pattern.compile(regex).matcher(t);
        return m.find() ? m.group(1) : def;
    }

    private String extractQuoted(String t) {
        var m = Pattern.compile("\"([^\"]+)\"").matcher(t);
        return m.find() ? m.group(1) : "";
    }

    private boolean isModerator(String userId) {
        return userRepo.findById(userId)
                .map(u -> u.getRole() == Role.MODERATOR)
                .orElse(false);
    }
}
