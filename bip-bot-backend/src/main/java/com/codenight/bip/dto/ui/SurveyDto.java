package com.codenight.bip.dto.ui;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record SurveyDto(
        Long eventId,
        String title,
        boolean published,
        List<SlotItem> slots,
        List<ChoiceItem> places,
        MyAnswers my,
        boolean submitted
) {
    public static SurveyDto none() {
        return new SurveyDto(null, null, false, List.of(), List.of(), null, false);
    }
    public record SlotItem(Long slotId, Instant start, Instant end, long yes) {}
    public record ChoiceItem(Long choiceId, String text, long votes) {}
    public record MyAnswers(Long slotId, Long choiceId, Boolean participate, BigDecimal amount) {}
}
