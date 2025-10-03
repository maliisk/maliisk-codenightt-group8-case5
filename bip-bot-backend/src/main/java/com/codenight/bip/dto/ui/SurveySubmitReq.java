package com.codenight.bip.dto.ui;

import java.math.BigDecimal;

public record SurveySubmitReq(
        Long eventId,
        String userId,
        Long slotId,
        Long choiceId,
        Boolean participate,
        BigDecimal amount
) {}
